import { INestApplicationContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { ChatSocket } from './types';
import { GameSocket } from 'src/game/types';

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

        // server.of('chat').use(createJwtMiddleware(jwtService, this.logger));
        // server.of('game').use(createJwtMiddleware(jwtService, this.logger));

        return server;
    }
}

const createJwtMiddleware = (jwtService: JwtService, logger: Logger) =>
(socket: ChatSocket | GameSocket, next) => {
    const token =
        socket.handshake.auth.token;

	console.log(`${token}`);
    logger.debug(`Validating jwt token before connection: ${token}`);

    try {
        const payload = jwtService.verify(token, {
            secret: process.env.JWT_ACCESS_TOKEN_SECRET
        });
        socket.userId = payload.id;
        socket.email = payload.email;
        // socket.inGame = false;
        next();
    } catch {
        next(new Error('FORBIDDEN'));
    }
};

const add = function(x) {
    return function(y) {
        return x + y;
    }
}
