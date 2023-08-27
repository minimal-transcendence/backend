import { useEffect, useState, useContext } from "react";
import { SocketContext } from "@/pages/App";
import menuIcon from "../../../assets/menu.png";
import ysungwonIcon from "../../../assets/ysungwon.jpg";

import UserProfile from "../../../srcs/UserProfile";
import Image from "next/image";

export default function ChatRoomUserInfo({
  user,
  num,
  roomInfo,
  setRoomInfo,
  roomname,
  myNickName,
  id,
}: {
  user: any;
  num: number;
  roomInfo: any;
  setRoomInfo: any;
  roomname: string;
  myNickName: string;
  id: any;
}) {
  const socket = useContext(SocketContext).chatSocket;
  const [userProfileModal, setUserProfileModal] = useState<boolean>(false);

  // async function getImgURL(id: string) {
  //   const thisUser = await fetch("http://localhost/api/user/" + id);
  //   const data = await thisUser.json();
  //   console.log("/api/" + data.avatar);
  // }

  console.log("in ChatRoomUserInfom user: ", JSON.stringify(user, null, 2));
  function handleMenu(event: any) {
    if (event.target.dataset.name) {
      console.log(
        `${myNickName}가 ${user?.nickname}를 ${roomname}에서 ${event.target.dataset.name}클릭!!!`
      );
      const targetnickname = user?.nickname;
      if (event.target.dataset.name === "kick") {
        console.log("target nickname : " + targetnickname);
        socket.emit("kickUser", roomname, targetnickname);
      } else if (event.target.dataset.name === "profile") {
        console.log("in profileUser ", targetnickname, user?.id, id);
        // socket.emit("profileUser", roomname, targetnickname);
        setUserProfileModal(() => !userProfileModal);
        // setUserProfileID(()=> user?.id)
      } else if (event.target.dataset.name === "ban") {
        console.log("in banUser ", roomname, targetnickname);
        socket.emit("banUser", roomname, targetnickname);
      } else if (event.target.dataset.name === "mute") {
        console.log("in muteUser ", roomname, targetnickname);
        socket.emit("muteUser", roomname, targetnickname);
      } else if (event.target.dataset.name === "block") {
        console.log("in blockUser ", targetnickname);
        socket.emit("blockUser", targetnickname);
      } else if (event.target.dataset.name === "opAdd") {
        console.log("in addOperator ", roomname, targetnickname);
        socket.emit("addOperator", roomname, targetnickname);
      } else if (event.target.dataset.name === "opDelete") {
        console.log("in deleteOperator ", roomname, targetnickname);
        socket.emit("deleteOperator", roomname, targetnickname);
      } else if (event.target.dataset.name === "dmApply")
        socket.emit("selectDMRoom", targetnickname);
      else if (event.target.dataset.name === "oneVsOne")
        socket.emit("oneVsOneApply", targetnickname, "oneVsOne", "normal");
    } else {
      console.log("you click other");
    }
  }
  // getImgURL(id);
  return (
    <>
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
          {roomInfo?.owner === user?.nickname ? "🔱" : ""}
          {roomInfo?.operators.includes(user?.nickname) ? "⚜️" : ""}{" "}
          {user?.nickname}
          {user?.nickname === myNickName ? "🎆" : ""}
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
              <div data-name="profile">Profile</div>
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
      <div>
        {userProfileModal && (
          <>
            <UserProfile id={user?.id} setIsOpenModal={setUserProfileModal} />
          </>
        )}
      </div>
    </>
  );
}
