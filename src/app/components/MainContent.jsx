import { useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import java from '../assets/images/java.svg';
import dns from '../assets/images/dns.svg';
import sql from '../assets/images/sql.svg';
import learn from '../assets/images/learn.svg';
import javascript from '../assets/images/javascript.svg';
import cpp from '../assets/images/cpp.svg';
import react from '../assets/images/react.svg';
import './MainContent.css';
import './Animations.css';
import './AboutSection.css';
import './TimelineSection.css';
import './SkillsSection.css';
import './Responsive.css';



function MainContent({ profileData, aboutSectionRef }) {
  const skillsSectionRef = useRef(null);
  const timelineSectionRef = useRef(null);

  useEffect(() => {
    const scrollFadeInSections = [
      aboutSectionRef.current,
      timelineSectionRef.current,
      skillsSectionRef.current,
    ].filter(ref => ref);

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
    <Container fluid className="main-container">
      {/* Sticky animated background */}
      <div className="sticky-background">
        <div className="animated-blob blob-1"></div>
        <div className="animated-blob blob-2"></div>
        <div className="animated-blob blob-3"></div>
        <div className="particles-container">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
      </div>
      
      <Row className="about-section" ref={aboutSectionRef}>
        <Col xs={12} className="about-content-col">
          <div className="section-header">
            <h1 className="text-gradient">
              About Me
            </h1>
            <div className="header-underline"></div>
          </div>
          
          <div className="about-content-wrapper">
            <div className="profile-image-container">
              <div className="profile-image">
                <img src={dns} alt="profile" className="profile-img" />
                <div className="image-border"></div>
              </div>
            </div>
            
            <div className="about-content">
              <p>
                Hey I'm <span className="highlight">{profileData.name}</span>, a passionate computer science student starting my 4th year. I'm getting into web development and looking to learn more about building clean, functional websites. I'm excited to grow my skills and work on projects that make a difference.
              </p>
              <div className="interests-container">
                <div className="interest-tag">Web Development</div>
                <div className="interest-tag">UI/UX Design</div>
                <div className="interest-tag">Database Systems</div>
                <div className="interest-tag">Cloud Computing</div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      
      {/* Timeline Section */}
      <Row className="timeline-section" ref={timelineSectionRef}>
        <Col xs={12} className="timeline-col">
          <div className="section-header">
            <h2 className="text-gradient">
              My College Journey
            </h2>
            <div className="header-underline"></div>
          </div>
          
          <div className="timeline">
            {profileData.collegeProgress.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-number">{index + 1}</div>
                <div className="timeline-content">
                  <div className="timeline-dot"></div>
                  <div className="timeline-text">
                    <p>{item}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Row>
      
      {/* Skills Section with 6 skills */}
      <Row className="skills-section" ref={skillsSectionRef}>
        <Col xs={12}>
          <div className="section-header">
            <h2 className="text-gradient">
              My Skills
            </h2>
            <div className="header-underline"></div>
          </div>
          
          <Row className="skills-row">
            {/* SQL */}
            <Col xs={12} md={6} lg={4} className="skill-col">
              <div className="skill-card">
                <div className="skill-icon">
                  <i className="fas fa-database"></i>
                </div>
                <h4>SQL</h4>
                <div className="skill-content">
                  <img src={sql} alt="SQL" className="skill-img" />
                </div>
              </div>
            </Col>
            
            {/* Java */}
            <Col xs={12} md={6} lg={4} className="skill-col">
              <div className="skill-card">
                <div className="skill-icon">
                  <i className="fab fa-java"></i>
                </div>
                <h4>Java</h4>
                <div className="skill-content">
                  <img src={java} alt="Java" className="skill-img" />
                </div>
              </div>
            </Col>
            
            {/* Adaptive Learning */}
            <Col xs={12} md={6} lg={4} className="skill-col">
              <div className="skill-card">
                <div className="skill-icon">
                  <i className="fas fa-brain"></i>
                </div>
                <h4>Adaptive Learning</h4>
                <div className="skill-content">
                  <img src={learn} alt="Adaptive Learning" className="skill-img" />
                </div>
              </div>
            </Col>
            
            {/* JavaScript */}
            <Col xs={12} md={6} lg={4} className="skill-col">
              <div className="skill-card">
                <div className="skill-icon">
                  <i className="fab fa-js"></i>
                </div>
                <h4>JavaScript</h4>
                <div className="skill-content">
                  <img src={javascript} alt="JavaScript" className="skill-img" />
                </div>
              </div>
            </Col>
            
            {/* React */}
            <Col xs={12} md={6} lg={4} className="skill-col">
              <div className="skill-card">
                <div className="skill-icon">
                  <i className="fab fa-react"></i>
                </div>
                <h4>React</h4>
                <div className="skill-content">
                  <img src={react} alt="React" className="skill-img" />
                </div>
              </div>
            </Col>
            
            {/* C++ */}
            <Col xs={12} md={6} lg={4} className="skill-col">
              <div className="skill-card">
                <div className="skill-icon">
                  <i className="fas fa-plus-square"></i>
                </div>
                <h4>C++</h4>
                <div className="skill-content">
                  <img src={cpp} alt="C++" className="skill-img" />
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default MainContent;