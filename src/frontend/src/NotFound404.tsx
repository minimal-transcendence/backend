import React from 'react'
import { Link } from "react-router-dom";

function NotFound(){
	return(
		<div>
			<h1>404 Not Found</h1>
			<p>그런 페이지 없음!</p>
			<Link to="/">
				<button>메인 화면으로 가기</button>
			</Link>
		</div>
	);
};

export default NotFound;
