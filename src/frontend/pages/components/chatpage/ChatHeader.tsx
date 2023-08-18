import { useState, useContext } from "react";
import { SocketContext } from "../../../context/socket";
const ChatHeader = ({ currentRoomName }: { currentRoomName: string }) => {
  const [roomState, setRoomState] = useState<string>("Public");
  const [password, setPassword] = useState<string>("");
  const socket = useContext(SocketContext);

  const handleExit = (event: any, currentroomname: string) => {
    event.preventDefault();
    console.log("방나감 ", currentroomname);
    socket.emit("sendRoomLeave", currentroomname);
  };
  const onSubmit = (event: any, value: string, currentRoomName: string) => {
    event.preventDefault();
    console.log("패스워드바꾸려고 ", value);
    socket.emit("setRoomPass", currentRoomName, value);
    setPassword("");
    setRoomState("Public");
  };
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
          setRoomState("Public");
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
          setRoomState("Private");
        }
      }
    } else {
      console.log("you click other");
    }
  }
  return (
    <div className="chat-message-header">
      <h2>Chat in1 {currentRoomName} </h2>
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
              <form onSubmit={() => onSubmit(event, password, currentRoomName)}>
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
    </div>
  );
};

export default ChatHeader;
