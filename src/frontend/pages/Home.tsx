import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import UserList from "../srcs/UserList";
import MyProfile from "../srcs/MyProfile";
import UserProfile from "../srcs/UserProfile";
import App from "./App";
// import axiosApi from "@/srcs/AxiosInterceptor";
// import { refreshToken, setItems } from "@/srcs/SocketRefresh";
// import { socketRefreshToken } from "@/srcs/SocketRefresh";
import jwt_decode from "jwt-decode";
import { JwtPayload } from "./callback";
import { SocketContext } from "@/context/socket";

// type JwtPayload = {
//     id: number;
//     email: string;
//     iat: number;
//     exp: number;
// }

function Home() {
  const router = useRouter();
  const [myProfileModal, setMyProfileModal] = useState<boolean>(false);
  const [userListModal, setUserListModal] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [jwt, setJWT] = useState<string>('');
  // const [jwtExp, setJwtExp] = useState<string>('');

  const [validToken, setValidToken] = useState<boolean>(false);

  const chatSocket = useContext(SocketContext).chatSocket;

  // 이미 로그인되었는지 확인
  useEffect(() => {
    //seunchoi - refresh
    const socketRefreshToken = async (jwtExp: number) => {
      if (jwtExp * 1000 - Date.now() < 2000) {
        await fetch('api/auth/refresh')
        .then((response) => {
          if (!response.ok){
            throw new Error(`invalid refresh token ${response.status.toString()}`);
          }
          return (response.json())
        })
        .then((json) => {
          localStorage.setItem("access_token", json.access_token);
          const jwtDecode = jwt_decode<JwtPayload>(json.access_token);
          localStorage.setItem("access_token_exp", jwtDecode.exp.toString());
          setValidToken(true); // success
        })
        .catch((error) => {
          console.error(error);
          localStorage.setItem("isLoggedIn", "false");
          localStorage.removeItem("id");
          localStorage.removeItem("nickname");
          localStorage.removeItem("is2fa");
          localStorage.removeItem("access_token");
          localStorage.removeItem("avatar");
          sessionStorage.removeItem("gamesocket");

          chatSocket.emit('logout');

          router.push("/");
        })
      } else {
        console.log("Doesn't need to refresh");
        setValidToken(true); // success
      }
    }

    // setItems(setJWT, setJwtExp);
    //TODO : 만약 setItem에서 실패하면 storedIsLoggedIn은 false로 set해야하지는 않는지...?
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    const jwtExp = localStorage.getItem("access_token_exp");

    if (jwtExp) {
      socketRefreshToken(Number(jwtExp)); // async/await
    }


    if (storedIsLoggedIn === "true" && validToken) {
      setIsLoggedIn(true);
    }
  }, [validToken]);

  if (!isLoggedIn) {
    // 로그인 상태가 아닐 경우, 로그인 페이지로 이동
    return (
      <div>
        <p>로그인이 필요합니다. 로그인 페이지로 이동합니다.</p>
        <button onClick={() => router.push("/")}>Go to Home</button>
      </div>
    );
  } else {
    return (
      <div>
        {/* <div>
          <button onClick={() => setMyProfileModal(true)}>내 프로필</button>
          <button onClick={() => setUserListModal(true)}>유저 목록</button>
          <button onClick={logout}>로그 아웃</button>
        </div>
        <div>
          {userListModal && (
            <>
              <button onClick={() => setUserListModal(false)}>닫기</button>
              <UserList />
            </> 
          )}
        </div>
        <div>
          {myProfileModal && (
            <>
              <button onClick={() => setMyProfileModal(false)}>닫기</button>
              <MyProfile />
            </>
          )}
        </div>
            <UserProfile id='1' />  */}
        <div>
          <App/>
        </div>
      </div>
    );
  }
}

export default Home;
