export interface Maintenance {
  id: number;
  item_name: string;
  service_type: string;
  service_date: string;
  cost: number;
  notes?: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenancePayload {
  item_name: string;
  service_type: string;
  service_date: string;
  cost: number;
  notes?: string;
}

export interface ItemSummary {
  itemName: string;
  lastServiceDate: string;
  lastServiceType: string;
  totalCost: number;
  count: number;
}

export interface PaginatedMaintenanceResponse {
  data: Maintenance[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalCost: number;
    totalRecords: number;
    items: ItemSummary[];
  };
}