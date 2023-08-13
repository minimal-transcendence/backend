import { useEffect, useState, useLayoutEffect } from "react";

import * as io from "socket.io-client";
import ModalBasic from "./modal";

import TempLogin from "./tempLogin";
import menuIcon from "../assets/menu.png";
import logOutIcon from "../assets/logout.png";
import userIcon from "../assets/user.png";
import searchIcon from "../assets/search.png";

import Image from "next/image";
const socket = io.connect("http://localhost:3002", {
  query: {
    id: 1234,
    nickname: "namkim",
  },
  autoConnect: false,
});
// socket.on("welcomeMessage", (message) => {
//   console.log(`i got message : ${message}`);
// });

const NO_SEARCH_RESULT_ERROR = "There is no room! : ";
const NO_JOINNED_RESULT_ERROR = "No Joinned???! : ";
let CLIENTNAME: string;

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
  const [curOpen, setCurOpen] = useState<number>(-1);
  const [roomUserList, setRoomUserList] = useState<any>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenModal3, setIsOpenModal3] = useState(false);
  const [passWordRequiredRoom, setPassWordRequiredRoom] = useState<string>("");
  const [roomnameModal, setroomnameModal] = useState<string>("");
  const [currentroomname, setCurrentroomname] = useState<string>("");
  const [tmpLoginID, setTmpLoginID] = useState<string>("");
  const [tmpLoginnickname, setTmpLoginnickname] = useState<string>("");
  const [tmpIsLoggedIn, setTmpIsLoggedIn] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  // const [socket, setSocket] = useState<any>(null);
  // isLoading;
  // selectedRoom;

  function handleSelectRoom(event: any, room: any) {
    setSelectedRoom(room);
    setroomnameModal(room.roomname);
    setCurOpen(-1);
    console.log("in Selectroomname handle ", room.roomname);
    if (event.target.dataset.name) {
      console.log(`${event.target.dataset.name}나가기!!!`);
      socket.emit("sendRoomLeave", event.target.dataset.name);
    } else {
      socket.emit("selectRoom", room.roomname);
    }
    setRoomUserList(null);
  }
  useEffect(
    function () {
      function chkLogin() {
        if (tmpIsLoggedIn) {
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
    [tmpIsLoggedIn]
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
      // setCurrentroomname(() => result[0].roomname);
      setQuery("");
    }
    function sendUserRoomList(result: any) {
      console.log("in useEffect sendUserRoomList");
      setTempSearchList(() => result);
    }
    function sendCurrRoomInfo(result: any) {
      console.log("in useEffect sendCurrRoomInfo");
      setCurrentroomname(() => result.roomname);
    }
    socket.on("sendUserRoomList", sendUserRoomList);
    socket.on("sendRoomMembers", sendRoomMembers);
    socket.on("requestPassword", requestPassword);
    socket.on("sendCurrRoomInfo", sendCurrRoomInfo);
    return () => {
      socket.off("sendUserRoomList", sendUserRoomList);
      socket.off("sendRoomMembers", sendRoomMembers);
      socket.off("requestPassword", requestPassword);
      socket.off("sendCurrRoomInfo", sendCurrRoomInfo);
    };
  }, [socket]);

  useEffect(
    function () {
      function fetchResults() {
        try {
          setIsLoading(true);

          if (query === "#all") {
            socket.emit("requestAllRoomList");
            setSelectedRoom(null);
            setError("");
          } else if (!query) {
            socket.emit("requestMyRoomList");
            console.log("in requestMyRoomList if");
            setSelectedRoom(null);
            setError("");
          } else {
            socket.emit("requestSearchResultRoomList", query);
            setSelectedRoom(null);
            setError("");
          }
        } catch (err: any) {
          console.error(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      fetchResults();
    },
    [query]
  );

  return !tmpIsLoggedIn ? (
    <TempLogin
      socket={socket}
      setTmpLoginID={setTmpLoginID}
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

      <NavBar query={query} setQuery={setQuery} />
      <Main>
        <Box>
          {results.length !== 0 && (
            <SearchList
              results={results}
              query={query}
              onSelectRoom={handleSelectRoom}
              setroomnameModal={setroomnameModal}
              tmpLoginnickname={tmpLoginnickname}
            />
          )}
          {results.length === 0 && (
            <ErrorMessage message={NO_SEARCH_RESULT_ERROR + query} />
          )}
        </Box>
        <CenterBox
          currentroomname={currentroomname}
          tmpLoginID={tmpLoginID}
          tmpLoginnickname={tmpLoginnickname}
        />
        <Box>
          <ChatRoomUser
            curOpen={curOpen}
            setCurOpen={setCurOpen}
            users={roomUserList}
            roomname={currentroomname}
            tmpLoginnickname={tmpLoginnickname}
          />
        </Box>
      </Main>
    </>
  );
}

function ModalOverlay({ isOpenModal }: { isOpenModal: any }) {
  // console.log("hidden ? ", isOpenModal);
  return <div className={`overlay ${!isOpenModal ? "hidden" : ""}`}></div>;
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

function NavBar({ query, setQuery }: { query: string; setQuery: any }) {
  return (
    <nav className="nav-bar">
      <Logo />
      <Search query={query} setQuery={setQuery} />
      <NavMenu />
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🏓</span>
      <h1>42PONG</h1>
      {/* <span>UserList</span> <span>/</span>
      <span className="selected">RoomList</span> */}
    </div>
  );
}

function Search({ query, setQuery }: { query: string; setQuery: any }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search Room"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function NavMenu() {
  return (
    <div className="nav-bar-menu">
      <div className="nav-bar-menu-l">
        <p className="nav-randmatch">
          <input type="checkbox" id="switch" />
          <label htmlFor="switch">Toggle</label>
        </p>
        <p className="nav-userlist">
          {/* <img src={userIcon} width="30" height="30" alt="usericon" /> */}
          <Image src={userIcon} width="30" height="30" alt="usericon" />
        </p>
        <p className="nav-profile">My</p>
        <p className="nav-logout">
          {/* <img src={logOutIcon} width="30" height="30" /> */}
          <Image src={logOutIcon} width="30" height="30" alt="logouticon" />
        </p>
      </div>
      {/* <div className="nav-bar-menu-r"> */}
    </div>
  );
}

function Main({ children }: { children: any }) {
  return <main className="main">{children}</main>;
}

function Box({ children }: { children: any }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      {/* <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children} */}
      {children}
    </div>
  );
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
      socket.emit("tryRoomPass", roomname);
      // setPassWordRequiredRoom(roomname);
    }

    setDisabled(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="div-form">
        <span>
          <div className="input-search">
            <input
              className="input-search-input"
              type="text"
              value={roomname}
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
  onSelectRoom,
  setroomnameModal,
  tmpLoginnickname,
}: {
  results: any;
  query: string;
  onSelectRoom: any;
  setroomnameModal: any;
  tmpLoginnickname: string;
}) {
  console.log(
    `in SearchList query : <${query}>
    results : <${results}>`
  );
  if (!results) return;
  return (
    <>
      <div className="selection-list">
        <span className={`${query ? "" : "selected"}`}>Joinned</span>
        <span> / </span>
        <span className={`${!query ? "" : "selected"}`}>Research</span>
      </div>

      {/* <div className="summary result-or-join">
        <h4>{query ? "검색결과" : `${tmpLoginnickname} 님의 참여목록`}</h4>
      </div> */}
      <ul className="list list-rooms-search">
        <SearchListCreateRoom setroomnameModal={setroomnameModal} />
      </ul>
      <ul className="list list-rooms">
        {results?.map((el: any) => (
          <SearchResult el={el} key={el.roomname} onSelectRoom={onSelectRoom} />
        ))}
      </ul>

      <div className="pageBar">
        <span>
          <button className="btn-back">&larr;</button>
        </span>
        <span className="pageBar-text">1/1</span>
        <span>
          <button className="btn-back">&rarr;</button>
        </span>
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

function CenterBox({
  currentroomname,
  tmpLoginnickname,
  tmpLoginID,
}: {
  currentroomname: string;
  tmpLoginnickname: string;
  tmpLoginID: string;
}) {
  const handleSubmit = async (event: any) => {
    // setDisabled(true);
    event.preventDefault();
  };
  return (
    <div className="box box-center">
      <div className="box-center-header">
        <h1>Chat in {currentroomname} </h1>
        <span>
          nickname : {tmpLoginnickname} id : {tmpLoginID}
        </span>
      </div>
      <div className="box-center-main">
        <div className="chat-message-main">h</div>
        <form className="chat-message-form">
          <textarea cols={33} className="input2"></textarea>
          <button className="btn-send" onClick={handleSubmit}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function ChatRoomUser({
  users,
  roomname,
  curOpen,
  setCurOpen,
  tmpLoginnickname,
}: {
  users: any;
  roomname: string;
  curOpen: number;
  setCurOpen: any;
  tmpLoginnickname: string;
}) {
  console.log("in chatroomUser, users", users);
  console.log("in chatroomUser, roomname", roomname);
  if (!users || !roomname) return;
  return (
    <>
      <div className="summary">
        <h4>{roomname} 유저목록</h4>
      </div>

      <ul className="list-users" key={tmpLoginnickname}>
        {users.map((user: any, i: number) => (
          <ChatRoomUserInfo
            user={user}
            key={i}
            num={i}
            roomname={roomname}
            tmpLoginnickname={tmpLoginnickname}
          />
        ))}
      </ul>
    </>
  );
}

function ChatRoomUserInfo({
  user,
  num,
  roomname,
  tmpLoginnickname,
}: {
  user: any;
  num: number;
  roomname: string;
  tmpLoginnickname: string;
}) {
  function handleMenu(event: any) {
    if (event.target.dataset.name) {
      console.log(
        `${tmpLoginnickname}가 ${user.nickname}를 ${roomname}에서 ${event.target.dataset.name}클릭!!!`
      );
      const targetnickname = user.nickname;
      if (event.target.dataset.name === "kick")
        socket.emit("kickUser", { roomname, targetnickname });
      else if (event.target.dataset.name === "ban")
        socket.emit("banUser", { roomname, targetnickname });
      else if (event.target.dataset.name === "mute")
        socket.emit("muteUser", { roomname, targetnickname });
      else if (event.target.dataset.name === "block")
        socket.emit("blockUser", { targetnickname });
      else if (event.target.dataset.name === "opAdd")
        socket.emit("addOperator", { roomname, targetnickname });
      else if (event.target.dataset.name === "opDelete")
        socket.emit("deleteOperator", { roomname, targetnickname });
    } else {
      console.log("you click other");
    }
  }

  return (
    <li
      // className={`item-userlist ${isOpen ? "open" : ""}`}
      className="item-userlist"
      // onClick={handleToggle}
    >
      <p className="number">{num < 9 ? `0${num + 1}` : `${num + 1}`}</p>
      <p className="userlist-username">
        {user.nickname} {user.nickname === tmpLoginnickname ? "🎆" : ""}
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
            <span data-name="kick">Kick</span>
            <span data-name="ban">Ban</span>
            <span data-name="mute">Mute</span>
            <span data-name="block">block</span>
            <span data-name="opAdd">Add Oper</span>
            <span data-name="opDelete">Delete Oper</span>
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
