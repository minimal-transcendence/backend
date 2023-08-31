export default function GameListItemInfo({
  game,
  myNickName,
}: {
  game: any;
  myNickName: string;
}) {
  console.log(
    "in GameListItemInfo ",
    JSON.stringify(game, null, 2),
    myNickName
  );
  if (!game?.to || !game?.from || !game?.mode) {
    console.log("ㅏ무것도 ㄷ없나보다");
    return;
  } else {
    console.log("return ㅏㄴ오는데???");

    return (
      <>
        {game?.to === myNickName ? (
          <div>
            {`${game?.from}님이 ${game?.mode}게임을 신청하셨습니다`}
            <span className="gameAccept">수락</span>/
            <span className="gameDecline">거절</span>
          </div>
        ) : (
          <div>
            {`${game?.to}님에게 ${game?.mode}게임을 신청하셨습니다`}
            <span className="gameCancel">취소</span>
          </div>
        )}
      </>
    );
  }
}
