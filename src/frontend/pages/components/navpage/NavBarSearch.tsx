import { useEffect, useState, useContext } from "react";
import { SocketContext } from "@/context/socket";

export default function Search({
  setIsLoading,
  setLeftHeader,
  setError,
}: {
  setIsLoading: any;
  setLeftHeader: any;
  setError: any;
}) {
  const socket = useContext(SocketContext).chatSocket;

  return (
    <div className="gameAccept-div">
      <div>GameMode</div>
    </div>
  );
}
