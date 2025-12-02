
import React, { useState } from 'react';
import type { InventoryType, InventoryItem } from '../types';

interface AddModalProps {
  type: InventoryType;
  onClose: () => void;
  onAdd: (newItem: InventoryItem) => void;
}

export const AddInventoryModal: React.FC<AddModalProps> = ({ type, onClose, onAdd }) => {
  // We use a large generic state object, but only render relevant fields
  const [formData, setFormData] = useState<any>({
    // Common
    notes: '',
    // Grape
    variety: '', vineyard: '', harvestDate: new Date().toISOString().split('T')[0], 
    weight: 1000, sugar: 0, acidity: 0,
    // Bulk
    tankId: '', batchId: '', volume: 0, stage: 'Fermentación', alcohol: 0, barrelType: '',
    fermentationStartDate: '', fermentationEndDate: '', rackingDate: '',
    // Finished
    name: '', winery: '', vintage: new Date().getFullYear(), format: '750ml', 
    sku: '', location: '', quantity: 0, cost: 0, minStock: 0,
    bottlingDate: '',
    // Material
    materialName: '', supplier: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type: inputType } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: inputType === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = Date.now();
    let newItem: InventoryItem;

    if (type === 'grape') {
        newItem = {
            id: `grape-${formData.variety.substring(0,3)}-${timestamp}`,
            type: 'grape',
            variety: formData.variety,
            vineyard: formData.vineyard,
            harvestDate: formData.harvestDate,
            weight: formData.weight,
            initialWeight: formData.weight,
            sugar: formData.sugar,
            acidity: formData.acidity,
            notes: formData.notes
        };
    } else if (type === 'bulk') {
        newItem = {
            id: formData.tankId || `TANK-${timestamp}`,
            type: 'bulk',
            batchId: formData.batchId,
            volume: formData.volume,
            stage: formData.stage,
            alcohol: formData.alcohol,
            barrelType: formData.barrelType,
            fermentationStartDate: formData.fermentationStartDate || undefined,
            fermentationEndDate: formData.fermentationEndDate || undefined,
            rackingDate: formData.rackingDate || undefined,
            notes: formData.notes
        };
    } else if (type === 'material') {
        newItem = {
            id: `MAT-${timestamp}`,
            type: 'material',
            name: formData.materialName,
            supplier: formData.supplier,
            quantity: formData.quantity,
            minStock: formData.minStock,
            notes: formData.notes
        };
    } else {
        // Finished Wine
        newItem = {
            id: formData.sku || `SKU-${timestamp}`,
            type: 'finished',
            name: formData.name,
            winery: formData.winery,
            vintage: formData.vintage,
            varietal: formData.variety, // reusing variety field
            region: formData.vineyard, // reusing vineyard field as region
            format: formData.format,
            location: formData.location,
            sku: formData.sku,
            lotCode: `L-${timestamp}`,
            quantity: formData.quantity,
            cost: formData.cost,
            minStock: formData.minStock,
            bottlingDate: formData.bottlingDate || undefined,
            notes: formData.notes
        };
    }

    onAdd(newItem);
    onClose();
  };

  const Input = ({ label, name, type = "text", required = false, placeholder = "" }: any) => (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <input 
            type={type} name={name} id={name} required={required} 
            placeholder={placeholder}
            value={formData[name]} onChange={handleChange} 
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm" 
        />
      </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
          <h2 className="text-2xl font-bold text-white">
            {type === 'grape' && '🍇 Recepción de Uva'}
            {type === 'bulk' && '🍷 Ingreso Tanque / Granel'}
            {type === 'finished' && '🍾 Embotellado / Producto Final'}
            {type === 'material' && '📦 Ingreso de Insumos'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* GRAPE FIELDS */}
            {type === 'grape' && (
                <>
                    <Input label="Variedad" name="variety" required />
                    <Input label="Finca / Cuartel (Origen)" name="vineyard" required />
                    <Input label="Fecha Cosecha" name="harvestDate" type="date" required />
                    <Input label="Peso Inicial (Kg)" name="weight" type="number" required />
                    <Input label="Grado Baumé / Brix" name="sugar" type="number" />
                    <Input label="Acidez (g/L)" name="acidity" type="number" />
                </>
            )}

            {/* BULK WINE FIELDS */}
            {type === 'bulk' && (
                <>
                    <Input label="Identificador Tanque" name="tankId" required placeholder="Ej: T-INOX-01" />
                    <Input label="Lote Interno" name="batchId" required />
                    <Input label="Volumen Actual (Litros)" name="volume" type="number" required />
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Etapa</label>
                        <select name="stage" value={formData.stage} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white">
                            <option>Fermentación</option>
                            <option>Maceración</option>
                            <option>Prensado</option>
                            <option>Crianza (Barrica)</option>
                            <option>Estabilización</option>
                            <option>Filtrado</option>
                        </select>
                    </div>
                    <Input label="% Alcohol" name="alcohol" type="number" />
                    <Input label="Desc. Barrica (si aplica)" name="barrelType" placeholder="Ej: Roble Francés" />
                    
                    <Input label="Inicio Fermentación" name="fermentationStartDate" type="date" />
                    <Input label="Fin Fermentación" name="fermentationEndDate" type="date" />
                    <Input label="Fecha Trasiego" name="rackingDate" type="date" />
                </>
            )}

            {/* FINISHED WINE FIELDS */}
            {type === 'finished' && (
                <>
                    <Input label="Nombre Comercial" name="name" required />
                    <Input label="Bodega / Marca" name="winery" required />
                    <Input label="SKU" name="sku" placeholder="Ej: MAL22-750" />
                    <Input label="Variedad" name="variety" />
                    <Input label="Región" name="vineyard" /> {/* reusing vineyard field */}
                    <Input label="Año (Vintage)" name="vintage" type="number" />
                    <Input label="Formato" name="format" placeholder="Ej: 750ml" />
                    <Input label="Ubicación" name="location" placeholder="Pasillo A, Fila 2" />
                    <Input label="Cantidad Botellas" name="quantity" type="number" required />
                    
                    <Input label="Fecha Embotellado" name="bottlingDate" type="date" />
                    <Input label="Costo Unitario ($)" name="cost" type="number" />
                    <Input label="Stock Mínimo" name="minStock" type="number" />
                </>
            )}

            {/* MATERIAL FIELDS */}
            {type === 'material' && (
                <>
                    <Input label="Tipo Material" name="materialName" required placeholder="Ej: Corcho, Botella" />
                    <Input label="Proveedor" name="supplier" required />
                    <Input label="Cantidad Stock" name="quantity" type="number" required />
                    <Input label="Stock Mínimo" name="minStock" type="number" />
                </>
            )}
          </div>

          <div className="pt-2">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-1">Notas / Trazabilidad</label>
            <textarea name="notes" id="notes" rows={3} placeholder="Detalles extra, IDs de lotes origen, etc." value={formData.notes} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm"></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-700 mt-6">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition">Cancelar</button>
            <button type="submit" className={`py-2 px-6 text-white rounded-md transition shadow-lg ${
                type === 'grape' ? 'bg-purple-600 hover:bg-purple-500' :
                type === 'bulk' ? 'bg-amber-600 hover:bg-amber-500' :
                type === 'material' ? 'bg-emerald-600 hover:bg-emerald-500' :
                'bg-indigo-600 hover:bg-indigo-500'
            }`}>
                Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
