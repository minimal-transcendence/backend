import { useEffect, useState, useContext } from "react";
import { SocketContext } from "@/context/socket";

import SearchListCreateRoom from "./SearchListCreateRoom";
import SearchSelect from "./SearchSelect";
import SearchResult from "./SearchResult";

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
  if (!results) return;
  else {
    let tmpResults;
    if (results.length <= pageHeight) {
      tmpResults = results;
      console.log(
        `users length가 ${
          results.length
        }이므로 1페이지 미만., tmpResults : ${JSON.stringify(
          tmpResults,
          null,
          2
        )}`
      );
    } else {
      const startIndex = (page - 1) * pageHeight;
      tmpResults = results.slice(startIndex, startIndex + pageHeight);
      console.log(
        `results length가 ${
          results.length
        }이므로 1페이지 이상가능., tmpResults : ${JSON.stringify(
          tmpResults,
          null,
          2
        )}`
      );

      console.log(`현재 페이지는 ${page}이므로`);
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
          {tmpResults?.map((el: any) => (
            <SearchResult
              el={el}
              blocklist={blocklist}
              key={el.roomname}
              onSelectRoom={handleSelectRoom}
            />
          ))}
        </ul>
      </>
    );
  }
}
