import React, { useState } from "react";
import { HiOutlineMenuAlt3, HiX, HiLogout } from "react-icons/hi";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useAuth, SignOutButton } from "@clerk/clerk-react";
import Smart from "../assets/Logo_AI.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();

  // Get user role from Clerk metadata
  const role = user?.unsafeMetadata?.role || "";
  const isTeacher = role === "teacher";
  const isStudent = role === "student";
  console.log(role, isTeacher, isStudent);
  console.log(user);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Common menu items for all users
  const commonLinks = [
    { path: "/", label: "Home" },
    { path: "/about-us", label: "About Us" },
  ];

  // Teacher-only links
  const teacherLinks = [
    { path: "/teacher-dashboard", label: "Dashboard" },
    { path: "/upload-paper", label: "Instant Checking" },
    // { path: "/teacher/upload", label: "Bulk Checking" },
  ];

  // Student-only links
  const studentLinks = [{ path: "/student-dashboard", label: "Dashboard" }];

  // Links for logged-out users
  const loggedOutLinks = [
    { path: "/login", label: "Log In" },
    { path: "/signup", label: "Signup" },
  ];

  // Combine links based on role
  const desktopLinks = [
    ...commonLinks,
    ...(isTeacher ? teacherLinks : []),
    ...(isStudent ? studentLinks : []),
  ];

  const mobileLinks = [
    ...commonLinks,
    ...(isTeacher ? teacherLinks : []),
    ...(isStudent ? studentLinks : []),
    ...(isSignedIn ? [] : loggedOutLinks),
  ];

  return (
    <nav className="flex justify-between items-center px-4 py-3 bg-white fixed top-0 w-full z-50 shadow-sm">
      {/* Logo */}
      <div className="flex items-center px-8 py-1 pt-2">
        <Link to="/" className="text-xl md:text-2xl font-bold text-gray-800">
          <img
            src={Smart}
            alt="Smart Grade.AI Logo"
            className="h-10 md:h-12 lg:h-16 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex space-x-6  text-sm md:text-base text-gray-700 font-medium">
        {desktopLinks.map((link, index) => (
          <li key={index}>
            <Link to={link.path} className="hover:text-black ">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop Buttons */}
      <div className="hidden md:flex items-center space-x-4">
        {isSignedIn ? (
          <SignOutButton signOutCallback={() => signOut()}>
            <span className="text-sm text-bold md:text-base text-gray-700 hover:text-black cursor-pointer">
              Log Out
            </span>
          </SignOutButton>
        ) : (
          <>
            <Link to="/login">
              <button className="text-sm md:text-base text-gray-700 hover:text-black">
                Log In
              </button>
            </Link>
            <Link to="/signup">
              <button className="bg-green-500 text-black px-4 py-2 rounded-full text-sm md:text-base hover:bg-green-600">
                Signup
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Icon */}
      <button
        className="md:hidden text-gray-700 focus:outline-none"
        onClick={toggleMenu}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? <HiX size={24} /> : <HiOutlineMenuAlt3 size={24} />}
      </button>

      {/* Mobile Menu with Animations */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden fixed top-0 left-0 w-full h-screen bg-white shadow-lg z-50 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-green-100 to-green-200">
              <Link to="/" onClick={toggleMenu}>
                <img
                  src={Smart}
                  alt="Smart Grade.AI Logo"
                  className="h-10 md:h-12 w-auto object-contain"
                />
              </Link>
              <button
                className="text-gray-700 focus:outline-none"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <HiX size={24} />
              </button>
            </div>
            <motion.ul
              className="mt-8 space-y-6 px-6 text-gray-700 font-medium text-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delayChildren: 0.2,
                staggerChildren: 0.1,
              }}
            >
              {mobileLinks.map((link, index) => (
                <motion.li
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    to={link.path}
                    className="hover:text-black"
                    onClick={toggleMenu}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              {isSignedIn && (
                <motion.li
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <SignOutButton signOutCallback={() => signOut()}>
                    <span className="hover:text-black w-full text-left cursor-pointer">
                      Log Out
                    </span>
                  </SignOutButton>
                </motion.li>
              )}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
