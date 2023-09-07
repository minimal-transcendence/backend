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
    socket.emit("sendRoomLeave", { roomname: currentroomname });
  };
  const onSubmit = (event: any, value: string, currentRoomName: string) => {
    event.preventDefault();

    const chkAuth =
      myNickName === roomInfo.owner || roomInfo.operators.includes(myNickName);

    if (chkAuth) {
      if (roomState !== "Public") {
        setRoomState("Public");
        socket.emit("setRoomPublic", {
          roomname: currentRoomName,
        });
      }
    }
    socket.emit("setRoomPass", {
      roomname: currentRoomName,
      password: value,
    });

    setPassword("");
  };

  function handleMenu(event: any, currentRoomName: string) {
    if (event.target.dataset.name) {
      if (
        event.target.dataset.name === "exit" &&
        currentRoomName !== "전체채팅방"
      ) {
        setRoomState("");
        handleExit(event, currentRoomName);
      } else if (event.target.dataset.name === "public") {
        {
          const chkAuth =
            myNickName === roomInfo.owner ||
            roomInfo.operators.includes(myNickName);
          if (chkAuth) {
            setRoomState("Public");
          }
          socket.emit("setRoomPublic", {
            roomname: currentRoomName,
          });
        }
      } else if (event.target.dataset.name === "private") {
        {
          const chkAuth =
            myNickName === roomInfo.owner ||
            roomInfo.operators.includes(myNickName);
          if (chkAuth) {
            setRoomState("Private");
          }
          socket.emit("setRoomPrivate", {
            roomname: currentRoomName,
          });
        }
      }
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
