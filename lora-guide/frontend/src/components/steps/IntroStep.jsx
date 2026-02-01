import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function IntroStep({ onNext }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="p-6 bg-blue-500/10 rounded-full text-blue-400 animate-pulse">
                <Sparkles size={64} />
            </div>

            <div className="space-y-4 max-w-2xl">
                <h2 className="text-3xl font-bold text-white">Welcome to LoRA Training Guide</h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                    This wizard will guide you through the process of preparing your dataset and configuring your LoRA training parameters.
                    Whether you're training a style, a character, or an object, we'll help you get the best settings.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
                {[
                    { title: 'Prepare Dataset', desc: 'Select and process your training images' },
                    { title: 'Tag Images', desc: 'Manage captions for better understanding' },
                    { title: 'Generate Config', desc: 'Create optimal training parameters' }
                ].map((item, i) => (
                    <div key={i} className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors">
                        <h3 className="font-semibold text-blue-400 mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                ))}
            </div>

            <button
                onClick={onNext}
                className="group relative mt-12 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-bold text-white shadow-lg hover:shadow-blue-500/25 transition-all text-lg flex items-center gap-2 overflow-hidden hover:scale-105 active:scale-95"
            >
                <span>Start New Training</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
