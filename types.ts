
export type InventoryType = 'grape' | 'bulk' | 'finished' | 'material';

export interface Movement {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT'; // Simplified for UI
  quantity: number;
  reason: string; // Motivo (Venta, Merma, etc)
  user: string; // Quien fue
  notes?: string;
}

export interface GrapeBatch {
  id: string; // Batch ID (e.g., V2025-CAB-001)
  type: 'grape';
  variety: string;
  vineyard: string; // Origin/Quartel
  harvestDate: string;
  weight: number; // Current weight in Kg
  initialWeight: number;
  sugar: number; // Baumé / Brix
  acidity: number; // g/L
  notes?: string;
}

export interface BulkWine {
  id: string; // Tank ID (e.g., T-INOX-05)
  type: 'bulk';
  batchId: string; // Internal Batch ID
  volume: number; // Liters
  stage: string; // Fermentation, Aging, etc.
  fermentationStartDate?: string;
  fermentationEndDate?: string;
  rackingDate?: string;
  alcohol?: number; // % vol
  barrelType?: string; // French/American Oak, Toast level
  notes?: string;
}

export interface FinishedWine {
  id: string; // SKU or internal ID
  type: 'finished';
  sku: string;
  name: string; // Commercial Name
  vintage: number;
  format: string; // 750ml, 1.5L
  quantity: number; // Bottles
  location: string; // Warehouse/Row
  bottlingDate?: string;
  lotCode: string; // For traceability
  cost?: number;
  minStock?: number;
  
  // Backward compatibility fields or extra display info
  winery: string; 
  varietal: string;
  region: string;
  notes?: string;
}

export interface PackagingMaterial {
  id: string;
  type: 'material';
  name: string; // Material Type (Cork, Label, etc.)
  supplier: string;
  quantity: number;
  minStock?: number;
  notes?: string;
}

// Union type for use in components
export type InventoryItem = GrapeBatch | BulkWine | FinishedWine | PackagingMaterial;

export interface WineryData {
  grapes: GrapeBatch[];
  bulk: BulkWine[];
  finished: FinishedWine[];
  materials: PackagingMaterial[];
  movements: Movement[];
}
