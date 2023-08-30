import { IsNotEmpty } from 'class-validator';

export class KeydownPayload {
    @IsNotEmpty()
    roomName: string;
    @IsNotEmpty()
    key: string;
}