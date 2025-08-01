import { useState } from "react";
import { supabase } from "../../../services/supabaseClient";

export const useMessageActions = (user, selectedConversation, setError) => {
  // State for the new message input field
  const [newMessage, setNewMessage] = useState("");

  // Send a new message to the selected conversation
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return; // Skip if input is empty or no conversation selected
    try {
      // Fetch current user’s username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .single();
      if (profileError) throw new Error("Failed to fetch user profile");

      // Insert new message into Supabase
      await supabase.from("messages").upsert({
        sender_id: user.id,
        sender_username: profileData.username || "Unknown User",
        conversation_id: selectedConversation.id,
        content: newMessage.trim(),
      });
      setNewMessage(""); // Clear input field
    } catch (err) {
      setError("Failed to send message");
    }
  };

  // Return message input state and send function
  return { newMessage, setNewMessage, handleSendMessage };
};
