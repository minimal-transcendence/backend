import React, { useState, useEffect } from 'react';
import styles from "./UserListStyle.module.css";
import styles_profile from "./UserProfileStyle.module.css";

function UserList() {
	const [showModals, setShowModals] = useState<boolean[]>([]);
	const [showprofileOption, setShowprofileOption] = useState(true);
	const [showProfile, setShowProfile] = useState(true);
	const [showDetailProfile, setDetailShowprofile] = useState(false);
	const [userNickname, setUserNickname] = useState<string | null>(localStorage.getItem("nickname"));
	const [userId, setUserID] = useState<string | null>(localStorage.getItem("id"));
	const [userData, setData] = useState<userDataInterface[]>([]);

	interface userMatchHistory{
		winner: string,
		loser: string,
		time: string,
	}

	interface userDataInterface{
		id: string,
		nickname: string,
		userProfileURL: string,
		win: number,
		lose: number,
		score: number,
		lastLogin: string,
		isFriend: number,
		matchhistory: userMatchHistory[],
	}

	function checkIsFriend(id:string[], userid:string){
		if (id.includes(userid)){
			return 1;
		}else{
			return 0;
		}
	}

	const reloadData = async() => {
		setData([]);
		setShowModals([]);
		setShowProfile(true);
		setDetailShowprofile(false);

		const idList:string[] = [];
		const responseFriend = await (await fetch ('http://localhost/api/user/' + userId + '/friend')).json();
		const friendCount = responseFriend.friendList.length;
		for(let i = 0; i < friendCount ; i++){
			idList.push(responseFriend.friendList[i].id);
		}

		const response = await(await fetch('http://localhost/api/user')).json();
		const useridx = response.length;

		const newDataList: userDataInterface[] = [];
		const newModalList: boolean[] = [];
		for(let i = 0 ; i < useridx ; i++){
			const detailResponse = await(await fetch('http://localhost/api/user/' + response[i].id)).json();
			const matchResponse = await(await fetch('http://localhost/api/user/' + response[i].id + '/matchhistory')).json();
			const matchCount = matchResponse.length;
			const newData: userDataInterface = {
				id: detailResponse.id,
				nickname: detailResponse.nickname,
				userProfileURL: "/api/" + detailResponse.avatar,
				score: parseInt(detailResponse.score),
				win: detailResponse._count.asWinner,
				lose: detailResponse._count.asLoser,
				lastLogin: detailResponse.lastLogin,
				isFriend: checkIsFriend(idList, detailResponse.id),
				matchhistory: [],
			};
			for(let i = 0 ; i < matchCount ; i++){
				const newMatchData: userMatchHistory = {
					winner: matchResponse[i].winner.nickname,
					loser: matchResponse[i].loser.nickname,
					time: matchResponse[i].createdTime,
				};
				newMatchData.time = newMatchData.time.slice(0,10);
				newData.matchhistory.push(newMatchData);
			}
			newDataList.push(newData);
			newModalList.push(false);
		}
		setData(newDataList);
		setShowModals(newModalList);
	}

	function profilePopup(index:number){
		let copiedData = [...showModals];
		copiedData[index] = true;
		setShowModals(copiedData);
		setDetailShowprofile(true);
		setShowProfile(false);
	}

	function profilePopdown(index:number){
		let copiedData = [...showModals];
		copiedData[index] = false;
		setShowModals(copiedData);
		setDetailShowprofile(false);
		setShowProfile(true);
	}

	function sendGameMatch(index:number){
		//매치신청 보내기
	}

	async function follow(index:number){
		const apiUrl = 'http://localhost/api/user/' + userId + '/friend';
		const dataToUpdate = {
			// 업데이트하고자 하는 데이터 객체
			id: userId,
			isAdd: true,
			friend: userData[index].id,
		};

		try {
			const response = await fetch(apiUrl, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(dataToUpdate),
			});

			if (!response.ok) {
			throw new Error('API 요청이 실패하였습니다.');
			}

			const responseData = await response.json();

			console.log('Follow 응답 데이터:', responseData);
			let copiedData = [...userData];
			copiedData[index].isFriend = 1;
			setData(copiedData);
			reloadData();
		} catch (error) {
			alert("Follow에 실패했습니다");
			console.error('에러 발생:', error);
		}
	}

	async function unFollow(index:number){
		const apiUrl = 'http://localhost/api/user/' + userId + '/friend';
		const dataToUpdate = {
			// 업데이트하고자 하는 데이터 객체
			id: userId,
			isAdd: false,
			friend: userData[index].id,
		};

		try {
			const response = await fetch(apiUrl, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(dataToUpdate),
			});

			if (!response.ok) {
			throw new Error('API 요청이 실패하였습니다.');
			}

			const responseData = await response.json();

			console.log('unFollow 응답 데이터:', responseData);
			let copiedData = [...userData];
			copiedData[index].isFriend = 1;
			setData(copiedData);
			reloadData();
		} catch (error) {
			alert("Follow에 실패했습니다");
			console.error('에러 발생:', error);
		}
	}

	useEffect (() => {
		reloadData();
		}, []);

	function getDetailProfile(index:number){
		return(
			<>
			{showModals[index] && (
			<div className={styles_profile.mainBox}>
			<div className={styles_profile.profileInner}>
				<div>
					<img
					src={userData[index].userProfileURL}
					alt="profile img"
					className={styles_profile.profileImage}/>
				</div>
				<div>
					<h2>{userData[index].nickname}의 프로필</h2>
				</div>
				<br/><br/><br/><br/><br/>
				<div className={styles_profile.wlsBanner}>
					Win / Lose / Total Score
				</div>
				<div>
					<h2>
					{userData[index].win} / {userData[index].lose} / {userData[index].score}
					</h2>
				</div>
				<div className={styles_profile.buttons}>
					{userData[index].nickname !== userNickname && userData[index].isFriend === 0 && (
					<button className={styles_profile.followButton} onClick={() => {follow(index)}}> 팔로우 </button>)}
					{userData[index].nickname !== userNickname && userData[index].isFriend === 1 && (
					<button className={styles_profile.followingButton} onClick={() => {unFollow(index)}}> 언팔로우 </button>)}
					<button className={styles_profile.gameButton}> 게임 신청 </button>
				</div>
			</div>
			<div className={styles_profile.logInner}>
				<div className={styles_profile.logBanner}>
					<h1>최근 전적</h1>
					{userData[index].matchhistory.map((item, idx) => (
					<div key={idx} className={styles_profile.logBox}>
						<div className={styles_profile.logTime}>
							{userData[index].matchhistory[idx].time}
						</div>
						<div className={styles_profile.logName}>
						{userData[index].matchhistory[idx].winner}
						</div>
						<img
						src="url"
						alt="profile img"
						className={styles_profile.logProfileImage}/>
						<div className={styles_profile.resultFont}>
							승
						</div>
						<div className={styles_profile.resultFont}>
							패
						</div>
						<img
						src="url"
						alt="profile img"
						className={styles_profile.logProfileImage}/>
						<div className={styles_profile.logName}>
						{userData[index].matchhistory[idx].loser}
						</div>
					</div>))}
				</div>
			</div>
		</div>
			)}
		</>
		)
	}

	function getProfile(index:number){
		if (showprofileOption || userData[index].isFriend){
			return(
				<div className={styles.profileBox}>
						<div className={styles.profileImage}>
							{userData[index].userProfileURL !== '/api/path' ? (
							<img src={userData[index].userProfileURL} alt="profile image" className={styles.profileImage} />
							) : (
							<img src="img/img1.png" alt="profile image" className={styles.profilePicture} />
							)}
						</div>
						<div className={styles.profileInfo}>
							<h2>{userData[index].nickname}</h2>
							<h3>{userData[index].win} / {userData[index].lose} / {userData[index].score}</h3>
							<div className={styles.buttons}>
								{userData[index].isFriend === 1 && (
									<button className={styles.unfollowIn} onClick={() => {unFollow(index)}} >
										언팔로우
									</button>
									)}
								{userData[index].isFriend === 0 && (
									<button className={styles.followIn} onClick={() => {follow(index)}}>
										팔로우
									</button>)}
								<button className={styles.normalIn} onClick={() => {sendGameMatch(index)}}>
										게임 신청
								</button>
								<button className={styles.normalIn} onClick={() => {profilePopup(index)}}>
										프로필 보기
								</button>
							</div>
						</div>
			</div>
		);
		}
		else {
			return null;
		}
	}

	function getProfileBox(){
		return(
			<>
			{showProfile && (
			<div>
				{showprofileOption === false && (
					<button onClick={() => setShowprofileOption(true)}>전체 보기</button>
				)}
				{showprofileOption === true && (
					<button onClick={() => setShowprofileOption(false)}>친구만 보기</button>
				)}
				<button onClick={() => reloadData()}>새로 고침</button>
				<div className={styles.profileMainBox}>
					{userData.map((item, index) => (
						<div key={index} className={styles_profile.fontSet}>
							{userId && userData[index].id != userId && (
							getProfile(index)
							)}
						</div>
					))}
				</div>
			</div>
			)}
			</>
		)
	}

	function getDetailProfileBox()
	{
		return(
			<>
			{showDetailProfile && (
			<div>
				{userData.map((item, index) => (
					<div key={index} className={styles_profile.fontSet}>
						{userId && userData[index].id != userId && (
						getDetailProfile(index)
						)}
					</div>
				))}
			</div>
			)}
			</>
		)
	}

		return (
			<div>
				{getProfileBox()}
				{getDetailProfileBox()}
			</div>
			);
		}

export default UserList;
