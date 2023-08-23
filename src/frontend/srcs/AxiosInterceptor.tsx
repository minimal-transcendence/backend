import axios, { AxiosError } from "axios";

async function refreshToken() : Promise<any> {
	const res = await axios.get(
		'http://localhost/api/auth/refresh',
		{ withCredentials: true }
		).catch((error) => {
			console.log(error);
			console.log(error.response);
			if (error.response.status === 401) {
				getLogout();
				window.location.href = '/';
			}
		})
	return (res);
}

export async function getLogout() : Promise<any>{
	console.log("try logout");
	localStorage.setItem('isLoggedIn', 'false');
	localStorage.removeItem('id');
	localStorage.removeItem('nickname');
	localStorage.removeItem('is2fa');
	localStorage.removeItem('access_token');
	localStorage.removeItem('avatar');
	const ApiUrl = 'http://localhost/api/auth/logout';
	return axios.post(ApiUrl);
}

const axiosApi = axios.create({
	baseURL: "http://localhost/api",	//default url to call
	headers: { "Content-type": "application/json" }	//in case of img?
});
  
axiosApi.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		if (error.response?.status === 401) {
			console.log("axios intercept");
			const res = await refreshToken();
			// //갱신 후 재요청
			const response = await axios.request(error.config);
			return response;
		}
		return Promise.reject(error);
	}
);
  
export default axiosApi;
