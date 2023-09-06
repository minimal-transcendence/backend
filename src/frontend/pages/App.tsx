import { useEffect, useState } from "react";

import * as io from "socket.io-client";
import { Socket } from "socket.io-client";
import ModalBasic from "./components/modalpage/modal";
import ModalOverlay from "./components/modalpage/ModalOverlay";
import TempLogin from "./components/temploginpage/tempLogin";
import NavBar from "./components/navpage/NavBar";
import GameList from "./components/gamelistpage/GameList";
import ChatMain from "./components/chatpage/ChatMain";
import SearchList from "./components/searchlistpage/SearchList";
import DirectMessageList from "./components/dmlist/DirectMessageList";
import ChatRoomUser from "./components/chatroompage/ChatRoom";

import ModalAlert from "./components/modalpage/ModalAlert";
// import Pong, { AutoSave, GameOverData, StartGameData } from "@/srcs/Pong";
import Pong, {
  AutoSave,
  GameOverData,
  StartGameData,
} from "./components/pong/Pong";
// import { SocketContext, socket } from "../context/socket";
// import searchIcon from "./assets/search.png";
import Image from "next/image";
import TempRandomMatch from "./components/pong/TempRandomMatch";
import { SocketContext } from "@/context/socket";
import { GameContext, GameData } from "@/context/game";
import axiosApi from "../srcs/AxiosInterceptor";
export type UserOnChat = {
  id: string;
  isCreator: boolean;
  isOp: boolean;
};

export type TempSearch = {
  roomname: string;
  lastMessage: string;
  lastMessageFrom: string;
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
  const [currentRoomName, setCurrentRoomName] = useState<string>("");
  const [leftHeader, setLeftHeader] = useState<string>("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [messages, setMessages] = useState<any>([]);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [blocklist, setBlocklist] = useState<any>([]);

  const [alertModal, setAlertModal] = useState<boolean>(false);
  const [alertModalTitle, setAlertModalTitle] = useState<string>("");
  const [alertModalBody, setAlertModalBody] = useState<string>("");
  const [isDM, setIsDM] = useState<boolean>(false);
  // seunchoi - for socket connection
  const [gameLoad, setGameLoad] = useState<boolean>(false);
  // Get Empty Socket Instance
  const [socket, setSocket] = useState<Socket>(
    io.connect("", { query: { nickname: "" }, autoConnect: false })
  );
  const [gameSocket, setGameSocket] = useState<Socket>(
    io.connect("", { query: { nickname: "" }, autoConnect: false })
  );
  const [changedID, setChangedID] = useState<number>(-2);
  const [changedNickName, setChangedNickName] = useState<string>("");

  const [lastMessageList, setLastMessageList] = useState<any>(new Map());
  const [directMessageMap, setDirectMessageMap] = useState<any>(new Map());
  const [directMessageList, setDirectMessageList] = useState<any>([]);
  useEffect(() => {
    function reloadNick(userId: number, newNick: string) {
      console.log("in useEffect ChatRoom nicknameupdate " + userId + newNick);

      setChangedID(() => userId);
      setChangedNickName(() => newNick);

      const nicknameItem = localStorage.getItem("nickname");
      const loginIdItem = localStorage.getItem("id");

      if (loginIdItem === String(userId)) {
        console.log(
          `id same so nick changed! FROM ${nicknameItem} to ${newNick}`
        );
        setTmpLoginnickname(newNick);
      }
    }

    if (socket) {
      socket.on("updateUserNick", reloadNick);
    }
    return () => {
      if (socket) {
        socket.off("updateUserNick", reloadNick);
      }
    };
  }, [socket]);

  useEffect(() => {
    console.log("Run only mount");
    const getSocket = (namespace: string, jwt: string, nickname: string) => {
      return io.connect(`http://localhost/${namespace}`, {
        query: { nickname: nickname },
        auth: { token: jwt },
      });
    };

    const nicknameItem = localStorage.getItem("nickname");
    const loginIdItem = localStorage.getItem("id");
    if (nicknameItem && loginIdItem) {
      setTmpLoginnickname(nicknameItem);
      setTmpLoginID(loginIdItem);
      setTmpIsLoggedIn(true);
      console.log(
        `in first useEffect nickname : ${nicknameItem} id: ${loginIdItem}`
      );
    }
    const jwtItem = localStorage.getItem("access_token");

    // Run whenever jwt state updated
    if (nicknameItem && jwtItem) {
      console.log("Try Web Socket Connection");
      setSocket(getSocket("chat", jwtItem, nicknameItem));
      setGameSocket(getSocket("game", jwtItem, nicknameItem));
    }
  }, []);

  useEffect(() => {
    function sendBlocklist(result: any) {
      console.log("sendBlocklist update + " + JSON.stringify(result));
      setBlocklist(() => result);
    }
    function updateBlocklist(target: number) {
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

      let max = lastMessageList;
      results.map((result: any) => {
        let chkNew;

        if (currentRoomName === result.roomname) {
          console.log(
            `in sendMessage  currentRoomName <${currentRoomName}> result.roomname <${result.roomname}>`
          );
          result.messageNew = false;
          result.lastMessage = data.body;
          max.set(result.roomname, {
            lastMessage: result.lastMessage,
            messageNew: false,
          });
          return result;
        }
        return result;
      });
      max.forEach((value: any, key: any) => {
        console.log(
          `value <${JSON.stringify(value, null, 2)}>  key <${JSON.stringify(
            key,
            null,
            2
          )}>`
        );
      });

      console.log(
        `in sendMessage,  results <${JSON.stringify(results, null, 2)}>`
      );
      setLastMessageList(() => max);
      setTempSearchList(() => results);

      if (roomname === currentRoomName && !isDM) {
        console.log("same room!", currentRoomName, roomname);
        setMessages(() => [...messages, data]);
      }
    }
    function sendDM(to: string, data: any) {
      console.log(
        `in useEffect sendDM  to<${to}> data<${JSON.stringify(
          data,
          null,
          2
        )}> 내 방은 <${currentRoomName}>`
      );
      console.log(
        "in useEffect sendDM to, curretRoomName, isDM  chk",
        to,
        currentRoomName,
        isDM,
        data?.from === currentRoomName || to === currentRoomName
      );

      let max = directMessageMap;

      if (data?.from !== tmpLoginnickname)
        max.set(data?.from, {
          data,
          messageNew: false,
        });

      max.forEach((value: any, key: any) => {
        console.log(
          `In SEND DM   value <${JSON.stringify(
            value,
            null,
            2
          )}>  key <${JSON.stringify(key, null, 2)}>`
        );
      });

      console.log(
        `!!!!!!!!!!! directMessageList <${JSON.stringify(
          directMessageList,
          null,
          2
        )}>`
      );
      directMessageMap?.forEach((value: any, key: any) => {
        console.log(
          `In directMessageMapLSIT   value <${JSON.stringify(
            value,
            null,
            2
          )}>  key <${JSON.stringify(key, null, 2)}>`
        );
      });
      setDirectMessageList(() => [...directMessageMap]);
      setDirectMessageMap(() => max);

      if (
        isDM &&
        ((data?.from === currentRoomName && to === tmpLoginnickname) ||
          (to === currentRoomName && data?.from === tmpLoginnickname))
      ) {
        console.log("same froom!", currentRoomName, to);
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
      setAlertModalTitle(() => alertTitle);
      setAlertModalBody(() => alertBody);
      setAlertModal(() => true);
    }
    if (socket) {
      //test seunchoi
      socket.on("inGame", (userId) => {
        console.log(`${userId} is in game`);
      });
      socket.on("NotInGame", (userId) => {
        console.log(`${userId} is not in game`);
      });

      socket.on("sendAlert", sendAlert);
      socket.on("sendBlocklist", sendBlocklist);
      socket.on("updateBlocklist", updateBlocklist);
      socket.on("youAreKickedOut", youAreKickedOut);
      socket.on("youAreBanned", youAreBanned);
      socket.on("wrongPassword", wrongPassword);
      socket.on("sendDM", sendDM);
      socket.on("sendMessage", sendMessage);
      socket.on("sendRoomMembers", sendRoomMembers);
    }

    return () => {
      if (socket) {
        socket.off("sendAlert", sendAlert);
        socket.off("sendBlocklist", sendBlocklist);
        socket.off("updateBlocklist", updateBlocklist);
        socket.off("youAreKickedOut", youAreKickedOut);
        socket.off("youAreBanned", youAreBanned);
        socket.off("wrongPassword", wrongPassword);
        socket.off("sendMessage", sendMessage);
        socket.off("sendRoomMembers", sendRoomMembers);
        socket.off("sendDM", sendDM);
      }
    };
  }, [
    currentRoomName,
    results,
    messages,
    socket,
    blocklist,
    isDM,
    directMessageMap,
    directMessageList,
  ]);

  // seunchoi
  const handleGameOnOff = () => {
    setGameLoad(!gameLoad);
  };

  const [isGameConnected, setIsGameConnected] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>("");
  const [matchStartCheck, setMatchStartCheck] = useState<boolean>(false);
  const [gameData, setGameData] = useState<GameData>({
    inGame: false,
    gameOver: false,
    player: [],
    playerColor: [],
    canvasWidth: 900,
    canvasHeight: 1600,
    paddleWidth: 0,
    paddleHeight: 0,
    ballRadius: 0,
    winner: "",
    loser: "",
  });

  useEffect(() => {
    gameSocket.on("hello", () => {
      console.log("In hello");
      setIsGameConnected(true);
    });

    gameSocket.on("matchStartCheck", (payload: AutoSave) => {
      console.log(`${payload.roomName} is checking`);
      setRoomName(payload.roomName);
      setMatchStartCheck(true);
      // setGameLoad(true);
    });

    gameSocket.on("matchDecline", (payload: string) => {
      console.log(`${payload} is declined`);
      setRoomName("");
      setMatchStartCheck(false);
    });

    gameSocket.on("startGame", (payload: StartGameData) => {
      console.log("In startGame", payload.player);
      setMatchStartCheck(false);
      setGameLoad(true);

      setGameData({
        inGame: true,
        gameOver: false,
        player: payload.player,
        playerColor: payload.playerColor,
        canvasWidth: payload.canvasWidth,
        canvasHeight: payload.canvasHeight,
        paddleWidth: payload.paddleWidth,
        paddleHeight: payload.paddleHeight,
        ballRadius: payload.ballRadius,
        winner: "",
        loser: "",
      });
    });

    gameSocket.on("gameOver", (payload: GameOverData) => {
      setGameData({
        inGame: false,
        gameOver: true,
        player: [],
        playerColor: [],
        canvasWidth: 0,
        canvasHeight: 0,
        paddleWidth: 0,
        paddleHeight: 0,
        ballRadius: 0,
        winner: payload.winner,
        loser: payload.loser,
      });
    });
  }, [gameSocket]); // gameData?
  // }, [gameSocket, isGameConnected, gameData]) // gameData?

  return (
    <SocketContext.Provider
      value={{
        chatSocket: socket,
        gameSocket: gameSocket,
      }}
    >
      {
        <>
          <ModalOverlay isOpenModal={alertModal} />
          <div>
            {alertModal && (
              <ModalAlert
                alertTitle={alertModalTitle}
                alertBody={alertModalBody}
                setIsOpenModal={setAlertModal}
              />
            )}
          </div>
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
          {/* seunchoi - TEST */}
          <button disabled={!isGameConnected} onClick={handleGameOnOff}>
            game on/off
          </button>
          <GameContext.Provider
            value={{
              isGameConnected: isGameConnected,
              matchStartCheck: matchStartCheck,
              roomName: roomName,
              gameData: gameData,
            }}
          >
            {
              matchStartCheck && (
                <TempRandomMatch />
              ) /*todo - match accept modal*/
            }
            <NavBar
              query={query}
              setQuery={setQuery}
              setIsLoading={setIsLoading}
              setTmpLoginnickname={setTmpLoginnickname}
              setLeftHeader={setLeftHeader}
              setError={setError}
            />
          </GameContext.Provider>
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
                    blocklist={blocklist}
                    currentRoomName={currentRoomName}
                    setCurrentRoomName={setCurrentRoomName}
                    lastMessageList={lastMessageList}
                    setLastMessageList={setLastMessageList}
                  />
                  <DirectMessageList
                    myNickName={tmpLoginnickname}
                    directMessageList={directMessageList}
                    setDirectMessageList={setDirectMessageList}
                    directMessageMap={directMessageMap}
                    setDirectMessageMap={setDirectMessageMap}
                    isDM={isDM}
                    setIsDM={setIsDM}
                    currentRoomName={currentRoomName}
                  />
                </>
              }
            </Box>
            {gameLoad && (
              <GameContext.Provider
                value={{
                  isGameConnected: isGameConnected,
                  matchStartCheck: matchStartCheck,
                  roomName: roomName,
                  gameData: gameData,
                }}
              >
                <Pong />
              </GameContext.Provider>
            )}

            <ChatMain
              isDM={isDM}
              setIsDM={setIsDM}
              roomInfo={roomInfo}
              setRoomInfo={setRoomInfo}
              messages={messages}
              setMessages={setMessages}
              currentRoomName={currentRoomName}
              setCurrentRoomName={setCurrentRoomName}
              myNickName={tmpLoginnickname}
              blocklist={blocklist}
              gameLoad={gameLoad}
              lastMessageList={lastMessageList}
              setLastMessageList={setLastMessageList}
            />

            <Box>
              <>
                <ChatRoomUser
                  id={tmpLoginID}
                  isDM={isDM}
                  blocklist={blocklist}
                  roomInfo={roomInfo}
                  setRoomInfo={setRoomInfo}
                  users={roomUserList}
                  roomname={currentRoomName}
                  myNickName={tmpLoginnickname}
                  changedID={changedID}
                  changedNickName={changedNickName}
                />
                <GameList
                  myNickName={tmpLoginnickname}
                  setMatchStartCheck={setMatchStartCheck}
                />
              </>
            </Box>
          </Main>
        </>
      }
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
