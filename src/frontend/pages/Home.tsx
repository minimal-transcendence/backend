import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import UserList from "../srcs/UserList";
import MyProfile from "../srcs/MyProfile";
import App from "./App";
function Home() {
  const router = useRouter();
  const [myProfileModal, setMyProfileModal] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const logout = () => {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('id');
    localStorage.removeItem('nickname');
    localStorage.removeItem('is2fa');
    localStorage.removeItem('access_token');
    localStorage.removeItem('avatar');
    const ApiUrl = 'http://localhost/api/auth/logout';
		fetch(ApiUrl,{
			method: 'POST'});
    setIsLoggedIn(false);
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
      <div>
        <div>
          <button onClick={() => setMyProfileModal(true)}>내 프로필</button>
          <button onClick={logout}>로그 아웃</button>
          <h1>홈</h1>
        </div>
        <div>
          <UserList />
        </div>
        <div>
        {myProfileModal && (
          <>
          <button onClick={() => setMyProfileModal(false)}>닫기</button>
          <MyProfile />
          </>
        )}
        <App />
        </div>
      </div>
    );
  }
}

export default Home;
