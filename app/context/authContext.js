'use client'
import { createContext, useContext, useEffect, useState } from "react";
import api from "../hook/apiIntercepter";

const AuthContext = createContext(null);

export const AuthProvider = ({ Children }) => {
  const [user, setUser] = useState(null);
  const [loding, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  async function fetchUser() {
    try {
      const { data } = await api.get("/api/v1/me");
      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    }finally{
        setLoading(false)
    }
  }

  useEffect(()=>{
    fetchUser()
  },[])


return <AuthContext.Provider value={{setIsAuth,isAuth,user,setUser,loding}}>{Children}</AuthContext.Provider>
};

export const AppData = ()=>{
    const context = useContext(AuthContext)
    if(!context)throw new Error("ApppData must be used within as AuthProvider")
        return context
}