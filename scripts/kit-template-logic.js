const textureCache = new Map();

function joinPath(root, path) {
    if (!root) return path;
    if (!path) return path;
    if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
    const cleanRoot = root.endsWith("/") ? root.slice(0, -1) : root;
    return `${cleanRoot}/${path}`;
}

function toViewToken(view) {
    return view === "threeQuarter" ? "three-quarter" : view;
}

async function loadTexture(pixi, path) {
    if (!path) return null;
    const key = path;
    if (textureCache.has(key)) {
        return textureCache.get(key);
    }
    const texture = await pixi.Assets.load(path);
    textureCache.set(key, texture);
    return texture;
}

function makeSprite(pixi, texture) {
    const sprite = new pixi.Sprite(texture || pixi.Texture.EMPTY);
    sprite.anchor.set(0.5, 0.5);
    sprite.visible = Boolean(texture);
    return sprite;
}

function coalescePath(primary, fallback) {
    return primary === undefined || primary === null ? fallback : primary;
}

function buildPlanetPath({ texture, rings, atmosphere, state }) {
    return {
        texturePath: texture ? `sprites/planets/texture-${texture}.png` : null,
        ringsPath: rings ? `sprites/planets/ring-${rings}.png` : null,
        atmospherePath: atmosphere ? `sprites/planets/atmosphere-${atmosphere}.png` : null,
        statePath: state ? `sprites/planets/state-${state}.png` : null,
    };
}

function buildSatellitePath({ icon, state, glow, badge }) {
    return {
        iconPath: icon ? `sprites/satellites/satellite-${icon}.png` : null,
        statePath: state ? `sprites/satellites/state-${state}.png` : null,
        glowPath: glow ? `sprites/satellites/glow-${glow}.png` : null,
        badgePath: badge ? `sprites/satellites/badge-${badge}.png` : null,
    };
}

function buildStargatePath({ ring, glyphs, energy, warp, particles }) {
    return {
        ringPath: ring ? `effects/${ring}` : "effects/stargate-ring.png",
        glyphsPath: glyphs ? `effects/${glyphs}` : null,
        energyPath: energy ? `effects/${energy}` : "effects/portal-energy.png",
        warpPath: warp ? `effects/${warp}` : "effects/warp-streaks.png",
        particlesPath: particles ? `effects/${particles}` : null,
    };
}

function buildBackgroundPath({ starfield, nebula, constellation, vignette }) {
    return {
        starfieldPath: starfield ? `backgrounds/${starfield}` : "backgrounds/starfield-tile.png",
        nebulaPath: nebula ? `backgrounds/${nebula}` : "backgrounds/nebula-overlay.png",
        constellationPath: constellation
            ? `backgrounds/${constellation}`
            : "backgrounds/constellation-pattern.png",
        vignettePath: vignette ? `backgrounds/${vignette}` : null,
    };
}

function buildBadgePath({ rarity, icon }) {
    return {
        framePath: rarity ? `icons/achievements/frame-${rarity}.png` : null,
        iconPath: icon ? `icons/achievements/${icon}.png` : null,
    };
}

export function getPlanetLayerPaths({ texture, rings, atmosphere, state }) {
    return buildPlanetPath({ texture, rings, atmosphere, state });
}

export function getSatelliteLayerPaths({ icon, state, glow, badge }) {
    return buildSatellitePath({ icon, state, glow, badge });
}

export function getStargateLayerPaths({ ring, glyphs, energy, warp, particles }) {
    return buildStargatePath({ ring, glyphs, energy, warp, particles });
}

export function getBackgroundLayerPaths({ starfield, nebula, constellation, vignette }) {
    return buildBackgroundPath({ starfield, nebula, constellation, vignette });
}

export function getBadgeLayerPaths({ rarity, icon }) {
    return buildBadgePath({ rarity, icon });
}

export async function createAstroDuckComposite({
    pixi,
    root = zelosPaths.root,
    view = "front",
    outfit = "outfit-default-suit",
    pose = "none",
    expression = "none",
}) {
    if (!pixi) {
        throw new Error("Pixi instance required");
    }

    const viewToken = toViewToken(view);
    const hasOutfit = outfit !== "none" && Boolean(zelosPaths.astroDuck.outfits[outfit]);
    const poseBasePath =
        pose === "none"
            ? null
            : zelosPaths.astroDuck.posePattern
                .replace("{pose}", pose)
                .replace("{view}", viewToken);
    const basePath = joinPath(root, pose === "none" ? zelosPaths.astroDuck.base[view] : poseBasePath);
    const outfitPosePath =
        hasOutfit && pose !== "none"
            ? zelosPaths.astroDuck.outfitPosePattern
                .replace("{outfit}", outfit)
                .replace("{pose}", pose)
                .replace("{view}", viewToken)
            : null;
    const outfitPath = hasOutfit
        ? joinPath(root, pose === "none" ? zelosPaths.astroDuck.outfits[outfit]?.[view] : outfitPosePath)
        : null;
    const expressionPath =
        expression === "none" ? null : joinPath(root, zelosPaths.astroDuck.expressions[expression]?.[view]);

    const [baseTexture, outfitTexture, expressionTexture] = await Promise.all([
        loadTexture(pixi, basePath),
        loadTexture(pixi, outfitPath),
        loadTexture(pixi, expressionPath),
    ]);

    if (!baseTexture) {
        throw new Error("Base Astro-Duck texture missing");
    }

    const container = new pixi.Container();
    const sprites = {
        base: makeSprite(pixi, baseTexture),
        outfit: makeSprite(pixi, outfitTexture),
        expression: makeSprite(pixi, expressionTexture),
    };

    container.addChild(sprites.base);
    container.addChild(sprites.outfit);
    container.addChild(sprites.expression);

    async function update({ nextView, nextOutfit, nextExpression, nextPose } = {}) {
        if (nextView) view = nextView;
        if (nextOutfit !== undefined) outfit = nextOutfit;
        if (nextPose !== undefined) pose = nextPose;
        if (nextExpression !== undefined) expression = nextExpression;

        const updatedViewToken = toViewToken(view);
        const hasOutfitUpdate = outfit !== "none" && Boolean(zelosPaths.astroDuck.outfits[outfit]);
        const updatedPoseBase =
            pose === "none"
                ? null
                : zelosPaths.astroDuck.posePattern
                    .replace("{pose}", pose)
                    .replace("{view}", updatedViewToken);
        const updatedBase = joinPath(
            root,
            pose === "none" ? zelosPaths.astroDuck.base[view] : updatedPoseBase
        );
        const updatedOutfitPose =
            hasOutfitUpdate && pose !== "none"
                ? zelosPaths.astroDuck.outfitPosePattern
                    .replace("{outfit}", outfit)
                    .replace("{pose}", pose)
                    .replace("{view}", updatedViewToken)
                : null;
        const updatedOutfit = hasOutfitUpdate
            ? joinPath(
                root,
                pose === "none" ? zelosPaths.astroDuck.outfits[outfit]?.[view] : updatedOutfitPose
            )
            : null;
        const updatedExpression =
            expression === "none"
                ? null
                : joinPath(root, zelosPaths.astroDuck.expressions[expression]?.[view]);

        const [baseTex, outfitTex, expressionTex] = await Promise.all([
            loadTexture(pixi, updatedBase),
            loadTexture(pixi, updatedOutfit),
            loadTexture(pixi, updatedExpression),
        ]);

        sprites.base.texture = baseTex;
        sprites.outfit.texture = outfitTex || pixi.Texture.EMPTY;
        sprites.outfit.visible = Boolean(outfitTex);
        sprites.expression.texture = expressionTex || pixi.Texture.EMPTY;
        sprites.expression.visible = Boolean(expressionTex);
    }

    return {
        container,
        update,
    };
}

export async function createCompositeLayers({ pixi, root = ".", layers = [], view }) {
    if (!pixi) {
        throw new Error("Pixi instance required");
    }

    let currentView = view;
    const container = new pixi.Container();
    const sprites = new Map();

    for (const layer of layers) {
        const path = layer.path || (layer.paths ? layer.paths[currentView] : null);
        const texture = await loadTexture(pixi, path ? joinPath(root, path) : null);
        const sprite = makeSprite(pixi, texture);
        sprites.set(layer.id, sprite);
        container.addChild(sprite);
    }

    async function update(updateInput = []) {
        let layerUpdates = updateInput;
        if (!Array.isArray(updateInput)) {
            if (updateInput.nextView) {
                currentView = updateInput.nextView;
            }
            layerUpdates = updateInput.layerUpdates || [];
        }

        for (const updateItem of layerUpdates) {
            const layer = layers.find((item) => item.id === updateItem.id);
            if (!layer) continue;
            const option = updateItem.option || layer.options?.find((opt) => opt.id === updateItem.optionId);
            const path =
                option?.paths?.[currentView] ||
                option?.path ||
                layer.paths?.[currentView] ||
                layer.path ||
                null;
            const texture = await loadTexture(pixi, path ? joinPath(root, path) : null);
            const sprite = sprites.get(layer.id);
            if (!sprite) continue;
            sprite.texture = texture || pixi.Texture.EMPTY;
            sprite.visible = Boolean(texture);
        }
    }

    return {
        container,
        update,
    };
}

export async function createPlanetComposite({
    pixi,
    root = ".",
    texture = "solid",
    rings = null,
    atmosphere = "normal",
    state = null,
    texturePath,
    ringsPath,
    atmospherePath,
    statePath,
}) {
    const defaults = buildPlanetPath({ texture, rings, atmosphere, state });
    const layers = [
        { id: "texture", path: coalescePath(texturePath, defaults.texturePath) },
        { id: "rings", path: coalescePath(ringsPath, defaults.ringsPath) },
        { id: "atmosphere", path: coalescePath(atmospherePath, defaults.atmospherePath) },
        { id: "state", path: coalescePath(statePath, defaults.statePath) },
    ];
    return createCompositeLayers({ pixi, root, layers });
}

export async function createSatelliteComposite({
    pixi,
    root = ".",
    icon = "config",
    state = null,
    glow = null,
    badge = null,
    iconPath,
    statePath,
    glowPath,
    badgePath,
}) {
    const defaults = buildSatellitePath({ icon, state, glow, badge });
    const layers = [
        { id: "icon", path: coalescePath(iconPath, defaults.iconPath) },
        { id: "state", path: coalescePath(statePath, defaults.statePath) },
        { id: "glow", path: coalescePath(glowPath, defaults.glowPath) },
        { id: "badge", path: coalescePath(badgePath, defaults.badgePath) },
    ];
    return createCompositeLayers({ pixi, root, layers });
}

export async function createStargateComposite({
    pixi,
    root = ".",
    ring,
    glyphs,
    energy,
    warp,
    particles,
    ringPath,
    glyphsPath,
    energyPath,
    warpPath,
    particlesPath,
}) {
    const defaults = buildStargatePath({ ring, glyphs, energy, warp, particles });
    const layers = [
        { id: "ring", path: coalescePath(ringPath, defaults.ringPath) },
        { id: "glyphs", path: coalescePath(glyphsPath, defaults.glyphsPath) },
        { id: "energy", path: coalescePath(energyPath, defaults.energyPath) },
        { id: "warp", path: coalescePath(warpPath, defaults.warpPath) },
        { id: "particles", path: coalescePath(particlesPath, defaults.particlesPath) },
    ];
    return createCompositeLayers({ pixi, root, layers });
}

export async function createBackgroundComposite({
    pixi,
    root = ".",
    starfield,
    nebula,
    constellation,
    vignette,
    starfieldPath,
    nebulaPath,
    constellationPath,
    vignettePath,
}) {
    const defaults = buildBackgroundPath({ starfield, nebula, constellation, vignette });
    const layers = [
        { id: "starfield", path: coalescePath(starfieldPath, defaults.starfieldPath) },
        { id: "nebula", path: coalescePath(nebulaPath, defaults.nebulaPath) },
        { id: "constellation", path: coalescePath(constellationPath, defaults.constellationPath) },
        { id: "vignette", path: coalescePath(vignettePath, defaults.vignettePath) },
    ];
    return createCompositeLayers({ pixi, root, layers });
}

export async function createBadgeComposite({
    pixi,
    root = ".",
    rarity,
    icon,
    framePath,
    iconPath,
}) {
    const defaults = buildBadgePath({ rarity, icon });
    const layers = [
        { id: "frame", path: coalescePath(framePath, defaults.framePath) },
        { id: "icon", path: coalescePath(iconPath, defaults.iconPath) },
    ];
    return createCompositeLayers({ pixi, root, layers });
}

export async function createUiComposite({
    pixi,
    root = ".",
    modalPath = "ui/modal-frame.png",
    buttonPath = "ui/button-primary-states.png",
    inputPath = "ui/input-states.png",
    toastPath = "ui/toast-variants.png",
}) {
    const layers = [
        { id: "modal", path: modalPath },
        { id: "button", path: buttonPath },
        { id: "input", path: inputPath },
        { id: "toast", path: toastPath },
    ];
    return createCompositeLayers({ pixi, root, layers });
}

function buildPianoLayout({
    panelWidth,
    panelHeight,
    whiteKeyCount = 14,
    blackKeyIndices = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12],
    whiteGlowSize = { width: 50, height: 150 },
    blackGlowSize = { width: 30, height: 100 },
    marginX = 20,
    marginBottom = 12,
    blackTopOffset = 8,
}) {
    const usableWidth = Math.max(1, panelWidth - marginX * 2);
    const keySpacing = usableWidth / whiteKeyCount;
    const whiteScale = keySpacing / whiteGlowSize.width;
    const blackScale = whiteScale * 0.9;
    const startX = -panelWidth / 2 + marginX + keySpacing / 2;
    const whiteY = panelHeight / 2 - marginBottom - (whiteGlowSize.height * whiteScale) / 2;
    const whiteKeys = Array.from({ length: whiteKeyCount }, (_, index) => ({
        x: startX + index * keySpacing,
        y: whiteY,
        scale: whiteScale,
    }));

    const whiteTop = whiteY - (whiteGlowSize.height * whiteScale) / 2;
    const blackY =
        whiteTop + blackTopOffset + (blackGlowSize.height * blackScale) / 2;
    const blackKeys = blackKeyIndices.map((index) => {
        const left = whiteKeys[index];
        const right = whiteKeys[index + 1];
        const x = left && right ? (left.x + right.x) / 2 : 0;
        return { x, y: blackY, scale: blackScale };
    });

    return { whiteKeys, blackKeys };
}

export async function createPianoComposite({
    pixi,
    root = ".",
    panelPath = "ui/space-piano-panel.png",
    whiteGlowPath = "ui/space-piano-key-glow-white.png",
    blackGlowPath = "ui/space-piano-key-glow-black.png",
    layout,
} = {}) {
    if (!pixi) {
        throw new Error("Pixi instance required");
    }

    const [panelTexture, whiteGlowTexture, blackGlowTexture] = await Promise.all([
        loadTexture(pixi, joinPath(root, panelPath)),
        loadTexture(pixi, joinPath(root, whiteGlowPath)),
        loadTexture(pixi, joinPath(root, blackGlowPath)),
    ]);

    const panelWidth = panelTexture?.width || 600;
    const panelHeight = panelTexture?.height || 200;
    const layoutResolved =
        layout || buildPianoLayout({ panelWidth, panelHeight });

    const container = new pixi.Container();
    const panelSprite = makeSprite(pixi, panelTexture);
    panelSprite.anchor.set(0.5, 0.5);
    container.addChild(panelSprite);

    const whiteGlows = layoutResolved.whiteKeys.map((item) => {
        const sprite = makeSprite(pixi, whiteGlowTexture);
        sprite.position.set(item.x, item.y);
        sprite.scale.set(item.scale);
        sprite.visible = false;
        container.addChild(sprite);
        return sprite;
    });

    const blackGlows = layoutResolved.blackKeys.map((item) => {
        const sprite = makeSprite(pixi, blackGlowTexture);
        sprite.position.set(item.x, item.y);
        sprite.scale.set(item.scale);
        sprite.visible = false;
        container.addChild(sprite);
        return sprite;
    });

    function setKeyGlow({ type = "white", index = 0, visible = true, alpha = 1, scale = 1 } = {}) {
        const list = type === "black" ? blackGlows : whiteGlows;
        const sprite = list[index];
        if (!sprite) return;
        sprite.visible = visible;
        sprite.alpha = alpha;
        const baseScale = sprite.scale.x || 1;
        sprite.scale.set(baseScale * scale);
    }

    function hideAllGlows() {
        [...whiteGlows, ...blackGlows].forEach((sprite) => {
            sprite.visible = false;
        });
    }

    return {
        container,
        panel: panelSprite,
        whiteGlows,
        blackGlows,
        setKeyGlow,
        hideAllGlows,
        layout: layoutResolved,
    };
}

export function createVideoSprite({
    pixi,
    src,
    width,
    height,
    loop = true,
    muted = true,
    autoplay = true,
    playsInline = true,
}) {
    if (!pixi) {
        throw new Error("Pixi instance required");
    }
    if (!src) {
        throw new Error("Video source required");
    }

    const video = document.createElement("video");
    video.src = src;
    video.loop = loop;
    video.muted = muted;
    video.autoplay = autoplay;
    video.playsInline = playsInline;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const texture = pixi.Texture.from(video);
    const sprite = new pixi.Sprite(texture);
    sprite.anchor.set(0.5, 0.5);

    if (width && height) {
        sprite.width = width;
        sprite.height = height;
    }

    if (autoplay) {
        video.play().catch(() => { });
    }

    return { sprite, video, texture };
}
