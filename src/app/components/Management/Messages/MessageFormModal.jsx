import { useState, useEffect } from "react";
import { Modal, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { supabase } from "../../../services/supabaseClient";

function MessageFormModal({ show, onClose, onSelectConversation, userId }) {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const { data: contactData, error } = await supabase
          .from("profiles")
          .select("user_id, username, name")
          .neq("user_id", userId);

        if (error) throw error;

        setContacts(
          contactData?.map((c) => ({
            user_id: c.user_id,
            username: c.username,
            name: c.name,
          })) || []
        );
      } catch (err) {
        console.error("Error fetching contacts:", err);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchContacts();
    }
  }, [show, userId]);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (contact) => {
    if (selectedContacts.some((c) => c.user_id === contact.user_id)) {
      setSelectedContacts(
        selectedContacts.filter((c) => c.user_id !== contact.user_id)
      );
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleCreateConversation = async () => {
    try {
      if (selectedContacts.length === 0) {
        alert("Select at least one contact.");
        return;
      }

      const { data: created, error: insertError } = await supabase
        .from("conversations")
        .insert({ name: groupName || null })
        .select()
        .single();

      if (insertError) throw insertError;

      const participants = [
        { conversation_id: created.id, user_id: userId },
        ...selectedContacts.map((contact) => ({
          conversation_id: created.id,
          user_id: contact.user_id,
        })),
      ];

      const { error: participantError } = await supabase
        .from("conversation_participants")
        .insert(participants);

      if (participantError) throw participantError;

      const visibilityEntries = participants.map((p) => ({
        conversation_id: created.id,
        user_id: p.user_id,
        is_visible: true,
      }));

      const { error: visibilityError } = await supabase
        .from("conversation_visibility")
        .insert(visibilityEntries);

      if (visibilityError) throw visibilityError;

      onSelectConversation(created);
      onClose();
    } catch (err) {
      console.error("Error creating group conversation:", err);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Chat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <Form className="mb-3">
              <Form.Group className="mb-3">
                <Form.Label>Group Name (optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </Form.Group>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Form>
            {selectedContacts.length > 0 && (
              <div className="mb-3">
                <strong>Selected: </strong>
                {selectedContacts.map((c) => (
                  <span key={c.user_id} className="badge bg-primary me-1">
                    {c.username}
                    <Button
                      variant="link"
                      className="text-white"
                      onClick={() => handleSelect(c)}
                    >
                      ×
                    </Button>
                  </span>
                ))}
              </div>
            )}
            {filteredContacts.length === 0 ? (
              <p>No contacts found</p>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.user_id}
                  className="p-2 border-bottom"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSelect(contact)}
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.some(
                      (c) => c.user_id === contact.user_id
                    )}
                    onChange={() => {}}
                    className="me-2"
                  />
                  <strong>{contact.username}</strong>
                  {contact.name && (
                    <small className="d-block">{contact.name}</small>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleCreateConversation}>
          Create Chat
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default MessageFormModal;
