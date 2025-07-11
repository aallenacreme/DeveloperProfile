import { useEffect, useRef } from "react";
import { Card, Form, InputGroup, Button } from "react-bootstrap";

// Chat area component to show messages and send new ones
function ChatArea({
  selectedConversation,
  messages,
  newMessage,
  setNewMessage,
  user,
  userNames,
  handleSendMessage,
}) {
  const messageEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedConversation) {
    return (
      <Card className="text-center py-5">
        <Card.Body>
          <h4>Select a conversation to start chatting</h4>
        </Card.Body>
      </Card>
    );
  }

  const otherId =
    selectedConversation.participant1 === user.id
      ? selectedConversation.participant2
      : selectedConversation.participant1;

  return (
    <Card>
      <Card.Body>
        <h5>Chat with {userNames[otherId] || otherId}</h5>
        <div
          style={{ height: "400px", overflowY: "auto", marginBottom: "1rem" }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex mb-2 ${
                msg.sender_id === user.id
                  ? "justify-content-end"
                  : "justify-content-start"
              }`}
            >
              <div
                className={`p-2 rounded ${
                  msg.sender_id === user.id
                    ? "bg-primary text-white"
                    : "bg-light text-dark"
                }`}
                style={{ maxWidth: "70%" }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button type="submit" variant="primary">
              Send
            </Button>
          </InputGroup>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ChatArea;
