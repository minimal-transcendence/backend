import Logo from "./NavBarLogo";
import Menu from "./NavBarMenu";
import Search from "./NavBarSearch";
// import { SocketContext } from "@/context/socket";
import { useState, useContext } from "react";
export default function NavBar({
  setIsLoading,
  setTmpLoginnickname,
  setLeftHeader,
  setError,
}: {
  setIsLoading: any;
  setTmpLoginnickname: any;
  setLeftHeader: any;
  setError: any;
}) {
  console.log("navebar ");

  return (
    <nav className="nav-bar">
      <Search
        setIsLoading={setIsLoading}
        setLeftHeader={setLeftHeader}
        setError={setError}
      />
      <Logo />
      <Menu setTmpLoginnickname={setTmpLoginnickname} />
    </nav>
  );
}
