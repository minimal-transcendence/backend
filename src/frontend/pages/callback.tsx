import { useEffect, useState } from "react";
import { useRouter } from "next/router";

function Callback() {
    const router = useRouter();
    const [showCodeInput, setShowCodeInput] = useState<boolean>(false);
    const [verCode, setVerCode] = useState('');
    const [userId, setUserId] = useState<number | null>(null);

    // const [code, setCode] = useState('');
    // const getCode = async () => {
    //     const queryCode = await router.query.code as string;
    //     setCode(queryCode);
    // }

    const code = router.query.code as string;

    const authLogin = async () => {
        //이미 로그인 된 상태라면
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
        if (storedIsLoggedIn === 'true') {
            router.push('Home');
        }

        const response = await fetch('http://localhost/api/auth/login?code=' + code)
        // const response = await(await fetch('http://localhost/api/auth/login?code=' + code)).json();

        if (!response.ok){
            alert("response not OK");
            router.push('/');
        }
        else if (response.status === 500) {
            alert("500 Internal Server Error");
            router.push('/');
        }

        const data = await response.json();

        console.log(data);
        localStorage.setItem("nickname", data.nickname);
        localStorage.setItem("id", data.id);
        setUserId(data.id);
        if (data.is2faEnabled === false) {
            const detailResponse = await(await fetch('http://localhost/api/user/' + data.id)).json();
            localStorage.setItem("access_token", detailResponse.access_token);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('is2fa', 'false');
            localStorage.setItem('avatar', "/api/" + detailResponse.avatar);
            router.push('Home');
        } else if(data.is2faEnabled  === true) {
            setShowCodeInput(true);
            localStorage.setItem('is2fa', 'true');
            console.log(showCodeInput);
        }
    }

    useEffect(() => {
        if(!router.isReady) return;
        authLogin();
        console.log("Callback Page");
    }, [router.isReady]);

    async function sendAuthCode(code: string) {
        const authcode = code;
        setVerCode('');
        if (authcode.length !== 6) { // 코드 길이 확인
            alert("Error: Code length error");
            return;
        }
        const apiUrl = 'http://localhost/api/2fa/authenticate';
        const dataToUpdate = {
			// 업데이트하고자 하는 데이터 객체
            id: userId,
            twoFactorAuthCode: authcode,
		};
        console.log(dataToUpdate);
        try{
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToUpdate),
                });
            if (!response.ok){
                throw("API error");
            }
            const responseData = await response.json();
            if (responseData.status == 401){
                throw("인증 실패");
            }
            console.log("인증 결과:", responseData);
            const detailResponse = await(await fetch('http://localhost/api/user/' + responseData.id)).json();
            localStorage.setItem("access_token", responseData.access_token);
            localStorage.setItem('avatar', "/api/" + detailResponse.avatar);
            localStorage.setItem('isLoggedIn', 'true');
            router.push('Home');
        }catch(error){
            console.error("인증 오류:", error);
            alert("인증오류" + error);
        }
    }
    // redirect
    // if (code) {
    //     return (
    //         <>
    //             <div>
    //                 Login = {login}
    //             </div>
    //             <div>
    //                 {showCodeInput && (
    //                     <>
    //                         <input placeholder="띄워쓰기 제외한 6자리" type="text" value={verCode} onChange={(e) => setVerCode(e.target.value)} />
    //                         <button onClick={() => sendAuthCode(verCode)}>인증</button>
    //                     </>
    //                 )}
    //             </div>
    //         </>
    //     );
    // }
    // return (
    //     <div>
    //         <h1>No code</h1>
    //     </div>
    // );
    return (
        <div>
        {showCodeInput === false && (
            <p>
                        로딩중...
            </p>
        )}
            <p>
                {showCodeInput === true && (
                    <p>
                        <input placeholder="띄워쓰기 제외한 6자리" type="text" value={verCode} onChange={(e) => setVerCode(e.target.value)} />
                        <button onClick={() => sendAuthCode(verCode)}>인증</button>
                    </p>
                )}
            </p>
        </div>
    );
}

export default Callback;
