
import { Container } from 'react-bootstrap';

function Footer({ footerText }) {

  return (
    <Container fluid className="mt-5 p-4 bg-dark text-white text-center">
      <p>{footerText || 'Footer'}</p>
    </Container>
  );
}


export default Footer;