import { useState } from "react";
import { supabase } from "../../../services/supabaseClient";

export const useMessageActions = (user, selectedConversation, setError) => {
  // State for the new message input field
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .single();
      if (profileError) throw new Error("Failed to fetch user profile");

      // Insert message and get the created_at
      const { data: insertedMessage, error: insertError } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          sender_username: profileData.username || "Unknown User",
          conversation_id: selectedConversation.id,
          content: newMessage.trim(),
        })
        .select("created_at") // fetch the timestamp
        .single();

      if (insertError) throw new Error("Failed to send message");

      // Use the exact created_at for the read time (or slightly after)
      await supabase.from("conversation_reads").upsert({
        user_id: user.id,
        conversation_id: selectedConversation.id,
        last_read_at: insertedMessage.created_at,
      });

      setNewMessage("");
    } catch (err) {
      console.error(err);
      setError("Failed to send message");
    }
  };

  // Return message input state and send function
  return { newMessage, setNewMessage, handleSendMessage };
};
