import {
  Navbar as HeroUiNavbar,
  NavbarBrand,
  NavbarContent,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  NavbarItem,
  Button,
} from "@heroui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  const isFeedActive = location.pathname === "/";
  const isProfileActive = location.pathname === "/profile";

  return (
    <HeroUiNavbar
      isBordered
      className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors"
    >
      <NavbarBrand>
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-base shadow-md group-hover:scale-105 transition-transform">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-wider bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent leading-none">
              CIRCLE
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold tracking-widest uppercase">
              Community
            </span>
          </div>
        </Link>
      </NavbarBrand>

      {isAuthenticated && (
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={isFeedActive}>
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors px-3 py-1.5 rounded-lg ${
                isFeedActive
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-950/50"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Feed
            </Link>
          </NavbarItem>
          <NavbarItem isActive={isProfileActive}>
            <Link
              to="/profile"
              className={`text-sm font-semibold transition-colors px-3 py-1.5 rounded-lg ${
                isProfileActive
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-950/50"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Profile
            </Link>
          </NavbarItem>
        </NavbarContent>
      )}

      <NavbarContent as="div" justify="end" className="gap-2 sm:gap-3">
        {/* Dark/Light mode toggle */}
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              // Sun icon
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              // Moon icon
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </Button>
        </NavbarItem>

        {isAuthenticated ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform cursor-pointer hover:scale-105"
                color="primary"
                name={user?.name || "User"}
                size="sm"
                src={user?.photo || undefined}
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="User Profile Actions"
              variant="flat"
              onAction={(key) => {
                if (key === "profile" || key === "profile-info") navigate("/profile");
                if (key === "feed") navigate("/");
              }}
            >
              <DropdownItem key="profile-info" textValue="Signed in info" className="h-14 gap-2">
                <div>
                  <p className="font-medium text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
              </DropdownItem>
              <DropdownItem key="feed" textValue="Feed">
                Feed Timeline
              </DropdownItem>
              <DropdownItem key="profile" textValue="Profile">
                My Profile
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                className="text-danger"
                textValue="Log Out"
                onPress={handleLogout}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <div className="flex items-center gap-2">
            <NavbarItem>
              <Button
                as={Link}
                to="/signin"
                variant="light"
                color="primary"
                size="sm"
                className="font-medium"
              >
                Sign In
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={Link}
                to="/signup"
                variant="solid"
                color="primary"
                size="sm"
                className="font-medium shadow-sm"
              >
                Sign Up
              </Button>
            </NavbarItem>
          </div>
        )}
      </NavbarContent>
    </HeroUiNavbar>
  );
}
