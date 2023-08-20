import React, { useState, useEffect } from 'react';
import { socket } from "@/pages/Home";

export default function TempRandomMatch() {
    const [roomName, setRoomName] = useState<string>("");

    useEffect(() => {
        socket.on('matchStartCheck', (payload: string) => {
            setRoomName(payload);
        });
    }, [roomName]);

    // let roomName: string;

    

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
        </div>
    )
}