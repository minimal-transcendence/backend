import { useEffect, useRef, useState } from "react";
import "./index.css";

function TempLogin({
  socket,
  setTmpLoginID,
  setTmpLoginNickName,
  setTmpIsLoggedIn,
}: {
  socket: any;
  setTmpLoginID: any;
  setTmpLoginNickName: any;
  setTmpIsLoggedIn: any;
}) {
  const [nickName, setNickName] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = async (event: any) => {
    setDisabled(true);
    event.preventDefault();
    const tempIDlist = ["2000", "2001", "2002", "2003", "2004", "2005"];
    const tempNickNameList = [
      "ysungwon_v",
      "namkim_v",
      "jaeyjeon_v",
      "seunchoi_v",
      "ProGamer",
      "God",
    ];
    if (tempIDlist.includes(id) || tempNickNameList.includes(nickName)) {
      alert("아이디나 비번 다른 거 입력핫메");
    } else {
      setTmpLoginID(() => id);
      setTmpLoginNickName(() => nickName);
      setTmpIsLoggedIn(() => true);
      socket.emit("sendNickNameID", { id, nickName });
      console.log("id nickname : ", id, nickName);
    }
    setDisabled(false);
  };
  return (
    <div className="div-templogin">
      <form onSubmit={handleSubmit}>
        <div>
          <span>
            <input
              type="id"
              value={id}
              placeholder="임시 id번호 입력하세요"
              onChange={(e) => setId(e.target.value)}
            />
          </span>
          <span>
            <input
              type="nickName"
              value={nickName}
              placeholder="임시 nickname 입력하세요"
              onChange={(e) => setNickName(e.target.value)}
            />
          </span>
        </div>
        <div className="btn-join-div">
          <button className="btn-join" type="submit" disabled={disabled}>
            채팅장 입장
          </button>
        </div>
      </form>
    </div>
  );
}
export default TempLogin;
