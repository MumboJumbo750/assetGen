import React, { useState, useEffect, useMemo } from 'react';
import { Folder, FileImage, Plus, RefreshCw, Play, CheckCircle, Circle, Square, CheckSquare, MinusSquare, Zap, Loader, Settings, Save, X, Tag, Wand2, FileText, List, ChevronRight, ChevronDown } from 'lucide-react';
import GptAssistant from './GptAssistant';

export default function SpecView({ onGenerate, requests = [], onImport }) {
    const [allSpecs, setAllSpecs] = useState([]);
    const [assetSpecs, setAssetSpecs] = useState([]);
    const [configSpec, setConfigSpec] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedSpecs, setSelectedSpecs] = useState(new Set());
    const [checkpoints, setCheckpoints] = useState([]);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
    const [batchProgress, setBatchProgress] = useState(null);
    const [editingSpecId, setEditingSpecId] = useState(null);
    const [editData, setEditData] = useState({});
    const [showGptAssistant, setShowGptAssistant] = useState(false);
    const [buildingKit, setBuildingKit] = useState(false);
    const [hoveredSpec, setHoveredSpec] = useState(null);
    const [expandedSpecId, setExpandedSpecId] = useState(null);
    const [promptEdits, setPromptEdits] = useState({});
    const [negativeEdits, setNegativeEdits] = useState({});
    const [sizeEdits, setSizeEdits] = useState({});
    const [viewMode, setViewMode] = useState('list'); // list | tree | tags
    const [collapsedTree, setCollapsedTree] = useState(new Set());

    const getDefaultConfigSpec = () => ({
        id: 'project-style',
        name: 'Project Style',
        type: 'config',
        art_style: {
            theme: '',
            mode: '',
            palette: {}
        },
        prompts: {
            base_positive: '',
            base_negative: ''
        },
        _rel_path: 'project-style.json'
    });

    const paletteKeys = [
        'void', 'space', 'nebula', 'cosmic', 'stardust',
        'neonCyan', 'neonMagenta', 'neonLime', 'neonOrange', 'neonRed',
        'neonPurple', 'neonYellow', 'neonPink',
        'textPrimary', 'textSecondary', 'textMuted'
    ];

    const normalizeHex = (value) => {
        if (!value) return value;
        return value.startsWith('#') ? value : `#${value}`;
    };

    const updatePaletteColor = (key, value) => {
        setConfigSpec({
            ...configSpec,
            art_style: {
                ...configSpec.art_style,
                palette: {
                    ...(configSpec.art_style?.palette || {}),
                    [key]: normalizeHex(value)
                }
            }
        });
    };

    const fetchSpecs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/specs');
            const data = await res.json();
            const all = data.specs || [];

            const config = all.find(s => s.id === 'project-style' || s.type === 'config');
            const assets = all.filter(s => typeof s.path === 'string' && s.path.trim().length > 0 && s.id !== 'project-style' && s.type !== 'config');

            setAllSpecs(assets);
            setAssetSpecs(assets);
            setConfigSpec(config || getDefaultConfigSpec());
        } catch (error) {
            console.error("Failed to fetch specs:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCheckpoints = async () => {
        try {
            const res = await fetch('/api/checkpoints');
            const data = await res.json();
            setCheckpoints(data.checkpoints || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchSpecs();
        fetchCheckpoints();
    }, []);

    const toggleSelect = (id) => {
        const newSet = new Set(selectedSpecs);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedSpecs(newSet);
    };

    const getSelectionState = (ids) => {
        if (!ids || ids.length === 0) return 'none';
        let count = 0;
        for (const id of ids) {
            if (selectedSpecs.has(id)) count += 1;
        }
        if (count === 0) return 'none';
        if (count === ids.length) return 'all';
        return 'some';
    };

    const toggleSelectIds = (ids) => {
        if (!ids || ids.length === 0) return;
        const state = getSelectionState(ids);
        const next = new Set(selectedSpecs);
        if (state === 'all') {
            ids.forEach(id => next.delete(id));
        } else {
            ids.forEach(id => next.add(id));
        }
        setSelectedSpecs(next);
    };

    const toggleSelectAll = () => {
        if (selectedSpecs.size === assetSpecs.length) {
            setSelectedSpecs(new Set());
        } else {
            setSelectedSpecs(new Set(assetSpecs.map(s => s.id)));
        }
    };

    const handleGenerate = (spec) => {
        if (onGenerate) {
            onGenerate(spec);
        }
    };

    const handleUpdateSpec = async (spec) => {
        try {
            const res = await fetch('/api/specs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(spec)
            });
            if (res.ok) {
                setEditingSpecId(null);
                fetchSpecs(); // Refresh to show updates
            }
        } catch (e) {
            console.error(e);
        }
    };

    const getPromptLabel = (key) => {
        if (key === 'default') return 'Default';
        const cp = checkpoints.find(c => c.id === key);
        return cp?.label || key;
    };

    const getPromptValue = (spec, key) => {
        if (promptEdits[spec.id] && promptEdits[spec.id][key] !== undefined) {
            return promptEdits[spec.id][key];
        }
        return spec.params?.prompts?.[key] || '';
    };

    const setPromptValue = (spec, key, value) => {
        setPromptEdits((prev) => ({
            ...prev,
            [spec.id]: {
                ...(prev[spec.id] || spec.params?.prompts || {}),
                [key]: value
            }
        }));
    };

    const getNegativeValue = (spec) => {
        if (negativeEdits[spec.id] !== undefined) {
            return negativeEdits[spec.id];
        }
        return spec.params?.negative_prompt || '';
    };

    const getSizeValue = (spec) => {
        if (sizeEdits[spec.id] !== undefined) {
            return sizeEdits[spec.id];
        }
        return spec.params?.size || '';
    };

    const setNegativeValue = (spec, value) => {
        setNegativeEdits((prev) => ({
            ...prev,
            [spec.id]: value
        }));
    };

    const setSizeValue = (spec, value) => {
        setSizeEdits((prev) => ({
            ...prev,
            [spec.id]: value
        }));
    };

    const handleSavePromptEdits = async (spec) => {
        const prompts = promptEdits[spec.id] || spec.params?.prompts || {};
        const negativePrompt = getNegativeValue(spec);
        const size = getSizeValue(spec);
        const updated = {
            ...spec,
            params: {
                ...(spec.params || {}),
                prompts,
                negative_prompt: negativePrompt,
                size
            }
        };
        await handleUpdateSpec(updated);
        setPromptEdits((prev) => {
            const next = { ...prev };
            delete next[spec.id];
            return next;
        });
        setNegativeEdits((prev) => {
            const next = { ...prev };
            delete next[spec.id];
            return next;
        });
        setSizeEdits((prev) => {
            const next = { ...prev };
            delete next[spec.id];
            return next;
        });
    };

    const handleApplyGptChanges = async (updates) => {
        setLoading(true);
        let successCount = 0;
        let createCount = 0;
        let deleteCount = 0;

        const promises = updates.map(async (update) => {
            let op = update.operation || "update";
            // If update doesn't have an ID but has a path, treat as create
            if (!update.id && update.path) op = "create";

            if (op === "create") {
                const newSpec = {
                    name: update.name || update.path.split('/').pop().split('.')[0],
                    path: update.path,
                    domain: update.domain || "cosmic",
                    kit: update.kit || "standalone",
                    role: update.role || "image",
                    params: {
                        prompts: update.prompts || {},
                        negative_prompt: update.negative_prompt || ""
                    },
                    status: "planned"
                };

                try {
                    const res = await fetch('/api/specs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newSpec)
                    });
                    if (res.ok) createCount++;
                } catch (e) { console.error(e); }

            } else if (op === "delete") {
                console.warn("Delete skipped (API not ready)", update);
                deleteCount++;
            } else {
                // UPDATE
                const original = allSpecs.find(s => s.id === update.id);
                if (!original) return;

                const newSpec = {
                    ...original,
                    domain: update.domain || original.domain,
                    kit: update.kit || original.kit,
                    role: update.role || original.role,
                    params: {
                        ...(original.params || {}),
                        prompts: {
                            ...(original.params?.prompts || {}),
                            ...(update.prompts || {})
                        },
                        negative_prompt: update.negative_prompt || original.params?.negative_prompt
                    }
                };

                try {
                    const res = await fetch('/api/specs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newSpec)
                    });
                    if (res.ok) successCount++;
                } catch (e) { console.error(e); }
            }
        });

        await Promise.all(promises);
        setLoading(false);
        fetchSpecs();
        alert(`AI Results: Updated ${successCount}, Created ${createCount}, Skipped Delete ${deleteCount}`);
    };

    const handleBatchGenerate = async () => {
        if (selectedSpecs.size === 0) return;

        const specsToRun = assetSpecs.filter(s => selectedSpecs.has(s.id));
        setBatchProgress({ current: 0, total: specsToRun.length, currentName: '' });

        for (let i = 0; i < specsToRun.length; i++) {
            const spec = specsToRun[i];
            setBatchProgress({ current: i + 1, total: specsToRun.length, currentName: spec.name });

            try {
                // Ensure output folder is cleaner? Default logic handles it.
                // We pass spec.params.prompts so the backend uses the correct checkpoint prompts.
                const payload = {
                    path: spec.path,
                    checkpoint: selectedCheckpoint || undefined,
                    prompts: spec.params?.prompts || {},
                    negative_prompts: spec.params?.negative_prompts || {},
                    negative_prompt: spec.params?.negative_prompt || '',
                };

                await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

            } catch (e) {
                console.error(`Failed ${spec.name}`, e);
            }
        }

        setBatchProgress(null);
        fetchSpecs();
        alert("Batch generation complete!");
        setSelectedSpecs(new Set());
    };

    const handleBuildKit = async () => {
        setBuildingKit(true);
        try {
            await fetch('/api/build-kit');
            alert("Kit rebuilt successfully!");
        } catch (e) {
            alert("Failed to build kit");
        } finally {
            setBuildingKit(false);
        }
    };

    const normalizeTreePath = (path) => {
        if (!path) return '';
        const clean = path.replace(/\\/g, '/');
        return clean.startsWith('assets/') ? clean.slice(7) : clean;
    };

    const treeRoot = useMemo(() => {
        const root = { name: 'root', children: {}, spec: null, ids: [] };
        assetSpecs.forEach((spec) => {
            const treePath = normalizeTreePath(spec.path);
            if (!treePath) return;
            const parts = treePath.split('/').filter(Boolean);
            let node = root;
            parts.forEach((part, idx) => {
                if (!node.children[part]) {
                    node.children[part] = { name: part, children: {}, spec: null, ids: [] };
                }
                node = node.children[part];
                if (idx === parts.length - 1) {
                    node.spec = spec;
                }
            });
        });

        const collectIds = (node) => {
            let ids = [];
            if (node.spec?.id) ids.push(node.spec.id);
            Object.values(node.children).forEach((child) => {
                ids = ids.concat(collectIds(child));
            });
            node.ids = ids;
            return ids;
        };
        collectIds(root);
        return root;
    }, [assetSpecs]);

    const tagGroups = useMemo(() => {
        const groups = {};
        assetSpecs.forEach((spec) => {
            const key = [spec.domain, spec.kit, spec.role].filter(Boolean).join(' / ') || 'untagged';
            if (!groups[key]) groups[key] = [];
            groups[key].push(spec);
        });
        return Object.entries(groups)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, specs]) => ({
                key,
                specs: specs.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
            }));
    }, [assetSpecs]);

    const toggleTreeCollapse = (key) => {
        setCollapsedTree((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const renderTreeNode = (node, depth = 0, pathKey = '') => {
        if (!node) return null;
        const childKeys = Object.keys(node.children || {}).sort();
        const isFolder = childKeys.length > 0;
        const ids = node.ids || [];
        const selectionState = getSelectionState(ids);
        const isCollapsed = collapsedTree.has(pathKey);

        if (pathKey === '') {
            return childKeys.map((key) => renderTreeNode(node.children[key], 1, key));
        }

        return (
            <div key={pathKey} className="space-y-1">
                <div className="flex items-center gap-2 text-sm" style={{ paddingLeft: depth * 12 }}>
                    {isFolder ? (
                        <button
                            onClick={() => toggleTreeCollapse(pathKey)}
                            className="text-slate-500 hover:text-slate-300"
                            title={isCollapsed ? 'Expand' : 'Collapse'}
                        >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        </button>
                    ) : (
                        <span className="w-[14px]" />
                    )}

                    <button
                        onClick={() => toggleSelectIds(ids)}
                        className="text-slate-500 hover:text-blue-400"
                        title="Select branch"
                    >
                        {selectionState === 'all' && <CheckSquare size={16} className="text-blue-500" />}
                        {selectionState === 'some' && <MinusSquare size={16} className="text-blue-400" />}
                        {selectionState === 'none' && <Square size={16} />}
                    </button>

                    {isFolder ? <Folder size={14} className="text-slate-400" /> : <FileImage size={14} className="text-slate-500" />}
                    <span className="text-slate-200">{node.name}</span>
                    <span className="text-xs text-slate-500">{ids.length}</span>
                    {node.spec?.path && !isFolder && (
                        <span className="text-xs text-slate-500 font-mono truncate">{node.spec.path}</span>
                    )}
                </div>
                {isFolder && !isCollapsed && (
                    <div className="space-y-1">
                        {childKeys.map((key) => renderTreeNode(node.children[key], depth + 1, `${pathKey}/${key}`))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800 relative">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-300">Project Specs</h3>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{assetSpecs.length}</span>
                    <div className="flex items-center bg-slate-800/60 border border-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <List size={12} /> List
                        </button>
                        <button
                            onClick={() => setViewMode('tree')}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${viewMode === 'tree' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <Folder size={12} /> Tree
                        </button>
                        <button
                            onClick={() => setViewMode('tags')}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${viewMode === 'tags' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <Tag size={12} /> Tags
                        </button>
                    </div>

                    {/* Requests Indicator */}
                    {requests.length > 0 && (
                        <div className="flex items-center gap-2 ml-4 px-2 py-1 bg-slate-800/50 rounded border border-slate-700">
                            <FileText size={12} className="text-slate-400" />
                            <select
                                onChange={(e) => onImport && onImport(e.target.value)}
                                className="bg-transparent text-xs text-slate-300 outline-none w-32"
                                value=""
                            >
                                <option value="" disabled>Import Request ({requests.length})</option>
                                {requests.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowGptAssistant(true)}
                        className="flex items-center gap-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold transition-colors text-white mr-2"
                    >
                        <Wand2 size={14} /> AI Copilot
                    </button>

                    <button
                        onClick={handleBuildKit}
                        disabled={buildingKit}
                        className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold transition-colors text-white mr-2 disabled:opacity-50"
                    >
                        <Zap size={14} className={buildingKit ? "animate-spin" : ""} /> {buildingKit ? "Building..." : "Build Kit"}
                    </button>

                    <button onClick={toggleSelectAll} className="p-1 hover:bg-slate-800 rounded text-slate-400" title="Select All">
                        {assetSpecs.length > 0 && selectedSpecs.size === assetSpecs.length ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                    <button
                        onClick={() => {
                            if (!configSpec) {
                                setConfigSpec(getDefaultConfigSpec());
                            }
                            setShowSettings(!showSettings);
                        }}
                        className={`p-1 rounded transition-colors ${showSettings ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                        title="Project Settings"
                    >
                        <Settings size={16} />
                    </button>
                    <button onClick={fetchSpecs} className="p-1 hover:bg-slate-800 rounded text-slate-400" title="Refresh">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {showSettings && configSpec && (
                <div className="bg-slate-800 border-b border-slate-700 p-4 animate-slide-down">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-white">Global Style Config</h3>
                        <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Theme / Genre</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                                        value={configSpec.art_style?.theme || ""}
                                        onChange={(e) => {
                                            setConfigSpec({
                                                ...configSpec,
                                                art_style: {
                                                    ...configSpec.art_style,
                                                    theme: e.target.value,
                                                    // Auto-update keyword for legacy support
                                                    keyword: `${e.target.value} ${configSpec.art_style?.mode || ""}`.trim()
                                                }
                                            });
                                        }}
                                    >
                                        <option value="" disabled>Select Theme</option>
                                        <option value="cyberpunk">Cyberpunk (Neon, High Tech)</option>
                                        <option value="scifi">Sci-Fi (Space, Clean lines)</option>
                                        <option value="space_opera">Space Opera (Epic, Cosmic)</option>
                                        <option value="fantasy">Fantasy (Magic, Medieval)</option>
                                        <option value="nature">Nature (Organic, Green)</option>
                                        <option value="industrial">Industrial (Gritty, Mechanical)</option>
                                        <option value="horror">Horror (Dark, Eerie)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Render Style</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                                        value={configSpec.art_style?.mode || ""}
                                        onChange={(e) => {
                                            setConfigSpec({
                                                ...configSpec,
                                                art_style: {
                                                    ...configSpec.art_style,
                                                    mode: e.target.value,
                                                    // Auto-update keyword for legacy support
                                                    keyword: `${configSpec.art_style?.theme || ""} ${e.target.value}`.trim()
                                                }
                                            });
                                        }}
                                    >
                                        <option value="" disabled>Select Style</option>
                                        <option value="cartoon">Cartoon (Disney/Pixar)</option>
                                        <option value="anime">Anime (Cel shaded)</option>
                                        <option value="comic_book">Comic Book (Ink, Graphic Novel)</option>
                                        <option value="flat_vector">Flat Vector (Minimalist)</option>
                                        <option value="pixel_art">Pixel Art (Retro)</option>
                                        <option value="realistic">Photorealistic (3D)</option>
                                        <option value="watercolor">Watercolor (Artistic)</option>
                                        <option value="line_art">Line Art (Sketch)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Negative Prompt (Base)</label>
                        <textarea
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white h-20"
                                value={configSpec.prompts?.base_negative || ""}
                                onChange={(e) => {
                                    setConfigSpec({
                                        ...configSpec,
                                        prompts: { ...configSpec.prompts, base_negative: e.target.value }
                                    });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Palette</label>
                            <div className="grid grid-cols-2 gap-2">
                                {paletteKeys.map((key) => {
                                    const value = configSpec.art_style?.palette?.[key] || '';
                                    return (
                                        <div key={key} className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded p-2">
                                            <input
                                                type="color"
                                                className="h-6 w-6 rounded border border-slate-700 bg-transparent"
                                                value={value || '#000000'}
                                                onChange={(e) => updatePaletteColor(key, e.target.value)}
                                            />
                                            <div className="flex-1">
                                                <div className="text-[10px] uppercase text-slate-500">{key}</div>
                                                <input
                                                    className="w-full bg-transparent text-xs text-white outline-none font-mono"
                                                    value={value}
                                                    onChange={(e) => updatePaletteColor(key, e.target.value.trim())}
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Target Checkpoint</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                                value={selectedCheckpoint}
                                onChange={e => setSelectedCheckpoint(e.target.value)}
                            >
                                <option value="">Use Default (from project-style.json)</option>
                                {checkpoints.map(cp => (
                                    <option key={cp.id} value={cp.id}>{cp.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => handleUpdateSpec(configSpec)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-sm flex items-center gap-2"
                            >
                                <Save size={14} /> Save Global Styles
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {assetSpecs.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                        No specs defined.
                    </div>
                ) : viewMode === 'list' ? (
                    assetSpecs.map(spec => (
                        <div key={spec.id} className={`flex flex-col p-3 rounded-lg transition-colors group border border-transparent ${selectedSpecs.has(spec.id) ? 'bg-blue-900/20 border-blue-900/50' : 'bg-slate-800/50 hover:bg-slate-800'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <button onClick={() => toggleSelect(spec.id)} className="text-slate-500 hover:text-blue-400">
                                        {selectedSpecs.has(spec.id) ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} />}
                                    </button>

                                    <div className="min-w-[18px]" onMouseEnter={() => setHoveredSpec(spec)} onMouseLeave={() => setHoveredSpec(null)}>
                                        {spec.status === 'generated' ? (
                                            <CheckCircle size={18} className="text-green-500 cursor-help" />
                                        ) : (
                                            <Circle size={18} className="text-slate-600" />
                                        )}
                                    </div>

                                    <div className="truncate">
                                        <div className="font-medium text-slate-200 truncate" title={spec.name}>{spec.name}</div>
                                        <div className="text-xs text-slate-500 font-mono truncate flex items-center gap-2" title={spec.path}>
                                            <span className="truncate">{spec.path}</span>
                                            {spec.params?.size && (
                                                <span className="text-[10px] text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-700">
                                                    {spec.params.size}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            if (editingSpecId === spec.id) {
                                                setEditingSpecId(null);
                                            } else {
                                                setEditingSpecId(spec.id);
                                                setEditData({ domain: spec.domain, kit: spec.kit, role: spec.role });
                                            }
                                        }}
                                        className={`p-2 rounded-lg hover:bg-slate-700 transition-colors ${editingSpecId === spec.id ? 'text-blue-400' : 'text-slate-400'}`}
                                        title="Edit Tags"
                                    >
                                        <Settings size={14} />
                                    </button>
                                    <button
                                        onClick={() => setExpandedSpecId(expandedSpecId === spec.id ? null : spec.id)}
                                        className={`p-2 rounded-lg hover:bg-slate-700 transition-colors ${expandedSpecId === spec.id ? 'text-blue-400' : 'text-slate-400'}`}
                                        title="View Details"
                                    >
                                        <FileText size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleGenerate(spec)}
                                        className="p-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                        title="Open in Free Mode"
                                    >
                                        <Play size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details View */}
                            {expandedSpecId === spec.id && (
                                <div className="mt-3 ml-10 p-3 bg-slate-900 rounded border border-slate-700 text-xs font-mono text-slate-400 animate-slide-down">
                                    <div className="grid grid-cols-1 gap-3">
                                        {['default', ...checkpoints.map(cp => cp.id).filter(id => id !== 'default')].map((key) => (
                                            <div key={key}>
                                                <span className="font-bold text-slate-500 block mb-1">PROMPT ({getPromptLabel(key)}):</span>
                                                <textarea
                                                    value={getPromptValue(spec, key)}
                                                    onChange={(e) => setPromptValue(spec, key, e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none h-20"
                                                    placeholder={`Prompt for ${getPromptLabel(key)}...`}
                                                />
                                            </div>
                                        ))}
                                        <div>
                                            <span className="font-bold text-slate-500 block mb-1">NEGATIVE PROMPT:</span>
                                            <textarea
                                                value={getNegativeValue(spec)}
                                                onChange={(e) => setNegativeValue(spec, e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none h-16"
                                                placeholder="Negative prompt..."
                                            />
                                        </div>

                                        <div>
                                            <span className="font-bold text-slate-500 block mb-1">SIZE (WxH):</span>
                                            <input
                                                value={getSizeValue(spec)}
                                                onChange={(e) => setSizeValue(spec, e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                                                placeholder="1024x1024"
                                            />
                                        </div>
                                        
                                        {/* Animation Settings (for spritesheets) */}
                                        {spec.path?.includes('sheet') && (
                                            <div className="border-t border-slate-700 pt-3 mt-2">
                                                <span className="font-bold text-slate-500 block mb-2">ANIMATION SETTINGS:</span>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 uppercase">Frame Count</label>
                                                        <input
                                                            type="number"
                                                            value={spec.animation?.frameCount || 8}
                                                            onChange={(e) => {
                                                                const updated = {
                                                                    ...spec,
                                                                    animation: { ...(spec.animation || {}), frameCount: parseInt(e.target.value) || 8 }
                                                                };
                                                                handleUpdateSpec(updated);
                                                            }}
                                                            className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-slate-200"
                                                            min={1} max={32}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 uppercase">FPS</label>
                                                        <input
                                                            type="number"
                                                            value={spec.animation?.fps || 12}
                                                            onChange={(e) => {
                                                                const updated = {
                                                                    ...spec,
                                                                    animation: { ...(spec.animation || {}), fps: parseInt(e.target.value) || 12 }
                                                                };
                                                                handleUpdateSpec(updated);
                                                            }}
                                                            className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-slate-200"
                                                            min={1} max={60}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 uppercase">Loop</label>
                                                        <select
                                                            value={spec.animation?.loop !== false ? 'true' : 'false'}
                                                            onChange={(e) => {
                                                                const updated = {
                                                                    ...spec,
                                                                    animation: { ...(spec.animation || {}), loop: e.target.value === 'true' }
                                                                };
                                                                handleUpdateSpec(updated);
                                                            }}
                                                            className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-slate-200"
                                                        >
                                                            <option value="true">Yes</option>
                                                            <option value="false">No</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 uppercase">Type</label>
                                                        <select
                                                            value={spec.animation?.type || 'idle'}
                                                            onChange={(e) => {
                                                                const updated = {
                                                                    ...spec,
                                                                    animation: { ...(spec.animation || {}), type: e.target.value }
                                                                };
                                                                handleUpdateSpec(updated);
                                                            }}
                                                            className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-slate-200"
                                                        >
                                                            <option value="idle">Idle</option>
                                                            <option value="fly">Fly</option>
                                                            <option value="run">Run</option>
                                                            <option value="attack">Attack</option>
                                                            <option value="hit">Hit</option>
                                                            <option value="death">Death</option>
                                                            <option value="explode">Explode</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                {spec.animation?.promptHints && (
                                                    <div className="mt-2 p-2 bg-slate-950/50 rounded border border-slate-800">
                                                        <span className="text-[10px] text-slate-500 uppercase block mb-1">Prompt Hints:</span>
                                                        {spec.animation.promptHints.consistency && (
                                                            <p className="text-[10px] text-slate-400"><strong className="text-slate-500">Consistency:</strong> {spec.animation.promptHints.consistency}</p>
                                                        )}
                                                        {spec.animation.promptHints.motion && (
                                                            <p className="text-[10px] text-slate-400"><strong className="text-slate-500">Motion:</strong> {spec.animation.promptHints.motion}</p>
                                                        )}
                                                        {spec.animation.promptHints.technique && (
                                                            <p className="text-[10px] text-slate-400"><strong className="text-slate-500">Technique:</strong> {spec.animation.promptHints.technique}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="text-[10px] text-slate-500">ID: {spec.id}</div>
                                            <button
                                                onClick={() => handleSavePromptEdits(spec)}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold"
                                            >
                                                Save Prompts & Size
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tags / Edit Mode */}
                            <div className="mt-2 ml-10 flex flex-wrap gap-2 items-center">
                                {editingSpecId === spec.id ? (
                                    <>
                                        <select
                                            value={editData.domain}
                                            onChange={e => setEditData({ ...editData, domain: e.target.value })}
                                            className="bg-slate-900 border border-slate-700 rounded text-[10px] px-1 py-0.5 text-slate-300 outline-none"
                                        >
                                            <option value="cosmic">cosmic</option>
                                            <option value="ui">ui</option>
                                        </select>
                                        <input
                                            value={editData.kit}
                                            onChange={e => setEditData({ ...editData, kit: e.target.value })}
                                            placeholder="Kit (e.g. planet)"
                                            className="bg-slate-900 border border-slate-700 rounded text-[10px] px-1 py-0.5 text-slate-300 outline-none w-20"
                                        />
                                        <input
                                            value={editData.role}
                                            onChange={e => setEditData({ ...editData, role: e.target.value })}
                                            placeholder="Role"
                                            className="bg-slate-900 border border-slate-700 rounded text-[10px] px-1 py-0.5 text-slate-300 outline-none w-20"
                                        />
                                        <button
                                            onClick={() => handleUpdateSpec({ ...spec, ...editData })}
                                            className="p-1 bg-blue-600 hover:bg-blue-500 rounded text-white"
                                        >
                                            <Save size={10} />
                                        </button>
                                        <button
                                            onClick={() => setEditingSpecId(null)}
                                            className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400"
                                        >
                                            <X size={10} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {spec.domain && <span className="px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400 text-[10px] font-bold border border-purple-800/50 uppercase">{spec.domain}</span>}
                                        {spec.kit && <span className="px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 text-[10px] font-bold border border-blue-800/50 uppercase">{spec.kit}</span>}
                                        {spec.role && <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 text-[10px] font-bold border border-slate-600 uppercase">{spec.role}</span>}
                                        {!spec.domain && !spec.kit && !spec.role && <span className="text-[10px] text-slate-600 italic">No tags</span>}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : viewMode === 'tree' ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Tree Overview</span>
                            <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-200">Select All</button>
                        </div>
                        <div className="space-y-2">
                            {renderTreeNode(treeRoot, 0, '')}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Tag Containers</span>
                            <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-200">Select All</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {tagGroups.map((group) => {
                                const ids = group.specs.map(s => s.id);
                                const selectionState = getSelectionState(ids);
                                return (
                                    <div key={group.key} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleSelectIds(ids)}
                                                    className="text-slate-500 hover:text-blue-400"
                                                    title="Select container"
                                                >
                                                    {selectionState === 'all' && <CheckSquare size={16} className="text-blue-500" />}
                                                    {selectionState === 'some' && <MinusSquare size={16} className="text-blue-400" />}
                                                    {selectionState === 'none' && <Square size={16} />}
                                                </button>
                                                <span className="text-sm font-semibold text-slate-200">{group.key}</span>
                                            </div>
                                            <span className="text-xs text-slate-500">{group.specs.length}</span>
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            {group.specs.map(spec => (
                                                <div key={spec.id} className="flex items-center gap-2 text-xs text-slate-300">
                                                    <button
                                                        onClick={() => toggleSelect(spec.id)}
                                                        className="text-slate-500 hover:text-blue-400"
                                                        title="Select spec"
                                                    >
                                                        {selectedSpecs.has(spec.id) ? <CheckSquare size={14} className="text-blue-500" /> : <Square size={14} />}
                                                    </button>
                                                    <span className="truncate">{spec.name || spec.path}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Batch Toolbar */}
            {selectedSpecs.size > 0 && (
                <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-xl animate-slide-up">
                    <div className="flex items-center gap-4 justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <CheckSquare size={16} className="text-blue-400" />
                            <span>{selectedSpecs.size} selected</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={selectedCheckpoint}
                                onChange={(e) => setSelectedCheckpoint(e.target.value)}
                                className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 max-w-[150px]"
                            >
                                <option value="">Default Checkpoint</option>
                                {checkpoints.map(cp => (
                                    <option key={cp.id} value={cp.id}>{cp.label}</option>
                                ))}
                            </select>

                            <button
                                onClick={handleBatchGenerate}
                                disabled={!!batchProgress}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                            >
                                {batchProgress ? (
                                    <>
                                        <Loader size={14} className="animate-spin" />
                                        {batchProgress.current}/{batchProgress.total}
                                    </>
                                ) : (
                                    <>
                                        <Zap size={14} /> Generate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {batchProgress && (
                        <div className="mt-2 text-xs text-slate-400 truncate">
                            Generating: {batchProgress.currentName}...
                        </div>
                    )}
                </div>
            )}

            {/* Hover Preview Tooltip */}
            {hoveredSpec && hoveredSpec.status === 'generated' && (
                <div className="absolute z-50 pointer-events-none bg-black border border-slate-600 rounded-lg shadow-xl overflow-hidden animate-scale-in"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '256px',
                        height: '256px'
                    }}
                >
                    <img
                        src={`/${hoveredSpec.path}`}
                        alt="Preview"
                        className="w-full h-full object-contain bg-[url('/checker.png')] bg-repeat"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 text-center truncate">
                        {hoveredSpec.name}
                    </div>
                </div>
            )}

            {showGptAssistant && (
                <GptAssistant
                    specs={allSpecs}
                    onClose={() => setShowGptAssistant(false)}
                    onApplyChanges={handleApplyGptChanges}
                />
            )}
        </div>
    );
}
