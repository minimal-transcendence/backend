import { useState, useContext } from "react";
import logOutIcon from "../../../assets/logout.png";
import userIcon from "../../../assets/user.png";
import contestIcon from "../../../assets/contest.png";

import { SocketContext } from "../../../context/socket";
import Image from "next/image";
export default function Menu() {
  const [easy, setEasy] = useState<boolean>(false);
  const [normal, setNormal] = useState<boolean>(false);
  const [hard, setHard] = useState<boolean>(false);
  const socket = useContext(SocketContext);
  function handleMenu(event: any) {
    if (event.target.dataset.name) {
      console.log(`${event.target.dataset.name}클릭!!!`);

      if (event.target.dataset.name === "easy") {
        if (!easy) {
          socket.emit("randomMatchApply", 1);
          console.log("random Easy apply");
        } else {
          socket.emit("randomMatchCancel", 1);
          console.log("random Easy Cancel");
        }
        setEasy(() => !easy);
      } else if (event.target.dataset.name === "normal") {
        if (!normal) {
          socket.emit("randomMatchApply", 2);
          console.log("random Normal apply");
        } else {
          socket.emit("randomMatchCancel", 2);
          console.log("random Normal Cancel");
        }
        setNormal(() => !normal);
      } else if (event.target.dataset.name === "hard") {
        if (!hard) {
          socket.emit("randomMatchApply", 3);
          console.log("random Hard apply");
        } else {
          socket.emit("randomMatchCancel", 3);
          console.log("random Hard Cancel");
        }
        setHard(() => !hard);
      }
    } else {
      console.log("you click other");
    }
  }
  return (
    <div className="nav-bar-menu">
      <div className="nav-bar-menu-l">
        <div className="nav-randmatch">
          <div className="dropdown">
            {/* <img
              className="dropbtn"
              src={contestIcon}
              width="35"
              height="35"
              alt="contesticon"
            /> */}

            <Image
              className="dropbtn"
              src={contestIcon}
              width="35"
              height="35"
              alt="contesticon"
            />
            <div onClick={() => handleMenu(event)} className="dropdown-content">
              <div data-name="easy">
                {"RandomMatch Easy " + `${easy ? "off" : "on"}`}
              </div>
              <div data-name="normal">
                {"RandomMatch Normal " + `${normal ? "off" : "on"}`}
              </div>
              <div data-name="hard">
                {"RandomMatch Hard " + `${hard ? "off" : "on"}`}
              </div>
            </div>
          </div>
        </div>
        <p className="nav-userlist">
          {/* <img src={userIcon} width="30" height="30" alt="usericon" /> */}
          <Image src={userIcon} width="30" height="30" alt="usericon" />
        </p>
        <p className="nav-profile">My</p>
        <p className="nav-logout">
          {/* <img src={logOutIcon} width="30" height="30" /> */}
          <Image src={logOutIcon} width="30" height="30" alt="logouticon" />
        </p>
      </div>
    </div>
  );
}
