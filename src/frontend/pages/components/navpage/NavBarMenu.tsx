import { useState, useContext, useEffect } from "react";
import logOutIcon from "../../../assets/logout.png";
import userIcon from "../../../assets/user.png";
import contestIcon from "../../../assets/contest.png";

import { SocketContext } from "@/context/socket";
import { GameContext } from "@/context/game";
import Image from "next/image";

import { useRouter } from "next/router";
import UserList from "../../../srcs/UserList";
import MyProfile from "../../../srcs/MyProfile";
import UserProfile from "../../../srcs/UserProfile";
import ModalOverlay from "../../components/modalpage/ModalOverlay";

import axiosApi, { fetch_refresh } from "../../../srcs/FetchInterceptor";

export default function Menu({
  setTmpLoginnickname,
}: {
  setTmpLoginnickname: any;
}) {
  const router = useRouter();
  const [myProfileModal, setMyProfileModal] = useState<boolean>(false);
  const [userListModal, setUserListModal] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [randomMatch, setRandomMatch] = useState<string>("");
  const [easy, setEasy] = useState<boolean>(false);
  const [normal, setNormal] = useState<boolean>(false);
  const [hard, setHard] = useState<boolean>(false);
  // const socket = useContext(SocketContext).gameSocket;

  //seunchoi
  const isGameConnected = useContext(GameContext).isGameConnected;
  // const matchStartCheck = useContext(GameContext).matchStartCheck;
  console.log("In NavMenu:", isGameConnected);
  const socketContext = useContext(SocketContext);
  const gameSocket = socketContext.gameSocket;
  const [block, setBlock] = useState<boolean>(true);

  // useEffect(() => {
  //   if (matchStartCheck) {
  //     setRandomMatch("");
  //   }
  // }, [matchStartCheck])

  useEffect(() => {
    setBlock(false);
  }, [isGameConnected])

  useEffect(() => {
    gameSocket.on('startGame', () => {
      setRandomMatch("");
      setBlock(true);
    });
    gameSocket.on('gameOver', () => {
      setBlock(false);
    })
    gameSocket.on('matchDecline', () => {
      setRandomMatch("");
      setBlock(false);
    })
  }, [gameSocket])

  useEffect(() => {
    // 예시로 localStorage에 isLoggedIn 상태를 저장한 것으로 가정
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    if (storedIsLoggedIn === "true") {
      setIsLoggedIn(true);
    }
    else{
      alert("로그인이 필요합니다");
      router.push("/")
    }
  }, []);

  const logout = () => {
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("id");
    localStorage.removeItem("nickname");
    localStorage.removeItem("is2fa");
    localStorage.removeItem("access_token");
    localStorage.removeItem("avatar");
    const ApiUrl = "http://localhost/api/auth/logout";
    axiosApi.post(ApiUrl, {
    });
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    router.push("/")
  };

  function handleMenu(event: any) {
    if (event.target.dataset.name) {
      console.log(`${event.target.dataset.name}클릭!!!`);

      if (event.target.dataset.name === "easy") {
        if (randomMatch !== "easy") {
          gameSocket.emit("randomMatchApply", "easy");
          console.log("random Easy apply");
          setRandomMatch(() => "easy");
        } else {
          gameSocket.emit("randomMatchCancel");
          console.log("random Easy Cancel");
          setRandomMatch(() => "");
        }
      } else if (event.target.dataset.name === "normal") {
        if (randomMatch !== "normal") {
          gameSocket.emit("randomMatchApply", "normal");
          console.log("random Normal apply");
          setRandomMatch(() => "normal");
        } else {
          gameSocket.emit("randomMatchCancel");
          console.log("random Normal Cancel");
          setRandomMatch(() => "");
        }
      } else if (event.target.dataset.name === "hard") {
        if (randomMatch !== "hard") {
          gameSocket.emit("randomMatchApply", "hard");
          console.log("random Hard apply");
          setRandomMatch(() => "hard");
        } else {
          gameSocket.emit("randomMatchCancel");
          console.log("random Hard Cancel");
          setRandomMatch(() => "");
        }
      }
    } else {
      console.log("you click other");
    }
  }
  return (
    <>
      <div className="nav-bar-menu">
        <div className="nav-bar-menu-l">
          <div className="nav-randmatch">
            <div className="dropdown">
              {/* <img
              className="dropbtn"
              src={contestIcon}
              width="35"
              height="35"
              alt="contesticon"
            /> */}

              <Image
                className="dropbtn"
                src={contestIcon}
                width="35"
                height="35"
                alt="contesticon"
              />
              {!block && (
                <div
                onClick={() => handleMenu(event)}
                className="dropdown-content"
              >
                <div data-name="easy">
                  {"RandomMatch Easy " +
                    `${randomMatch !== "easy" ? "off" : "on"}`}
                </div>
                <div data-name="normal">
                  {"RandomMatch Normal " +
                  `${randomMatch !== "normal" ? "off" : "on"}`}
                </div>
                <div data-name="hard">
                  {"RandomMatch Hard " +
                    `${randomMatch !== "hard" ? "off" : "on"}`}
                </div>
              </div>
              )}
            </div>
          </div>
          <p className="nav-userlist" onClick={() => setUserListModal(true)}>
            {/* <img src={userIcon} width="30" height="30" alt="usericon" /> */}
            <Image src={userIcon} width="30" height="30" alt="usericon" />
          </p>
          <p className="nav-profile" onClick={() => setMyProfileModal(true)}>
            My
          </p>
          <p className="nav-logout">
            {/* <img src={logOutIcon} width="30" height="30" /> */}
            <Image
              src={logOutIcon}
              onClick={logout}
              width="30"
              height="30"
              alt="logouticon"
            />
          </p>
        </div>
      </div>
      <ModalOverlay isOpenModal={myProfileModal} />
      <div>
        {myProfileModal && (
          <>
            <MyProfile
              setIsOpenModal={setMyProfileModal}
              setTmpLoginnickname={setTmpLoginnickname}
            />
          </>
        )}
      </div>
      <ModalOverlay isOpenModal={userListModal} />
      <div>
        {userListModal && (
          <>
            <UserList setIsOpenModal={setUserListModal} />
          </>
        )}
      </div>
    </>
  );
}
