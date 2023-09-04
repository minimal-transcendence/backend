import { useEffect, useState, useContext } from "react";
import { SocketContext } from "@/context/socket";

import SearchListCreateRoom from "./SearchListCreateRoom";

import SearchListMain from "./SearchListMain";

export default function SearchList({
  results,
  query,
  leftHeader,
  setLeftHeader,
  setroomnameModal,
  isOpenModal,
  setIsOpenModal,
  setTempSearchList,
  blocklist,
}: {
  results: any;
  query: any;
  leftHeader: any;
  setLeftHeader: any;
  setroomnameModal: any;
  isOpenModal: boolean;
  setIsOpenModal: any;
  setTempSearchList: any;
  blocklist: any;
}) {
  const socket = useContext(SocketContext).chatSocket;
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

    socket.on("sendRoomList", sendRoomList);
    socket.on("requestPassword", requestPassword);
    socket.on("responseRoomQuery", responseRoomQuery);

    return () => {
      socket.off("responseRoomQuery", responseRoomQuery);
      socket.off("sendRoomList", sendRoomList);
      socket.off("requestPassword", requestPassword);
    };
  }, [socket, isOpenModal, results]);

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
        />
      </div>
    </>
  );
}
