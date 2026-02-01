import React, { useState } from 'react';
import { Book, HelpCircle, AlertTriangle, Layers, Info } from 'lucide-react';

const Checkpoints = [
    {
        name: "Juggernaut XL",
        desc: "Subject-first rendering. Excellent for natural textures and coherent cartoon illustrations. Best general purpose SDXL model.",
        tags: ["Natural", "Coherent", "Subject-First"]
    },
    {
        name: "Animagine XL 3.1",
        desc: "Strict tag-based structure (Danbooru style). High quality anime and game art. Requires structured tag ordering for best results.",
        tags: ["Anime", "Tag-Based", "Danbooru"]
    },
    {
        name: "Pony Diffusion V6",
        desc: "Specialized for stylization and character art. Requires CLIP skip 2 and prefix 'score_9, score_8_up...' to unlock quality.",
        tags: ["Stylized", "Characters", "Score-Based"]
    },
    {
        name: "ProtoVision XL",
        desc: "Hyper-realistic rendering but adapts well to 3D anime styles. High fidelity and refined lighting.",
        tags: ["Realistic", "3D Anime", "Hyper-Fidelity"]
    },
    {
        name: "Copax Timeless",
        desc: "Unique aesthetic focused on 'timeless' painterly or stylized illustration styles. Great for UI backgrounds.",
        tags: ["Painterly", "Stylized", "Backgrounds"]
    },
    {
        name: "SDXL Base",
        desc: "Standard foundation model. Useful as a baseline for LoRA training or simple generic generations.",
        tags: ["Base", "Training"]
    }
];

const FAQs = [
    {
        q: "Why use 'Asset Studio'?",
        a: "It unifies the workflow. You can generate sprite sheets, view them, and then immediately train a LoRA on them without moving files around."
    },
    {
        q: "How do I fix 'Composite View' issues?",
        a: "Use the Studio tab! It generates frames individually and stitches them together pixel-perfectly, avoiding the 'hallucination' artifacts of generating full sheets at once."
    },
    {
        q: "What is LoRA?",
        a: "Low-Rank Adaptation. It's a small file that tweaks a large model (like SDXL) to learn your specific character or style."
    },
    {
        q: "Where are my files?",
        a: "All generated assets go to 'c:/projects/assetsGen/assets'. You can browse them in the Gallery or Studio tab."
    }
];

export default function KnowledgeBase() {
    return (
        <div className="h-full overflow-y-auto p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Book className="text-blue-500" />
                Knowledge Base
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Checkpoints Section */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-300">
                        <Layers size={20} />
                        Checkpoint Specializations
                    </h2>
                    <div className="space-y-4">
                        {Checkpoints.map(cp => (
                            <div key={cp.name} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-200">{cp.name}</h3>
                                    <div className="flex gap-1">
                                        {cp.tags.map(t => (
                                            <span key={t} className="text-[10px] uppercase tracking-wider bg-slate-700 px-2 py-0.5 rounded text-slate-400">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400">{cp.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-300">
                        <HelpCircle size={20} />
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {FAQs.map((faq, i) => (
                            <div key={i} className="border-b border-slate-700/50 pb-4 last:border-0 last:pb-0">
                                <h3 className="font-medium text-slate-200 mb-1 flex items-start gap-2">
                                    <Info size={16} className="text-blue-500 mt-1 shrink-0" />
                                    {faq.q}
                                </h3>
                                <p className="text-sm text-slate-400 pl-6 border-l-2 border-slate-700 ml-2">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-xl flex items-start gap-4">
                <AlertTriangle className="text-yellow-500 shrink-0" />
                <div>
                    <h3 className="font-bold text-yellow-500 mb-1">Important Note on Paths</h3>
                    <p className="text-sm text-yellow-200/70">
                        When using the generation tools, always ensure your asset paths correspond to the structure defined in your markdown specs.
                        The system relies on folder naming (e.g., <code>sprites/astro-duck</code>) to apply the correct prompts and logic.
                    </p>
                </div>
            </div>
        </div>
    );
}
