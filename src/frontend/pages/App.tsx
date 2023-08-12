import { useEffect, useState, useRef } from "react";

import * as io from "socket.io-client";
import ModalBasic from "./modal";
import TempLogin from "./tempLogin";
// import menuIcon from "../assets/menu.png";
// import logOutIcon from "../assets/logout.png";
// import userIcon from "../assets/user.png";
// import searchIcon from "../assets/search.png";
let menuIcon: any;
let logOutIcon: any;
let userIcon: any;
let searchIcon: any;

const socket = io.connect("http://localhost:4000");

socket.on("welcomeMessage", (message: any) => {
  console.log(`i got message : ${message}`);
});

const NO_SEARCH_RESULT_ERROR = "There is no room! : ";
const NO_JOINNED_RESULT_ERROR = "No Joinned???! : ";
let CLIENTNAME: string;

export type UserOnChat = {
  id: string;
  isCreator: boolean;
  isOp: boolean;
};

export type TempSearch = {
  roomName: string;
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
  const [roomNameModal, setRoomNameModal] = useState<string>("");
  const [currentRoomName, setCurrentRoomName] = useState<string>("");
  const [tmpLoginID, setTmpLoginID] = useState<string>("");
  const [tmpLoginNickName, setTmpLoginNickName] = useState<string>("");
  const [tmpIsLoggedIn, setTmpIsLoggedIn] = useState<boolean>(false);
  // isLoading;
  // selectedRoom;

  function handleSelectRoom(event: any, room: any) {
    setSelectedRoom(room);
    setRoomNameModal(room.roomName);
    setCurOpen(-1);
    console.log("in SelectRoomName handle ", room.roomName);
    if (event.target.dataset.name) {
      console.log(`${event.target.dataset.name}나가기!!!`);
      socket.emit("sendRoomLeave", event.target.dataset.name);
    } else {
      socket.emit("selectRoom", room.roomName);
    }
    setRoomUserList(null);
  }

  useEffect(() => {
    function requestPassword(roomName: string) {
      console.log(
        "in useEffect requestPassword",
        JSON.stringify(roomName, null, 2)
      );
      alert(`requestPassword이벤트가 왔어요zx. ${roomName} ${isOpenModal}`);
      setIsOpenModal(true);
    }
    function sendRoomMembers(result: any) {
      console.log(
        "in useEffect roomMembers",
        JSON.stringify(result[0], null, 2)
      );
      setRoomUserList(() => result[0]);
      setCurrentRoomName(() => result[0].roomName);
      setQuery("");
    }
    function sendUserRoomList(result: any) {
      console.log("in useEffect allromo");
      setTempSearchList(() => result);
    }

    socket.on("sendUserRoomList", sendUserRoomList);
    socket.on("sendRoomMembers", sendRoomMembers);
    socket.on("requestPassword", requestPassword);
    return () => {
      socket.off("sendUserRoomList", sendUserRoomList);
      socket.off("sendRoomMembers", sendRoomMembers);
      socket.off("requestPassword", requestPassword);
    };
  }, []);

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

  // useEffect(
  //   function () {
  //     function joinWithRoomName() {
  //       // setPassWordRequiredRoom("hi");
  //       setIsOpenModal3(true);
  //     }
  //     joinWithRoomName();
  //   },
  //   [passWordRequiredRoom]
  // );

  return !tmpIsLoggedIn ? (
    <TempLogin
      socket={socket}
      setTmpLoginID={setTmpLoginID}
      setTmpLoginNickName={setTmpLoginNickName}
      setTmpIsLoggedIn={setTmpIsLoggedIn}
    />
  ) : (
    <>
      <ModalOverlay isOpenModal={isOpenModal} />
      <div>
        {isOpenModal && (
          <ModalBasic
            roomName={roomNameModal}
            socket={socket}
            setIsOpenModal={setIsOpenModal}
            innerText={"방클릭해서 드갈때 비번입력 ㄱ"}
          />
        )}
      </div>

      {/* <ModalOverlay isOpenModal={isOpenModal3} />
      <div>
        {isOpenModal3 && (
          <>
            <ModalBasic
              roomName={passWordRequiredRoom}
              socket={socket}
              setIsOpenModal={setIsOpenModal3}
              innerText={"만들면서 입력할 때임 비번입력 ㄱ"}
            />

            <span>hizzzzzzzzzzzzzzzzzzzzzzzzzzzz</span>
          </>
        )}
      </div> */}

      <NavBar query={query} setQuery={setQuery} />
      <Main>
        <Box>
          {results.length !== 0 && (
            <SearchList
              results={results}
              query={query}
              onSelectRoom={handleSelectRoom}
              setRoomNameModal={setRoomNameModal}
              tmpLoginNickName={tmpLoginNickName}
            />
          )}
          {results.length === 0 && (
            <ErrorMessage message={NO_SEARCH_RESULT_ERROR + query} />
          )}
        </Box>
        <CenterBox
          currentRoomName={currentRoomName}
          tmpLoginID={tmpLoginID}
          tmpLoginNickName={tmpLoginNickName}
        />
        <Box>
          <ChatRoomUser
            curOpen={curOpen}
            setCurOpen={setCurOpen}
            users={roomUserList?.users}
            title={roomUserList?.roomName}
            tmpLoginNickName={tmpLoginNickName}
          />
        </Box>
      </Main>
    </>
  );
}

function ModalOverlay({ isOpenModal }: { isOpenModal: any }) {
  console.log("hidden ? ", isOpenModal);
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
          <img src={userIcon} width="30" height="30" />
        </p>
        <p className="nav-profile">My</p>
        <p className="nav-logout">
          <img src={logOutIcon} width="30" height="30" />
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

function SearchListCreateRoom({ setRoomNameModal }: { setRoomNameModal: any }) {
  const [roomName, setRoomName] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = async (event: any) => {
    setDisabled(true);
    event.preventDefault();
    if (roomName.length < 1) {
      alert("채팅창 이름 입력해라");
    } else {
      await new Promise((r) => setTimeout(r, 10));
      alert(`입력된 채팅창 이름: ${roomName}`);
      setRoomNameModal(roomName);
      socket.emit("tryRoomPass", roomName);
      // setPassWordRequiredRoom(roomName);
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
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
        </span>
        {/* <span>
          <button className="btn-add" type="submit" disabled={disabled}>
            입장
          </button>
        </span> */}
      </div>
    </form>
  );
}

function SearchList({
  results,
  query,
  onSelectRoom,
  setRoomNameModal,
  tmpLoginNickName,
}: {
  results: any;
  query: string;
  onSelectRoom: any;
  setRoomNameModal: any;
  tmpLoginNickName: string;
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
        <h4>{query ? "검색결과" : `${tmpLoginNickName} 님의 참여목록`}</h4>
      </div> */}
      <ul className="list list-rooms-search">
        <SearchListCreateRoom setRoomNameModal={setRoomNameModal} />
      </ul>
      <ul className="list list-rooms">
        {results?.map((el: any) => (
          <SearchResult el={el} key={el.roomName} onSelectRoom={onSelectRoom} />
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
        <h3>{el.roomName}</h3>
      </div>

      {/* <button className="btn-toggle" data-name={el.roomName}>
        {"X"}
      </button> */}

      <div>
        <p>
          <span>{el.messageNew ? "🆕" : "☑️"}</span>
          <span>
            {el.messageRecent.length >= 14
              ? el.messageRecent.substr(0, 14) + "..."
              : el.messageRecent}
          </span>
        </p>
      </div>
    </li>
  );
}

function CenterBox({
  currentRoomName,
  tmpLoginNickName,
  tmpLoginID,
}: {
  currentRoomName: string;
  tmpLoginNickName: string;
  tmpLoginID: string;
}) {
  const handleSubmit = async (event: any) => {
    // setDisabled(true);
    event.preventDefault();
  };
  return (
    <div className="box box-center">
      <div className="box-center-header">
        <h1>Chat in {currentRoomName} </h1>
        {/* <span>
          nickname : {tmpLoginNickName} id : {tmpLoginID}
        </span> */}
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
  title,
  curOpen,
  setCurOpen,
  tmpLoginNickName,
}: {
  users: any;
  title: string;
  curOpen: number;
  setCurOpen: any;
  tmpLoginNickName: string;
}) {
  if (!users || !title) return;
  return (
    <>
      <div className="summary">
        <h4>{title} 유저목록</h4>
      </div>

      <ul className="list-users">
        {users.map((user: any, i: number) => (
          <ChatRoomUserInfo
            user={user}
            key={user.id}
            curOpen={curOpen}
            onOpen={setCurOpen}
            num={i}
            tmpLoginNickName={tmpLoginNickName}
          />
        ))}
      </ul>
    </>
  );
}

function ChatRoomUserInfo({
  user,
  curOpen,
  onOpen,
  num,
  tmpLoginNickName,
}: {
  user: any;
  curOpen: number;
  onOpen: any;
  num: number;
  tmpLoginNickName: string;
}) {
  const isOpen = num === curOpen;

  function handleToggle() {
    onOpen(() => {
      if (isOpen) return null;
      else return num;
    });
  }
  // function handleKBOM() {
  //   setSelectedRoom(room);
  //   setRoomNameModal(room.roomName);
  //   setCurOpen(-1);
  //   console.log("in SelectRoomName handle ", room.roomName);
  //   if (event.target.dataset.name) {
  //     console.log(`${event.target.dataset.name}나가기!!!`);
  //     socket.emit("sendRoomLeave", event.target.dataset.name);
  //   } else {
  //     socket.emit("selectRoom", room.roomName);
  //   }
  //   setRoomUserList(null);
  // }

  return (
    <li
      className={`item-userlist ${isOpen ? "open" : ""}`}
      onClick={handleToggle}
    >
      <p className="number">{num < 9 ? `0${num + 1}` : `${num + 1}`}</p>
      <p className="userlist-username">
        {user.nickName} {user.nickName === tmpLoginNickName ? "🎆" : ""}
      </p>
      {/* <p className="icon">{isOpen ? "-" : "+"}</p> */}
      <div className="userlist-KBOM-box">
        <div>
          <img src={menuIcon} width="15" height="15" />
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
      {isOpen && (
        <div className="content-box">
          <>
            <div>
              {/* <p>
                <span>생성자</span>
                <span>{user.isCreator ? "🟣" : "✖️"}</span>
                <span>방장 </span>
                <span>{user.isOp ? "🟣" : "✖️"}</span>
              </p> */}
            </div>
            <div className="content-box li"></div>
            <div className="content-box li"></div>
            <div className="content-box li"></div>
            <div className="content-box li"></div>
          </>
        </div>
      )}
    </li>
  );
}
