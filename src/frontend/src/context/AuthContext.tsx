import React, { createContext } from 'react';

interface AuthContextProps {
  isLoggedIn: boolean;
  nickName: string;
  profileURL: string;
  jwt: string;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setNickName: React.Dispatch<React.SetStateAction<string>>;
  setProfileURL: React.Dispatch<React.SetStateAction<string>>;
  setJwt: React.Dispatch<React.SetStateAction<string>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  nickName: '',
  profileURL: '',
  jwt: '',
  setIsLoggedIn: () => {},
  setNickName: () => {},
  setProfileURL: () => {},
  setJwt: () => {},
  logout: () => {},
});

export default AuthContext;
