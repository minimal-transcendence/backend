import { SocketContext } from "@/pages/App";
import GameListItemInfo from "./GameListItemInfo";
import { useContext } from "react";
// import { SocketContext } from "../../../context/socket";
export default function GameListBody({
  myNickName,
  tmpList,
}: {
  myNickName: string;
  tmpList: any;
}) {
  const socket = useContext(SocketContext).chatSocket;
  if (tmpList?.length === 0 || !tmpList) {
    console.log("gamelengh 0");
    return;
  } else {
    console.log("gmaelist", JSON.stringify(tmpList, null, 2));
    return (
      <div className="gamelist-body">
        <ul className="gamelist-lists">
          {tmpList.map((game: any, i: number) => (
            <GameListItemInfo game={game} key={i} myNickName={myNickName} />
          ))}
        </ul>
      </div>
    );
  }
}
