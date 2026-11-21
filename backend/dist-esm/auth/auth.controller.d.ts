import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(req: {
        user: {
            userId: number;
            refreshToken: string;
        };
    }): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(req: {
        user: {
            userId: number;
        };
    }): Promise<{
        message: string;
    }>;
}
