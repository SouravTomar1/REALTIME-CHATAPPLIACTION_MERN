import Navbar from "./components/Navbar";
import SignUpPage from "./pages/SignUpPage";
import Loginpage from "./pages/LoginPage";
import Profilepage from "./pages/ProfilePage";
import Settingpage from "./pages/SettingPage";

import { Routes, Route, Navigate} from "react-router-dom";
//  import { axiosInstance } from "./libs/axios";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import{Loader} from "lucide-react";
import AuthImagePattern from "./components/AuthImagePattern";
import {Toaster} from "react-hot-toast";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingPage";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const {authUser,checkAuth,ischeckingAuth,onlineUsers}=useAuthStore();
  const {theme}=useThemeStore()
  console.log({onlineUsers});
  useEffect( ()=> {
    checkAuth();
  },
  [checkAuth]
)

if(ischeckingAuth && !authUser) return(
  <div className="flex items-center justify-center h-screen">
    <Loader className="size-10 animate-spin"></Loader>
  </div>
)
  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <Loginpage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <Profilepage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
