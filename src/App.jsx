import { useState } from 'react';
import { Container, Row, Col, ListGroup, Button } from 'react-bootstrap';
import Header from './components/Header';

function App() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Header />
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: 'calc(100vh - 70px)', paddingTop: '70px' }}
      >
        <Row className="w-100">
          <Col className="text-center">
            <Button variant="primary" onClick={() => setShowDetails(!showDetails)}>
              Who Am I
            </Button>
            {showDetails && (
              <>
                <p className="mt-3 text-center">
                  I'm John Martin, a passionate computer science student and aspiring developer. I love building web applications and solving real-world problems with code.
                </p>
                <h4 className="text-center">My Progress in College</h4>
                <ListGroup>
                  <ListGroup.Item>Completed 60 credits toward my Computer Science degree</ListGroup.Item>
                  <ListGroup.Item>Aced courses like Data Structures, Algorithms, and Web Development</ListGroup.Item>
                  <ListGroup.Item>Currently working on a capstone project for a local business</ListGroup.Item>
                  <ListGroup.Item>Maintaining a 3.8 GPA</ListGroup.Item>
                </ListGroup>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;