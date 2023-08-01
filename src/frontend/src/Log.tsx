import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';

function Log() {
	const navigate = useNavigate();

	const [showModal, setShowModal] = useState(false);
	const [data, setData] = useState<string | null> (null);
	const [isImage, setIsImage] = useState<boolean> (false);
	const [showCodeInput, setShowCodeInput] = useState<boolean> (false);
	const [verCode, setVerCode] = useState('');

	const {isLoggedIn, setIsLoggedIn} = useContext(AuthContext);
	const {nickName, setNickName} = useContext(AuthContext);
	const {profileURL, setProfileURL} = useContext(AuthContext);

  // 이미 로그인되었는지 확인
	useEffect(() => {
		const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
		if (storedIsLoggedIn === 'true') {
			setIsLoggedIn(true);
		}
	}, );

	function handleLogin() {
		let isValid = 1;
		if (isValid) {
			// 로그인 성공 시 sessionStorage에 isLoggedIn 상태를 저장
			localStorage.setItem('isLoggedIn', 'true');
			setIsLoggedIn(true);
			navigate('/Home');
		} else {
			// 적합하지 않은 경우 경고 모달 띄우기
			setShowModal(true);
		}
	};

	function routeLogin(){
		window.location.href = 'https://api.intra.42.fr/oauth/authorize/?response_type=code&client_id=u-s4t2ud-7a4d91eaac011bcb231f6a2c475ff7b48445dde9311610e0db488b0f8add6fc3&redirect_uri=http://localhost/callback';
	}

	const authLogin = async () => {
		try {
			const response = await fetch('URL');
			if (!response.ok){
				throw new Error('fetch failed');
			}
			const contentType = response.headers.get('content-type');
			setIsImage(contentType != null && contentType.startsWith('image/'));

			if (contentType && contentType.startsWith('image/')){
				const blobData = await response.blob();
				setData(URL.createObjectURL(blobData));
				setShowCodeInput(true);
			} // 'pass'부분 맞춰서 바꿔주기
			else if (contentType && contentType.startsWith('pass')) { // 이미지가 아니라면 text로 가져와서 저장
				const textData = await response.text();
				setData(textData);
				// 바로 메인 화면으로 넘어갈수있도록 처리
			}
			else{
				const textData = "wrong data";
				setData(textData);
			}
			setShowModal(true);
			setShowCodeInput(true); // 나중에 빼기
		}
		catch(error) {
			const textData = "Error at fetch data";
			setData(textData);
			alert("Error");
			console.error("Error at fetch data:", error);
		}
	};

	function sendAuthCode(code:string) {
		const authcode = code;
		setVerCode('');
		if (authcode.length != 6) { // 코드 길이 확인
			alert("Error: Code length error");
			return ;
		}

		const sendOption: RequestInit = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/text',
			},
			body: authcode,
		  };

		fetch('URL', sendOption)
		.then((response) => {
			if (!response.ok) { // response가 제대로 오지않았을때
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then((responseData) => { // 결과를 받음
			//결과 받아서 nickname, profileURL, isLoggedIn 넣어주기
			console.log('Response from server:', responseData);
		})
		.catch((error) => { // 에러시
			console.error('Error sending data:', error);
			setVerCode('');
			alert(error);
		});
	};

return (
<div className = 'wrapper'>
	{isLoggedIn ? (
	<div>
		<p>이미 로그인되었습니다. /Home 페이지로 이동합니다.</p>
		<button onClick={() => navigate('/Home')}>Go to Home</button>
	</div>
	) : (
	<div className = 'main'>
		<h1 className = 'logo'>로그인</h1>
		<button className='my_btn' onClick={routeLogin}>Intra login</button>
	</div>
	)}
</div>
);
};

export default Log;
