import React, { useState, useEffect } from 'react';
import { Copy, Bot, Check, ArrowRight, ClipboardCopy, Wand2, X } from 'lucide-react';

export default function GptAssistant({ specs, onClose, onApplyChanges }) {
    const [step, setStep] = useState(1); // 1: Select/Config, 2: Get Prompt, 3: Paste Response
    const [promptText, setPromptText] = useState("");
    const [responseText, setResponseText] = useState("");
    const [loadingContext, setLoadingContext] = useState(false);
    const [copied, setCopied] = useState(false);
    const [scope, setScope] = useState('missing'); // 'missing', 'all'
    const [customInstruction, setCustomInstruction] = useState("");
    const [checkpoints, setCheckpoints] = useState([]);

    useEffect(() => {
        const fetchCheckpoints = async () => {
            try {
                const res = await fetch('/api/checkpoints');
                const data = await res.json();
                setCheckpoints(data.checkpoints || []);
            } catch (e) {
                console.error(e);
            }
        };
        fetchCheckpoints();
    }, []);

    // Build the mega-prompt
    const buildPrompt = async () => {
        setLoadingContext(true);
        try {
            const res = await fetch('/api/context');
            const data = await res.json();
            const projectContext = data.context || "";

            const checkpointIds = checkpoints.map(cp => cp.id).filter(Boolean);
            const hasMissingPrompts = (spec) => {
                const prompts = spec.params?.prompts || {};
                if (!prompts.default || prompts.default.trim().length === 0) return true;
                if (checkpointIds.length === 0) return false;
                return checkpointIds.some(id => !prompts[id] || prompts[id].trim().length === 0);
            };

            const targetSpecs = scope === 'missing'
                ? specs.filter(s => !s.domain || !s.kit || !s.role || s.role === 'image' || hasMissingPrompts(s))
                : specs;

            const specsJson = JSON.stringify(targetSpecs.map(s => ({
                id: s.id,
                name: s.name,
                path: s.path,
                domain: s.domain,
                kit: s.kit,
                role: s.role,
                current_description: (s.params?.prompts?.default || "").slice(0, 500)
            })), null, 2);

            const prompt = `
I need you to act as an Asset Manager for the Zelos Project.
Here are the project's style guidelines and domain model rules:

${projectContext.slice(0, 3000)}... (truncated for brevity, ensure you follow the structure below)

DOMAIN MODEL RULES:
- domain: "cosmic" (default), "ui", "character"
- kit: "astroDuck" (mascot), "planet", "satellite", "background", "ui", "standalone"
- role: 
  - for astroDuck: "base", "outfit", "expression", "pose"
  - for planet: "texture", "atmosphere", "ring", "state"
  - for satellite: "icon", "state", "glow", "badge"
  - for background: "layer", "tile"
  - for ui: "component", "icon", "panel"
  - default: "image"

TASK:
1. Analyze the list of assets below.
2. Fill in missing 'domain', 'kit', and 'role' fields based on the filepath and name.
3. Provide a default prompt plus checkpoint-specific prompts for each asset.
4. Suggest a 'negative_prompt' valid for SDXL-based checkpoints.

OUTPUT FORMAT:
Return ONLY a JSON array of objects. Each object must have:
- "operation": "update" | "create" | "delete"
- "id": String (preserve for updates/deletes, new UUID for creates or leave blank)
- "name": String (required for create)
- "path": String (required for create, relative path e.g. assets/zelos/new-icon.png)
- "domain": String
- "kit": String
- "role": String
- "prompts": {
    "default": "...",
    "juggernaut": "...",
    "animagine": "...",
    "pony": "...",
    "protovision": "...",
    "sdxl": "...",
    "copax": "..."
  } (Include all keys listed below; keep missing ones as empty strings if you cannot specialize.)
- "negative_prompt": "..."

INSTRUCTIONS:
- To UPDATE: Return the object with the same ID and new fields.
- To CREATE: Return a new object with operation="create". Suggest a path based on the kit/role rules.
- To DELETE: Return schema with operation="delete" if an asset is clearly duplicate or off-spec.

CHECKPOINT KEYS:
Use these keys for prompt variants: ${checkpointIds.length ? checkpointIds.join(', ') : 'juggernaut, animagine, pony, protovision, sdxl, copax'}

Current Specs:
${specsJson}

USER REQUEST:
Analyze these specs. Fill missing data.
${customInstruction ? `\nCUSTOM INSTRUCTIONS:\n${customInstruction}` : "If you see obvious gaps in the 'planet' kit (like missing states or textures based on standard game patterns), suggest NEW specs to create."}
            `;
            setPromptText(prompt.trim());
            setStep(2);
        } catch (e) {
            console.error(e);
            alert("Failed to build prompt context");
        } finally {
            setLoadingContext(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleApply = () => {
        try {
            // Find the JSON array in the response text (it might have extra chat text)
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                alert("Could not find a valid JSON array in the text.");
                return;
            }

            const updates = JSON.parse(jsonMatch[0]);
            if (!Array.isArray(updates)) {
                alert("JSON is not an array.");
                return;
            }

            onApplyChanges(updates);
            onClose();
        } catch (e) {
            alert("JSON Parse Error: " + e.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">

                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Bot className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-200">AI Spec Copilot</h2>
                            <p className="text-xs text-slate-500">Enrich your metadata with browser-based LLMs</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Stepper */}
                <div className="flex border-b border-slate-800">
                    {[1, 2, 3].map(s => (
                        <div
                            key={s}
                            className={`flex-1 p-3 text-center text-xs font-bold uppercase tracking-wider transition-colors ${step === s
                                ? 'bg-indigo-900/20 text-indigo-400 border-b-2 border-indigo-500'
                                : step > s ? 'text-slate-500 bg-slate-900' : 'text-slate-600 bg-slate-950'}`}
                        >
                            Step {s}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden p-6 relative">

                    {step === 1 && (
                        <div className="h-full flex flex-col items-center justify-center space-y-8 text-center max-w-lg mx-auto">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white">Let's build a context prompt.</h3>
                                <p className="text-slate-400">Select which assets you want the AI to analyze and enrich.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <button
                                    onClick={() => setScope('missing')}
                                    className={`p-6 rounded-xl border-2 transition-all hover:bg-slate-800 ${scope === 'missing' ? 'border-indigo-500 bg-indigo-900/10' : 'border-slate-700 bg-slate-900'}`}
                                >
                                    <div className="font-bold text-indigo-400 mb-1">Fill Missing</div>
                                    <div className="text-xs text-slate-500">Only assets missing metadata.</div>
                                </button>
                                <button
                                    onClick={() => setScope('all')}
                                    className={`p-6 rounded-xl border-2 transition-all hover:bg-slate-800 ${scope === 'all' ? 'border-indigo-500 bg-indigo-900/10' : 'border-slate-700 bg-slate-900'}`}
                                >
                                    <div className="font-bold text-indigo-400 mb-1">Review All</div>
                                    <div className="text-xs text-slate-500">Re-examine everything.</div>
                                </button>
                            </div>

                            <div className="w-full text-left space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Custom Instructions (Optional)</label>
                                <textarea
                                    className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                                    placeholder="e.g. 'Rename all planets to have ice themes', 'Check for consistency in Astro Duck outfits', 'Suggest 3 new alien satellite icons'"
                                    value={customInstruction}
                                    onChange={e => setCustomInstruction(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={buildPrompt}
                                disabled={loadingContext}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                            >
                                {loadingContext ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Wand2 size={20} />}
                                Generate Prompt Context
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="h-full flex flex-col space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-200">Copy this Prompt</h3>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                                </button>
                            </div>
                            <div className="flex-1 relative">
                                <textarea
                                    className="w-full h-full bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-xs text-slate-400 focus:outline-none resize-none"
                                    value={promptText}
                                    readOnly
                                />
                            </div>
                            <div className="flex items-center justify-between bg-blue-900/20 p-4 rounded-xl border border-blue-900/30 text-blue-200 text-sm">
                                <div className="flex items-center gap-3">
                                    <Bot size={20} />
                                    <span>Paste this into ChatGPT, Claude, or Gemini.</span>
                                </div>
                                <button onClick={() => setStep(3)} className="text-white font-bold flex items-center gap-1 hover:underline">
                                    Next Step <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="h-full flex flex-col space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-200">Paste AI Response</h3>
                                <p className="text-xs text-slate-500">Paste the JSON array provided by the AI.</p>
                            </div>
                            <div className="flex-1 relative">
                                <textarea
                                    className="w-full h-full bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                                    placeholder='[{ "id": "...", "prompts": { ... } }]'
                                    value={responseText}
                                    onChange={e => setResponseText(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-between gap-4">
                                <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800">
                                    Back
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={!responseText}
                                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
