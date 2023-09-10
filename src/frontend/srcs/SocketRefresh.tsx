import jwt_decode from "jwt-decode";

export type JwtPayload = {
    id: number;
    email: string;
    iat: number;
    exp: number;
}

//export? 다른데서 안 쓰면 지울 것
// export async function refreshToken (setJwt: Function, setJwtExp : Function){
// 	const fetchRes = await fetch('api/auth/refresh')
// 	.then((res) => {
// 		return (res.json())
// 	})
// 	.then((res) => {
// 		localStorage.setItem("access_token", res.access_token);
// 		const jwtDecode = jwt_decode<JwtPayload>(res.access_token);
// 		localStorage.setItem("access_token_exp", jwtDecode.exp.toString());
// 		setJwt(localStorage.getItem("access_token"));
// 		setJwtExp(localStorage.getItem("access_token_exp"));
// 	})
// 	.catch((error) => {
// 		window.location.href = '/';
// 	})
// }

// export async function setItems(setJwt : Function, setJwtExp : Function) {
// 	console.log("IN SET ITEMS");
// 	const jwtExpItem = localStorage.getItem("access_token_exp");
// 	if (jwtExpItem) {
// 		const jwtExpInt = parseInt(jwtExpItem);
// 		if (jwtExpInt * 1000 - Date.now() < 2000){
// 			await refreshToken(setJwt, setJwtExp);
// 		}
// 		else {
// 			const jwt = localStorage.getItem("access_token");
// 			setJwt(jwt);
// 			setJwtExp(jwtExpItem);
// 		}
// 	}
// 	else
// 		window.location.href = '/';
// }

// seunchoi
export const socketRefreshToken = async (setValidToken:Function, jwtExp: number) => {
	if (jwtExp * 1000 - Date.now() < 2000) {
		try {
			const json = await(await fetch('api/auth/refresh')).json();
			localStorage.setItem("access_token", json.access_token);
			const jwtDecode = jwt_decode<JwtPayload>(json.access_token);
			localStorage.setItem("access_token_exp", jwtDecode.exp.toString());

			console.log("Response from refresh", json);
			setValidToken(true); // success
		} catch (error) {
			console.log("Refresh token is expired");
			// todo
			localStorage.setItem("isLoggedIn", "false");
			localStorage.removeItem("id");
			localStorage.removeItem("nickname");
			localStorage.removeItem("is2fa");
			localStorage.removeItem("access_token");
			localStorage.removeItem("avatar");
			sessionStorage.removeItem("gamesocket");
			window.location.href = '/'; //fail
		}
	} else {
		console.log("Doesn't need to refresh");
		setValidToken(true); // success
	}

}
