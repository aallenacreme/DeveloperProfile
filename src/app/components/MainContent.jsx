import { useEffect, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./MainContent.css";
import "./AboutSection.css";
import "./TimelineSection.css";
import "./SkillsSection.css";
import "./ProjectSection.css";
import java from "../assets/images/java.svg";
import dns from "../assets/images/dns.svg";
import sql from "../assets/images/sql.svg";
import learn from "../assets/images/learn.svg";
import javascript from "../assets/images/javascript.svg";
import cpp from "../assets/images/cpp.svg";
import react from "../assets/images/react.svg";

function MainContent({ aboutSectionRef, profileData }) {
  const skillsSectionRef = useRef(null);
  const timelineSectionRef = useRef(null);
  const projectSectionRef = useRef(null);

  useEffect(() => {
    const scrollFadeInSections = [
      aboutSectionRef.current,
      timelineSectionRef.current,
      skillsSectionRef.current,
      projectSectionRef.current,
    ].filter((ref) => ref);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    scrollFadeInSections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      scrollFadeInSections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, [aboutSectionRef]);

  return (
    <Container fluid className="main-container">
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

      {/* About Section */}
      <Row className="about-section" ref={aboutSectionRef}>
        <Col xs={12} className="about-content-col">
          <div className="section-header">
            <h1 className="text-gradient">About Me</h1>
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
                <span className="highlight">{profileData.bio}</span>
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
            <h2 className="text-gradient">My College Journey</h2>
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

      {/* Skills Section */}
      <Row className="skills-section" ref={skillsSectionRef}>
        <Col xs={12}>
          <div className="section-header">
            <h2 className="text-gradient">My Skills</h2>
            <div className="header-underline"></div>
          </div>
          <Row className="skills-row">
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
            <Col xs={12} md={6} lg={4} className="skill-col">
              <div className="skill-card">
                <div className="skill-icon">
                  <i className="fas fa-brain"></i>
                </div>
                <h4>Adaptive Learning</h4>
                <div className="skill-content">
                  <img
                    src={learn}
                    alt="Adaptive Learning"
                    className="skill-img"
                  />
                </div>
              </div>
            </Col>
            <Col xs={12} md={6} lg={4} className="skill-col">
              <div className="skill-card">
                <div className="skill-icon">
                  <i className="fab fa-js"></i>
                </div>
                <h4>JavaScript</h4>
                <div className="skill-content">
                  <img
                    src={javascript}
                    alt="JavaScript"
                    className="skill-img"
                  />
                </div>
              </div>
            </Col>
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
            <Col xs={12} md={6} lg={4} className="skill-col">
              <div className="skill-card">
                <div className="skill-icon">
                  <i className="fas fa-code"></i>
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

      {/* Project Section */}
      <Row className="project-section" ref={projectSectionRef}>
        <Col xs={12} className="project-col">
          <div className="section-header">
            <h2 className="text-gradient">Project</h2>
            <div className="header-underline"></div>
          </div>
          <div className="project-content-wrapper">
            <div className="project-card">
              <h3 className="project-title">{profileData.projectTitle}</h3>
              <h4 className="project-subtitle">
                {profileData.projectSubtitle}
              </h4>
              <p className="project-duration">{profileData.projectDuration}</p>
              <p className="project-description">
                {profileData.projectDescription}
              </p>
              <ul className="project-details-list">
                {profileData.projectDetails.map((detail, index) => (
                  <li key={index} className="project-detail-item">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default MainContent;
