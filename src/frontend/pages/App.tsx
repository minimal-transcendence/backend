import { useEffect, useState } from "react";
import "./index.css";
import * as io from "socket.io-client";
const socket = io.connect("http://localhost", {
  path: "/socket.io",
  // query: {
  //   id: userId,
  // },
});
const NO_SEARCH_RESULT_ERROR = "There is no room! : ";
const NO_JOINNED_RESULT_ERROR = "No Joinned???! : ";
const CLIENTNAME = "ysungwon";

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

  // isLoading;
  // selectedRoom;
  function handleSelectRoom(room: any) {
    setSelectedRoom(room);
    setCurOpen(-1);
    console.log("in SelectRoomName ", room.roomName);
    socket.emit("requestRoomMembers", room.roomName);
  }

  useEffect(() => {
    function requestRoomMembers(result: any) {
      console.log(
        "in useEffect roomMembers",
        JSON.stringify(result[0], null, 2)
      );
      setRoomUserList(() => result[0]);
    }
    function requestAllRoomList(result: any) {
      console.log("in useEffect allromo");
      setTempSearchList(() => result);
    }

    function requestMyRoomList(result: any) {
      console.log("in useEffect myroom", result);
      setTempSearchList(() => result);
    }
    function requestSearchResultRoomList(result: any) {
      console.log("in useEffect searchResult", result);
      setTempSearchList(() => result);
    }

    socket.on("requestAllRoomList", requestAllRoomList);
    socket.on("requestMyRoomList", requestMyRoomList);
    socket.on("requestSearchResultRoomList", requestSearchResultRoomList);
    socket.on("requestRoomMembers", requestRoomMembers);
    return () => {
      socket.off("requestAllRoomList", requestAllRoomList);
      socket.off("requestMyRoomList", requestMyRoomList);
      socket.off("requestSearchResultRoomList", requestSearchResultRoomList);
      socket.off("requestRoomMembers", requestRoomMembers);
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
            // throw new Error(SEARCH_REQUIRE_ERROR);
            socket.emit("requestMyRoomList");
            console.log("in requestMyRoomList if");
            // if (results.length === 0) {
            //   setSelectedRoom(null);
            //   throw new Error(NO_JOINNED_RESULT_ERROR + query);
            // }

            setSelectedRoom(null);
            setTempSearchList(() => results);
            setError("");
          } else {
            socket.emit("requestSearchResultRoomList", query);
            // if (results.length === 0) {
            //   setSelectedRoom(null);
            //   throw new Error(NO_SEARCH_RESULT_ERROR + query);
            // }
            setSelectedRoom(null);
            setTempSearchList(() => results);
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

  return (
    <>
      <NavBar query={query} setQuery={setQuery} />
      <Main>
        <Box>
          {results.length !== 0 && (
            <SearchList
              results={results}
              query={query}
              onSelectRoom={handleSelectRoom}
            />
          )}
          {results.length === 0 && (
            <ErrorMessage message={NO_SEARCH_RESULT_ERROR} />
          )}
        </Box>
        <CenterBox />
        <Box>
          <ChatRoomUser
            curOpen={curOpen}
            setCurOpen={setCurOpen}
            users={roomUserList?.users}
            title={roomUserList?.roomName}
          />
        </Box>
      </Main>
    </>
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
    </div>
  );
}

function Search({ query, setQuery }: { query: string; setQuery: any }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search Room...(#all show every room)"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function NavMenu() {
  return (
    <div className="nav-bar-menu">
      <div className="nav-bar-menu-l">
        <p className="nav-userlist">유저정보</p>
        <p className="nav-profile">내 정보</p>
        <p className="nav-logout">로그아웃</p>
      </div>
      <div className="nav-bar-menu-r">
        <div className="nav-randmatch">
          <input type="checkbox" id="switch" />
          <label htmlFor="switch">Toggle</label>
        </div>
      </div>
    </div>
  );
}

function Main({ children }: { children: any }) {
  return <main className="main">{children}</main>;
}

function Box({ children }: { children: any }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box box-search-list">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function SearchListCreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = async (event: any) => {
    setDisabled(true);
    event.preventDefault();
    if (roomName.length < 1) {
      alert("채팅창 이름 입력해라");
    } else {
      await new Promise((r) => setTimeout(r, 1000));
      alert(`입력된 채팅창 이름: ${roomName}`);
    }

    setDisabled(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="div-form">
        <span>
          {" "}
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
        </span>
        <span>
          <button className="btn-add" type="submit" disabled={disabled}>
            채팅장 입장
          </button>
        </span>
      </div>
    </form>
  );
}

function SearchList({
  results,
  query,
  onSelectRoom,
}: {
  results: any;
  query: string;
  onSelectRoom: any;
}) {
  console.log(
    `in SearchList query : <${query}>
    results : <${results}>`
  );
  if (!results) return;
  return (
    <>
      <div className="summary">
        <h2>{query ? "검색결과" : "참여목록"}</h2>
      </div>
      <ul className="list list-rooms">
        <SearchListCreateRoom />
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
        <span>1/1</span>
        <span>
          <button className="btn-back">&rarr;</button>
        </span>
      </div>
    </>
  );
}

function SearchResult({ el, onSelectRoom }: { el: any; onSelectRoom: any }) {
  return (
    <li onClick={() => onSelectRoom(el)}>
      <h3>{el.roomName}</h3>
      <div>
        <p>
          <span>{el.messageNew ? "🆕" : "☑️"}</span>
          <span>{el.messageRecent}</span>
        </p>
      </div>
    </li>
  );
}

function CenterBox() {
  return <div className="box box-center">mainbox</div>;
}

function ChatRoomUser({
  users,
  title,
  curOpen,
  setCurOpen,
}: {
  users: any;
  title: string;
  curOpen: number;
  setCurOpen: any;
}) {
  if (!users || !title) return;
  return (
    <>
      <div className="summary">
        <h2>{title} 유저목록</h2>
      </div>

      <ul className="list list-users">
        {users.map((user: any, i: number) => (
          <ChatRoomUserInfo
            user={user}
            key={user.id}
            curOpen={curOpen}
            onOpen={setCurOpen}
            num={i}
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
}: {
  user: any;
  curOpen: number;
  onOpen: any;

  num: number;
}) {
  const isOpen = num === curOpen;

  function handleToggle() {
    // console.log(isOpen, num, curOpen);

    onOpen(() => {
      if (isOpen) return null;
      else return num;
    });
  }
  // return (
  //   <div className={`item ${isOpen ? "open" : ""}`} onClick={handleToggle}>
  //     <p className="number">{num < 9 ? `0${num + 1}` : `${num + 1}`}</p>
  //     <p className="title">{title}</p>
  //     <p className="icon">{isOpen ? "-" : "+"}</p>
  //     {isOpen && <div className="content-box"> {text}</div>}
  //   </div>
  // );

  return (
    <li className={`item ${isOpen ? "open" : ""}`} onClick={handleToggle}>
      <p className="number">{num < 9 ? `0${num + 1}` : `${num + 1}`}</p>
      <p>
        {user.id} {user.id === CLIENTNAME ? "🎆" : ""}
      </p>
      <p className="icon">{isOpen ? "-" : "+"}</p>

      {isOpen && (
        <span className="content-box">
          <>
            <div>
              <p>
                <span>생성자</span>
                <span>{user.isCreator ? "🟣" : "✖️"}</span>
                <span>방장 </span>
                <span>{user.isOp ? "🟣" : "✖️"}</span>
              </p>
            </div>
            <div>
              <span>kick</span>
            </div>
            <div>
              <span>방장권한주기</span>
            </div>
            <div>
              <span>mute</span>
            </div>
            <div>
              <span>testsetsetsetasdgasdgs</span>
            </div>
          </>
        </span>
      )}
    </li>
  );
}

// const faqs = [
//   {
//     title: "ysungwon",
//     text: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Accusantium, quaerat temporibus quas dolore provident nisi ut aliquid ratione beatae sequi aspernatur veniam repellendus.",
//   },
//   {
//     title: "jaeyjeon",
//     text: "Pariatur recusandae dignissimos fuga voluptas unde optio nesciunt commodi beatae, explicabo natus.",
//   },
//   {
//     title: "seunchoi",
//     text: "Excepturi velit laborum, perspiciatis nemo perferendis reiciendis aliquam possimus dolor sed! Dolore laborum ducimus veritatis facere molestias!",
//   },
//   {
//     title: "namkim",
//     text: "Excepturi velit laborum, perspiciatis nemo perferendis reiciendis aliquam possimus dolor sed! Dolore laborum ducimus veritatis facere molestias!",
//   },
// ];

// function Accordion({ data }) {
//   const [curOpen, setCurOpen] = useState(null);

//   return (
//     <div className="accordion">
//       {data.map((el, i) => (
//         <AccordionItem
//           curOpen={curOpen}
//           onOpen={setCurOpen}
//           title={el.title}
//           num={i}
//           text={el.text}
//           key={i}
//         />
//       ))}
//     </div>
//   );
// }

// function AccordionItem({ num, title, text, curOpen, onOpen }) {
//   const isOpen = num === curOpen;

//   function handleToggle() {
//     console.log(isOpen, num, curOpen);

//     onOpen(() => {
//       if (isOpen) return null;
//       else return num;
//     });
//   }
//   return (
//     <div className={`item ${isOpen ? "open" : ""}`} onClick={handleToggle}>
//       <p className="number">{num < 9 ? `0${num + 1}` : `${num + 1}`}</p>
//       <p className="title">{title}</p>
//       <p className="icon">{isOpen ? "-" : "+"}</p>
//       {isOpen && <div className="content-box"> {text}</div>}
//     </div>
//   );
// }
