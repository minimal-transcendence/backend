import GameListHeader from "./GameListHeader";
import GameListBody from "./GameListBody";
import { useState, useEffect, useContext } from "react";
import { SocketContext } from "@/pages/App";

const pageHeight = 8;
export default function GameList({ myNickName }: { myNickName: string }) {
  const socket = useContext(SocketContext).chatSocket;
  const [gameList, setGameList] = useState<any>([]);

  const [page, setPage] = useState<number>(1);
  const [leftArrow, setLeftArrow] = useState<boolean>(false);
  const [rightArrow, setRightArrow] = useState<boolean>(false);

  useEffect(() => {
    function updateInvitationList(data: any) {
      console.log(`in updateInvitationList ${JSON.stringify(data, null, 2)}`);

      setGameList(() => data);
    }

    socket.on("updateInvitationList", updateInvitationList);

    return () => {
      socket.off("updateInvitationList", updateInvitationList);
    };
  }, [socket]);

  useEffect(() => {
    if (gameList?.length > page * pageHeight) setRightArrow(() => true);
    if (page > 1) setLeftArrow(() => true);
    if (gameList?.length <= page * pageHeight) setRightArrow(() => false);
    if (page === 1) setLeftArrow(() => false);
  }, [gameList, page]);

  if (!gameList) return;
  else {
    let tmpList;
    if (gameList?.length <= pageHeight) {
      console.log(`gamelists length가 ${gameList.length}이므로 1페이지 미만.`);
      tmpList = gameList;
    } else {
      console.log(`users length가 ${gameList.length}이므로 1페이지 이상가능.`);

      console.log(`현재 페이지는 ${page}이므로, `);
      const startIndex = (page - 1) * pageHeight;
      tmpList = gameList.slice(startIndex, startIndex + pageHeight);
    }

    return (
      <>
        <div className="wrp">
          <GameListHeader
            page={page}
            setPage={setPage}
            leftArrow={leftArrow}
            rightArrow={rightArrow}
            myNickName={myNickName}
          />
          <GameListBody tmpList={tmpList} myNickName={myNickName} />
        </div>
      </>
    );
  }
}
