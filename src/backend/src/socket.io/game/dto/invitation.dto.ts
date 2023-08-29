import { IsNotEmpty, IsNumber } from 'class-validator';

export class Invitation {
    @IsNotEmpty()
    from: string;

    @IsNotEmpty()
    @IsNumber()
    fromId: number;

    @IsNotEmpty()
    to: string;

    @IsNotEmpty()
    @IsNumber()
    toId: number;
    
    @IsNotEmpty()
    mode: string;
}