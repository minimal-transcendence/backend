import { SocketContext } from "@/context/socket";
import { useContext, useEffect } from "react";
export default function DirectMessageListItemInfo({
  messageInfo,
  myNickName,
  key,
  setDirectMessageList,
  setDirectMessageMap,
  directMessageList,
  directMessageMap,
  currentRoomName,
  isDM,
}: {
  messageInfo: any;
  myNickName: string;
  key: number;
  setDirectMessageList: any;
  setDirectMessageMap: any;
  directMessageList: any;
  directMessageMap: any;
  currentRoomName: string;
  isDM: boolean;
}) {
  const gameSocket = useContext(SocketContext).gameSocket;

  console.log(
    "in DirectMessageLististItemInfo ",
    JSON.stringify(messageInfo, null, 2),
    myNickName,
    "message body ",
    messageInfo?.[1]?.data?.body,
    " len ",
    messageInfo?.[1]?.data?.body?.length
  );

  function handleAccept(event: any) {
    console.log(`in handleAccept before from <${messageInfo?.[1]?.data?.from}>
    directMessageList <${JSON.stringify(directMessageList, null, 2)}>
    directMessageMap <${JSON.stringify(directMessageMap, null, 2)}>
    `);
    const tmpList: any = [];
    directMessageList.map((e: any) => {
      if (e?.[1].data.fromId !== messageInfo?.[1]?.data?.fromId)
        tmpList.push(e);
    });
    let tmpMap = directMessageMap;
    tmpMap.delete(messageInfo?.[1]?.data?.fromId);
    console.log(`in handleAccept after from <${messageInfo?.[1]?.data?.from}>
    tmpList <${JSON.stringify(tmpList, null, 2)}>
    tmpMap <${JSON.stringify(tmpMap, null, 2)}>
    `);
    setDirectMessageList(() => tmpList);
    setDirectMessageMap(() => tmpMap);
  }

  if (messageInfo?.length < 2) {
    console.log(
      "ㅏ무것도 ㄷ없나보다",
      messageInfo?.[1]?.data?.from,
      myNickName
    );
    return;
  } else {
    console.log("return ㅏㄴ오는데???");

    return (
      <>
        <li>
          <div className="gamelist-avatar left">
            <img
              src={`http://localhost/api/user/${messageInfo?.[1]?.data?.fromId}/photo`}
              width="35"
              height="35"
              alt="avataricon"
            />
          </div>
          <div className="gamelist-textInfo">{`${
            messageInfo?.[1]?.data?.from
          } :  ${
            messageInfo?.[1]?.data?.body?.length >= 14
              ? (messageInfo?.[1]?.data?.body).substr(0, 14) + "..."
              : messageInfo?.[1]?.data?.body
          }`}</div>
          <div className="gamelist-confirm">
            <span onClick={() => handleAccept(event)} className="gameAccept">
              확인
            </span>
          </div>
          <div className="gamelist-avatar right">
            <></>
          </div>
        </li>
      </>
    );
  }
}
