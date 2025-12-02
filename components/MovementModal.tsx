
import React, { useState } from 'react';
import type { InventoryItem } from '../types';

interface MovementModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSubmit: (itemId: string, quantity: number, type: 'IN' | 'OUT', reason: string, user: string) => void;
}

export const MovementModal: React.FC<MovementModalProps> = ({ item, onClose, onSubmit }) => {
  const [type, setType] = useState<'IN' | 'OUT'>('OUT');
  // Use string to allow smooth typing of decimals (e.g. "1.")
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [user, setUser] = useState('');

  const currentStock = 'weight' in item ? item.weight : 'volume' in item ? item.volume : item.quantity;
  const unit = 'weight' in item ? 'Kg' : 'volume' in item ? 'Lts' : 'Uni';
  const itemName = 'name' in item ? item.name : 'variety' in item ? item.variety : item.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseFloat(quantity);
    
    if (!qtyNum || qtyNum <= 0) return;
    
    if (type === 'OUT' && qtyNum > currentStock) {
        alert("No puedes retirar más de lo que hay en stock.");
        return;
    }
    onSubmit(item.id, qtyNum, type, reason, user);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900">Registrar Movimiento</h3>
                <p className="text-sm text-gray-500 truncate max-w-[250px]">{itemName}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Type Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                    type="button"
                    onClick={() => setType('IN')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        type === 'IN' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Entrada (+)
                </button>
                <button
                    type="button"
                    onClick={() => setType('OUT')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        type === 'OUT' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Salida (-)
                </button>
            </div>

            {/* Quantity */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad ({unit})
                </label>
                <div className="relative">
                    <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="0.00"
                    />
                    <span className="absolute right-4 top-2 text-gray-400 text-sm">
                        Stock: {currentStock}
                    </span>
                </div>
            </div>

            {/* Reason */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <select 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="" disabled>Selecciona un motivo</option>
                    {type === 'IN' ? (
                        <>
                            <option value="Compra">Compra / Recepción</option>
                            <option value="Producción">Producción Interna</option>
                            <option value="Devolución">Devolución Cliente</option>
                            <option value="Ajuste Inventario">Ajuste Inventario (+)</option>
                        </>
                    ) : (
                        <>
                            <option value="Venta">Venta</option>
                            <option value="Consumo Interno">Consumo / Degustación</option>
                            <option value="Merma">Merma / Rotura</option>
                            <option value="Trasiego">Trasiego a otro envase</option>
                            <option value="Ajuste Inventario">Ajuste Inventario (-)</option>
                        </>
                    )}
                </select>
            </div>

            {/* User */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                <input
                    type="text"
                    required
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Nombre de quien registra"
                />
            </div>

            <button
                type="submit"
                className={`w-full py-3 rounded-lg font-bold text-white transition-colors shadow-md ${
                    type === 'IN' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
            >
                Confirmar {type === 'IN' ? 'Entrada' : 'Salida'}
            </button>

        </form>
      </div>
    </div>
  );
};
