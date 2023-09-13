import { BadRequestException } from '@nestjs/common';


class ErrorCodeVo {
	readonly status : number;
	readonly message : string;
  
	constructor(status : number, message : string) {
	  this.status = status;
	  this.message = message;
	}
  }
  
export type ErrorCode = ErrorCodeVo;
  
export const ENTITY_NOT_FOUND = new ErrorCodeVo(404, 'Entity Not Found');

export const EntityNotFoundException = (message?: string): ServiceException => {
	return new ServiceException(ENTITY_NOT_FOUND, message);
};
  
export class ServiceException extends BadRequestException{
readonly errorCode: ErrorCode;

constructor(errorCode: ErrorCode, message?: string) {
	if (!message) {
	message = errorCode.message;
	}

	super(message);

	this.errorCode = errorCode;
}
}