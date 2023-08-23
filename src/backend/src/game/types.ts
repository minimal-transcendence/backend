import { Socket } from "socket.io"

export type Invitation = {
    from: string;
    to: string;
    mode: string;
}

type Player = {
    nickname: string;
    inGame: boolean;
    invitationList: Invitation[];
}

type JwtPayload = {
    userId: string;
    email: string;
}

export type KeydownPayload = {
    roomName: string;
    key: string;
}

// export type OneOnOneInvite = {
//     to: string;
//     mode: string;
// }

// export type OneOnOneAccept = {
//     from: string;
//     mode: string;
// }

export type GameRoomParams = {
    name: string;
    player: GameSocket[];
    mode: string;
}

// export type MatchStartCheckPayload = {
//     roomName: string;
//     playerNickname: string[];
//     mode: string;
// }

export type GameSocket = Socket & JwtPayload & Player;