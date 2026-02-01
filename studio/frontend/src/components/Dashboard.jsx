import React, { useState, useEffect } from 'react';
import { Layers, Activity, AlertCircle, CheckCircle, Package, ArrowRight, RefreshCw, Box } from 'lucide-react';

export default function Dashboard({ onNavigateToStudio }) {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const json = await res.json();
            setProjects(json.projects || []);
        } catch (err) {
            console.error(err);
        }
    };

    const loadProjectStatus = async (projectPath) => {
        setLoading(true);
        setStatus(null);
        try {
            const res = await fetch('/api/project-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: projectPath })
            });
            const json = await res.json();
            setStatus(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAsset = async (relPath) => {
        // Switch to Studio tab and prepopulate
        if (onNavigateToStudio) {
            onNavigateToStudio(relPath);
        }
    };

    return (
        <div className="h-full flex flex-col p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Activity className="text-blue-500" />
                    Workflow Dashboard
                </h1>
                <p className="text-slate-400 mt-2">Manage your asset generation pipelines across multiple projects.</p>
            </header>

            {!selectedProject ? (
                // Project Selector
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(p => (
                        <div
                            key={p.id}
                            onClick={() => { setSelectedProject(p); loadProjectStatus(p.path); }}
                            className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20">
                                <Package className="text-blue-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                            <div className="flex items-center text-sm text-slate-500 gap-1">
                                <code className="bg-slate-950 px-1 py-0.5 rounded text-xs">{p.id}</code>
                            </div>
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No project definitions found in <code>specs/</code>.
                        </div>
                    )}
                </div>
            ) : (
                // Project Detail
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => { setSelectedProject(null); setStatus(null); }}
                            className="text-slate-400 hover:text-white text-sm"
                        >
                            ← Back to Projects
                        </button>
                        <div className="h-6 w-px bg-slate-800"></div>
                        <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                        <button
                            onClick={() => loadProjectStatus(selectedProject.path)}
                            className="ml-auto p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                            title="Refresh Status"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>

                    {loading && (
                        <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-4">
                            <RefreshCw className="animate-spin text-blue-500" size={48} />
                            <p>Analyzing project assets...</p>
                        </div>
                    )}

                    {!loading && status && (
                        <div className="flex-1 flex gap-6 min-h-0">
                            {/* Stats */}
                            <div className="w-64 space-y-4 shrink-0">
                                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                                    <div className="text-slate-400 text-sm mb-1">Completion</div>
                                    <div className="text-3xl font-bold text-white mb-2">
                                        {Math.round((status.present / status.checked) * 100)}%
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-green-500 h-full"
                                            style={{ width: `${(status.present / status.checked) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-2 text-xs text-slate-500 flex justification-between">
                                        <span>{status.present} done</span>
                                        <span>{status.checked} total</span>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                                    <div className="text-slate-400 text-sm mb-1">Missing Assets</div>
                                    <div className="text-3xl font-bold text-red-400 mb-2">
                                        {status.missing.length}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Requires Generation
                                    </div>
                                </div>
                            </div>

                            {/* Missing List */}
                            <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl flex flex-col min-h-0">
                                <div className="p-4 border-b border-slate-800 font-bold flex items-center gap-2">
                                    <AlertCircle size={18} className="text-red-400" />
                                    Missing Assets
                                </div>
                                <div className="flex-1 overflow-auto p-2 space-y-1">
                                    {status.missing.map(m => (
                                        <div
                                            key={m.rel_path}
                                            className="group flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-transparent hover:border-slate-700 hover:bg-slate-900 transition-all"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <Box size={16} className="text-slate-600 group-hover:text-blue-400 shrink-0" />
                                                <span className="font-mono text-sm text-slate-300 truncate" title={m.rel_path}>
                                                    {m.rel_path}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleGenerateAsset(m.rel_path)}
                                                className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition-all shadow-lg shadow-blue-900/20"
                                            >
                                                Generate <ArrowRight size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {status.missing.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                            <CheckCircle size={48} className="text-green-500/20 mb-4" />
                                            <p>All assets generated!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
