
export type JwtPayload = {
    id: number;
    email: string;
}

export type Login = {
    id: number;
    email: string;
    nickname: string;
    is2faEnabled: boolean,
    isNewUser: boolean ;
}