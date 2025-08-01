import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../services/supabaseClient";

export const useConversations = (user, authLoading) => {
  const [conversations, setConversations] = useState([]);
  const [visibilityMap, setVisibilityMap] = useState({});
  const [userNames, setUserNames] = useState({});
  const [error, setError] = useState(null);
  const [unreadMap, setUnreadMap] = useState({});
  const channelRef = useRef(null);

  const calculateUnreadStatus = (conversation) => {
    if (!conversation.latest_message) return false;
    if (!conversation.last_read_at) return true;
    return (
      new Date(conversation.latest_message.created_at) >
      new Date(conversation.last_read_at)
    );
  };

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
        .order("created_at", {
          foreignTable: "conversations",
          ascending: false,
        });

      if (convError) throw new Error("Failed to load conversations");

      const conversationIds = convData.map((c) => c.conversation_id);
      const conversationsList = convData.map((c) => c.conversations);

      // Fetch last read timestamps
      const { data: readData } = await supabase
        .from("conversation_reads")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id);

      const readMap =
        readData?.reduce(
          (acc, item) => ({
            ...acc,
            [item.conversation_id]: item.last_read_at,
          }),
          {}
        ) || {};

      // Fetch latest messages for each conversation
      const { data: latestMessages } = await supabase
        .from("messages")
        .select("conversation_id, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });

      const latestMap =
        latestMessages?.reduce((acc, message) => {
          if (!acc[message.conversation_id]) {
            acc[message.conversation_id] = message.created_at;
          }
          return acc;
        }, {}) || {};

      // Build conversations with unread status
      const conversationsWithUnread = conversationsList.map((conv) => {
        return {
          ...conv,
          latest_message: { created_at: latestMap[conv.id] },
          last_read_at: readMap[conv.id] || null,
          is_unread: calculateUnreadStatus({
            latest_message: { created_at: latestMap[conv.id] },
            last_read_at: readMap[conv.id],
          }),
        };
      });

      setConversations(conversationsWithUnread);

      // Initialize unread map
      const initialUnreadMap = {};
      conversationsWithUnread.forEach((conv) => {
        initialUnreadMap[conv.id] = conv.is_unread;
      });
      setUnreadMap(initialUnreadMap);

      await fetchVisibility();

      const { data: usernameData, error: usernameError } = await supabase
        .from("conversation_participants")
        .select(`conversation_id, profiles!inner(username)`)
        .in("conversation_id", conversationIds)
        .neq("user_id", user.id);

      if (usernameError) throw new Error("Failed to load usernames");

      const convNamesMap = {};
      usernameData.forEach(({ conversation_id, profiles }) => {
        if (!convNamesMap[conversation_id]) {
          convNamesMap[conversation_id] = [];
        }
        convNamesMap[conversation_id].push(profiles.username || "Unknown User");
      });
      setUserNames(convNamesMap);
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
    } catch (err) {
      console.error("Error hiding conversation:", err.message);
      setError(err.message);
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      await supabase.from("conversation_reads").upsert({
        user_id: user.id,
        conversation_id: conversationId,
        last_read_at: new Date().toISOString(),
      });

      setUnreadMap((prev) => ({ ...prev, [conversationId]: false }));

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                last_read_at: new Date().toISOString(),
                is_unread: false,
              }
            : conv
        )
      );
    } catch (err) {
      setError("Failed to mark as read");
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
          const newMessage = payload.new;

          if (newMessage.sender_id === user.id) return;

          const conversation = conversations.find(
            (c) => c.id === newMessage.conversation_id
          );
          const isUnread =
            new Date(newMessage.created_at) >
            new Date(conversation.last_read_at || 0);

          if (isUnread) {
            setUnreadMap((prev) => ({
              ...prev,
              [newMessage.conversation_id]: true,
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_reads",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const { conversation_id, last_read_at } = payload.new;
          const conversation = conversations.find(
            (c) => c.id === conversation_id
          );

          if (
            conversation.latest_message &&
            new Date(last_read_at) >=
              new Date(conversation.latest_message.created_at)
          ) {
            setUnreadMap((prev) => ({ ...prev, [conversation_id]: false }));
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
  }, [authLoading, user, conversations, setError]);

  return {
    conversations,
    setConversations,
    visibilityMap,
    setVisibilityMap,
    userNames,
    setUserNames,
    error,
    setError,
    handleHideConversation,
    fetchData,
    unreadMap,
    markConversationAsRead,
  };
};
