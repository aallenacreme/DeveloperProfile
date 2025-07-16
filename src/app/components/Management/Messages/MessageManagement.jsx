import { useState, useEffect, useRef } from "react";
import { Container, Spinner, Alert, Button } from "react-bootstrap";
import { supabase } from "../../../services/supabaseClient";
import { useAuth } from "../../../auth";
import { useNavigate } from "react-router-dom";
import MessageFormModal from "./MessageFormModal";
import ConversationList from "./ConversationList";
import ChatArea from "./Chat";
import "./messages.css";

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
  const [unreadCounts, setUnreadCounts] = useState({});
  const [visibilityMap, setVisibilityMap] = useState({});
  const [hoveredConversation, setHoveredConversation] = useState(null);

  const fetchVisibility = async () => {
    try {
      const { data, error } = await supabase
        .from("conversation_visibility")
        .select("conversation_id, is_visible")
        .eq("user_id", user.id);

      if (error) throw error;

      const newVisibilityMap = {};
      data.forEach((item) => {
        newVisibilityMap[item.conversation_id] = item.is_visible;
      });
      setVisibilityMap(newVisibilityMap);
    } catch (err) {
      console.error("Error fetching visibility:", err.message);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch conversations where user is a participant
      const { data: convData, error: convError } = await supabase
        .from("conversation_participants")
        .select("conversation_id, conversations!inner(id, created_at, name)")
        .eq("user_id", user.id)
        .order("created_at", {
          foreignTable: "conversations",
          ascending: false,
        });

      if (convError) throw new Error("Failed to load conversations");

      const conversationIds = convData.map((c) => c.conversation_id);
      setConversations(
        convData.map((c) => c.conversations).filter((c) => c) || []
      );

      await fetchVisibility();

      // Fetch all participants for each conversation
      const { data: participantData, error: participantError } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", conversationIds);

      if (participantError) throw new Error("Failed to load participants");

      const participantIds = [
        ...new Set(participantData.map((p) => p.user_id)),
      ];

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", participantIds);

      if (userError) throw new Error("Failed to load usernames");

      const namesMap = {};
      userData.forEach((u) => {
        namesMap[u.user_id] = u.username;
      });

      // Map conversation_id to array of participant usernames (excluding current user)
      const convNamesMap = {};
      participantData.forEach((p) => {
        if (!convNamesMap[p.conversation_id]) {
          convNamesMap[p.conversation_id] = [];
        }
        if (p.user_id !== user.id) {
          convNamesMap[p.conversation_id].push(
            namesMap[p.user_id] || p.user_id
          );
        }
      });
      setUserNames(convNamesMap);

      const { data: unreadData, error: unreadError } = await supabase
        .from("unread_messages")
        .select("conversation_id, count")
        .eq("user_id", user.id);

      if (unreadError) throw new Error("Failed to load unread counts");

      const unreadMap = {};
      unreadData.forEach((item) => {
        unreadMap[item.conversation_id] = item.count || 0;
      });
      setUnreadCounts(unreadMap);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleHideConversation = async (conversationId) => {
    try {
      setVisibilityMap((prev) => ({
        ...prev,
        [conversationId]: false,
      }));

      await supabase.from("conversation_visibility").upsert({
        user_id: user.id,
        conversation_id: conversationId,
        is_visible: false,
      });

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (err) {
      console.error("Error hiding conversation:", err.message);
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

        await supabase.from("unread_messages").upsert({
          user_id: user.id,
          conversation_id: selectedConversation.id,
          count: 0,
        });
        setUnreadCounts((prev) => ({
          ...prev,
          [selectedConversation.id]: 0,
        }));
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMessages();
  }, [selectedConversation, user]);

  useEffect(() => {
    if (!user || conversations.length === 0) return;

    const channel = supabase
      .channel("messages_all")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=in.(${conversations
            .map((c) => c.id)
            .join(",")})`,
        },
        async (payload) => {
          const conversationId = payload.new.conversation_id;

          if (visibilityMap[conversationId] === false) {
            setVisibilityMap((prev) => ({
              ...prev,
              [conversationId]: true,
            }));

            await supabase.from("conversation_visibility").upsert({
              user_id: user.id,
              conversation_id: conversationId,
              is_visible: true,
            });
          }

          setMessages((prev) => {
            if (conversationId === selectedConversation?.id) {
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            }
            return prev;
          });

          if (
            conversationId !== selectedConversation?.id &&
            payload.new.sender_id !== user.id
          ) {
            setUnreadCounts((prev) => {
              const newCount = (prev[conversationId] || 0) + 1;
              (async () => {
                try {
                  await supabase.from("unread_messages").upsert({
                    user_id: user.id,
                    conversation_id: conversationId,
                    count: newCount,
                  });
                } catch (err) {
                  setError("Failed to update unread count");
                }
              })();
              return { ...prev, [conversationId]: newCount };
            });
          }
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
  }, [conversations, selectedConversation, user, visibilityMap]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      await supabase.from("messages").upsert({
        sender_id: user.id,
        conversation_id: selectedConversation.id,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (err) {
      setError("Failed to send message");
    }
  };

  const handleNewConversation = async (conversation) => {
    await fetchData();
    setSelectedConversation(conversation);
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
          conversations={conversations.filter(
            (conv) => visibilityMap[conv.id] !== false
          )}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          user={user}
          userNames={userNames}
          unreadCounts={unreadCounts}
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
            userNames={userNames}
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
