
import React from 'react';
import type { InventoryItem, InventoryType } from '../types';
import { InventoryItemCard } from './InventoryItem';

interface InventoryListProps {
  items: InventoryItem[];
  type: InventoryType;
  onOpenMovement: (item: InventoryItem) => void;
  onRemoveItem: (id: string) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ items, type, onOpenMovement, onRemoveItem }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-100/50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 text-xl font-medium">No hay registros en esta sección.</p>
        <p className="text-gray-400 mt-2">Pulsa el botón + para añadir stock.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <InventoryItemCard
          key={item.id}
          item={item}
          onOpenMovement={onOpenMovement}
          onRemove={onRemoveItem}
        />
      ))}
    </div>
  );
};
