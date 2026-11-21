var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards, } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { QueryMaintenanceDto } from './dto/query-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenancesService } from './maintenances.service';
let MaintenancesController = class MaintenancesController {
    maintenancesService;
    constructor(maintenancesService) {
        this.maintenancesService = maintenancesService;
    }
    create(req, dto) {
        return this.maintenancesService.create(req.user.userId, dto);
    }
    findAll(req, query) {
        return this.maintenancesService.findAll(req.user.userId, query);
    }
    findOne(req, id) {
        return this.maintenancesService.findOne(id, req.user.userId);
    }
    update(req, id, dto) {
        return this.maintenancesService.update(id, req.user.userId, dto);
    }
    remove(req, id) {
        return this.maintenancesService.remove(id, req.user.userId);
    }
};
__decorate([
    Post(),
    __param(0, Request()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateMaintenanceDto]),
    __metadata("design:returntype", void 0)
], MaintenancesController.prototype, "create", null);
__decorate([
    Get(),
    __param(0, Request()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, QueryMaintenanceDto]),
    __metadata("design:returntype", void 0)
], MaintenancesController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    __param(0, Request()),
    __param(1, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MaintenancesController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    __param(0, Request()),
    __param(1, Param('id', ParseIntPipe)),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, UpdateMaintenanceDto]),
    __metadata("design:returntype", void 0)
], MaintenancesController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, Request()),
    __param(1, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MaintenancesController.prototype, "remove", null);
MaintenancesController = __decorate([
    UseGuards(JwtAuthGuard),
    Controller('maintenances'),
    __metadata("design:paramtypes", [MaintenancesService])
], MaintenancesController);
export { MaintenancesController };
//# sourceMappingURL=maintenances.controller.js.map