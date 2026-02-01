import React from 'react';
import FileBrowser from '../FileBrowser';
import { CheckCircle } from 'lucide-react';

export default function DatasetStep({ data, updateData, onNext }) {

    const handlePathChange = (newPath, files) => {
        // Auto-detect images
        const images = (files || []).filter(f =>
            !f.is_dir && /\.(png|jpg|jpeg|webp)$/i.test(f.name)
        );

        updateData({
            datasetPath: newPath,
            images: images.map(i => i.path) // Store full paths
        });
    };

    const imageCount = (data.images || []).length;

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">Dataset Selection</h2>
                <p className="text-slate-400">Navigate to the folder containing your training images.</p>
            </div>

            <div className="flex-1 min-h-0 mb-4">
                <FileBrowser
                    initialPath={data.datasetPath}
                    onPathChange={handlePathChange}
                />
            </div>

            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700">
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
