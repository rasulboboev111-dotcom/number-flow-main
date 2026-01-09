import express from 'express';
import cors from 'cors';
import path from 'path';
import sequelize from './database.js';
import './models/Manager.js';
import './models/Operator.js';
import './models/Category.js';
import './models/Subscriber.js';
import './models/PhoneNumber.js';
import './models/Setting.js';
import authRoutes from './routes/authRoutes.js';
import numberRoutes from './routes/numberRoutes.js';
import commonRoutes from './routes/commonRoutes.js';
import subsRoutes from './routes/subsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

import { fileURLToPath } from 'url';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
    const app = express();
    const PORT = process.env.PORT || 5000;

    // Logging & Security Middleware
    app.use(morgan(isProd ? 'combined' : 'dev'));
    app.use(helmet({
        contentSecurityPolicy: false,
    }));
    app.use(compression());
    app.use(cookieParser());
    app.use(cors({
        origin: true,
        credentials: true,
    }));

    // Health Check Endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', uptime: process.uptime() });
    });

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    });
    app.use('/api/', limiter);

    app.use(express.json());
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/numbers', numberRoutes);
    app.use('/api/subs', subsRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api', commonRoutes);

    // Vite SSR setup
    let vite: any;
    if (!isProd) {
        vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'custom'
        });
        app.use(vite.middlewares);
    } else {
        // Cache static assets in production
        app.use(express.static(path.resolve(__dirname, '../dist/client'), {
            index: false,
            maxAge: '1y',
            immutable: true,
        }));
    }

    // SSR Handler - Use '*path' for Express 5 catch-all (requires named parameters)
    app.get('*path', async (req, res) => {
        const url = req.originalUrl;

        try {
            let template, render;
            if (!isProd) {
                template = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
                template = await vite.transformIndexHtml(url, template);
                render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
            } else {
                template = fs.readFileSync(path.resolve(__dirname, '../dist/client/index.html'), 'utf-8');
                render = (await import('../dist/server/entry-server.js')).render;
            }

            const appHtml = await render(url);
            const html = template.replace('<!--ssr-outlet-->', appHtml);

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e: any) {
            if (!isProd) vite.ssrFixStacktrace(e);
            console.log(e.stack);
            res.status(500).end(e.stack);
        }
    });

    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        await sequelize.sync({ force: false });
        console.log('Database synced.');

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

startServer();
