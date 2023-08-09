import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import UserList from "../srcs/UserList";
import MyProfile from "../srcs/MyProfile";
import App from "./App";
function Home() {
  const router = useRouter();
  const [greeting, setGreeting] = useState<string[]>(["hihi", "hello", "안녕"]);
  const [myProfileModal, setMyProfileModal] = useState<boolean>(false);
  const [number, setNumber] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function onIncrease() {
    setNumber(number + 1);
  }

  const logout = () => {
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("id");
    localStorage.removeItem("nickname");
    localStorage.removeItem("is2fa");
    setIsLoggedIn(false);
    // 로그아웃 post하기
  };

  // 이미 로그인되었는지 확인
  useEffect(() => {
    // 예시로 localStorage에 isLoggedIn 상태를 저장한 것으로 가정
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    if (storedIsLoggedIn === "true") {
      setIsLoggedIn(true);
    }
  });

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
      <App />

      // <div>
      //   <div>
      //     <button onClick={() => setMyProfileModal(true)}>내 프로필</button>
      //     <button onClick={onIncrease}>인사 바꾸기</button>
      //     <button onClick={logout}>로그 아웃</button>
      //     <h1>홈</h1>
      //     <p>이곳은 홈이에요, 가장 먼저 보여주는 페이지임</p>
      //     <p>{greeting[number % 3]}</p>
      //   </div>

      //   <div>
      //     <UserList />
      //   </div>
      //   <div>
      //     {myProfileModal && (
      //       <>
      //         <button onClick={() => setMyProfileModal(false)}>닫기</button>
      //         <MyProfile />
      //       </>
      //     )}
      //   </div>
      // </div>
    );
  }
}

export default Home;
