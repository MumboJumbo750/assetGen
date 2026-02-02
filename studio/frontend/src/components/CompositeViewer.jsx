import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Layers, Eye, EyeOff, RefreshCw, ChevronDown, ChevronRight,
    Move, ZoomIn, ZoomOut, RotateCcw, Save, Edit3, X, Check,
    Image, Folder, ArrowUp, ArrowDown, Palette, Info, Copy, Sparkles
} from 'lucide-react';

// Layer visibility toggle
function LayerToggle({ layer, visible, onToggle, isBase }) {
    return (
        <button
            onClick={onToggle}
            className={`p-1.5 rounded transition-colors ${
                visible 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            } ${isBase ? 'ring-2 ring-cyan-500' : ''}`}
            title={visible ? 'Hide layer' : 'Show layer'}
        >
            {visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
    );
}

// Single layer item in the stack
function LayerItem({ entry, visible, onToggle, isBase, isSelected, onSelect, onMoveUp, onMoveDown }) {
    const layerOrder = entry.composite?.layerOrder ?? 0;
    const compositeType = entry.composite?.type || 'unknown';
    
    return (
        <div 
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer ${
                isSelected 
                    ? 'bg-blue-900/50 border border-blue-600' 
                    : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
            }`}
            onClick={onSelect}
        >
            <LayerToggle 
                layer={entry} 
                visible={visible} 
                onToggle={(e) => { e.stopPropagation(); onToggle(); }}
                isBase={isBase}
            />
            
            <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{entry.name}</div>
                <div className="flex items-center gap-2 text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded ${
                        isBase ? 'bg-cyan-900/50 text-cyan-300' : 'bg-orange-900/50 text-orange-300'
                    }`}>
                        {compositeType}
                    </span>
                    <span className="text-slate-500">L{layerOrder}</span>
                </div>
            </div>
            
            {!isBase && (
                <div className="flex flex-col gap-0.5">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
                        className="p-0.5 text-slate-500 hover:text-white rounded hover:bg-slate-700"
                    >
                        <ArrowUp size={12} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
                        className="p-0.5 text-slate-500 hover:text-white rounded hover:bg-slate-700"
                    >
                        <ArrowDown size={12} />
                    </button>
                </div>
            )}
        </div>
    );
}

// Composite canvas with stacked layers
function CompositeCanvas({ layers, zoom, offset, onOffsetChange }) {
    const canvasRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };
    
    const handleMouseMove = (e) => {
        if (isDragging) {
            onOffsetChange({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };
    
    const handleMouseUp = () => {
        setIsDragging(false);
    };
    
    return (
        <div 
            ref={canvasRef}
            className="relative w-full h-full overflow-hidden bg-slate-900 cursor-move"
            style={{ 
                backgroundImage: 'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    transformOrigin: 'center'
                }}
            >
                {/* Render layers from bottom to top */}
                {layers.map((layer, idx) => (
                    <img
                        key={layer.entry.id + '-' + idx}
                        src={`/${layer.entry.path}`}
                        alt={layer.entry.name}
                        className="absolute max-w-none"
                        style={{
                            opacity: layer.visible ? (layer.opacity ?? 1) : 0,
                            zIndex: layer.entry.composite?.layerOrder ?? idx,
                            transition: 'opacity 0.2s ease'
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ))}
            </div>
            
            {/* Zoom indicator */}
            <div className="absolute bottom-4 right-4 px-2 py-1 bg-slate-800/80 rounded text-xs text-slate-300">
                {Math.round(zoom * 100)}%
            </div>
        </div>
    );
}

// Details panel for selected layer
function LayerDetails({ entry, compositeTypes, onUpdate }) {
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [showPromptTemplate, setShowPromptTemplate] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    
    useEffect(() => {
        if (entry) {
            setEditData({
                compositeType: entry.composite?.type || '',
                compositeGroup: entry.composite?.group || '',
            });
        }
    }, [entry]);
    
    if (!entry) {
        return (
            <div className="p-4 text-center text-slate-500">
                <Info size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a layer to view details</p>
            </div>
        );
    }
    
    const comp = entry.composite || {};
    const typeInfo = compositeTypes?.[comp.type] || {};
    const promptTemplate = typeInfo.promptTemplate;
    
    const copyToClipboard = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    };
    
    const renderVariables = (variables) => {
        if (!variables) return null;
        return (
            <div className="mt-2 space-y-2">
                {Object.entries(variables).map(([varName, values]) => (
                    <div key={varName} className="bg-slate-900/50 rounded p-2">
                        <div className="text-[10px] text-cyan-400 font-mono mb-1">{`{${varName}}`}</div>
                        {typeof values === 'object' && !Array.isArray(values) ? (
                            <div className="space-y-1 text-[11px]">
                                {Object.entries(values).map(([key, desc]) => (
                                    <div key={key} className="flex gap-2">
                                        <span className="text-orange-300 font-semibold shrink-0">{key}:</span>
                                        <span className="text-slate-400">{desc}</span>
                                    </div>
                                ))}
                            </div>
                        ) : Array.isArray(values) ? (
                            <div className="flex flex-wrap gap-1">
                                {values.map(v => (
                                    <span key={v} className="px-1.5 py-0.5 bg-slate-700 rounded text-[11px] text-slate-300">
                                        {v}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-[11px] text-slate-400 italic">{values}</div>
                        )}
                    </div>
                ))}
            </div>
        );
    };
    
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white truncate">{entry.name}</h4>
                <button
                    onClick={() => setEditing(!editing)}
                    className={`p-1.5 rounded ${editing ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                >
                    {editing ? <X size={14} /> : <Edit3 size={14} />}
                </button>
            </div>
            
            <div className="text-xs text-slate-500 font-mono truncate">{entry.path}</div>
            
            {editing ? (
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase block mb-1">Composite Type</label>
                        <select
                            value={editData.compositeType}
                            onChange={(e) => setEditData({ ...editData, compositeType: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                        >
                            <option value="">None</option>
                            {Object.keys(compositeTypes || {}).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase block mb-1">Composite Group</label>
                        <input
                            value={editData.compositeGroup}
                            onChange={(e) => setEditData({ ...editData, compositeGroup: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                            placeholder="e.g., astro-duck, planet"
                        />
                    </div>
                    <button
                        onClick={() => {
                            onUpdate?.(entry, editData);
                            setEditing(false);
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm font-semibold flex items-center justify-center gap-2"
                    >
                        <Check size={14} /> Save Changes
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-800/50 rounded p-2">
                            <div className="text-slate-500 uppercase text-[10px]">Type</div>
                            <div className="text-white">{comp.type || 'none'}</div>
                        </div>
                        <div className="bg-slate-800/50 rounded p-2">
                            <div className="text-slate-500 uppercase text-[10px]">Group</div>
                            <div className="text-white">{comp.group || 'none'}</div>
                        </div>
                        <div className="bg-slate-800/50 rounded p-2">
                            <div className="text-slate-500 uppercase text-[10px]">Layer Order</div>
                            <div className="text-white">{comp.layerOrder ?? 0}</div>
                        </div>
                        <div className="bg-slate-800/50 rounded p-2">
                            <div className="text-slate-500 uppercase text-[10px]">Size</div>
                            <div className="text-white">{entry.size || 'auto'}</div>
                        </div>
                    </div>
                    
                    {comp.over && comp.over.length > 0 && (
                        <div className="bg-slate-800/50 rounded p-2">
                            <div className="text-slate-500 uppercase text-[10px] mb-1">Composites Over</div>
                            <div className="flex flex-wrap gap-1">
                                {comp.over.map(id => (
                                    <span key={id} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                                        {id}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {typeInfo.description && (
                        <div className="bg-slate-800/50 rounded p-2">
                            <div className="text-slate-500 uppercase text-[10px] mb-1">Description</div>
                            <div className="text-xs text-slate-300">{typeInfo.description}</div>
                        </div>
                    )}
                    
                    {comp.promptHints && (
                        <div className="bg-slate-800/50 rounded p-2">
                            <div className="text-slate-500 uppercase text-[10px] mb-1">Prompt Hints</div>
                            <div className="space-y-1 text-xs">
                                {Object.entries(comp.promptHints).map(([key, value]) => (
                                    <div key={key}>
                                        <span className="text-slate-400 font-semibold">{key}:</span>{' '}
                                        <span className="text-slate-300">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Prompt Template Section */}
                    {promptTemplate && (
                        <div className="border border-slate-700 rounded overflow-hidden">
                            <button
                                onClick={() => setShowPromptTemplate(!showPromptTemplate)}
                                className="w-full flex items-center justify-between p-2 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 hover:from-purple-900/50 hover:to-cyan-900/50 transition-colors"
                            >
                                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                                    <Sparkles size={14} className="text-cyan-400" />
                                    Prompt Template
                                </span>
                                {showPromptTemplate ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            
                            {showPromptTemplate && (
                                <div className="p-3 space-y-3 bg-slate-900/50">
                                    {/* Positive Prompt */}
                                    {promptTemplate.positive && (
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] text-green-400 uppercase font-semibold">Positive</span>
                                                <button
                                                    onClick={() => copyToClipboard(promptTemplate.positive, 'positive')}
                                                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                                                    title="Copy to clipboard"
                                                >
                                                    {copiedField === 'positive' ? (
                                                        <Check size={12} className="text-green-400" />
                                                    ) : (
                                                        <Copy size={12} className="text-slate-400" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="text-[11px] text-slate-300 bg-slate-800 rounded p-2 font-mono leading-relaxed whitespace-pre-wrap break-words">
                                                {promptTemplate.positive}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Negative Prompt */}
                                    {promptTemplate.negative && (
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] text-red-400 uppercase font-semibold">Negative</span>
                                                <button
                                                    onClick={() => copyToClipboard(promptTemplate.negative, 'negative')}
                                                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                                                    title="Copy to clipboard"
                                                >
                                                    {copiedField === 'negative' ? (
                                                        <Check size={12} className="text-green-400" />
                                                    ) : (
                                                        <Copy size={12} className="text-slate-400" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="text-[11px] text-slate-400 bg-slate-800 rounded p-2 font-mono leading-relaxed whitespace-pre-wrap break-words">
                                                {promptTemplate.negative}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Variables */}
                                    {promptTemplate.variables && (
                                        <div>
                                            <div className="text-[10px] text-orange-400 uppercase font-semibold mb-1">Variables</div>
                                            {renderVariables(promptTemplate.variables)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function CompositeViewer({ onClose, initialGroup }) {
    const [indexes, setIndexes] = useState([]);
    const [selectedIndexId, setSelectedIndexId] = useState(null);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Composite groups found in the index
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupedEntries, setGroupedEntries] = useState({});
    const [pendingInitialGroup, setPendingInitialGroup] = useState(initialGroup);
    
    // Layer stack state
    const [layerStack, setLayerStack] = useState([]);
    const [selectedLayerId, setSelectedLayerId] = useState(null);
    
    // Canvas state
    const [zoom, setZoom] = useState(0.5);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    
    // Handle initialGroup changes
    useEffect(() => {
        if (initialGroup) {
            setPendingInitialGroup(initialGroup);
        }
    }, [initialGroup]);
    
    // Fetch indexes on mount
    useEffect(() => {
        fetchIndexes();
    }, []);
    
    const fetchIndexes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/indexes');
            const data = await res.json();
            setIndexes(data.indexes || []);
            // Auto-select first index
            if (data.indexes?.length > 0) {
                loadIndex(data.indexes[0].id);
            }
        } catch (e) {
            console.error('Failed to fetch indexes:', e);
        } finally {
            setLoading(false);
        }
    };
    
    const loadIndex = async (indexId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/indexes/?id=${indexId}`);
            const data = await res.json();
            setSelectedIndexId(indexId);
            setExpandedIndex(data);
            
            // Group entries by compositeGroup
            const groups = {};
            (data.entries || []).forEach(entry => {
                const group = entry.composite?.group;
                if (group) {
                    if (!groups[group]) {
                        groups[group] = { bases: [], overlays: [] };
                    }
                    const isBase = entry.composite?.type === 'base' || entry.composite?.type === 'pose';
                    if (isBase) {
                        groups[group].bases.push(entry);
                    } else {
                        groups[group].overlays.push(entry);
                    }
                }
            });
            
            setGroupedEntries(groups);
            
            // Auto-select group (prefer pending initial group if set)
            const groupNames = Object.keys(groups);
            if (groupNames.length > 0) {
                if (pendingInitialGroup && groupNames.includes(pendingInitialGroup)) {
                    selectGroup(pendingInitialGroup, groups);
                    setPendingInitialGroup(null);
                } else {
                    selectGroup(groupNames[0], groups);
                }
            }
        } catch (e) {
            console.error('Failed to load index:', e);
        } finally {
            setLoading(false);
        }
    };
    
    const selectGroup = (groupName, groups = groupedEntries) => {
        setSelectedGroup(groupName);
        const group = groups[groupName];
        if (group) {
            // Build initial layer stack with first base visible
            const stack = [];
            
            // Add bases (only first one visible)
            group.bases.forEach((entry, idx) => {
                stack.push({ entry, visible: idx === 0 && entry.exists, opacity: 1 });
            });
            
            // Add overlays sorted by layer order (all hidden initially)
            const sortedOverlays = [...group.overlays].sort(
                (a, b) => (a.composite?.layerOrder || 0) - (b.composite?.layerOrder || 0)
            );
            sortedOverlays.forEach(entry => {
                stack.push({ entry, visible: false, opacity: 1 });
            });
            
            setLayerStack(stack);
            setSelectedLayerId(null);
        }
    };
    
    const toggleLayerVisibility = (layerIdx) => {
        setLayerStack(prev => prev.map((layer, idx) => 
            idx === layerIdx ? { ...layer, visible: !layer.visible } : layer
        ));
    };
    
    const selectLayer = (layerId) => {
        setSelectedLayerId(layerId);
    };
    
    const moveLayer = (layerIdx, direction) => {
        const newStack = [...layerStack];
        const targetIdx = layerIdx + direction;
        if (targetIdx >= 0 && targetIdx < newStack.length) {
            [newStack[layerIdx], newStack[targetIdx]] = [newStack[targetIdx], newStack[layerIdx]];
            setLayerStack(newStack);
        }
    };
    
    const selectedEntry = useMemo(() => {
        return layerStack.find(l => l.entry.id === selectedLayerId)?.entry;
    }, [layerStack, selectedLayerId]);
    
    const handleUpdateEntry = async (entry, updates) => {
        // This would call backend API to update the entry
        console.log('Update entry:', entry.id, updates);
        // For now just log - would need API endpoint to persist
    };
    
    const resetView = () => {
        setZoom(0.5);
        setOffset({ x: 0, y: 0 });
    };
    
    // Visible layers for rendering
    const visibleLayers = useMemo(() => {
        return layerStack.filter(l => l.entry.exists);
    }, [layerStack]);
    
    if (loading && !expandedIndex) {
        return (
            <div className="h-full flex items-center justify-center text-slate-400">
                <RefreshCw className="animate-spin mr-2" size={20} />
                Loading...
            </div>
        );
    }
    
    return (
        <div className="h-full flex bg-slate-950">
            {/* Left sidebar - Groups & Layer Stack */}
            <div className="w-72 border-r border-slate-800 flex flex-col">
                {/* Index selector */}
                <div className="p-3 border-b border-slate-800">
                    <select
                        value={selectedIndexId || ''}
                        onChange={(e) => loadIndex(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                    >
                        {indexes.map(idx => (
                            <option key={idx.id} value={idx.id}>
                                {idx.id.replace('zelos-', '').replace('-index', '')}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Composite Groups */}
                <div className="p-3 border-b border-slate-800">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Composite Groups</h3>
                    <div className="flex flex-wrap gap-1">
                        {Object.keys(groupedEntries).map(groupName => (
                            <button
                                key={groupName}
                                onClick={() => selectGroup(groupName)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                    selectedGroup === groupName
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                            >
                                {groupName}
                            </button>
                        ))}
                    </div>
                    {Object.keys(groupedEntries).length === 0 && (
                        <p className="text-xs text-slate-500">No composite groups found</p>
                    )}
                </div>
                
                {/* Layer Stack */}
                <div className="flex-1 overflow-y-auto p-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-2">
                        <Layers size={14} />
                        Layer Stack
                    </h3>
                    
                    {layerStack.length === 0 ? (
                        <p className="text-xs text-slate-500">Select a composite group</p>
                    ) : (
                        <div className="space-y-1">
                            {/* Render from top to bottom (reversed layer order) */}
                            {[...layerStack].reverse().map((layer, revIdx) => {
                                const idx = layerStack.length - 1 - revIdx;
                                const isBase = layer.entry.composite?.type === 'base' || layer.entry.composite?.type === 'pose';
                                return (
                                    <LayerItem
                                        key={layer.entry.id}
                                        entry={layer.entry}
                                        visible={layer.visible}
                                        onToggle={() => toggleLayerVisibility(idx)}
                                        isBase={isBase}
                                        isSelected={selectedLayerId === layer.entry.id}
                                        onSelect={() => selectLayer(layer.entry.id)}
                                        onMoveUp={() => moveLayer(idx, 1)}
                                        onMoveDown={() => moveLayer(idx, -1)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
                
                {/* Quick actions */}
                <div className="p-3 border-t border-slate-800 flex gap-2">
                    <button
                        onClick={() => setLayerStack(prev => prev.map(l => ({ ...l, visible: l.entry.composite?.type === 'base' })))}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300"
                    >
                        Base Only
                    </button>
                    <button
                        onClick={() => setLayerStack(prev => prev.map(l => ({ ...l, visible: l.entry.exists })))}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300"
                    >
                        Show All
                    </button>
                </div>
            </div>
            
            {/* Main canvas area */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Layers size={18} className="text-blue-400" />
                        <span className="font-semibold text-white">
                            {selectedGroup ? `${selectedGroup} Composite` : 'Composite Viewer'}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-400"
                        >
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-sm text-slate-400 min-w-[50px] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={() => setZoom(z => Math.min(3, z + 0.1))}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-400"
                        >
                            <ZoomIn size={16} />
                        </button>
                        <button
                            onClick={resetView}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-400"
                            title="Reset view"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>
                
                {/* Canvas */}
                <div className="flex-1 relative">
                    <CompositeCanvas
                        layers={visibleLayers}
                        zoom={zoom}
                        offset={offset}
                        onOffsetChange={setOffset}
                    />
                    
                    {/* Missing asset indicator */}
                    {layerStack.some(l => l.visible && !l.entry.exists) && (
                        <div className="absolute top-4 left-4 px-3 py-2 bg-yellow-900/80 border border-yellow-600 rounded text-yellow-200 text-xs">
                            Some visible layers have missing assets
                        </div>
                    )}
                </div>
            </div>
            
            {/* Right sidebar - Layer Details */}
            <div className="w-80 border-l border-slate-800 flex flex-col">
                <div className="h-12 border-b border-slate-800 flex items-center px-4">
                    <h3 className="font-semibold text-white">Layer Details</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <LayerDetails
                        entry={selectedEntry}
                        compositeTypes={expandedIndex?.compositeTypes}
                        onUpdate={handleUpdateEntry}
                    />
                </div>
            </div>
        </div>
    );
}
