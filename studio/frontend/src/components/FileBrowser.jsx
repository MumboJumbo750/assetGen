import React, { useState, useEffect } from 'react';
import { Folder, Image as ImageIcon, FileText, AlertCircle, ArrowUp } from 'lucide-react';

export default function FileBrowser({ initialPath = '', onPathChange, onSelectFile, fileFilter }) {
    const [path, setPath] = useState(initialPath);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFiles(path);
    }, []);

    const fetchFiles = async (targetPath) => {
        setLoading(true);
        setError('');
        try {
            const query = targetPath ? `?path=${encodeURIComponent(targetPath)}` : '';
            const res = await fetch(`/api/list-files${query}`);
            if (!res.ok) throw new Error('Failed to fetch files');
            const json = await res.json();

            setFiles(json.files || []);

            const newPath = json.current_path || targetPath;
            setPath(newPath);
            if (onPathChange) onPathChange(newPath, json.files || []);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (newPath) => {
        fetchFiles(newPath);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Path Bar */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNavigate(path)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="C:/..."
                />
                <button
                    onClick={() => handleNavigate(path)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium"
                >
                    Go
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                {loading && <div className="text-center p-4 text-slate-500">Loading...</div>}

                {error && (
                    <div className="p-4 bg-red-500/20 text-red-300 rounded-lg mb-4 flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {files.map(f => {
                            const isImage = /\.(png|jpg|jpeg|webp)$/i.test(f.name);
                            const isFile = !f.is_dir;
                            const shouldShow = !fileFilter || f.is_dir || fileFilter(f);

                            if (!shouldShow) return null;

                            return (
                                <div
                                    key={`${f.path}-${f.name}`}
                                    onClick={() => {
                                        if (f.is_dir) handleNavigate(f.path);
                                        else if (onSelectFile) onSelectFile(f);
                                    }}
                                    className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 border transition-colors cursor-pointer group ${f.is_dir
                                        ? 'bg-slate-800/50 border-slate-700 hover:bg-blue-900/20 hover:border-blue-500/50'
                                        : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-700/50'
                                        }`}
                                >
                                    {f.name === '..' ? (
                                        <ArrowUp size={24} className="text-yellow-500/50 group-hover:text-yellow-400 mb-2" />
                                    ) : f.is_dir ? (
                                        <Folder size={32} className="text-blue-500/50 group-hover:text-blue-400 mb-2" />
                                    ) : isImage ? (
                                        <ImageIcon className="text-green-500/50 mb-2" />
                                    ) : (
                                        <FileText className="text-slate-500 mb-2" />
                                    )}
                                    <span className="text-xs text-center break-all line-clamp-2 text-slate-400 group-hover:text-white leading-tight">
                                        {f.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
