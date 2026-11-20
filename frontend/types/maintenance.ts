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