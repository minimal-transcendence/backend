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
  const socket = useContext(SocketContext).chatSocket;

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
    console.log("event name ", event.target.dataset.name);
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
    fromId: messageInfo?.[1]?.data?.fromId <${messageInfo?.[1]?.data?.fromId}>
    `);
    // socket.emit("checkDMAlert", { fromId: messageInfo?.[1]?.data?.fromId });

    if (event.target.dataset.name !== "x")
      socket.emit("selectDMRoom", { target: messageInfo?.[1]?.data?.from });
    else
      socket.emit("userCheckedDM", {
        targetId: messageInfo?.[1]?.data?.fromId,
      });

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
        <li onClick={() => handleAccept(event)} className="gameAccept">
          <div className="dmlist-avatar left">
            <img
              src={`http://localhost/api/user/${messageInfo?.[1]?.data?.fromId}/photo`}
              width="35"
              height="35"
              alt="avataricon"
            />
          </div>
          <div className="dmlist-nickname" data-name="nick">
            <span>{messageInfo?.[1]?.data?.from}</span>
          </div>
          <div className="dmlist-textInfo" data-name="info">
            {`${
              messageInfo?.[1]?.data?.body?.length >= 14
                ? (messageInfo?.[1]?.data?.body).substr(0, 14) + "..."
                : messageInfo?.[1]?.data?.body
            }`}
          </div>

          <div className="dmlist-button-div" data-name="x">
            <span className="dmlist-button-x" data-name="x">
              {" "}
              X{" "}
            </span>
          </div>
        </li>
      </>
    );
  }
}
