import { useEffect, useState, useContext, createContext } from "react";
import "./index.css";
import * as io from "socket.io-client";
import Pong from "@/srcs/Pong";
import TempRandomMatch from "@/srcs/TempRandomMatch";

const NO_SEARCH_RESULT_ERROR = "There is no room! : ";
const NO_JOINNED_RESULT_ERROR = "No Joinned???! : ";
const CLIENTNAME = "ysungwon";

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
  roomName: string;
  messageShort: string;
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
  const [nickname, setNickname] = useState<string>('');

  // const [socket, setSocket] = useState<any>();

  isLoading;
  function handleSelectRoom(room: any) {
    setSelectedRoom(room);
    setCurOpen(-1);
    console.log("in SelectRoomName ", room.roomName);
  }

  // ERR - 렌더링 될 때마다 계속 소켓을 생성함
  /*
  검색 Input에 의해 App컴포넌트가 리렌더링 될 때마다 소켓 생성
  => 컴포넌트를 나눠서 렌더링 하도록 해야할 듯 (<SearchBar/>, <Chat/>)
  */
  const socket = io.connect("http://localhost/chat", {
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

  // gameSocket.on('connection', (socket: any) => {
  //   gameSocket = socket;
  //   console.log(gameSocket);
  // })

  // gameSocket.on('disconnect', (reason : any, detail : any) => {
  //   console.log(reason);
  //   console.log(detail);
  // })

  // const gameSocket = io.connect("http://localhost/game", {
  //   auth: {
  //     token: jwt,
  //   },
  // });

  useEffect(() => {
    // setUserId(() => localStorage.getItem("id"));
    const item = localStorage.getItem("access_token");
    if (item) {
      setJwt(item);
    }

    const nick = localStorage.getItem("nickname");
    if (nick) {
      setNickname(nick);
    }
  }, []);

  // useEffect(() => {
  //   const newSocket = io.connect("http://localhost/chat", {
  //     auth: {
  //       token: jwt,
  //     },
  //   });

  //   if (newSocket) {
  //     setSocket(newSocket);
  //   }

  //   // return () => {
  //   //   if (socket.readyState === 1) {
  //   //     socket.close();
  //   //   }
  //   // }
  // }, [jwt]);

  socket.on("ytest", (message: any) => {
    console.log("message is ", message);
    socket.emit("message", "hello from NEXT");
  });

  socket.on("hello", (message: any) => {
    console.log("hello", message);
    // socket.emit("message", "hello from NEXT");
  });

  // gameSocket.on("game", (message: any) => {
  //   console.log("message from game socket : ", message);
  // });

  useEffect(() => {
    function requestAllRoomList(result: any) {
      console.log("in useEffect allroom");
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

    return () => {
      socket.off("requestAllRoomList", requestAllRoomList);
      socket.off("requestMyRoomList", requestMyRoomList);
      socket.off("requestSearchResultRoomList", requestSearchResultRoomList);
    };
  }, []);

  useEffect(
    function () {
      async function fetchResults() {
        try {
          setIsLoading(true);

          if (query === "#all") {
            socket.emit("requestAllRoomList");
            setSelectedRoom(null);
            setError("");
          } else if (!query) {
            // throw new Error(SEARCH_REQUIRE_ERROR);

            socket.emit("requestMyRoomList");

            if (results.length === 0) {
              setSelectedRoom(null);

              throw new Error(NO_JOINNED_RESULT_ERROR + query);
            }

            setSelectedRoom(null);
            setTempSearchList(() => results);
            setError("");
          } else {
            socket.emit("requestSearchResultRoomList", query);
            if (results.length === 0) {
              setSelectedRoom(null);
              throw new Error(NO_SEARCH_RESULT_ERROR + query);
            }
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
          <AppContext.Provider value={{gameSocket: gameSocket}}>
            <TempRandomMatch/>
          </AppContext.Provider>
          {!error && (
            <SearchList
              results={results}
              query={query}
              onSelectRoom={handleSelectRoom}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
          <AppContext.Provider value={{gameSocket: gameSocket}}>
            <Pong/>
          </AppContext.Provider>
        <Box>
          <ChatRoomUser
            curOpen={curOpen}
            setCurOpen={setCurOpen}
            users={selectedRoom?.users}
            title={selectedRoom?.roomName}
          />
        </Box>
      </Main>
    </>
  );
}

function ErrorMessage({ message }: { message: string }) {
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

function SearchList({
  results,
  query,
  onSelectRoom,
}: {
  results: any;
  query: string;
  onSelectRoom: any;
}) {
  if (!results) return;
  return (
    <>
      <div className="summary">
        <h2>{query ? "검색결과" : "참여목록"}</h2>
      </div>
      <ul className="list list-rooms">
        {results?.map((el: any) => (
          <SearchResult el={el} key={el.roomName} onSelectRoom={onSelectRoom} />
        ))}
      </ul>
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
          <span>{el.messageShort}</span>
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
    console.log(isOpen, num, curOpen);

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
