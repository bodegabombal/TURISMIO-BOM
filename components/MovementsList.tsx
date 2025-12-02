
import React from 'react';
import type { Movement } from '../types';

interface MovementsListProps {
  movements: Movement[];
}

export const MovementsList: React.FC<MovementsListProps> = ({ movements }) => {
  if (movements.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-100/50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 text-xl font-medium">No hay movimientos registrados.</p>
      </div>
    );
  }

  // Helper to format date nicely
  const formatDate = (isoString: string) => {
    try {
        return new Date(isoString).toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch { return isoString; }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 text-gray-900 uppercase font-bold border-b border-gray-200">
          <tr>
            <th className="px-6 py-4">Fecha</th>
            <th className="px-6 py-4">Ítem / Producto</th>
            <th className="px-6 py-4">Tipo</th>
            <th className="px-6 py-4 text-right">Cantidad</th>
            <th className="px-6 py-4">Motivo</th>
            <th className="px-6 py-4">Responsable</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {movements.map((mov) => (
            <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {formatDate(mov.date)}
              </td>
              <td className="px-6 py-4 max-w-xs truncate" title={mov.itemName}>
                {mov.itemName}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    mov.type === 'IN' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    {mov.type === 'IN' ? 'ENTRADA' : 'SALIDA'}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-mono font-medium text-gray-800">
                {mov.quantity}
              </td>
              <td className="px-6 py-4">{mov.reason}</td>
              <td className="px-6 py-4 text-gray-900 font-medium">
                {mov.user}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
