import { useEffect, useState, useContext } from "react";
import { SocketContext } from "@/context/socket";

import SearchListCreateRoom from "./SearchListCreateRoom";

import SearchListMain from "./SearchListMain";

export default function SearchList({
  results,

  leftHeader,
  isOpenModal,
  blocklist,
  currentRoomName,
  lastMessageList,
  setLastMessageList,
  setError,
  setIsLoading,

  setLeftHeader,
  setroomnameModal,
  setIsOpenModal,
  setTempSearchList,
  setCurrentRoomName,
}: {
  results: any;

  leftHeader: any;
  setLeftHeader: any;
  setroomnameModal: any;
  isOpenModal: boolean;
  setIsOpenModal: any;
  setTempSearchList: any;
  blocklist: any;
  currentRoomName: string;
  setCurrentRoomName: any;
  lastMessageList: any;
  setLastMessageList: any;
  setError: any;
  setIsLoading: any;
}) {
  const socket = useContext(SocketContext).chatSocket;
  const [query, setQuery] = useState("");
  console.log("in searchList ", results);
  useEffect(() => {
    function requestPassword(roomname: string) {
      console.log(
        "in useEffect requestPassword",
        JSON.stringify(roomname, null, 2)
      );
      alert(`requestPassword이벤트가 왔어요zx. ${roomname} ${isOpenModal}`);
      setIsOpenModal(true);
    }
    function sendRoomList(newResults: any) {
      console.log(
        `in useEffect sendRoomList <${JSON.stringify(newResults, null, 2)}>
        currentRoomName <${currentRoomName}>`
      );

      let max = lastMessageList;
      newResults.map((result: any) => {
        let chkNew;
        if (!max.get(result.roomname)) {
          console.log(`result.roomname <${result.roomname}>
          max.get(result.roomname) <${max.get(result.roomname)}>`);
          max.set(result.roomname, {
            lastMessage: result?.lastMessage,
            messageNew: true,
          });
          console.log(
            `after get,set, map <${JSON.stringify(
              max.get(result.roomname),
              null,
              2
            )}>`
          );
          result.messageNew = true;
        }
        if (currentRoomName === result.roomname) {
          console.log(
            `curRoom === result.roomname currentRoomname <${currentRoomName}> result.roomname <${result.roomname}>`
          );
          result.messageNew = false;
          max.set(result.roomname, {
            lastMessage: result.lastMessage,
            messageNew: false,
          });
          return result;
        } else {
          if (
            max.get(result.roomname)?.lastMessage === result?.lastMessage &&
            result.messageNew === false
          ) {
            console.log(
              `when same,,??? 
              smaechk <${
                max.get(result.roomname)?.lastMessage === result?.lastMessage
              }>
              result.roomname <${result.roomname}>
              max[result.roomname] <${JSON.stringify(
                max.get(result.roomname),
                null,
                2
              )}>
              max[result.roomname]?.lastMessage  <${
                max.get(result.roomname)?.lastMessage
              }> result?.lastMessage <${result?.lastMessage}>`
            );
            result.messageNew = false;
            max.set(result.roomname, {
              lastMessage: result.lastMessage,
              messageNew: false,
            });
            return result;
          } else if (
            max.get(result.roomname)?.lastMessage !== result?.lastMessage
          ) {
            console.log(
              `not smae, 
              chk <${
                max.get(result.roomname)?.lastMessage !== result?.lastMessage
              }>
              result.roomname <${result.roomname}>
              max[result.roomname] <${JSON.stringify(
                max.get(result.roomname),
                null,
                2
              )}>
              max[result.roomname]?.lastMessage  <${
                max.get(result.roomname)?.lastMessage
              }> result?.lastMessage <${result?.lastMessage}>`
            );
            result.messageNew = true;
            max.set(result.roomname, {
              lastMessage: result.lastMessage,
              messageNew: true,
            });
            return result;
          }
        }
      });
      max.forEach((value: any, key: any) => {
        console.log(
          `value <${JSON.stringify(value, null, 2)}>  
          key <${JSON.stringify(key, null, 2)}>`
        );
      });

      console.log(`newResults <${JSON.stringify(newResults, null, 2)}>`);
      setLastMessageList(() => max);
      setTempSearchList(() => newResults);
    }
    function responseRoomQuery(result: any) {
      console.log(
        `in useEffect responseRoomQuery <${JSON.stringify(result, null, 2)}>`
      );
      setTempSearchList(() => result);
    }

    socket.on("sendRoomList", sendRoomList);
    socket.on("requestPassword", requestPassword);
    socket.on("responseRoomQuery", responseRoomQuery);

    return () => {
      socket.off("responseRoomQuery", responseRoomQuery);
      socket.off("sendRoomList", sendRoomList);
      socket.off("requestPassword", requestPassword);
    };
  }, [socket, isOpenModal, results, currentRoomName, lastMessageList]);

  return (
    <>
      <div className="wrp">
        <SearchListMain
          results={results}
          query={query}
          blocklist={blocklist}
          leftHeader={leftHeader}
          setLeftHeader={setLeftHeader}
          setroomnameModal={setroomnameModal}
          setCurrentRoomName={setCurrentRoomName}
          setError={setError}
          setIsLoading={setIsLoading}
          setQuery={setQuery}
        />
      </div>
    </>
  );
}
