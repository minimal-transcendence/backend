import React, { useEffect, useState, useRef, useContext } from "react";
import ChatHeader from "./ChatHeader";
import ChatBody from "./ChatBody";
// import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";

import { SocketContext } from "../../../context/socket";
const ChatMain = ({
  currentRoomName,
  setcurrentRoomName,
  myNickName,
}: {
  currentRoomName: string;
  setcurrentRoomName: any;
  myNickName: string;
}) => {
  const [textareaValue, setTextareaValue] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [messages, setMessages] = useState<any>("");
  const lastMessageRef = useRef<null | HTMLElement>(null);
  const socket = useContext(SocketContext);

  useEffect(() => {
    function sendCurrRoomInfo(result: any) {
      console.log(
        `in useEffect sendCurrRoomInfo  <${JSON.stringify(result, null, 2)}>
        방이름 <${JSON.stringify(
          result.roomname,
          null,
          2
        )}>  currentRoomName : <${currentRoomName}>`
      );

      setcurrentRoomName(() => result.roomname);
      setMessages(() => result.messages);
    }

    function sendMessage(roomname: string, data: any) {
      console.log(
        `in useEffect sendMessage1  from<${
          data.from
        }> roomname<${roomname}> body<${JSON.stringify(
          data,
          null,
          2
        )}> 내 방은 <${currentRoomName}>`
      );

      if (roomname === currentRoomName) {
        console.log("same room!");
        setMessages(() => [...messages, data]);
      }
    }

    socket.on("sendCurrRoomInfo", sendCurrRoomInfo);
    socket.on("sendMessage", sendMessage);

    return () => {
      socket.off("sendCurrRoomInfo", sendCurrRoomInfo);
      socket.off("sendMessage", sendMessage);
    };
  }, [currentRoomName, messages, setcurrentRoomName, socket]);

  // useEffect(() => {
  //   socket.on("messageResponse", (data: any) =>
  //     setMessages([...messages, data])
  //   );
  // }, [socket, messages]);

  // useEffect(() => {
  //   socket.on("typingResponse", (data: any) => setTypingStatus(data));
  // }, [socket]);

  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-main">
      <ChatHeader currentRoomName={currentRoomName} />

      <div className="chat-message-main">
        <ChatBody
          messages={messages}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
          myNickName={myNickName}
        />
        <ChatFooter
          textareaValue={textareaValue}
          setTextareaValue={setTextareaValue}
          currentRoomName={currentRoomName}
        />
      </div>

      {/* <div className="chat__main">
        <ChatBody
          messages={messages}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
        />
        <ChatFooter socket={socket} />
      </div> */}
    </div>
  );
};

export default ChatMain;
