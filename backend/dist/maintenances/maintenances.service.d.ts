import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { QueryMaintenanceDto } from './dto/query-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
export declare class MaintenancesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: number, dto: CreateMaintenanceDto): Promise<{
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
    findAll(userId: number, query: QueryMaintenanceDto): Promise<{
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
    findOne(id: number, userId: number): Promise<{
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
    update(id: number, userId: number, dto: UpdateMaintenanceDto): Promise<{
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
    remove(id: number, userId: number): Promise<{
        message: string;
    }>;
}
