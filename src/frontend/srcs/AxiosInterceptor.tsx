import axios, { AxiosError } from "axios";
import jwt_decode from "jwt-decode";
import { JwtPayload } from "./SocketRefresh";

async function refreshToken(): Promise<any> {
	console.log("in refresh");
  const res = await axios
    .get("http://localhost/api/auth/refresh", { withCredentials: true })
	.then((res) => {
		const access_token = res.data.access_token;
		localStorage.setItem("access_token", access_token);
		const jwtDecode = jwt_decode<JwtPayload>(access_token);
		localStorage.setItem("access_token_exp", jwtDecode.exp.toString());
	})
    .catch(function (error) {
      if (error.response && error.response.status === 401) {
	        getLogout();
        	window.location.href = "/";
		}
		else if (error.request) {
			//namkim : 요청은 있었지만 응답이 없었음.. LOGOUT 하게 하는게 적합한 행동인지...?
			console.log(error.request);
			getLogout();
			window.location.href = "/";
		}
    });
  return res;
}

export async function getLogout(): Promise<any> {
  console.log("try logout!");
  localStorage.setItem("isLoggedIn", "false");
  localStorage.removeItem("id");
  localStorage.removeItem("nickname");
  localStorage.removeItem("is2fa");
  localStorage.removeItem("access_token_exp");
  localStorage.removeItem("access_token");
  localStorage.removeItem("avatar");
  sessionStorage.removeItem("gamesocket");
}

const axiosApi = axios.create({
  baseURL: "http://localhost/api", //default url to call
  headers: { "Content-type": "application/json" }, //in case of img?
});

axiosApi.interceptors.request.use(async (request) => {
  console.log("axios request typeof :");
  console.log(typeof request);
  const jwtExpItem = localStorage.getItem("access_token_exp");
  if (jwtExpItem) {
    const jwtExpInt = parseInt(jwtExpItem);
    if (jwtExpInt * 1000 - Date.now() < 2000) await refreshToken();
  } else {
    // window.location.href = '/';
    console.log("here");
  }
  return request;
});

export default axiosApi;
