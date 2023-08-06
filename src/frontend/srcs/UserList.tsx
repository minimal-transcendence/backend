import React, { useState, useEffect } from 'react';

function UserList() {
	const [showModals, setShowModals] = useState<boolean[]>([]);
	const [showModalMyprofile, setShowModalMyprofile] = useState(false);
	const [showprofileOption, setShowprofileOption] = useState(true);
	const [newNickname, setNewNickname] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [userNickname, setUserNickname] = useState<string | null>(localStorage.getItem("nickname"));
	const [userId, setUserID] = useState<string | null>(localStorage.getItem("id"));
	const [friendList, setFriendList] = useState<string[] | null>([]);

	interface userDataInterface{
		id: string,
		nickname: string,
		userProfileURL: string,
		win: number,
		lose: number,
		score: number,
		lastLogin: string,
		isFriend: number,
	}

	const [userData, setData] = useState<userDataInterface[]>([]);

	function checkIsFriend(id:string){

	}

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
			const detailResponse = await(await fetch('http://localhost/api/user/' + response[i].id)).json();
			const newData: userDataInterface = { // 확인하고 바꿔주기
				id: detailResponse.id,
				nickname: detailResponse.nickname,
				userProfileURL: detailResponse.avatar,
				score: parseInt(detailResponse.score),
				win: detailResponse._count.asWinner,
				lose: detailResponse._count.asLoser,
				lastLogin: detailResponse.lastLogin,
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

	async function follow(index:number){ // 맞는지 확인 필요
		const apiUrl = 'http://localhost/api/user/' + userId + '/friend';
		const dataToUpdate = {
			// 업데이트하고자 하는 데이터 객체
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
			setUserNickname(newNickname);
			localStorage.setItem("nickname", newNickname);

			console.log('Follow 응답 데이터:', responseData);

			reloadData();

		} catch (error) {
			alert("Follow에 실패했습니다");
			console.error('에러 발생:', error);
		}
	}

	async function unFollow(index:number){ // 맞는지 확인 필요
		const apiUrl = 'http://localhost/api/user/' + userId + '/friend';
		const dataToUpdate = {
			// 업데이트하고자 하는 데이터 객체
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
			setUserNickname(newNickname);
			localStorage.setItem("nickname", newNickname);

			console.log('unFollow 응답 데이터:', responseData);

			reloadData();

		} catch (error) {
			alert("Follow에 실패했습니다");
			console.error('에러 발생:', error);
		}
	}


	async function fixProfile(){
		if (newNickname !== '' && newNickname !== userNickname){
			const apiUrl = 'http://localhost/api/user/' + userId;
			const dataToUpdate = {
				// 업데이트하고자 하는 데이터 객체
				id: userId,
				name: newNickname,
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
				if (responseData.error){
					throw new Error('닉네임 변경 실패');
				}
				setUserNickname(newNickname);
				localStorage.setItem("nickname", newNickname);

				console.log('naickname 변경 응답 데이터:', responseData);

				reloadData();

			} catch (error) {
				alert("닉네임 변경에 실패했습니다");
				console.error('에러 발생:', error);
				setNewNickname('');
			}
		}
		if (selectedFile) {
			const formData = new FormData();
			formData.append('image', selectedFile);
			const dataToUpdate = {
				id: userId,
				avatar: formData,
			};

			const apiUrl = 'http://localhost/api/user/' + userId;
			try {
				const response = await fetch(apiUrl, {
				  method: 'PATCH',
				  headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(dataToUpdate),
				});

				if (!response.ok) {
				  throw new Error('Network response was not ok');
				}

				const responseData = await response.json();
				if (responseData.error){
					throw new Error('프로필사진 변경 실패');
				}
				setUserNickname(newNickname);
				localStorage.setItem("nickname", newNickname);

				console.log('profile 변경 응답 데이터:', responseData);

				reloadData();

			  } catch (error) {
				console.error('Error uploading image:', error);
				alert("에러 발생 :" + error);
			  }
			}
			//fetch -> formData를 body로 post하기
			//setProfileURL(내 프로필이미지 경로)해주기
			reloadData();
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
			console.log(userData[index].id, userId);
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
						{userId && userData[index].id != userId && (
						getProfile(index)
						)}
					</div>
					))}
				</div>
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
									(<input className='account' placeholder={userNickname} type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} />)
									:
									(<input className='account' type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} />)}
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
			</div>
			);
		}

export default UserList;
