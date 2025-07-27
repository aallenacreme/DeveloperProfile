// MessageManagement.jsx: The main React component for the messaging feature.
// Renders the UI (conversation list, chat area, new message modal) and orchestrates
// custom hooks for managing conversations, messages, and actions. Coordinates data flow
// between Supabase, hooks, and child components, handling navigation and modal state.

import { useState } from "react";
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
  // Authentication state from useAuth hook
  const { user, loading: authLoading } = useAuth();
  // Navigation hook for redirecting to homepage
  const navigate = useNavigate();
  // State for the currently selected conversation
  const [selectedConversation, setSelectedConversation] = useState(null);
  // State for controlling the new message modal visibility
  const [modalConfig, setModalConfig] = useState({ show: false });
  // State for tracking which conversation is hovered (for UI effects like hide button)
  const [hoveredConversation, setHoveredConversation] = useState(null);

  // Fetch conversation-related data (conversations, visibility, usernames, unread counts)
  const {
    conversations,
    visibilityMap,
    setVisibilityMap,
    userNames,
    unreadCounts,
    setUnreadCounts,
    error,
    setError,
    handleHideConversation,
    fetchData,
  } = useConversations(user, authLoading);

  // Fetch messages and handle real-time updates for the selected conversation
  const { messages, setMessages } = useMessages(
    user,
    selectedConversation,
    conversations,
    visibilityMap,
    setVisibilityMap,
    setUnreadCounts,
    setError
  );

  // Manage message sending and input state
  const { newMessage, setNewMessage, handleSendMessage } = useMessageActions(
    user,
    selectedConversation,
    setError
  );

  // Handle new conversation creation: refresh conversations and select the new one
  const handleNewConversation = async (conversation) => {
    await fetchData(); // Refresh conversation list
    setSelectedConversation(conversation); // Set new conversation as active
  };

  // Show loading spinner while authenticating
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
      {/* Display error messages with dismiss button */}
      {error && (
        <Alert variant="danger">
          {error}{" "}
          <Button variant="link" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </Alert>
      )}
      {/* Header with back button and new message button */}
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
      {/* Main layout: conversation list and chat area */}
      <div className="d-flex">
        <ConversationList
          conversations={conversations.filter(
            (conv) => visibilityMap[conv.id] !== false // Filter out hidden conversations
          )}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation} // Update selected conversation
          user={user}
          userNames={userNames}
          unreadCounts={unreadCounts}
          hoveredConversation={hoveredConversation}
          setHoveredConversation={setHoveredConversation}
          handleHideConversation={handleHideConversation} // Hide conversation on button click
        />
        <div className="chat-area-wrapper">
          <ChatArea
            selectedConversation={selectedConversation}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            user={user}
            handleSendMessage={handleSendMessage} // Send new message
          />
        </div>
      </div>
      {/* Modal for creating new conversations */}
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
