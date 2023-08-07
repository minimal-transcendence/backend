import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserList from './UserList';

function Main() {
	const router = useRouter();

	return(
		<>
			<div>
				채팅방 생성창
			</div>
			<div>
				검색창
			</div>
			<div>
				<button>유저 목록</button>
				<button>내 정보</button>
				<button>로그 아웃</button>
				<input type="checkbox" id="chk1"/>
			</div>
			<div>
				채팅방 목록
			</div>
			<div>
				채팅창
			</div>
			<div>
				게임 화면 모달
			</div>
			<div>
				내 프로필 모달
			</div>
			<div>
				유저 목록 모달
			</div>
		</>
	)
}
