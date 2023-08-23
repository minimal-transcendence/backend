import { SocketContext } from "@/pages/App";
import { useEffect, useState, useContext } from "react";
// import { SocketContext } from "../../../context/socket";
export default function SearchResult({
  el,
  onSelectRoom,
}: {
  el: any;
  onSelectRoom: any;
}) {
  const socket = useContext(SocketContext).chatSocket;

  return (
    <li onClick={() => onSelectRoom(event, el)}>
      <div>
        <h3>{el?.roomname}</h3>
      </div>
      <div>
        <p>
          <span>{el?.messageNew ? "🆕" : "☑️"}</span>
          <span>
            {el?.lastMessage?.length >= 14
              ? el?.lastMessage.substr(0, 14) + "..."
              : el?.lastMessage}
          </span>
        </p>
      </div>
    </li>
  );
}
