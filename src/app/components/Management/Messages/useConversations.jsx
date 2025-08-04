import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../services/supabaseClient";

export const useConversations = (user, authLoading, selectedConversation) => {
  const [conversations, setConversations] = useState([]);
  const [visibilityMap, setVisibilityMap] = useState({});
  const [userNames, setUserNames] = useState({});
  const [unreadMap, setUnreadMap] = useState({});
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

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
      setError(err.message);
    }
  };

  const fetchData = async () => {
    try {
      const { data: convData, error: convError } = await supabase
        .from("conversation_participants")
        .select("conversation_id, conversations!inner(id, created_at, name)")
        .eq("user_id", user.id)
        .order("created_at", { foreignTable: "conversations", ascending: false });

      if (convError) throw new Error("Failed to load conversations");

      const conversationIds = convData.map((c) => c.conversation_id);
      setConversations(convData.map((c) => c.conversations));

      await fetchVisibility();

      const { data: usernameData, error: usernameError } = await supabase
        .from("conversation_participants")
        .select(`conversation_id, profiles!inner(username)`)
        .in("conversation_id", conversationIds)
        .neq("user_id", user.id);

      if (usernameError) throw new Error("Failed to load usernames");

      const convNamesMap = {};
      usernameData.forEach(({ conversation_id, profiles }) => {
        if (!convNamesMap[conversation_id]) convNamesMap[conversation_id] = [];
        convNamesMap[conversation_id].push(profiles.username || "Unknown User");
      });
      setUserNames(convNamesMap);

      const { data: messagesData, error: msgError } = await supabase
        .from("messages")
        .select("conversation_id, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });

      const { data: readsData, error: readsError } = await supabase
        .from("conversation_reads")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id)
        .in("conversation_id", conversationIds);

      if (msgError || readsError) throw new Error("Failed to load unread data");

      const latestMessages = {};
      messagesData.forEach((msg) => {
        if (!latestMessages[msg.conversation_id]) {
          latestMessages[msg.conversation_id] = msg.created_at;
        }
      });

      const newUnreadMap = {};
      conversationIds.forEach((id) => {
        const latestMessageAt = latestMessages[id];
        const readData = readsData.find((r) => r.conversation_id === id);
        const lastReadAt = readData?.last_read_at;
        newUnreadMap[id] = latestMessageAt && (!lastReadAt || latestMessageAt > lastReadAt);
      });
      setUnreadMap(newUnreadMap);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleHideConversation = async (conversationId) => {
    try {
      setVisibilityMap((prev) => ({ ...prev, [conversationId]: false }));
      await supabase.from("conversation_visibility").upsert({
        user_id: user.id,
        conversation_id: conversationId,
        is_visible: false,
      });
    } catch (err) {
      console.error("Error hiding conversation:", err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user || conversations.length === 0) return;

    const channel = supabase
      .channel("conversation_participants")
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "conversation_participants",
          filter: `conversation_id=in.(${conversations
            .map((c) => c.id)
            .join(",")})`,
        },
        async (payload) => {
          const conversationId = payload.old.conversation_id;

          if (payload.old.user_id === user.id) {
            await fetchData();
            setVisibilityMap((prev) => ({
              ...prev,
              [conversationId]: false,
            }));
            await supabase.from("conversation_visibility").upsert({
              user_id: user.id,
              conversation_id: conversationId,
              is_visible: false,
            });
          } else {
            const { data: usernameData, error: usernameError } = await supabase
              .from("conversation_participants")
              .select(`conversation_id, profiles!inner(username)`)
              .eq("conversation_id", conversationId)
              .neq("user_id", user.id);

            if (usernameError) {
              setError("Failed to update participant usernames");
              return;
            }

            const updatedUsernames = usernameData.map(
              (item) => item.profiles.username || "Unknown User"
            );
            setUserNames((prev) => ({
              ...prev,
              [conversationId]: updatedUsernames,
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_participants",
          filter: `conversation_id=in.(${conversations
            .map((c) => c.id)
            .join(",")})`,
        },
        async (payload) => {
          const conversationId = payload.new.conversation_id;

          const { data: participantData, error: participantError } =
            await supabase
              .from("conversation_participants")
              .select(`conversation_id, profiles!inner(username)`)
              .eq("conversation_id", conversationId)
              .neq("user_id", user.id);

          if (participantError) {
            setError("Failed to update participant usernames");
            return;
          }

          const updatedUsernames = participantData.map(
            (item) => item.profiles.username || "Unknown User"
          );
          setUserNames((prev) => ({
            ...prev,
            [conversationId]: updatedUsernames,
          }));
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
  }, [authLoading, user, conversations, setError]);

  useEffect(() => {
    if (authLoading || !user || conversations.length === 0) return;

    const channel = supabase
      .channel("messages_unread")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=in.(${conversations.map((c) => c.id).join(",")})`,
        },
        async (payload) => {
          const newMessage = payload.new;
          if (newMessage.sender_id === user.id) return;
          if (newMessage.conversation_id === selectedConversation?.id) return;

          const { data: readData, error } = await supabase
            .from("conversation_reads")
            .select("last_read_at")
            .eq("user_id", user.id)
            .eq("conversation_id", newMessage.conversation_id)
            .single();

          if (error) {
            console.error("Error fetching last_read_at:", error);
            return;
          }

          const lastReadAt = readData?.last_read_at;
          if (!lastReadAt || newMessage.created_at > lastReadAt) {
            setUnreadMap((prev) => ({ ...prev, [newMessage.conversation_id]: true }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authLoading, user, conversations, selectedConversation]);

  useEffect(() => {
    if (authLoading || !user) return;

    const channel = supabase
      .channel("conversation_reads_unread")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_reads",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const updatedRead = payload.new;
          const conversationId = updatedRead.conversation_id;

          const { data: latestMessage, error } = await supabase
            .from("messages")
            .select("created_at")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (error) {
            console.error("Error fetching latest message:", error);
            return;
          }

          const latestMessageAt = latestMessage?.created_at;
          if (latestMessageAt && updatedRead.last_read_at >= latestMessageAt) {
            setUnreadMap((prev) => ({ ...prev, [conversationId]: false }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authLoading, user]);

  return {
    conversations,
    setConversations,
    visibilityMap,
    setVisibilityMap,
    userNames,
    setUserNames,
    unreadMap,
    setUnreadMap,
    error,
    setError,
    handleHideConversation,
    fetchData,
  };
};