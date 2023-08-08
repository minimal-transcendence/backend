import React, { useState, useEffect } from 'react';

function MyProfile() {

	const [newNickname, setNewNickname] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [userNickname, setUserNickname] = useState<string | null>(localStorage.getItem("nickname"));
	const [userId, setUserID] = useState<string | null>(localStorage.getItem("id"));
	const [is2Fa, setIs2Fa] = useState(localStorage.getItem("is2fa"));
	const [checkIs2Fa, setCheckIs2Fa] = useState(is2Fa==='true');

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// 파일을 선택했을 때 호출
		if (e.target.files && e.target.files.length > 0){
			const file = e.target.files[0];
			setSelectedFile(file);
			setImageUrl(URL.createObjectURL(file));
		}
	};

	async function fixProfile(){
	if (newNickname !== '' && newNickname !== userNickname){
		const apiUrl = 'http://localhost/api/user/' + userId;
		const dataToUpdate = {
			id: userId,
			nickname: newNickname,
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
				throw new Error(responseData.error);
			}
			setUserNickname(newNickname);
			localStorage.setItem("nickname", newNickname);
			alert("변경 완료");
			console.log('naickname 변경 응답 데이터:', responseData);

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
			avatar: selectedFile,
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
				throw new Error(responseData.error);
			}

			alert("변경 완료");
			console.log('profile 변경 응답 데이터:', responseData);

			} catch (error) {
			console.error('Error uploading image:', error);
			alert("에러 발생 :" + error);
			}
		}
		//fetch -> formData를 body로 post하기
		//setProfileURL(내 프로필이미지 경로)해주기
		if ((is2Fa === 'true' && checkIs2Fa === false) || (is2Fa === 'false' && checkIs2Fa === true)){
			const apiUrl = 'http://localhost/api/user/' + userId;
			const dataToUpdate = {
				id: userId,
				is2faEnabled: checkIs2Fa,
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
					throw new Error(responseData.error);
				}
				if (is2Fa == 'true'){
				localStorage.setItem("is2fa", 'false');
				}else {
					localStorage.setItem("is2fa", 'true');
				}
				alert("변경 완료");
				console.log('is2fa 변경 응답 데이터:', responseData);

			} catch (error) {
				alert("닉네임 변경에 실패했습니다");
				console.error('에러 발생:', error);
				setNewNickname('');
			}
		}
	}

	return (
			<div className='modal'>
				<>
					<div className='modal-content'>
						<h2>내 프로필</h2>
						<div className='register-inside'>
							<div>
								<p>
								닉네임
								{userNickname !== null ?
								(<input className='account' placeholder={userNickname} type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} />)
								:
								(<input className='account' type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} />)}
								</p>
								<p>
									프로필 사진
									<br />
									<input type="file" accept='image/*' onChange={handleFileChange}></input>
									<br/>
									{imageUrl && <img src={imageUrl} alt="profile image" width="100" height = "100" />}
								</p>
								<p>
									2차인증 여부
									<label>
										<input
										type="checkbox"
										checked={checkIs2Fa}
										onChange={() => setCheckIs2Fa(!checkIs2Fa)}
										/>
										<span className="slider"></span>
									</label>
								</p>
								<button onClick={fixProfile}>저장</button>
							</div>
						</div>
					</div>
				</>
			</div>
	)
}

export default MyProfile;
