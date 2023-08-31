import { useState, useContext } from "react";
import { SocketContext } from "@/context/socket";
const ChatHeader = ({
  roomInfo,
  roomState,
  setRoomState,
  currentRoomName,
  myNickName,
  isDM,
}: {
  roomInfo: any;
  roomState: string;
  setRoomState: any;
  currentRoomName: string;
  myNickName: string;
  isDM: boolean;
}) => {
  const [password, setPassword] = useState<string>("");
  const socket = useContext(SocketContext).chatSocket;

  const handleExit = (event: any, currentroomname: string) => {
    event.preventDefault();
    console.log("방나감 ", currentroomname);
    socket.emit("sendRoomLeave", currentroomname);
  };
  const onSubmit = (event: any, value: string, currentRoomName: string) => {
    event.preventDefault();
    console.log("패스워드바꾸려고 ", value);

    const chkAuth =
      myNickName === roomInfo.owner || roomInfo.operators.includes(myNickName);

    if (chkAuth) {
      console.log("비번 바꾸기 가능");
      socket.emit("setRoomPass", currentRoomName, value);

      if (roomState !== "Public") {
        console.log("test!!!!!public!!!!!");
        setRoomState("Public");
        socket.emit("setRoomPublic", currentRoomName);
      }
    }
    setPassword("");
  };

  console.log("in ChatHeader");
  function handleMenu(event: any, currentRoomName: string) {
    if (event.target.dataset.name) {
      console.log("hi");
      if (
        event.target.dataset.name === "exit" &&
        currentRoomName !== "전체채팅방"
      ) {
        console.log(
          "you want to out",
          currentRoomName,
          event.target.dataset.name
        );
        setRoomState("");
        handleExit(event, currentRoomName);
      } else if (event.target.dataset.name === "public") {
        {
          console.log(
            "you want to public",
            currentRoomName,
            event.target.dataset.name
          );
          const chkAuth =
            myNickName === roomInfo.owner ||
            roomInfo.operators.includes(myNickName);
          if (chkAuth) {
            console.log("권한있음. public으로 전환");
            setRoomState("Public");
            socket.emit("setRoomPublic", currentRoomName);
          }
        }
      } else if (event.target.dataset.name === "password") {
        {
          console.log(
            "you want to password",
            currentRoomName,
            event.target.dataset.name
          );
        }
      } else if (event.target.dataset.name === "private") {
        {
          console.log(
            "you want to private",
            currentRoomName,
            event.target.dataset.name
          );
          const chkAuth =
            myNickName === roomInfo.owner ||
            roomInfo.operators.includes(myNickName);
          if (chkAuth) {
            console.log("권한있음. private로 전환");
            setRoomState("Private");
            socket.emit("setRoomPrivate", currentRoomName);
          }
        }
      }
    } else {
      console.log("you click other");
    }
  }
  return (
    <div className="chat-message-header">
      <h2>
        {isDM ? `Chat with ${currentRoomName}` : `Chat in ${currentRoomName}`}
      </h2>
      {!isDM && (
        <span>
          <div
            className="chat-message-header exit dropdown-chat"
            onClick={() => handleMenu(event, currentRoomName)}
          >
            <div className="dropbtn">
              <button className="chat-message-header btn-option">
                {`\u00A0\u00A0${roomState}\u00A0`}
              </button>
            </div>
            <div className="dropdown-content-chat">
              <div data-name="private">Private</div>
              <div data-name="password">
                <p>Password-protected</p>
                <form
                  onSubmit={() => onSubmit(event, password, currentRoomName)}
                >
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="패스워드입력하세요"
                  ></input>
                </form>
              </div>
              <div data-name="public">public</div>
              <div data-name="exit">EXIT</div>
            </div>
          </div>
        </span>
      )}
    </div>
  );
};

export default ChatHeader;
