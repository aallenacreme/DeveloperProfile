import { useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './MainContent.css';
import dns from '../assets/images/dns.svg';

function MainContent({ profileData, aboutSectionRef }) {
  const skillsSectionRef = useRef(null);

  useEffect(() => {
    const scrollFadeInSections = [aboutSectionRef.current, skillsSectionRef.current].filter(ref => ref);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    scrollFadeInSections.forEach(section => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      scrollFadeInSections.forEach(section => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, [aboutSectionRef]);

  return (
    <Container fluid>
      <Row className=" full-page-row about-section" ref={aboutSectionRef}>
        <Col xs={12} md={6} className="about-content-col">
          <h2 className="about-heading">About Me</h2>
          <p className="about-content">
                   <img src={dns} alt="random dns photo" className="dns" />
            I'm {profileData.name}, a passionate computer science student and aspiring developer.
          </p>
        </Col>
        <Col xs={12} md={6} className="timeline-col">
          <h3 className="timeline-heading">My College Progress</h3>
          <div className="timeline">
            {profileData.collegeProgress.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-content">
                  <p>{item}</p>
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      <Row className=" full-page-row skills-section" ref={skillsSectionRef}>
        <Col xs={12}>
          <h2 className="skills-heading">My Skills</h2>
          <Row className="skills-row">
            <Col xs={12} md={4} className="skill-col">
              <h4>SQL Mastery</h4>
              <p className="skill-content">
                {profileData.sqlSkills.join(' ')}
              </p>
            </Col>
            <Col xs={12} md={4} className="skill-col">
              <h4>Java Expertise</h4>
              <p className="skill-content">
                {profileData.javaSkills.join(' ')}
              </p>
            </Col>
            <Col xs={12} md={4} className="skill-col">
              <h4>Adaptive Learning</h4>
              <p className="skill-content">
                {profileData.learningAdaptation}
              </p>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="mb-5 full-page-row">
        <Col xs={12}>
          <h2>{profileData.projectTitle}</h2>
          <h5>{profileData.projectSubtitle}</h5>
          <p><strong>Duration:</strong> {profileData.projectDuration}</p>
          <p>{profileData.projectDescription}</p>
          <ul>
            {profileData.projectDetails.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </Col>
      </Row>
    </Container>
  );
}

export default MainContent;