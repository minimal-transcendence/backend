import { useEffect, useState } from "react";
import "./index.css";
import * as io from "socket.io-client";
const socket = io.connect("http://localhost:3001");
// const socket = io.connect("http://localhost:3001", {
//   withCredentials: true,
//   extraHeaders: {
//     "my-custom-header": "abcd",
//   },
// });
console.log("ehre ", socket);

socket.on("ytest", (message: any) => {
  console.log("message is ", message);
});
const NO_SEARCH_RESULT_ERROR = "There is no room! : ";
const CLIENTNAME = "ysungwon";

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

const tempSearchList = [
  {
    roomName: "전체채팅방test2",
    messageShort:
      "전체채팅 ㅅㅅㅅㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ채팅이 기니까 화면도 길어지는 거 같다. 몇글자만 짤라서, 화면에는 2줄만 보이도록 설정을 해야 될 거 같다.",
    messageNew: true,
    users: [
      {
        id: "God",
        isCreator: true,
        isOp: true,
      },
      {
        id: "ysungwon",
        isCreator: false,
        isOp: false,
      },
      {
        id: "jaeyjeon",
        isCreator: false,
        isOp: false,
      },
      {
        id: "namkim",
        isCreator: false,
        isOp: false,
      },
      {
        id: "seunchoi",
        isCreator: false,
        isOp: false,
      },
      { id: "ProGamer", isCreator: false, isOp: false },
    ],
  },
  {
    roomName: "게임채팅방",
    messageShort: "게임해야지 히히히",
    messageNew: true,
    users: [
      { id: "ProGamer", isCreator: true, isOp: true },
      {
        id: "ysungwon",
        isCreator: false,
        isOp: true,
      },
      {
        id: "seunchoi",
        isCreator: false,
        isOp: true,
      },
    ],
  },
  {
    roomName: "프론트엔드 방",
    messageShort: "프론트는 메세지 읽었다. JavaScript, 채팅,React,Pong",
    messageNew: false,
    users: [
      {
        id: "jaeyjeon",
        isCreator: true,
        isOp: true,
      },
      {
        id: "ysungwon",
        isCreator: false,
        isOp: true,
      },
    ],
  },
  {
    roomName: "백엔드 방",
    messageShort: "백엔드는 메세지를 안 읽었다..",
    messageNew: true,
    users: [
      {
        id: "namkim",
        isCreator: false,
        isOp: false,
      },
      {
        id: "seunchoi",
        isCreator: false,
        isOp: true,
      },
    ],
  },
  {
    roomName: "안식처",
    messageShort: "에어컨...조아..",
    messageNew: false,
    users: [
      {
        id: "ysungwon",
        isCreator: true,
        isOp: true,
      },
    ],
  },
];
// const tempRoomUserList = [
//   {
//     id: "ysungwon",
//     isCreator: true,
//     isOp: true,
//   },
//   {
//     id: "jaeyjeon",
//     isCreator: false,
//     isOp: false,
//   },
//   {
//     id: "namkim",
//     isCreator: false,
//     isOp: false,
//   },
//   {
//     id: "seunchoi",
//     isCreator: false,
//     isOp: true,
//   },
// ];

export default function App() {
  const [results, setTempSearchList] = useState<TempSearch[]>([]);
  // const [users, setTempRoomUserList] = useState(tempRoomUserList);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [curOpen, setCurOpen] = useState<number>(-1);

  isLoading;
  function handleSelectRoom(room: any) {
    setSelectedRoom(room);
    setCurOpen(-1);
    console.log("in handleSelectRoom ", room);
  }

  useEffect(
    function () {
      async function fetchResults() {
        try {
          setIsLoading(true);

          if (query === "#all") {
            setTempSearchList(tempSearchList);
            setSelectedRoom(null);
            setError("");
          } else if (!query) {
            // throw new Error(SEARCH_REQUIRE_ERROR);
            const tempResults = tempSearchList.filter((result) => {
              return (
                result.users.filter((user) => user.id === CLIENTNAME).length ===
                1
              );
            });

            if (tempResults.length === 0) {
              setSelectedRoom(null);
              throw new Error(NO_SEARCH_RESULT_ERROR + query);
            }
            setSelectedRoom(null);
            setTempSearchList(() => tempResults);
            setError("");
          } else {
            const tempResults = tempSearchList.filter((result) =>
              result.roomName.includes(query)
            );
            if (tempResults.length === 0) {
              setSelectedRoom(null);
              throw new Error(NO_SEARCH_RESULT_ERROR + query);
            }
            setSelectedRoom(null);
            setTempSearchList(() => tempResults);
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
          {!error && (
            <SearchList
              results={results}
              query={query}
              onSelectRoom={handleSelectRoom}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <CenterBox />
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
        <div className="content-box">
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
        </div>
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
