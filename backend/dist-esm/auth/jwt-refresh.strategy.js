var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
let JwtRefreshStrategy = class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(configService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }
    async validate(req, payload) {
        const refreshToken = req.get('authorization')?.replace('Bearer', '').trim();
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token tidak ditemukan');
        }
        return {
            userId: payload.sub,
            email: payload.email,
            refreshToken,
        };
    }
};
JwtRefreshStrategy = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], JwtRefreshStrategy);
export { JwtRefreshStrategy };
//# sourceMappingURL=jwt-refresh.strategy.js.map