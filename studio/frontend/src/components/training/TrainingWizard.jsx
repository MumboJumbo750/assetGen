import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntroStep from './steps/IntroStep';
import DatasetStep from './steps/DatasetStep';
import TaggingStep from './steps/TaggingStep';
import ConfigStep from './steps/ConfigStep';
import ExportStep from './steps/ExportStep';
import StepIndicator from './StepIndicator';

const steps = [
    { id: 'intro', title: 'Introduction', component: IntroStep },
    { id: 'dataset', title: 'Dataset Selection', component: DatasetStep },
    { id: 'tagging', title: 'Image Tagging', component: TaggingStep },
    { id: 'config', title: 'Training Configuration', component: ConfigStep },
    { id: 'export', title: 'Export & Train', component: ExportStep },
];

export default function Wizard() {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [data, setData] = useState({
        datasetPath: '',
        images: [],
        config: {
            modelName: 'my-lora',
            baseModel: 'sdxl_base_v1-0.safetensors',
            resolution: 1024,
            batchSize: 1,
            epochs: 10,
            learningRate: 1e-4,
            networkDim: 32,
            networkAlpha: 16,
        }
    });

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const updateData = (newData) => {
        setData(prev => ({ ...prev, ...newData }));
    };

    const CurrentComponent = steps[currentStepIndex].component;

    return (
        <div className="w-full max-w-4xl mx-auto p-6 flex flex-col h-screen">
            <StepIndicator steps={steps} currentStepIndex={currentStepIndex} />

            <div className="flex-1 overflow-y-auto my-6 bg-slate-800/50 rounded-2xl border border-slate-700 p-8 backdrop-blur-sm shadow-xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        <CurrentComponent
                            data={data}
                            updateData={updateData}
                            onNext={nextStep}
                            onPrev={prevStep}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex justify-between items-center mt-auto py-4">
                <button
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${currentStepIndex === 0
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                >
                    Back
                </button>

                <div className="text-slate-400 text-sm">
                    Step {currentStepIndex + 1} of {steps.length}
                </div>
            </div>
        </div>
    );
}
