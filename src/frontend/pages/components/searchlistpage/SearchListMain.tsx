import { useEffect, useState, useContext } from "react";
import { SocketContext } from "@/context/socket";

import SearchListCreateRoom from "./SearchListCreateRoom";
import SearchSelect from "./SearchSelect";
import SearchResult from "./SearchResult";
import ErrorMessage from "./ErrorMessage";
const NO_SEARCH_RESULT_ERROR = "There is no room! : ";
const pageHeight = 6;
export default function SearchListHeader({
  results,
  query,
  leftHeader,
  setLeftHeader,
  setroomnameModal,
  blocklist,
}: {
  results: any;
  query: any;
  leftHeader: any;
  setLeftHeader: any;
  setroomnameModal: any;
  blocklist: any;
}) {
  const socket = useContext(SocketContext).chatSocket;

  const [page, setPage] = useState<number>(1);
  const [leftArrow, setLeftArrow] = useState<boolean>(false);
  const [rightArrow, setRightArrow] = useState<boolean>(false);
  const [lastClicked, setLastClicked] = useState<any>(new Date().getTime());
  useEffect(
    function () {
      function a() {
        if (results?.length > page * pageHeight) setRightArrow(() => true);
        if (page > 1) setLeftArrow(() => true);
        if (results?.length <= page * pageHeight) setRightArrow(() => false);
        if (page === 1) setLeftArrow(() => false);
      }
      a();
    },
    [results, page]
  );

  function handleSelectRoom(event: any, room: any) {
    setroomnameModal(room.roomname);
    console.log("in Selectroomname handle ", room?.roomname);
    socket.emit("selectRoom", { roomname: room?.roomname });
  }

  function handleChk(event: any) {
    if (new Date().getTime() - lastClicked < 1000) {
      console.log("Last Click ", lastClicked);
      return; // dont do anything
    }
    setLastClicked(() => new Date().getTime());
    if (event.target.dataset.name) {
      console.log("in handleChk ", event.target.dataset.name);
      setLeftHeader(event.target.dataset.name);
      if (event.target.dataset.name === "all")
        socket.emit("requestAllRoomList");
      else if (event.target.dataset.name === "result") {
        console.log("wehn click result ", query);
        socket.emit("requestSearchResultRoomList", { target: query });
      } else if (event.target.dataset.name === "joined")
        socket.emit("requestMyRoomList");
    } else console.log("in handleChk other");
  }

  let tmpResults;
  if (results?.length <= pageHeight) {
    tmpResults = results;
  } else {
    const startIndex = (page - 1) * pageHeight;
    tmpResults = results?.slice(startIndex, startIndex + pageHeight);
  }

  return (
    <>
      <div className="list-rooms-search">
        <SearchListCreateRoom setroomnameModal={setroomnameModal} />
      </div>
      <div className="selection-list" onClick={() => handleChk(event)}>
        <SearchSelect
          query={query}
          leftHeader={leftHeader}
          setLeftHeader={setLeftHeader}
        />

        <span className="btn-page-wrap">
          <button
            onClick={() => setPage(() => page - 1)}
            className={`btn-page ${leftArrow ? "" : "visible"}`}
          >
            &larr;
          </button>
          <button
            onClick={() => setPage(() => page + 1)}
            className={`btn-page ${rightArrow ? "" : "visible"}`}
          >
            &rarr;
          </button>
        </span>
      </div>
      <ul className="list list-rooms">
        {results?.length === 0 || !results ? (
          <ErrorMessage message={NO_SEARCH_RESULT_ERROR + query} />
        ) : (
          tmpResults?.map((el: any) => (
            <SearchResult
              el={el}
              blocklist={blocklist}
              key={el.roomname}
              onSelectRoom={handleSelectRoom}
            />
          ))
        )}
      </ul>
    </>
  );
}
