import { useEffect, useState } from "react";

import * as io from "socket.io-client";
import ModalBasic from "./components/modalpage/modal";
import ModalOverlay from "./components/modalpage/ModalOverlay";
import TempLogin from "./components/temploginpage/tempLogin";
import NavBar from "./components/navpage/NavBar";
import GameList from "./components/gamelistpage/GameList";
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
  lastMessage: string;
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
  const [messages, setMessages] = useState<any>([]);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [blocklist, setBlocklist] = useState<any>([]);

  useEffect(
    function () {
      function chkLogin() {
        if (tmpIsLoggedIn) {
          socket.io.opts.query = {
            id: tmpLoginID,
            nickname: tmpLoginnickname,
          };
          socket.connect();
          console.log("in chkLogin ", socket);
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
    function sendBlocklist(blocklist: string[]) {
      console.log("sendBlocklist update + " + JSON.stringify(blocklist));
      setBlocklist(() => blocklist);
    }
    function updateBlocklist(target: string) {
      console.log("updateBlocklist update");
      setBlocklist(() => [...blocklist, target]);
    }
    function sendRoomMembers(result: any) {
      console.log(
        "in useEffect sendRoomMembers zzzzz",
        JSON.stringify(result, null, 2)
      );

      setRoomUserList(() => result);
      setLeftHeader(() => "joined");
      // setcurrentRoomName(() => result[0].roomname);
      setQuery("");
    }

    function sendMessage(roomname: string, data: any) {
      console.log(
        `in useEffect sendMessage ??111  from<${
          data?.from
        }> roomname<${roomname}> body<${JSON.stringify(
          data,
          null,
          2
        )}> 내 방은 <${currentRoomName}>`
      );
      setTempSearchList((results) => {
        return results.map((result) => {
          if (result.roomname === roomname) {
            result.lastMessage = `${data.body}`;
            if (roomname === currentRoomName) {
              result.messageNew = false;
            } else {
              result.messageNew = true;
            }
          }
          return result;
        });
      });
      if (roomname === currentRoomName) {
        console.log("same room!", currentRoomName, roomname);
        setMessages(() => [...messages, data]);
      }
    }
    function sendDM(from: string, data: any) {
      console.log(
        `in useEffect sendDM  from<${from}> data<${JSON.stringify(
          data,
          null,
          2
        )}> 내 방은 <${currentRoomName}>`
      );
      if (
        from === currentRoomName ||
        (from === tmpLoginnickname && data.from === currentRoomName)
      ) {
        console.log("same froom!", currentRoomName, from);
        setMessages(() => [...messages, data]);
      }
    }
    function youAreKickedOut(result: any) {
      console.log(
        "in useEffect youAreKickedOut",
        JSON.stringify(result, null, 2)
      );
    }
    function youAreBanned(result: any) {
      console.log("in useEffect youAreBanned", JSON.stringify(result, null, 2));
    }
    function wrongPassword(result: any) {
      console.log(
        "in useEffect wrongPassword",
        JSON.stringify(result, null, 2)
      );
    }
    function sendAlert(alertTitle: string, alertBody: string) {
      console.log(
        "in useEffect sendAlert",
        alertTitle,
        JSON.stringify(alertBody, null, 2)
      );
    }

    socket.on("sendBlocklist", sendBlocklist);
    socket.on("updateBlocklist", updateBlocklist);
    socket.on("youAreKickedOut", youAreKickedOut);
    socket.on("youAreBanned", youAreBanned);
    socket.on("wrongPassword", wrongPassword);
    socket.on("sendAlert", sendAlert);
    socket.on("sendDM", sendDM);
    socket.on("sendMessage", sendMessage);
    socket.on("sendRoomMembers", sendRoomMembers);

    return () => {
      socket.off("sendBlocklist", sendBlocklist);
      socket.off("updateBlocklist", updateBlocklist);
      socket.off("youAreKickedOut", youAreKickedOut);
      socket.off("youAreBanned", youAreBanned);
      socket.off("wrongPassword", wrongPassword);
      socket.off("sendAlert", sendAlert);
      socket.off("sendMessage", sendMessage);
      socket.off("sendRoomMembers", sendRoomMembers);
      socket.off("sendDM", sendDM);
    };
  }, [currentRoomName, results, messages, socket]);

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
              roomInfo={roomInfo}
              setRoomInfo={setRoomInfo}
              messages={messages}
              setMessages={setMessages}
              currentRoomName={currentRoomName}
              setcurrentRoomName={setcurrentRoomName}
              myNickName={tmpLoginnickname}
              blocklist={blocklist}
            />
            <Box>
              <>
                <ChatRoomUser
                  blocklist={blocklist}
                  roomInfo={roomInfo}
                  setRoomInfo={setRoomInfo}
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
