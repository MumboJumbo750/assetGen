import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
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
    zelosPalette
} from '../lib/pixi-kit';
import { Box, Layers, Play, Pause, Square, Volume2, VolumeX, RefreshCw, ChevronRight, Layout, Info, HardDrive, Download, Zap } from 'lucide-react';

const MANIFEST_URL = '/api/manifest';

export default function PreviewStage() {
    const canvasRef = useRef(null);
    const pixiAppRef = useRef(null);
    const [manifest, setManifest] = useState(null);
    const [projects, setProjects] = useState([]);
    const [activeProject, setActiveProject] = useState(null);
    const [variants, setVariants] = useState([]);
    const [activeVariantId, setActiveVariantId] = useState('default');
    const [loading, setLoading] = useState(true);
    const [assets, setAssets] = useState([]);
    const [activeAsset, setActiveAsset] = useState(null);
    const [compositeControllers, setCompositeControllers] = useState({});
    const [exporting, setExporting] = useState(false);
    const [buildingKit, setBuildingKit] = useState(false);
    const [activeGame, setActiveGame] = useState(null);

    // Initialize PixiJS
    useEffect(() => {
        if (!canvasRef.current) return;

        const app = new PIXI.Application();

        const initPixi = async () => {
            await app.init({
                resizeTo: canvasRef.current.parentElement,
                backgroundColor: 0x0c1320,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
            });
            canvasRef.current.appendChild(app.canvas);
            pixiAppRef.current = app;

            // Initial load
            fetchManifest();
        };

        initPixi();

        return () => {
            if (app) {
                app.destroy(true, { children: true, texture: true });
            }
        };
    }, []);

    const fetchManifest = async () => {
        try {
            const res = await fetch(MANIFEST_URL);
            const data = await res.json();
            setManifest(data);

            const normalizedProjects = data.projects || (data.assets ? [{ id: 'default', label: data.title || 'Default', assets: data.assets }] : []);
            setProjects(normalizedProjects);
            setVariants(data.variants || []);

            if (normalizedProjects.length > 0) {
                setActiveProject(normalizedProjects[0]);
            }
            if (data.defaultVariant) {
                setActiveVariantId(data.defaultVariant);
            }
            setLoading(false);
        } catch (e) {
            console.error('Failed to load manifest', e);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeProject) {
            renderActiveProject();
        }
    }, [activeProject, activeVariantId]);


    const getActiveVariantRoot = () => {
        const variant = variants.find(v => v.id === activeVariantId);
        return variant?.path || variant?.root || "";
    };

    const stripLeading = (value) => {
        if (!value) return "";
        if (value.startsWith("./")) return value.slice(2);
        if (value.startsWith("/")) return value.slice(1);
        return value;
    };

    const getProjectRoot = (project) => stripLeading(project?.root || project?.path || "");

    const toProjectRelative = (relPath, project) => {
        const clean = stripLeading(relPath);
        const projectRoot = getProjectRoot(project);
        if (projectRoot && clean.startsWith(`${projectRoot}/`)) {
            return clean.slice(projectRoot.length + 1);
        }
        return clean;
    };

    const normalizeRoot = (root) => {
        const clean = stripLeading(root);
        if (!clean || clean === ".") return ".";
        return clean.startsWith("assets/") ? `/${clean}` : clean;
    };

    const ensureAssetAbsolute = (path) => {
        if (!path) return path;
        if (path.startsWith("/")) return path;
        return path.startsWith("assets/") ? `/${path}` : path;
    };

    const isGeneratedAssetPath = (relPath, project) => {
        const clean = toProjectRelative(relPath, project);
        return /^(sprites|backgrounds|ui|effects|icons)\//.test(clean);
    };

    const getAssetRoot = (project, relPath) => {
        const projectRoot = normalizeRoot(getProjectRoot(project));
        const variantRoot = normalizeRoot(getActiveVariantRoot());
        if (variantRoot !== "." && isGeneratedAssetPath(relPath, project)) {
            return variantRoot;
        }
        return projectRoot || ".";
    };

    const joinPath = (root, path) => {
        if (!root || root === ".") return path;
        if (!path) return path;
        if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
        const cleanRoot = root.endsWith("/") ? root.slice(0, -1) : root;
        const cleanPath = path.startsWith("./") ? path.slice(2) : path;
        return `${cleanRoot}/${cleanPath}`;
    };

    const resolveAssetPath = (project, relPath) => {
        const normalized = toProjectRelative(relPath, project);
        if (normalized.startsWith("assets/")) {
            return ensureAssetAbsolute(normalized);
        }
        const root = getAssetRoot(project, relPath);
        return ensureAssetAbsolute(joinPath(root, normalized));
    };

    const clearStage = () => {
        if (!pixiAppRef.current) return;
        pixiAppRef.current.stage.removeChildren();
    };

    const renderActiveProject = async () => {
        if (!activeProject || !pixiAppRef.current) return;

        clearStage();
        const app = pixiAppRef.current;
        const projectAssets = activeProject.assets || [];

        setAssets(projectAssets);

        const padding = 40;
        const tile = 240;
        const gap = 40;
        const stageWidth = canvasRef.current.clientWidth;
        const cols = Math.max(1, Math.floor((stageWidth - padding * 2 + gap) / (tile + gap)));

        for (let i = 0; i < projectAssets.length; i++) {
            const rawAsset = projectAssets[i];
            const resolvedRoot = getAssetRoot(activeProject, rawAsset.path || "sprites/");

            try {
                let display;

                if (rawAsset.type === 'composite' && rawAsset.kit === 'astroDuck') {
                    const res = await createAstroDuckComposite({
                        pixi: PIXI,
                        root: resolvedRoot,
                        view: rawAsset.defaultView || 'front',
                        outfit: rawAsset.defaultOutfit || 'outfit-default-suit'
                    });
                    display = res.container;
                    // Store controller if needed
                } else if (rawAsset.type === 'compositeLayers') {
                    const res = await createCompositeLayers({
                        pixi: PIXI,
                        root: resolvedRoot,
                        layers: rawAsset.layers || [],
                        view: rawAsset.defaultView
                    });
                    display = res.container;
                } else {
                    const fullPath = resolveAssetPath(activeProject, rawAsset.path);
                    const texture = await PIXI.Assets.load(fullPath);

                    if (rawAsset.type === 'spritesheet') {
                        // Basic spritesheet loading if metadata exists
                        // For now just show the first frame or the whole texture
                        display = new PIXI.Sprite(texture);
                    } else {
                        display = new PIXI.Sprite(texture);
                    }
                }

                if (display) {
                    display.anchor?.set(0.5, 0.5);

                    // Sizing
                    const maxSize = rawAsset.maxSize || 200;
                    const maxDim = Math.max(display.width, display.height);
                    if (maxDim > 0) {
                        const scale = Math.min(1, maxSize / maxDim);
                        display.scale.set(scale);
                    }

                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const x = padding + col * (tile + gap) + tile / 2;
                    const y = padding + row * (tile + gap) + tile / 2;

                    const container = new PIXI.Container();
                    container.position.set(x, y);
                    container.addChild(display);

                    // Label
                    const label = new PIXI.Text({
                        text: rawAsset.label || rawAsset.id || "Asset",
                        style: {
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 12,
                            fill: 0x94a3b8
                        }
                    });
                    label.anchor.set(0.5, 0);
                    label.y = (maxSize / 2) + 10;
                    container.addChild(label);

                    app.stage.addChild(container);
                }
            } catch (err) {
                console.error(`Failed to load asset: ${rawAsset.id}`, err);
            }
        }
    };

    const handleBuildKit = async () => {
        setBuildingKit(true);
        try {
            const res = await fetch('/api/build-kit');
            const data = await res.json();
            if (data.status === 'success') {
                alert('Pixi Kit updated successfully!');
            } else {
                alert('Error: ' + data.message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setBuildingKit(false);
        }
    };

    const handleExportAssets = async () => {
        setExporting(true);
        try {
            const res = await fetch('/api/export-assets');
            const data = await res.json();
            if (data.status === 'success') {
                // Trigger download
                window.location.href = `/api/download-export?filename=${data.filename}`;
            } else {
                alert('Error: ' + data.message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setExporting(false);
        }
    };

    // Close game on Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setActiveGame(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-950">
                <RefreshCw className="animate-spin text-blue-500 mr-3" />
                <p className="text-slate-400">Loading Stage Manifest...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden bg-slate-950">
            {/* Header / Toolbar */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Layout className="text-blue-500" size={20} />
                        <h2 className="font-bold text-lg">Asset Preview Stage</h2>
                    </div>

                    <div className="h-6 w-px bg-slate-800 mx-2" />

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Project</span>
                        <select
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                            value={activeProject?.id}
                            onChange={(e) => setActiveProject(projects.find(p => p.id === e.target.value))}
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Variant</span>
                        <select
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                            value={activeVariantId}
                            onChange={(e) => setActiveVariantId(e.target.value)}
                        >
                            {variants.map(v => (
                                <option key={v.id} value={v.id}>{v.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Games List */}
                    {activeProject?.games?.length > 0 && (
                        <>
                            <div className="h-6 w-px bg-slate-800 mx-2" />
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Play</span>
                                {activeProject.games.map(game => (
                                    <button
                                        key={game.id}
                                        onClick={() => setActiveGame(game)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800 rounded text-xs font-bold text-emerald-400 transition-colors"
                                    >
                                        <Play size={12} fill="currentColor" /> {game.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBuildKit}
                        disabled={buildingKit}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        <Zap size={14} className={buildingKit ? 'animate-pulse' : ''} />
                        {buildingKit ? 'Building...' : 'Build Kit'}
                    </button>

                    <button
                        onClick={handleExportAssets}
                        disabled={exporting}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        <Download size={14} className={exporting ? 'animate-bounce' : ''} />
                        {exporting ? 'Exporting...' : 'Export'}
                    </button>
                </div>
            </div>


            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden">


                {/* Left: Stage */}
                <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
                    <div ref={canvasRef} className="absolute inset-0" />

                    {/* Game Overlay */}
                    {activeGame && (
                        <div className="absolute inset-0 z-50 bg-black flex flex-col animate-fade-in">
                            <div className="p-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center px-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Play size={16} className="text-emerald-500" />
                                    Playing: {activeGame.label}
                                </h3>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-slate-500 hidden sm:inline">Press ESC to close</span>
                                    <button
                                        onClick={() => setActiveGame(null)}
                                        className="p-1.5 bg-slate-800 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        <Square size={16} fill="currentColor" />
                                    </button>
                                </div>
                            </div>
                            <iframe
                                src={`/${activeGame.path}`}
                                className="flex-1 w-full h-full border-0 select-none focus:outline-none"
                                sandbox="allow-scripts allow-same-origin"
                            />
                        </div>
                    )}
                </div>

                {/* Right: Controls & Inspector */}
                <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
                    <div className="p-4 border-b border-slate-800">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            <Layers size={16} className="text-blue-400" />
                            Asset Inspector
                        </h3>
                    </div>

                    <div className="flex-1 p-4">
                        {activeAsset ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Selected Asset</label>
                                    <div className="mt-1 text-lg font-bold">{activeAsset.label}</div>
                                    <div className="text-xs font-mono text-slate-500 mt-1 truncate">{activeAsset.path}</div>
                                </div>

                                {activeAsset.type === 'composite' && (
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase">Composite Controls</h4>
                                        {/* Dynamic controls for composite layers */}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center py-20 px-6">
                                <Box size={40} className="mb-4 opacity-20" />
                                <p className="text-sm italic">Hover or click assets on stage to inspect.</p>
                            </div>
                        )}
                    </div>

                    {/* Palette Section */}
                    <div className="p-4 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Zelos Palette</h4>
                        <div className="grid grid-cols-4 gap-2">
                            {Object.entries(zelosPalette).map(([name, hex]) => (
                                <div key={name} className="group relative">
                                    <div
                                        className="w-full aspect-square rounded cursor-pointer border border-slate-700 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: hex }}
                                        title={`${name}: ${hex}`}
                                    />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                        {name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
