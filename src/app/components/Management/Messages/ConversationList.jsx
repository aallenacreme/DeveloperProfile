import React from "react";
import { Button } from "react-bootstrap";

function ConversationList({
  conversations,
  selectedConversation,
  setSelectedConversation,
  user,
  userNames,
  unreadCounts,
  hoveredConversation,
  setHoveredConversation,
  handleHideConversation,
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
          const unreadCount = unreadCounts[conv.id] || 0;
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
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
              }}
              onClick={() => setSelectedConversation(conv)}
              onMouseEnter={() => setHoveredConversation(conv.id)}
              onMouseLeave={() => setHoveredConversation(null)}
            >
              <div>
                👤 {userNames[otherId] || otherId}
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  {new Date(conv.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: "blue",
                      borderRadius: "50%",
                      width: "10px",
                      height: "10px",
                      display: "inline-block",
                      marginRight: "8px",
                    }}
                  />
                )}
                {hoveredConversation === conv.id && (
                  <Button
                    variant="link"
                    style={{
                      color: "red",
                      padding: "0 4px",
                      fontSize: "0.8rem",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHideConversation(conv.id);
                    }}
                  >
                    ×
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ConversationList;
