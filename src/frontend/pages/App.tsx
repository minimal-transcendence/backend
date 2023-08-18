import { useEffect, useState } from "react";

import * as io from "socket.io-client";
import ModalBasic from "./components/modalpage/modal";
import ModalOverlay from "./components/modalpage/ModalOverlay";
import TempLogin from "./components/temploginpage/tempLogin";
import NavBar from "./components/navpage/NavBar";
import GameList from "./components/gamepage/GameList";
import ChatMain from "./components/chatpage/ChatMain";
import SearchList from "./components/searchlistpage/SearchList";
import ChatRoomUser from "./components/chatroompage/ChatRoom";
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
  const [tmpLoginID, setTmpLoginID] = useState<string>("");
  const [tmpLoginnickname, setTmpLoginnickname] = useState<string>("");
  const [tmpIsLoggedIn, setTmpIsLoggedIn] = useState<boolean>(false);

  const [results, setTempSearchList] = useState<TempSearch[]>([]);
  const [query, setQuery] = useState("");
  const [roomUserList, setRoomUserList] = useState<any>(null);

  const [roomnameModal, setroomnameModal] = useState<string>("");
  const [currentRoomName, setcurrentRoomName] = useState<string>("");
  const [leftHeader, setLeftHeader] = useState<string>("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

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

    socket.on("sendRoomMembers", sendRoomMembers);

    return () => {
      socket.off("sendRoomMembers", sendRoomMembers);
    };
  }, [currentRoomName]);

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
                setIsOpenModal={setIsOpenModal}
                innerText={"방클릭해서 드갈때 비번입력 ㄱ"}
              />
            )}
          </div>

          <NavBar
            query={query}
            setQuery={setQuery}
            setIsLoading={setIsLoading}
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
                    setTempSearchList={setTempSearchList}
                    isOpenModal={isOpenModal}
                    setIsOpenModal={setIsOpenModal}
                    leftHeader={leftHeader}
                    setLeftHeader={setLeftHeader}
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

function Main({ children }: { children: any }) {
  return <main className="main">{children}</main>;
}

function Box({ children }: { children: any }) {
  return <div className="box">{children}</div>;
}
