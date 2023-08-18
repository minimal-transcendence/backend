import ChatRoomUserInfo from "./ChatRoomUserInfo";
import { useEffect, useState } from "react";

export default function ChatRoomUser({
  users,
  roomname,
  myNickName,
}: {
  users: any;
  roomname: string;
  myNickName: string;
}) {
  // console.log("in chatroomUser, users", users);
  // console.log("in chatroomUser, roomname", roomname);
  const [page, setPage] = useState<number>(1);
  const [leftArrow, setLeftArrow] = useState<boolean>(false);
  const [rightArrow, setRightArrow] = useState<boolean>(false);

  useEffect(
    function () {
      function a() {
        if (users?.length > page * 8) setRightArrow(() => true);
        if (page > 1) setLeftArrow(() => true);
        if (users?.length <= page * 8) setRightArrow(() => false);
        if (page === 1) setLeftArrow(() => false);
      }
      a();
    },
    [users, page]
  );
  if (!users || !roomname) return;
  else {
    let tmpUsers;
    if (users.length < 9) {
      console.log(`users length가 ${users.length}이므로 1페이지 미만.`);
      tmpUsers = users;
    } else {
      console.log(`users length가 ${users.length}이므로 1페이지 이상가능.`);

      console.log(`현재 페이지는 ${page}이므로, `);
      const startIndex = page * 8 - 8;
      tmpUsers = users.slice(startIndex, startIndex + 8);
    }
    return (
      <>
        <div className="wrp">
          <div className="userlist-header">
            <h4>{roomname} 유저목록</h4>

            <button
              onClick={() => setPage(() => page - 1)}
              className={`btn-page ${leftArrow ? "" : "visible"}`}
            >
              &larr;
            </button>
            <button
              onClick={() => setPage(() => page + 1)}
              className={`btn-page ${rightArrow ? "" : "visible"}`}
            >
              &rarr;
            </button>
          </div>

          <ul className="userlist-lists">
            {tmpUsers.map((user: any, i: number) => (
              <ChatRoomUserInfo
                user={user}
                key={i}
                num={i}
                roomname={roomname}
                myNickName={myNickName}
              />
            ))}
          </ul>
        </div>
      </>
    );
  }
}
