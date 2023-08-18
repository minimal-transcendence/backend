import GameListItemInfo from "./GameListItemInfo";
export default function GameListBody({
  socket,
  tmpLoginnickname,
  tmpUsers,
}: {
  socket: any;
  tmpLoginnickname: string;
  tmpUsers: any;
}) {
  if (tmpUsers?.length === 0 || !tmpUsers) {
    console.log("gamelengh 0");
    return;
  } else {
    console.log("gmaelist", JSON.stringify(tmpUsers, null, 2));
    return (
      <div className="gamelist-body">
        <ul className="gamelist-lists" key={tmpLoginnickname}>
          {tmpUsers.map((game: any, i: number) => (
            <GameListItemInfo
              game={game}
              key={i}
              tmpLoginnickname={tmpLoginnickname}
            />
          ))}
        </ul>
      </div>
    );
  }
}
