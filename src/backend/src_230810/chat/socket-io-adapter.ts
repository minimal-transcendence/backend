import { INestApplicationContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { SocketWithAuth } from './types';

export class SocketIOAdapter extends IoAdapter {
    private readonly logger = new Logger(SocketIOAdapter.name);
    constructor(
        private app: INestApplicationContext
    ) {
        super(app);
    }

    createIOServer(port: number, options?: ServerOptions) {
        this.logger.log('웹소켓 서버 생성 - socket.io');

        const jwtService = this.app.get(JwtService);
        const server: Server = super.createIOServer(port, options);

        server.of('chat').use(createJwtMiddleware(jwtService, this.logger));

        return server;
    }
}

const createJwtMiddleware = (jwtService: JwtService, logger: Logger) =>
(socket: SocketWithAuth, next) => {
    // header에 담는 건 테스트용
    /*
    const io = require("socket.io-client");

    const socket = io("ws://example.com/my-namespace", {
    reconnectionDelayMax: 10000,
    auth: {           <========================
        token: "123"  <========================
    },
    query: {
        "my-key": "my-value"
    }
    });
    */
    const token =
        socket.handshake.auth.token || socket.handshake.headers['token'];

    logger.debug(`Validating jwt token before connection: ${token}`);

    try {
        const payload = jwtService.verify(token, {
            secret: process.env.JWT_ACCESS_TOKEN_SECRET
        });
        socket.userId = payload.id;
        next();
    } catch {
        next(new Error('FORBIDDEN'));
    }
};