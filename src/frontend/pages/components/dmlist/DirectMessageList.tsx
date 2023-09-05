import { useState, useEffect, useContext } from "react";
import { SocketContext } from "@/context/socket";
import DirectMessageListHeader from "./DirectMessageListHeader";
import DirectMessageListBody from "./DirectMessageListBody";
const pageHeight = 4;
export default function DirectMessageList({
  myNickName,
  directMessageMap,
  setDirectMessageMap,
  isDM,
  setIsDM,
}: {
  myNickName: string;
  directMessageMap: any;
  setDirectMessageMap: any;
  isDM: boolean;
  setIsDM: any;
}) {
  const socket = useContext(SocketContext).chatSocket;
  const [directMessageList, setDirectMessageList] = useState<any>([]);

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
    function updateInvitationList(result: any) {
      console.log(
        "in useEffect updateInvitationList ",
        JSON.stringify(result, null, 2)
      );
      setDirectMessageList(() => result);
    }

    if (socket) {
      socket.on("updateInvitationList", updateInvitationList);
    }
    return () => {
      if (socket) {
        socket.off("updateInvitationList", updateInvitationList);
      }
    };
  }, [socket]); // gameData?

  if (!directMessageList) return;
  else {
    let tmpList;
    if (directMessageList?.length <= pageHeight) {
      console.log(
        `directMessageList length가 ${directMessageList.length}이므로 1페이지 미만.`
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
          <DirectMessageListBody tmpList={tmpList} myNickName={myNickName} />
        </div>
      </>
    );
  }
}
