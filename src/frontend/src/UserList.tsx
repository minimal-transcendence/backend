import React, { useState, useContext } from 'react';
import AuthContext from './context/AuthContext';

function UserList() {
	const [showModals, setShowModals] = useState([false, false, false]);
	const [showModalMyprofile, setShowModalMyprofile] = useState(false);
	const [showprofileOption, setShowprofileOption] = useState(true);
	const [userCount, setUserCount] = useState(6);
	const [newNickname, setNickname] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(null);

	const {isLoggedIn, setIsLoggedIn} = useContext(AuthContext);
	const {userNickname, setUserNickname} = useContext(AuthContext);
	const {profileURL, setProfileURL} = useContext(AuthContext);

	// id번호 수정해야함
	const [userData, setData] = useState([
	{ id: 0, nickname: 'JAEEE', userProfileURL:'', win: 49, lose: 25, isFriend: 1},
	{ id: 1, nickname: 'JAEEE2', userProfileURL:'', win: 19, lose: 5, isFriend: 1},
	{ id: 2, nickname: 'JAEEE3', userProfileURL:'', win: 429, lose: 23, isFriend: 0},
	{ id: 3, nickname: 'JAEEE4', userProfileURL:'', win: 429, lose: 23, isFriend: 0},
	{ id: 4, nickname: 'JAEEE5', userProfileURL:'', win: 49, lose: 23, isFriend: 0},
	{ id: 5, nickname: 'JAEEE6', userProfileURL:'', win: 29, lose: 23, isFriend: 0},
	]);

	// "닉네임 프로필주소 승 패 친구여부|닉네임 프로필주소 승 패 친구여부|닉네임 프로필주소 승 패 친구여부" 형태로 받아오기
	// API에서 문자열 하나로 쭉 받아와서 반복문 돌리기

	const reloadData = async() => {
		setData([]);
		setUserCount(0);
		const response = await(await fetch('http://localhost/api/user')).json();
		console.log(response);
	}

	const AddData = (dataString:string) => {
		const [nickname, userProfileURL, win, lose, isFriend] = dataString.split(' ');

		const newData = {
			id: userCount,
			nickname: nickname,
			userProfileURL: userProfileURL,
			win: parseInt(win),
			lose: parseInt(lose),
			isFriend: parseInt(isFriend),
		};
		setShowModals([...showModals, false]);
		const updatedData = [...userData, newData];
		setUserCount(userCount + 1);
		setData(updatedData);
	};

	// 임시로 사용
	function clickAdd(){
		const str = "JAE" + userCount + " 2 22 25 0";
		AddData(str);
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
		//중복된 닉네임이 없는지 검사, 중복이 있으면 팝업띄우기
		//중복된 닉네임이 없다면 이미지 업로드
		if (selectedFile) {
			const formData = new FormData();
			formData.append('file', selectedFile);
			//fetch -> formData를 body로 POST
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

	function getProfile(index:number){
		if (showprofileOption || userData[index].isFriend){
			return(
			<>
			<p className='profile-left'>
			{userData[index].userProfileURL !== '' ? (
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
					{userData[index].userProfileURL != '' ? (
					<img src={userData[index].userProfileURL} alt="profile image" width="100" height = "100" />) :
					(<img src="img/img1.png" alt="profile image" width="100" height = "100" />)}
				</p>
				<h2>
					{userData[index].nickname} 의 프로필
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
							닉네임 <input className='account' placeholder={userNickname} type="text" value={newNickname} onChange={(e) => setNickname(e.target.value)} />
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
