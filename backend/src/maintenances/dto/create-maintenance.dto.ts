import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama barang wajib diisi' })
  item_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Jenis servis wajib diisi' })
  service_type: string;

  @IsDateString({}, { message: 'Format tanggal servis harus valid (YYYY-MM-DD)' })
  service_date: string;

  @Type(() => Number)
  @IsInt({ message: 'Biaya harus berupa angka bulat' })
  @Min(0, { message: 'Biaya tidak boleh negatif' })
  cost: number;

  @IsString()
  @IsOptional()
  notes?: string;
}