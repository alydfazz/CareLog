import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { QueryMaintenanceDto } from './dto/query-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenancesService } from './maintenances.service';
interface AuthenticatedRequest {
    user: {
        userId: number;
        email: string;
    };
}
export declare class MaintenancesController {
    private readonly maintenancesService;
    constructor(maintenancesService: MaintenancesService);
    create(req: AuthenticatedRequest, dto: CreateMaintenanceDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        item_name: string;
        service_type: string;
        service_date: Date;
        cost: number;
        notes: string | null;
        userId: number;
    }>;
    findAll(req: AuthenticatedRequest, query: QueryMaintenanceDto): Promise<{
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            item_name: string;
            service_type: string;
            service_date: Date;
            cost: number;
            notes: string | null;
            userId: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        summary: {
            totalCost: number;
            totalRecords: number;
            items: {
                itemName: string;
                lastServiceDate: Date;
                lastServiceType: string;
                totalCost: number;
                count: number;
            }[];
        };
    }>;
    findOne(req: AuthenticatedRequest, id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        item_name: string;
        service_type: string;
        service_date: Date;
        cost: number;
        notes: string | null;
        userId: number;
    }>;
    update(req: AuthenticatedRequest, id: number, dto: UpdateMaintenanceDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        item_name: string;
        service_type: string;
        service_date: Date;
        cost: number;
        notes: string | null;
        userId: number;
    }>;
    remove(req: AuthenticatedRequest, id: number): Promise<{
        message: string;
    }>;
}
export {};
