import React, { useState, useEffect } from 'react';
import { Save, Check, Image as ImageIcon, FileText } from 'lucide-react';

export default function TaggingStep({ data, updateData, onNext }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [caption, setCaption] = useState('');
    const [loadingCaption, setLoadingCaption] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentPath, setCurrentPath] = useState(''); // Path of .txt file

    const images = data.images || [];
    const selectedImage = images[selectedIndex];

    useEffect(() => {
        if (selectedImage) {
            fetchCaption(selectedImage);
        }
    }, [selectedImage]);

    const fetchCaption = async (imagePath) => {
        setLoadingCaption(true);
        setCaption('');
        try {
            const res = await fetch(`/api/read-caption?path=${encodeURIComponent(imagePath)}`);
            if (res.ok) {
                const json = await res.json();
                setCaption(json.content || '');
                setCurrentPath(json.path);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCaption(false);
        }
    };

    const handleSave = async () => {
        if (!currentPath) return;
        setSaving(true);
        try {
            await fetch('/api/save-caption', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: currentPath, content: caption })
            });
            // Optional: Show partial success or toast
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (images.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center">
                <h2 className="text-2xl font-bold mb-2">No Images Selected</h2>
                <p className="text-slate-400">Go back to the previous step and select a folder with images.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold">Image Tagging</h2>
                    <p className="text-slate-400 text-sm">Create description files for your training images.</p>
                </div>
                <button
                    onClick={onNext}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
                >
                    Continue to Config
                </button>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Sidebar List */}
                <div className="w-64 bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-slate-700 bg-slate-800/50 font-medium text-sm">
                        Images ({images.length})
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {images.map((img, idx) => (
                            <button
                                key={img}
                                onClick={() => setSelectedIndex(idx)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-colors flex items-center gap-2 ${idx === selectedIndex
                                        ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
                                        : 'hover:bg-slate-800 text-slate-400'
                                    }`}
                            >
                                <ImageIcon size={12} />
                                {img.split(/[\\/]/).pop()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Area */}
                <div className="flex-1 flex gap-6 min-h-0 bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                    {/* Image Preview */}
                    <div className="flex-1 flex items-center justify-center bg-black/20 rounded-lg overflow-hidden relative">
                        <img
                            src={`/api/image?path=${encodeURIComponent(selectedImage)}`}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>

                    {/* Editor */}
                    <div className="w-80 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-slate-400 border-b border-slate-700 pb-2">
                            <FileText size={18} />
                            <span className="font-semibold text-sm">Caption Editor</span>
                        </div>

                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Describe this image in detail (e.g., 'a photo of zelos character wearing armor, space background...')"
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${saving
                                    ? 'bg-slate-700 text-slate-400'
                                    : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                                }`}
                        >
                            {saving ? 'Saving...' : <><Save size={16} /> Save Caption</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
