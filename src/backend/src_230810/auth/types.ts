import { Request } from 'express';

export type AuthPayload = {
    userId: number;
    email: string;
}

// export type RequestWithAuth = Request & 