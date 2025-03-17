import React, { useState, useEffect } from "react";
import AppRouter from "./AppRouter";
import { fetchUsersbyIdApi } from "./helpers/api/userApi";
import './index.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem("isAuthenticated") === "true"
  );
  const [userRole, setUserRole] = useState<string>(
    () => localStorage.getItem("role") || ""
  );
  const [userName, setUserName] = useState<string>(
    () => localStorage.getItem("userName") || ""
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const authenticateWithToken = async () => {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (token && userId) {
        try {
          const user = await fetchUsersbyIdApi(String(userId));
          console.log("Fetched user", user);

          if (user) {
            const fullName = `${user.firstName} ${user.lastName}`;
            setIsAuthenticated(true);
            setUserRole(user.role);
            setUserName(fullName);
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("userName", fullName);
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.clear();
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    authenticateWithToken();
  }, []);

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <>
      <AppRouter
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        userRole={userRole}
        setUserName={setUserName}
      />
    </>
  );
};

export default App;
