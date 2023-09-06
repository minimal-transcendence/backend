import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException, HttpException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const payload = host.switchToWs().getData();
    console.log(`${exception.name} - invalid data transfer: ${payload}`);
  }
}