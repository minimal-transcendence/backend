import { useEffect, useState } from "react";
import "../../index.css";

function TempLogin({
  tmpIsLoggedIn,
  setTmpIsLoggedIn,
  tmpLoginID,
  setTmpLoginID,
  tmpLoginnickname,
  setTmpLoginnickname,
}: {
  tmpIsLoggedIn: boolean;
  tmpLoginID: any;
  tmpLoginnickname: string;
  setTmpLoginID: any;
  setTmpLoginnickname: any;
  setTmpIsLoggedIn: any;
}) {
  const [nickname, setnickname] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = async (event: any) => {
    setDisabled(true);
    event.preventDefault();
    const tempIDlist = ["2000", "2001", "2002", "2003", "2004", "2005"];
    const tempnicknameList = [
      "ysungwon_v",
      "namkim_v",
      "jaeyjeon_v",
      "seunchoi_v",
      "ProGamer",
      "God",
    ];
    if (tempIDlist.includes(id) || tempnicknameList.includes(nickname)) {
      alert("아이디나 비번 다른 거 입력핫메");
    } else {
      setTmpLoginID(() => id);
      setTmpLoginnickname(() => nickname);
      setTmpIsLoggedIn(() => true);
      console.log("id nickname : ", id, nickname);
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
              type="nickname"
              value={nickname}
              placeholder="임시 nickname 입력하세요"
              onChange={(e) => setnickname(e.target.value)}
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
