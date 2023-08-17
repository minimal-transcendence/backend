import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { start } from 'repl';

const Home = () => {
	const router = useRouter();

	useEffect(() => {
		router.push('Log');
		console.log("enter");
	})

	return(
		<div>
			<h2>시작페이지</h2>
		</div>
	)
}

export default Home;
