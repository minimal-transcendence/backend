import { GameContent, GameContext } from "@/context/game";
import { SocketContent, SocketContext } from "@/context/socket";
import React, { useContext, useState, useEffect } from 'react';
import { AutoSave } from './Pong';
// import { socket } from "@/pages/Home";

export default function TempRandomMatch() {
    const roomName = useContext(GameContext).roomName;
    const socket = useContext(SocketContext).gameSocket;

    const handleAccept = () => {
        socket.emit('matchAccept', `${roomName}`);
    }

    const handleDecline = () => {
        socket.emit('matchDecline', `${roomName}`);
    }
    return (
        <div>
            {/* <button onClick={handleRandom}>
                랜덤매치
            </button>
            <button onClick={handleRandomCancel}>
                랜덤매치취소
            </button> */}
            <button onClick={handleAccept}>
                수락
            </button>
            <button onClick={handleDecline}>
                거절
            </button>
        </div>
    )
}
