import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../../../context/socket";

import SearchListCreateRoom from "./SearchListCreateRoom";

export default function SearchListHeader({
  results,
  query,
  leftHeader,
  setLeftHeader,
  setroomnameModal,
}: {
  results: any;
  query: any;
  leftHeader: any;
  setLeftHeader: any;
  setroomnameModal: any;
}) {
  const socket = useContext(SocketContext);

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
    </>
  );
}
