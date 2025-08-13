import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/HomePage/Header/Header";
import User_Login from "../components/UserLogin/User_Login";

const UserLoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    const userType = localStorage.getItem("userType");

    if (!userId) {
      // If not logged in, redirect to signin page
      navigate("/signin");
    } else if (userType === "admin") {
      // If admin is trying to access user pages, redirect to admin dashboard
      navigate("/admin/dashboard");
    } else {
      // If user is already logged in, redirect to the direct dashboard route
      navigate("/user-dashboard");
    }
  }, [navigate]);

  return (
    <div>
      {location.pathname === "/signin/user-login" && (
        <>
          <Header />
          <User_Login />
        </>
      )}

      <Outlet />
    </div>
  );
};

export default UserLoginPage;
