import React, { useEffect, useState, useRef, useContext } from "react";
import ChatHeader from "./ChatHeader";
import ChatBody from "./ChatBody";
// import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";

import { SocketContext } from "@/context/socket";
const ChatMain = ({
  roomInfo,
  setRoomInfo,
  currentRoomName,
  setCurrentRoomName,
  myNickName,
  messages,
  setMessages,
  blocklist,
  gameLoad,
  isDM,
  setIsDM,
  lastMessageList,
  setLastMessageList,
}: {
  roomInfo: any;
  setRoomInfo: any;
  currentRoomName: string;
  setCurrentRoomName: any;
  myNickName: string;
  messages: any;
  setMessages: any;
  blocklist: string[];
  gameLoad: boolean;
  isDM: boolean;
  setIsDM: any;
  lastMessageList: any;
  setLastMessageList: any;
}) => {
  // const [typingStatus, setTypingStatus] = useState("");

  const [DMtarget, setDMtarget] = useState<string>("");

  const [roomState, setRoomState] = useState<string>("");
  const lastMessageRef = useRef<null | HTMLElement>(null);
  const socket = useContext(SocketContext).chatSocket;

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

      setRoomInfo(() => result);
      setCurrentRoomName(() => result.roomname);
      setMessages(() => result.messages);
      setIsDM(() => false);
      setRoomState(() => (result?.isPrivate ? "Private" : "Public"));
    }

    function sendDMRoomInfo(target: any, targetId: number, messages: any) {
      console.log(
        `in useEffect sendDMRoomInfo  
        target <${JSON.stringify(
          target,
          null,
          2
        )}> targetId <${targetId}> messages <${JSON.stringify(
          messages,
          null,
          2
        )}> currentRoomName : <${currentRoomName}>`
      );

      socket.emit("checkDMAlert", { fromId: targetId });
      setCurrentRoomName(() => target);
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
  }, [
    currentRoomName,
    messages,
    setMessages,
    setCurrentRoomName,
    setRoomInfo,
    socket,
  ]);

  // useEffect(() => {f
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
    <div className={`chat-main ${gameLoad ? "hidden" : ""}`}>
      <ChatHeader
        roomInfo={roomInfo}
        roomState={roomState}
        setRoomState={setRoomState}
        myNickName={myNickName}
        isDM={isDM}
        currentRoomName={currentRoomName}
      />

      <div className="chat-message-main">
        <ChatBody
          blocklist={blocklist}
          messages={messages}
          // typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
          myNickName={myNickName}
        />
        <ChatFooter
          isDM={isDM}
          DMtarget={DMtarget}
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
