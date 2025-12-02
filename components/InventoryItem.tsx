
import React from 'react';
import type { InventoryItem, GrapeBatch, BulkWine, FinishedWine, PackagingMaterial } from '../types';

interface ItemProps {
  item: InventoryItem;
  onUpdateStock: (id: string, change: number) => void;
  onRemove: (id: string) => void;
}

export const InventoryItemCard: React.FC<ItemProps> = ({ item, onUpdateStock, onRemove }) => {
  
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
  let badges: {label: string, color: string}[] = [];

  if (isGrape(item)) {
    title = `${item.variety} (${item.id})`;
    subtitle = item.vineyard;
    details = `Cosecha: ${item.harvestDate}`;
    quantityValue = item.weight;
    unit = 'Kg';
    quantityLabel = 'Peso Actual';
    badges.push({ label: `${item.sugar}° Baumé`, color: 'bg-purple-900 text-purple-200' });
    badges.push({ label: `${item.acidity} g/L Acidez`, color: 'bg-pink-900 text-pink-200' });
  } 
  else if (isBulk(item)) {
    title = `Tanque ${item.id}`;
    subtitle = item.stage;
    details = `Lote: ${item.batchId}`;
    quantityValue = item.volume;
    unit = 'Lts';
    quantityLabel = 'Volumen';
    if(item.alcohol) badges.push({ label: `${item.alcohol}% Vol`, color: 'bg-amber-900 text-amber-200' });
    if(item.barrelType) badges.push({ label: item.barrelType, color: 'bg-orange-900 text-orange-200' });
    if(item.fermentationStartDate) badges.push({ label: `Inicio: ${item.fermentationStartDate}`, color: 'bg-slate-700 text-slate-300'});
  } 
  else if (isFinished(item)) {
    title = item.name;
    subtitle = item.winery;
    details = `${item.varietal} • ${item.vintage}`;
    quantityValue = item.quantity;
    unit = 'Botellas';
    if(item.format) badges.push({ label: item.format, color: 'bg-indigo-900 text-indigo-200' });
    if(item.location) badges.push({ label: `📍 ${item.location}`, color: 'bg-blue-900 text-blue-200' });
    if(item.sku) badges.push({ label: `SKU: ${item.sku}`, color: 'bg-slate-700 text-slate-300' });
    if (item.minStock && quantityValue <= item.minStock) {
        badges.push({ label: '⚠️ Stock Bajo', color: 'bg-red-900 text-red-200 border border-red-700' });
    }
  } 
  else if (isMaterial(item)) {
    title = item.name;
    subtitle = item.supplier;
    details = item.id;
    quantityValue = item.quantity;
    unit = 'Uni';
    if (item.minStock && quantityValue <= item.minStock) {
        badges.push({ label: '⚠️ Stock Bajo', color: 'bg-red-900 text-red-200 border border-red-700' });
    }
  }

  const step = isBulk(item) || isGrape(item) ? 10 : 1; // Increment by 10 for kg/liters, 1 for units

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col transition-all duration-300 hover:shadow-indigo-500/10 hover:ring-1 hover:ring-slate-600 relative overflow-hidden group">
      
      {/* Top Bar decoration based on type */}
      <div className={`absolute top-0 left-0 w-full h-1 ${
          isGrape(item) ? 'bg-purple-500' : 
          isBulk(item) ? 'bg-amber-500' : 
          isMaterial(item) ? 'bg-emerald-500' : 'bg-indigo-500'
      }`}></div>

      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold text-white pr-2 truncate" title={title}>{title}</h2>
            <button 
                onClick={() => onRemove(item.id)} 
                className="text-slate-600 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                aria-label="Eliminar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
        
        <p className="text-indigo-400 font-medium text-sm">{subtitle}</p>
        <p className="text-slate-400 text-xs mt-1">{details}</p>
        
        <div className="flex flex-wrap gap-2 mt-3">
            {badges.map((b, idx) => (
                <span key={idx} className={`text-xs px-2 py-1 rounded-full ${b.color}`}>
                    {b.label}
                </span>
            ))}
        </div>

        {item.notes && (
            <p className="text-slate-500 mt-3 text-xs italic border-l-2 border-slate-700 pl-2 line-clamp-2">
                "{item.notes}"
            </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center">
        <div className="text-left">
          <p className="text-xs text-slate-400 uppercase tracking-wide">{quantityLabel}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-white">{quantityValue}</p>
            <span className="text-xs text-slate-500">{unit}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateStock(item.id, -step)}
            disabled={quantityValue === 0}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold w-9 h-9 rounded-lg flex items-center justify-center transition shadow-sm"
          >
            -
          </button>
          <button
            onClick={() => onUpdateStock(item.id, step)}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold w-9 h-9 rounded-lg flex items-center justify-center transition shadow-sm"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
