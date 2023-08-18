import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../../../context/socket";

export default function Search({
  query,
  setQuery,
  setIsLoading,
  setSelectedRoom,
  setLeftHeader,
  setError,
}: {
  query: string;
  setQuery: any;
  setIsLoading: any;
  setSelectedRoom: any;
  setLeftHeader: any;
  setError: any;
}) {
  const socket = useContext(SocketContext);
  useEffect(
    function () {
      function fetchResults() {
        try {
          setIsLoading(true);

          if (query === "#all") {
            socket.emit("requestAllRoomList");
            setSelectedRoom(null);
            setLeftHeader("all");
            setError("");
          } else if (!query) {
            console.log("!query");
            socket.emit("requestMyRoomList");

            setLeftHeader("joined");
            setSelectedRoom(null);
            setError("");
          } else {
            console.log("in requestMyRoomList if <", query);
            socket.emit("requestSearchResultRoomList", query);

            setSelectedRoom(null);
            setLeftHeader("result");
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
    [query, setError, setIsLoading, setLeftHeader, setSelectedRoom, socket]
  );
  return (
    <input
      className="search"
      type="text"
      placeholder="Search Room"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
