import React from 'react';
import { socket } from "@/pages/Home";

export default function TempRandomMatch() {
    let roomName: string;

    socket.on('matchStartCheck', (payload: string) => {
        roomName = payload;
    });

    const handleRandom = () => {
        socket.emit('randomMatchApply');
    }

    const handleAccept = () => {
        socket.emit('matchAccept', `${roomName}`)
    }

    return (
        <div>
            <button onClick={handleRandom}>
                랜덤매치
            </button>
            <button onClick={handleAccept}>
                수락
            </button>
            <button onClick={handleAccept}>
                수락
            </button>
        </div>
    )
}