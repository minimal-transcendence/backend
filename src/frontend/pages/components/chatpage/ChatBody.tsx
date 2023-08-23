import { useState, useContext } from "react";
// import { SocketContext } from "../../../context/socket";
import ysungwonIcon from "../../../assets/ysungwon.jpg";
import Image from "next/image";
import { SocketContext } from "@/pages/App";
const ChatBody = ({
  messages,
  typingStatus,
  lastMessageRef,
  myNickName,
}: {
  messages: any;
  typingStatus: string;
  lastMessageRef: any;
  myNickName: string;
}) => {
  const socket = useContext(SocketContext).chatSocket;
  if (messages?.length === 0) return;
  // console.log(
  //   `in body, messages length : ${messages.length} ${JSON.stringify(
  //     messages,
  //     null,
  //     2
  //   )}`
  // );
  // console.log("in body2 ", messages[0].from);

  return (
    <div className="chat-message-body">
      {messages?.map((message: any, i: number) =>
        message["from"] === myNickName ? (
          <div
            className={`sender-${
              message["from"] === myNickName ? "right" : "left"
            }`}
            key={i}
          >
            <div>
              <p className="message-sender">{message.body}</p>
            </div>
            <div className="message-sender-low">
              <div className="message-sender-at">
                {new Date(message.at).toDateString()}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`sender-${
              message["from"] === myNickName ? "right" : "left"
            }`}
            key={i}
          >
            <div className="message-recipient-avatar">
              {/* <img src={ysungwonIcon} width="35" height="35" alt="usericon" /> */}
              <Image src={ysungwonIcon} width="35" height="35" alt="usericon" />
            </div>
            <div>
              <p className="message-recipient">{message.body}</p>
            </div>
            <div className="message-recipient-low">
              <div className="message-recipient-nick">{message.from}</div>
              <div className="message-recipient-at">
                {new Date(message.at).toDateString()}
              </div>
            </div>
          </div>
        )
      )}
      <div ref={lastMessageRef} />
    </div>
  );
};

export default ChatBody;
