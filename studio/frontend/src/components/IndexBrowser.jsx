import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Database, Music, Gamepad2, Image, Film, ChevronRight, ChevronDown, 
    CheckCircle, Circle, RefreshCw, Filter, Search, Volume2, Play, 
    Folder, FileImage, FileAudio, Square, Pause, Layers
} from 'lucide-react';

const INDEX_ICONS = {
    'zelos-asset-index': Image,
    'zelos-audio-index': Music,
    'zelos-minigame-asset-index': Gamepad2,
};

const CATEGORY_ICONS = {
    visual: Image,
    audio: Music,
    video: Film,
};

function getFormatIcon(format) {
    switch (format) {
        case 'wav':
        case 'ogg':
        case 'mp3':
            return FileAudio;
        case 'mp4':
        case 'webm':
            return Film;
        default:
            return FileImage;
    }
}

function isAudioFormat(format) {
    return ['wav', 'ogg', 'mp3'].includes(format);
}

function isImageFormat(format) {
    return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(format);
}

// Audio Player Component
function AudioPreview({ src, onClose }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [src]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (t) => {
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
            <audio 
                ref={audioRef}
                src={src}
                onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
                onEnded={() => setIsPlaying(false)}
            />
            <button onClick={togglePlay} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full">
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className="flex-1">
                <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                    />
                </div>
            </div>
            <span className="text-xs text-slate-400 min-w-[60px]">
                {formatTime(currentTime)} / {formatTime(duration || 0)}
            </span>
            <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
                <Square size={14} className="text-slate-400" />
            </button>
        </div>
    );
}

// Image Preview Component
function ImagePreview({ src, name, onClose }) {
    return (
        <div className="relative bg-slate-800 rounded-lg border border-slate-700 p-2">
            <button 
                onClick={onClose}
                className="absolute top-2 right-2 p-1 bg-slate-900/80 hover:bg-slate-700 rounded z-10"
            >
                <Square size={14} className="text-slate-400" />
            </button>
            <img 
                src={src} 
                alt={name} 
                className="max-w-full max-h-64 object-contain rounded"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="text-xs text-slate-400 mt-2 text-center truncate">{name}</div>
        </div>
    );
}

export default function IndexBrowser({ onSelectAsset, onOpenComposite }) {
    const [indexes, setIndexes] = useState([]);
    const [selectedIndexId, setSelectedIndexId] = useState(null);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, generated, planned
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [previewAsset, setPreviewAsset] = useState(null);

    useEffect(() => {
        fetchIndexes();
    }, []);

    const fetchIndexes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/indexes');
            const data = await res.json();
            setIndexes(data.indexes || []);
        } catch (e) {
            console.error('Failed to fetch indexes', e);
        } finally {
            setLoading(false);
        }
    };

    const loadIndex = async (indexId) => {
        setSelectedIndexId(indexId);
        setPreviewAsset(null);
        try {
            const res = await fetch(`/api/indexes/?id=${indexId}`);
            const data = await res.json();
            setExpandedIndex(data);
            // Expand all groups by default
            const groups = new Set();
            (data.entries || []).forEach(entry => {
                const group = entry.source_entry_id || 'misc';
                groups.add(group);
            });
            setExpandedGroups(groups);
        } catch (e) {
            console.error('Failed to load index', e);
        }
    };

    const handlePreview = (entry) => {
        if (entry.exists) {
            setPreviewAsset(entry);
        }
    };

    // Group entries by their source_entry_id
    const groupedEntries = useMemo(() => {
        if (!expandedIndex?.entries) return {};
        
        const filtered = expandedIndex.entries.filter(entry => {
            const matchesSearch = !searchTerm || 
                entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.path?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'generated' && entry.exists) ||
                (statusFilter === 'planned' && !entry.exists);
            
            return matchesSearch && matchesStatus;
        });
        
        const groups = {};
        filtered.forEach(entry => {
            const groupKey = entry.source_entry_id || 'misc';
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(entry);
        });
        
        return groups;
    }, [expandedIndex, searchTerm, statusFilter]);

    const toggleGroup = (groupKey) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupKey)) {
                next.delete(groupKey);
            } else {
                next.add(groupKey);
            }
            return next;
        });
    };

    const getGroupStats = (entries) => {
        const generated = entries.filter(e => e.exists).length;
        return { generated, total: entries.length };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400">
                <RefreshCw className="animate-spin mr-2" size={20} />
                Loading indexes...
            </div>
        );
    }

    return (
        <div className="h-full flex bg-slate-950">
            {/* Index List Sidebar */}
            <div className="w-72 border-r border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Database size={20} className="text-blue-400" />
                        Asset Indexes
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Pattern-based asset definitions
                    </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {indexes.map(index => {
                        const Icon = INDEX_ICONS[index.id] || Database;
                        const isSelected = selectedIndexId === index.id;
                        
                        return (
                            <button
                                key={index.id}
                                onClick={() => loadIndex(index.id)}
                                className={`w-full text-left p-3 rounded-lg transition-all ${
                                    isSelected 
                                        ? 'bg-blue-600 text-white' 
                                        : 'hover:bg-slate-800 text-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon size={18} />
                                    <span className="font-medium truncate">
                                        {index.id.replace('zelos-', '').replace('-index', '')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs mt-1 opacity-70">
                                    <span>{index.expanded_count} assets</span>
                                    <span className="text-green-400">
                                        {index.generated_count} ready
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {!expandedIndex ? (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <Database size={48} className="mx-auto mb-4 opacity-30" />
                            <p>Select an index to browse assets</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {expandedIndex.id}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {expandedIndex.stats.total} total • {' '}
                                        <span className="text-green-400">{expandedIndex.stats.generated} generated</span> • {' '}
                                        <span className="text-yellow-400">{expandedIndex.stats.planned} planned</span>
                                    </p>
                                </div>
                                <button 
                                    onClick={() => loadIndex(selectedIndexId)}
                                    className="p-2 hover:bg-slate-700 rounded"
                                >
                                    <RefreshCw size={18} className="text-slate-400" />
                                </button>
                            </div>
                            
                            {/* Filters */}
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search assets..."
                                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="generated">Generated</option>
                                    <option value="planned">Planned</option>
                                </select>
                            </div>

                            {/* Preview Panel */}
                            {previewAsset && (
                                <div className="mt-3">
                                    {isAudioFormat(previewAsset.format) ? (
                                        <AudioPreview 
                                            src={`/${previewAsset.path}`}
                                            onClose={() => setPreviewAsset(null)}
                                        />
                                    ) : isImageFormat(previewAsset.format) ? (
                                        <ImagePreview 
                                            src={`/${previewAsset.path}`}
                                            name={previewAsset.name}
                                            onClose={() => setPreviewAsset(null)}
                                        />
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Entry List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {Object.entries(groupedEntries).map(([groupKey, entries]) => {
                                const isExpanded = expandedGroups.has(groupKey);
                                const stats = getGroupStats(entries);
                                
                                return (
                                    <div key={groupKey} className="bg-slate-900/50 rounded-lg border border-slate-800">
                                        <button
                                            onClick={() => toggleGroup(groupKey)}
                                            className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                <Folder size={18} className="text-yellow-500" />
                                                <span className="font-medium text-white">{groupKey}</span>
                                                <span className="text-xs text-slate-500">({entries.length})</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-green-400">{stats.generated}</span>
                                                <span className="text-slate-600">/</span>
                                                <span className="text-slate-400">{stats.total}</span>
                                            </div>
                                        </button>
                                        
                                        {isExpanded && (
                                            <div className="px-3 pb-3 space-y-1">
                                                {entries.map((entry, idx) => {
                                                    const FormatIcon = getFormatIcon(entry.format);
                                                    const canPreview = entry.exists && (isAudioFormat(entry.format) || isImageFormat(entry.format));
                                                    
                                                    return (
                                                        <div
                                                            key={entry.id || idx}
                                                            className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 cursor-pointer group"
                                                        >
                                                            <div className={`w-2 h-2 rounded-full ${entry.exists ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                            <FormatIcon size={16} className="text-slate-500" />
                                                            <div 
                                                                className="flex-1 min-w-0"
                                                                onClick={() => onSelectAsset?.(entry)}
                                                            >
                                                                <div className="text-sm text-white truncate">{entry.name}</div>
                                                                <div className="text-xs text-slate-500 truncate">{entry.path}</div>
                                                            </div>
                                                            {entry.size && (
                                                                <span className="text-xs text-slate-600">{entry.size}</span>
                                                            )}
                                                        {canPreview && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handlePreview(entry);
                                                                    }}
                                                                    className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Preview"
                                                                >
                                                                    {isAudioFormat(entry.format) ? (
                                                                        <Volume2 size={14} />
                                                                    ) : (
                                                                        <Play size={14} />
                                                                    )}
                                                                </button>
                                                            )}
                                                            {entry.animation && (
                                                                <div className="hidden group-hover:flex items-center gap-1 text-[10px]">
                                                                    <span className="px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded border border-purple-700/50">
                                                                        {entry.animation.frameCount}f
                                                                    </span>
                                                                    <span className="px-1.5 py-0.5 bg-blue-900/50 text-blue-300 rounded border border-blue-700/50">
                                                                        {entry.animation.fps || 12}fps
                                                                    </span>
                                                                    {entry.animation.type && (
                                                                        <span className="px-1.5 py-0.5 bg-green-900/50 text-green-300 rounded border border-green-700/50">
                                                                            {entry.animation.type}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {entry.composite && (
                                                                <div className="hidden group-hover:flex items-center gap-1 text-[10px]">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onOpenComposite?.(entry.composite.group);
                                                                        }}
                                                                        className="p-1.5 bg-orange-600 hover:bg-orange-500 rounded"
                                                                        title={`Open ${entry.composite.group} composite viewer`}
                                                                    >
                                                                        <Layers size={14} />
                                                                    </button>
                                                                    <span className="px-1.5 py-0.5 bg-orange-900/50 text-orange-300 rounded border border-orange-700/50" title={entry.composite.description || ''}>
                                                                        {entry.composite.type}
                                                                    </span>
                                                                    {entry.composite.group && (
                                                                        <span className="px-1.5 py-0.5 bg-cyan-900/50 text-cyan-300 rounded border border-cyan-700/50">
                                                                            {entry.composite.group}
                                                                        </span>
                                                                    )}
                                                                    {entry.composite.layerOrder !== undefined && (
                                                                        <span className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded" title="Layer order">
                                                                            L{entry.composite.layerOrder}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {entry.vars && (
                                                                <div className="hidden group-hover:flex gap-1">
                                                                    {Object.entries(entry.vars).map(([k, v]) => (
                                                                        <span key={k} className="px-1.5 py-0.5 bg-slate-700 text-xs rounded text-slate-300">
                                                                            {v}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            
                            {Object.keys(groupedEntries).length === 0 && (
                                <div className="text-center py-12 text-slate-500">
                                    No assets match your filters
                                </div>
                            )}
                        </div>

                        {/* Lists Reference Panel */}
                        {expandedIndex.lists && Object.keys(expandedIndex.lists).length > 0 && (
                            <div className="border-t border-slate-800 bg-slate-900/30 p-4">
                                <h4 className="text-sm font-semibold text-slate-400 mb-2">Available Lists</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(expandedIndex.lists).slice(0, 10).map(([key, values]) => (
                                        <span 
                                            key={key}
                                            className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300"
                                            title={Array.isArray(values) ? values.join(', ') : String(values)}
                                        >
                                            {key} ({Array.isArray(values) ? values.length : '?'})
                                        </span>
                                    ))}
                                    {Object.keys(expandedIndex.lists).length > 10 && (
                                        <span className="px-2 py-1 text-xs text-slate-500">
                                            +{Object.keys(expandedIndex.lists).length - 10} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
