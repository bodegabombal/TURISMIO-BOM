
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { WineryData, InventoryItem, InventoryType, Movement } from './types';
import { InventoryList } from './components/InventoryList';
import { AddInventoryModal } from './components/AddInventoryModal';
import { MovementModal } from './components/MovementModal';
import { MovementsList } from './components/MovementsList';

const App: React.FC = () => {
  // Added 'movements' as a valid tab type for the UI, though not strictly an InventoryType
  const [activeTab, setActiveTab] = useState<InventoryType | 'movements'>('finished');
  
  const [grapes, setGrapes] = useState<WineryData['grapes']>([]);
  const [bulk, setBulk] = useState<WineryData['bulk']>([]);
  const [finished, setFinished] = useState<WineryData['finished']>([]);
  const [materials, setMaterials] = useState<WineryData['materials']>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<InventoryItem | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('wineryData');
      if (savedData) {
        const parsed: Partial<WineryData> = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
            setFinished(parsed);
        } else {
            setGrapes(parsed.grapes || []);
            setBulk(parsed.bulk || []);
            setFinished(parsed.finished || []);
            setMaterials(parsed.materials || []);
            setMovements(parsed.movements || []);
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

  // Handle Movement Submission from Modal
  const handleMovementSubmit = (itemId: string, quantity: number, type: 'IN' | 'OUT', reason: string, user: string) => {
    const change = type === 'IN' ? quantity : -quantity;
    
    // Find Item Name for log
    const allItems = [...grapes, ...bulk, ...finished, ...materials];
    const item = allItems.find(i => i.id === itemId);
    const itemName = item 
        ? ('name' in item ? item.name : 'variety' in item ? item.variety : item.id) 
        : itemId;

    // 1. Log Movement
    const newMovement: Movement = {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString(),
        itemId,
        itemName,
        type,
        quantity,
        reason,
        user,
    };
    setMovements(prev => [newMovement, ...prev]);

    // 2. Update Stock
    const updateList = <T extends { id: string, quantity?: number, weight?: number, volume?: number }>(
        list: T[], 
        setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
        setter(prev => prev.map(i => {
            if (i.id !== itemId) return i;
            if ('weight' in i) return { ...i, weight: Math.max(0, (i.weight || 0) + change) };
            if ('volume' in i) return { ...i, volume: Math.max(0, (i.volume || 0) + change) };
            return { ...i, quantity: Math.max(0, (i.quantity || 0) + change) };
        }));
    };

    // Determine which list to update based on item type
    // Since we have the item, we can check its type directly if we had it, but searching lists is safe
    if (grapes.some(i => i.id === itemId)) updateList(grapes, setGrapes);
    else if (bulk.some(i => i.id === itemId)) updateList(bulk, setBulk);
    else if (finished.some(i => i.id === itemId)) updateList(finished, setFinished);
    else if (materials.some(i => i.id === itemId)) updateList(materials, setMaterials);
  };

  const handleOpenMovementModal = (item: InventoryItem) => {
    setSelectedItemForMovement(item);
    setIsMovementModalOpen(true);
  };

  const handleAddItem = useCallback((newItem: InventoryItem) => {
    switch (newItem.type) {
        case 'grape': setGrapes(p => [...p, newItem as any]); break;
        case 'bulk': setBulk(p => [...p, newItem as any]); break;
        case 'finished': setFinished(p => [...p, newItem as any]); break;
        case 'material': setMaterials(p => [...p, newItem as any]); break;
    }
    // Auto-log initial entry
    handleMovementSubmit(
        newItem.id, 
        newItem.type === 'grape' ? (newItem as any).weight : (newItem as any).volume || (newItem as any).quantity, 
        'IN', 
        'Alta Inicial', 
        'Sistema'
    );
  }, []);

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

        if (window.confirm('¿Reemplazar base de datos actual? Se perderán los datos no guardados.')) {
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

  const getCurrentList = (): InventoryItem[] => {
      switch(activeTab) {
          case 'grape': return grapes;
          case 'bulk': return bulk;
          case 'finished': return finished;
          case 'material': return materials;
          default: return [];
      }
  };

  const tabs: {id: InventoryType | 'movements', label: string, colorClass: string, activeClass: string}[] = [
      { id: 'grape', label: '🍇 Uva', colorClass: 'hover:text-purple-600', activeClass: 'text-purple-700 bg-purple-50 ring-1 ring-purple-200' },
      { id: 'bulk', label: '🍷 Tanques', colorClass: 'hover:text-amber-600', activeClass: 'text-amber-700 bg-amber-50 ring-1 ring-amber-200' },
      { id: 'finished', label: '🍾 Botellas', colorClass: 'hover:text-indigo-600', activeClass: 'text-indigo-700 bg-indigo-50 ring-1 ring-indigo-200' },
      { id: 'material', label: '📦 Insumos', colorClass: 'hover:text-emerald-600', activeClass: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200' },
      { id: 'movements', label: '📋 Movimientos', colorClass: 'hover:text-gray-600', activeClass: 'text-gray-800 bg-white ring-1 ring-gray-200 shadow-sm' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8">
      <header className="mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    Gestor de Vinos
                </h1>
                <p className="text-gray-500 mt-1 text-lg">
                    Control Integral de Bodega
                </p>
            </div>
            <div className="flex gap-3">
                <button onClick={() => fileInputRef.current?.click()} className="py-2 px-5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-all text-sm font-semibold shadow-sm">Importar</button>
                <button onClick={handleExport} className="py-2 px-5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all text-sm font-semibold shadow-md">Exportar</button>
                <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
            </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                        activeTab === tab.id 
                        ? `${tab.activeClass} shadow-sm` 
                        : `text-gray-500 hover:bg-gray-50 ${tab.colorClass}`
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-end border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-800">
                {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                {activeTab === 'movements' ? movements.length : getCurrentList().length} registros
            </div>
        </div>

        {activeTab === 'movements' ? (
            <MovementsList movements={movements} />
        ) : (
            <InventoryList 
                items={getCurrentList()} 
                type={activeTab as InventoryType}
                onOpenMovement={handleOpenMovementModal}
                onRemoveItem={handleRemoveItem} 
            />
        )}
      </main>

      {activeTab !== 'movements' && (
        <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:shadow-indigo-500/40 transition-all transform hover:scale-105 z-40"
            aria-label="Añadir ítem"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        </button>
      )}

      {isModalOpen && activeTab !== 'movements' && (
        <AddInventoryModal
          type={activeTab as InventoryType}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddItem}
        />
      )}

      {isMovementModalOpen && selectedItemForMovement && (
          <MovementModal
            item={selectedItemForMovement}
            onClose={() => {
                setIsMovementModalOpen(false);
                setSelectedItemForMovement(null);
            }}
            onSubmit={handleMovementSubmit}
          />
      )}
    </div>
  );
};

export default App;
