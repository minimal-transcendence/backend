import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function Log() {
  const router = useRouter();
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  const [ startLogin, setStartLogin ] = useState(false);

  // 이미 로그인되었는지 확인
  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    if (storedIsLoggedIn === 'true') {
      setIsLoggedIn(true);
    }
    console.log("Login Page");
  }, );

  useEffect(() =>{
    if (startLogin === true){
      routeLogin();
    }
  }, [startLogin])

  function Login() {
    setStartLogin(true);
  }

  function routeLogin() {
    window.location.href =
    'https://api.intra.42.fr/oauth/authorize/?response_type=code&client_id=u-s4t2ud-7a4d91eaac011bcb231f6a2c475ff7b48445dde9311610e0db488b0f8add6fc3&redirect_uri=http://localhost/callback';
}

  return (
    <div className='wrapper'>
      {isLoggedIn ? (
        <div>
          <p>이미 로그인되었습니다. /Home 페이지로 이동합니다.</p>
          <button onClick={() => router.push('/Home')}>Go to Home</button>
        </div>
      ) : (
        <div className='main'>
          <h1 className='logo'>로그인</h1>
          <button className='my_btn' onClick={Login}>
            Intra login
          </button>
        </div>
      )}
    </div>
  );
}

export default Log;
