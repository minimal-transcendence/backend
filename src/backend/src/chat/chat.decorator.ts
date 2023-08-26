import { Injectable, CanActivate, 
	createParamDecorator, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { log } from 'console';

@Injectable()
export class CustomWebSocketGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
	const data = context.switchToWs().getData();
    
	console.log(client);
	console.log(data);
    const isValid = true;
    
    if (!isValid) {
      throw new WsException('WebSocket connection validation failed');
    }
    
    return true;
  }
}

export const chatSocket = createParamDecorator(
	(data: string, context: ExecutionContext) => {
	  const socket = context.switchToWs().getClient();
	  return socket;
	},
);

export const RoomName = createParamDecorator(
	(data: string, context: ExecutionContext) => {
	//   const socket = context.switchToWs().getClient();
	  // Your validation logic for room name
	//   console.log(socket.handshake.query.roomName);
	  console.log("----roomName");	//첫번째는 Socket. data type지정 별 상관 없는듯
	  const [roomName] = context.getArgs();
	  console.log(roomName);
	  return roomName;
	},
);

export const VarId = createParamDecorator(
	(data: string, context: ExecutionContext) => {
	//   const socket = context.switchToWs().getClient();
	  // Your validation logic for room name
	//   console.log(socket.handshake.query.roomName);
	  console.log("----varId");
	  const [, varId] = context.getArgs();	//여기서 이미 array로 받는다
	  console.log(varId);
	  return parseInt(varId);
	},
  );

export const VarId2 = createParamDecorator(
	(data: string, context: ExecutionContext) => {
	//   const socket = context.switchToWs().getClient();
	  // Your validation logic for room name
	//   console.log(socket.handshake.query.roomName);
	  console.log("----varId2");
	  const [, , varId2] = context.getArgs();
	  console.log(varId2);
	  return parseInt(varId2);
	},
  );
