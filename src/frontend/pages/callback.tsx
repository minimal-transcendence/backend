import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import jwt_decode from "jwt-decode";

type JwtPayload = {
    id: number;
    email: string;
    iat: number;
    exp: number;
}

function Callback() {
    const router = useRouter();
    const [login, setLogin] = useState<string>();
    const [showCodeInput, setShowCodeInput] = useState<boolean>(false);
    const [verCode, setVerCode] = useState('');

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

        if (response.status === 500) {
            alert("500 Internal Server Error");
            router.push('/');
        }

        const data = await response.json();

        setLogin(data.message);
        localStorage.setItem("nickname", data.nickname);
        localStorage.setItem("id", data.id);
        localStorage.setItem("access_token", data.access_token);
        const jwtDecode = jwt_decode<JwtPayload>(data.access_token);
        localStorage.setItem("access_token_exp", jwtDecode.exp.toString());
        // localStorage.setItem("access_token_exp", data.access_token_exp);
        if (data.is2faEnabled === false) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('is2fa', 'false');
            router.push('Home');
        } else {
            localStorage.setItem('is2fa', 'true');
            setShowCodeInput(true);
        }
    }

    useEffect(() => {
        if(!router.isReady) return;
        // getCode();
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
        const apiUrl = 'http://localhost/api/2fa/authenticate/' + localStorage.getItem("id");
        const dataToUpdate = {
			// 업데이트하고자 하는 데이터 객체
            twoFactorAuthCode: authcode,
            id: localStorage.getItem("id"),
		};
        const response = await fetch(apiUrl, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(dataToUpdate),
			});
    };

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
        <>
            <div>
                Login = {login}
            </div>
            <div>
                {showCodeInput && (
                    <>
                        <input placeholder="띄워쓰기 제외한 6자리" type="text" value={verCode} onChange={(e) => setVerCode(e.target.value)} />
                        <button onClick={() => sendAuthCode(verCode)}>인증</button>
                    </>
                )}
            </div>
        </>
    );
}

export default Callback;
