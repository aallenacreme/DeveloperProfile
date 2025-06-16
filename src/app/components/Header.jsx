import { useState, useEffect, useRef } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
// import RainbowBall from './Rainbowball';
import animateBallBounce from "./animateBounceBall";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import StarField from "./Starfield";
import "./Header.css";

function Header({ aboutSectionRef, profileData }) {
  const [scrolled, setScrolled] = useState(false);
  const [scrollingUp, setScrollingUp] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  const ballRef = useRef(null);
  const titleLetterRefs = useRef([]);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const subtitleRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      setScrollingUp(currentScrollY < lastScrollY && currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setTimeout(() => {
      animateBallBounce(
        ballRef,
        titleLetterRefs,
        firstNameRef,
        lastNameRef,
        subtitleRef,
        aboutSectionRef
      );
    }, 500);
  }, [aboutSectionRef, profileData.headerTitle, profileData.headerSubtitle]);

  const handleSetActive = (link) => {
    setActiveLink(link);
  };

  const splitName = (name) => {
    if (!name) return ["Allen", "Mahdi"];
    const trimmedName = name.trim();
    const splitIndex = trimmedName
      .split("")
      .findIndex((char, i) => i > 0 && char === char.toUpperCase());
    return splitIndex === -1
      ? [trimmedName, ""]
      : [
          trimmedName.substring(0, splitIndex),
          trimmedName.substring(splitIndex),
        ];
  };

  const [firstName, lastName] = splitName(profileData.headerTitle);

  titleLetterRefs.current = [];

  return (
    <>
      <div className="hero-section">
        <StarField />
        <div className="title-container">
          <h1 className="name-container">
            <span className="first-name" ref={firstNameRef}>
              {firstName.split("").map((letter, i) => (
                <span
                  key={`first-${i}`}
                  className="letter"
                  ref={(el) => el && titleLetterRefs.current.push(el)}
                >
                  {letter}
                </span>
              ))}
            </span>
            <span className="last-name" ref={lastNameRef}>
              {lastName.split("").map((letter, i) => (
                <span
                  key={`last-${i}`}
                  className="letter"
                  ref={(el) => el && titleLetterRefs.current.push(el)}
                >
                  {letter}
                </span>
              ))}
            </span>
          </h1>
          <p className="subtitle" ref={subtitleRef}>
            {profileData.headerSubtitle}
          </p>
          {/* <RainbowBall ref={ballRef} /> */}
        </div>
      </div>

      <Navbar
        fixed="top"
        expand="lg"
        className={`navbar-glass ${scrolled ? "scrolled" : ""} ${
          scrollingUp ? "scrolling-up" : ""
        }`}
      >
        <Container className="nav-container">
          <Navbar.Brand className="gradient-brand">
            {profileData.name || "AllenMahdi"}
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className="custom-toggler"
          />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end"
          >
            <div className="nav-buttons">
              <Link
                to="/"
                className={`nav-link ${activeLink === "home" ? "active" : ""}`}
                onClick={() => handleSetActive("home")}
              >
                <Button
                  variant="outline-light"
                  className={`nav-button ${
                    activeLink === "home" ? "active" : ""
                  }`}
                >
                  Home
                </Button>
              </Link>
              <Link
                to="/tenzies"
                className={`nav-link ${
                  activeLink === "output" ? "active" : ""
                }`}
                onClick={() => handleSetActive("output")}
              >
                <Button
                  variant="outline-light"
                  className={`nav-button ${
                    activeLink === "output" ? "active" : ""
                  }`}
                >
                  Output
                </Button>
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                <Button variant="outline-light" className="nav-button">
                  <span className="github-text">GitHub</span>
                </Button>
              </a>
              <Link to="/create-profile" className="nav-link">
                <Button variant="outline-light" className="nav-button">
                  Create Profile
                </Button>
              </Link>
              {isLoggedIn && (
                <Link
                  to="/edit-profile"
                  className={`nav-link ${
                    activeLink === "edit-profile" ? "active" : ""
                  }`}
                  onClick={() => handleSetActive("edit-profile")}
                >
                  <Button
                    variant="outline-light"
                    className={`nav-button ${
                      activeLink === "edit-profile" ? "active" : ""
                    }`}
                  >
                    Edit Profile
                  </Button>
                </Link>
              )}
              {!isLoggedIn && (
                <Button
                  variant="outline-light"
                  className="nav-button"
                  onClick={() => setShowSignupModal(true)}
                >
                  Sign Up
                </Button>
              )}
              <Button
                variant="outline-light"
                className="nav-button"
                onClick={
                  isLoggedIn ? handleLogout : () => setShowLoginModal(true)
                }
              >
                {isLoggedIn ? "Logout" : "Login"}
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
      />
      <SignupModal
        show={showSignupModal}
        onHide={() => setShowSignupModal(false)}
      />
    </>
  );
}

export default Header;
