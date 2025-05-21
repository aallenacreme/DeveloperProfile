import { Navbar, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top" style={{ borderBottom: '2px solid #fff' }}>
      <Container className="d-flex justify-content-between align-items-center">
        <Navbar.Brand>Allen</Navbar.Brand>

        {/* Add Play Tenzies button */}
        <Link to="/tenzies" style={{ textDecoration: 'none' }}>
          <Button variant="outline-light">
            Play Tenzies
          </Button>
        </Link>
      </Container>
    </Navbar>
  );
}

export default Header;
