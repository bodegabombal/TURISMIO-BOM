
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { WineryData, InventoryItem, InventoryType, Movement } from './types';
import { InventoryList } from './components/InventoryList';
import { AddInventoryModal } from './components/AddInventoryModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InventoryType>('finished');
  
  const [grapes, setGrapes] = useState<WineryData['grapes']>([]);
  const [bulk, setBulk] = useState<WineryData['bulk']>([]);
  const [finished, setFinished] = useState<WineryData['finished']>([]);
  const [materials, setMaterials] = useState<WineryData['materials']>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('wineryData');
      if (savedData) {
        const parsed: Partial<WineryData> = JSON.parse(savedData);
        // Handle migration from old single-array version if necessary
        if (Array.isArray(parsed)) {
            setFinished(parsed); // Assume old data matches finished wines
        } else {
            setGrapes(parsed.grapes || []);
            setBulk(parsed.bulk || []);
            setFinished(parsed.finished || []);
            setMaterials(parsed.materials || []);
            setMovements(parsed.movements || []);
        }
      } else {
          // Fallback check for old key
          const oldWines = localStorage.getItem('wineCollection');
          if (oldWines) {
              setFinished(JSON.parse(oldWines));
          }
      }
    } catch (error) {
      console.error("Failed to load data", error);
    }
  }, []);

  // Save data
  useEffect(() => {
    const data: WineryData = { grapes, bulk, finished, materials, movements };
    localStorage.setItem('wineryData', JSON.stringify(data));
  }, [grapes, bulk, finished, materials, movements]);

  const logMovement = (item: InventoryItem, change: number, type: Movement['type'] = 'ADJUST') => {
    const newMovement: Movement = {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString(),
        itemId: item.id,
        itemName: 'name' in item ? item.name : item.id, // Fallback for bulk which uses ID as main identifier often
        type: change > 0 ? 'IN' : 'OUT',
        quantity: Math.abs(change),
        notes: type === 'ADJUST' ? 'Ajuste manual de stock' : 'Operación'
    };
    setMovements(prev => [newMovement, ...prev]);
  };

  const handleAddItem = useCallback((newItem: InventoryItem) => {
    switch (newItem.type) {
        case 'grape': setGrapes(p => [...p, newItem as any]); break;
        case 'bulk': setBulk(p => [...p, newItem as any]); break;
        case 'finished': setFinished(p => [...p, newItem as any]); break;
        case 'material': setMaterials(p => [...p, newItem as any]); break;
    }
    logMovement(newItem, newItem.type === 'grape' ? (newItem as any).weight : (newItem as any).volume || (newItem as any).quantity, 'IN');
  }, []);

  const handleUpdateStock = useCallback((id: string, change: number) => {
    const updateList = <T extends { id: string, quantity?: number, weight?: number, volume?: number }>(
        list: T[], 
        setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
        const item = list.find(i => i.id === id);
        if (!item) return false;

        setter(prev => prev.map(i => {
            if (i.id !== id) return i;
            
            // Determine which field tracks quantity based on type
            if ('weight' in i) { // Grape
                const newVal = Math.max(0, (i.weight || 0) + change);
                return { ...i, weight: newVal };
            } else if ('volume' in i) { // Bulk
                const newVal = Math.max(0, (i.volume || 0) + change);
                return { ...i, volume: newVal };
            } else { // Finished / Material
                const newVal = Math.max(0, (i.quantity || 0) + change);
                return { ...i, quantity: newVal };
            }
        }));
        
        // Log movement after finding item
        const dummyItem = list.find(x => x.id === id) as unknown as InventoryItem;
        if(dummyItem) logMovement(dummyItem, change);

        return true;
    };

    // Try finding the item in the active list first for efficiency, or check all
    if (activeTab === 'grape') updateList(grapes, setGrapes);
    else if (activeTab === 'bulk') updateList(bulk, setBulk);
    else if (activeTab === 'finished') updateList(finished, setFinished);
    else if (activeTab === 'material') updateList(materials, setMaterials);

  }, [activeTab, grapes, bulk, finished, materials]);

  const handleRemoveItem = useCallback((id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este ítem?')) return;

    const filter = (prev: any[]) => prev.filter(i => i.id !== id);
    
    if (activeTab === 'grape') setGrapes(filter);
    else if (activeTab === 'bulk') setBulk(filter);
    else if (activeTab === 'finished') setFinished(filter);
    else if (activeTab === 'material') setMaterials(filter);
  }, [activeTab]);

  const handleExport = () => {
    const data: WineryData = { grapes, bulk, finished, materials, movements };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bodega_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Error al leer archivo.");
        
        const importedData = JSON.parse(text);

        // Simple validation
        if (!importedData || typeof importedData !== 'object') {
             throw new Error("Formato inválido.");
        }

        if (window.confirm('¿Reemplazar base de datos actual? Se perderán los datos no guardados.')) {
            // Support legacy import (array of wines)
            if (Array.isArray(importedData)) {
                 setFinished(importedData);
                 setGrapes([]); setBulk([]); setMaterials([]); setMovements([]);
            } else {
                 setGrapes(importedData.grapes || []);
                 setBulk(importedData.bulk || []);
                 setFinished(importedData.finished || []);
                 setMaterials(importedData.materials || []);
                 setMovements(importedData.movements || []);
            }
        }
      } catch (error) {
        alert("Error importing: " + error);
      } finally {
        if(fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Helper to get current list
  const getCurrentList = (): InventoryItem[] => {
      switch(activeTab) {
          case 'grape': return grapes;
          case 'bulk': return bulk;
          case 'finished': return finished;
          case 'material': return materials;
          default: return [];
      }
  };

  const tabs: {id: InventoryType, label: string, color: string}[] = [
      { id: 'grape', label: '🍇 Uva', color: 'bg-purple-600' },
      { id: 'bulk', label: '🍷 Tanques', color: 'bg-amber-600' },
      { id: 'finished', label: '🍾 Botellas', color: 'bg-indigo-600' },
      { id: 'material', label: '📦 Insumos', color: 'bg-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 md:p-8">
      <header className="text-center mb-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex-1 text-left">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                Gestor de Vinos
                </h1>
                <p className="text-slate-400 mt-2 text-lg">
                Control Integral de Bodega
                </p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors text-sm font-medium">Importar</button>
                <button onClick={handleExport} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm font-medium">Exportar</button>
                <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 max-w-4xl mx-auto bg-slate-800 p-2 rounded-xl">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                        activeTab === tab.id 
                        ? `${tab.color} text-white shadow-lg scale-105` 
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="mb-4 flex justify-between items-end">
            <h2 className="text-2xl font-bold text-slate-200">
                {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="text-sm text-slate-400">
                {getCurrentList().length} registros
            </div>
        </div>

        <InventoryList 
            items={getCurrentList()} 
            type={activeTab}
            onUpdateStock={handleUpdateStock} 
            onRemoveItem={handleRemoveItem} 
        />
      </main>

      <button
        onClick={() => setIsModalOpen(true)}
        className={`fixed bottom-8 right-8 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 ${tabs.find(t => t.id === activeTab)?.color}`}
        aria-label="Añadir ítem"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {isModalOpen && (
        <AddInventoryModal
          type={activeTab}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddItem}
        />
      )}
    </div>
  );
};

export default App;
