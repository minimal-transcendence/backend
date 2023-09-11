import { GameContent, GameContext } from "@/context/game";
import { SocketContent, SocketContext } from "@/context/socket";
import React, { useContext, useState, useEffect } from "react";
import { AutoSave } from "./Pong";
// import { socket } from "@/pages/Home";
import styles_profile from "../../../styles/UserProfileStyle.module.css";
export default function TempRandomMatch() {
  // const gameData = useContext<GameContent>(GameContext).gameData;
  const roomName = useContext(GameContext).roomName;
  const socket = useContext(SocketContext).gameSocket;

  // const [roomName, setRoomName] = useState<string>('');
  // const [matchStartCheck, setMatchStartCheck] = useState<boolean>(false);

  // const socket = useContext(SocketContext).gameSocket;

  // useEffect(() => {
  //     const item = localStorage.getItem("gameRoomData");
  //     if (item) {
  //     const saved = JSON.parse(item);
  //     setRoomName(saved.roomName);
  //     }

  //     socket.on('matchStartCheck', (payload: AutoSave) => {
  //         // localStorage.setItem("game_room", payload.roomName);
  //         localStorage.setItem("gameRoomData", JSON.stringify({
  //             roomName: payload.roomName,
  //             inGame: false,
  //             // inLobby: true,
  //             gameOver: false,
  //             player: [],
  //             canvasWidth: 0,
  //             canvasHeight: 0,
  //             paddleWidth: 0,
  //             paddleHeight: 0,
  //             ballRadius: 0,
  //             winner: '',
  //             loser: '',
  //         }))
  //         console.log(`${payload.roomName} is checking`);
  //         setRoomName(payload.roomName);
  //         setMatchStartCheck(true);
  //     });

  //     socket.on('matchDecline', (payload: string) => {
  //         console.log(`${payload} is declined`);
  //     })
  // }, [roomName])

  const handleAccept = () => {
    socket.emit("matchAccept", `${roomName}`);
    console.log("In handleAccept:", roomName);
  };

  const handleDecline = () => {
    socket.emit("matchDecline", `${roomName}`);
  };

  // const handleRandomCancel = () => {
  //     socket.emit('randomMatchCancel');
  // }

  // const handleRandom = () => {
  //     socket.emit('randomMatchApply');
  //     // socket.emit('randomMatchApply', 'easy');
  //     // socket.emit('randomMatchApply', 'normal');
  //     // socket.emit('randomMatchApply', 'hard');

  // }

  return (
    <div className={styles_profile.small_div}>
      <div className={styles_profile.buttons_middle}>
        {/* <button onClick={handleRandom}>
                랜덤매치
            </button>
            <button onClick={handleRandomCancel}>
                랜덤매치취소
            </button> */}

        <button className={styles_profile.gameButton} onClick={handleAccept}>
          수락
        </button>
        <button className={styles_profile.blockButton} onClick={handleDecline}>
          거절
        </button>
      </div>
    </div>
  );
}
