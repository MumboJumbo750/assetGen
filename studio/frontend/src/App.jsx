import React, { useState } from 'react';
import TrainingWizard from './components/TrainingWizard';
import StudioStep from './components/StudioStep';
import Dashboard from './components/Dashboard';
import KnowledgeBase from './components/KnowledgeBase';
import FreeMode from './components/FreeMode';
import PreviewStage from './components/PreviewStage';
import GlobalCopilot from './components/GlobalCopilot';
import IndexBrowser from './components/IndexBrowser';
import CompositeViewer from './components/CompositeViewer';
import { LayoutGrid, GraduationCap, Settings, Book, Activity, Zap, PlayCircle, Folder, Database, Wand2, Layers } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [studioInitialPath, setStudioInitialPath] = useState(null);
    const [copilotOpen, setCopilotOpen] = useState(false);
    const [compositeGroup, setCompositeGroup] = useState(null);

    const handleNavigateToStudio = (initialPath) => {
        setStudioInitialPath(initialPath);
        setActiveTab('studio');
    };

    const handleOpenComposite = (group) => {
        setCompositeGroup(group);
        setActiveTab('composites');
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity, component: (props) => <Dashboard {...props} onNavigateToStudio={handleNavigateToStudio} onNavigateToTab={setActiveTab} /> },
        { id: 'indexes', label: 'Asset Indexes', icon: Database, component: (props) => <IndexBrowser {...props} onSelectAsset={(asset) => handleNavigateToStudio(asset.path)} onOpenComposite={handleOpenComposite} /> },
        { id: 'composites', label: 'Composites', icon: Layers, component: (props) => <CompositeViewer {...props} initialGroup={compositeGroup} /> },
        { id: 'preview', label: 'Preview Stage', icon: PlayCircle, component: PreviewStage },
        { id: 'free', label: 'Free Mode', icon: Zap, component: FreeMode },
        { id: 'studio', label: 'File Explorer', icon: Folder, component: (props) => <StudioStep {...props} initialPath={studioInitialPath} /> },
        { id: 'training', label: 'LoRA Training', icon: GraduationCap, component: TrainingWizard },
        { id: 'kb', label: 'Knowledge Base', icon: Book, component: KnowledgeBase },
    ];

    const activeTabConfig = tabs.find(t => t.id === activeTab);
    const ActiveComponent = activeTabConfig.component;

    return (
        <div className="h-screen flex text-white bg-slate-950 overflow-hidden font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Asset Studio
                    </h1>
                    <div className="flex items-center justify-between mt-2 px-2 py-1 bg-slate-800 rounded border border-slate-700">
                        <span className="text-xs text-slate-300 font-semibold">Zelos V2</span>
                        <Settings size={12} className="text-slate-500 cursor-pointer hover:text-white" />
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <tab.icon size={20} />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => setCopilotOpen((prev) => !prev)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
                    >
                        <Wand2 size={16} />
                        {copilotOpen ? 'Close Copilot' : 'Open Copilot'}
                    </button>
                    <div className="mt-3 text-xs text-slate-600">
                        v0.3.1 â€¢ Local Environment
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-slate-950 overflow-hidden relative">
                <ActiveComponent />
                <GlobalCopilot
                    activeTab={activeTab}
                    isOpen={copilotOpen}
                    onClose={() => setCopilotOpen(false)}
                />
            </div>
        </div>
    )
}

export default App

