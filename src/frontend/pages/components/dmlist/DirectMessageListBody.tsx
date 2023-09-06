import DirectMessageListItemInfo from "./DirectMessageListItemInfo";
import { useContext } from "react";
// import { SocketContext } from "@/context/socket";
export default function DirectMessageListBody({
  myNickName,
  tmpList,
  currentRoomName,
  setDirectMessageList,
  setDirectMessageMap,
  directMessageList,
  directMessageMap,
  isDM,
}: {
  myNickName: string;
  tmpList: any;
  currentRoomName: string;
  setDirectMessageList: any;
  setDirectMessageMap: any;
  directMessageList: any;
  directMessageMap: any;
  isDM: boolean;
}) {
  // const socket = useContext(SocketContext).chatSocket;
  if (tmpList?.length === 0 || !tmpList) {
    console.log("gamelengh 0");
    return;
  } else {
    console.log("DMlist", JSON.stringify(tmpList, null, 2));
    return (
      <div className="gamelist-body">
        <ul className="gamelist-lists">
          {tmpList.map((messageInfo: any, i: number) => (
            <DirectMessageListItemInfo
              messageInfo={messageInfo}
              key={i}
              myNickName={myNickName}
              isDM={isDM}
              currentRoomName={currentRoomName}
              setDirectMessageList={setDirectMessageList}
              setDirectMessageMap={setDirectMessageMap}
              directMessageList={directMessageList}
              directMessageMap={directMessageMap}
            />
          ))}
        </ul>
      </div>
    );
  }
}
