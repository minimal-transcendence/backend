import React, { useState, useEffect, useRef, useContext } from "react";
import axiosApi, { fetch_refresh } from "./FetchInterceptor";
import styles_profile from "../styles/UserProfileStyle.module.css";
import { SocketContext, SocketContent } from "@/pages/App";
import "../pages/index.css";

function UserProfile({ id, setIsOpenModal }: { id: any; setIsOpenModal: any }) {
  const [userNickname, setUserNickname] = useState<string | null>(
    localStorage.getItem("nickname")
  );
  const [userId, setUserID] = useState<string | null>(
    localStorage.getItem("id")
  );
  const [userData, setData] = useState<userDataInterface[]>([]);
  const [friendList, setFriendList] = useState<string[]>([]);
  const [showProfile, setShowProfile] = useState<Boolean>(false);

  const closeModal = () => {
    setIsOpenModal(false);
  };
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 이벤트 핸들러 함수
    const handler = () => {
      console.log("in myprofile handler");
      if (!event) return;
      // mousedown 이벤트가 발생한 영역이 모달창이 아닐 때, 모달창 제거 처리
      const target = event.target as HTMLInputElement;
      if (modalRef.current && !modalRef.current.contains(target)) {
        setIsOpenModal(false);
      }
    };

    // 이벤트 핸들러 등록
    document.addEventListener("mousedown", handler);
    // document.addEventListener('touchstart', handler); // 모바일 대응

    return () => {
      // 이벤트 핸들러 해제
      document.removeEventListener("mousedown", handler);
      // document.removeEventListener('touchstart', handler); // 모바일 대응
    };
  });
  interface userMatchHistory {
    winner: string;
    winnerAvatar: string;
    loser: string;
    loserAvatar: string;
    time: string;
  }

  interface userDataInterface {
    id: string;
    nickname: string;
    userProfileURL: string;
    win: number;
    lose: number;
    score: number;
    lastLogin: string;
    isFriend: number;
    isLogin: number;
    matchhistory: userMatchHistory[];
  }

  const socket = useContext<SocketContent>(SocketContext).chatSocket;

  function checkIsInclude(id: string[], userid: string) {
    if (id.includes(userid.toString())) {
      return 1;
    } else {
      return 0;
    }
  }

  const reloadData = async () => {
    setData([]);
    setFriendList([]);
    console.log(id);

    let idList: string[] = [];
    //const responseFriend = await (await fetch_refresh ('http://localhost/api/user/' + userId + '/friend')).json();
    const responseData = await axiosApi.get(
      "http://localhost/api/user/" + userId + "/friend"
    );
    const responseFriend = responseData.data;
    const friendCount = responseFriend.friendList.length;
    for (let i = 0; i < friendCount; i++) {
      idList.push(responseFriend.friendList[i].id.toString());
    }
    setFriendList(idList);

    const newDataList: userDataInterface[] = [];
    const responseDetail = await axiosApi.get(
      "http://localhost/api/user/" + id
    );
    const detailResponse = responseDetail.data;
    const responseMatch = await axiosApi.get(
      "http://localhost/api/user/" + id + "/matchhistory"
    );
    const matchResponse = responseMatch.data;
    const matchCount = matchResponse.length;
    const newData: userDataInterface = {
      id: detailResponse.id,
      nickname: detailResponse.nickname,
      userProfileURL: "/api/" + detailResponse.avatar,
      win: detailResponse._count.asWinner,
      lose: detailResponse._count.asLoser,
      score:
        parseInt(detailResponse._count.asWinner) * 10 -
        parseInt(detailResponse._count.asLoser) * 10,
      lastLogin: detailResponse.lastLogin,
      isFriend: checkIsInclude(idList, detailResponse.id),
      //isLogin: checkIsInclude(conList, detailResponse.id),
      isLogin: 1,
      matchhistory: [],
    };
    for (let j = 0; j < matchCount; j++) {
      const newMatchData: userMatchHistory = {
        winner: matchResponse[j].winner.nickname,
        winnerAvatar: "/api/" + matchResponse[j].winner.avatar,
        loser: matchResponse[j].loser.nickname,
        loserAvatar: "/api/" + matchResponse[j].loser.avatar,
        time: matchResponse[j].createdTime,
      };
      newMatchData.time = newMatchData.time.slice(0, 19);
      newMatchData.time = newMatchData.time.replace("T", " ");
      newData.matchhistory.push(newMatchData);
    }
    newDataList.push(newData);
    setData(newDataList);
    console.log(userData);
    setShowProfile(true);
  };

  function sendGameMatch(index: number) {
    //매치신청 보내기
  }

  async function follow(index: number) {
    const apiUrl = "http://localhost/api/user/" + userId + "/friend";
    const dataToUpdate = {
      id: userId,
      isAdd: true,
      friend: userData[0].id,
    };

    await axiosApi
      .patch(apiUrl, JSON.stringify(dataToUpdate), {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.data.error) {
          alert("Follow에 실패했습니다");
          console.error("에러 발생:", response.data.error);
        } else {
          console.log("Follow 성공 데이터:", response.data);
          let copiedData = [...userData];
          copiedData[index].isFriend = 1;
          setData(copiedData);
        }
      })
      .catch((error) => {
        alert("Follow에 실패했습니다");
        console.error("에러 발생:", error);
      });
  }
  async function unFollow(index: number) {
    const apiUrl = "http://localhost/api/user/" + userId + "/friend";
    const dataToUpdate = {
      id: userId,
      isAdd: false,
      friend: userData[0].id,
    };

    await axiosApi
      .patch(apiUrl, JSON.stringify(dataToUpdate), {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.data.error) {
          alert("UnFollow에 실패했습니다");
          console.error("에러 발생:", response.data.error);
        } else {
          console.log("UnFollow 성공 데이터:", response.data);
          let copiedData = [...userData];
          copiedData[index].isFriend = 0;
          setData(copiedData);
        }
      })
      .catch((error) => {
        alert("UnFollow에 실패했습니다");
        console.error("에러 발생:", error);
      });
  }

  useEffect(() => {
    reloadData();
  }, []);

  useEffect(() => {
    async function reloadStatus(userId : number, isConnected : boolean){
      console.log("Status Update! " + userId + isConnected);
      if (isConnected === true){
        let copiedData = [...userData];
        for(let i = 0; i <= copiedData.length ; i++)
        {
          if(copiedData[i].id == userId.toString()){
            copiedData[i].isLogin = 1;
            break;
          }
        }
        setData(copiedData);
      }
      else{
        let copiedData = [...userData];
        for(let i = 0; i <= copiedData.length ; i++)
        {
          if(copiedData[i].id == userId.toString()){
            copiedData[i].isLogin = 0;
            break;
          }
        }
        setData(copiedData);
      }
    }

    async function reloadNick(userId : number, newNick : string){
      let copiedData = null;
      console.log("Nickname Update! " + userId + newNick);
      for(let i = 0; i <= userData.length ; i++)
      {
        if(userData[i].id == userId.toString()){
          copiedData = [...userData];
          copiedData[i].nickname = newNick;
          break;
        }
      }
      if (copiedData != null){
        setData(copiedData);
      }
    }
  
    async function reloadAvatar(userId : number){
      console.log("Avatar Update! " + userId);
      let copiedData = [...userData];
      for(let i = 0; i <= userData.length ; i++)
      {
        if(copiedData[i].id == userId.toString()){
          const responseDetail = await axiosApi.get('http://localhost/api/user/' + userId, );
          const detailResponse = responseDetail.data;
          copiedData[i].userProfileURL = "/api/" + detailResponse.avatar;
          break;
        }
      }
      if (copiedData != null){
        setData(copiedData);
      }
    }

    if (socket){
      socket.on("updateUserStatus", reloadStatus);
      socket.on("updateUserNick", reloadNick);
      socket.on("updateUserAvatar", reloadAvatar);
    }
    return () => {
      if (socket) {
        socket.off("updateUserStatus", reloadStatus);
        socket.off("updateUserNick", reloadNick);
        socket.off("updateUserAvatar", reloadAvatar);
      }
    };
  }, [socket, userData]);

  function getDetailProfile() {
    return (
      <>
        <div className={styles_profile.mainBox}>
          <div className={styles_profile.profileInner}>
            <div className={styles_profile.imageBox}>
              <img
                src={userData[0].userProfileURL}
                alt="profile img"
                className={styles_profile.profileImage}
              />
              {userData[0].isLogin === 0 && (
                <div className={styles_profile.circleLogout}></div>
              )}
              {userData[0].isLogin === 1 && (
                <div className={styles_profile.circleLogin}></div>
              )}
            </div>
            <div>
              <h2>{userData[0].nickname}의 프로필</h2>
            </div>
            <br />
            <br />
            <br />
            <br />
            <br />
            <div className={styles_profile.wlsBanner}>
              Win / Lose / Total Score
            </div>
            <div>
              <h2>
                {userData[0].win} / {userData[0].lose} / {userData[0].score}
              </h2>
            </div>
            <div className={styles_profile.buttons}>
              {userData[0].nickname !== userNickname &&
                userData[0].isFriend === 0 && (
                  <button
                    className={styles_profile.followButton}
                    onClick={() => {
                      follow(0);
                    }}
                  >
                    {" "}
                    팔로우{" "}
                  </button>
                )}
              {userData[0].nickname !== userNickname &&
                userData[0].isFriend === 1 && (
                  <button
                    className={styles_profile.followingButton}
                    onClick={() => {
                      unFollow(0);
                    }}
                  >
                    {" "}
                    언팔로우{" "}
                  </button>
                )}
                {userData[0].nickname !== userNickname && (
              <button className={styles_profile.gameButton}> 게임 신청 </button>)}
            </div>
          </div>
          <div className={styles_profile.logInner}>
            <div className={styles_profile.logBanner}>
              <h1>최근 전적</h1>
              {userData[0].matchhistory.slice(0, 10).map((item, idx) => (
                <div key={idx} className={styles_profile.logBox}>
                  <div className={styles_profile.logTime}>
                    {userData[0].matchhistory[idx].time.slice(0, 10)}
                    <br />
                    {userData[0].matchhistory[idx].time.slice(11, 19)}
                  </div>
                  <div className={styles_profile.logName}>
                    {userData[0].matchhistory[idx].winner}
                  </div>
                  <img
                    src={userData[0].matchhistory[idx].winnerAvatar}
                    alt="profile img"
                    className={styles_profile.logProfileImage}
                  />
                  <div className={styles_profile.resultFont}>승</div>
                  <div className={styles_profile.resultFont}>패</div>
                  <img
                    src={userData[0].matchhistory[idx].loserAvatar}
                    alt="profile img"
                    className={styles_profile.logProfileImage}
                  />
                  <div className={styles_profile.logName}>
                    {userData[0].matchhistory[idx].loser}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function getDetailProfileBox() {
    return <div className={styles_profile.fontSet}>{getDetailProfile()}</div>;
  }

  return (
    <div ref={modalRef} className="modal modal-userprofile">
      {showProfile && getDetailProfileBox()}
    </div>
  );
}

export default UserProfile;
