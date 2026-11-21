var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min, } from 'class-validator';
export class CreateMaintenanceDto {
    item_name;
    service_type;
    service_date;
    cost;
    notes;
}
__decorate([
    IsString(),
    IsNotEmpty({ message: 'Nama barang wajib diisi' }),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "item_name", void 0);
__decorate([
    IsString(),
    IsNotEmpty({ message: 'Jenis servis wajib diisi' }),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "service_type", void 0);
__decorate([
    IsDateString({}, { message: 'Format tanggal servis harus valid (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "service_date", void 0);
__decorate([
    Type(() => Number),
    IsInt({ message: 'Biaya harus berupa angka bulat' }),
    Min(0, { message: 'Biaya tidak boleh negatif' }),
    __metadata("design:type", Number)
], CreateMaintenanceDto.prototype, "cost", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "notes", void 0);
//# sourceMappingURL=create-maintenance.dto.js.map