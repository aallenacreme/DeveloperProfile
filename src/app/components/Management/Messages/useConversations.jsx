import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../services/supabaseClient";

export const useConversations = (user, authLoading) => {
  const [conversations, setConversations] = useState([]);
  const [visibilityMap, setVisibilityMap] = useState({});
  const [userNames, setUserNames] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
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
        .order("created_at", {
          foreignTable: "conversations",
          ascending: false,
        });

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
        if (!convNamesMap[conversation_id]) {
          convNamesMap[conversation_id] = [];
        }
        convNamesMap[conversation_id].push(profiles.username || "Unknown User");
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

          // Update participant usernames and roles for the conversation
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

  return {
    conversations,
    setConversations,
    visibilityMap,
    setVisibilityMap,
    userNames,
    setUserNames,
    unreadCounts,
    setUnreadCounts,
    error,
    setError,
    handleHideConversation,
    fetchData,
  };
};
