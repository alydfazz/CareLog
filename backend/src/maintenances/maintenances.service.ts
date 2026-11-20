import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { QueryMaintenanceDto } from './dto/query-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Injectable()
export class MaintenancesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateMaintenanceDto) {
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

  async findAll(userId: number, query: QueryMaintenanceDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 5;
    const skip = (page - 1) * limit;

    const where: Prisma.MaintenanceWhereInput = { userId };

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

    // Hitung ringkasan keseluruhan per barang dan total biaya user
    const itemMap = new Map<
      string,
      {
        itemName: string;
        lastServiceDate: Date;
        lastServiceType: string;
        totalCost: number;
        count: number;
      }
    >();

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
      } else {
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

  async findOne(id: number, userId: number) {
    const maintenance = await this.prisma.maintenance.findFirst({
      where: { id, userId },
    });

    if (!maintenance) {
      throw new NotFoundException(
        `Catatan servis dengan ID ${id} tidak ditemukan`,
      );
    }

    return maintenance;
  }

  async update(id: number, userId: number, dto: UpdateMaintenanceDto) {
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

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    await this.prisma.maintenance.delete({
      where: { id },
    });

    return { message: 'Catatan servis berhasil dihapus' };
  }
}