import { SocketContext } from '@/pages/App';
import React, { useContext } from 'react';
// import { socket } from "@/pages/Home";

export default function TempRandomMatch() {
    let roomName: string;

    const socket = useContext(SocketContext).gameSocket;

    socket.on('matchStartCheck', (payload: any) => {
        roomName = payload.roomName;
        console.log(`${payload.roomName} is checking`);
    });

    socket.on('matchDecline', (payload: string) => {
        console.log(`${payload} is declined`);
    })

    const handleRandom = () => {
        socket.emit('randomMatchApply');
        // socket.emit('randomMatchApply', 'easy');
        // socket.emit('randomMatchApply', 'normal');
        // socket.emit('randomMatchApply', 'hard');
        
    }

    const handleAccept = () => {
        socket.emit('matchAccept', `${roomName}`);
    }

    const handleDecline = () => {
        socket.emit('matchDecline', `${roomName}`);
    }

    const handleRandomCancel = () => {
        socket.emit('randomMatchCancel');
    }

    return (
        <div>
            <button onClick={handleRandom}>
                랜덤매치
            </button>
            <button onClick={handleRandomCancel}>
                랜덤매치취소
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
