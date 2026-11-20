"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenancesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_maintenance_dto_1 = require("./dto/create-maintenance.dto");
const query_maintenance_dto_1 = require("./dto/query-maintenance.dto");
const update_maintenance_dto_1 = require("./dto/update-maintenance.dto");
const maintenances_service_1 = require("./maintenances.service");
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
exports.MaintenancesController = MaintenancesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_maintenance_dto_1.CreateMaintenanceDto]),
    __metadata("design:returntype", void 0)
], MaintenancesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_maintenance_dto_1.QueryMaintenanceDto]),
    __metadata("design:returntype", void 0)
], MaintenancesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MaintenancesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_maintenance_dto_1.UpdateMaintenanceDto]),
    __metadata("design:returntype", void 0)
], MaintenancesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MaintenancesController.prototype, "remove", null);
exports.MaintenancesController = MaintenancesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('maintenances'),
    __metadata("design:paramtypes", [maintenances_service_1.MaintenancesService])
], MaintenancesController);
//# sourceMappingURL=maintenances.controller.js.map