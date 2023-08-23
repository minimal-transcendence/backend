import { useEffect, useState, createContext, useLayoutEffect } from "react";
import "./index.css";
import * as io from "socket.io-client";
import Pong from "@/srcs/Pong";
import TempRandomMatch from "@/srcs/TempRandomMatch";
import { setItems } from "@/srcs/SocketRefresh";

import ModalBasic from "./modal";

import TempLogin from "./tempLogin";
import menuIcon from "../assets/menu.png";
import logOutIcon from "../assets/logout.png";
import userIcon from "../assets/user.png";
import searchIcon from "../assets/search.png";
import ysungwonIcon from "../assets/ysungwon.jpg";
import Image from "next/image";
const socket = io.connect("http://localhost/chat", {
  query: {
    id: 1234,
    nickname: "namkim",
  },
  autoConnect: false,
});
socket.on("welcomeMessage", (message) => {
  console.log(`i got message : ${message}`);
});

const NO_SEARCH_RESULT_ERROR = "There is no room! : ";
const NO_JOINNED_RESULT_ERROR = "No Joinned???! : ";
let CLIENTNAME: string;

export type AppContent = {
  gameSocket: any;
}
export const AppContext = createContext<AppContent>({
  gameSocket: null,
});

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
  // const [userId, setUserId] = useState<any>(null);
  const [jwt, setJwt] = useState<string>('');
  const [jwtExp, setJwtExp] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [gameCanvas, setGameCanvas] = useState<boolean>(false);

  // const [socket, setSocket] = useState<any>();

  // isLoading;
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
  const [leftHeader, setLeftHeader] = useState<string>("");

  const handleGameCanvas = () => {
    setGameCanvas(!gameCanvas);
  }

  function handleSelectRoom(event: any, room: any) {
    setSelectedRoom(room);
    setroomnameModal(room.roomname);
    setCurOpen(-1);
    console.log("in Selectroomname handle ", room.roomname);

    socket.emit("selectRoom", room.roomname);

    setRoomUserList(null);
  }

  // ERR - 렌더링 될 때마다 계속 소켓을 생성함
  /*
  검색 Input에 의해 App컴포넌트가 리렌더링 될 때마다 소켓 생성
  => 컴포넌트를 나눠서 렌더링 하도록 해야할 듯 (<SearchBar/>, <Chat/>)
  */
  const socket = io.connect("http://localhost/chat", {
    query: {
      "nickname": nickname,
    },
    auth: {
      token: jwt,
    },
  });

  const gameSocket = io.connect("http://localhost/game", {
    query: {
      "nickname": nickname,
    },
    auth: {
      token: jwt,
    },
  });

  useEffect(() => {
	  setItems(setJwt, setJwtExp);
    const nick = localStorage.getItem("nickname");
    if (nick) {
      setNickname(nick);
    }
  }, [])

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
      setLeftHeader(() => "joined");
      // setCurrentroomname(() => result[0].roomname);
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

    function sendCurrRoomInfo(result: any) {
      console.log(
        `in useEffect sendCurrRoomInfo  <${JSON.stringify(result, null, 2)}>
        방이름 <${JSON.stringify(
          result.roomname,
          null,
          2
        )}>  currentroomname : <${currentroomname}>`
      );

      setCurrentroomname(() => result.roomname);
    }
    function sendMessage(roomname: string, body: string) {
      console.log(
        `in useEffect sendMessage1  <${roomname}> <${body}> 내 방은 <${currentroomname}>`
      );

      if (roomname === currentroomname) {
        console.log("same room!");
      }
    }
    socket.on("sendRoomList", sendRoomList);
    socket.on("sendRoomMembers", sendRoomMembers);
    socket.on("requestPassword", requestPassword);
    socket.on("sendCurrRoomInfo", sendCurrRoomInfo);
    socket.on("sendMessage", sendMessage);
    socket.on("responseRoomQuery", responseRoomQuery);
    return () => {
      socket.off("responseRoomQuery", responseRoomQuery);
      socket.off("sendRoomList", sendRoomList);
      socket.off("sendRoomMembers", sendRoomMembers);
      socket.off("requestPassword", requestPassword);
      socket.off("sendCurrRoomInfo", sendCurrRoomInfo);
      socket.off("sendMessage", sendMessage);
    };
  }, [socket, currentroomname]);

  useEffect(
    function () {
      function fetchResults() {
        try {
          setIsLoading(true);

          if (query === "#all") {
            socket.emit("requestAllRoomList");
            setSelectedRoom(null);
            setLeftHeader("all");
            setError("");
          } else if (!query) {
            socket.emit("requestMyRoomList");

            setLeftHeader("joined");
            setSelectedRoom(null);
            setError("");
          } else {
            console.log("in requestMyRoomList if <", query);
            socket.emit("requestSearchResultRoomList", query);

            setSelectedRoom(null);
            setLeftHeader("result");
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
          <button onClick={handleGameCanvas}>
            게임 on/off
          </button>
          {
            <SearchList
              results={results}
              query={query}
              leftHeader={leftHeader}
              setLeftHeader={setLeftHeader}
              onSelectRoom={handleSelectRoom}
              setroomnameModal={setroomnameModal}
            />
          }
        </Box>
        {gameCanvas ?
        (<AppContext.Provider value={{gameSocket: gameSocket}}>
        <Pong/>
        </AppContext.Provider>) :
        (<CenterBox
          currentroomname={currentroomname}
          tmpLoginID={tmpLoginID}
          tmpLoginnickname={tmpLoginnickname}
        />)}
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
      socket.emit("selectRoom", roomname);
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
      </>
    );
  }
  return (
    <>
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
          <SearchResult el={el} key={el.roomname} onSelectRoom={onSelectRoom} />
        ))}
      </ul>
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
            {el?.messageRecent?.length >= 10
              ? el?.messageRecent.substr(0, 10) + "..."
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
  const [textareaValue, setTextareaValue] = useState("_Hello,_ **Markdown**!");

  const handleExit = (currentroomname: string) => {
    console.log("방나감 ", currentroomname);
    socket.emit("sendRoomLeave", currentroomname);
  };
  function handleSubmit(e: any) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());
    console.log("버튼 누를때?in handle1 e", formJson.textareaContent);
    socket.emit("sendChatMessage", currentroomname, formJson.textareaContent);
    formData.set("textareaContent", "");
  }
  function handleSubmit2(e: any) {
    // Prevent the browser from reloading the page
    e.preventDefault();
    console.log("엔터칠때?in handl2 e", e.target.value);
    socket.emit("sendChatMessage", currentroomname, e.target.value);
    e.target.value = "";
  }
  const handleOnKeyPress = (e: any) => {
    if (e.key === "Enter") {
      handleSubmit2(e); // Enter 입력이 되면 클릭 이벤트 실행
    }
  };

  return (
    <div className="box box-center">
      <div className="box-center-header">
        <h2>Chat in1 {currentroomname} </h2>
        <span
          className="box-center-header exit"
          onClick={() => handleExit(currentroomname)}
        >
          X{/* nickname : {tmpLoginnickname} id : {tmpLoginID} */}
        </span>
      </div>
      <div className="box-center-main">
        <div className="chat-message-main">h</div>
        <form
          className="chat-message-form"
          method="post"
          onSubmit={handleSubmit}
          onKeyDown={handleOnKeyPress}
        >
          <textarea
            name="textareaContent"
            defaultValue="I really enjoyed biking yesterday!"
            rows={4}
            cols={33}
            className="input2"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
          />
          <button className="btn-send" type="submit">
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
  // console.log("in chatroomUser, users", users);
  // console.log("in chatroomUser, roomname", roomname);
  if (!users || !roomname) return;
  return (
    <>
      <div className="userlist-header">
        <h4>{roomname} 유저목록</h4>
      </div>

      <ul className="userlist-lists" key={tmpLoginnickname}>
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
      if (event.target.dataset.name === "kick"){
		console.log("target nickname : " + targetnickname);  
		socket.emit("kickUser", roomname, targetnickname);
	  }
      else if (event.target.dataset.name === "ban")
        socket.emit("banUser", roomname, targetnickname);
      else if (event.target.dataset.name === "mute")
        socket.emit("muteUser", roomname, targetnickname);
      else if (event.target.dataset.name === "block")
        socket.emit("blockUser", targetnickname);
      else if (event.target.dataset.name === "opAdd")
        socket.emit("addOperator", roomname, targetnickname);
      else if (event.target.dataset.name === "opDelete")
        socket.emit("deleteOperator", roomname, targetnickname);
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
