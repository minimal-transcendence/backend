import ChatRoomUserInfo from "./ChatRoomUserInfo";
import { useEffect, useState, useContext } from "react";
// import { SocketContext } from "@/context/socket";
const pageHeight = 8;
export default function ChatRoomUser({
  id,
  isDM,
  users,
  blocklist,
  roomInfo,
  setRoomInfo,
  roomname,
  myNickName,
  changedID,
  changedNickName,
}: // alertModal,
// setAlertModal,
// alertModalTitle,
// setAlertModalTitle,
// alertModalBody,
// setAlertModalBody,
{
  id: any;
  isDM: boolean;
  users: any;
  blocklist: any;
  roomInfo: any;
  setRoomInfo: any;
  roomname: string;
  myNickName: string;
  changedID: number;
  changedNickName: string;
  // alertModal: any;
  // setAlertModal: any;
  // alertModalTitle: string;
  // setAlertModalTitle: any;
  // alertModalBody: string;
  // setAlertModalBody: any;
}) {
  // console.log("in chatroomUser, users", users);
  // console.log("in chatroomUser, roomname", roomname);
  // const socket = useContext(SocketContext).chatSocket;
  const [page, setPage] = useState<number>(1);
  const [leftArrow, setLeftArrow] = useState<boolean>(false);
  const [rightArrow, setRightArrow] = useState<boolean>(false);

  const filtered: string[] = [];
  users?.forEach((user: any) => {
    console.log("blocklist in user : " + JSON.stringify(blocklist));
    console.log(
      `Room Array.isArray(blocklist) : <${Array.isArray(
        blocklist
      )}> type <${typeof blocklist}>`
    );
    console.log("user ", JSON.stringify(user, null, 2));
    if (
      Array.isArray(blocklist) &&
      !blocklist?.find((b: number) => {
        return b === user["id"];
      })
    )
      filtered.push(user);
  });
  //console.log("filtered : " + JSON.stringify(filtered));

  useEffect(
    function () {
      function a() {
        if (filtered?.length > page * pageHeight) setRightArrow(() => true);
        if (page > 1) setLeftArrow(() => true);
        if (filtered?.length <= page * pageHeight) setRightArrow(() => false);
        if (page === 1) setLeftArrow(() => false);
      }
      a();
    },
    [page, filtered]
    // [users, page, filtered]
  );

  if (!users || !roomname) return;
  else {
    let tmpUsers;
    if (filtered.length <= pageHeight) {
      console.log(`users length if가 ${filtered.length}이므로 1페이지 미만.`);
      tmpUsers = filtered;
    } else {
      console.log(`users length가 ${users.length}이므로 1페이지 이상가능.`);

      console.log(`현재 페이지는 ${page}이므로, `);
      const startIndex = (page - 1) * pageHeight;
      tmpUsers = filtered.slice(startIndex, startIndex + 8);
    }
    return (
      <>
        <div className="wrp">
          <div className="userlist-header">
            <h4>{isDM ? `DM with ${roomname}` : `Users in ${roomname}`}</h4>

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
                id={id}
                roomInfo={roomInfo}
                setRoomInfo={setRoomInfo}
                roomname={roomname}
                myNickName={myNickName}
                changedID={changedID}
                changedNickName={changedNickName}
              />
            ))}
          </ul>
        </div>
      </>
    );
  }
}
