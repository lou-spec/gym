import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import styles from "./App.module.scss";
import LandingPage from "./components/LandingPage/index.jsx";
import LoginPage from "./components/LoginPage/index.jsx";
import RegisterPage from "./components/RegisterPage/index.jsx";
import AdminPage from "./components/AdminPage/index.jsx";

import ForgotPassword from "./components/ForgotPassword/index.jsx";
import ResetPassword from "./components/ResetPassword/index.jsx";
import Layout from "./components/Layout/index.jsx";
import ProtectedRoute from "./components/ProtectRoute/index.jsx";
import UserPage from "./components/UserPage/index.jsx";
import PersonalPage from "./components/PersonalPage/index.jsx";
import { UsersProvider } from "./contexts/UsersProvider/UsersProvider.jsx";
import { ThemeProvider } from "./contexts/ThemeProvider/ThemeProvider.jsx";
import { TabProvider } from "./components/AdminPage/contexts/TabProvider/TabProvider.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {

  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <LandingPage />
        },
        {
          path: "/login",
          element: <LoginPage />
        },
        {
          path: "/forgotpassword",
          element: <ForgotPassword />
        },
        {
          path: "/reset-password/:token",
          element: <ResetPassword />
        },
        {
          path: "/register",
          element: <RegisterPage />
        },

        {
          path: "/admin",
          element: <ProtectedRoute role="admin"><TabProvider><AdminPage /></TabProvider></ProtectedRoute>
        },
        {
          path: "/user",
          element: <ProtectedRoute role="user"><UserPage /></ProtectedRoute>
        },
        {
          path: "/trainer",
          element: <ProtectedRoute role="trainer"><PersonalPage /></ProtectedRoute>
        },
      ]
    }
  ]);

  return (
    <ThemeProvider>
      <div className={styles.App}>
        <ToastContainer />
        <UsersProvider>
          <RouterProvider router={router} />
        </UsersProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
