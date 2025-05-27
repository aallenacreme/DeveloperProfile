import { Container, Row, Col, ListGroup } from 'react-bootstrap';

function MainContent({ profileData }) {
  return (
    <Container className="mt-5">
      <Row>
        {/* Sidebar (Profile Data) */}
        <Col sm={4}>
          <h2>About Me</h2>
          <h5>Photo of me:</h5>
          <div className="fakeimg">Fake Image</div>
          <p>I'm {profileData.name || 'a student'}, a passionate computer science student and aspiring developer.</p>

          <h3 className="mt-4">My Progress in College</h3>
          <ListGroup>
            {profileData.collegeProgress.length > 0 ? (
              profileData.collegeProgress.map((item, index) => (
                <ListGroup.Item key={index}>{item}</ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>No progress data available</ListGroup.Item>
            )}
          </ListGroup>

          <h3 className="mt-4">Java Skills</h3>
          <ListGroup>
            {profileData.javaSkills.length > 0 ? (
              profileData.javaSkills.map((skill, index) => (
                <ListGroup.Item key={index}>{skill}</ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>No Java skills available</ListGroup.Item>
            )}
          </ListGroup>

          <h3 className="mt-4">SQL Skills</h3>
          <ListGroup>
            {profileData.sqlSkills.length > 0 ? (
              profileData.sqlSkills.map((skill, index) => (
                <ListGroup.Item key={index}>{skill}</ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>No SQL skills available</ListGroup.Item>
            )}
          </ListGroup>

          <hr className="d-sm-none" />
        </Col>

        {/* Main Content */}
        <Col sm={8}>
          <h2>{profileData.projectTitle || 'Motion-Controlled Kiosk System'}</h2>
          <h5>{profileData.projectSubtitle || 'Class Project – Computer Science Course, University of New Orleans'}</h5>
          <p><strong>Duration:</strong> {profileData.projectDuration || 'August 2024 – Present'}</p>
          <p>{profileData.projectDescription || 'Developing a user-friendly interface for a Raspberry Pi-based kiosk system enabling motionless hand interactions through LeetMotion technology.'}</p>
          <ul>
            {profileData.projectDetails && profileData.projectDetails.length > 0 ? (
              profileData.projectDetails.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))
            ) : (
              <>
                <li>Utilizing Python and LeetMotion for advanced gesture recognition capabilities.</li>
                <li>Focused on enhancing accessibility and user interaction in school environments.</li>
                <li>Collaborating in a team of 25 to design, test, and deploy the system across campus TVs.</li>
                <li>Emphasis on robust performance and ease of use in public-facing deployments.</li>
              </>
            )}
          </ul>
        </Col>
      </Row>
    </Container>
  );
}

export default MainContent;