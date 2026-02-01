import React, { useState, useEffect } from 'react';
import { Folder, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

export default function DatasetStep({ data, updateData, onNext }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // In a real app, we'd browse directories. For now, we list the current directory
    // or a specific test directory if backend supports navigation.
    // We'll simulate fetching for now if backend isn't reachable or mock it.

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async (path) => {
        setLoading(true);
        setError('');
        try {
            // Use provided path or current data.datasetPath (if empty, server defaults to '.')
            const query = path ? `?path=${encodeURIComponent(path)}` : '';
            const res = await fetch(`/api/list-files${query}`);
            if (!res.ok) throw new Error('Failed to fetch files');
            const json = await res.json();

            setFiles(json.files || []);
            // Update current path if returned by server
            if (json.current_path) {
                updateData({ datasetPath: json.current_path });
            }

            // Auto-detect images in this new path
            const images = (json.files || []).filter(f =>
                !f.is_dir && /\.(png|jpg|jpeg|webp)$/i.test(f.name)
            );
            // We don't automatically overwrite 'images' list unless explicit logic,
            // but for this simple wizard, let's say we select all in current folder.
            if (images.length > 0) {
                updateData({
                    datasetPath: json.current_path,
                    images: images.map(i => i.path)
                });
            } else {
                // Clear images if none in this folder, but keep path
                updateData({
                    datasetPath: json.current_path,
                    images: []
                });
            }

        } catch (err) {
            console.error(err);
            setError(err.message || 'Could not connect to backend file system.');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (path) => {
        fetchFiles(path);
    };

    const imageCount = (files || []).filter(f => !f.is_dir && /\.(png|jpg|jpeg|webp)$/i.test(f.name)).length;

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Dataset Selection</h2>
                <p className="text-slate-400">Navigate to the folder containing your training images.</p>
            </div>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={data.datasetPath}
                    onChange={(e) => updateData({ datasetPath: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleNavigate(data.datasetPath)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Search path..."
                />
                <button
                    onClick={() => handleNavigate(data.datasetPath)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium"
                >
                    Go
                </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                {loading && <div className="text-center p-4 text-slate-500">Loading...</div>}

                {error && (
                    <div className="p-4 bg-red-500/20 text-red-300 rounded-lg mb-4 flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {files.map(f => (
                            <div
                                key={`${f.path}-${f.name}`}
                                onClick={() => f.is_dir ? handleNavigate(f.path) : null}
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 border transition-colors cursor-pointer group ${f.is_dir
                                        ? 'bg-slate-800/50 border-slate-700 hover:bg-blue-900/20 hover:border-blue-500/50'
                                        : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                                    }`}
                            >
                                {f.name === '..' ? (
                                    <Folder size={32} className="text-yellow-500/50 group-hover:text-yellow-400 mb-2" />
                                ) : f.is_dir ? (
                                    <Folder size={32} className="text-blue-500/50 group-hover:text-blue-400 mb-2" />
                                ) : (
                                    /\.(png|jpg|jpeg|webp)$/i.test(f.name) ? (
                                        <ImageIcon className="text-green-500/50 mb-2" />
                                    ) : (
                                        <div className="p-2 bg-slate-700 rounded mb-2 text-xs">FILE</div>
                                    )
                                )}
                                <span className="text-xs text-center break-all line-clamp-2 text-slate-400 group-hover:text-white">
                                    {f.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-4 flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2">
                    {imageCount > 0 ? (
                        <>
                            <CheckCircle size={20} className="text-green-400" />
                            <span className="font-medium text-green-400">{imageCount} Images Selected</span>
                        </>
                    ) : (
                        <span className="text-slate-500">No images in current folder</span>
                    )}
                </div>

                <button
                    onClick={onNext}
                    disabled={imageCount === 0}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Confirm & Continue
                </button>
            </div>
        </div>
    );
}
