import { useEffect, useRef, useState } from "react";
import "./index.css";

function ModalBasic({
  setIsOpenModal,
  socket,
  roomname,
  innerText,
}: {
  setIsOpenModal: any;
  socket: any;
  roomname: string;
  innerText: string;
}) {
  // 모달 끄기

  const [passWord, setPassWord] = useState("");
  const [disabled, setDisabled] = useState(false);

  const closeModal = () => {
    setIsOpenModal(false);
  };
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 이벤트 핸들러 함수
    const handler = () => {
      // mousedown 이벤트가 발생한 영역이 모달창이 아닐 때, 모달창 제거 처리
      if (!event) return;
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

  const handleSubmit = async (event: any) => {
    setDisabled(true);
    event.preventDefault();
    if (passWord.length < 1) {
      alert("비번 입력해라");
    } else {
      await new Promise((r) => setTimeout(r, 100));
      alert(`입력된 비번: ${roomname} ${passWord}`);
      setIsOpenModal(false);

      socket.emit("sendRoomPass", { roomname, passWord });
    }

    setDisabled(false);
  };

  return (
    <div ref={modalRef} className="container">
      <button className="close" onClick={closeModal}>
        X
      </button>
      <p>{innerText}</p>
      <form onSubmit={handleSubmit}>
        <div className="div-form">
          <span>
            {" "}
            <input
              type="text"
              value={passWord}
              onChange={(e) => setPassWord(e.target.value)}
            />
          </span>
          <span>
            <button className="btn-add" type="submit" disabled={disabled}>
              비번 입력
            </button>
          </span>
        </div>
      </form>
    </div>
  );
}
export default ModalBasic;
