import { IsNotEmpty } from 'class-validator';

export class OneOnOnePayload {
    @IsNotEmpty()
    from: string;
    @IsNotEmpty()
    to: string;
    @IsNotEmpty()
    mode: string;
}