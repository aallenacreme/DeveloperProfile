import { useState, useEffect } from "react";
import { Modal, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { supabase } from "../../services/supabaseClient";

function MessageFormModal({ show, onClose, onSelectContact, userId }) {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Select Contact</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <Form className="mb-3">
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
            {filteredContacts.length === 0 ? (
              <p>No contacts found</p>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.user_id}
                  className="p-2 border-bottom"
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelectContact(contact)}
                >
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
      </Modal.Footer>
    </Modal>
  );
}

export default MessageFormModal;
