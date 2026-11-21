var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
let MaintenancesService = class MaintenancesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.maintenance.create({
            data: {
                item_name: dto.item_name.trim(),
                service_type: dto.service_type.trim(),
                service_date: new Date(dto.service_date),
                cost: dto.cost,
                notes: dto.notes?.trim() || null,
                userId,
            },
        });
    }
    async findAll(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 5;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (query.item_name && query.item_name.trim() !== '') {
            where.item_name = {
                equals: query.item_name.trim(),
                mode: 'insensitive',
            };
        }
        if (query.search && query.search.trim() !== '') {
            const keyword = query.search.trim();
            where.OR = [
                { item_name: { contains: keyword, mode: 'insensitive' } },
                { service_type: { contains: keyword, mode: 'insensitive' } },
                { notes: { contains: keyword, mode: 'insensitive' } },
            ];
        }
        const [data, filteredTotal, allUserRecords] = await Promise.all([
            this.prisma.maintenance.findMany({
                where,
                orderBy: [{ service_date: 'desc' }, { id: 'desc' }],
                skip,
                take: limit,
            }),
            this.prisma.maintenance.count({ where }),
            this.prisma.maintenance.findMany({
                where: { userId },
                orderBy: [{ service_date: 'desc' }, { id: 'desc' }],
            }),
        ]);
        const itemMap = new Map();
        let totalCost = 0;
        for (const record of allUserRecords) {
            totalCost += record.cost;
            const key = record.item_name.trim().toLowerCase();
            const existing = itemMap.get(key);
            if (!existing) {
                itemMap.set(key, {
                    itemName: record.item_name.trim(),
                    lastServiceDate: record.service_date,
                    lastServiceType: record.service_type,
                    totalCost: record.cost,
                    count: 1,
                });
            }
            else {
                existing.totalCost += record.cost;
                existing.count += 1;
                if (record.service_date > existing.lastServiceDate) {
                    existing.lastServiceDate = record.service_date;
                    existing.lastServiceType = record.service_type;
                }
            }
        }
        const totalPages = Math.max(1, Math.ceil(filteredTotal / limit));
        return {
            data,
            meta: {
                total: filteredTotal,
                page,
                limit,
                totalPages,
            },
            summary: {
                totalCost,
                totalRecords: allUserRecords.length,
                items: Array.from(itemMap.values()),
            },
        };
    }
    async findOne(id, userId) {
        const maintenance = await this.prisma.maintenance.findFirst({
            where: { id, userId },
        });
        if (!maintenance) {
            throw new NotFoundException(`Catatan servis dengan ID ${id} tidak ditemukan`);
        }
        return maintenance;
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        return this.prisma.maintenance.update({
            where: { id },
            data: {
                ...(dto.item_name !== undefined && { item_name: dto.item_name.trim() }),
                ...(dto.service_type !== undefined && {
                    service_type: dto.service_type.trim(),
                }),
                ...(dto.service_date !== undefined && {
                    service_date: new Date(dto.service_date),
                }),
                ...(dto.cost !== undefined && { cost: dto.cost }),
                ...(dto.notes !== undefined && { notes: dto.notes.trim() || null }),
            },
        });
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        await this.prisma.maintenance.delete({
            where: { id },
        });
        return { message: 'Catatan servis berhasil dihapus' };
    }
};
MaintenancesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], MaintenancesService);
export { MaintenancesService };
//# sourceMappingURL=maintenances.service.js.map