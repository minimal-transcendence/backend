import Logo from "./NavBarLogo";
import Menu from "./NavBarMenu";
import Search from "./NavBarSearch";
import { SocketContext } from "../../../context/socket";
import { useState, useContext } from "react";
export default function NavBar({
  query,
  setQuery,
  setIsLoading,

  setLeftHeader,
  setError,
}: {
  query: string;
  setQuery: any;
  setIsLoading: any;
  setLeftHeader: any;
  setError: any;
}) {
  const socket = useContext(SocketContext);
  console.log("navebar ");
  return (
    <nav className="nav-bar">
      <Logo />
      <Search
        query={query}
        setQuery={setQuery}
        setIsLoading={setIsLoading}
        setLeftHeader={setLeftHeader}
        setError={setError}
      />
      <Menu />
    </nav>
  );
}
