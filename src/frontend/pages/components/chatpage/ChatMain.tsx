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
  messages,
  setMessages,
}: {
  currentRoomName: string;
  setcurrentRoomName: any;
  myNickName: string;
  messages: any;
  setMessages: any;
}) => {
  const [textareaValue, setTextareaValue] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [isDM, setIsDM] = useState<boolean>(false);
  const [DMtarget, setDMtarget] = useState<string>("");
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
      setIsDM(() => false);
    }
    function sendDMRoomInfo(target: any, messages: any) {
      console.log(
        `in useEffect sendDMRoomInfo  
        target <${JSON.stringify(target, null, 2)}> messages <${JSON.stringify(
          messages,
          null,
          2
        )}> currentRoomName : <${currentRoomName}>`
      );

      setcurrentRoomName(() => target);
      setMessages(() => messages);
      setIsDM(() => true);
      setDMtarget(() => target);
    }
    socket.on("sendCurrRoomInfo", sendCurrRoomInfo);
    socket.on("sendDMRoomInfo", sendDMRoomInfo);
    return () => {
      socket.off("sendCurrRoomInfo", sendCurrRoomInfo);
      socket.off("sendDMRoomInfo", sendDMRoomInfo);
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
          isDM={isDM}
          DMtarget={DMtarget}
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
