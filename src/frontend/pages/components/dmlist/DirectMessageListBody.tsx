import DirectMessageListItemInfo from "./DirectMessageListItemInfo";
import { useContext } from "react";
// import { SocketContext } from "@/context/socket";
export default function DirectMessageListBody({
  myNickName,
  tmpList,
}: {
  myNickName: string;
  tmpList: any;
}) {
  // const socket = useContext(SocketContext).chatSocket;
  if (tmpList?.length === 0 || !tmpList) {
    console.log("gamelengh 0");
    return;
  } else {
    console.log("gmaelist", JSON.stringify(tmpList, null, 2));
    return (
      <div className="gamelist-body">
        <ul className="gamelist-lists">
          {tmpList.map((game: any, i: number) => (
            <DirectMessageListItemInfo
              game={game}
              key={i}
              myNickName={myNickName}
            />
          ))}
        </ul>
      </div>
    );
  }
}
