
import React from 'react';
import type { InventoryItem, GrapeBatch, BulkWine, FinishedWine, PackagingMaterial } from '../types';

interface ItemProps {
  item: InventoryItem;
  onOpenMovement: (item: InventoryItem) => void;
  onRemove: (id: string) => void;
}

export const InventoryItemCard: React.FC<ItemProps> = ({ item, onOpenMovement, onRemove }) => {
  
  // Helpers to safely access specific properties based on type guards or direct checks
  const isGrape = (i: InventoryItem): i is GrapeBatch => i.type === 'grape';
  const isBulk = (i: InventoryItem): i is BulkWine => i.type === 'bulk';
  const isFinished = (i: InventoryItem): i is FinishedWine => i.type === 'finished' || (!i.type && 'vintage' in i); // fallback for legacy
  const isMaterial = (i: InventoryItem): i is PackagingMaterial => i.type === 'material';

  // Determine key display values
  let title = '';
  let subtitle = '';
  let details = '';
  let quantityLabel = 'Stock';
  let quantityValue = 0;
  let unit = 'Uni';
  let badges: {label: string, color: string, border: string}[] = [];
  let barColor = '';

  if (isGrape(item)) {
    title = `${item.variety} (${item.id})`;
    subtitle = item.vineyard;
    details = `Cosecha: ${item.harvestDate}`;
    quantityValue = item.weight;
    unit = 'Kg';
    quantityLabel = 'Peso Actual';
    barColor = 'bg-purple-500';
    badges.push({ label: `${item.sugar}° Baumé`, color: 'bg-purple-50 text-purple-700', border: 'border-purple-200' });
    badges.push({ label: `${item.acidity} g/L Acidez`, color: 'bg-pink-50 text-pink-700', border: 'border-pink-200' });
  } 
  else if (isBulk(item)) {
    title = `Tanque ${item.id}`;
    subtitle = item.stage;
    details = `Lote: ${item.batchId}`;
    quantityValue = item.volume;
    unit = 'Lts';
    quantityLabel = 'Volumen';
    barColor = 'bg-amber-500';
    if(item.alcohol) badges.push({ label: `${item.alcohol}% Vol`, color: 'bg-amber-50 text-amber-700', border: 'border-amber-200' });
    if(item.barrelType) badges.push({ label: item.barrelType, color: 'bg-orange-50 text-orange-700', border: 'border-orange-200' });
    if(item.fermentationStartDate) badges.push({ label: `Inicio: ${item.fermentationStartDate}`, color: 'bg-gray-100 text-gray-600', border: 'border-gray-200'});
  } 
  else if (isFinished(item)) {
    title = item.name;
    subtitle = item.winery;
    details = `${item.varietal} • ${item.vintage}`;
    quantityValue = item.quantity;
    unit = 'Botellas';
    barColor = 'bg-indigo-500';
    if(item.format) badges.push({ label: item.format, color: 'bg-indigo-50 text-indigo-700', border: 'border-indigo-200' });
    if(item.location) badges.push({ label: `📍 ${item.location}`, color: 'bg-blue-50 text-blue-700', border: 'border-blue-200' });
    if(item.sku) badges.push({ label: `SKU: ${item.sku}`, color: 'bg-gray-100 text-gray-600', border: 'border-gray-200' });
    if (item.minStock && quantityValue <= item.minStock) {
        badges.push({ label: '⚠️ Stock Bajo', color: 'bg-red-50 text-red-700', border: 'border-red-200' });
    }
  } 
  else if (isMaterial(item)) {
    title = item.name;
    subtitle = item.supplier;
    details = item.id;
    quantityValue = item.quantity;
    unit = 'Uni';
    barColor = 'bg-emerald-500';
    if (item.minStock && quantityValue <= item.minStock) {
        badges.push({ label: '⚠️ Stock Bajo', color: 'bg-red-50 text-red-700', border: 'border-red-200' });
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col transition-all duration-300 hover:shadow-md hover:border-indigo-300 relative overflow-hidden group">
      
      {/* Top Bar decoration */}
      <div className={`absolute top-0 left-0 w-full h-1.5 ${barColor}`}></div>

      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold text-gray-900 pr-2 truncate" title={title}>{title}</h2>
            <button 
                onClick={() => onRemove(item.id)} 
                className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                aria-label="Eliminar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
        
        <p className="text-indigo-600 font-medium text-sm">{subtitle}</p>
        <p className="text-gray-500 text-xs mt-1">{details}</p>
        
        <div className="flex flex-wrap gap-2 mt-3">
            {badges.map((b, idx) => (
                <span key={idx} className={`text-xs px-2 py-1 rounded-full border ${b.color} ${b.border} font-medium`}>
                    {b.label}
                </span>
            ))}
        </div>

        {item.notes && (
            <p className="text-gray-500 mt-3 text-xs italic border-l-2 border-gray-300 pl-2 line-clamp-2">
                "{item.notes}"
            </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-end">
        <div className="text-left">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{quantityLabel}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-800">{quantityValue}</p>
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        </div>
        
        <button
            onClick={() => onOpenMovement(item)}
            className="px-4 py-2 bg-gray-100 hover:bg-white hover:border-gray-300 border border-transparent text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
            <span>Movimientos</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        </button>
      </div>
    </div>
  );
};
