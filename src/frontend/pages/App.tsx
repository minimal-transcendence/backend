import { useEffect, useState } from "react";

import * as io from "socket.io-client";
import ModalBasic from "./components/modalpage/modal";
import ModalOverlay from "./components/modalpage/ModalOverlay";
import TempLogin from "./components/temploginpage/tempLogin";
import NavBar from "./components/navpage/NavBar";
import GameList from "./components/gamepage/GameList";
import ChatMain from "./components/chatpage/ChatMain";
import menuIcon from "../assets/menu.png";

import ysungwonIcon from "../assets/ysungwon.jpg";
import { SocketContext, socket } from "../context/socket";
// import searchIcon from "./assets/search.png";
import Image from "next/image";

// export const socket = io.connect("http://localhost:3002", {
//   query: {
//     id: 1234,
//     nickname: "namkim",
//   },
//   autoConnect: false,
// });

const NO_SEARCH_RESULT_ERROR = "There is no room! : ";

export type UserOnChat = {
  id: string;
  isCreator: boolean;
  isOp: boolean;
};

export type TempSearch = {
  roomname: string;
  messageRecent: string;
  messageNew: boolean;
  users: UserOnChat[];
};

export default function App() {
  const [results, setTempSearchList] = useState<TempSearch[]>([]);
  // const [users, setTempRoomUserList] = useState(tempRoomUserList);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [roomUserList, setRoomUserList] = useState<any>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const [roomnameModal, setroomnameModal] = useState<string>("");
  const [currentRoomName, setcurrentRoomName] = useState<string>("");
  const [tmpLoginID, setTmpLoginID] = useState<string>("");
  const [tmpLoginnickname, setTmpLoginnickname] = useState<string>("");
  const [tmpIsLoggedIn, setTmpIsLoggedIn] = useState<boolean>(false);
  const [leftHeader, setLeftHeader] = useState<string>("");

  function handleSelectRoom(event: any, room: any) {
    setSelectedRoom(room);
    setroomnameModal(room.roomname);
    console.log("in Selectroomname handle ", room.roomname);
    socket.emit("selectRoom", room.roomname);
  }
  useEffect(
    function () {
      function chkLogin() {
        console.log("chkLogin");
        if (tmpIsLoggedIn) {
          console.log("chkLogin in if");
          socket.io.opts.query = {
            id: tmpLoginID,
            nickname: tmpLoginnickname,
          };
          socket.connect();
          socket.emit("sendnicknameID", {
            id: tmpLoginID,
            nickname: tmpLoginnickname,
          });
        }
      }
      chkLogin();
    },
    [tmpIsLoggedIn, tmpLoginnickname, tmpLoginID]
  );

  useEffect(() => {
    function requestPassword(roomname: string) {
      console.log(
        "in useEffect requestPassword",
        JSON.stringify(roomname, null, 2)
      );
      alert(`requestPassword이벤트가 왔어요zx. ${roomname} ${isOpenModal}`);
      setIsOpenModal(true);
    }
    function sendRoomMembers(result: any) {
      console.log(
        "in useEffect sendRoomMembers",
        JSON.stringify(result, null, 2)
      );
      setRoomUserList(() => result);
      setLeftHeader(() => "joined");
      // setcurrentRoomName(() => result[0].roomname);
      setQuery("");
    }
    function sendRoomList(result: any) {
      console.log(
        `in useEffect sendRoomList <${JSON.stringify(result, null, 2)}>`
      );
      setTempSearchList(() => result);
    }
    function responseRoomQuery(result: any) {
      console.log(
        `in useEffect responseRoomQuery <${JSON.stringify(result, null, 2)}>`
      );
      setTempSearchList(() => result);
    }

    function userUpdate(
      username: string,
      isGaming: boolean,
      isConnected: boolean
    ) {
      console.log(`in userUdpate ${username} ${isGaming} ${isConnected}`);
    }

    socket.on("sendRoomList", sendRoomList);
    socket.on("sendRoomMembers", sendRoomMembers);
    socket.on("requestPassword", requestPassword);
    socket.on("responseRoomQuery", responseRoomQuery);
    socket.on("userUpdate", userUpdate);
    return () => {
      socket.off("responseRoomQuery", responseRoomQuery);
      socket.off("sendRoomList", sendRoomList);
      socket.off("sendRoomMembers", sendRoomMembers);
      socket.off("requestPassword", requestPassword);
      socket.off("userUpdate", userUpdate);
    };
  }, [currentRoomName, isOpenModal]);

  return (
    <SocketContext.Provider value={socket}>
      {!tmpIsLoggedIn ? (
        <TempLogin
          tmpLoginID={tmpLoginID}
          setTmpLoginID={setTmpLoginID}
          tmpLoginnickname={tmpLoginnickname}
          tmpIsLoggedIn={tmpIsLoggedIn}
          setTmpLoginnickname={setTmpLoginnickname}
          setTmpIsLoggedIn={setTmpIsLoggedIn}
        />
      ) : (
        <>
          <ModalOverlay isOpenModal={isOpenModal} />
          <div>
            {isOpenModal && (
              <ModalBasic
                roomname={roomnameModal}
                socket={socket}
                setIsOpenModal={setIsOpenModal}
                innerText={"방클릭해서 드갈때 비번입력 ㄱ"}
              />
            )}
          </div>

          <NavBar
            query={query}
            setQuery={setQuery}
            setIsLoading={setIsLoading}
            setSelectedRoom={setSelectedRoom}
            setLeftHeader={setLeftHeader}
            setError={setError}
          />
          <Main>
            <Box>
              {
                <>
                  <SearchList
                    results={results}
                    query={query}
                    leftHeader={leftHeader}
                    setLeftHeader={setLeftHeader}
                    onSelectRoom={handleSelectRoom}
                    setroomnameModal={setroomnameModal}
                  />
                  <DMlist />
                </>
              }
            </Box>
            <ChatMain
              currentRoomName={currentRoomName}
              setcurrentRoomName={setcurrentRoomName}
              myNickName={tmpLoginnickname}
            />
            <Box>
              <>
                <ChatRoomUser
                  users={roomUserList}
                  roomname={currentRoomName}
                  myNickName={tmpLoginnickname}
                />
                <GameList myNickName={tmpLoginnickname} />
              </>
            </Box>
          </Main>
        </>
      )}
    </SocketContext.Provider>
  );
}

function DMlist() {
  return (
    <div className="dmlist-header">
      <h4>DM-List</h4>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  console.log("errmessga called");
  return (
    <p className="error">
      <span>📛</span>
      {message}
    </p>
  );
}

function Main({ children }: { children: any }) {
  return <main className="main">{children}</main>;
}

function Box({ children }: { children: any }) {
  return <div className="box">{children}</div>;
}

function SearchListCreateRoom({ setroomnameModal }: { setroomnameModal: any }) {
  const [roomname, setroomname] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = async (event: any) => {
    setDisabled(true);
    event.preventDefault();
    if (roomname.length < 1) {
      alert("채팅창 이름 입력해라");
    } else {
      await new Promise((r) => setTimeout(r, 10));
      alert(`입력된 채팅창 이름: ${roomname}`);
      setroomnameModal(roomname);
      socket.emit("selectRoom", roomname);
    }
    setroomname("");
    setDisabled(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="div-form">
        <span>
          <div className="input-search">
            <input
              type="text"
              value={roomname}
              placeholder="Create or Join room"
              onChange={(e) => setroomname(e.target.value)}
            />
          </div>
        </span>
      </div>
    </form>
  );
}

function SearchList({
  results,
  query,
  leftHeader,
  setLeftHeader,
  onSelectRoom,
  setroomnameModal,
}: {
  results: any;
  query: any;
  leftHeader: any;
  setLeftHeader: any;
  onSelectRoom: any;
  setroomnameModal: any;
}) {
  function handleChk(event: any) {
    if (event.target.dataset.name) {
      console.log("in handleChk ", event.target.dataset.name);
      setLeftHeader(event.target.dataset.name);
      if (event.target.dataset.name === "all")
        socket.emit("requestAllRoomList");
      else if (event.target.dataset.name === "result") {
        console.log("wehn click result ", query);
        socket.emit("requestSearchResultRoomList", query);
      } else if (event.target.dataset.name === "joined")
        socket.emit("requestMyRoomList");
    } else console.log("in handleChk other");
  }
  if (results.length === 0) {
    console.log("no resuslt");
    return (
      <>
        <div className="wrp">
          <div className="list-rooms-search">
            <SearchListCreateRoom setroomnameModal={setroomnameModal} />
          </div>
          <div className="selection-list" onClick={() => handleChk(event)}>
            <span
              data-name="all"
              className={`${leftHeader === "all" ? "selected" : ""}`}
            >
              All
            </span>
            <span> / </span>
            <span
              data-name="result"
              className={`${leftHeader === "result" ? "selected" : ""}`}
            >
              Result
            </span>
            <span> / </span>
            <span
              data-name="joined"
              className={`${leftHeader === "joined" ? "selected" : ""}`}
            >
              Joined
            </span>
            <span className="btn-page-wrap">
              <button className="btn-page">&larr; </button>
              <button className="btn-page">&rarr;</button>
            </span>
          </div>
          <ErrorMessage message={NO_SEARCH_RESULT_ERROR + query} />
        </div>
      </>
    );
  }
  return (
    <>
      <div className="wrp">
        <div className="list-rooms-search">
          <SearchListCreateRoom setroomnameModal={setroomnameModal} />
        </div>
        <div className="selection-list" onClick={() => handleChk(event)}>
          <span
            data-name="all"
            className={`${leftHeader === "all" ? "selected" : ""}`}
          >
            All
          </span>
          <span> / </span>
          <span
            data-name="result"
            className={`${leftHeader === "result" ? "selected" : ""}`}
          >
            Result
          </span>
          <span> / </span>
          <span
            data-name="joined"
            className={`${leftHeader === "joined" ? "selected" : ""}`}
          >
            Joined
          </span>
          <span>
            <span>
              <button className="btn-page">&larr;</button>
              <button className="btn-page">&rarr;</button>
            </span>
          </span>
        </div>
        <ul className="list list-rooms">
          {results?.map((el: any) => (
            <SearchResult
              el={el}
              key={el.roomname}
              onSelectRoom={onSelectRoom}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

function SearchResult({ el, onSelectRoom }: { el: any; onSelectRoom: any }) {
  return (
    <li onClick={() => onSelectRoom(event, el)}>
      <div>
        <h3>{el.roomname}</h3>
      </div>

      {/* <button className="btn-toggle" data-name={el.roomname}>
        {"X"}
      </button> */}

      <div>
        <p>
          <span>{el?.messageNew ? "🆕" : "☑️"}</span>
          <span>
            {el?.messageRecent?.length >= 14
              ? el?.messageRecent.substr(0, 14) + "..."
              : el?.messageRecent}
          </span>
        </p>
      </div>
    </li>
  );
}

function ChatRoomUser({
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

function ChatRoomUserInfo({
  user,
  num,
  roomname,
  myNickName,
}: {
  user: any;
  num: number;
  roomname: string;
  myNickName: string;
}) {
  function handleMenu(event: any) {
    if (event.target.dataset.name) {
      console.log(
        `${myNickName}가 ${user.nickname}를 ${roomname}에서 ${event.target.dataset.name}클릭!!!`
      );
      const targetnickname = user.nickname;
      if (event.target.dataset.name === "kick") {
        console.log("target nickname : " + targetnickname);
        socket.emit("kickUser", roomname, targetnickname);
      } else if (event.target.dataset.name === "ban")
        socket.emit("banUser", roomname, targetnickname);
      else if (event.target.dataset.name === "mute")
        socket.emit("muteUser", roomname, targetnickname);
      else if (event.target.dataset.name === "block")
        socket.emit("blockUser", targetnickname);
      else if (event.target.dataset.name === "opAdd")
        socket.emit("addOperator", roomname, targetnickname);
      else if (event.target.dataset.name === "opDelete")
        socket.emit("deleteOperator", roomname, targetnickname);
      else if (event.target.dataset.name === "dmApply")
        socket.emit("dmApply", targetnickname);
      else if (event.target.dataset.name === "oneVsOne")
        socket.emit("oneVsOneApply", targetnickname, "oneVsOne", 2);
    } else {
      console.log("you click other");
    }
  }

  return (
    <li>
      <div className="userlist-avatar">
        {/* {num < 9 ? `0${num + 1}` : `${num + 1}`} */}
        {/* <img src={ysungwonIcon} width="32" height="32" /> */}
        <Image
          className="avatar-img"
          src={ysungwonIcon}
          width="32"
          height="32"
          alt="avataricon"
        />
      </div>
      <p className="userlist-username">
        {user.nickname} {user.nickname === myNickName ? "🎆" : ""}
      </p>
      {/* <p className="icon">{isOpen ? "-" : "+"}</p> */}
      <div className="userlist-KBOM-box">
        <div className="dropdown">
          {/* <img className="dropbtn" src={menuIcon} width="15" height="15" /> */}
          <Image
            className="dropbtn"
            src={menuIcon}
            width="15"
            height="15"
            alt="menuicon"
          />
          <div onClick={() => handleMenu(event)} className="dropdown-content">
            <div data-name="kick">Kick</div>
            <div data-name="ban">Ban</div>
            <div data-name="mute">Mute</div>
            <div data-name="block">block</div>
            <div data-name="opAdd">Add Oper</div>
            <div data-name="opDelete">Delete Oper</div>
            <div data-name="dmApply">1:1 Chat</div>
            <div data-name="oneVsOne">1:1 Game</div>
          </div>
        </div>
      </div>
      <p className="userlist-userstatus-text">
        {(() => {
          const num = Math.trunc(Math.random() * 5);
          if (num === 0) return "밥 먹는 중";
          else if (num === 1) return "GOD님과 게임 하는 중";
          else if (num === 2) return "온라인";
          else if (num === 3) return "오프라인";
          else if (num === 4) return "자리비움";
        })()}
      </p>
    </li>
  );
}
