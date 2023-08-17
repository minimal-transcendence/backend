import React, { useEffect, useState, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatBody from "./ChatBody";
// import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";

const ChatMain = ({
  socket,
  currentRoomName,
  messages,
  myNickName,
}: {
  socket: any;
  currentRoomName: string;
  messages: any;
  myNickName: string;
}) => {
  const [textareaValue, setTextareaValue] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const lastMessageRef = useRef<null | HTMLElement>(null);
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
      <ChatHeader socket={socket} currentRoomName={currentRoomName} />

      <div className="chat-message-main">
        <ChatBody
          socket={socket}
          messages={messages}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
          myNickName={myNickName}
        />
        <ChatFooter
          socket={socket}
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
