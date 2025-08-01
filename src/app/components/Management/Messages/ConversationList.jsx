import { Button } from "react-bootstrap";

function ConversationList({
  conversations,
  selectedConversation,
  setSelectedConversation,
  user,
  userNames,
  hoveredConversation,
  setHoveredConversation,
  handleHideConversation,
  unreadMap,
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
              <div className="d-flex align-items-center">
                {unreadMap[conv.id] && (
                  <span className="unread-indicator me-2"></span>
                )}
                <div>
                  👥 {displayName}
                  <div className="timestamp">
                    {new Date(conv.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center">
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
