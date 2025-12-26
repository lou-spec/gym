import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col } from "reactstrap";
import styles from "./styles.module.scss";
import { toast } from "react-toastify";
import { socketAddListener, socketRemoveListener } from "../../socket/socket";
import { Paperclip, X, Image as ImageIcon, MessageCircle, AlertTriangle } from "lucide-react";
import { buildApiUrl } from "../../utils/api";

export const Chat = ({ currentUserId, currentUserName, isTrainer, targetUserId, onTargetSelected }) => {
  const [contacts, setContacts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [absences, setAbsences] = useState([]);
  const [showAbsenceMenu, setShowAbsenceMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-select contact based on targetUserId
  useEffect(() => {
    if (targetUserId) {
      // Logic to find user in contacts or allUsers
      const targetId = targetUserId.toString();
      const potentialUser = isTrainer
        ? allUsers.find(u => u._id?.toString() === targetId)
        : contacts.find(c => c._id?.toString() === targetId);

      if (potentialUser) {
        setSelectedContact(potentialUser);
        if (onTargetSelected) {
          onTargetSelected();
        }
      }
    }
  }, [targetUserId, allUsers, contacts, isTrainer, onTargetSelected]);

  useEffect(() => {
    if (!currentUserId) return; // Wait for user ID

    if (isTrainer) {
      loadAllUsers();
    } else {
      loadContacts();
    }

    const handleNewMessage = (data) => {
      const myId = currentUserId?.toString();
      const senderId = data.senderId?.toString();
      const receiverId = data.receiverId?.toString();
      const selectedId = selectedContact?._id?.toString();

      const isMessageForMe = receiverId === myId;
      const isMessageFromMe = senderId === myId;
      const isMyMessage = isMessageForMe || isMessageFromMe;

      if (!isMyMessage) return;

      const otherPersonId = isMessageFromMe ? receiverId : senderId;
      const isCurrentConversation = selectedId === otherPersonId;

      if (isCurrentConversation) {
        const newMsg = {
          _id: data.messageId,
          sender: { _id: senderId, name: data.senderName },
          receiver: { _id: receiverId },
          message: data.message,
          image: data.image, // Handle image in new message
          createdAt: data.createdAt,
          read: false,
          isAlert: data.isAlert
        };

        setMessages(prev => {
          const exists = prev.find(m => m._id === data.messageId);
          if (exists) return prev;
          return [...prev, newMsg];
        });
      } else if (isMessageForMe) {
        setUnreadCounts(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));
      }
    };

    socketAddListener('new-message', handleNewMessage);

    return () => {
      socketRemoveListener('new-message', handleNewMessage);
    };
  }, [currentUserId, selectedContact, isTrainer]);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact._id);
      loadAbsences(selectedContact._id);
      setNewMessage('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowAbsenceMenu(false);
    }
  }, [selectedContact]);

  // Scroll Ref to track scroll position
  const messagesContainerRef = useRef(null); // Ref for container
  // messagesEndRef already declared at top

  useEffect(() => {
    scrollToBottom();
  }, [messages, previewUrl]);

  const scrollToBottom = () => {
    // Timeout ensures DOM is fully rendered before scrolling
    setTimeout(() => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  };

  const updateUnreadCounts = async () => {
    // ... existing logic ...
    try {
      const contactsResponse = await fetch(buildApiUrl('/api/chat/contacts'), {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const contactsData = await contactsResponse.json();
      const unreadMap = {};
      (contactsData.contacts || []).forEach(c => {
        if (c.unreadCount > 0) unreadMap[c._id] = c.unreadCount;
      });
      setUnreadCounts(unreadMap);
    } catch (error) {
      console.error('Error updating unread counts:', error);
    }
  };

  const loadAllUsers = async () => {
    if (!currentUserId) return; // Defensive check
    try {
      // Fetch specifically my clients with a high limit to ensure all are seen
      const usersResponse = await fetch(buildApiUrl(`/api/users/all-users?limit=100&createdBy=${currentUserId}`), {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const usersData = await usersResponse.json();

      const contactsResponse = await fetch(buildApiUrl('/api/chat/contacts'), {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const contactsData = await contactsResponse.json();

      const unreadMap = {};
      (contactsData.contacts || []).forEach(c => {
        if (c.unreadCount > 0) {
          unreadMap[c._id] = c.unreadCount;
        }
      });
      setUnreadCounts(unreadMap);

      const clients = (usersData.users || []).filter(u => {
        const isUser = u.role?.scope?.includes('user');
        const createdByMe = u.createdBy?.toString() === currentUserId?.toString();
        return isUser && u._id !== currentUserId && createdByMe;
      });
      setAllUsers(clients);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const [contactsResponse, usersResponse] = await Promise.all([
        fetch(buildApiUrl('/api/chat/contacts'), { credentials: 'include', headers: { Accept: 'application/json' } }),
        fetch(buildApiUrl('/api/users/all-users'), { credentials: 'include', headers: { Accept: 'application/json' } })
      ]);

      const contactsData = await contactsResponse.json();
      const usersData = await usersResponse.json();
      const allUsers = usersData.users || [];

      const unreadMap = {};
      (contactsData.contacts || []).forEach(c => {
        if (c.unreadCount > 0) unreadMap[c._id] = c.unreadCount;
      });
      setUnreadCounts(unreadMap);

      let contactsList = contactsData.contacts || [];

      const currentUser = allUsers.find(u => u._id?.toString() === currentUserId?.toString());
      const myTrainerId = currentUser?.createdBy;

      if (myTrainerId) {
        const hasTrainer = contactsList.some(c => c._id?.toString() === myTrainerId?.toString());
        if (!hasTrainer) {
          const trainer = allUsers.find(u => u._id?.toString() === myTrainerId?.toString());
          if (trainer) {
            contactsList = [{ _id: trainer._id, name: trainer.name, email: trainer.email, role: trainer.role, lastMessage: '', unreadCount: unreadMap[trainer._id] || 0 }, ...contactsList];
          }
        }
      }

      setContacts(contactsList.filter((c, i, self) => i === self.findIndex(t => t._id?.toString() === c._id?.toString())));
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadMessages = async (userId) => {
    setIsLoading(true);
    try {
      const response = await fetch(buildApiUrl(`/api/chat/messages/${userId}`), {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const data = await response.json();
      setMessages(data.messages || []);

      await fetch(buildApiUrl(`/api/chat/messages/mark-read/${userId}`), {
        method: 'PUT',
        credentials: 'include'
      });

      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[userId];
        return newCounts;
      });
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAbsences = async (clientId) => {
    if (!isTrainer) return;
    try {
      const response = await fetch(buildApiUrl(`/api/workouts/absences/${clientId}`), {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const data = await response.json();
      setAbsences(data.absences || []);
    } catch (error) {
      console.error('Error loading absences:', error);
      setAbsences([]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecione apenas imagens.');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if ((!newMessage.trim() && !selectedFile) || !selectedContact) {
      return;
    }

    const messageToSend = newMessage;
    const fileToSend = selectedFile;
    const contactId = selectedContact._id;

    // Clear inputs immediately for optimistic UI
    setNewMessage('');
    removeFile();

    try {
      const formData = new FormData();
      formData.append('receiverId', contactId);
      formData.append('message', messageToSend);
      if (fileToSend) {
        formData.append('image', fileToSend);
      }

      const response = await fetch(buildApiUrl('/api/chat/messages'), {
        method: 'POST',
        credentials: 'include',

        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Erro ao enviar mensagem');
        setNewMessage(messageToSend);

      }
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
      setNewMessage(messageToSend);
    }
  };

  return (
    <Container fluid className={styles.chatContainer}>
      <h2 className={styles.title}>Mensagens</h2>

      <Row className={styles.chatRow}>
        {/* Lista de Contatos */}
        <Col md={4} className={styles.contactsColumn}>
          <div className={styles.contactsList}>
            <h3>{isTrainer ? 'Clientes' : 'Conversas'}</h3>
            {isTrainer ? (
              allUsers.length === 0 ? (
                <div className={styles.emptyContacts}>
                  Sem clientes disponíveis
                </div>
              ) : (
                allUsers.map(user => (
                  <div
                    key={user._id}
                    className={`${styles.contactItem} ${selectedContact?._id === user._id ? styles.active : ''}`}
                    onClick={() => setSelectedContact(selectedContact?._id === user._id ? null : user)}
                  >
                    <div className={styles.contactInfo}>
                      <div className={styles.contactName}>
                        {user.name}
                        {unreadCounts[user._id] > 0 && (
                          <span className={styles.unreadBadge}>{unreadCounts[user._id]}</span>
                        )}
                      </div>
                      <div className={styles.contactRole}>
                        Cliente
                      </div>
                      <div className={styles.contactEmail}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              // Para users: mostrar apenas conversas existentes
              contacts.length === 0 ? (
                <div className={styles.emptyContacts}>
                  Sem conversas ainda
                </div>
              ) : (
                contacts.map(contact => (
                  <div
                    key={contact._id}
                    className={`${styles.contactItem} ${selectedContact?._id === contact._id ? styles.active : ''}`}
                    onClick={() => setSelectedContact(selectedContact?._id === contact._id ? null : contact)}
                  >
                    <div className={styles.contactInfo}>
                      <div className={styles.contactName}>
                        {contact.name}
                        {unreadCounts[contact._id] > 0 && (
                          <span className={styles.unreadBadge}>{unreadCounts[contact._id]}</span>
                        )}
                      </div>
                      <div className={styles.contactRole}>
                        {contact.role?.name === 'Trainer' ? 'Personal Trainer' : 'Cliente'}
                      </div>
                      <div className={styles.lastMessage}>
                        {contact.lastMessage?.includes('http') && contact.lastMessage?.includes('uploads')
                          ? '📷 Imagem'
                          : contact.lastMessage?.substring(0, 30)}
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </Col>

        {/* Área de Mensagens */}
        <Col md={8} className={styles.messagesColumn}>
          {selectedContact ? (
            <div className={styles.chatArea}>
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderInfo}>
                  <h3>{selectedContact.name}</h3>
                  <span className={styles.contactEmail}>{selectedContact.email}</span>
                </div>
                {isTrainer && absences.length > 0 && (
                  <div className={styles.absenceAlertWrapper}>
                    <button
                      className={styles.absenceAlertBtn}
                      onClick={() => setShowAbsenceMenu(!showAbsenceMenu)}
                    >
                      <AlertTriangle size={16} />
                      {absences.length} {absences.length === 1 ? 'Falta' : 'Faltas'}
                    </button>
                    {showAbsenceMenu && (
                      <div className={styles.absenceDropdown}>
                        <div className={styles.absenceDropdownTitle}>Treinos não realizados:</div>
                        {absences.map(absence => (
                          <div
                            key={absence._id}
                            className={styles.absenceItem}
                            onClick={() => {
                              const date = new Date(absence.date).toLocaleDateString('pt-PT');
                              const reason = absence.reason || 'não indicada';
                              setNewMessage(`⚠️ Notei que faltaste ao treino de ${date}. Razão: ${reason}. Queres remarcar?`);
                              setShowAbsenceMenu(false);
                            }}
                          >
                            <span className={styles.absenceDate}>
                              {new Date(absence.date).toLocaleDateString('pt-PT')}
                            </span>
                            <span className={styles.absenceReason}>
                              {absence.reason || 'Sem razão'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                className={styles.messagesArea}
                ref={messagesContainerRef} // Remove ref from end div, or keep it but scroll container
              >
                {isLoading ? (
                  <div className={styles.loading}>Carregando mensagens...</div>
                ) : messages.length === 0 ? (
                  <div className={styles.emptyMessages}>
                    Nenhuma mensagem ainda. Comece a conversar!
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    // ... existing map logic
                    if (!msg || (!msg.sender && !msg.senderId)) return null;
                    const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
                    const myId = currentUserId?.toString();
                    const isSentByMe = senderId === myId;

                    return (
                      <div
                        key={msg._id || index}
                        className={`${styles.message} ${isSentByMe ? styles.sent : styles.received}`}
                      >
                        {/* ... message content ... */}
                        <div className={styles.messageContent}>
                          {msg.isAlert && <span className={styles.alertBadge}>⚠ Alerta</span>}

                          {msg.image && (
                            <div className={styles.messageImageContainer}>
                              <img
                                src={msg.image}
                                alt="Enviada"
                                className={styles.messageImage}
                                onClick={() => window.open(msg.image, '_blank')}
                              />
                            </div>
                          )}

                          {msg.message && <div className={styles.messageText}>{msg.message}</div>}

                          <div className={styles.messageTime}>
                            {new Date(msg.createdAt).toLocaleString('pt-PT', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className={styles.inputArea}>

                {previewUrl && (
                  <div className={styles.imagePreview}>
                    <img src={previewUrl} alt="Preview" />
                    <button type="button" onClick={removeFile} className={styles.removePreviewBtn}>
                      <X size={16} />
                    </button>
                  </div>
                )}

                <form onSubmit={sendMessage} className={styles.messageForm}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  <div className={styles.attachActions}>
                    <button
                      type="button"
                      className={styles.attachButton}
                      onClick={() => fileInputRef.current?.click()}
                      title="Anexar ficheiro"
                    >
                      <Paperclip size={20} />
                    </button>
                    <button
                      type="button"
                      className={styles.attachButton}
                      onClick={() => fileInputRef.current?.click()}
                      title="Tirar/Enviar Foto"
                    >
                      <ImageIcon size={20} />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escreva a sua mensagem..."
                    className={styles.messageInput}
                    autoComplete="off"
                  />

                  <button type="submit" className={styles.sendButton}>
                    Enviar
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className={styles.noSelection}>
              <p>Selecione uma conversa para começar</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
