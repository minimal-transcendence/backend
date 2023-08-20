export default function GameListItemInfo({
  game,
  myNickName,
}: {
  game: any;
  myNickName: string;
}) {
  console.log(JSON.stringify(game, null, 2), myNickName);
  if (!game?.to || !game?.from || !game?.level) return;
  return (
    <>
      {!game.to ? (
        <div>{`${game.from}님이 랜덤매칭 신청함`}</div>
      ) : game.from === myNickName ? (
        <div>{`${game.from} 님이 ${game.to} 님에게 ${
          game.level === 1 ? "Easy" : game.level === 2 ? "Default" : "Hard"
        }모드 게임을 신청했습니다.  취소할거야?`}</div>
      ) : (
        <div>{`${game.from} 님이 ${game.to} 님에게 ${
          game.level === 1 ? "Easy" : game.level === 2 ? "Default" : "Hard"
        }모드 게임을 신청했습니다. 수락or거절?`}</div>
      )}
    </>
  );
}
