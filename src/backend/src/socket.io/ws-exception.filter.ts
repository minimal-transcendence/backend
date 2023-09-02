import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException, HttpException)
export class WsExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  public handleError(client: Socket, exception: HttpException | WsException) {
    if (exception instanceof HttpException) {
      // handle http exception
      console.log("HttpException: invalid data transfer");
      console.log(exception.message)
    } else {
      // handle websocket exception
      console.log("WsException: invalid data transfer");
      console.log(exception.message)
    }
  }
}