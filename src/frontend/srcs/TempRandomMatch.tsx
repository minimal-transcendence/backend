import { AppContext } from '@/pages/App';
import React, { useContext } from 'react';
// import { socket } from "@/pages/Home";

export default function TempRandomMatch() {
    let roomName: string;

    const socket = useContext(AppContext).gameSocket;

    socket.on('matchStartCheck', (payload: string) => {
        roomName = payload;
        console.log(`${payload} is checking`);
    });

    socket.on('matchDecline', (payload: string) => {
        console.log(`${payload} is declined`);
    })

    const handleRandom = () => {
        socket.emit('randomMatchApply');
    }

    const handleAccept = () => {
        socket.emit('matchAccept', `${roomName}`);
    }

    const handleDecline = () => {
        socket.emit('matchDecline', `${roomName}`);
    }

    return (
        <div>
            <button onClick={handleRandom}>
                랜덤매치
            </button>
            <button onClick={handleAccept}>
                수락
            </button>
            <button onClick={handleDecline}>
                거절
            </button>
        </div>
    )
}