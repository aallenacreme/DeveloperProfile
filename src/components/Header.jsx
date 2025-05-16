import { Navbar, Container } from 'react-bootstrap';

function Header() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top" style={{ borderBottom: '2px solid #fff' }}>
      <Container>
        <Navbar.Brand>John Martin</Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default Header;