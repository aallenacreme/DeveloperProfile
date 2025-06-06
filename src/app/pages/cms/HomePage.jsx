
import { useRef } from 'react';
import { Container } from 'react-bootstrap';
import Header from '../../components/Header';
import MainContent from '../../components/MainContent';
import Footer from '../../components/Footer';

function HomePage() {
  const aboutSectionRef = useRef(null);

  return (
    <>
      <Header aboutSectionRef={aboutSectionRef} />
      <MainContent aboutSectionRef={aboutSectionRef} />
      <Footer />
    </>
  );
}

export default HomePage;