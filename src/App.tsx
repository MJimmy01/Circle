import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import PostDetails from "./pages/PostDetails";
import NotFound from "./pages/NotFound";
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "signup", element: <SignUp /> },
          { path: "signin", element: <SignIn /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Feed /> },
          { path: "profile", element: <Profile /> },
          { path: "posts/:id", element: <PostDetails /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <ThemeProvider>
      <HeroUIProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}

export default App;
