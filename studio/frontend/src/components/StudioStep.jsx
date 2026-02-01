import React, { useState } from 'react';
import { Play, Image as ImageIcon, Loader2 } from 'lucide-react';

import FileBrowser from './FileBrowser';

export default function StudioStep({ initialPath }) {
    const [path, setPath] = useState(initialPath || '');
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [logs, setLogs] = useState([]);

    const handleGenerate = async () => {
        if (!path) return;
        setGenerating(true);
        setError('');
        setResult(null);
        setLogs(prev => [...prev, `Starting generation for: ${path}`]);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: path })
            });
            const json = await res.json();

            if (json.status === 'success') {
                setResult(json.path);
                setLogs(prev => [...prev, `Success! Saved to ${json.path}`]);
            } else {
                setError(json.error || 'Unknown error');
                setLogs(prev => [...prev, `Error: ${json.error}`]);
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
            setLogs(prev => [...prev, `Network Error: ${err.message}`]);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="flex h-full gap-6 p-6">
            {/* Left Panel: Controls */}
            <div className="w-1/3 flex flex-col gap-6 min-h-0">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col flex-1 min-h-0">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ImageIcon className="text-blue-500" />
                        Asset Generator
                    </h2>

                    <div className="flex-1 flex flex-col gap-4 min-h-0">
                        <div className="flex-1 min-h-0">
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Select Asset File
                            </label>
                            <FileBrowser
                                initialPath={path}
                                onSelectFile={(f) => setPath(f.path)}
                                onPathChange={(p) => setPath(p)}
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4 text-xs font-mono text-slate-400 break-all">
                                Selected: {path || <span className="text-slate-600 italic">None</span>}
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating || !path}
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${generating
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20'
                                    }`}
                            >
                                {generating ? <Loader2 className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                                {generating ? 'Processing...' : 'Generate Asset'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Console Log */}
                <div className="flex-1 bg-black/50 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-auto text-slate-400">
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0">{log}</div>
                    ))}
                    {logs.length === 0 && <span className="opacity-50">System ready...</span>}
                </div>
            </div>

            {/* Right Panel: Preview */}
            <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                {result ? (
                    <div className="relative w-full h-full flex items-center justify-center p-8">
                        <img
                            src={`/api/image?path=${encodeURIComponent(result)}&t=${Date.now()}`}
                            alt="Generated Result"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-slate-700 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgyMHYyMEgwem0xMCAxMGgxMHYxMEgxMHoiIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')]"
                        />
                        <div className="absolute top-4 right-4 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
                            Generation Complete
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-600">
                        <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Preview will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
