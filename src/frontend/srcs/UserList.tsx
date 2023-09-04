import React, { useState, useEffect, useRef, useContext } from "react";
import axiosApi from "./AxiosInterceptor";
import styles from "../styles/UserListStyle.module.css";
import styles_profile from "../styles/UserProfileStyle.module.css";
import "../pages/index.css";
import { SocketContent, SocketContext } from "@/context/socket";
// import { SocketContext, SocketContent } from "@/pages/App";

function UserList({ setIsOpenModal }: { setIsOpenModal: any }) {
  const [showModals, setShowModals] = useState<boolean[]>([]);
  const [showprofileOption, setShowprofileOption] = useState(true);
  const [showProfile, setShowProfile] = useState(true);
  const [showDetailProfile, setDetailShowprofile] = useState(false);
  const [showMatchList, setShowMatchList] = useState<boolean[]>([]);
  const [userNickname, setUserNickname] = useState<string | null>(
    localStorage.getItem("nickname")
  );
  const [userId, setUserID] = useState<string | null>(
    localStorage.getItem("id")
  );
  const [userData, setData] = useState<userDataInterface[]>([]);
  const [friendList, setFriendList] = useState<string[]>([]);

  const socket = useContext<SocketContent>(SocketContext).chatSocket;
  const gameSocket = useContext<SocketContent>(SocketContext).gameSocket;

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
    isGaming: number;
    isBlocked: number;
    matchhistory: userMatchHistory[];
  }

  const closeModal = () => {
    setIsOpenModal(false);
  };
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 이벤트 핸들러 함수
    const handler = () => {
      console.log("in userlist handler");
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

  function checkIsInclude(id: string[], userid: string) {
    if (id.includes(userid.toString())) {
      return 1;
    } else {
      return 0;
    }
  }

  const reloadData = async () => {
    setData([]);
    setShowModals([]);
    setShowProfile(true);
    setDetailShowprofile(false);

    let conList:string[] = [];
    let gameList:string[] = [];
    let blockList:string[] = [];

    function getListBySocket(data:any){
      conList = [];
      gameList = [];
      blockList= [];
      for(let i = 0; i < data.length ; i++){
        console.log("data:", data[i]);
        if (data[i].isConnected === true){
          conList.push((data[i].id).toString());
        }
        if (data[i].isGaming === true){
          gameList.push((data[i].id).toString());
        }
        if (data[i].isBlocked === true){
          blockList.push((data[i].id).toString());
        }
      }
      console.log("socket response connection: ", conList);
      console.log("socket response gaming: ", gameList);
      console.log("socket response block: ", blockList);
    }

    if (socket){
      socket.emit("requestAllMembers");
      socket.once("responseAllMembers", async (data:any) => getListBySocket(data));
    }

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
    console.log("friend response: ", idList);
    const responseUserData = await axiosApi.get("http://localhost/api/user");
    const response = responseUserData.data;
    const useridx = response.length;

    const newDataList: userDataInterface[] = [];
    const newModalList: boolean[] = [];
    const newMatchList: boolean[] = [];
    for (let i = 0; i < useridx; i++) {
      if(response[i].id != 0){
        const responseDetail = await axiosApi.get(
          "http://localhost/api/user/" + response[i].id
        );
        const detailResponse = responseDetail.data;
        const responseMatch = await axiosApi.get(
          "http://localhost/api/user/" + response[i].id + "/matchhistory"
        );
        const matchResponse = responseMatch.data;
        const matchCount = matchResponse.length;
        const newData: userDataInterface = {
          id: detailResponse.id,
          nickname: detailResponse.nickname,
          userProfileURL: `/api/user/${response[i].id}/photo?timestamp=${Date.now()}`,
          win: detailResponse._count.asWinner,
          lose: detailResponse._count.asLoser,
          score:
            parseInt(detailResponse._count.asWinner) * 10 -
            parseInt(detailResponse._count.asLoser) * 10,
          lastLogin: detailResponse.lastLogin,
          isFriend: checkIsInclude(idList, detailResponse.id),
          isLogin: checkIsInclude(conList, detailResponse.id),
          isGaming: checkIsInclude(gameList, detailResponse.id),
          isBlocked: checkIsInclude(blockList, detailResponse.id),
          matchhistory: [],
        };
        for (let j = 0; j < matchCount; j++) {
          const newMatchData: userMatchHistory = {
            winner: matchResponse[j].winner.nickname,
            winnerAvatar: `/api/photo/${matchResponse[j].winner.avatar}`,
            loser: matchResponse[j].loser.nickname,
            loserAvatar: `/api/photo/${matchResponse[j].loser.avatar}`,
            time: matchResponse[j].createdTime,
          };
          newMatchData.time = newMatchData.time.slice(0, 19);
          newMatchData.time = newMatchData.time.replace("T", " ");
          newData.matchhistory.push(newMatchData);
        }
        newDataList.push(newData);
        newModalList.push(false);
        newMatchList.push(false);
      }
    }
    setData(newDataList);
    setShowModals(newModalList);
    setShowMatchList(newMatchList);
  };

  function profilePopup(index: number) {
    let copiedData = [...showModals];
    copiedData[index] = true;
    setShowModals(copiedData);
    setDetailShowprofile(true);
    setShowProfile(false);
  }

  function profilePopdown(index: number) {
    let copiedData = [...showModals];
    copiedData[index] = false;
    setShowModals(copiedData);
    setDetailShowprofile(false);
    setShowProfile(true);
  }

  function openMatchList(index: number) {
    //매치신청 보내기
    let newMatchList = [...showMatchList];
    newMatchList[index] = !(newMatchList[index]);
    setShowMatchList(newMatchList);
  }

  function sendMatch(index:number, level: string){
    setUserNickname(localStorage.getItem("nickname"));
    console.log("sendMatch: "+ userNickname + " " + userData[index].nickname + " " + level);
    gameSocket.emit("oneOnOneApply", {
      from: userNickname,
      to: userData[index].nickname,
      mode: level,
    });
    alert(userData[index].nickname + "님에게 게임 신청이 전송되었습니다");
  }

  function blockUser(index:number){
    let copiedData = [...userData];
    if (userData[index].isBlocked == 0){
      copiedData[index].isBlocked = 1;
      socket.emit("blockUser", {target : userData[index].nickname})
    }
    else if (userData[index].isBlocked == 1){
      copiedData[index].isBlocked = 0;
      socket.emit("unblockUser", {target : userData[index].nickname})
    }
    setData(copiedData);
  }

  async function follow(index: number) {
    const apiUrl = "http://localhost/api/user/" + userId + "/friend";
    const dataToUpdate = {
      id: userId,
      isAdd: true,
      friend: userData[index].id,
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
          console.log(userData.length);
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
      friend: userData[index].id,
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
	setUserID(localStorage.getItem("id"));
    reloadData();
  }, []);

  useEffect(() => {
    async function reloadStatus(userId : number, isConnected : boolean){
      console.log("Status Update! " + userId + isConnected);
      if (isConnected === true){
        let copiedData = [...userData];
        for(let i = 0; i < copiedData.length ; i++)
        {
          if(copiedData[i].id == userId.toString()){
            copiedData[i].isLogin = 1;
            setData(copiedData);
            return ;
          }
        }
        //reloadData();
        /*console.log("신규 유저");
        const responseDetail = await axiosApi.get('http://localhost/api/user/' + userId, );
        const detailResponse = responseDetail.data;
        const responseMatch = await axiosApi.get('http://localhost/api/user/' + userId + '/matchhistory', );
        const matchResponse = responseMatch.data;
        const matchCount = matchResponse.length;
        const copiedModalList = [...showModals];
        const copiedMatchList = [...showMatchList];
        const newData: userDataInterface = {
          id: userId.toString(),
          nickname: detailResponse.nickname,
          userProfileURL: `/api/user/${userId.toString()}/photo?timestamp=${Date.now()}`,
          win: detailResponse._count.asWinner,
          lose: detailResponse._count.asLoser,
          score: (parseInt(detailResponse._count.asWinner) * 10 - parseInt(detailResponse._count.asLoser) * 10),
          lastLogin: detailResponse.lastLogin,
          isFriend: checkIsInclude(friendList, userId.toString()),
          isLogin: 1,
          isGaming: 0,
          isBlocked: 0,
          matchhistory: [],
        };
        console.log("URL: " + newData.userProfileURL);
        for(let j = 0 ; j < matchCount ; j++){
          const newMatchData: userMatchHistory = {
            winner: matchResponse[j].winner.nickname,
            winnerAvatar: `/api/photo/${matchResponse[j].winner.avatar}`,
            loser: matchResponse[j].loser.nickname,
            loserAvatar: `/api/photo/${matchResponse[j].loser.avatar}`,
            time: matchResponse[j].createdTime,
          };
          newMatchData.time = newMatchData.time.slice(0,19);
          newMatchData.time = newMatchData.time.replace('T', ' ');
          newData.matchhistory.push(newMatchData);
        }

        copiedData.push(newData);
        copiedModalList.push(false);
        copiedMatchList.push(false);
        setShowModals(copiedModalList);
        setShowMatchList(copiedMatchList);
        setData(copiedData);*/
      }
      else{
        let copiedData = [...userData];
        for(let i = 0; i < copiedData.length ; i++)
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
      for(let i = 0; i < userData.length ; i++)
      {
        if(userData[i].id == userId.toString()){
          copiedData = [...userData];
          const matchCount = copiedData[i].matchhistory.length;
          for(let j = 0; j < matchCount; j++){
            if (copiedData[i].matchhistory[j].winner == copiedData[i].nickname)
              copiedData[i].matchhistory[j].winner = newNick;
            else if (copiedData[i].matchhistory[j].loser == copiedData[i].nickname)
              copiedData[i].matchhistory[j].loser = newNick;
          }
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
      console.log("길이: "+ userData.length);
      for(let i = 0; i < userData.length ; i++)
      {
        if(copiedData[i].id == userId.toString()){
          copiedData[i].userProfileURL = `/api/user/${userId}/photo?timestamp=${Date.now()}`;
          const matchCount = copiedData[i].matchhistory.length;
          for(let j = 0; j < matchCount; j++){
            if (copiedData[i].matchhistory[j].winner == copiedData[i].nickname)
              copiedData[i].matchhistory[j].winnerAvatar = `/api/user/${userId}/photo?timestamp=${Date.now()}`;
            else if (copiedData[i].matchhistory[j].loser == copiedData[i].nickname)
              copiedData[i].matchhistory[j].loserAvatar = `/api/user/${userId}/photo?timestamp=${Date.now()}`;
          }
          break;
        }
      }
      if (copiedData != null){
        setData(copiedData);
      }
    }
    async function reloadGameStatusIn(userId : number){
      console.log(`${userId} is in game`);
      let copiedData = [...userData];
      for(let i = 0; i < userData.length ; i++)
      {
        if(copiedData[i].id == userId.toString()){
          copiedData[i].isGaming = 1;
          break;
        }
      }
      if (copiedData != null){
        setData(copiedData);
      }
    }
    async function reloadGameStatusOut(userId : number){
      console.log(`${userId} is not in game`);
      let copiedData = [...userData];
      for(let i = 0; i < userData.length ; i++)
      {
        if(copiedData[i].id == userId.toString()){
          copiedData[i].isGaming = 0;
          break;
        }
      }
      if (copiedData != null){
        setData(copiedData);
      }
    }
    if (socket){
      socket.on("updateUserStatus", (userId:number, isConnected:boolean) => reloadStatus(userId, isConnected));
      socket.on("updateUserNick", (userId : number, newNick : string) => reloadNick(userId, newNick));
      socket.on("updateUserAvatar", (userId : number) => reloadAvatar(userId));
      gameSocket.on('inGame', (userId : number) => reloadGameStatusIn(userId));
      gameSocket.on('NotInGame', (userId : number) => reloadGameStatusOut(userId));
    }
    return () => {
      if (socket) {
        socket.off("updateUserStatus", (userId:number, isConnected:boolean) => reloadStatus(userId, isConnected));
        socket.off("updateUserNick", (userId : number, newNick : string) => reloadNick(userId, newNick));
        socket.off("updateUserAvatar", (userId : number) => reloadAvatar(userId));
        gameSocket.off('inGame', (userId : number) => reloadGameStatusIn(userId));
        gameSocket.off('NotInGame', (userId : number) => reloadGameStatusOut(userId));
      }
    };
  }, [socket, userData, showModals]);

  function getDetailProfile(index: number) {
    return (
      <>
        {showModals[index] && (
          <div className={styles_profile.mainBox}>
            <div className={styles_profile.profileInner}>
              <div className={styles_profile.imageBox}>
                <img
                  src={userData[index].userProfileURL}
                  alt="profile img"
                  className={styles_profile.profileImage}
                  />
                  {userData[index].id == userId && (
                    <div className={styles_profile.circleMine}></div>
                  )}
                  {userData[index].id != userId && userData[index].isLogin === 0 && (
                    <div className={styles_profile.circleLogout}></div>
                  )}
                  {userData[index].id != userId && userData[index].isLogin === 1 && (
                    <div className={styles_profile.circleLogin}></div>
                  )}
              </div>
              <div>
                <h2>{userData[index].nickname}의 프로필</h2>
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
                  {userData[index].win} / {userData[index].lose} /{" "}
                  {userData[index].score}
                </h2>
              </div>
              <div className={styles_profile.buttons}>
                {userData[index].id != userId &&
                userData[index].isFriend === 0 && (
                  <button
                    className={styles_profile.followButton}
                    onClick={() => {
                      follow(index);
                    }}
                  >
                    {" "}
                    팔로우{" "}
                  </button>
                )}
                {userData[index].id != userId &&
                userData[index].isFriend === 1 && (
                  <button
                  className={styles_profile.followingButton}
                  onClick={() => {
                    unFollow(index);
                  }}
                  >
                  {" "}
                  언팔로우{" "}
                  </button>
                )}
                {userData[index].id != userId && userData[index].isGaming == 0 && (
                <button className={styles_profile.gameButton}
                onClick={() => {
                openMatchList(index);
                }}>
                    게임 신청
                </button>)}
                {userData[index].id != userId && userData[index].isGaming == 1 && (
                <button className={styles_profile.disabled}
                >
                    게임 중
                </button>)}
                </div>
                <div className={styles_profile.buttons}>
                  {userData[index].id != userId && userData[index].isBlocked == 0 && (
                  <button className={styles_profile.blockButton}
                  onClick={() => {
                    blockUser(index,);
                    }}>
                    차단
                  </button>)}
                  {userData[index].id != userId && userData[index].isBlocked == 1 && (
                  <button className={styles_profile.unblockButton}
                  onClick={() => {
                    blockUser(index,);
                    }}>
                    차단 해제
                  </button>)}
                  {showMatchList[index] && (
                  <div className={styles_profile.gameButtons}>
                    <button onClick={() => {
                sendMatch(index, "easy");
                }}> EASY </button>
                    <button onClick={() => {
                sendMatch(index, "normal");
                }}> NORMAL </button>
                    <button onClick={() => {
                      sendMatch(index, "hard");
                      }}> HARD </button>
                  </div>
                  )}
                </div>
            </div>
            <div className={styles_profile.logInner}>
              <div className={styles_profile.logBanner}>
                <h1>최근 전적</h1>
                {userData[index].matchhistory.slice(0, 10).map((item, idx) => (
                  <div key={idx} className={styles_profile.logBox}>
                    <div className={styles_profile.logTime}>
                      {userData[index].matchhistory[idx].time.slice(0, 10)}
                      <br />
                      {userData[index].matchhistory[idx].time.slice(11, 19)}
                    </div>
                    <div className={styles_profile.logName}>
                      {userData[index].matchhistory[idx].winner}
                    </div>
                    <img
                      src={userData[index].matchhistory[idx].winnerAvatar}
                      alt="profile img"
                      className={styles_profile.logProfileImage}
                    />
                    <div className={styles_profile.resultFont}>승</div>
                    <div className={styles_profile.resultFont}>패</div>
                    <img
                      src={userData[index].matchhistory[idx].loserAvatar}
                      alt="profile img"
                      className={styles_profile.logProfileImage}
                    />
                    <div className={styles_profile.logName}>
                      {userData[index].matchhistory[idx].loser}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

	function getProfile(index: number) {
	if (showprofileOption || userData[index].isFriend) {
		return (
      <div className={styles.profileBox}>
        <div className={styles.profileImageBox}>
          <img
          src={userData[index].userProfileURL}
          alt="profile image"
          className={styles.profileImage}
          />
        </div>
        <div className={styles.profileInfo}>
        <div className={styles.nameBox}>
          <h2>{userData[index].nickname}</h2>
          {userData[index].id == userId && (
            <div className={styles.circleMine}></div>
          )}
          {userData[index].id != userId && userData[index].isLogin === 0 && (
            <div className={styles.circleLogout}></div>
          )}
          {userData[index].id != userId && userData[index].isLogin === 1 && (
            <div className={styles.circleLogin}></div>
          )}
        </div>
        <h3>
          {userData[index].win} / {userData[index].lose} /{" "}
          {userData[index].score}
        </h3>
        <div className={styles.buttons}>
          {userData[index].id == userId && (
            <button
              className={styles.disabled}
            >
              팔로우
            </button>
          )}
          {userData[index].id != userId && userData[index].isFriend === 1 && (
          <button
            className={styles.unfollowIn}
            onClick={() => {
            unFollow(index);
            }}
          >
            언팔로우
          </button>
          )}
          {userData[index].id != userId && userData[index].isFriend === 0 && (
          <button
            className={styles.followIn}
            onClick={() => {
            follow(index);
            }}
          >
            팔로우
          </button>
          )}
          {userData[index].id == userId && userData[index].isGaming == 0 &&(
          <button
            className={styles.disabled}
          >
            게임 신청
          </button>
          )}
          {userData[index].id == userId && userData[index].isGaming == 1 &&(
          <button
            className={styles.disabled}
          >
            게임 중
          </button>
          )}
          {userData[index].id != userId && userData[index].isGaming == 0 &&(
            <button
              className={styles.normalIn}
              onClick={() => {
              openMatchList(index);
              }}
            >
              게임 신청
            </button>
          )}
          {userData[index].id != userId && userData[index].isGaming == 1 &&(
            <button
              className={styles.disabled}
              onClick={() => {
              openMatchList(index);
              }}>
              게임 중
            </button>
          )}
          <button
            className={styles.normalIn}
            onClick={() => {
              profilePopup(index);
            }}
          >
            프로필 보기
          </button>
        </div>
        {showMatchList[index] && (
        <div className={styles.gameButtons}>
            <button onClick={() => {
                sendMatch(index, "easy");
                }}> EASY </button>
            <button onClick={() => {
                sendMatch(index, "normal");
                }}> NORMAL </button>
            <button onClick={() => {
                sendMatch(index, "hard");
                }}> HARD </button>
        </div>
        )}
      </div>
    </div>
      );
    } else {
      return null;
    }
  }

  function getProfileBox() {
    return (
      <>
        {showProfile && (
          <div>
            {showprofileOption === false && (
              <button onClick={() => setShowprofileOption(true)}>
                전체 보기
              </button>
            )}
            {showprofileOption === true && (
              <button onClick={() => setShowprofileOption(false)}>
                친구만 보기
              </button>
            )}
            <button onClick={() => reloadData()}>새로 고침</button>
            <div className={styles.profileMainBox}>
              {userData.map((item, index) => (
                <div key={index} className={styles_profile.fontSet}>
                  {userId && userData[index].id != '0' && getProfile(index)}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  function getDetailProfileBox() {
    return (
      <>
        {showDetailProfile && (
          <div>
            {userData.map((item, index) => (
              <div key={index} className={styles_profile.fontSet}>
                {userId && userData[index].id != '0' &&
                  getDetailProfile(index)}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <div ref={modalRef} className="modal modal-userlist">
      {getProfileBox()}
      {getDetailProfileBox()}
    </div>
  );
}

export default UserList;