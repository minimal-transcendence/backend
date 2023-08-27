import Logo from "./NavBarLogo";
import Menu from "./NavBarMenu";
import Search from "./NavBarSearch";
import { SocketContext } from "@/pages/App";
import { useState, useContext } from "react";
export default function NavBar({
  query,
  setQuery,
  setIsLoading,
  setTmpLoginnickname,
  setLeftHeader,
  setError,
}: {
  query: string;
  setQuery: any;
  setIsLoading: any;
  setTmpLoginnickname: any;
  setLeftHeader: any;
  setError: any;
}) {
  const socket = useContext(SocketContext).chatSocket;
  console.log("navebar ");

  //   <div>
  //   <button onClick={() => setMyProfileModal(true)}>내 프로필</button>
  //   <button onClick={() => setUserListModal(true)}>유저 목록</button>
  //   <button onClick={logout}>로그 아웃</button>
  // </div>
  // <div>
  //   {userListModal && (
  //     <>
  //       <button >닫기</button>
  //       <UserList />
  //     </>
  //   )}
  // </div>
  // <div>
  //   {myProfileModal && (
  //     <>
  //       <button >닫기</button>
  //       <MyProfile />
  //     </>
  //   )}
  // </div>
  //     {/*<UserProfile id='1' /> 유저 프로필만 가져올때는 이렇게 사용 id는 보고싶은 유저의 id*/}

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
      <Menu setTmpLoginnickname={setTmpLoginnickname} />
    </nav>
  );
}
