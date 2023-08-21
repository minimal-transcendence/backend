import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../../../context/socket";
import menuIcon from "../../../assets/menu.png";
import ysungwonIcon from "../../../assets/ysungwon.jpg";
import Image from "next/image";

export default function ChatRoomUserInfo({
  user,
  num,
  roomname,
  myNickName,
}: {
  user: any;
  num: number;
  roomname: string;
  myNickName: string;
}) {
  const socket = useContext(SocketContext);

  function handleMenu(event: any) {
    if (event.target.dataset.name) {
      console.log(
        `${myNickName}가 ${user?.nickname}를 ${roomname}에서 ${event.target.dataset.name}클릭!!!`
      );
      const targetnickname = user?.nickname;
      if (event.target.dataset.name === "kick") {
        console.log("target nickname : " + targetnickname);
        socket.emit("kickUser", roomname, targetnickname);
      } else if (event.target.dataset.name === "ban")
        socket.emit("banUser", roomname, targetnickname);
      else if (event.target.dataset.name === "mute")
        socket.emit("muteUser", roomname, targetnickname);
      else if (event.target.dataset.name === "block")
        socket.emit("blockUser", targetnickname);
      else if (event.target.dataset.name === "opAdd")
        socket.emit("addOperator", roomname, targetnickname);
      else if (event.target.dataset.name === "opDelete")
        socket.emit("deleteOperator", roomname, targetnickname);
      else if (event.target.dataset.name === "dmApply")
        socket.emit("selectDMRoom", targetnickname);
      else if (event.target.dataset.name === "oneVsOne")
        socket.emit("oneVsOneApply", targetnickname, "oneVsOne", 2);
    } else {
      console.log("you click other");
    }
  }

  return (
    <li>
      <div className="userlist-avatar">
        {/* <img src={ysungwonIcon} width="32" height="32" /> */}
        <Image
          className="avatar-img"
          src={ysungwonIcon}
          width="32"
          height="32"
          alt="avataricon"
        />
      </div>
      <p className="userlist-username">
        {user?.nickname} {user?.nickname === myNickName ? "🎆" : ""}
      </p>
      <div className="userlist-KBOM-box">
        <div className="dropdown">
          {/* <img className="dropbtn" src={menuIcon} width="15" height="15" /> */}
          <Image
            className="dropbtn"
            src={menuIcon}
            width="15"
            height="15"
            alt="menuicon"
          />
          <div onClick={() => handleMenu(event)} className="dropdown-content">
            <div data-name="kick">Kick</div>
            <div data-name="ban">Ban</div>
            <div data-name="mute">Mute</div>
            <div data-name="block">block</div>
            <div data-name="opAdd">Add Oper</div>
            <div data-name="opDelete">Delete Oper</div>
            <div data-name="dmApply">1:1 Chat</div>
            <div data-name="oneVsOne">1:1 Game</div>
          </div>
        </div>
      </div>
      <p className="userlist-userstatus-text">
        {(() => {
          const num = Math.trunc(Math.random() * 5);
          if (num === 0) return "밥 먹는 중";
          else if (num === 1) return "GOD님과 게임 하는 중";
          else if (num === 2) return "온라인";
          else if (num === 3) return "오프라인";
          else if (num === 4) return "자리비움";
        })()}
      </p>
    </li>
  );
}
