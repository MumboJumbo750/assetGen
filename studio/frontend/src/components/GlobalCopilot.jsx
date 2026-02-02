import React, { useState, useEffect, useRef } from 'react';
import { Copy, Wand2, X, MessageSquare, Briefcase, ChevronRight, Check } from 'lucide-react';

export default function GlobalCopilot({ activeTab, activeProject, isOpen, onClose }) {
    const [mode, setMode] = useState('chat'); // 'chat' (general), 'task' (specific)
    const [promptText, setPromptText] = useState("");
    const [responseText, setResponseText] = useState("");
    const [loading, setLoading] = useState(false);
    const [customInstruction, setCustomInstruction] = useState("");

    // Auto-open on first visit? Maybe not.

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => {
            if (e.key === 'Escape' && onClose) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const buildPrompt = async () => {
        setLoading(true);
        try {
            // 1. Get Base Context
            const resContext = await fetch('/api/context');
            const dataContext = await resContext.json();
            let baseContext = dataContext.context || "";

            let finalPrompt = "";

            // 2. Add Specific Context based on Tab
            if (activeTab === 'dashboard') {
                finalPrompt = `
ACT: Expert Project Manager for 'Zelos'.
CONTEXT:
${baseContext.slice(0, 2000)}...

TASK:
Review the project status.
${customInstruction ? `USER INSTRUCTION: ${customInstruction}` : "Suggest 3 high-impact tasks to improve the asset pipeline based on the current domain model."}
`;
            } else if (activeTab === 'free') {
                finalPrompt = `
ACT: Expert Stable Diffusion Prompt Engineer.
CONTEXT:
${baseContext.slice(0, 1000)}...

TASK:
Create a high-quality prompt for a new asset.
${customInstruction ? `USER INSTRUCTION: ${customInstruction}` : "Suggest a prompt for a 'cyberpunk street vendor' in the style of Zelos."}
`;
            } else if (activeTab === 'preview') {
                finalPrompt = `
ACT: Game QA and Visual Designer.
CONTEXT:
${baseContext.slice(0, 1000)}...

TASK:
Critique the visual consistency of the assets.
${customInstruction ? `USER INSTRUCTION: ${customInstruction}` : "What would be the best way to test the 'astroDuck' animations in this preview stage?"}
`;
            } else if (activeTab === 'training') {
                finalPrompt = `
ACT: LoRA Training Data Specialist.
CONTEXT:
${baseContext.slice(0, 1000)}...

TASK:
Help with tagging and dataset preparation.
${customInstruction ? `USER INSTRUCTION: ${customInstruction}` : "Suggest a caption style for a 'space-marine' LoRA based on the project style."}
`;
            } else {
                // Default Spec Manager Mode (replicates GptAssistant)
                const resSpecs = await fetch('/api/specs');
                const dataSpecs = await resSpecs.json();
                const specs = dataSpecs.specs || [];

                const specsJson = JSON.stringify(specs.slice(0, 50).map(s => ({
                    id: s.id, name: s.name, kit: s.kit, role: s.role
                })), null, 2); // Limit for context window

                finalPrompt = `
ACT: Asset Manager.
CONTEXT:
${baseContext.slice(0, 1500)}...

DATA:
${specsJson}

TASK:
Manage these specs.
${customInstruction ? `USER INSTRUCTION: ${customInstruction}` : "Analyze these specs for consistency."}
`;
            }

            setPromptText(finalPrompt.trim());
        } catch (e) {
            console.error(e);
            alert("Failed to build prompt");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(promptText);
        alert("Prompt copied to clipboard!");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 right-0 h-full w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-[60] flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
                <div className="flex items-center gap-2">
                    <Wand2 className="text-indigo-400" size={20} />
                    <div>
                        <h3 className="font-bold text-white">Zelos Copilot</h3>
                        <div className="text-xs text-slate-500 uppercase flex items-center gap-1">
                            {activeTab} Mode <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Context Card */}
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Current Context</h4>
                    <p className="text-sm text-slate-300">
                        I am aware you are in <span className="text-indigo-400 font-bold">{activeTab}</span>.
                        I can help you specialize tasks for this view.
                    </p>
                    {activeTab === 'studio' && (
                        <div className="mt-2 text-xs text-orange-400 bg-orange-900/20 p-2 rounded border border-orange-900/50 flex items-start gap-2">
                            <Briefcase size={14} className="mt-0.5 shrink-0" />
                            For applying batch updates to specs, use the dedicated "AI Copilot" button in the Studio toolbar.
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Your Instruction</label>
                    <textarea
                        className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                        placeholder="Describe what you want to do..."
                        value={customInstruction}
                        onChange={e => setCustomInstruction(e.target.value)}
                    />
                    <button
                        onClick={buildPrompt}
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {loading ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <MessageSquare size={16} />}
                        Generate Prompt
                    </button>
                </div>

                {/* Prompt Output */}
                {promptText && (
                    <div className="space-y-2 animate-fade-in">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-slate-400 uppercase">System Prompt</label>
                            <button onClick={handleCopy} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                <Copy size={12} /> Copy
                            </button>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 h-48 overflow-y-auto">
                            {promptText}
                        </div>
                        <div className="text-xs text-slate-500 italic">
                            Copy this into ChatGPT/Claude to get your answer.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
