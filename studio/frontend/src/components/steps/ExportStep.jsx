import React, { useState } from 'react';
import { Download, FileJson, Check } from 'lucide-react';

export default function ExportStep({ data }) {
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/save-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data.config)
            });
            if (res.ok) {
                setSuccess(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-4">Ready to Train!</h2>
                <p className="text-slate-300 max-w-lg mx-auto">
                    Your configuration is ready. Save the configuration file locally to start training with Kohya_ss or your preferred trainer.
                </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-md w-full text-left">
                <pre className="text-xs text-green-400 font-mono overflow-auto max-h-40 bg-slate-950 p-4 rounded-lg">
                    {JSON.stringify(data.config, null, 2)}
                </pre>
            </div>

            <button
                onClick={handleSave}
                disabled={saving || success}
                className={`px-8 py-3 rounded-full font-bold text-lg flex items-center gap-3 transition-all ${success
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 shadow-xl shadow-blue-500/20'
                    }`}
            >
                {success ? (
                    <>
                        <Check size={24} /> Saved Successfully
                    </>
                ) : (
                    <>
                        <FileJson size={24} />
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </>
                )}
            </button>
        </div>
    );
}
