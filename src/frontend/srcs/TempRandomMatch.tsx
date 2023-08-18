import React from 'react';
import { socket } from "@/pages/Home";

export default function TempRandomMatch() {
    let roomName: string;

    socket.on('randomMatchStartCheck', (payload: string) => {
        roomName = payload;
    });

    const handleRandom = () => {
        socket.emit('randomMatchApply');
    }

    const handleAccept = () => {
        socket.emit('randomMatchAccept', `${roomName}`)
    }

    return (
        <div>
            <button onClick={handleRandom}>
                랜덤매치
            </button>
            <button onClick={handleAccept}>
                수락
            </button>
        </div>
    )
}