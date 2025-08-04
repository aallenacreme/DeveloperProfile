import { useState, useRef, useEffect } from "react";
import { Container, Spinner, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth";
import { useConversations } from "./useConversations";
import { useMessages } from "./useMessages";
import { useMessageActions } from "./useMessageActions";
import { supabase } from "../../../services/supabaseClient";
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
  const prevConversationRef = useRef(null);

  const {
    conversations,
    visibilityMap,
    setVisibilityMap,
    userNames,
    unreadMap,
    setUnreadMap,
    error,
    setError,
    handleHideConversation,
    fetchData,
  } = useConversations(user, authLoading, selectedConversation);

  const { messages, setMessages } = useMessages(
    user,
    selectedConversation,
    conversations,
    visibilityMap,
    setVisibilityMap,
    setError
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

  const updateLastReadAt = async (conversationId) => {
    try {
      await supabase.from("conversation_reads").upsert({
        user_id: user.id,
        conversation_id: conversationId,
        last_read_at: new Date().toISOString(),
      });
      setUnreadMap((prev) => ({ ...prev, [conversationId]: false }));
    } catch (err) {
      console.error("Error updating last_read_at:", err);
      setError("Failed to update read status");
    }
  };

  useEffect(() => {
    if (!selectedConversation) return;

    const handleSwitch = async () => {
      // Update new conversation
      await updateLastReadAt(selectedConversation.id);

      // Check previous conversation
      if (prevConversationRef.current && prevConversationRef.current !== selectedConversation.id) {
        const { data: latestMessage, error: msgError } = await supabase
          .from("messages")
          .select("created_at")
          .eq("conversation_id", prevConversationRef.current)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const { data: readData, error: readError } = await supabase
          .from("conversation_reads")
          .select("last_read_at")
          .eq("user_id", user.id)
          .eq("conversation_id", prevConversationRef.current)
          .single();

        if (!msgError && !readError && latestMessage && readData?.last_read_at < latestMessage.created_at) {
          await updateLastReadAt(prevConversationRef.current);
        }
      }

      prevConversationRef.current = selectedConversation.id;
    };

    handleSwitch();
  }, [selectedConversation]);

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
          unreadMap={unreadMap}
          hoveredConversation={hoveredConversation}
          setHoveredConversation={setHoveredConversation}
          handleHideConversation={handleHideConversation}
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