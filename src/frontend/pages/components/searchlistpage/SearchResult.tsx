import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../../../context/socket";
export default function SearchResult({
  el,
  onSelectRoom,
}: {
  el: any;
  onSelectRoom: any;
}) {
  const socket = useContext(SocketContext);

  return (
    <li onClick={() => onSelectRoom(event, el)}>
      <div>
        <h3>{el?.roomname}</h3>
      </div>
      <div>
        <p>
          <span>{el?.messageNew ? "🆕" : "☑️"}</span>
          <span>
            {el?.messageRecent?.length >= 14
              ? el?.messageRecent.substr(0, 14) + "..."
              : el?.messageRecent}
          </span>
        </p>
      </div>
    </li>
  );
}
