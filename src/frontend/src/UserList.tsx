import React, { useState, useContext, useEffect } from 'react';
import AuthContext from './context/AuthContext';

function UserList() {
	const [showModals, setShowModals] = useState<boolean[]>([]);
	const [showModalMyprofile, setShowModalMyprofile] = useState<boolean>(false);
	const [showprofileOption, setShowprofileOption] = useState<boolean>(true);
	const [newNickname, setNickname] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [userNickname, setUserNickname] = useState<string | null>(localStorage.getItem("nickname"));
	const [userId, setUserID] = useState<string | null>(localStorage.getItem("id"));

	const {isLoggedIn, setIsLoggedIn} = useContext(AuthContext);
	const {profileURL, setProfileURL} = useContext(AuthContext);

	interface userDataInterface{
		id: number,
		nickname: string,
		userProfileURL: string,
		win: number,
		lose: number,
		score: number,
		lastLogin: string,
		isFriend: number,
	}

	const [userData, setData] = useState<userDataInterface[]>([]);

	const reloadData = async() => {
		setData([]);
		setShowModals([]);
		const response = await(await fetch('http://localhost/api/user')).json();
		const useridx = response.length;
		console.log(response);
		console.log(useridx);
		const newDataList: userDataInterface[] = [];
		const newModalList: boolean[] = [];
		for(let i = 0 ; i < useridx ; i++){
			const newData: userDataInterface = {
				id: response[i].id,
				nickname: response[i].nickname,
				userProfileURL: response[i].avatar,
				score: parseInt(response[i].score),
				win: 0,
				lose: 0,
				lastLogin: response[i].lastLogin,
				isFriend: 0,
			};
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
	}

	function profilePopdown(index:number){
		let copiedData = [...showModals];
		copiedData[index] = false;
		setShowModals(copiedData);
	}

	function sendGameMatch(index:number){
		//매치신청 보내기
	}

	function follow(index:number){
		//DB에 있는 isFriend 1로 바꿔달라고 하기
		let copiedData = [...userData];
		copiedData[index].isFriend = 1;
		setData(copiedData);
	}

	function unFollow(index:number){
		//DB에 있는 isFriend 0으로 바꿔달라고 하기
		let copiedData = [...userData];
		copiedData[index].isFriend = 0;
		setData(copiedData);
	}

	function fixProfile(){
		if (newNickname !== userNickname){
			// 닉네임 변경요청하기
		}
		if (selectedFile) {
			const formData = new FormData();
			formData.append('file', selectedFile);
			//fetch -> formData를 body로 fatch
			//setProfileURL(내 프로필이미지 경로)해주기
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// 파일을 선택했을 때 호출
		if (e.target.files && e.target.files.length > 0){
			const file = e.target.files[0];
			setSelectedFile(file);
			setImageUrl(URL.createObjectURL(file));
		}
	};
	
	useEffect (() => {
		reloadData();
		}, []);

	function getProfile(index:number){
		if (showprofileOption || userData[index].isFriend){
			return(
			<>
			<p className='profile-left'>
			{userData[index].userProfileURL !== 'path' ? (
			<img src={userData[index].userProfileURL} alt="profile image" width="50" height = "50" />) :
			(<img src="img/img1.png" alt="profile image" width="50" height = "50" />)}
			{userData[index].nickname}<br />
			승: {userData[index].win} 패:{userData[index].lose}
		</p>
		<p>
			{userData[index].isFriend === 1 && (
				<button onClick={() => {unFollow(index)}}>언팔로우</button>)}
			{userData[index].isFriend === 0 && (
				<button onClick={() => {follow(index)}}>팔로우</button>)}
			<button onClick={() => {sendGameMatch(index)}}>게임 신청</button>
			<button onClick={() => {profilePopup(index)}}>프로필 보기</button>
		</p>
		{showModals[index] && (
		<div className='modal'>
			<div className='modal-content'>
				<p>
					{userData[index].userProfileURL != 'path' ? (
					<img src={userData[index].userProfileURL} alt="profile image" width="100" height = "100" />) :
					(<img src="img/img1.png" alt="profile image" width="100" height = "100" />)}
				</p>
				<h2>
					{userData[index].nickname} ({userData[index].id}) 의 프로필
				</h2>
				<p>승: {userData[index].win} 패:{userData[index].lose} 점수: {userData[index].win * 10 - userData[index].lose * 10}</p>
				<p>최근 전적</p>
				<p>
					{/* 전적 받아와서 들어갈곳 */}
				</p>
					{userData[index].nickname !== userNickname && userData[index].isFriend === 1 && (
					<button onClick={() => {unFollow(index)}}>언팔로우</button>)}
					{userData[index].nickname !== userNickname && userData[index].isFriend === 0 && (
					<button onClick={() => {follow(index)}}>팔로우</button>)}
					{userData[index].nickname !== userNickname && (
					<button>게임 신청</button>)}
				<p>
				<button onClick={() => profilePopdown(index)}>닫기</button>
				</p>
			</div>
		</div>
		)}
		{showModalMyprofile && (
		<div className='modal'>
			<>
				<div className='modal-content'>
					<div className='close-btn'>
						<button onClick={() => setShowModalMyprofile(false)}>X</button>
					</div>
					<h2>내 프로필</h2>
					<div className='register-inside'>
						<div>
							닉네임
							{userNickname !== null ? 
							(<input className='account' placeholder={userNickname} type="text" value={newNickname} onChange={(e) => setNickname(e.target.value)} />)
							: 
							(<input className='account' type="text" value={newNickname} onChange={(e) => setNickname(e.target.value)} />)}
							<p>
								프로필 사진
								<br />
								<input type="file" accept='image/*' onChange={handleFileChange}></input>
								<br/>
								{imageUrl && <img src={imageUrl} alt="profile image" width="100" height = "100" />}
							</p>
							<button onClick={fixProfile}>저장</button>
						</div>
					</div>
				</div>
			</>
		</div>
		)}
		</>
	);
	}
	else {
		return null;
	}
	}

	return (
	<div className='friend-wrapper-out'>
		<button onClick={() => setShowModalMyprofile(true)}>내 프로필</button>
		{showprofileOption === false && (
			<button onClick={() => setShowprofileOption(true)}>전체 보기</button>
		)}
		{showprofileOption === true && (
			<button onClick={() => setShowprofileOption(false)}>친구만 보기</button>
		)}
		<button onClick={() => reloadData()}>새로 고침</button>
		<div className='friend-wrapper'>
			{userData.map((item, index) => (
			<div key={index}>
				{getProfile(index)}
			</div>
			))}
		</div>
	</div>
	);
}

export default UserList;
