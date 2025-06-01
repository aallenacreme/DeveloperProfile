import { useEffect, useRef } from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RainbowBall from './Rainbowball';
import animateBallBounce from './animateBounceBall';
import './Header.css';

function Header({ profileData, aboutSectionRef }) {
  const ballRef = useRef(null);
  const titleLetterRefs = useRef([]);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const subtitleRef = useRef(null);

  const headerTitle = profileData.headerTitle || 'AllenMahdi';
  const headerSubtitle = profileData.headerSubtitle || 'Software Developer';

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
  }, [aboutSectionRef]);

  const splitName = (name) => {
    if (!name) return ['Allen', 'Mahdi'];
    const trimmedName = name.trim();
    const splitIndex = trimmedName
      .split('')
      .findIndex((char, i) => i > 0 && char === char.toUpperCase());
    return splitIndex === -1
      ? [trimmedName, '']
      : [trimmedName.substring(0, splitIndex), trimmedName.substring(splitIndex)];
  };

  const [firstName, lastName] = splitName(headerTitle);

  titleLetterRefs.current = [];

  return (
    <>
      <div className="hero-section">
        <div className="title-container">
          <h1 className="name-container">
            <span className="first-name" ref={firstNameRef}>
              {firstName
                .split('')
                .filter((c) => c.trim())
                .map((letter, i) => (
                  <span
                    key={`first-${i}`}
                    className="letter"
                    ref={(el) => {
                      if (el) titleLetterRefs.current.push(el);
                    }}
                  >
                    {letter}
                  </span>
                ))}
            </span>
            <span className="last-name" ref={lastNameRef}>
              {lastName
                .split('')
                .filter((c) => c.trim())
                .map((letter, i) => (
                  <span
                    key={`last-${i}`}
                    className="letter"
                    ref={(el) => {
                      if (el) titleLetterRefs.current.push(el);
                    }}
                  >
                    {letter}
                  </span>
                ))}
            </span>
          </h1>
          <p className="subtitle" ref={subtitleRef}>
            {headerSubtitle}
          </p>
          <RainbowBall ref={ballRef} />
        </div>
      </div>
      <Navbar bg="dark" variant="dark" expand="lg" className="navbar-border">
        <Container className="nav-container">
          <Navbar.Brand>{profileData.name || 'Allen'}</Navbar.Brand>
          <div className="nav-buttons">
            <Link to="/" className="nav-link">
              <Button variant="outline-light">Home</Button>
            </Link>
            <Link to="/tenzies" className="nav-link">
              <Button variant="outline-light">Output</Button>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              <Button variant="outline-light">
                <img
                  src="/assets/images/git.svg"
                  alt="GitHub"
                  className="github-icon"
                />
              </Button>
            </a>
          </div>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;