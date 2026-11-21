import { createRequire } from 'module'; import { fileURLToPath } from 'url'; import { dirname } from 'path'; const require = createRequire(import.meta.url); const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);

// dist-esm/serverless.js
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";

// dist-esm/app.module.js
import { Module as Module4 } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

// dist-esm/auth/auth.module.js
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

// dist-esm/auth/auth.controller.js
import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";

// dist-esm/auth/auth.service.js
import { ConflictException, ForbiddenException, Injectable as Injectable2, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { createHash } from "crypto";

// dist-esm/prisma/prisma.service.js
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaService = class PrismaService2 extends PrismaClient {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
};
PrismaService = __decorate([
  Injectable()
], PrismaService);

// dist-esm/auth/auth.service.js
var __decorate2 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService = class AuthService2 {
  prisma;
  jwtService;
  configService;
  constructor(prisma, jwtService, configService) {
    this.prisma = prisma;
    this.jwtService = jwtService;
    this.configService = configService;
  }
  hashTokenForBcrypt(token) {
    return createHash("sha256").update(token).digest("hex");
  }
  async generateTokens(userId, email) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow("JWT_SECRET"),
        expiresIn: "15m"
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow("JWT_REFRESH_SECRET"),
        expiresIn: "7d"
      })
    ]);
    return { access_token: accessToken, refresh_token: refreshToken };
  }
  async updateRefreshTokenHash(userId, refreshToken) {
    const digest = this.hashTokenForBcrypt(refreshToken);
    const hashed = await bcrypt.hash(digest, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hashed }
    });
  }
  async register(dto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (existingUser) {
      throw new ConflictException("Email sudah terdaftar");
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    return {
      message: "Registrasi berhasil",
      user
    };
  }
  async login(dto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (!user) {
      throw new UnauthorizedException("Email belum terdaftar");
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Email atau password salah");
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }
  async refreshTokens(userId, refreshToken) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException("Akses ditolak, silakan login ulang");
    }
    const digest = this.hashTokenForBcrypt(refreshToken);
    const isRefreshTokenValid = await bcrypt.compare(digest, user.hashedRefreshToken);
    if (!isRefreshTokenValid) {
      throw new ForbiddenException("Refresh token tidak valid");
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }
  async logout(userId) {
    await this.prisma.user.updateMany({
      where: { id: userId, hashedRefreshToken: { not: null } },
      data: { hashedRefreshToken: null }
    });
    return { message: "Logout berhasil" };
  }
};
AuthService = __decorate2([
  Injectable2(),
  __metadata("design:paramtypes", [
    PrismaService,
    JwtService,
    ConfigService
  ])
], AuthService);

// dist-esm/auth/dto/login.dto.js
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
var __decorate3 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata2 = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LoginDto = class {
  email;
  password;
};
__decorate3([
  IsEmail({}, { message: "Format email tidak valid" }),
  __metadata2("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate3([
  IsString(),
  IsNotEmpty({ message: "Password wajib diisi" }),
  __metadata2("design:type", String)
], LoginDto.prototype, "password", void 0);

// dist-esm/auth/dto/register.dto.js
import { IsEmail as IsEmail2, IsNotEmpty as IsNotEmpty2, IsString as IsString2, MinLength } from "class-validator";
var __decorate4 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata3 = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RegisterDto = class {
  name;
  email;
  password;
};
__decorate4([
  IsString2(),
  IsNotEmpty2({ message: "Nama lengkap wajib diisi" }),
  __metadata3("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate4([
  IsEmail2({}, { message: "Format email tidak valid" }),
  __metadata3("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate4([
  IsString2(),
  MinLength(6, { message: "Password minimal 6 karakter" }),
  __metadata3("design:type", String)
], RegisterDto.prototype, "password", void 0);

// dist-esm/auth/jwt-auth.guard.js
import { Injectable as Injectable3 } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
var __decorate5 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JwtAuthGuard = class JwtAuthGuard2 extends AuthGuard("jwt") {
};
JwtAuthGuard = __decorate5([
  Injectable3()
], JwtAuthGuard);

// dist-esm/auth/jwt-refresh.guard.js
import { Injectable as Injectable4 } from "@nestjs/common";
import { AuthGuard as AuthGuard2 } from "@nestjs/passport";
var __decorate6 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JwtRefreshGuard = class JwtRefreshGuard2 extends AuthGuard2("jwt-refresh") {
};
JwtRefreshGuard = __decorate6([
  Injectable4()
], JwtRefreshGuard);

// dist-esm/auth/auth.controller.js
var __decorate7 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata4 = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var AuthController = class AuthController2 {
  authService;
  constructor(authService) {
    this.authService = authService;
  }
  register(dto) {
    return this.authService.register(dto);
  }
  login(dto) {
    return this.authService.login(dto);
  }
  refresh(req) {
    return this.authService.refreshTokens(req.user.userId, req.user.refreshToken);
  }
  logout(req) {
    return this.authService.logout(req.user.userId);
  }
};
__decorate7([
  Post("register"),
  __param(0, Body()),
  __metadata4("design:type", Function),
  __metadata4("design:paramtypes", [RegisterDto]),
  __metadata4("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate7([
  HttpCode(HttpStatus.OK),
  Post("login"),
  __param(0, Body()),
  __metadata4("design:type", Function),
  __metadata4("design:paramtypes", [LoginDto]),
  __metadata4("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate7([
  UseGuards(JwtRefreshGuard),
  HttpCode(HttpStatus.OK),
  Post("refresh"),
  __param(0, Request()),
  __metadata4("design:type", Function),
  __metadata4("design:paramtypes", [Object]),
  __metadata4("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate7([
  UseGuards(JwtAuthGuard),
  HttpCode(HttpStatus.OK),
  Post("logout"),
  __param(0, Request()),
  __metadata4("design:type", Function),
  __metadata4("design:paramtypes", [Object]),
  __metadata4("design:returntype", void 0)
], AuthController.prototype, "logout", null);
AuthController = __decorate7([
  Controller("auth"),
  __metadata4("design:paramtypes", [AuthService])
], AuthController);

// dist-esm/auth/jwt-refresh.strategy.js
import { Injectable as Injectable5, UnauthorizedException as UnauthorizedException2 } from "@nestjs/common";
import { ConfigService as ConfigService2 } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
var __decorate8 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata5 = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtRefreshStrategy = class JwtRefreshStrategy2 extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(configService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow("JWT_REFRESH_SECRET"),
      passReqToCallback: true
    });
  }
  async validate(req, payload) {
    const refreshToken = req.get("authorization")?.replace("Bearer", "").trim();
    if (!refreshToken) {
      throw new UnauthorizedException2("Refresh token tidak ditemukan");
    }
    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken
    };
  }
};
JwtRefreshStrategy = __decorate8([
  Injectable5(),
  __metadata5("design:paramtypes", [ConfigService2])
], JwtRefreshStrategy);

// dist-esm/auth/jwt.strategy.js
import { Injectable as Injectable6 } from "@nestjs/common";
import { ConfigService as ConfigService3 } from "@nestjs/config";
import { PassportStrategy as PassportStrategy2 } from "@nestjs/passport";
import { ExtractJwt as ExtractJwt2, Strategy as Strategy2 } from "passport-jwt";
var __decorate9 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata6 = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtStrategy = class JwtStrategy2 extends PassportStrategy2(Strategy2, "jwt") {
  constructor(configService) {
    super({
      jwtFromRequest: ExtractJwt2.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow("JWT_SECRET")
    });
  }
  async validate(payload) {
    return { userId: payload.sub, email: payload.email };
  }
};
JwtStrategy = __decorate9([
  Injectable6(),
  __metadata6("design:paramtypes", [ConfigService3])
], JwtStrategy);

// dist-esm/auth/auth.module.js
var __decorate10 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthModule = class AuthModule2 {
};
AuthModule = __decorate10([
  Module({
    imports: [PassportModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, JwtRefreshStrategy]
  })
], AuthModule);

// dist-esm/maintenances/maintenances.module.js
import { Module as Module2 } from "@nestjs/common";

// dist-esm/maintenances/maintenances.controller.js
import { Body as Body2, Controller as Controller2, Delete, Get, Param, ParseIntPipe, Patch, Post as Post2, Query, Request as Request2, UseGuards as UseGuards2 } from "@nestjs/common";

// dist-esm/maintenances/dto/create-maintenance.dto.js
import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNotEmpty as IsNotEmpty3, IsOptional, IsString as IsString3, Min } from "class-validator";
var __decorate11 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata7 = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CreateMaintenanceDto = class {
  item_name;
  service_type;
  service_date;
  cost;
  notes;
};
__decorate11([
  IsString3(),
  IsNotEmpty3({ message: "Nama barang wajib diisi" }),
  __metadata7("design:type", String)
], CreateMaintenanceDto.prototype, "item_name", void 0);
__decorate11([
  IsString3(),
  IsNotEmpty3({ message: "Jenis servis wajib diisi" }),
  __metadata7("design:type", String)
], CreateMaintenanceDto.prototype, "service_type", void 0);
__decorate11([
  IsDateString({}, { message: "Format tanggal servis harus valid (YYYY-MM-DD)" }),
  __metadata7("design:type", String)
], CreateMaintenanceDto.prototype, "service_date", void 0);
__decorate11([
  Type(() => Number),
  IsInt({ message: "Biaya harus berupa angka bulat" }),
  Min(0, { message: "Biaya tidak boleh negatif" }),
  __metadata7("design:type", Number)
], CreateMaintenanceDto.prototype, "cost", void 0);
__decorate11([
  IsString3(),
  IsOptional(),
  __metadata7("design:type", String)
], CreateMaintenanceDto.prototype, "notes", void 0);

// dist-esm/maintenances/dto/query-maintenance.dto.js
import { Type as Type2 } from "class-transformer";
import { IsInt as IsInt2, IsOptional as IsOptional2, IsString as IsString4, Max, Min as Min2 } from "class-validator";
var __decorate12 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata8 = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QueryMaintenanceDto = class {
  page = 1;
  limit = 5;
  search;
  item_name;
};
__decorate12([
  IsOptional2(),
  Type2(() => Number),
  IsInt2(),
  Min2(1),
  __metadata8("design:type", Number)
], QueryMaintenanceDto.prototype, "page", void 0);
__decorate12([
  IsOptional2(),
  Type2(() => Number),
  IsInt2(),
  Min2(1),
  Max(50),
  __metadata8("design:type", Number)
], QueryMaintenanceDto.prototype, "limit", void 0);
__decorate12([
  IsOptional2(),
  IsString4(),
  __metadata8("design:type", String)
], QueryMaintenanceDto.prototype, "search", void 0);
__decorate12([
  IsOptional2(),
  IsString4(),
  __metadata8("design:type", String)
], QueryMaintenanceDto.prototype, "item_name", void 0);

// dist-esm/maintenances/dto/update-maintenance.dto.js
import { PartialType } from "@nestjs/mapped-types";
var UpdateMaintenanceDto = class extends PartialType(CreateMaintenanceDto) {
};

// dist-esm/maintenances/maintenances.service.js
import { Injectable as Injectable7, NotFoundException } from "@nestjs/common";
var __decorate13 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata9 = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MaintenancesService = class MaintenancesService2 {
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
        userId
      }
    });
  }
  async findAll(userId, query) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 5;
    const skip = (page - 1) * limit;
    const where = { userId };
    if (query.item_name && query.item_name.trim() !== "") {
      where.item_name = {
        equals: query.item_name.trim(),
        mode: "insensitive"
      };
    }
    if (query.search && query.search.trim() !== "") {
      const keyword = query.search.trim();
      where.OR = [
        { item_name: { contains: keyword, mode: "insensitive" } },
        { service_type: { contains: keyword, mode: "insensitive" } },
        { notes: { contains: keyword, mode: "insensitive" } }
      ];
    }
    const [data, filteredTotal, allUserRecords] = await Promise.all([
      this.prisma.maintenance.findMany({
        where,
        orderBy: [{ service_date: "desc" }, { id: "desc" }],
        skip,
        take: limit
      }),
      this.prisma.maintenance.count({ where }),
      this.prisma.maintenance.findMany({
        where: { userId },
        orderBy: [{ service_date: "desc" }, { id: "desc" }]
      })
    ]);
    const itemMap = /* @__PURE__ */ new Map();
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
          count: 1
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
        totalPages
      },
      summary: {
        totalCost,
        totalRecords: allUserRecords.length,
        items: Array.from(itemMap.values())
      }
    };
  }
  async findOne(id, userId) {
    const maintenance = await this.prisma.maintenance.findFirst({
      where: { id, userId }
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
        ...dto.item_name !== void 0 && { item_name: dto.item_name.trim() },
        ...dto.service_type !== void 0 && {
          service_type: dto.service_type.trim()
        },
        ...dto.service_date !== void 0 && {
          service_date: new Date(dto.service_date)
        },
        ...dto.cost !== void 0 && { cost: dto.cost },
        ...dto.notes !== void 0 && { notes: dto.notes.trim() || null }
      }
    });
  }
  async remove(id, userId) {
    await this.findOne(id, userId);
    await this.prisma.maintenance.delete({
      where: { id }
    });
    return { message: "Catatan servis berhasil dihapus" };
  }
};
MaintenancesService = __decorate13([
  Injectable7(),
  __metadata9("design:paramtypes", [PrismaService])
], MaintenancesService);

// dist-esm/maintenances/maintenances.controller.js
var __decorate14 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata10 = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param2 = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var MaintenancesController = class MaintenancesController2 {
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
__decorate14([
  Post2(),
  __param2(0, Request2()),
  __param2(1, Body2()),
  __metadata10("design:type", Function),
  __metadata10("design:paramtypes", [Object, CreateMaintenanceDto]),
  __metadata10("design:returntype", void 0)
], MaintenancesController.prototype, "create", null);
__decorate14([
  Get(),
  __param2(0, Request2()),
  __param2(1, Query()),
  __metadata10("design:type", Function),
  __metadata10("design:paramtypes", [Object, QueryMaintenanceDto]),
  __metadata10("design:returntype", void 0)
], MaintenancesController.prototype, "findAll", null);
__decorate14([
  Get(":id"),
  __param2(0, Request2()),
  __param2(1, Param("id", ParseIntPipe)),
  __metadata10("design:type", Function),
  __metadata10("design:paramtypes", [Object, Number]),
  __metadata10("design:returntype", void 0)
], MaintenancesController.prototype, "findOne", null);
__decorate14([
  Patch(":id"),
  __param2(0, Request2()),
  __param2(1, Param("id", ParseIntPipe)),
  __param2(2, Body2()),
  __metadata10("design:type", Function),
  __metadata10("design:paramtypes", [Object, Number, UpdateMaintenanceDto]),
  __metadata10("design:returntype", void 0)
], MaintenancesController.prototype, "update", null);
__decorate14([
  Delete(":id"),
  __param2(0, Request2()),
  __param2(1, Param("id", ParseIntPipe)),
  __metadata10("design:type", Function),
  __metadata10("design:paramtypes", [Object, Number]),
  __metadata10("design:returntype", void 0)
], MaintenancesController.prototype, "remove", null);
MaintenancesController = __decorate14([
  UseGuards2(JwtAuthGuard),
  Controller2("maintenances"),
  __metadata10("design:paramtypes", [MaintenancesService])
], MaintenancesController);

// dist-esm/maintenances/maintenances.module.js
var __decorate15 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MaintenancesModule = class MaintenancesModule2 {
};
MaintenancesModule = __decorate15([
  Module2({
    controllers: [MaintenancesController],
    providers: [MaintenancesService]
  })
], MaintenancesModule);

// dist-esm/prisma/prisma.module.js
import { Global, Module as Module3 } from "@nestjs/common";
var __decorate16 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaModule = class PrismaModule2 {
};
PrismaModule = __decorate16([
  Global(),
  Module3({
    providers: [PrismaService],
    exports: [PrismaService]
  })
], PrismaModule);

// dist-esm/app.module.js
var __decorate17 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AppModule = class AppModule2 {
};
AppModule = __decorate17([
  Module4({
    imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      PrismaModule,
      AuthModule,
      MaintenancesModule
    ]
  })
], AppModule);

// dist-esm/serverless.js
var cachedApp;
async function handler(req, res) {
  try {
    if (!cachedApp) {
      const app = await NestFactory.create(AppModule);
      app.enableCors({
        origin: process.env.FRONTEND_URL || "*",
        credentials: true
      });
      app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true
      }));
      await app.init();
      cachedApp = app.getHttpAdapter().getInstance();
    }
    return cachedApp(req, res);
  } catch (error) {
    console.error("Serverless error:", error);
    return res.status(500).json({
      message: error?.message || "Unknown error",
      stack: error?.stack
    });
  }
}
export {
  handler as default
};
