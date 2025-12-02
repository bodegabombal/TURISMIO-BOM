import React from 'react';
import type { InventoryItem, InventoryType } from '../types';
import { InventoryItemCard } from './WineListItem';

interface InventoryListProps {
  items: InventoryItem[];
  type: InventoryType;
  onUpdateStock: (id: string, change: number) => void;
  onRemoveItem: (id: string) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ items, type, onUpdateStock, onRemoveItem }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
        <p className="text-slate-500 text-xl">No hay registros en esta sección.</p>
        <p className="text-slate-400 mt-2">Pulsa el botón + para añadir stock.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <InventoryItemCard
          key={item.id}
          item={item}
          onUpdateStock={onUpdateStock}
          onRemove={onRemoveItem}
        />
      ))}
    </div>
  );
};
