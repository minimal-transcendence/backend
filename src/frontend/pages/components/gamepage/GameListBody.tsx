import GameListItemInfo from "./GameListItemInfo";
import { useContext } from "react";
import { SocketContext } from "../../../context/socket";
export default function GameListBody({
  myNickName,
  tmpUsers,
}: {
  myNickName: string;
  tmpUsers: any;
}) {
  const socket = useContext(SocketContext);
  if (tmpUsers?.length === 0 || !tmpUsers) {
    console.log("gamelengh 0");
    return;
  } else {
    console.log("gmaelist", JSON.stringify(tmpUsers, null, 2));
    return (
      <div className="gamelist-body">
        <ul className="gamelist-lists">
          {tmpUsers.map((game: any, i: number) => (
            <GameListItemInfo game={game} key={i} myNickName={myNickName} />
          ))}
        </ul>
      </div>
    );
  }
}
