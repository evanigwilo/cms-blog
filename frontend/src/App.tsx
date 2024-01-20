// React
import React, { useLayoutEffect } from "react";
// React Router
import { Routes, Route, useLocation } from "react-router-dom";
// Components
import Header from "./components/Header";
// Pages
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Authenticate from "./pages/Authenticate";
import NotFound from "./pages/NotFound";
// Constants
import { SEO } from "./utils/constants";

const authTitle =
  `Login | Sign in to ${SEO.title} to see the latest. ` +
  "Join the conversation, follow accounts, see your Home Timeline, and catch up on Posts from the people you know.";

// Define titles for each route
const titles: Record<string, string> = {
  "*": SEO.title,
  "/":
    `Explore / ${SEO.title}. ` +
    "A simple, fun & creative way to capture, edit & share photos, videos & messages with friends & family.",
  "/register": authTitle,
  "/login": authTitle,
  "/user/:username": SEO.title,
};

// Main App component
const App: React.FC = () => {
  // Retrieve the current location from React Router
  const location = useLocation();

  // Update document title based on the current route
  useLayoutEffect(() => {
    document.title = titles[location.pathname] || SEO.title;
  }, [location]);

  // Render the application with React Router Routes
  return (
    <Routes>
      <Route path="/login" element={<Authenticate route="Login" />} />
      <Route path="/register" element={<Authenticate route="Sign Up" />} />
      <Route path="/user/:username" element={<Profile />} />
      <Route
        path="*"
        element={
          <>
            <Header />
            <NotFound />
          </>
        }
      />
      <Route
        path="/"
        element={
          <>
            <Header />
            <Home />
          </>
        }
      />
    </Routes>
  );
};

export default App;
