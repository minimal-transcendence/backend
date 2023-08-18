import GameListHeader from "./GameListHeader";
import GameListBody from "./GameListBody";
import { useState, useEffect } from "react";
export default function GameList({
  socket,
  tmpLoginnickname,
}: {
  socket: any;
  tmpLoginnickname: string;
}) {
  const [gameList, setGameList] = useState<any>([]);
  const [page, setPage] = useState<number>(1);
  const [leftArrow, setLeftArrow] = useState<boolean>(false);
  const [rightArrow, setRightArrow] = useState<boolean>(false);
  const [tmpUsers, setTmpUsers] = useState<any>([]);

  useEffect(() => {
    function updateGameList(data: any) {
      console.log(`in UpdateGameList ${JSON.stringify(data, null, 2)}`);

      setGameList(() => data);
    }

    socket.on("updateGameList", updateGameList);

    return () => {
      socket.off("updateGameList", updateGameList);
    };
  }, [socket]);
  useEffect(() => {
    if (gameList?.length > page * 8) setRightArrow(() => true);
    if (page > 1) setLeftArrow(() => true);
    if (gameList?.length <= page * 8) setRightArrow(() => false);
    if (page === 1) setLeftArrow(() => false);
    if (gameList?.length < 9) {
      console.log(`gamelists length가 ${gameList.length}이므로 1페이지 미만.`);
      setTmpUsers(() => gameList);
    } else {
      console.log(`users length가 ${gameList.length}이므로 1페이지 이상가능.`);

      console.log(`현재 페이지는 ${page}이므로, `);
      const startIndex = page * 8 - 8;
      setTmpUsers(() => gameList.slice(startIndex, startIndex + 8));
    }
    console.log("hihihi");
  }, [gameList, page]);

  return (
    <>
      <div className="wrp">
        <GameListHeader
          page={page}
          setPage={setPage}
          leftArrow={leftArrow}
          rightArrow={rightArrow}
          tmpLoginnickname={tmpLoginnickname}
        />
        <GameListBody
          tmpUsers={tmpUsers}
          socket={socket}
          tmpLoginnickname={tmpLoginnickname}
        />
      </div>
    </>
  );
}
