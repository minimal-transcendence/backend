import { useEffect, useState } from "react";

export default function Search({
  socket,
  query,
  setQuery,
  setIsLoading,
  setSelectedRoom,
  setLeftHeader,
  setError,
}: {
  socket: any;
  query: string;
  setQuery: any;
  setIsLoading: any;
  setSelectedRoom: any;
  setLeftHeader: any;
  setError: any;
}) {
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
    [query]
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
