import { useEffect, useState, useContext } from "react";
import { SocketContext } from "@/context/socket";
import menuIcon from "../../../assets/menu.png";
import ysungwonIcon from "../../../assets/ysungwon.jpg";
import ModalOverlay from "../../components/modalpage/ModalOverlay";
import axios from "axios";
import UserProfile from "../../../srcs/UserProfile";
import Image from "next/image";
import axiosApi from "@/srcs/AxiosInterceptor";

export default function ChatRoomUserInfo({
  user,
  roomInfo,
  setRoomInfo,
  roomname,
  myNickName,
  id,
  changedID,
  changedNickName,
}: {
  user: any;
  roomInfo: any;
  setRoomInfo: any;
  roomname: string;
  myNickName: string;
  id: any;
  changedID: number;
  changedNickName: string;
}) {
  const socket = useContext(SocketContext).chatSocket;
  const gameSocket = useContext(SocketContext).gameSocket;
  const [userProfileModal, setUserProfileModal] = useState<boolean>(false);

  console.log("in ChatRoomUserInfo user: ", JSON.stringify(user, null, 2));
  console.log(
    "in ChatRoomUserInfo ",
    JSON.stringify(user?.nickname),
    JSON.stringify(myNickName)
  );
  function handleMenu(event: any) {
    console.log("in handleMenu");
    if (event.target.dataset.name) {
      console.log(
        `${myNickName}가 ${user?.nickname}를 ${roomname}에서 ${event.target.dataset.name}클릭!!!`
      );
      const targetnickname = user?.nickname;
      if (event.target.dataset.name === "kick") {
        console.log("target nickname : " + targetnickname);
        socket.emit("kickUser", {
          roomname: roomname,
          target: targetnickname,
        });
      } else if (event.target.dataset.name === "profile") {
        console.log("in profileUser ", targetnickname, user?.id, id);
        // socket.emit("profileUser", roomname, targetnickname);
        setUserProfileModal(() => !userProfileModal);
        // setUserProfileID(()=> user?.id)
      } else if (event.target.dataset.name === "ban") {
        console.log("in banUser ", roomname, targetnickname);
        socket.emit("banUser", {
          roomname: roomname,
          target: targetnickname,
        });
      } else if (event.target.dataset.name === "mute") {
        console.log("in muteUser ", {
          roomname: roomname,
          target: targetnickname,
        });
        socket.emit("muteUser", {
          roomname: roomname,
          target: targetnickname,
        });
      } else if (event.target.dataset.name === "block") {
        console.log("in blockUser111111111111111 ", targetnickname);
        if (targetnickname !== myNickName) {
          console.log("in blockUser222222222222222 ", targetnickname);
        }
        socket.emit("blockUser", { target: targetnickname, modal: true });
      } else if (event.target.dataset.name === "opAdd") {
        console.log("in addOperator ", roomname, targetnickname);
        socket.emit("addOperator", {
          roomname: roomname,
          target: targetnickname,
        });
      } else if (event.target.dataset.name === "opDelete") {
        console.log("in deleteOperator ", roomname, targetnickname);
        socket.emit("deleteOperator", {
          roomname: roomname,
          target: targetnickname,
        });
      } else if (event.target.dataset.name === "dmApply")
        socket.emit("selectDMRoom", { target: targetnickname });
      else if (event.target.dataset.name === "oneVsOneEasy") {
        console.log("easy");
        gameSocket.emit("oneOnOneApply", {
          from: myNickName,
          to: targetnickname,
          mode: "easy",
        });
      } else if (event.target.dataset.name === "oneVsOneNormal") {
        console.log("normal");
        gameSocket.emit("oneOnOneApply", {
          from: myNickName,
          to: targetnickname,
          mode: "normal",
        });
      } else if (event.target.dataset.name === "oneVsOneHard") {
        console.log("hard");
        gameSocket.emit("oneOnOneApply", {
          from: myNickName,
          to: targetnickname,
          mode: "hard",
        });
      }
    } else {
      console.log("you click other");
    }
  }
  return (
    <>
      <li>
        <div className="userlist-avatar">
          <Image
            src={`http://localhost/api/user/${
              user?.id
            }/photo?timestamp=${Date.now()}`}
            width="32"
            height="32"
            alt="avataricon"
          />
          {/* <Image
            className="avatar-img"
            src={imgSrc}
            width="32"
            height="32"
            alt="avataricon"
          /> */}
        </div>
        <p className="userlist-username">
          {roomInfo?.owner === user?.nickname ? "🔱" : ""}
          {roomInfo?.operators.includes(user?.nickname) ? "⚜️" : ""}{" "}
          {user?.id === changedID ? changedNickName : user?.nickname}
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
              <div className="dropdown-item" data-name="profile">
                Profile
              </div>
              {/* Operator */}
              {roomInfo?.owner !== user?.nickname &&
                !roomInfo?.operators.includes(user?.nickname) &&
                (roomInfo?.operators.includes(myNickName) ||
                  roomInfo?.owner === myNickName) &&
                user?.nickname !== myNickName && (
                  <>
                    <div className={"dropdown-item"} data-name="kick">
                      Kick
                    </div>
                    <div className="dropdown-item" data-name="ban">
                      Ban
                    </div>
                    <div className="dropdown-item" data-name="mute">
                      Mute
                    </div>
                  </>
                )}
              {/* Owner */}
              {roomInfo?.owner === myNickName &&
                user?.nickname !== myNickName && (
                  <>
                    <div className="dropdown-item dropdown-second">
                      Operator
                      <div className="dropdown-content-second">
                        <div className="dropdown-item-second" data-name="opAdd">
                          Add Operator
                        </div>
                        <div
                          className="dropdown-item-second"
                          data-name="opDelete"
                        >
                          Delete Operator
                        </div>
                      </div>
                    </div>
                  </>
                )}
              {/* Other User */}
              {user?.nickname !== myNickName && (
                <>
                  <div className="dropdown-item" data-name="block">
                    block
                  </div>
                  <div className="dropdown-item" data-name="dmApply">
                    1:1 Chat
                  </div>
                  <div className="dropdown-item dropdown-second">
                    1:1 Game
                    <div className="dropdown-content-second">
                      <div
                        className="dropdown-item-second"
                        data-name="oneVsOneEasy"
                      >
                        Easy Mode
                      </div>
                      <div
                        className="dropdown-item-second"
                        data-name="oneVsOneNormal"
                      >
                        Normal Mode
                      </div>
                      <div
                        className="dropdown-item-second"
                        data-name="oneVsOneHard"
                      >
                        Hard Mode
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <p className="userlist-userstatus-text">
          {(() => {
            // const num = Math.trunc(Math.random() * 5);
            // if (num === 0) return "밥 먹는 중";
            // else if (num === 1) return "GOD님과 게임 하는 중";
            // else if (num === 2) return "온라인";
            // else if (num === 3) return "오프라인";
            // else if (num === 4) return "자리비움";
            if (user?.isGaming) return "게임중";
            return "온라인";
          })()}
        </p>
      </li>
      <ModalOverlay isOpenModal={userProfileModal} />
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
