import React, { useState, useRef, useEffect } from "react";
import axiosApi, { fetch_refresh } from "./FetchInterceptor";
import "../pages/index.css";
import styles from "../styles/MyProfileStyle.module.css";

function MyProfile({
  setIsOpenModal,
  setTmpLoginnickname,
}: {
  setIsOpenModal: any;
  setTmpLoginnickname: any;
}) {
  const [newNickname, setNewNickname] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userNickname, setUserNickname] = useState<string | null>(
    localStorage.getItem("nickname")
  );
  const [userId, setUserID] = useState<string | null>(
    localStorage.getItem("id")
  );
  const [avatarURL, setAvatarURL] = useState<string | null>(
    localStorage.getItem("avatar")
  );
  const [is2Fa, setIs2Fa] = useState<string | null>(
    localStorage.getItem("is2fa")
  );
  const [checkIs2Fa, setCheckIs2Fa] = useState<boolean>(is2Fa === "true");
  const [verCode, setVerCode] = useState("");

  const closeModal = () => {
    setIsOpenModal(false);
  };
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 이벤트 핸들러 함수
    const handler = () => {
      console.log("in myprofile handler");
      if (!event) return;
      // mousedown 이벤트가 발생한 영역이 모달창이 아닐 때, 모달창 제거 처리
      const target = event.target as HTMLInputElement;
      if (modalRef.current && !modalRef.current.contains(target)) {
        setIsOpenModal(false);
      }
    };

    // 이벤트 핸들러 등록
    document.addEventListener("mousedown", handler);
    // document.addEventListener('touchstart', handler); // 모바일 대응

    return () => {
      // 이벤트 핸들러 해제
      document.removeEventListener("mousedown", handler);
      // document.removeEventListener('touchstart', handler); // 모바일 대응
    };
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  async function fixProfile() {
    //여기서 refresh 하면될듯
    const apiUrl = "http://localhost/api/user/" + userId;

    if (newNickname !== "" && newNickname !== userNickname) {
      if (newNickname.length >= 12) {
        alert("닉네임의 길이는 최대 12자 입니다");
        setNewNickname("");
        return;
      }
      const dataToUpdate = {
        id: userId,
        nickname: newNickname,
      };
      await axiosApi
        .patch(apiUrl, JSON.stringify(dataToUpdate), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.data.error) {
            alert(
              "닉네임 변경에 실패했습니다. 새로운 닉네임으로 다시 시도해주세요"
            );
            console.error("에러 발생:", response.data);
            setNewNickname("");
          } else {
            setUserNickname(newNickname);
            localStorage.setItem("nickname", newNickname);
            setTmpLoginnickname(newNickname);
            console.log("naickname 변경 성공 데이터:", response.data);
            alert("닉네임이 변경되었습니다");
          }
        })
        .catch((error) => {
          alert("닉네임 변경에 실패했습니다");
          console.error("에러 발생:", error);
          setNewNickname("");
        });
    }
    if (selectedFile) {
      const formData = new FormData();
      formData.append("avatar", selectedFile);
      console.log(formData);
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const responseData = await response.json();
        if (responseData.error) {
          throw new Error(responseData.error);
        }
        console.log("profile 변경 응답 데이터:", responseData);
        localStorage.setItem("avatar", "/api/" + responseData.avatar);
        setAvatarURL("/api/" + responseData.avatar);
        setImageUrl(null);
        setSelectedFile(null);
        alert("프로필 사진이 변경되었습니다");
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("에러 발생 :" + error);
      }
    }

    if (is2Fa === "false" && checkIs2Fa === true) {
      if (verCode == "" || verCode.length !== 6) {
        throw "인증코드를 확인해주세요";
      }
      const faChangeApiUrl = "http://localhost/api/2fa/turn-on";
      const dataToUpdate = {
        id: userId,
        twoFactorAuthCode: verCode,
      };
      await axiosApi
        .post(faChangeApiUrl, JSON.stringify(dataToUpdate), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.data.error) {
            alert("인증에 실패했습니다, 코드 또는 OTP인증을 확인해주세요");
            console.error("에러 발생:", response.data.error);
          } else {
            localStorage.setItem("is2fa", "true");
            setIs2Fa("true");
            alert("2차인증이 설정되었습니다");
            console.log("is2fa 변경 응답 데이터:", response.data);
          }
        })
        .catch((error) => {
          alert("인증에 실패했습니다, 코드 또는 OTP인증을 확인해주세요");
          console.error("에러 발생:", error);
        });
    } else if (is2Fa === "true" && checkIs2Fa === false) {
      if (verCode == "" || verCode.length !== 6) {
        throw "인증코드를 확인해주세요";
      }
      const faChangeApiUrl = "http://localhost/api/2fa/turn-off";
      const dataToUpdate = {
        id: userId,
        twoFactorAuthCode: verCode,
      };
      await axiosApi
        .post(faChangeApiUrl, JSON.stringify(dataToUpdate), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.data.error) {
            alert("인증에 실패했습니다, 코드 또는 OTP인증을 확인해주세요");
            console.error("에러 발생:", response.data.error);
          } else {
            localStorage.setItem("is2fa", "false");
            setIs2Fa("false");
            alert("2차인증이 해제되었습니다");
            console.log("is2fa 변경 응답 데이터:", response.data);
          }
        })
        .catch((error) => {
          alert("인증에 실패했습니다, 코드 또는 OTP인증을 확인해주세요");
          console.error("에러 발생:", error);
        });
    }
  }
  return (
    <div ref={modalRef} className="modal modal-myprofile">
      <div className={styles.profileMainBox}>
        <div>
          <h2>내 프로필</h2>
          {avatarURL && (
            <img src={avatarURL} className={styles.profileImage} ></img>
          )}
        </div>
        <div>
          닉네임
          <br/>
          {userNickname !== null ?
          (<input className={styles.nicknameInput} placeholder={userNickname} type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} />)
          :
          (<input className={styles.nicknameInput} type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} />)}
        </div>
        <div>
          프로필 사진
          <br/>
        </div>
        <div className={styles.profilePicSetBox}>
          <input type="file" accept='image/*' onChange={handleFileChange}></input>
          {imageUrl && (
          <img src={imageUrl} alt="profile image" className={styles.selectProfileImage}/>)}
        </div>
        <div>
          2차인증 여부
          <br/>
          <input type="checkbox" id="toggle" name="toggle" onChange={() => setCheckIs2Fa(!checkIs2Fa)} checked={checkIs2Fa} hidden />
          <label htmlFor="toggle" className={styles.toggleSwitch}>
              <span className={styles.toggleButton}></span>
          </label>
          <div>
              <img
              src='http://localhost/api/2fa/qrcode'
              alt="qr image"
              width="100"
              height="100"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => e.currentTarget.style.display = 'none'}
              />
          </div>
          <div className={styles.OTPAlert}>
              {(is2Fa === 'true' && checkIs2Fa === false || is2Fa === 'false' && checkIs2Fa === true) && (
                  <span>변경사항 적용을 위해 OTP코드를 입력하세요</span>
              )}
          </div>
          <div>
              <input className={styles.nicknameInput} placeholder="띄워쓰기 제외한 6자리" type="text" value={verCode} onChange={(e) => setVerCode(e.target.value)} />
          </div>
        </div>
        <button className={styles.Button} onClick={fixProfile}>저장</button>
      </div>
    </div>
)}

export default MyProfile;
