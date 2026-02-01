import React, { useState } from 'react';
import TrainingWizard from './components/TrainingWizard';
import StudioStep from './components/StudioStep';
import Dashboard from './components/Dashboard';
import KnowledgeBase from './components/KnowledgeBase';
import { LayoutGrid, GraduationCap, Settings, Book, Activity } from 'lucide-react';

function Gallery() {
    return (
        <div className="flex items-center justify-center h-full text-slate-500">
            <p>Asset Gallery Coming Soon</p>
        </div>
    );
}

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [studioInitialPath, setStudioInitialPath] = useState(null);

    const handleNavigateToStudio = (initialPath) => {
        setStudioInitialPath(initialPath);
        setActiveTab('studio');
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity, component: (props) => <Dashboard {...props} onNavigateToStudio={handleNavigateToStudio} /> },
        { id: 'gallery', label: 'Gallery', icon: LayoutGrid, component: Gallery },
        { id: 'studio', label: 'Studio Ops', icon: Settings, component: (props) => <StudioStep {...props} initialPath={studioInitialPath} /> },
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
                    <p className="text-xs text-slate-500 uppercase tracking-wider mt-1 font-semibold">Zelos Project</p>
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

                <div className="p-4 border-t border-slate-800 text-xs text-slate-600">
                    v0.3.1 • Local Environment
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-slate-950 overflow-hidden relative">
                <ActiveComponent />
            </div>
        </div>
    )
}

export default App
