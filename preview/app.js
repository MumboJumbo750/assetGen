import {
  createAstroDuckComposite,
  createCompositeLayers,
  createPlanetComposite,
  createSatelliteComposite,
  createStargateComposite,
  createBackgroundComposite,
  createBadgeComposite,
  createUiComposite,
  createPianoComposite,
  createVideoSprite,
  getPlanetLayerPaths,
  getSatelliteLayerPaths,
  getStargateLayerPaths,
  getBackgroundLayerPaths,
  getBadgeLayerPaths,
  zelosPalette,
} from "../assets/zelos/pixi/zelos-pixi-kit.js";

const PIXI = window.PIXI;

const stageWrap = document.getElementById("stageWrap");
const stageHint = document.getElementById("stageHint");
const assetList = document.getElementById("assetList");
const gameList = document.getElementById("gameList");
const stageMeta = document.getElementById("stageMeta");
const projectSelect = document.getElementById("projectSelect");
const variantSelect = document.getElementById("variantSelect");
const controls = document.getElementById("controls");

const manifestUrl = "./data/manifest.json";
const cards = new Map();
let app = null;
let items = [];
let projects = [];
let variants = [];
let activeVariantId = "";
const textureCache = new Map();
const compositeStates = new Map();
let cinematicLayer = null;
let cinematicState = null;
let cinematicStatusSetter = null;
let previewBus = null;
let busUnsubscribers = [];
let audioContext = null;
let audioGain = null;
let audioEnabled = true;

const variantStorageKey = "assetgen.preview.variant";

const pianoNotes = {
  white: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83],
  black: [61, 63, 66, 68, 70, 73, 75, 78, 80, 82],
};

function setHint(message) {
  stageHint.textContent = message;
  stageHint.style.display = message ? "grid" : "none";
}

function createCard(asset) {
  const li = document.createElement("li");
  li.className = "asset-card pending";

  const title = document.createElement("strong");
  title.textContent = asset.label || asset.id || asset.path || "asset";

  const path = document.createElement("div");
  path.className = "path";
  path.textContent = asset.path || "(no path)";

  const status = document.createElement("div");
  status.className = "status";
  status.innerHTML = '<span class="status-dot"></span><span>pending</span>';

  const meta = document.createElement("div");
  meta.className = "path";
  meta.textContent = asset.type ? `type: ${asset.type}` : "";

  li.appendChild(title);
  li.appendChild(path);
  li.appendChild(status);
  if (meta.textContent) {
    li.appendChild(meta);
  }

  assetList.appendChild(li);
  cards.set(asset, { li, status });
}

function updateCard(asset, state, message) {
  const card = cards.get(asset);
  if (!card) return;
  const { li, status } = card;
  li.classList.remove("pending", "ok", "error");
  li.classList.add(state);
  status.innerHTML = `<span class="status-dot"></span><span>${state}${message ? ": " + message : ""}</span>`;
}

function parseHexColor(value) {
  if (!value) return 0x0c1320;
  const hex = value.replace("#", "");
  const num = parseInt(hex, 16);
  return Number.isNaN(num) ? 0x0c1320 : num;
}

async function loadTexture(path) {
  if (!path) return null;
  if (textureCache.has(path)) {
    return textureCache.get(path);
  }
  try {
    const texture = await PIXI.Assets.load(path);
    textureCache.set(path, texture);
    return texture;
  } catch (err) {
    console.warn("Texture load failed:", path, err?.message || err);
    return null;
  }
}

function joinPath(root, path) {
  if (!root) return path;
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
  const cleanRoot = root.endsWith("/") ? root.slice(0, -1) : root;
  const cleanPath = path.startsWith("./") ? path.slice(2) : path;
  return `${cleanRoot}/${cleanPath}`;
}

function normalizeRelPath(path) {
  if (!path) return "";
  if (path.startsWith("./")) return path.slice(2);
  return path;
}

function isGeneratedAssetPath(relPath) {
  const path = normalizeRelPath(relPath);
  return /^(sprites|backgrounds|ui|effects|icons)\//.test(path);
}

function getStaticRoot(project) {
  return project?.root || ".";
}

function getActiveVariantRoot() {
  const variant = variants.find((item) => (item.id || "") === (activeVariantId || ""));
  return variant?.root || "";
}

function getAssetRoot(project, relPath) {
  const staticRoot = getStaticRoot(project);
  const variantRoot = getActiveVariantRoot();
  if (variantRoot && isGeneratedAssetPath(relPath)) {
    return variantRoot;
  }
  return staticRoot;
}

function createBus() {
  const handlers = new Map();
  return {
    emit(eventName, payload) {
      const listeners = handlers.get(eventName);
      if (!listeners) return;
      [...listeners].forEach((handler) => handler(payload));
    },
    on(eventName, handler) {
      if (!handlers.has(eventName)) {
        handlers.set(eventName, new Set());
      }
      handlers.get(eventName).add(handler);
      return () => handlers.get(eventName)?.delete(handler);
    },
  };
}

function ensureAudioContext() {
  if (!audioEnabled) return null;
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
    audioGain = audioContext.createGain();
    audioGain.gain.value = 0.18;
    audioGain.connect(audioContext.destination);
  }
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playPianoTone(midi, duration = 0.22) {
  const ctx = ensureAudioContext();
  if (!ctx || !audioGain) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = midiToFrequency(midi);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(audioGain);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function ensureCinematicLayer() {
  if (!app) return null;
  if (!cinematicLayer) {
    cinematicLayer = new PIXI.Container();
    cinematicLayer.zIndex = 1000;
    cinematicLayer.visible = false;
    app.stage.addChild(cinematicLayer);
  }
  return cinematicLayer;
}

function layoutCinematic() {
  if (!cinematicState || !cinematicState.sprite || !app) return;
  const width = app.renderer.width;
  const height = app.renderer.height;
  const baseWidth = cinematicState.baseWidth || 1920;
  const baseHeight = cinematicState.baseHeight || 1080;
  const scale = Math.min(width / baseWidth, height / baseHeight);
  const targetWidth = baseWidth * scale;
  const targetHeight = baseHeight * scale;

  if (cinematicState.overlay) {
    cinematicState.overlay.clear();
    cinematicState.overlay.beginFill(0x0a0a0f, 0.65);
    cinematicState.overlay.drawRect(0, 0, width, height);
    cinematicState.overlay.endFill();
  }

  cinematicState.sprite.width = targetWidth;
  cinematicState.sprite.height = targetHeight;
  cinematicState.sprite.position.set(width / 2, height / 2);
}

function destroyCinematic() {
  if (cinematicState && cinematicState.video) {
    try {
      cinematicState.video.pause();
      cinematicState.video.removeAttribute("src");
      cinematicState.video.load();
    } catch (err) {
      // ignore video cleanup errors
    }
  }
  if (cinematicLayer) {
    cinematicLayer.removeChildren();
    cinematicLayer.visible = false;
    if (app) {
      app.stage.removeChild(cinematicLayer);
    }
    cinematicLayer = null;
  }
  cinematicState = null;
  if (cinematicStatusSetter) {
    cinematicStatusSetter("idle");
  }
}

function playCinematic({ clip, root, onStatus }) {
  if (!clip || !root) return;
  const layer = ensureCinematicLayer();
  if (!layer) return;

  destroyCinematic();

  const source = joinPath(root, clip.path);
  const poster = clip.poster ? joinPath(root, clip.poster) : null;
  const baseWidth = clip.width || 1920;
  const baseHeight = clip.height || 1080;
  const loop = clip.loop === true;

  const overlay = new PIXI.Graphics();
  const { sprite, video } = createVideoSprite({
    pixi: PIXI,
    src: source,
    loop,
    muted: true,
    autoplay: true,
  });

  if (poster) {
    video.poster = poster;
  }

  cinematicState = {
    clip,
    sprite,
    video,
    overlay,
    baseWidth,
    baseHeight,
  };

  video.addEventListener("loadedmetadata", () => {
    if (video.videoWidth && video.videoHeight) {
      cinematicState.baseWidth = video.videoWidth;
      cinematicState.baseHeight = video.videoHeight;
    }
    layoutCinematic();
  });

  video.addEventListener("canplay", () => {
    if (onStatus) onStatus("playing");
  });

  video.addEventListener("error", () => {
    if (onStatus) onStatus("error");
  });

  video.addEventListener("ended", () => {
    if (onStatus) onStatus("ended");
    if (!loop && cinematicLayer) {
      cinematicLayer.visible = false;
    }
  });

  layer.addChild(overlay);
  layer.addChild(sprite);
  layer.visible = true;
  layoutCinematic();

  if (onStatus) onStatus("loading");
}

function resolveCompositePaths(asset, root) {
  const resolved = JSON.parse(JSON.stringify(asset));
  if (!root) return resolved;

  const apply = (value) => joinPath(root, value);

  if (resolved.base && resolved.base.paths) {
    Object.keys(resolved.base.paths).forEach((key) => {
      resolved.base.paths[key] = apply(resolved.base.paths[key]);
    });
  }

  if (Array.isArray(resolved.outfits)) {
    resolved.outfits.forEach((outfit) => {
      if (outfit.paths) {
        Object.keys(outfit.paths).forEach((key) => {
          outfit.paths[key] = apply(outfit.paths[key]);
        });
      }
      if (outfit.path) {
        outfit.path = apply(outfit.path);
      }
    });
  }

  if (Array.isArray(resolved.expressions)) {
    resolved.expressions.forEach((expression) => {
      if (expression.paths) {
        Object.keys(expression.paths).forEach((key) => {
          expression.paths[key] = apply(expression.paths[key]);
        });
      }
      if (expression.path) {
        expression.path = apply(expression.path);
      }
    });
  }

  if (Array.isArray(resolved.layers)) {
    resolved.layers.forEach((layer) => {
      if (layer.paths) {
        Object.keys(layer.paths).forEach((key) => {
          layer.paths[key] = apply(layer.paths[key]);
        });
      }
      if (layer.path) {
        layer.path = apply(layer.path);
      }
      if (Array.isArray(layer.options)) {
        layer.options.forEach((option) => {
          if (option.paths) {
            Object.keys(option.paths).forEach((key) => {
              option.paths[key] = apply(option.paths[key]);
            });
          }
          if (option.path) {
            option.path = apply(option.path);
          }
        });
      }
    });
  }

  return resolved;
}

function normalizeProjects(manifest) {
  if (Array.isArray(manifest.projects) && manifest.projects.length > 0) {
    return manifest.projects;
  }

  if (Array.isArray(manifest.assets)) {
    return [
      {
        id: manifest.id || "default",
        label: manifest.title || "Default",
        assets: manifest.assets,
      },
    ];
  }

  return [];
}

async function loadManifest() {
  const response = await fetch(manifestUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`manifest not found (${response.status})`);
  }
  return response.json();
}

async function loadAsset(asset) {
  if (PIXI.Assets && PIXI.Assets.load) {
    return PIXI.Assets.load(asset.path);
  }

  return new Promise((resolve, reject) => {
    const loader = new PIXI.Loader();
    const key = asset.id || asset.path;
    loader.add(key, asset.path);
    loader.onError.add((err) => reject(err));
    loader.load((_, resources) => {
      const resource = resources[key];
      if (resource && resource.spritesheet) {
        resolve(resource.spritesheet);
        return;
      }
      if (resource && resource.texture) {
        resolve(resource.texture);
        return;
      }
      reject(new Error("No texture or spritesheet found"));
    });
  });
}

function buildDisplay(loaded, asset) {
  if (asset.type === "spritesheet") {
    const sheet = loaded;
    const animationName = asset.animation || asset.frameTag || Object.keys(sheet.animations || {})[0];
    const frames = animationName
      ? sheet.animations[animationName]
      : Object.values(sheet.textures || {});

    if (!frames || frames.length === 0) {
      throw new Error("Spritesheet has no frames");
    }

    const animated = new PIXI.AnimatedSprite(frames);
    animated.animationSpeed = (asset.fps || 12) / 60;
    animated.loop = asset.loop !== false;
    animated.play();
    animated.anchor.set(0.5, 0.5);
    return animated;
  }

  const sprite = new PIXI.Sprite(loaded);
  sprite.anchor.set(0.5, 0.5);
  return sprite;
}

function applySizing(display, asset) {
  const maxSize = asset.maxSize || 220;
  const maxDim = Math.max(display.width, display.height);
  if (maxDim === 0) return;
  const scale = Math.min(1, maxSize / maxDim);
  const userScale = asset.scale || 1;
  display.scale.set(scale * userScale);
}

function layoutItems() {
  if (!app || items.length === 0) return;

  const padding = 40;
  const tile = 240;
  const gap = 40;
  const stageWidth = stageWrap.clientWidth;
  const cols = Math.max(1, Math.floor((stageWidth - padding * 2 + gap) / (tile + gap)));

  items.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = padding + col * (tile + gap) + tile / 2;
    const y = padding + row * (tile + gap) + tile / 2;
    item.container.position.set(x, y);
  });
}

function clearStage() {
  items = [];
  assetList.innerHTML = "";
  gameList.innerHTML = "";
  controls.innerHTML = "";
  cards.clear();
  busUnsubscribers.forEach((off) => off());
  busUnsubscribers = [];
  destroyCinematic();
  if (app) {
    app.stage.removeChildren();
  }
}

function renderPaletteCard() {
  if (!zelosPalette) return;
  const card = document.createElement("div");
  card.className = "control-card";

  const title = document.createElement("h3");
  title.textContent = "Palette";
  card.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "palette-grid";

  Object.entries(zelosPalette).forEach(([name, value]) => {
    const swatch = document.createElement("div");
    swatch.className = "palette-swatch";

    const chip = document.createElement("div");
    chip.className = "palette-chip";
    chip.style.background = value;

    const label = document.createElement("div");
    label.textContent = `${name}: ${value}`;

    swatch.appendChild(chip);
    swatch.appendChild(label);
    grid.appendChild(swatch);
  });

  card.appendChild(grid);
  controls.appendChild(card);
}

function renderCinematicControls(project) {
  if (!project || !Array.isArray(project.cinematics) || project.cinematics.length === 0) {
    cinematicStatusSetter = null;
    return;
  }

  const card = document.createElement("div");
  card.className = "control-card";

  const title = document.createElement("h3");
  title.textContent = "Cinematics";
  card.appendChild(title);

  const selectRow = document.createElement("div");
  selectRow.className = "control-row";
  const label = document.createElement("label");
  label.textContent = "Clip";
  const select = document.createElement("select");
  project.cinematics.forEach((clip) => {
    const option = document.createElement("option");
    option.value = clip.id || clip.path;
    option.textContent = clip.label || clip.id || clip.path;
    select.appendChild(option);
  });
  selectRow.appendChild(label);
  selectRow.appendChild(select);
  card.appendChild(selectRow);

  const status = document.createElement("div");
  status.className = "path";
  status.textContent = "idle";
  card.appendChild(status);

  const actions = document.createElement("div");
  actions.className = "preset-row";

  const playButton = document.createElement("button");
  playButton.type = "button";
  playButton.className = "preset-button";
  playButton.textContent = "Play";

  const pauseButton = document.createElement("button");
  pauseButton.type = "button";
  pauseButton.className = "preset-button";
  pauseButton.textContent = "Pause";

  const stopButton = document.createElement("button");
  stopButton.type = "button";
  stopButton.className = "preset-button";
  stopButton.textContent = "Stop";

  const muteButton = document.createElement("button");
  muteButton.type = "button";
  muteButton.className = "preset-button";
  muteButton.textContent = "Mute";

  actions.appendChild(playButton);
  actions.appendChild(pauseButton);
  actions.appendChild(stopButton);
  actions.appendChild(muteButton);
  card.appendChild(actions);

  function setStatus(value) {
    status.textContent = value;
  }

  cinematicStatusSetter = setStatus;

  function getSelectedClip() {
    const clipId = select.value;
    return project.cinematics.find((clip) => (clip.id || clip.path) === clipId);
  }

  function playById(id) {
    const clip = project.cinematics.find((item) => item.id === id || item.path === id);
    if (!clip) {
      setStatus("not found");
      return;
    }
    playCinematic({
      clip,
      root: getStaticRoot(project),
      onStatus: setStatus,
    });
    muteButton.textContent = "Unmute";
  }

  playButton.addEventListener("click", () => {
    const clip = getSelectedClip();
    if (!clip) return;
    playById(clip.id || clip.path);
  });

  pauseButton.addEventListener("click", () => {
    if (cinematicState?.video) {
      cinematicState.video.pause();
      setStatus("paused");
    }
  });

  stopButton.addEventListener("click", () => {
    if (cinematicState?.video) {
      cinematicState.video.pause();
      cinematicState.video.currentTime = 0;
    }
    if (cinematicLayer) {
      cinematicLayer.visible = false;
    }
    setStatus("stopped");
  });

  muteButton.addEventListener("click", () => {
    if (!cinematicState?.video) return;
    cinematicState.video.muted = !cinematicState.video.muted;
    muteButton.textContent = cinematicState.video.muted ? "Unmute" : "Mute";
  });

  controls.appendChild(card);

  if (!previewBus) {
    previewBus = window.ZelosGameBus || createBus();
    window.ZelosGameBus = previewBus;
  }

  busUnsubscribers.forEach((off) => off());
  busUnsubscribers = [];

  busUnsubscribers.push(
    previewBus.on("cinematic:play", (payload) => {
      if (!payload) return;
      playById(payload.id || payload.path);
    })
  );

  busUnsubscribers.push(
    previewBus.on("cinematic:stop", () => {
      destroyCinematic();
    })
  );
}

async function renderProject(project) {
  clearStage();
  if (!project || !Array.isArray(project.assets) || project.assets.length === 0) {
    setHint("No assets listed for this project.");
    return;
  }

  setHint("");
  renderPaletteCard();
  renderCinematicControls(project);

  if (Array.isArray(project.games) && project.games.length > 0) {
    project.games.forEach((game) => {
      const li = document.createElement("li");
      li.className = "asset-card";
      const link = document.createElement("a");
      link.className = "asset-link";
      link.href = game.path;
      link.textContent = game.label || game.id || "game";
      link.target = "_blank";
      li.appendChild(link);
      if (game.description) {
        const desc = document.createElement("div");
        desc.className = "path";
        desc.textContent = game.description;
        li.appendChild(desc);
      }
      gameList.appendChild(li);
    });
  }

  for (const rawAsset of project.assets) {
    const useKit =
      rawAsset.useKit !== false &&
      (rawAsset.type === "composite" || rawAsset.type === "compositeLayers");

    const resolvedRoot = getAssetRoot(project, rawAsset.path || "sprites/");
    const asset = useKit
      ? { ...rawAsset, _root: resolvedRoot }
      : rawAsset.type === "composite" || rawAsset.type === "compositeLayers"
      ? resolveCompositePaths(rawAsset, resolvedRoot)
      : {
          ...rawAsset,
          path: joinPath(getAssetRoot(project, rawAsset.path), rawAsset.path),
        };

    createCard(asset);
    updateCard(asset, "pending", "loading");

    try {
      let display;
      if (asset.type === "piano") {
        display = await renderPiano(asset);
      } else if (asset.type === "composite") {
        display = await renderComposite(asset);
      } else if (asset.type === "compositeLayers") {
        display = await renderCompositeLayers(asset);
      } else {
        const loaded = await loadAsset(asset);
        display = buildDisplay(loaded, asset);
        applySizing(display, asset);
      }

      const label = new PIXI.Text(asset.label || asset.id || "asset", {
        fontFamily: "Space Grotesk",
        fontSize: 12,
        fill: parseHexColor("#91a3b6"),
      });
      label.anchor.set(0.5, 0);
      label.y = display.height / 2 + 10;

      const container = new PIXI.Container();
      container.addChild(display);
      container.addChild(label);
      app.stage.addChild(container);

      items.push({ asset, container });
      updateCard(asset, "ok", "ready");
      layoutItems();
    } catch (err) {
      updateCard(asset, "error", "load failed");
    }
  }
}

function getPathForView(entry, view) {
  if (!entry) return null;
  if (entry.paths && entry.paths[view]) return entry.paths[view];
  if (entry.path) return entry.path;
  return null;
}

function getOptionPath(option, view) {
  if (!option) return null;
  if (option.paths && view) {
    return option.paths[view] || option.path || null;
  }
  return option.path || null;
}

function filenameFromPath(path) {
  if (!path) return null;
  const parts = path.split("/");
  return parts[parts.length - 1] || null;
}

function stripPrefixSuffix(value, prefix, suffix) {
  if (!value) return null;
  if (value.startsWith(prefix) && value.endsWith(suffix)) {
    return value.slice(prefix.length, value.length - suffix.length);
  }
  return value;
}

function createCenteredSprite(texture) {
  const sprite = new PIXI.Sprite(texture || PIXI.Texture.EMPTY);
  sprite.anchor.set(0.5, 0.5);
  if (!texture) {
    sprite.visible = false;
  }
  return sprite;
}

function normalizeLayerOptions(layer) {
  let options = Array.isArray(layer.options) ? [...layer.options] : [];

  if (layer.path) {
    options = [{ id: layer.id || "layer", label: layer.label, path: layer.path }];
  }

  if (layer.kind === "toggle") {
    if (!options.some((option) => option.id === "none")) {
      const first = options[0];
      if (first) {
        options = [
          { id: "on", label: first.label || "On", path: first.path, paths: first.paths },
          { id: "none", label: "None", path: null },
        ];
      } else {
        options = [{ id: "none", label: "None", path: null }];
      }
    }
  }

  if (layer.optional && !options.some((option) => option.id === "none")) {
    options.push({ id: "none", label: "None", path: null });
  }

  return options;
}

function getAstroDuckPresets() {
  return [
    {
      id: "default-happy",
      label: "Default + Happy",
      view: "front",
      outfitId: "outfit-default-suit",
      expressionId: "happy",
    },
    {
      id: "pirate-excited",
      label: "Pirate + Excited",
      view: "front",
      outfitId: "outfit-pirate",
      expressionId: "excited",
    },
    {
      id: "wizard-curious",
      label: "Wizard + Curious",
      view: "threeQuarter",
      outfitId: "outfit-wizard",
      expressionId: "curious",
    },
    {
      id: "no-expression",
      label: "No Expression",
      view: "front",
      outfitId: "outfit-default-suit",
      expressionId: "none",
    },
    {
      id: "pose-celebrating",
      label: "Pose: Celebrating",
      view: "front",
      outfitId: "outfit-default-suit",
      expressionId: "none",
      poseId: "celebrating",
    },
  ];
}

function getLayerPresets(asset) {
  if (!asset.kit) return [];

  if (asset.kit === "planet") {
    return [
      {
        id: "solid-selected",
        label: "Solid + Selected",
        selections: {
          texture: "solid",
          rings: "cyan",
          atmosphere: "normal",
          state: "selected",
        },
      },
      {
        id: "tech-warning",
        label: "Tech + Warning",
        selections: {
          texture: "tech",
          rings: "none",
          atmosphere: "stormy",
          state: "warning",
        },
      },
      {
        id: "marble-clean",
        label: "Marble + Clean",
        selections: {
          texture: "marble",
          rings: "none",
          atmosphere: "none",
          state: "none",
        },
      },
    ];
  }

  if (asset.kit === "satellite") {
    return [
      {
        id: "config-default",
        label: "Config + Default",
        selections: {
          icon: "config",
          state: "none",
          glow: "none",
          badge: "none",
        },
      },
      {
        id: "users-error",
        label: "Users + Error",
        selections: {
          icon: "users",
          state: "error",
          glow: "error",
          badge: "error",
        },
      },
      {
        id: "stats-unsaved",
        label: "Stats + Unsaved",
        selections: {
          icon: "statistics",
          state: "unsaved",
          glow: "hover",
          badge: "none",
        },
      },
    ];
  }

  if (asset.kit === "stargate") {
    return [
      {
        id: "ring-energy",
        label: "Ring + Energy",
        selections: {
          ring: "default",
          glyphs: "none",
          energy: "default",
          warp: "none",
        },
      },
      {
        id: "full-charge",
        label: "Full Charge",
        selections: {
          ring: "default",
          glyphs: "on",
          energy: "default",
          warp: "on",
        },
      },
    ];
  }

  if (asset.kit === "background") {
    return [
      {
        id: "clean",
        label: "Clean",
        selections: {
          starfield: "default",
          nebula: "none",
          constellation: "none",
          vignette: "none",
        },
      },
      {
        id: "nebula-constellation",
        label: "Nebula + Constellation",
        selections: {
          starfield: "default",
          nebula: "on",
          constellation: "on",
          vignette: "on",
        },
      },
    ];
  }

  if (asset.kit === "badge") {
    return [
      {
        id: "common-flight",
        label: "Common + Flight",
        selections: {
          frame: "common",
          icon: "first-flight",
        },
      },
      {
        id: "rare-speed",
        label: "Rare + Speed",
        selections: {
          frame: "rare",
          icon: "speed-demon",
        },
      },
    ];
  }

  return [];
}

function getSelectedOption(asset, state, layerId) {
  const layer = (asset.layers || []).find((item) => item.id === layerId);
  if (!layer) return null;
  const options = normalizeLayerOptions(layer);
  return options.find((option) => option.id === state.selections[layerId]) || options[0] || null;
}

function buildKitLayerUpdates(asset, state) {
  const view = state.view;
  if (asset.kit === "planet") {
    const texture = state.selections.texture || null;
    let rings = state.selections.rings;
    if (rings === "none") {
      rings = null;
    } else if (rings === "on") {
      const option = getSelectedOption(asset, state, "rings");
      const filename = filenameFromPath(getOptionPath(option, view));
      rings = stripPrefixSuffix(filename, "ring-", ".png");
    }
    const atmosphere =
      state.selections.atmosphere === "none" ? null : state.selections.atmosphere || null;
    const planetState = state.selections.state === "none" ? null : state.selections.state || null;
    const paths = getPlanetLayerPaths({
      texture,
      rings,
      atmosphere,
      state: planetState,
    });
    return [
      { id: "texture", option: { path: paths.texturePath } },
      { id: "rings", option: { path: paths.ringsPath } },
      { id: "atmosphere", option: { path: paths.atmospherePath } },
      { id: "state", option: { path: paths.statePath } },
    ];
  }

  if (asset.kit === "satellite") {
    const icon = state.selections.icon || null;
    const satState = state.selections.state === "none" ? null : state.selections.state || null;
    const glow = state.selections.glow === "none" ? null : state.selections.glow || null;
    const badge = state.selections.badge === "none" ? null : state.selections.badge || null;
    const paths = getSatelliteLayerPaths({ icon, state: satState, glow, badge });
    return [
      { id: "icon", option: { path: paths.iconPath } },
      { id: "state", option: { path: paths.statePath } },
      { id: "glow", option: { path: paths.glowPath } },
      { id: "badge", option: { path: paths.badgePath } },
    ];
  }

  if (asset.kit === "stargate") {
    const ring = state.selections.ring === "default" ? null : state.selections.ring || null;
    let glyphs = state.selections.glyphs;
    if (glyphs === "none") {
      glyphs = null;
    } else if (glyphs === "on") {
      const option = getSelectedOption(asset, state, "glyphs");
      glyphs = filenameFromPath(getOptionPath(option, view));
    }
    const energy =
      state.selections.energy === "default" ? null : state.selections.energy || null;
    let warp = state.selections.warp;
    if (warp === "default") {
      warp = null;
    } else if (warp === "on") {
      const option = getSelectedOption(asset, state, "warp");
      warp = filenameFromPath(getOptionPath(option, view));
    }
    let particles = state.selections.particles;
    if (particles === "none") {
      particles = null;
    } else if (particles === "on") {
      const option = getSelectedOption(asset, state, "particles");
      particles = filenameFromPath(getOptionPath(option, view));
    }
    const paths = getStargateLayerPaths({ ring, glyphs, energy, warp, particles });
    return [
      { id: "ring", option: { path: paths.ringPath } },
      { id: "glyphs", option: { path: paths.glyphsPath } },
      { id: "energy", option: { path: paths.energyPath } },
      { id: "warp", option: { path: paths.warpPath } },
      { id: "particles", option: { path: paths.particlesPath } },
    ];
  }

  if (asset.kit === "background") {
    const starfield =
      state.selections.starfield === "default" ? null : state.selections.starfield || null;
    let nebula = state.selections.nebula;
    if (nebula === "none") {
      nebula = null;
    } else if (nebula === "on") {
      const option = getSelectedOption(asset, state, "nebula");
      nebula = filenameFromPath(getOptionPath(option, view));
    }
    let constellation =
      state.selections.constellation === "none"
        ? null
        : state.selections.constellation || null;
    if (constellation === "on") {
      const option = getSelectedOption(asset, state, "constellation");
      constellation = filenameFromPath(getOptionPath(option, view));
    }
    let vignette = state.selections.vignette;
    if (vignette === "none") {
      vignette = null;
    } else if (vignette === "on") {
      const option = getSelectedOption(asset, state, "vignette");
      vignette = filenameFromPath(getOptionPath(option, view));
    }
    const paths = getBackgroundLayerPaths({ starfield, nebula, constellation, vignette });
    return [
      { id: "starfield", option: { path: paths.starfieldPath } },
      { id: "nebula", option: { path: paths.nebulaPath } },
      { id: "constellation", option: { path: paths.constellationPath } },
      { id: "vignette", option: { path: paths.vignettePath } },
    ];
  }

  if (asset.kit === "badge") {
    const rarity = state.selections.frame || null;
    const icon = state.selections.icon || null;
    const paths = getBadgeLayerPaths({ rarity, icon });
    return [
      { id: "frame", option: { path: paths.framePath } },
      { id: "icon", option: { path: paths.iconPath } },
    ];
  }

  if (asset.kit === "ui") {
    const modal = getSelectedOption(asset, state, "modal");
    const button = getSelectedOption(asset, state, "button");
    const input = getSelectedOption(asset, state, "input");
    const toast = getSelectedOption(asset, state, "toast");
    return [
      { id: "modal", option: { path: getOptionPath(modal, view) } },
      { id: "button", option: { path: getOptionPath(button, view) } },
      { id: "input", option: { path: getOptionPath(input, view) } },
      { id: "toast", option: { path: getOptionPath(toast, view) } },
    ];
  }

  return [];
}

function createCompositeControls(asset, state, onChange) {
  const card = document.createElement("div");
  card.className = "control-card";

  const title = document.createElement("h3");
  title.textContent = asset.label || asset.id || "Composite";
  card.appendChild(title);

  const viewRow = document.createElement("div");
  viewRow.className = "control-row";
  const viewLabel = document.createElement("label");
  viewLabel.textContent = "View";
  const viewSelect = document.createElement("select");
  const views = asset.views || ["front", "side", "threeQuarter"];
  views.forEach((view) => {
    const option = document.createElement("option");
    option.value = view;
    option.textContent = view;
    viewSelect.appendChild(option);
  });
  viewSelect.value = state.view;
  viewRow.appendChild(viewLabel);
  viewRow.appendChild(viewSelect);
  card.appendChild(viewRow);

  const outfitRow = document.createElement("div");
  outfitRow.className = "control-row";
  const outfitLabel = document.createElement("label");
  outfitLabel.textContent = "Outfit";
  const outfitSelect = document.createElement("select");
  (asset.outfits || []).forEach((outfit) => {
    const option = document.createElement("option");
    option.value = outfit.id;
    option.textContent = outfit.label || outfit.id;
    outfitSelect.appendChild(option);
  });
  outfitSelect.value = state.outfitId || outfitSelect.options[0]?.value || "";
  outfitRow.appendChild(outfitLabel);
  outfitRow.appendChild(outfitSelect);
  card.appendChild(outfitRow);

  const expressionRow = document.createElement("div");
  expressionRow.className = "control-row";
  const expressionLabel = document.createElement("label");
  expressionLabel.textContent = "Expression";
  const expressionSelect = document.createElement("select");
  (asset.expressions || []).forEach((expression) => {
    const option = document.createElement("option");
    option.value = expression.id;
    option.textContent = expression.label || expression.id;
    expressionSelect.appendChild(option);
  });
  expressionSelect.value =
    state.expressionId || expressionSelect.options[0]?.value || "";
  expressionRow.appendChild(expressionLabel);
  expressionRow.appendChild(expressionSelect);
  card.appendChild(expressionRow);

  let poseSelect = null;
  if (asset.kit === "astroDuck" && Array.isArray(asset.poses) && asset.poses.length > 0) {
    const poseRow = document.createElement("div");
    poseRow.className = "control-row";
    const poseLabel = document.createElement("label");
    poseLabel.textContent = "Pose";
    poseSelect = document.createElement("select");
    asset.poses.forEach((pose) => {
      const option = document.createElement("option");
      option.value = pose.id || pose;
      option.textContent = pose.label || pose.id || pose;
      poseSelect.appendChild(option);
    });
    poseSelect.value = state.poseId || poseSelect.options[0]?.value || "none";
    poseRow.appendChild(poseLabel);
    poseRow.appendChild(poseSelect);
    card.appendChild(poseRow);
    poseSelect.addEventListener("change", (event) => {
      state.poseId = event.target.value;
      onChange();
    });
  }

  function syncControls() {
    viewSelect.value = state.view;
    outfitSelect.value = state.outfitId || outfitSelect.options[0]?.value || "";
    expressionSelect.value =
      state.expressionId || expressionSelect.options[0]?.value || "";
    if (poseSelect) {
      poseSelect.value = state.poseId || poseSelect.options[0]?.value || "none";
    }
  }

  viewSelect.addEventListener("change", (event) => {
    state.view = event.target.value;
    onChange();
  });

  outfitSelect.addEventListener("change", (event) => {
    state.outfitId = event.target.value;
    onChange();
  });

  expressionSelect.addEventListener("change", (event) => {
    state.expressionId = event.target.value;
    onChange();
  });

  if (asset.kit === "astroDuck") {
    const presets = getAstroDuckPresets();
    if (presets.length > 0) {
      const presetRow = document.createElement("div");
      presetRow.className = "preset-row";
      presets.forEach((preset) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "preset-button";
        button.textContent = preset.label;
        button.addEventListener("click", () => {
          state.view = preset.view || state.view;
          state.outfitId = preset.outfitId || state.outfitId;
          state.expressionId = preset.expressionId || state.expressionId;
          if (preset.poseId) {
            state.poseId = preset.poseId;
          }
          syncControls();
          onChange();
        });
        presetRow.appendChild(button);
      });
      card.appendChild(presetRow);
    }
  }

  controls.appendChild(card);
}

function createPianoControls(asset, handlers) {
  const card = document.createElement("div");
  card.className = "control-card";

  const title = document.createElement("h3");
  title.textContent = asset.label || asset.id || "Space Piano";
  card.appendChild(title);

  const row = document.createElement("div");
  row.className = "preset-row";

  const flashWhite = document.createElement("button");
  flashWhite.type = "button";
  flashWhite.className = "preset-button";
  flashWhite.textContent = "Flash Whites";
  flashWhite.addEventListener("click", () => handlers.flashWhite?.());

  const flashBlack = document.createElement("button");
  flashBlack.type = "button";
  flashBlack.className = "preset-button";
  flashBlack.textContent = "Flash Blacks";
  flashBlack.addEventListener("click", () => handlers.flashBlack?.());

  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "preset-button";
  clear.textContent = "Clear";
  clear.addEventListener("click", () => handlers.clear?.());

  const demoOn = document.createElement("button");
  demoOn.type = "button";
  demoOn.className = "preset-button";
  demoOn.textContent = "Demo On";
  demoOn.addEventListener("click", () => handlers.demoOn?.());

  const demoOff = document.createElement("button");
  demoOff.type = "button";
  demoOff.className = "preset-button";
  demoOff.textContent = "Demo Off";
  demoOff.addEventListener("click", () => handlers.demoOff?.());

  let soundButton = null;
  if (handlers.toggleSound) {
    soundButton = document.createElement("button");
    soundButton.type = "button";
    soundButton.className = "preset-button";
    soundButton.textContent = handlers.soundLabel ? handlers.soundLabel() : "Sound";
    soundButton.addEventListener("click", () => {
      const enabled = handlers.toggleSound();
      soundButton.textContent = enabled ? "Sound On" : "Sound Off";
    });
  }

  row.appendChild(flashWhite);
  row.appendChild(flashBlack);
  row.appendChild(clear);
  row.appendChild(demoOn);
  row.appendChild(demoOff);
  if (soundButton) row.appendChild(soundButton);
  card.appendChild(row);

  controls.appendChild(card);
}

async function updateCompositeSprites(asset, state, sprites) {
  const basePath = getPathForView(asset.base, state.view);
  const outfit = (asset.outfits || []).find((item) => item.id === state.outfitId);
  const outfitPath = getPathForView(outfit, state.view);
  const expression = (asset.expressions || []).find(
    (item) => item.id === state.expressionId
  );
  const expressionPath = getPathForView(expression, state.view);

  const [baseTexture, outfitTexture, expressionTexture] = await Promise.all([
    loadTexture(basePath),
    loadTexture(outfitPath),
    loadTexture(expressionPath),
  ]);

  if (baseTexture) {
    sprites.base.texture = baseTexture;
  }
  if (outfitTexture) {
    sprites.outfit.texture = outfitTexture;
    sprites.outfit.visible = true;
  } else {
    sprites.outfit.visible = false;
  }
  if (expressionTexture) {
    sprites.expression.texture = expressionTexture;
    sprites.expression.visible = true;
  } else {
    sprites.expression.visible = false;
  }
}

async function renderAstroDuckWithKit(asset) {
  const availablePoses = (asset.poses && asset.poses.length > 0 ? asset.poses : [{ id: "none" }])
    .map((pose) => pose.id)
    .filter(Boolean);
  const defaultPose =
    asset.defaultPose && (availablePoses.includes(asset.defaultPose) || asset.defaultPose === "none")
      ? asset.defaultPose
      : availablePoses.includes("none")
      ? "none"
      : availablePoses[0] || "none";

  const state = {
    view: asset.defaultView || (asset.views && asset.views[0]) || "front",
    outfitId:
      asset.defaultOutfit || (asset.outfits && asset.outfits[0]?.id) || "",
    expressionId:
      asset.defaultExpression ||
      (asset.expressions && asset.expressions[0]?.id) ||
      "",
    poseId: defaultPose,
  };

  const composite = await createAstroDuckComposite({
    pixi: PIXI,
    root: asset._root || ".",
    view: state.view,
    outfit: state.outfitId,
    expression: state.expressionId,
    pose: state.poseId,
  });

  applySizing(composite.container, asset);

  createCompositeControls(asset, state, async () => {
    await composite.update({
      nextView: state.view,
      nextOutfit: state.outfitId,
      nextExpression: state.expressionId,
      nextPose: state.poseId,
    });
    applySizing(composite.container, asset);
  });

  return composite.container;
}

async function renderComposite(asset) {
  if (asset.kit === "astroDuck") {
    return renderAstroDuckWithKit(asset);
  }

  const state = {
    view: asset.defaultView || (asset.views && asset.views[0]) || "front",
    outfitId:
      asset.defaultOutfit || (asset.outfits && asset.outfits[0]?.id) || "",
    expressionId:
      asset.defaultExpression ||
      (asset.expressions && asset.expressions[0]?.id) ||
      "",
  };

  const basePath = getPathForView(asset.base, state.view);
  const outfit = (asset.outfits || []).find((item) => item.id === state.outfitId);
  const outfitPath = getPathForView(outfit, state.view);
  const expression = (asset.expressions || []).find(
    (item) => item.id === state.expressionId
  );
  const expressionPath = getPathForView(expression, state.view);

  const [baseTexture, outfitTexture, expressionTexture] = await Promise.all([
    loadTexture(basePath),
    loadTexture(outfitPath),
    loadTexture(expressionPath),
  ]);

  if (!baseTexture) {
    throw new Error("Composite base missing");
  }

  const container = new PIXI.Container();
  const baseSprite = createCenteredSprite(baseTexture);
  const outfitSprite = createCenteredSprite(outfitTexture);
  const expressionSprite = createCenteredSprite(expressionTexture);

  if (baseSprite) container.addChild(baseSprite);
  if (outfitSprite) container.addChild(outfitSprite);
  if (expressionSprite) container.addChild(expressionSprite);

  const sprites = {
    base: baseSprite,
    outfit: outfitSprite,
    expression: expressionSprite,
  };

  applySizing(container, asset);
  compositeStates.set(asset.id || asset.label || "composite", {
    asset,
    state,
    sprites,
  });

  createCompositeControls(asset, state, async () => {
    await updateCompositeSprites(asset, state, sprites);
  });

  return container;
}

function createLayerControls(asset, state, onChange) {
  const card = document.createElement("div");
  card.className = "control-card";
  const selectMap = new Map();

  const title = document.createElement("h3");
  title.textContent = asset.label || asset.id || "Composite";
  card.appendChild(title);

  if (Array.isArray(asset.views) && asset.views.length > 0) {
    const viewRow = document.createElement("div");
    viewRow.className = "control-row";
    const viewLabel = document.createElement("label");
    viewLabel.textContent = "View";
    const viewSelect = document.createElement("select");
    asset.views.forEach((view) => {
      const option = document.createElement("option");
      option.value = view;
      option.textContent = view;
      viewSelect.appendChild(option);
    });
    viewSelect.value = state.view;
    selectMap.set("view", viewSelect);
    viewRow.appendChild(viewLabel);
    viewRow.appendChild(viewSelect);
    card.appendChild(viewRow);

    viewSelect.addEventListener("change", (event) => {
      state.view = event.target.value;
      onChange();
    });
  }

  (asset.layers || []).forEach((layer) => {
    if (layer.ui === "hidden") return;
    const row = document.createElement("div");
    row.className = "control-row";
    const label = document.createElement("label");
    label.textContent = layer.label || layer.id || "Layer";
    const select = document.createElement("select");
    const options = normalizeLayerOptions(layer);

    options.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option.id;
      opt.textContent = option.label || option.id;
      select.appendChild(opt);
    });

    select.value = state.selections[layer.id] || options[0]?.id || "";
    selectMap.set(layer.id, select);
    row.appendChild(label);
    row.appendChild(select);
    card.appendChild(row);

    select.addEventListener("change", (event) => {
      state.selections[layer.id] = event.target.value;
      onChange();
    });
  });

  const presets = getLayerPresets(asset);
  if (presets.length > 0) {
    const presetRow = document.createElement("div");
    presetRow.className = "preset-row";
    presets.forEach((preset) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preset-button";
      button.textContent = preset.label;
      button.addEventListener("click", () => {
        if (preset.view) {
          state.view = preset.view;
          const viewSelect = selectMap.get("view");
          if (viewSelect) viewSelect.value = preset.view;
        }
        Object.entries(preset.selections || {}).forEach(([key, value]) => {
          state.selections[key] = value;
          const select = selectMap.get(key);
          if (select) select.value = value;
        });
        onChange();
      });
      presetRow.appendChild(button);
    });
    card.appendChild(presetRow);
  }

  controls.appendChild(card);
}

async function updateCompositeLayerSprites(asset, state, sprites) {
  const view = state.view;
  const loads = [];

  asset.layers.forEach((layer) => {
    const options = normalizeLayerOptions(layer);
    const selected = options.find((option) => option.id === state.selections[layer.id]);
    const path = getOptionPath(selected, view);
    loads.push(loadTexture(path));
  });

  const textures = await Promise.all(loads);
  asset.layers.forEach((layer, index) => {
    const sprite = sprites[layer.id];
    const texture = textures[index];
    if (texture) {
      sprite.texture = texture;
      sprite.visible = true;
    } else {
      sprite.visible = false;
    }
  });
}

async function renderCompositeLayers(asset) {
  const state = {
    view: asset.views ? asset.views[0] : null,
    selections: {},
  };

  (asset.layers || []).forEach((layer) => {
    const options = normalizeLayerOptions(layer);
    const defaultId = layer.default || options[0]?.id;
    state.selections[layer.id] = defaultId;
  });

  let composite;
  if (asset.kit === "planet") {
    composite = await createPlanetComposite({
      pixi: PIXI,
      root: asset._root || ".",
      texture: state.selections.texture,
      rings: state.selections.rings === "none" ? null : state.selections.rings,
      atmosphere:
        state.selections.atmosphere === "none" ? null : state.selections.atmosphere,
      state: state.selections.state === "none" ? null : state.selections.state,
    });
  } else if (asset.kit === "satellite") {
    composite = await createSatelliteComposite({
      pixi: PIXI,
      root: asset._root || ".",
      icon: state.selections.icon,
      state: state.selections.state === "none" ? null : state.selections.state,
    });
  } else if (asset.kit === "stargate") {
    composite = await createStargateComposite({
      pixi: PIXI,
      root: asset._root || ".",
      ring: state.selections.ring === "default" ? null : state.selections.ring,
      glyphs: state.selections.glyphs === "none" ? null : state.selections.glyphs,
      energy: state.selections.energy === "default" ? null : state.selections.energy,
      warp: state.selections.warp === "default" ? null : state.selections.warp,
      particles: state.selections.particles === "none" ? null : state.selections.particles,
    });
  } else if (asset.kit === "background") {
    composite = await createBackgroundComposite({
      pixi: PIXI,
      root: asset._root || ".",
      starfield: state.selections.starfield === "default" ? null : state.selections.starfield,
      nebula: state.selections.nebula === "none" ? null : state.selections.nebula,
      constellation:
        state.selections.constellation === "none" ? null : state.selections.constellation,
      vignette: state.selections.vignette === "none" ? null : state.selections.vignette,
    });
  } else if (asset.kit === "badge") {
    composite = await createBadgeComposite({
      pixi: PIXI,
      root: asset._root || ".",
      rarity: state.selections.frame,
      icon: state.selections.icon,
    });
  } else if (asset.kit === "ui") {
    const modal = getSelectedOption(asset, state, "modal");
    const button = getSelectedOption(asset, state, "button");
    const input = getSelectedOption(asset, state, "input");
    const toast = getSelectedOption(asset, state, "toast");
    composite = await createUiComposite({
      pixi: PIXI,
      root: asset._root || ".",
      modalPath: getOptionPath(modal, state.view),
      buttonPath: getOptionPath(button, state.view),
      inputPath: getOptionPath(input, state.view),
      toastPath: getOptionPath(toast, state.view),
    });
  } else {
    const resolvedLayers = asset.layers.map((layer) => {
      const options = normalizeLayerOptions(layer);
      const selected = options.find((option) => option.id === state.selections[layer.id]);
      const path = getOptionPath(selected, state.view);
      return {
        ...layer,
        path,
      };
    });

    composite = await createCompositeLayers({
      pixi: PIXI,
      root: asset._root || ".",
      layers: resolvedLayers,
      view: state.view,
    });
  }

  applySizing(composite.container, asset);

  createLayerControls(asset, state, async () => {
    const layerUpdates = asset.kit
      ? buildKitLayerUpdates(asset, state)
      : asset.layers.map((layer) => {
          const options = normalizeLayerOptions(layer);
          const selected = options.find((option) => option.id === state.selections[layer.id]);
          return {
            id: layer.id,
            option: selected,
          };
        });
    await composite.update({
      nextView: state.view,
      layerUpdates,
    });
    applySizing(composite.container, asset);
  });

  return composite.container;
}

async function renderPiano(asset) {
  if (!previewBus) {
    previewBus = window.ZelosGameBus || createBus();
    window.ZelosGameBus = previewBus;
  }

  const composite = await createPianoComposite({
    pixi: PIXI,
    root: asset._root || ".",
    panelPath: asset.panel || "ui/space-piano-panel.png",
    whiteGlowPath: asset.whiteGlow || "ui/space-piano-key-glow-white.png",
    blackGlowPath: asset.blackGlow || "ui/space-piano-key-glow-black.png",
    layout: asset.layout,
  });

  const container = composite.container;
  const keyTimers = new Map();
  const whiteBase = { width: 50, height: 150 };
  const blackBase = { width: 30, height: 100 };

  function pulseKey(type, index, duration = 180) {
    const key = `${type}-${index}`;
    if (keyTimers.has(key)) {
      clearTimeout(keyTimers.get(key));
    }
    composite.setKeyGlow({ type, index, visible: true, alpha: 1, scale: 1.05 });
    const timer = setTimeout(() => {
      composite.setKeyGlow({ type, index, visible: false });
      keyTimers.delete(key);
    }, duration);
    keyTimers.set(key, timer);
  }

  function emitKey(type, index) {
    previewBus?.emit?.("piano:key", { type, index });
  }

  function buildHitAreas(list, type, baseSize) {
    list.forEach((item, index) => {
      const width = baseSize.width * item.scale;
      const height = baseSize.height * item.scale;
      const hit = new PIXI.Graphics();
      hit.beginFill(0xffffff, 0.001);
      hit.drawRect(-width / 2, -height / 2, width, height);
      hit.endFill();
      hit.position.set(item.x, item.y);
      hit.eventMode = "static";
      hit.cursor = "pointer";
      hit.on("pointerdown", () => {
        pulseKey(type, index);
        emitKey(type, index);
      });
      container.addChild(hit);
    });
  }

  buildHitAreas(composite.layout.whiteKeys, "white", whiteBase);
  buildHitAreas(composite.layout.blackKeys, "black", blackBase);

  let demoTimer = null;

  function startDemo() {
    if (demoTimer) return;
    let idx = 0;
    demoTimer = setInterval(() => {
      const index = idx % composite.layout.whiteKeys.length;
      pulseKey("white", index, 160);
      emitKey("white", index);
      idx += 1;
    }, 160);
  }

  function stopDemo() {
    if (demoTimer) {
      clearInterval(demoTimer);
      demoTimer = null;
    }
  }

  createPianoControls(asset, {
    flashWhite: () => {
      composite.layout.whiteKeys.forEach((_, index) => pulseKey("white", index, 220));
    },
    flashBlack: () => {
      composite.layout.blackKeys.forEach((_, index) => pulseKey("black", index, 220));
    },
    clear: () => {
      composite.hideAllGlows();
    },
    demoOn: startDemo,
    demoOff: stopDemo,
    toggleSound: () => {
      audioEnabled = !audioEnabled;
      if (audioEnabled) {
        ensureAudioContext();
      }
      return audioEnabled;
    },
    soundLabel: () => (audioEnabled ? "Sound On" : "Sound Off"),
  });

  busUnsubscribers.push(
    previewBus.on("piano:key", ({ type, index }) => {
      const list = type === "black" ? pianoNotes.black : pianoNotes.white;
      const midi = list[index % list.length];
      if (Number.isFinite(midi)) {
        playPianoTone(midi, type === "black" ? 0.18 : 0.22);
      }
    })
  );

  applySizing(container, asset);
  return container;
}

async function start() {
  if (!window.PIXI) {
    setHint("Pixi failed to load. Check your network connection or CDN link.");
    return;
  }

  let manifest;
  try {
    manifest = await loadManifest();
  } catch (err) {
    setHint(`Manifest error: ${err.message}`);
    return;
  }

  stageMeta.textContent = `Manifest: ${manifestUrl}`;

  app = new PIXI.Application({
    antialias: true,
    resizeTo: stageWrap,
    backgroundAlpha: 0,
  });
  stageWrap.appendChild(app.view);
  app.stage.sortableChildren = true;

  projects = normalizeProjects(manifest);
  if (projects.length === 0) {
    setHint("No projects listed. Add entries to preview/data/manifest.json.");
    return;
  }

  projectSelect.innerHTML = "";
  projects.forEach((project, index) => {
    const option = document.createElement("option");
    option.value = project.id || `project-${index}`;
    project.id = option.value;
    option.textContent = project.label || project.id || `Project ${index + 1}`;
    projectSelect.appendChild(option);
  });

  const defaultId = manifest.defaultProject || projects[0].id;
  const defaultProject =
    projects.find((project) => project.id === defaultId) || projects[0];
  projectSelect.value = defaultProject.id || projectSelect.options[0].value;

  variants = Array.isArray(manifest.variants) ? manifest.variants : [];
  activeVariantId = "";
  if (variants.length > 0 && variantSelect) {
    const stored = window.localStorage ? localStorage.getItem(variantStorageKey) : null;
    const defaultVariant = manifest.defaultVariant || "";
    activeVariantId = (stored || defaultVariant || variants[0].id || "").toString();

    variantSelect.innerHTML = "";
    variants.forEach((variant, index) => {
      const option = document.createElement("option");
      option.value = variant.id || `variant-${index}`;
      variant.id = option.value;
      option.textContent = variant.label || variant.id || `Variant ${index + 1}`;
      variantSelect.appendChild(option);
    });
    variantSelect.value = activeVariantId;

    variantSelect.addEventListener("change", async (event) => {
      activeVariantId = event.target.value;
      if (window.localStorage) {
        localStorage.setItem(variantStorageKey, activeVariantId);
      }
      const selectedProjectId = projectSelect.value;
      const project =
        projects.find((candidate) => (candidate.id || "") === selectedProjectId) ||
        projects[0];
      stageMeta.textContent = `Manifest: ${manifestUrl} | Project: ${
        project.label || project.id || selectedProjectId
      } | Variant: ${activeVariantId || "default"}`;
      await renderProject(project);
    });
  } else if (variantSelect) {
    variantSelect.innerHTML = "";
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Default";
    variantSelect.appendChild(option);
    variantSelect.value = "";
  }

  stageMeta.textContent = `Manifest: ${manifestUrl} | Project: ${
    defaultProject.label || defaultProject.id || "default"
  } | Variant: ${activeVariantId || "default"}`;
  await renderProject(defaultProject);

  projectSelect.addEventListener("change", async (event) => {
    const selectedId = event.target.value;
    const project =
      projects.find((candidate) => (candidate.id || "") === selectedId) ||
      projects[0];
    stageMeta.textContent = `Manifest: ${manifestUrl} | Project: ${
      project.label || project.id || selectedId
    } | Variant: ${activeVariantId || "default"}`;
    await renderProject(project);
  });

  window.addEventListener("resize", () => {
    layoutItems();
    layoutCinematic();
  });
}

start();
