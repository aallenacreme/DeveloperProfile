import { useState, useEffect, useRef } from "react";
import { Container, Spinner, Alert, Button } from "react-bootstrap";
import { supabase } from "../../../services/supabaseClient";
import { useAuth } from "../../../auth";
import { useNavigate } from "react-router-dom";
import MessageFormModal from "./MessageFormModal";
import ConversationList from "./ConversationList";
import ChatArea from "./Chat";

function MessageManagement() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const channelRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const [modalConfig, setModalConfig] = useState({ show: false });
  const [userNames, setUserNames] = useState({});

  const fetchData = async () => {
    try {
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("id, participant1, participant2, created_at")
        .or(`participant1.eq.${user.id},participant2.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (convError) throw new Error("Failed to load conversations");
      setConversations(convData || []);

      const participantIds = new Set();
      convData.forEach((conv) => {
        participantIds.add(conv.participant1);
        participantIds.add(conv.participant2);
      });
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", Array.from(participantIds));
      if (userError) throw new Error("Failed to load usernames");

      const namesMap = {};
      userData.forEach((u) => {
        namesMap[u.user_id] = u.username;
      });
      setUserNames(namesMap);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
  }, [authLoading, user]);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("id, sender_id, content, created_at")
          .eq("conversation_id", selectedConversation.id)
          .order("created_at", { ascending: true });
        if (error) throw new Error("Failed to load messages");
        setMessages(data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  useEffect(() => {
    if (!user || !selectedConversation || channelRef.current) return;

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [selectedConversation, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      await supabase.from("messages").insert({
        sender_id: user.id,
        conversation_id: selectedConversation.id,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (err) {
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
          conversations={conversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          user={user}
          userNames={userNames}
        />
        <div style={{ flex: 1, paddingLeft: "1rem" }}>
          <ChatArea
            selectedConversation={selectedConversation}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            user={user}
            userNames={userNames}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>

      <MessageFormModal
        show={modalConfig.show}
        onClose={() => setModalConfig({ show: false })}
        onSelectConversation={async (conversation) => {
          await fetchData();
          setSelectedConversation(conversation);
          setModalConfig({ show: false });
        }}
        userId={user.id}
        conversations={conversations}
      />
    </Container>
  );
}

export default MessageManagement;
