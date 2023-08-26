import { SocketContext } from '@/pages/App';
import React, { useContext, useState, useEffect } from 'react';
import { AutoSave } from './Pong';
// import { socket } from "@/pages/Home";

export default function TempRandomMatch() {
    const [roomName, setRoomName] = useState<string>('');

    const socket = useContext(SocketContext).gameSocket;

    useEffect(() => {
        const item = localStorage.getItem("gameRoomData");
        if (item) {
        const saved = JSON.parse(item);
        setRoomName(saved.roomName);
        }

        socket.on('matchStartCheck', (payload: AutoSave) => {
            // localStorage.setItem("game_room", payload.roomName);
            localStorage.setItem("gameRoomData", JSON.stringify({
                roomName: payload.roomName,
                inGame: false,
                // inLobby: true,
                gameOver: false,
                player: [],
                canvasWidth: 0,
                canvasHeight: 0,
                paddleWidth: 0,
                paddleHeight: 0,
                ballRadius: 0,
                winner: '',
                loser: '',
            }))
            console.log(`${payload.roomName} is checking`);
            setRoomName(payload.roomName);
        });

        socket.on('matchDecline', (payload: string) => {
            console.log(`${payload} is declined`);
        })

        

        
    }, [roomName])

    const handleAccept = () => {
        socket.emit('matchAccept', `${roomName}`);
        console.log("In handleAccept:", roomName);
    }

    const handleDecline = () => {
        socket.emit('matchDecline', `${roomName}`);
    }

    const handleRandomCancel = () => {
        socket.emit('randomMatchCancel');
    }

    const handleRandom = () => {
        socket.emit('randomMatchApply');
        // socket.emit('randomMatchApply', 'easy');
        // socket.emit('randomMatchApply', 'normal');
        // socket.emit('randomMatchApply', 'hard');
        
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
