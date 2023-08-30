import axios, { AxiosError } from "axios";

async function refreshToken() : Promise<any> {
    const res = await axios.get(
        'http://localhost/api/auth/refresh',
        { withCredentials: true }
        )
        .catch((error) => {
            console.log("here?");
            console.log(error.response.status);
            if (error.response.status === 401) async () =>{
                console.log("401");
                await getLogout();
                // window.location.href = '/';
                throw new Error("Axios Error!!!!");
            }
        })
        console.log("didn't catched");
    return (res);
}

export async function getLogout() : Promise<any>{
    console.log("try logout!");
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('id');
    localStorage.removeItem('nickname');
    localStorage.removeItem('is2fa');
    localStorage.removeItem('access_token');
    localStorage.removeItem('avatar');
}

const axiosApi = axios.create({
    baseURL: "http://localhost/api",    //default url to call
    headers: { "Content-type": "application/json" } //in case of img?
});
  
axiosApi.interceptors.request.use(
    async (request) => {
        const jwtExpItem = localStorage.getItem("access_token_exp");
        if (jwtExpItem){
            const jwtExpInt = parseInt(jwtExpItem);
            if (jwtExpInt * 1000 - Date.now() < 2000)
                await refreshToken();
        }
        else {
            // window.location.href = '/';
            console.log("here");
        }
        return request;
    },
);
  
export default axiosApi;