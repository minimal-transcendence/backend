import { redirect } from 'next/navigation'
import { useEffect } from "react"

// const interceptedRequest = interceptor.onRequest(url, options)
// const response = await fetch(interceptedRequest.url, interceptedRequest.options)


// export const interceptor : Interceptor = {
// 	configs : null,
// 	onRequest: (url, options, configs) => ({url, options});	//configs?
// 	onSucess : response => {},
// 	onError : response => {},
// 	set({ configs, onRequest, onSuccess, onError }) {
// 		if (configs) this.configs = configs
// 		if (onRequest) this.onRequest = onRequest
// 		if (onSuccess) this.onSuccess = onSuccess
// 		if (onError) this.onError = onError
// 	},
// }

// const useInterceptor = ({
// 	configs,
// 	onRequest,
// 	onSuccess,
// 	onError,
//   }: Partial<UseInterceptor>) => {
// 	useEffect(() => {
// 	  interceptor.set({ configs, onRequest, onSuccess, onError })
// 	}, [configs, onRequest, onSuccess, onError])
//   }

// export const interceptedRequest

export async function fetch_refresh(url : string, ...args : any) : Promise<any> {
	console.log(url + args);
	let res = await fetch(url, args);
	if (res.status === 401){
		console.log("try refresh");
		res = await fetch('http://localhost/api/auth/refresh');
		if (res.status === 401){
			console.log("try logout");
			localStorage.setItem('isLoggedIn', 'false');
			localStorage.removeItem('id');
			localStorage.removeItem('nickname');
			localStorage.removeItem('is2fa');
			localStorage.removeItem('access_token');
			localStorage.removeItem('avatar');
			const ApiUrl = 'http://localhost/api/auth/logout';
			await fetch(ApiUrl, {method: 'POST'});
			// 여기서 redirect 시켜야 --> 안 됨...
			// redirect("/");
			// 이건 잘 됨...! 근데 뭔가 뻣뻣함
			window.location.href = '/';
		}
		else {
			console.log("refresh success");
			res = await fetch(url, args);
			return (res);
		}
	} else {
		return (res);
	}
}
