import { useState, useEffect, useContext } from "react";
import { SocketContext } from "@/context/socket";
import DirectMessageListHeader from "./DirectMessageListHeader";
import DirectMessageListBody from "./DirectMessageListBody";
const pageHeight = 4;
export default function DirectMessageList({
  myNickName,
  currentRoomName,
  directMessageList,
  setDirectMessageList,
  directMessageMap,
  setDirectMessageMap,
  isDM,
  setIsDM,
}: {
  myNickName: string;
  currentRoomName: string;
  directMessageList: any;
  setDirectMessageList: any;
  directMessageMap: any;
  setDirectMessageMap: any;
  isDM: boolean;
  setIsDM: any;
}) {
  const socket = useContext(SocketContext).chatSocket;

  const [page, setPage] = useState<number>(1);
  const [leftArrow, setLeftArrow] = useState<boolean>(false);
  const [rightArrow, setRightArrow] = useState<boolean>(false);

  useEffect(() => {
    if (directMessageList?.length > page * pageHeight)
      setRightArrow(() => true);
    if (page > 1) setLeftArrow(() => true);
    if (directMessageList?.length <= page * pageHeight)
      setRightArrow(() => false);
    if (page === 1) setLeftArrow(() => false);
  }, [directMessageList, page]);

  useEffect(() => {
    if (messageInfo?.[1]?.data?.from === currentRoomName && isDM) {
      const tmpList: any = [];
      directMessageList?.map((e: any) => {
        if (e?.[1].data.from !== messageInfo?.[1]?.data?.from) tmpList.push(e);
      });
      let tmpMap = directMessageMap;
      tmpMap?.delete(messageInfo?.[1]?.data?.from);

      setDirectMessageList(() => tmpList);
      setDirectMessageMap(() => tmpMap);
    }
  }, [currentRoomName, directMessageMap, directMessageList]);

  if (!directMessageList) return;
  else {
    let tmpList;
    if (directMessageList?.length <= pageHeight) {
      console.log(
        `directMessageList length가 ${directMessageList.length}이므로 1페이지 미만.
        directMessageList <${directMessageList}>`
      );
      tmpList = directMessageList;
    } else {
      console.log(
        `users length가 ${directMessageList.length}이므로 1페이지 이상가능.`
      );

      console.log(`현재 페이지는 ${page}이므로, `);
      const startIndex = (page - 1) * pageHeight;
      tmpList = directMessageList.slice(startIndex, startIndex + pageHeight);
    }

    return (
      <>
        <div className="wrp">
          <DirectMessageListHeader
            page={page}
            setPage={setPage}
            leftArrow={leftArrow}
            rightArrow={rightArrow}
            myNickName={myNickName}
          />
          <DirectMessageListBody
            tmpList={tmpList}
            isDM={isDM}
            myNickName={myNickName}
            currentRoomName={currentRoomName}
            directMessageList={directMessageList}
            directMessageMap={directMessageMap}
            setDirectMessageList={setDirectMessageList}
            setDirectMessageMap={setDirectMessageMap}
          />
        </div>
      </>
    );
  }
}
