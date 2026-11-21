"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
let cachedApp;
async function handler(req, res) {
    try {
        if (!cachedApp) {
            const app = await core_1.NestFactory.create(app_module_1.AppModule);
            app.enableCors({
                origin: process.env.FRONTEND_URL || '*',
                credentials: true,
            });
            app.useGlobalPipes(new common_1.ValidationPipe({
                whitelist: true,
                transform: true,
            }));
            await app.init();
            cachedApp = app.getHttpAdapter().getInstance();
        }
        return cachedApp(req, res);
    }
    catch (error) {
        console.error('Serverless error:', error);
        return res.status(500).json({
            message: error?.message || 'Unknown error',
            stack: error?.stack,
        });
    }
}
//# sourceMappingURL=serverless.js.map