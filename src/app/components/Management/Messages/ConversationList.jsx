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
    <div className="conversation-list-container">
      <h5>Conversations</h5>
      <ul className="conversation-list">
        {conversations.map((conv) => {
          const displayName =
            conv.name ||
            (userNames[conv.id]?.length
              ? userNames[conv.id].join(", ")
              : "Group Chat");
          const unreadCount = unreadCounts[conv.id] || 0;
          return (
            <li
              key={conv.id}
              className={`conversation-item ${
                selectedConversation?.id === conv.id ? "selected" : ""
              }`}
              onClick={() => setSelectedConversation(conv)}
              onMouseEnter={() => setHoveredConversation(conv.id)}
              onMouseLeave={() => setHoveredConversation(null)}
            >
              <div>
                👥 {displayName}
                <div className="timestamp">
                  {new Date(conv.created_at).toLocaleString()}
                </div>
              </div>
              <div className="d-flex align-items-center">
                {unreadCount > 0 && <span className="unread-indicator" />}
                {hoveredConversation === conv.id && (
                  <Button
                    variant="link"
                    className="hide-button"
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
