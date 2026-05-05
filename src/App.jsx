import { useState, useEffect, useCallback } from 'react';
import InputPanel from './components/InputPanel';
import PlantViewport from './components/PlantViewport';
import EquipmentCard from './components/EquipmentCard';
import FinancialSummary from './components/FinancialSummary';
import MassEnergyBalance from './components/MassEnergyBalance';
import Header from './components/Header';
import ChatWidget from './components/chat/ChatWidget';
import { calculatePlantDesign, computingLogs } from './data/demoData';

export default function App() {
  const [plantData, setPlantData] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [activeView, setActiveView] = useState('3d');
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  const handleGenerate = useCallback(({ capacity, feedstock, location }) => {
    setIsGenerating(true);
    setCurrentLogIndex(0);
    setSelectedEquipment(null);
    setPlantData(null);

    const logInterval = setInterval(() => {
      setCurrentLogIndex((prev) => {
        if (prev >= computingLogs.length - 1) {
          clearInterval(logInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(logInterval);
      setCurrentLogIndex(computingLogs.length - 1);

      const design = calculatePlantDesign(capacity, feedstock, location);
      setPlantData(design);
      setIsGenerating(false);
    }, 3000);
  }, []);

  const handleViewChange = (view) => {
    if (view === 'balance' && plantData) {
      setShowBalanceModal(true);
    } else {
      setActiveView(view);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0f] cyber-grid">
      <Header
        activeView={activeView}
        onViewChange={handleViewChange}
        hasPlantData={!!plantData}
      />

      <div className="flex-1 flex overflow-hidden">
        <InputPanel
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          computingLog={computingLogs}
          currentLogIndex={currentLogIndex}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {activeView === '3d' && (
            <div className="flex-1 relative">
              <PlantViewport
                plantData={plantData}
                selectedEquipment={selectedEquipment}
                onSelectEquipment={setSelectedEquipment}
              />

              {selectedEquipment && (
                <EquipmentCard
                  equipment={selectedEquipment}
                  onClose={() => setSelectedEquipment(null)}
                />
              )}

              {plantData && (
                <div className="absolute bottom-4 right-4 flex gap-3">
                  <button
                    onClick={() => setShowBalanceModal(true)}
                    className="px-4 py-2 bg-[#1a1a24] hover:bg-[#2a2a38] border border-[#2a2a38] rounded-xl text-sm text-white transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Deep Dive Analysis
                  </button>
                </div>
              )}
            </div>
          )}

          {activeView === 'financial' && plantData && (
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-4xl mx-auto">
                <FinancialSummary
                  financials={plantData.financials}
                  inputs={plantData.inputs}
                />
              </div>
            </div>
          )}

          {activeView === 'financial' && !plantData && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a1a24] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#4b5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[#6b7280]">Generate a design to view financial analysis</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {showBalanceModal && (
        <MassEnergyBalance
          plantData={plantData}
          selectedEquipment={selectedEquipment}
          onClose={() => setShowBalanceModal(false)}
        />
      )}

      <ChatWidget plantData={plantData} />

      <footer className="h-8 glass-panel border-t border-[#2a2a38] flex items-center justify-between px-6 text-xs text-[#4b5563]">
        <div className="flex items-center gap-4">
          <span>BasisAI Generative Design Engine</span>
          <span className="text-[#2a2a38]">|</span>
          <span>Biomethane Plant Designer</span>
        </div>
        <div className="flex items-center gap-4">
          {plantData && (
            <>
              <span>
                {plantData.equipment.length} Equipment Units
              </span>
              <span className="text-[#2a2a38]">|</span>
              <span>
                {plantData.inputs.capacity} TPD Capacity
              </span>
              <span className="text-[#2a2a38]">|</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
            System Online
          </span>
        </div>
      </footer>
    </div>
  );
}
