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
	const {userNickname, setUserNickname} = useContext(AuthContext);
	const {profileURL, setProfileURL} = useContext(AuthContext);

  // 이미 로그인되었는지 확인
	useEffect(() => {
		const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
		if (storedIsLoggedIn === 'true') {
			setIsLoggedIn(true);
		}
	}, );

	function routeLogin(){
		window.location.href = 'https://api.intra.42.fr/oauth/authorize/?response_type=code&client_id=u-s4t2ud-7a4d91eaac011bcb231f6a2c475ff7b48445dde9311610e0db488b0f8add6fc3&redirect_uri=http://localhost/callback';
	}

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
