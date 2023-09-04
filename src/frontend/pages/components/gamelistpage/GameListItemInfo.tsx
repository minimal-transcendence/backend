import { SocketContext } from "@/context/socket";
import { useContext } from "react";
export default function GameListItemInfo({
  game,
  myNickName,
  setMatchStartCheck,
}: {
  game: any;
  myNickName: string;
  setMatchStartCheck: any;
}) {
  const gameSocket = useContext(SocketContext).gameSocket;

  console.log(
    "in GameListItemInfo ",
    JSON.stringify(game, null, 2),
    myNickName
  );

  function handleCancle(event: any) {
    console.log("in handleCancel", game);
    gameSocket.emit("oneOnOneDecline", game);
  }
  function handleAccept(event: any) {
    console.log("in handleAccept");
    gameSocket.emit("oneOnOneAccept", game);
    // setMatchStartCheck(() => true);
  }
  function handleDecline(event: any) {
    console.log("in handleDecline");
    gameSocket.emit("oneOnOneDecline", game);
  }
  if (!game?.to || !game?.from || !game?.mode) {
    console.log("ㅏ무것도 ㄷ없나보다");
    return;
  } else {
    console.log("return ㅏㄴ오는데???");

    return (
      <>
        {game?.to === myNickName ? (
          <li>
            <div className="gamelist-avatar left">
              <img
                src={`http://localhost/api/user/${game?.fromId}/photo`}
                width="35"
                height="35"
                alt="avataricon"
              />
            </div>
            <div className="gamelist-textInfo">{`${game?.from}님이 ${game?.mode}게임을 신청하셨습니다`}</div>
            <div className="gamelist-confirm">
              <span onClick={() => handleAccept(event)} className="gameAccept">
                수락
              </span>
              <span> / </span>
              <span
                onClick={() => handleDecline(event)}
                className="gameDecline"
              >
                거절
              </span>
            </div>
            <div className="gamelist-avatar right">
              <img
                src={`http://localhost/api/user/${game?.toId}/photo`}
                width="35"
                height="35"
                alt="avataricon"
              />
            </div>
          </li>
        ) : (
          <li>
            <div className="gamelist-avatar left">
              <img
                src={`http://localhost/api/user/${game?.fromId}/photo`}
                width="35"
                height="35"
                alt="avataricon"
              />
            </div>
            <div className="gamelist-textInfo">{`${game?.to}님에게 ${game?.mode}게임을 신청하셨습니다`}</div>
            <div className="gamelist-confirm">
              <span onClick={() => handleCancle(event)} className="gameCancel">
                취소
              </span>
            </div>
            <div className="gamelist-avatar right">
              <img
                src={`http://localhost/api/user/${game?.toId}/photo`}
                width="35"
                height="35"
                alt="avataricon"
              />
            </div>
          </li>
        )}
      </>
    );
  }
}
