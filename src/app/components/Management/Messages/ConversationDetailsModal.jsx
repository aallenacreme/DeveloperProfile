import { useState, useEffect } from "react";
import { Modal, Button, Alert, ListGroup, Form } from "react-bootstrap";
import { supabase } from "../../../services/supabaseClient";
import { useConversationRoles } from "./useConversationRoles";

function ConversationDetailsModal({
  show,
  onHide,
  selectedConversation,
  user,
}) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    userRole,
    isAdmin,
    isAdminOrModerator,
    removeParticipant,
    updateRole,
    error: roleError,
    setError: setRoleError,
  } = useConversationRoles(user, selectedConversation);

  useEffect(() => {
    if (!show || !selectedConversation?.id) return;

    const fetchParticipants = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("conversation_participants")
          .select(
            `
            user_id,
            role,
            profiles!conversation_participants_user_id_fkey (username)
          `
          )
          .eq("conversation_id", selectedConversation.id);

        if (error) throw error;

        setParticipants(
          data
            ?.map((p) => ({
              user_id: p.user_id,
              username: p.profiles?.username || "Unknown",
              role: p.role || "member",
            }))
            .filter((p) => p.username) || []
        );
      } catch (err) {
        console.error("Error fetching participants:", err.message);
        setError(`Failed to load participants: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [show, selectedConversation?.id]);

  const handleRemoveParticipant = async (participantUserId) => {
    const success = await removeParticipant(participantUserId);
    if (success) {
      setParticipants((prev) =>
        prev.filter((p) => p.user_id !== participantUserId)
      );
    }
  };

  const handleRoleChange = async (participantUserId, newRole) => {
    const success = await updateRole(participantUserId, newRole);
    if (success) {
      setParticipants((prev) =>
        prev.map((p) =>
          p.user_id === participantUserId ? { ...p, role: newRole } : p
        )
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-2">
        <Modal.Title className="fs-4 fw-bold">
          Conversation Participants
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {loading && (
          <div className="text-center my-4">
            <p className="text-muted mb-0">Loading participants...</p>
          </div>
        )}
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}
        {roleError && (
          <Alert variant="danger" className="mb-4">
            {roleError}
            <Button variant="link" onClick={() => setRoleError(null)}>
              Dismiss
            </Button>
          </Alert>
        )}
        {!loading && !error && participants.length === 0 && (
          <p className="text-muted text-center my-4">
            No participants found for this conversation.
          </p>
        )}
        {!loading && !error && participants.length > 0 && (
          <ListGroup className="participant-list">
            {participants.map((participant, index) => (
              <ListGroup.Item
                key={index}
                className="border-0 py-3 px-4 my-1 rounded bg-light d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  <span className="fs-5">
                    {participant.username}
                    <small className="text-muted ms-2">
                      (
                      {participant.role.charAt(0).toUpperCase() +
                        participant.role.slice(1)}
                      )
                    </small>
                  </span>
                  {isAdminOrModerator() &&
                    participant.user_id !== user.id &&
                    participant.role !== "admin" && (
                      <Form.Select
                        size="sm"
                        className="ms-3 role-select"
                        value={participant.role}
                        onChange={(e) =>
                          handleRoleChange(participant.user_id, e.target.value)
                        }
                      >
                        <option value="moderator">Moderator</option>
                        <option value="member">Member</option>
                      </Form.Select>
                    )}
                </div>
                {isAdminOrModerator() && participant.user_id !== user.id && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveParticipant(participant.user_id)}
                  >
                    Remove
                  </Button>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="secondary" onClick={onHide} className="px-4">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConversationDetailsModal;
