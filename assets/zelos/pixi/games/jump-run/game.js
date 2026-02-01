import {
  createAstroDuckComposite,
  createBackgroundComposite,
  createBadgeComposite,
  createPlanetComposite,
  createSatelliteComposite,
  createVideoSprite,
} from "../../zelos-pixi-kit.js";

const PIXI = window.PIXI;

const defaultInput = {
  axisX: 0,
  axisY: 0,
  actions: { jump: false, shoot: false, dash: false, pause: false },
  poll() {},
};

function createLocalBus() {
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

export async function createGame({ pixi, root = "../../..", input, bus }) {
  const app = new pixi.Application({
    resizeTo: window,
    backgroundColor: 0x0a0a0f,
  });
  document.body.appendChild(app.view);
  app.stage.sortableChildren = true;

  const settings = {
    reducedShake: Boolean(window.ZelosGameSettings?.reducedShake),
    lowGlow: Boolean(window.ZelosGameSettings?.lowGlow),
  };

  const world = new pixi.Container();
  app.stage.addChild(world);

  const SCORE_KEY = "zelos:jump-run:highscore";
  const ACHIEVEMENTS_KEY = "zelos:jump-run:achievements";
  const achievementDefinitions = {
    "first-flight": {
      id: "first-flight",
      label: "First Flight",
      icon: "first-flight",
      rarity: "common",
    },
    explorer: {
      id: "explorer",
      label: "Explorer",
      icon: "explorer",
      rarity: "uncommon",
    },
    "speed-demon": {
      id: "speed-demon",
      label: "Speed Demon",
      icon: "speed-demon",
      rarity: "rare",
    },
    "night-owl": {
      id: "night-owl",
      label: "Night Owl",
      icon: "night-owl",
      rarity: "uncommon",
    },
    perfectionist: {
      id: "perfectionist",
      label: "Perfectionist",
      icon: "perfectionist",
      rarity: "epic",
    },
    "piano-master": {
      id: "piano-master",
      label: "Piano Master",
      icon: "piano-master",
      rarity: "legendary",
    },
  };
  const hud = new pixi.Container();
  const scoreText = new pixi.Text("Score 000000", {
    fontFamily: "Arial",
    fontSize: 14,
    fill: 0xa0a0b0,
  });
  const bestText = new pixi.Text("Best 000000", {
    fontFamily: "Arial",
    fontSize: 12,
    fill: 0x91a3b6,
  });
  hud.addChild(scoreText);
  hud.addChild(bestText);
  app.stage.addChild(hud);

  let background = null;
  let planet = null;
  let satellite = null;
  let player;
  let cinematicLayer = null;
  let cinematicState = null;
  let cinematicOff = null;
  let cinematicOverlay = null;
  let cinematicSkip = null;
  let fadeState = null;
  let flashOverlay = null;
  let flashState = null;
  let shakeTime = 0;
  let shakeStrength = 0;
  let elapsedMs = 0;
  let timeScale = 1;
  let busRef = null;
  let scoreState = {
    score: 0,
    best: 0,
    accumulator: 0,
  };
  let achievementState = {
    unlocked: new Set(),
    queue: [],
    active: null,
    isShowing: false,
  };
  let menuState = {
    active: true,
    fading: false,
    fadeStart: 0,
    fadeDuration: 500,
    container: null,
    background: null,
    planet: null,
    satellite: null,
    duck: null,
    prompt: null,
  };

  function layoutScene() {
    const width = app.renderer.width;
    const height = app.renderer.height;

    if (background && background.width > 0 && background.height > 0) {
      const scale = Math.max(width / background.width, height / background.height);
      background.scale.set(scale);
      background.position.set(width / 2, height / 2);
    }

    if (planet) {
      planet.scale.set(0.55);
      planet.position.set(width * 0.18, height * 0.28);
    }

    if (satellite) {
      satellite.scale.set(0.5);
      satellite.position.set(width * 0.78, height * 0.25);
    }

    if (player) {
      player.position.set(width / 2, height * 0.7);
    }

    if (flashOverlay) {
      flashOverlay.clear();
      flashOverlay.beginFill(0xffffff, flashState?.alpha || 0);
      flashOverlay.drawRect(0, 0, width, height);
      flashOverlay.endFill();
    }

    if (menuState.container) {
      menuState.container.position.set(width / 2, height / 2);
    }

    hud.position.set(16, 12);
    bestText.position.set(0, 18);

    if (achievementState.active) {
      layoutAchievementToast(achievementState.active);
    }
  }

  function layoutCinematic() {
    if (!cinematicState) return;
    const width = app.renderer.width;
    const height = app.renderer.height;
    const videoWidth = cinematicState.video.videoWidth || 1920;
    const videoHeight = cinematicState.video.videoHeight || 1080;
    const scale = Math.min(width / videoWidth, height / videoHeight);
    cinematicState.sprite.width = videoWidth * scale;
    cinematicState.sprite.height = videoHeight * scale;
    cinematicState.sprite.position.set(width / 2, height / 2);

    if (cinematicOverlay) {
      cinematicOverlay.clear();
      cinematicOverlay.beginFill(0x0a0a0f, 0.55);
      cinematicOverlay.drawRect(0, 0, width, height);
      cinematicOverlay.endFill();
    }

    if (cinematicSkip) {
      const margin = 28;
      cinematicSkip.position.set(width - margin, height - margin);
    }
  }

  function applyGlowSettings() {
    const glowScale = settings.lowGlow ? 0.6 : 1;
    if (background) background.alpha = 0.7 * glowScale;
    if (planet) planet.alpha = 0.85 * glowScale;
    if (satellite) satellite.alpha = 0.85 * glowScale;
  }

  function triggerShake(strength = 6, duration = 200) {
    const scale = settings.reducedShake ? 0.4 : 1;
    shakeStrength = Math.max(shakeStrength, strength * scale);
    shakeTime = Math.max(shakeTime, duration);
  }

  function updateShake(deltaMs) {
    if (shakeTime <= 0) {
      world.position.set(0, 0);
      return;
    }
    shakeTime -= deltaMs;
    const dx = (Math.random() * 2 - 1) * shakeStrength;
    const dy = (Math.random() * 2 - 1) * shakeStrength;
    world.position.set(dx, dy);
    if (shakeTime <= 0) {
      world.position.set(0, 0);
      shakeStrength = 0;
    }
  }

  function ensureFlashOverlay() {
    if (!flashOverlay) {
      flashOverlay = new pixi.Graphics();
      flashOverlay.zIndex = 900;
      app.stage.addChild(flashOverlay);
    }
  }

  function triggerFlash({ color = 0xffffff, alpha = 0.45, duration = 220 } = {}) {
    ensureFlashOverlay();
    flashState = {
      color,
      alpha,
      duration,
      elapsed: 0,
    };
    layoutScene();
  }

  function updateFlash(deltaMs) {
    if (!flashState || !flashOverlay) return;
    flashState.elapsed += deltaMs;
    const t = Math.min(1, flashState.elapsed / flashState.duration);
    const currentAlpha = flashState.alpha * (1 - t);
    const width = app.renderer.width;
    const height = app.renderer.height;
    flashOverlay.clear();
    flashOverlay.beginFill(flashState.color, currentAlpha);
    flashOverlay.drawRect(0, 0, width, height);
    flashOverlay.endFill();
    if (t >= 1) {
      flashState = null;
    }
  }

  function triggerSlowmo(scale = 0.5, duration = 240) {
    timeScale = Math.min(timeScale, scale);
    setTimeout(() => {
      timeScale = 1;
    }, duration);
  }

  function loadBestScore() {
    try {
      const value = window.localStorage?.getItem(SCORE_KEY);
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) {
        scoreState.best = Math.max(0, parsed);
      }
    } catch (err) {
      // ignore storage issues
    }
  }

  function saveBestScore() {
    try {
      window.localStorage?.setItem(SCORE_KEY, String(scoreState.best));
    } catch (err) {
      // ignore storage issues
    }
  }

  function getExternalAchievements() {
    return window.ZelosAchievements || null;
  }

  function isExternallyUnlocked(id) {
    const external = getExternalAchievements();
    if (!external?.isUnlocked) return false;
    try {
      return Boolean(external.isUnlocked(id));
    } catch (err) {
      return false;
    }
  }

  function seedExternalAchievements() {
    const external = getExternalAchievements();
    if (!external) return;
    if (typeof external.list === "function") {
      try {
        const list = external.list();
        if (Array.isArray(list)) {
          list.forEach((id) => achievementState.unlocked.add(id));
          return;
        }
      } catch (err) {
        // ignore external list failures
      }
    }
    if (typeof external.isUnlocked === "function") {
      Object.keys(achievementDefinitions).forEach((id) => {
        if (isExternallyUnlocked(id)) {
          achievementState.unlocked.add(id);
        }
      });
    }
  }

  function loadAchievements() {
    seedExternalAchievements();
    try {
      const raw = window.localStorage?.getItem(ACHIEVEMENTS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) {
        list.forEach((id) => achievementState.unlocked.add(id));
      }
    } catch (err) {
      // ignore storage issues
    }
  }

  function saveAchievements() {
    try {
      window.localStorage?.setItem(
        ACHIEVEMENTS_KEY,
        JSON.stringify([...achievementState.unlocked])
      );
    } catch (err) {
      // ignore storage issues
    }
  }

  function formatScore(value) {
    const safe = Math.max(0, Math.floor(value));
    return String(safe).padStart(6, "0");
  }

  function updateScoreDisplay() {
    scoreText.text = `Score ${formatScore(scoreState.score)}`;
    bestText.text = `Best ${formatScore(scoreState.best)}`;
  }

  function addScore(amount) {
    scoreState.score = Math.max(0, scoreState.score + amount);
    if (scoreState.score > scoreState.best) {
      scoreState.best = scoreState.score;
      saveBestScore();
    }
    updateScoreDisplay();
  }

  function resetScore() {
    scoreState.score = 0;
    scoreState.accumulator = 0;
    updateScoreDisplay();
  }

  function resolveAchievement(id, overrides) {
    const base = achievementDefinitions[id] || { id };
    return {
      id,
      label: overrides?.label ?? base.label ?? id,
      icon: overrides?.icon ?? base.icon ?? null,
      rarity: overrides?.rarity ?? base.rarity ?? "common",
    };
  }

  function queueAchievementToast(entry) {
    achievementState.queue.push(entry);
    showNextAchievement();
  }

  async function buildAchievementToast(entry) {
    const width = 220;
    const height = 64;
    const container = new pixi.Container();
    container.zIndex = 950;
    const bg = new pixi.Graphics();
    const outlineAlpha = settings.lowGlow ? 0.45 : 0.75;
    bg.beginFill(0x0a0a0f, 0.75);
    bg.lineStyle(1, 0x00f5ff, outlineAlpha);
    bg.drawRoundedRect(0, 0, width, height, 12);
    bg.endFill();
    container.addChild(bg);

    try {
      if (entry.icon) {
        const badge = await createBadgeComposite({
          pixi,
          root,
          rarity: entry.rarity,
          icon: entry.icon,
        });
        badge.container.scale.set(0.5);
        badge.container.position.set(32, height / 2);
        container.addChild(badge.container);
      }
    } catch (err) {
      // ignore missing badge assets
    }

    const text = new pixi.Text(entry.label || entry.id, {
      fontFamily: "Arial",
      fontSize: 12,
      fill: 0xf0f0f5,
    });
    text.position.set(72, height / 2 - text.height / 2);
    container.addChild(text);

    return { container, width, height };
  }

  async function showNextAchievement() {
    if (achievementState.active || achievementState.isShowing) return;
    const next = achievementState.queue.shift();
    if (!next) return;
    achievementState.isShowing = true;
    const toast = await buildAchievementToast(next);
    achievementState.isShowing = false;
    if (!toast) return;
    achievementState.active = {
      ...toast,
      start: performance.now(),
      fadeIn: 220,
      hold: 1400,
      fadeOut: 320,
    };
    app.stage.addChild(toast.container);
    layoutAchievementToast(achievementState.active);
  }

  function layoutAchievementToast(entry) {
    const margin = 16;
    const width = app.renderer.width;
    entry.container.position.set(width - entry.width - margin, margin);
  }

  function updateAchievementToast() {
    const entry = achievementState.active;
    if (!entry) return;
    const elapsed = performance.now() - entry.start;
    const { fadeIn, hold, fadeOut } = entry;
    let alpha = 1;
    if (elapsed < fadeIn) {
      alpha = elapsed / fadeIn;
    } else if (elapsed < fadeIn + hold) {
      alpha = 1;
    } else if (elapsed < fadeIn + hold + fadeOut) {
      alpha = 1 - (elapsed - fadeIn - hold) / fadeOut;
    } else {
      entry.container.parent?.removeChild(entry.container);
      achievementState.active = null;
      showNextAchievement();
      return;
    }
    entry.container.alpha = alpha;
  }

  function isAchievementUnlocked(id) {
    if (isExternallyUnlocked(id)) return true;
    return achievementState.unlocked.has(id);
  }

  function unlockAchievement(id, options = {}) {
    const entry = resolveAchievement(id, options);
    if (!entry.id || isAchievementUnlocked(entry.id)) return;
    achievementDefinitions[entry.id] = entry;
    achievementState.unlocked.add(entry.id);
    saveAchievements();
    const external = getExternalAchievements();
    if (external?.unlock) {
      try {
        external.unlock(entry.id, entry);
      } catch (err) {
        // ignore external unlock errors
      }
    }
    if (!options.silent) {
      queueAchievementToast(entry);
    }
    if (options.emit !== false && busRef?.emit) {
      busRef.emit("achievement:unlock", {
        ...entry,
        source: "game",
      });
    }
  }

  function checkAchievements() {
    if (!achievementState.unlocked.has("speed-demon") && scoreState.score >= 300) {
      unlockAchievement("speed-demon");
    }
  }

  function startRun() {
    if (menuState.fading || !menuState.active) return;
    elapsedMs = 0;
    timeScale = 1;
    resetScore();
    unlockAchievement("first-flight");
    if (menuState.container) {
      menuState.container.visible = true;
      menuState.container.alpha = 1;
    }
    menuState.fading = true;
    menuState.fadeStart = performance.now();
  }

  function updateMenu(deltaMs) {
    if (!menuState.container) return;

    if (menuState.fading) {
      const t = Math.min(
        1,
        (performance.now() - menuState.fadeStart) / menuState.fadeDuration
      );
      menuState.container.alpha = 1 - t;
      if (t >= 1) {
        menuState.fading = false;
        menuState.active = false;
        menuState.container.visible = false;
      }
    }

    if (!menuState.active && !menuState.fading) return;
    if (menuState.duck) {
      const bob = Math.sin(performance.now() / 600) * 6;
      menuState.duck.y = -40 + bob;
    }
    const pulse = 0.7 + 0.3 * Math.sin(performance.now() / 900);
    if (menuState.prompt) {
      menuState.prompt.alpha = 0.5 + pulse * 0.5;
    }
  }

  async function ensureMenu() {
    if (menuState.container) return;
    const container = new pixi.Container();
    container.zIndex = 500;
    menuState.container = container;
    app.stage.addChild(container);

    try {
      const bg = await pixi.Assets.load(`${root}/backgrounds/office-vignette.png`);
      const sprite = new pixi.Sprite(bg);
      sprite.anchor.set(0.5, 0.5);
      sprite.alpha = settings.lowGlow ? 0.6 : 0.9;
      menuState.background = sprite;
      container.addChild(sprite);
    } catch (err) {
      const fallback = new pixi.Graphics();
      fallback.beginFill(0x0a0a0f, 0.85);
      fallback.drawRoundedRect(-500, -280, 1000, 560, 32);
      fallback.endFill();
      menuState.background = fallback;
      container.addChild(fallback);
    }

    try {
      const composite = await createAstroDuckComposite({
        pixi,
        root,
        view: "front",
        outfit: "outfit-default-suit",
        expression: "happy",
      });
      menuState.duck = composite.container;
      menuState.duck.scale.set(0.6);
      menuState.duck.y = -40;
      container.addChild(menuState.duck);
    } catch (err) {
      // ignore if assets missing
    }

    try {
      const composite = await createPlanetComposite({
        pixi,
        root,
        texture: "forest",
        rings: "cyan",
        atmosphere: "thin",
        state: "selected",
      });
      menuState.planet = composite.container;
      menuState.planet.scale.set(0.5);
      menuState.planet.x = -240;
      menuState.planet.y = 140;
      container.addChild(menuState.planet);
    } catch (err) {
      // ignore missing
    }

    try {
      const composite = await createSatelliteComposite({
        pixi,
        root,
        icon: "modules",
        state: "hovered",
        glow: "hover",
        badge: null,
      });
      menuState.satellite = composite.container;
      menuState.satellite.scale.set(0.7);
      menuState.satellite.x = 240;
      menuState.satellite.y = 140;
      container.addChild(menuState.satellite);
    } catch (err) {
      // ignore missing
    }

    const prompt = new pixi.Graphics();
    prompt.beginFill(0x0a0a0f, 0.55);
    prompt.lineStyle(1, 0x00f5ff, 0.7);
    prompt.drawRoundedRect(-120, 120, 240, 48, 18);
    prompt.endFill();
    const arrow = new pixi.Graphics();
    arrow.lineStyle(2, 0x00f5ff, 0.9);
    arrow.moveTo(-12, 140);
    arrow.lineTo(-2, 148);
    arrow.lineTo(-12, 156);
    arrow.moveTo(2, 140);
    arrow.lineTo(12, 148);
    arrow.lineTo(2, 156);
    prompt.addChild(arrow);
    menuState.prompt = prompt;
    container.addChild(prompt);

    container.eventMode = "static";
    container.interactive = true;
    container.cursor = "pointer";
    container.on("pointerdown", () => {
      startRun();
    });

    container.visible = true;
    container.alpha = 1;
    layoutScene();
  }

  function updateFade() {
    if (!fadeState || !cinematicLayer) return;
    const now = performance.now();
    const t = Math.min(1, (now - fadeState.start) / fadeState.duration);
    const eased = t * (2 - t);
    cinematicLayer.alpha = fadeState.from + (fadeState.to - fadeState.from) * eased;
    if (t >= 1) {
      const onComplete = fadeState.onComplete;
      const target = fadeState.to;
      fadeState = null;
      if (target <= 0) {
        cinematicLayer.visible = false;
      }
      onComplete?.();
    }
  }

  function fadeCinematic(toAlpha, duration = 300, onComplete) {
    if (!cinematicLayer) return;
    cinematicLayer.visible = true;
    fadeState = {
      from: cinematicLayer.alpha,
      to: toAlpha,
      start: performance.now(),
      duration,
      onComplete,
    };
  }

  function cleanupCinematic() {
    if (cinematicLayer) {
      cinematicLayer.removeChildren();
      cinematicLayer.visible = false;
    }
    cinematicOverlay = null;
    cinematicSkip = null;
    cinematicState = null;
    fadeState = null;
  }

  function stopCinematic(immediate = false) {
    if (!cinematicState) return;
    try {
      cinematicState.video.pause();
      cinematicState.video.removeAttribute("src");
      cinematicState.video.load();
    } catch (err) {
      // ignore cleanup errors
    }
    if (immediate || !cinematicLayer) {
      cleanupCinematic();
      return;
    }
    if (cinematicLayer.alpha > 0) {
      fadeCinematic(0, 260, cleanupCinematic);
    } else {
      cleanupCinematic();
    }
  }

  function playCinematic(id) {
    if (!id) return;
    if (!cinematicLayer) {
      cinematicLayer = new pixi.Container();
      cinematicLayer.zIndex = 1000;
      cinematicLayer.alpha = 0;
      app.stage.addChild(cinematicLayer);
      app.stage.sortableChildren = true;
    }

    stopCinematic();

    const src = `${root}/video/${id}.mp4`;
    const poster = `${root}/video/${id}.png`;
    const { sprite, video } = createVideoSprite({
      pixi,
      src,
      loop: false,
      muted: true,
      autoplay: true,
    });
    video.poster = poster;

    if (!cinematicOverlay) {
      cinematicOverlay = new pixi.Graphics();
      cinematicLayer.addChild(cinematicOverlay);
    }

    cinematicState = { sprite, video };
    cinematicLayer.addChild(sprite);

    if (!cinematicSkip) {
      const skip = new pixi.Graphics();
      skip.beginFill(0x0a0a0f, 0.7);
      skip.drawCircle(0, 0, 22);
      skip.endFill();
      skip.lineStyle(2, 0x00f5ff, 0.9);
      skip.moveTo(-6, -8);
      skip.lineTo(4, 0);
      skip.lineTo(-6, 8);
      skip.moveTo(2, -8);
      skip.lineTo(12, 0);
      skip.lineTo(2, 8);
      skip.eventMode = "static";
      skip.interactive = true;
      skip.cursor = "pointer";
      skip.hitArea = new pixi.Circle(0, 0, 24);
      skip.on("pointerdown", () => {
        state.bus?.emit?.("cinematic:stop", { id });
        stopCinematic();
      });
      cinematicSkip = skip;
      cinematicLayer.addChild(cinematicSkip);
    }

    cinematicLayer.visible = true;
    fadeCinematic(1, 320);

    video.addEventListener("loadedmetadata", () => {
      layoutCinematic();
    });

    video.addEventListener("ended", () => {
      stopCinematic();
    });

    layoutCinematic();
  }

  async function loadBackdrop() {
    try {
      const composite = await createBackgroundComposite({ pixi, root });
      background = composite.container;
      world.addChild(background);
    } catch (err) {
      // background assets not ready
    }

    try {
      const composite = await createPlanetComposite({
        pixi,
        root,
        texture: "forest",
        rings: "cyan",
        atmosphere: "thin",
        state: null,
      });
      planet = composite.container;
      world.addChild(planet);
    } catch (err) {
      // planet assets not ready
    }

    try {
      const composite = await createSatelliteComposite({
        pixi,
        root,
        icon: "modules",
        state: "hovered",
        glow: "hover",
        badge: null,
      });
      satellite = composite.container;
      world.addChild(satellite);
    } catch (err) {
      // satellite assets not ready
    }

    applyGlowSettings();
    layoutScene();
  }

  await loadBackdrop();
  await ensureMenu();
  loadBestScore();
  loadAchievements();
  updateScoreDisplay();

  try {
    const composite = await createAstroDuckComposite({
      pixi,
      root,
      view: "side",
      outfit: "outfit-default-suit",
      expression: "none",
    });
    player = composite.container;
    world.addChild(player);
    layoutScene();
  } catch (err) {
    // assets not ready
  }

  const localBus = bus || window.ZelosGameBus || createLocalBus();
  if (!window.ZelosGameBus) {
    window.ZelosGameBus = localBus;
  }

  const state = {
    input: input || window.ZelosInput || defaultInput,
    bus: localBus,
    velocityY: 0,
    grounded: false,
  };
  busRef = state.bus;

  if (state.bus && typeof state.bus.on === "function") {
    const offPlay = state.bus.on("cinematic:play", (payload) => {
      playCinematic(payload?.id);
    });
    const offStop = state.bus.on("cinematic:stop", () => {
      stopCinematic();
    });
    const offHit = state.bus.on("fx:hit", () => {
      triggerFlash({ color: 0x00f5ff, alpha: 0.35 });
      triggerShake(6, 140);
    });
    const offBoss = state.bus.on("fx:boss-phase", () => {
      triggerFlash({ color: 0xff00ff, alpha: 0.5, duration: 260 });
      triggerShake(12, 220);
      triggerSlowmo(0.45, 280);
    });
    const offScoreAdd = state.bus.on("score:add", (payload) => {
      const amount = Number(payload?.amount ?? payload);
      if (Number.isFinite(amount)) {
        addScore(Math.floor(amount));
      }
    });
    const offScoreSet = state.bus.on("score:set", (payload) => {
      const value = Number(payload?.value ?? payload);
      if (Number.isFinite(value)) {
        scoreState.score = Math.max(0, Math.floor(value));
        if (scoreState.score > scoreState.best) {
          scoreState.best = scoreState.score;
          saveBestScore();
        }
        updateScoreDisplay();
      }
    });
    const offAchievement = state.bus.on("achievement:unlock", (payload) => {
      if (payload?.source === "game") return;
      const id = payload?.id;
      if (!id) return;
      unlockAchievement(id, {
        label: payload?.label,
        icon: payload?.icon,
        rarity: payload?.rarity,
        emit: false,
      });
    });
    cinematicOff = () => {
      offPlay?.();
      offStop?.();
      offHit?.();
      offBoss?.();
      offScoreAdd?.();
      offScoreSet?.();
      offAchievement?.();
    };
  }

  const cinematicTimers = [];
  function scheduleCinematic(id, delayMs) {
    if (!state.bus || typeof state.bus.emit !== "function") return;
    const timer = setTimeout(() => {
      state.bus.emit("cinematic:play", { id });
    }, delayMs);
    cinematicTimers.push(timer);
  }

  scheduleCinematic("office-briefing", 200);
  scheduleCinematic("intro-briefing-l1", 8000);
  scheduleCinematic("boss-intro-l1", 15000);

  app.ticker.add(() => {
    state.input.poll?.();
    const deltaMs = app.ticker.deltaMS * timeScale;
    updateFade();
    updateFlash(deltaMs);
    updateShake(deltaMs);
    updateMenu(deltaMs);
    updateAchievementToast();
    elapsedMs += deltaMs;
    if (menuState.active || menuState.fading) {
      if (
        menuState.active &&
        (state.input.actions.jump ||
          state.input.actions.shoot ||
          state.input.actions.dash)
      ) {
        startRun();
      }
      return;
    }
    if (!player) return;
    const safeMs = 10000;
    const rampMs = 45000;
    const difficulty = Math.min(1, Math.max(0, (elapsedMs - safeMs) / rampMs));
    const speed = 4 + difficulty * 1.5;
    player.x += state.input.axisX * speed;
    if (state.input.actions.jump && state.grounded) {
      state.velocityY = -12;
      state.grounded = false;
    }
    state.velocityY += 0.6 * timeScale;
    player.y += state.velocityY;
    if (player.y >= window.innerHeight * 0.7) {
      player.y = window.innerHeight * 0.7;
      state.velocityY = 0;
      state.grounded = true;
    }

    scoreState.accumulator += deltaMs * 0.01;
    if (scoreState.accumulator >= 1) {
      const add = Math.floor(scoreState.accumulator);
      scoreState.accumulator -= add;
      addScore(add);
    }

    checkAchievements();
  });

  function resize(w, h) {
    app.renderer.resize(w, h);
    layoutScene();
    layoutCinematic();
  }

  function destroy() {
    cinematicTimers.forEach((timer) => clearTimeout(timer));
    cinematicOff?.();
    stopCinematic(true);
    app.destroy(true, { children: true, texture: true, baseTexture: true });
  }

  return { app, resize, destroy };
}

createGame({ pixi: PIXI, root: "../../.." });
