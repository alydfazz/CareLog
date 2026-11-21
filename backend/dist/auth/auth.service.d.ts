import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    private hashTokenForBcrypt;
    private generateTokens;
    private updateRefreshTokenHash;
    register(dto: RegisterDto): Promise<{
        message: string;
        user: {
            email: string;
            name: string;
            id: number;
            createdAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
        };
        access_token: string;
        refresh_token: string;
    }>;
    refreshTokens(userId: number, refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(userId: number): Promise<{
        message: string;
    }>;
}
