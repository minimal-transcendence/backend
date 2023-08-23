import jwt_decode from "jwt-decode";

type JwtPayload = {
    id: number;
    email: string;
    iat: number;
    exp: number;
}

//export? 다른데서 안 쓰면 지울 것
export async function refreshToken (setJwt: Function, setJwtExp : Function){
	const fetchRes = await fetch('api/auth/refresh')
	.then((res) => {
		return (res.json())
	})
	.then((res) => {
		localStorage.setItem("access_token", res.access_token);
		const jwtDecode = jwt_decode<JwtPayload>(res.access_token);
		localStorage.setItem("access_token_exp", jwtDecode.exp.toString());
		setJwt(localStorage.getItem("access_token"));
		setJwtExp(localStorage.getItem("access_token_exp"));
	})
	.catch((error) => {
		window.location.href = '/';
	})
}

export async function setItems(setJwt : Function, setJwtExp : Function) {
	const jwtExpItem = localStorage.getItem("access_token_exp");
	if (jwtExpItem) {
		const jwtExpInt = parseInt(jwtExpItem);
		if (jwtExpInt * 1000 - Date.now() < 2000){
			await refreshToken(setJwt, setJwtExp);
		}
		else {
			const jwt = localStorage.getItem("access_token");
			setJwt(jwt);
			setJwtExp(jwtExpItem);
		}
	}
	else
		window.location.href = '/';
}
