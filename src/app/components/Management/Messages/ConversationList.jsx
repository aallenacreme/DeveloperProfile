import React from "react";

// Sidebar component to list conversations
function ConversationList({
  conversations,
  selectedConversation,
  setSelectedConversation,
  user,
  userNames,
}) {
  return (
    <div
      style={{ width: "300px", borderRight: "1px solid #ccc", padding: "1rem" }}
    >
      <h5>Conversations</h5>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {conversations.map((conv) => {
          const otherId =
            conv.participant1 === user.id
              ? conv.participant2
              : conv.participant1;
          return (
            <li
              key={conv.id}
              style={{
                padding: "0.5rem",
                background:
                  selectedConversation?.id === conv.id
                    ? "#e9ecef"
                    : "transparent",
                cursor: "pointer",
              }}
              onClick={() => setSelectedConversation(conv)}
            >
              👤 {userNames[otherId] || otherId}
              <div style={{ fontSize: "0.8rem", color: "#666" }}>
                {new Date(conv.created_at).toLocaleString()}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ConversationList;
