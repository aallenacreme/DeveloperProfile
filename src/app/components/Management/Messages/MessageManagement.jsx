import { useState, useEffect } from "react";
import { Container, Spinner, Alert, Button } from "react-bootstrap";
import { supabase } from "../../../services/supabaseClient";
import { useAuth } from "../../../auth";
import { useNavigate } from "react-router-dom";
import MessageFormModal from "./MessageFormModal";
import ConversationList from "./ConversationList";
import ChatArea from "./Chat";
import "./messages.css";

// Main component for managing user messages and conversations
function MessageManagement() {
  // Get user data and authentication loading state; set up navigation
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State for storing conversations, selected chat, messages, and UI controls
  const [conversations, setConversations] = useState([]); // List of user conversations
  const [selectedConversation, setSelectedConversation] = useState(null); // Currently selected conversation
  const [messages, setMessages] = useState([]); // Messages in the selected conversation
  const [newMessage, setNewMessage] = useState(""); // Text for a new message
  const [error, setError] = useState(null); // Error messages for UI display
  const [modalConfig, setModalConfig] = useState({ show: false }); // Controls new message modal
  const [userNames, setUserNames] = useState({}); // Maps conversation IDs to participant usernames
  const [unreadCounts, setUnreadCounts] = useState({}); // Tracks unread message counts per conversation
  const [visibilityMap, setVisibilityMap] = useState({}); // Tracks which conversations are visible
  const [hoveredConversation, setHoveredConversation] = useState(null); // Tracks hovered conversation for UI effects

  // Fetches visibility status of conversations for the user
  const fetchVisibility = async () => {
    const { data, error } = await supabase
      .from("conversation_visibility")
      .select("conversation_id, is_visible")
      .eq("user_id", user.id);

    if (error) throw error;

    // Create a map of conversation IDs to their visibility status
    const newVisibilityMap = {};
    data.forEach((item) => {
      newVisibilityMap[item.conversation_id] = item.is_visible;
    });
    return newVisibilityMap;
  };

  // Fetches all conversations, participants, usernames, and unread message counts in parallel
  const fetchData = async () => {
    try {
      // Fetch conversations
      const conversationsPromise = supabase
        .from("conversation_participants")
        .select("conversation_id, conversations!inner(id, created_at, name)")
        .eq("user_id", user.id)
        .order("created_at", {
          foreignTable: "conversations",
          ascending: false,
        });

      // Fetch visibility
      const visibilityPromise = fetchVisibility();

      // Fetch usernames (dependent on conversation IDs)
      const conversationIdsPromise = conversationsPromise.then(({ data }) =>
        data ? data.map((c) => c.conversation_id) : []
      );
      const usernamePromise = conversationIdsPromise.then((conversationIds) =>
        supabase
          .from("conversation_participants")
          .select(
            `
            conversation_id,
            profiles!inner(username)
          `
          )
          .in("conversation_id", conversationIds)
          .neq("user_id", user.id)
      );

      // Fetch unread counts
      const unreadPromise = supabase
        .from("unread_messages")
        .select("conversation_id, count")
        .eq("user_id", user.id);

      // Execute all fetches in parallel
      const [
        { data: convData, error: convError },
        visibilityData,
        { data: usernameData, error: usernameError },
        { data: unreadData, error: unreadError },
      ] = await Promise.all([
        conversationsPromise,
        visibilityPromise,
        usernamePromise,
        unreadPromise,
      ]);

      if (convError) throw new Error("Failed to load conversations");
      if (usernameError) throw new Error("Failed to load usernames");
      if (unreadError) throw new Error("Failed to load unread counts");

      // Process conversations
      setConversations(convData.map((c) => c.conversations));

      // Process visibility
      setVisibilityMap(visibilityData);

      // Map conversation IDs to lists of participant usernames
      const convNamesMap = {};
      usernameData.forEach(({ conversation_id, profiles }) => {
        if (!convNamesMap[conversation_id]) {
          convNamesMap[conversation_id] = [];
        }
        convNamesMap[conversation_id].push(profiles.username || "Unknown User");
      });
      setUserNames(convNamesMap);

      // Create a map of conversation IDs to unread message counts
      const unreadMap = {};
      unreadData.forEach((item) => {
        unreadMap[item.conversation_id] = item.count || 0;
      });
      setUnreadCounts(unreadMap);
    } catch (err) {
      setError(err.message);
    }
  };

  // Hides a conversation by marking it invisible in the database
  const handleHideConversation = async (conversationId) => {
    try {
      // Update local visibility state
      setVisibilityMap((prev) => ({
        ...prev,
        [conversationId]: false,
      }));

      // Update visibility in the database
      await supabase.from("conversation_visibility").upsert({
        user_id: user.id,
        conversation_id: conversationId,
        is_visible: false,
      });

      // Clear selected conversation if it was hidden
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (err) {
      console.error("Error hiding conversation:", err.message);
    }
  };

  // Fetches conversation data when the user is authenticated
  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
  }, [authLoading, user]);

  // Fetches messages for the selected conversation and resets unread count
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        // Get all messages for the selected conversation
        const { data, error } = await supabase
          .from("messages")
          .select("id, sender_id, sender_username, content, created_at")
          .eq("conversation_id", selectedConversation.id)
          .order("created_at", { ascending: true });

        if (error) throw new Error("Failed to load messages");
        setMessages(data || []);

        // Reset unread message count for the conversation
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

  // Sets up real-time subscription for new messages
  useEffect(() => {
    if (!user || conversations.length === 0) return;

    // Subscribe to new messages in all user conversations
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

          // Unhide conversation if a new message arrives
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

          // Add new message to the selected conversation
          setMessages((prev) => {
            if (conversationId === selectedConversation?.id) {
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            }
            return prev;
          });

          // Update unread count for non-selected conversations
          if (
            conversationId !== selectedConversation?.id &&
            payload.new.sender_id !== user.id
          ) {
            setUnreadCounts((prev) => {
              const newCount = (prev[conversationId] || 0) + 1;
              supabase.from("unread_messages").upsert({
                user_id: user.id,
                conversation_id: conversationId,
                count: newCount,
              });
              return { ...prev, [conversationId]: newCount };
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversations, selectedConversation, user, visibilityMap]);

  // Sends a new message in the selected conversation
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      // Get the current user's username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .single();
      if (profileError) throw new Error("Failed to fetch user profile");

      // Insert the new message into the database
      await supabase.from("messages").upsert({
        sender_id: user.id,
        sender_username: profileData.username || "Unknown User",
        conversation_id: selectedConversation.id,
        content: newMessage.trim(),
      });
      setNewMessage(""); // Clear the message input
    } catch (err) {
      setError("Failed to send message");
    }
  };

  // Handles creation of a new conversation
  const handleNewConversation = async (conversation) => {
    await fetchData(); // Refresh conversation list
    setSelectedConversation(conversation); // Select the new conversation
  };

  // Show loading spinner while user authentication is in progress
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

  // Render the main messages UI
  return (
    <Container fluid className="message-management-container">
      {/* Display error messages with a dismiss button */}
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

      {/* Main layout with conversation list and chat area */}
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
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>

      {/* Modal for creating a new conversation */}
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