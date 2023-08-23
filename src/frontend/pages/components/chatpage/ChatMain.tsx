import React, { useEffect, useState, useRef, useContext } from "react";
import ChatHeader from "./ChatHeader";
import ChatBody from "./ChatBody";
// import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";

import { SocketContext } from "../../../context/socket";
const ChatMain = ({
  roomInfo,
  setRoomInfo,
  currentRoomName,
  setcurrentRoomName,
  myNickName,
  messages,
  setMessages,
  blocklist
}: {
  roomInfo: any;
  setRoomInfo: any;
  currentRoomName: string;
  setcurrentRoomName: any;
  myNickName: string;
  messages: any;
  setMessages: any;
  blocklist : string[];
}) => {
  const [textareaValue, setTextareaValue] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [isDM, setIsDM] = useState<boolean>(false);
  const [DMtarget, setDMtarget] = useState<string>("");

  const [roomState, setRoomState] = useState<string>("");
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
      setRoomInfo(() => result);
      setcurrentRoomName(() => result.roomname);
	  const filteredMessage : any[] = [];
	  console.log("messages1 : " + JSON.stringify(result.messages));
	  function filter(messages : any) {
		console.log("messages : " + JSON.stringify(messages));
		messages?.forEach((element : any) => {
			console.log(element.from);
			if (!blocklist.find((b) => {
				b === element.from
			}))
				filteredMessage.push(element);
		});
	  }
	  filter(result.messages)
      setMessages(() => filteredMessage);
      setIsDM(() => false);
      setRoomState(() => (result?.isPrivate ? "Private" : "Public"));
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
    <div className="chat-main">
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
