import React from 'react';
import { Settings, Save } from 'lucide-react';

export default function ConfigStep({ data, updateData, onNext }) {
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        updateData({
            config: {
                ...data.config,
                [name]: type === 'number' ? parseFloat(value) : value
            }
        });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Training Configuration</h2>
                <p className="text-slate-400">Fine-tune your LoRA parameters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Model Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                        <Settings size={18} /> Model Settings
                    </h3>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">LoRA Name</label>
                        <input
                            type="text"
                            name="modelName"
                            value={data.config.modelName}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="my-character-lora"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Base Model</label>
                        <input
                            type="text"
                            name="baseModel"
                            value={data.config.baseModel}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Training Params */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                        <Save size={18} /> Training Parameters
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Resolution</label>
                            <select
                                name="resolution"
                                value={data.config.resolution}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value={512}>512x512 (SD1.5)</option>
                                <option value={768}>768x768 (SD2)</option>
                                <option value={1024}>1024x1024 (SDXL)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Batch Size</label>
                            <input
                                type="number"
                                name="batchSize"
                                value={data.config.batchSize}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Learning Rate</label>
                        <input
                            type="number"
                            step="0.0001"
                            name="learningRate"
                            value={data.config.learningRate}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 flex justify-end">
                <button
                    onClick={onNext}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
                >
                    Next: Review & Export
                </button>
            </div>
        </div>
    );
}
