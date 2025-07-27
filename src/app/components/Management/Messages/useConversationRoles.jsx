import { useState, useEffect } from "react";
import { supabase } from "../../../services/supabaseClient";

export function useConversationRoles(user, selectedConversation) {
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id || !selectedConversation?.id) return;

    const fetchUserRole = async () => {
      try {
        setError(null);
        const { data, error } = await supabase
          .from("conversation_participants")
          .select("role")
          .eq("conversation_id", selectedConversation.id)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setUserRole(data?.role || "member");
      } catch (err) {
        console.error("Error fetching user role:", err.message);
        setError(`Failed to load user role: ${err.message}`);
      }
    };

    fetchUserRole();
  }, [user?.id, selectedConversation?.id]);

  const isAdmin = () => {
    return userRole === "admin";
  };

  const isAdminOrModerator = () => {
    return userRole === "admin" || userRole === "moderator";
  };

  const removeParticipant = async (participantUserId) => {
    if (!isAdminOrModerator()) {
      setError("You do not have permission to remove participants");
      return false;
    }

    try {
      setError(null);

      const { error: participantError } = await supabase
        .from("conversation_participants")
        .delete()
        .eq("conversation_id", selectedConversation.id)
        .eq("user_id", participantUserId);

      if (participantError) throw participantError;

      const { error: visibilityError } = await supabase
        .from("conversation_visibility")
        .delete()
        .eq("conversation_id", selectedConversation.id)
        .eq("user_id", participantUserId);

      if (visibilityError) throw visibilityError;

      return true;
    } catch (err) {
      console.error("Error removing participant:", err.message);
      setError(`Failed to remove participant: ${err.message}`);
      return false;
    }
  };

  const updateRole = async (participantUserId, newRole) => {
    if (!isAdminOrModerator()) {
      setError("You do not have permission to change roles");
      return false;
    }

    if (!["moderator", "member"].includes(newRole)) {
      setError("Invalid role");
      return false;
    }

    try {
      setError(null);
      const { error } = await supabase
        .from("conversation_participants")
        .update({ role: newRole })
        .eq("conversation_id", selectedConversation.id)
        .eq("user_id", participantUserId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error updating role:", err.message);
      setError(`Failed to update role: ${err.message}`);
      return false;
    }
  };

  return {
    userRole,
    isAdmin,
    isAdminOrModerator,
    removeParticipant,
    updateRole,
    error,
    setError,
  };
}
