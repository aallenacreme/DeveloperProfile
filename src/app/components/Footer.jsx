import { Container } from 'react-bootstrap';
import './Footer.css';

function Footer({ footerText }) {
  return (
    <Container fluid className="cosmic-footer d-flex flex-column align-items-center justify-content-center text-white text-center p-4">
      <div className="footer-glow" />
      <p className="mb-1">
        {footerText || '© 2025 Palumor — Navigating the devverse'}
      </p>
      <div className="footer-links mt-2">
        <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="mailto:your@email.com">Email</a>
      </div>
    </Container>
  );
}

export default Footer;
