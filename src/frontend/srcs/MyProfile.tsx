import React, { useState } from 'react';

function MyProfile() {
	const [newNickname, setNewNickname] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [userNickname, setUserNickname] = useState<string | null>(localStorage.getItem("nickname"));
	const [userId, setUserID] = useState<string | null>(localStorage.getItem("id"));
	const [avatarURL, setAvatarURL] = useState<string | null>(localStorage.getItem('avatar'));
	const [is2Fa, setIs2Fa] = useState<string | null>(localStorage.getItem("is2fa"));
	const [checkIs2Fa, setCheckIs2Fa] = useState<boolean>(is2Fa === 'true');
	const [verCode, setVerCode] = useState('');

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			setSelectedFile(file);
			setImageUrl(URL.createObjectURL(file));
		  }
	  };

	async function fixProfile(){
		//여기서 refresh 하면될듯
		const apiUrl = 'http://localhost/api/user/' + userId;

		if (newNickname !== '' && newNickname !== userNickname){
			if(newNickname.length >= 13){
				alert("닉네임의 길이는 최대 12자 입니다");
				setNewNickname('');
				return ;
			}
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
				console.log('naickname 변경 응답 데이터:', responseData);
				alert("닉네임이 변경되었습니다");
			} catch (error) {
				alert("닉네임 변경에 실패했습니다");
				console.error('에러 발생:', error);
				setNewNickname('');
			}
		}
		if (selectedFile) {
			const formData = new FormData();
			formData.append('avatar', selectedFile);
			console.log(formData);
			try {
				const response = await fetch(apiUrl, {
					method: 'POST',
					body: formData,
				});
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}

				const responseData = await response.json();
				if (responseData.error){
					throw new Error(responseData.error);
				}
				console.log('profile 변경 응답 데이터:', responseData);
				localStorage.setItem('avatar', "/api/" + responseData.avatar);
				setAvatarURL("/api/" + responseData.avatar);
				setImageUrl(null);
				setSelectedFile(null);
				alert("프로필 사진이 변경되었습니다");
				} catch (error) {
				console.error('Error uploading image:', error);
				alert("에러 발생 :" + error);
			}
		}

		if (is2Fa === 'false' && checkIs2Fa === true){
			try{
				if (verCode == '' || verCode.length !== 6){
					throw("인증코드를 확인해주세요");
				}
				const faChangeApiUrl = 'http://localhost/api/2fa/turn-on';
				const dataToUpdate = {
					id: userId,
					twoFactorAuthCode: verCode
				};
				const response = await fetch(faChangeApiUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(dataToUpdate),
				});

				if (!response.ok) {
					throw new Error('API 요청이 실패하였습니다.(change 2faData');
				}

				const responseData = await response.json();
				if (responseData.error){
					throw new Error(responseData.error);
				}
				localStorage.setItem("is2fa", 'true');
				setIs2Fa('true');
				alert("2차인증이 설정되었습니다");
				console.log('is2fa 변경 응답 데이터:', responseData);
			}
			catch(error){
				alert("qr인증에 실패했습니다, 코드 또는 OTP인증을 확인해주세요");
				console.error('에러 발생:', error);
			}
		} else if (is2Fa === 'true' && checkIs2Fa === false){
			try{
				if (verCode == '' || verCode.length !== 6){
					throw("인증코드를 확인해주세요");
				}
				const faChangeApiUrl = 'http://localhost/api/2fa/turn-off';
				const dataToUpdate = {
					id: userId,
					twoFactorAuthCode: verCode
				};
				const response = await fetch(faChangeApiUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(dataToUpdate),
				});

				if (!response.ok) {
					throw new Error('API 요청이 실패하였습니다.(change 2faData');
				}

				const responseData = await response.json();
				if (responseData.error){
					throw new Error(responseData.error);
				}
				localStorage.setItem("is2fa", 'false');
				setIs2Fa('false');
				alert("2차인증이 해제되었습니다");
				console.log('is2fa 변경 응답 데이터:', responseData);
			}
			catch(error){
				alert("qr인증에 실패했습니다, 코드 또는 OTP인증을 확인해주세요");
				console.error('에러 발생:', error);
			}
		}
	}

	return (
			<div>
				<>
					<div>
						<h2>내 프로필</h2>
						{avatarURL && (
							<img src={avatarURL} width="100" height = "100" ></img>
						)}
						<div>
							<div>
								<div>
								닉네임
								<br/>
								{userNickname !== null ?
								(<input placeholder={userNickname} type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} />)
								:
								(<input type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} />)}
								</div>
								<div>
									프로필 사진
									<br/>
									<input type="file" accept='image/*' onChange={handleFileChange}></input>
									<br/>
									{imageUrl && <img src={imageUrl} alt="profile image" width="100" height = "100" />}
								</div>
								<div>
									2차인증 여부
									<br/>
										<input
										type="checkbox"
										checked={checkIs2Fa}
										onChange={() => setCheckIs2Fa(!checkIs2Fa)}
										/>
										<span className="slider"></span>
									<div>
										<img
										src='http://localhost/api/2fa/qrcode'
										alt="qr image"
										width="100"
										height="100"
										onError={(e: React.SyntheticEvent<HTMLImageElement>) => e.currentTarget.style.display = 'none'}
										/>
									</div>
									<div>
										{(is2Fa === 'true' && checkIs2Fa === false || is2Fa === 'false' && checkIs2Fa === true) && (
											<span>변경사항 적용을 위해 OTP코드를 입력하세요</span>
										)}
									</div>
									<div>
										<input placeholder="띄워쓰기 제외한 6자리" type="text" value={verCode} onChange={(e) => setVerCode(e.target.value)} />
									</div>
								</div>
								<button onClick={fixProfile}>저장</button>
							</div>
						</div>
					</div>
				</>
			</div>
	)}

export default MyProfile;
