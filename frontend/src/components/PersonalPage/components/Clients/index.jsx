import React, { useState, useEffect } from "react";
import { Container, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";
import { useGetData } from "../../hooks/useGetData";
import { usePostData } from "../../hooks/usePostData";
import { useGetPerfil } from "../../../../hooks/useGetPerfil";
import { toast } from "react-toastify";
import { User, Dumbbell, Plus, Check, Eye, EyeOff, ChevronLeft, ChevronRight, Copy, RefreshCw } from "lucide-react";
import { buildApiUrl } from "../../../../utils/api";

export const Clients = () => {
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm();

  // State for Pagination and Sorting
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const { user: currentUser } = useGetPerfil();
  const currentUserId = currentUser?.data?._id;

  const { isError, isLoading, data, load } = useGetData("users/all-users", limit, page + 1, sortBy, sortOrder, {
    createdBy: currentUserId
  });

  const { isLoading: isLoadingPost, postData } = usePostData("users/create-user");
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  useEffect(() => {

    const all = data?.clients ?? data?.users ?? [];
    const filteredClients = all.filter(client => {

      const isTrainer = client.role?.name === 'Trainer' || client.role?.scope?.includes('trainer');
      return !isTrainer;
    });
    setClients(filteredClients);
  }, [data]);

  const toggleModal = () => setModalOpen(!modalOpen);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const loadInviteCode = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/users/invite-code'), {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const data = await response.json();
      setInviteCode(data.inviteCode);
    } catch (error) {
      console.error('Error loading invite code:', error);
    }
  };

  const generateInviteCode = async () => {
    setIsLoadingCode(true);
    try {
      const response = await fetch(buildApiUrl('/api/users/generate-invite-code'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setInviteCode(data.inviteCode);
      toast.success('Código gerado com sucesso!');
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast.error('Erro ao gerar código');
    } finally {
      setIsLoadingCode(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success('Código copiado!');
  };

  useEffect(() => {
    loadInviteCode();
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(0); // Reset to first page on sort
  };

  const handleCreateClient = async (formData) => {
    const userPayload = {
      ...formData,
      role: { name: "User", scope: ["user"] },
    };

    try {
      await postData(userPayload);
      toast.success("Cliente adicionado com sucesso!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        icon: ({ theme, type }) => <Check size={20} style={{ color: '#dc2626' }} />,
        style: {
          background: '#ffffff',
          color: '#dc2626',
        },
        progressClassName: 'toast-progress-red',
      });
      reset();
      load();
      toggleModal();
    } catch (err) {
      console.error("Error adding client:", err);
      // Check if error is about duplicate email
      if (err.message && (err.message.includes("email") || err.message.includes("registado"))) {
        setError("email", {
          type: "manual",
          message: "Este email já está registado."
        });
        toast.error("Erro no formulário. Verifica os campos.");
      } else {
        toast.error(err.message || "Erro ao adicionar cliente");
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <span>A carregar dados dos clientes</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <h3>⚠️ Erro ao carregar dados</h3>
        <p>Por favor tenta novamente mais tarde ou contacta o suporte.</p>
      </div>
    );
  }

  // Pagination Helper
  const paging = data.pagination || {};
  const totalPages = Math.ceil((paging.total || 0) / (paging.pageSize || limit));

  return (
    <Container fluid className={styles.clientsContainer}>
      <h2 className={styles.title}>Os Meus Clientes</h2>

      <div className={styles.headerActions}>
        <div className={styles.searchWrapper}>
          {/* Search could be added here later */}
        </div>
        <button className={styles.btnAdd} onClick={toggleModal}>
          <Plus size={18} /> Adicionar Cliente
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                NOME {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                EMAIL {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('birthDate')} style={{ cursor: 'pointer' }}>
                DATA NASC. {sortBy === 'birthDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('address')} style={{ cursor: 'pointer' }}>
                MORADA {sortBy === 'address' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('country')} style={{ cursor: 'pointer' }}>
                PAÍS {sortBy === 'country' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>FUNÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {clients && clients.length > 0 ? (
              clients.map((client) => {
                const isTrainer = client.role?.scope?.includes('trainer');
                return (
                  <tr key={client._id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.birthDate ? new Date(client.birthDate).toLocaleDateString('pt-PT') : (client.age || '-')}</td>
                    <td>{client.address}</td>
                    <td>{client.country}</td>
                    <td>
                      <span className={isTrainer ? styles.roleTrainer : styles.roleUser}>
                        {isTrainer ? (
                          <>
                            <Dumbbell className={styles.roleIcon} size={14} /> Treinador
                          </>
                        ) : (
                          <>
                            <User className={styles.roleIcon} size={14} /> Utilizador
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className={styles.emptyState}>
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="6" className={styles.paginationCell}>
                <div className={styles.paginationControls}>
                  <button
                    disabled={page <= 0}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span>
                    Página <strong>{page + 1}</strong> de <strong>{totalPages || 1}</strong>
                  </span>
                  <button
                    disabled={!paging.hasMore && (page + 1) >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <br />
      <div className={styles.inviteSection}>
        <h3>Código de Convite</h3>
        <p>Partilha este código com novos clientes para se associarem a ti automaticamente.</p>
        <div className={styles.inviteCodeBox}>
          {inviteCode ? (
            <>
              <span className={styles.codeText}>{inviteCode}</span>
              <button className={styles.copyBtn} onClick={copyToClipboard}>
                <Copy size={16} /> Copiar
              </button>
              <button className={styles.regenerateBtn} onClick={generateInviteCode} disabled={isLoadingCode}>
                <RefreshCw size={16} /> {isLoadingCode ? 'A gerar...' : 'Novo Código'}
              </button>
            </>
          ) : (
            <button className={styles.generateBtn} onClick={generateInviteCode} disabled={isLoadingCode}>
              {isLoadingCode ? 'A gerar...' : 'Gerar Código de Convite'}
            </button>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} toggle={toggleModal} size="md" centered>
        <ModalHeader toggle={toggleModal}>Adicionar Novo Cliente</ModalHeader>
        <ModalBody>
          <form id="addClientForm" onSubmit={handleSubmit(handleCreateClient)}>
            <div className={styles.modalField}>
              <label htmlFor="name">Nome:</label>
              <input
                id="name"
                type="text"
                placeholder="Insere o nome do cliente"
                {...register("name", {
                  required: "Nome é obrigatório",
                  minLength: { value: 2, message: "O nome deve ter pelo menos 2 caracteres" },
                  pattern: {
                    value: /^[a-zA-ZÀ-ÿ\s'-]+$/,
                    message: "O nome só pode conter letras, espaços, hífens e apóstrofos"
                  }
                })}
                className={errors.name ? styles.inputError : ''}
              />
              {errors.name && <span className={styles.errorMessage}>{errors.name.message}</span>}
            </div>

            <div className={styles.modalField}>
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                placeholder="Insere o email"
                {...register("email", {
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Formato de email inválido"
                  }
                })}
                className={errors.email ? styles.inputError : ''}
              />
              {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
            </div>

            <div className={styles.modalField}>
              <label htmlFor="password">Palavra-passe:</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Insere a palavra-passe"
                  {...register("password", {
                    required: "Palavra-passe é obrigatória",
                    minLength: { value: 6, message: "A palavra-passe deve ter pelo menos 6 caracteres" },
                    validate: {
                      hasUpperCase: (value) => /[A-Z]/.test(value) || "A palavra-passe deve conter pelo menos uma letra maiúscula",
                      hasLowerCase: (value) => /[a-z]/.test(value) || "A palavra-passe deve conter pelo menos uma letra minúscula",
                      hasNumber: (value) => /[0-9]/.test(value) || "A palavra-passe deve conter pelo menos um número",
                      hasSymbol: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value) || "A palavra-passe deve conter pelo menos um símbolo (!@#$...)"
                    }
                  })}
                  className={errors.password ? styles.inputError : ''}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    opacity: 0.7,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <small className={styles.hint}>Mín. 6 carateres, maiúsculas, minúsculas, números e símbolos</small>
              {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
            </div>

            <div className={styles.modalField}>
              <label htmlFor="birthDate">Data de Nascimento:</label>
              <input
                id="birthDate"
                type="date"
                max={maxDate}
                min={minDate}
                {...register("birthDate", {
                  required: "Data de nascimento é obrigatória",
                  validate: (value) => {
                    const birthDate = new Date(value);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                      age--;
                    }
                    if (age < 14) return "Deve ter pelo menos 14 anos";
                    if (age > 100) return "Idade máxima é 100 anos";
                    return true;
                  }
                })}
                className={errors.birthDate ? styles.inputError : ''}
              />
              {errors.birthDate && <span className={styles.errorMessage}>{errors.birthDate.message}</span>}
            </div>

            <div className={styles.modalField}>
              <label htmlFor="address">Morada:</label>
              <input
                id="address"
                placeholder="Insere a morada"
                {...register("address", {
                  required: "Morada é obrigatória",
                  minLength: { value: 5, message: "A morada deve ter pelo menos 5 caracteres" }
                })}
                className={errors.address ? styles.inputError : ''}
              />
              {errors.address && <span className={styles.errorMessage}>{errors.address.message}</span>}
            </div>

            <div className={styles.modalField}>
              <label htmlFor="country">País:</label>
              <input
                id="country"
                placeholder="Insere o país"
                {...register("country", {
                  required: "País é obrigatório",
                  minLength: { value: 2, message: "O país deve ter pelo menos 2 caracteres" }
                })}
                className={errors.country ? styles.inputError : ''}
              />
              {errors.country && <span className={styles.errorMessage}>{errors.country.message}</span>}
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            Cancelar
          </Button>
          <button type="submit" form="addClientForm" className={styles.submitBtn} disabled={isLoadingPost}>
            {isLoadingPost ? "A adicionar..." : "Adicionar Cliente"}
          </button>
        </ModalFooter>
      </Modal>
    </Container >
  );
};
