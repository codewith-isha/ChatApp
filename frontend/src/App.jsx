import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/user-login/login";
import { ToastContainer } from "react-toastify";
import { ProtectedRoute, PublicRoute } from "./protected";
import HomePage from "./components/HomePage";
import UserDetails from "./components/UserDetails";
import Status from "./pages/StatusSection/Status";
import Setting from "./pages/SettingSection/Setting";
import useUserStore from "./store/useUserStore";
import { disconnectSocket, intializeSocket } from "./services/chat.service";

const App = () => {
  const {user} = useUserStore();
  useEffect(()=>{
    if(user?._id){
      const socket = intializeSocket()
    }

    return () =>{
      disconnectSocket()
    }
  })
  return (
    <>
      <Router>
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/user-login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/user-profile" element={<UserDetails/>} />
            <Route path="/status" element={<Status/>} />
            <Route path="/setting" element={<Setting/>} />
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
