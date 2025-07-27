// useMessages.js: Custom hook to manage messages for the selected conversation
// and handle Supabase Realtime subscriptions for new messages. Fetches messages
// when a conversation is selected and updates messages, unread counts, and visibility
// in real-time. Used by MessageManagement.jsx to populate ChatArea.

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../services/supabaseClient";

export const useMessages = (
  user,
  selectedConversation,
  conversations,
  visibilityMap,
  setVisibilityMap,
  setUnreadCounts,
  setError
) => {
  // State for messages in the selected conversation
  const [messages, setMessages] = useState([]);
  // Ref to store the Supabase Realtime channel for cleanup
  const channelRef = useRef(null);

  // Fetch messages for the selected conversation and reset unread count
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        // Query messages for the selected conversation
        const { data, error } = await supabase
          .from("messages")
          .select("id, sender_id, sender_username, content, created_at")
          .eq("conversation_id", selectedConversation.id)
          .order("created_at", { ascending: true });

        if (error) throw new Error("Failed to load messages");
        setMessages(data || []);

        // Reset unread count for the conversation
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
  }, [selectedConversation, user, setUnreadCounts, setError]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user || conversations.length === 0) return;

    // Subscribe to INSERT events on messages table for user’s conversations
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
            .join(",")})`, // Filter to user’s conversations
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

          // Add new message to selected conversation
          setMessages((prev) => {
            if (conversationId === selectedConversation?.id) {
              if (prev.some((m) => m.id === payload.new.id)) return prev; // Avoid duplicates
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
              // Update unread count in Supabase asynchronously
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
    // Cleanup subscription on unmount to prevent memory leaks
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [
    conversations,
    selectedConversation,
    user,
    visibilityMap,
    setVisibilityMap,
    setUnreadCounts,
    setError,
  ]);

  // Return messages state for use in ChatArea
  return { messages, setMessages };
};
