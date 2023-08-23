import { SocketContext } from "@/pages/App";
import { useEffect, useState, useContext } from "react";
// import { SocketContext } from "../../../context/socket";

export default function SearchListCreateRoom({
  setroomnameModal,
}: {
  setroomnameModal: any;
}) {
  const socket = useContext(SocketContext).chatSocket;
  const [roomname, setroomname] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = async (event: any) => {
    setDisabled(true);
    event.preventDefault();
    if (roomname.length < 1) {
      alert("채팅창 이름 입력해라");
    } else {
      await new Promise((r) => setTimeout(r, 10));
      alert(`입력된 채팅창 이름: ${roomname}`);
      setroomnameModal(roomname);
      socket.emit("selectRoom", roomname);
    }
    setroomname("");
    setDisabled(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="div-form">
        <span>
          <div className="input-search">
            <input
              type="text"
              value={roomname}
              placeholder="Create or Join room"
              onChange={(e) => setroomname(e.target.value)}
            />
          </div>
        </span>
      </div>
    </form>
  );
}
