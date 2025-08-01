import { useState, useEffect } from "react";
import { Container, Spinner, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth";
import { useConversations } from "./useConversations";
import { useMessages } from "./useMessages";
import { useMessageActions } from "./useMessageActions";
import MessageFormModal from "./MessageFormModal";
import ConversationList from "./ConversationList";
import ChatArea from "./Chat";
import "./messages.css";

function MessageManagement() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [modalConfig, setModalConfig] = useState({ show: false });
  const [hoveredConversation, setHoveredConversation] = useState(null);

  const {
    conversations,
    visibilityMap,
    setVisibilityMap,
    userNames,
    error,
    setError,
    handleHideConversation,
    fetchData,
    unreadMap,
    markConversationAsRead,
  } = useConversations(user, authLoading);

  const { messages, setMessages } = useMessages(
    user,
    selectedConversation,
    conversations,
    visibilityMap,
    setVisibilityMap,
    setError,
    markConversationAsRead
  );

  const { newMessage, setNewMessage, handleSendMessage } = useMessageActions(
    user,
    selectedConversation,
    setError
  );

  const handleNewConversation = async (conversation) => {
    await fetchData();
    setSelectedConversation(conversation);
  };

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      markConversationAsRead(selectedConversation.id);
    }
  }, [selectedConversation, markConversationAsRead]);

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

  return (
    <Container fluid className="message-management-container">
      {error && (
        <Alert variant="danger">
          {error}{" "}
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
      <div className="d-flex">
        <ConversationList
          conversations={conversations.filter(
            (conv) => visibilityMap[conv.id] !== false
          )}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          user={user}
          userNames={userNames}
          hoveredConversation={hoveredConversation}
          setHoveredConversation={setHoveredConversation}
          handleHideConversation={handleHideConversation}
          unreadMap={unreadMap}
        />
        <div className="chat-area-wrapper">
          <ChatArea
            selectedConversation={selectedConversation}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            user={user}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>
      <MessageFormModal
        show={modalConfig.show}
        onClose={() => setModalConfig({ show: false })}
        onSelectConversation={handleNewConversation}
        userId={user.id}
      />
    </Container>
  );
}

export default MessageManagement;
