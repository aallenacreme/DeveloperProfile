import { useState, useEffect, useRef } from "react";
import {
  Container,
  Spinner,
  Alert,
  Button,
  Form,
  InputGroup,
  Card,
} from "react-bootstrap";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../auth";
import { useNavigate } from "react-router-dom";
import MessageFormModal from "./MessageFormModal";
import "./Management.css";

function MessageManagement() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const channelRef = useRef(null);
  const hasFetched = useRef(false);
  const messageEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalConfig, setModalConfig] = useState({ show: false });

  // Fetch messages for selected contact
  useEffect(() => {
    if (!selectedContact || hasFetched.current) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from("messages")
          .select("id, sender_id, receiver_id, content, created_at")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact.user_id}),and(sender_id.eq.${selectedContact.user_id},receiver_id.eq.${user.id})`
          )
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
        hasFetched.current = true;
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, selectedContact]);

  // Realtime subscription for messages
  useEffect(() => {
    if (channelRef.current) return;

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${user.id}`,
        },
        (payload) => {
          handleMessageChange(payload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          handleMessageChange(payload);
        }
      )
      .subscribe()
      .on("error", (err) => {
        console.error("Realtime channel error:", err);
        setError("Realtime connection error");
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, selectedContact]);

  const handleMessageChange = (payload) => {
    const { eventType, new: newMessage } = payload;

    if (!selectedContact) return;

    // Only process messages for the current conversation
    const isRelevantMessage =
      (newMessage.sender_id === user.id &&
        newMessage.receiver_id === selectedContact.user_id) ||
      (newMessage.sender_id === selectedContact.user_id &&
        newMessage.receiver_id === user.id);

    if (!isRelevantMessage) return;

    setMessages((prev) => {
      const messageExists = prev.some((msg) => msg.id === newMessage.id);

      switch (eventType) {
        case "INSERT":
          return messageExists ? prev : [...prev, newMessage];
        case "UPDATE":
          return prev.map((m) => (m.id === newMessage.id ? newMessage : m));
        case "DELETE":
          return prev.filter((m) => m.id !== newMessage.id);
        default:
          return prev;
      }
    });
  };

  // Reset fetched state when contact changes
  useEffect(() => {
    hasFetched.current = false;
  }, [selectedContact]);

  const handleSendMessage = async () => {
    try {
      const messageData = {
        sender_id: user.id,
        receiver_id: selectedContact.user_id,
        content: newMessage,
      };
      setNewMessage("");
      await supabase.from("messages").insert(messageData);
    } catch (err) {
      console.error("Message send error:", err);
      setError("Failed to send message");
    }
  };
  if (authLoading || !user) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="message-management-container standalone-page">
      {error && (
        <Alert variant="danger" className="mt-4">
          {error}
          <Button variant="link" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/homepage-management")}
            className="me-2"
          >
            ← Back to Homepage
          </Button>
          <h2 className="page-title">Messages</h2>
        </div>
        <Button
          variant="primary"
          onClick={() => setModalConfig({ show: true })}
        >
          + New Message
        </Button>
      </div>

      {selectedContact ? (
        <Card className="chatbox">
          <Card.Body>
            <h5>Chat with {selectedContact.username}</h5>
            <div
              className="message-area"
              style={{
                height: "400px",
                overflowY: "auto",
                marginBottom: "1rem",
              }}
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
                <Button variant="primary" type="submit">
                  Send
                </Button>
              </InputGroup>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <h4>Select a contact to start chatting</h4>
            <Button
              variant="outline-primary"
              onClick={() => setModalConfig({ show: true })}
            >
              Start a Conversation
            </Button>
          </Card.Body>
        </Card>
      )}

      <MessageFormModal
        show={modalConfig.show}
        onClose={() => setModalConfig({ show: false })}
        onSelectContact={(contact) => {
          setSelectedContact(contact);
          setModalConfig({ show: false });
        }}
        userId={user.id}
      />
    </Container>
  );
}

export default MessageManagement;
