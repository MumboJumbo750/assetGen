import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStepIndex }) {
    return (
        <div className="w-full mb-8">
            <div className="flex justify-between relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 -z-10 -translate-y-1/2 rounded-full" />

                {/* Active Progress Bar */}
                <motion.div
                    className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 -translate-y-1/2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2">
                            <motion.div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-colors duration-300 ${isCompleted
                                        ? 'bg-blue-500 border-blue-500 text-white'
                                        : isActive
                                            ? 'bg-slate-900 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                            : 'bg-slate-800 border-slate-600 text-slate-500'
                                    }`}
                                initial={false}
                                animate={{ scale: isActive ? 1.1 : 1 }}
                            >
                                {isCompleted ? (
                                    <Check size={20} strokeWidth={3} />
                                ) : (
                                    <span className="font-bold text-sm">{index + 1}</span>
                                )}
                            </motion.div>
                            <div className={`text-xs font-medium absolute top-12 whitespace-nowrap transition-colors duration-300 ${isActive || isCompleted ? 'text-white' : 'text-slate-500'
                                }`}>
                                {step.title}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
