import React, { createContext } from 'react';

interface AuthContextProps {
  isLoggedIn: boolean;
  userNickname: string;
  profileURL: string;
  jwt: string;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUserNickname: React.Dispatch<React.SetStateAction<string>>;
  setProfileURL: React.Dispatch<React.SetStateAction<string>>;
  setJwt: React.Dispatch<React.SetStateAction<string>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  userNickname: '',
  profileURL: '',
  jwt: '',
  setIsLoggedIn: () => {},
  setUserNickname: () => {},
  setProfileURL: () => {},
  setJwt: () => {},
  logout: () => {},
});

export default AuthContext;
