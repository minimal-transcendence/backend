import { useEffect, useState, useContext } from "react";
import { SocketContext } from "@/context/socket";
import TempRandomMatch from "../../components/pong/TempRandomMatch";
export default function Search({
  setIsLoading,
  setLeftHeader,
  setError,
  isGameConnected,
  handleGameOnOff,
  matchStartCheck,
}: {
  setIsLoading: any;
  setLeftHeader: any;
  setError: any;
  isGameConnected: any;
  matchStartCheck: boolean;
  handleGameOnOff: any;
}) {
  const socket = useContext(SocketContext).chatSocket;

  return (
    <div>
      <button
        disabled={!isGameConnected}
        onClick={handleGameOnOff}
        className="gameAccept-div"
      >
        Game ON / OFF
      </button>
      {matchStartCheck && <TempRandomMatch />}
    </div>
  );
}
