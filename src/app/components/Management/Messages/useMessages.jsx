import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../services/supabaseClient";

export const useMessages = (
  user,
  selectedConversation,
  conversations,
  visibilityMap,
  setVisibilityMap,
  setError
) => {
  const [messages, setMessages] = useState([]);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("id, sender_id, sender_username, content, created_at")
          .eq("conversation_id", selectedConversation.id)
          .order("created_at", { ascending: true });

        if (error) throw new Error("Failed to load messages");
        setMessages(data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMessages();
  }, [selectedConversation, user, setError]);

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
  }, [
    conversations,
    selectedConversation,
    user,
    visibilityMap,
    setVisibilityMap,
    setError,
  ]);

  return { messages, setMessages };
};
