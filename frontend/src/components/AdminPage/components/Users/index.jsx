import React, { useState, useContext, useEffect } from "react";
import { Container, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";
import { useGetData } from "../../hooks/useGetData";
import { UsersContext } from "../../../../contexts/UsersProvider";
import { toast } from "react-toastify";
import { showSwalConfirm, showSwalSuccess, showSwalError } from "../../../../utils/swalTheme";
import { Edit, Trash2, ArrowUp, ArrowDown, User, Dumbbell, ChevronLeft, ChevronRight } from "lucide-react";
import { buildApiUrl } from "../../../../utils/api";
import { socketAddListener, socketRemoveListener, initSocket } from "../../../../socket/socket";

const Users = () => {
  const { register, handleSubmit, reset, setValue } = useForm();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const { isError, isLoading, data, load } = useGetData("users/all-users", limit, page + 1, sortBy, sortOrder);

  const { setUsers } = useContext(UsersContext);
  const [editingUser, setEditingUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (data && data.users) {
      setUsers(data.users);
    }
  }, [data, setUsers]);


  useEffect(() => {
    initSocket();

    const handleNotification = (notification) => {
      if (notification.key === 'User') {
        load();
      }
    };

    socketAddListener('admin_notifications', handleNotification);

    return () => {
      socketRemoveListener('admin_notifications', handleNotification);
    };
  }, [load]);

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
    setPage(0);
  };

  const promoteToTrainer = async (user) => {
    if (user.trainer) {
      await showSwalError({
        title: 'Ação Bloqueada',
        text: 'Este utilizador tem um Personal Trainer associado. Remove a associação antes de o promoveres.'
      });
      return;
    }

    const result = await showSwalConfirm({
      title: 'Promover a Personal Trainer?',
      html: `Tens a certeza que queres promover <strong>${user.name}</strong> a Personal Trainer?`,
      icon: 'question',
      confirmButtonText: 'Sim, promover!',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(buildApiUrl(`/api/users/${user._id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            role: { name: "Trainer", scope: ["trainer"] },
          }),
        });

        if (response.ok) {
          showSwalSuccess({
            title: 'Sucesso!',
            text: `${user.name} foi promovido a Personal Trainer!`,
          });
          load();
        } else {
          const errorData = await response.json();
          await showSwalError({
            title: 'Não foi possível promover',
            text: errorData.error || 'Ocorreu um erro ao processar o pedido.'
          });
        }
      } catch (error) {
        console.error("Error promoting user:", error);
        toast.error('Ocorreu um erro de comunicação.');
      }
    }
  };

  const demoteToUser = async (user) => {
    const result = await showSwalConfirm({
      title: 'Despromover de Personal Trainer?',
      html: `Tens a certeza que queres despromover <strong>${user.name}</strong> para utilizador normal?`,
      icon: 'question',
      confirmButtonText: 'Sim, despromover!',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(buildApiUrl(`/api/users/${user._id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            role: { name: "User", scope: ["user"] },
          }),
        });

        if (response.ok) {
          showSwalSuccess({
            title: 'Sucesso!',
            text: `${user.name} foi despromovido para utilizador normal!`,
          });
          load();
        } else {
          toast.error('Não foi possível despromover o utilizador.');
        }
      } catch (error) {
        console.error("Error demoting user:", error);
        toast.error('Ocorreu um erro ao despromover o utilizador.');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setValue("name", user.name);
    setValue("email", user.email);
    setValue("address", user.address);
    setValue("country", user.country);
    setModalOpen(true);
  };

  const handleUpdate = async (formData) => {
    try {
      const response = await fetch(buildApiUrl(`/api/users/${editingUser._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Utilizador atualizado!");
        setModalOpen(false);
        setEditingUser(null);
        reset();
        load();
      } else {
        toast.error("Erro ao atualizar");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erro ao atualizar");
    }
  };

  const handleDelete = async (user) => {
    const result = await showSwalConfirm({
      title: 'Tens a certeza?',
      html: `Esta ação vai <strong>eliminar permanentemente</strong> o utilizador <strong>${user.name}</strong>!`,
      icon: 'warning',
      confirmButtonText: 'Sim, eliminar!',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/users/${user._id}`), {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Utilizador eliminado!");
        load();
      } else {
        toast.error("Erro ao eliminar");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erro ao eliminar");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <span>Loading users data</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error loading data</h3>
        <p>Please try again later or contact support.</p>
      </div>
    );
  }


  const paging = data.pagination || {};
  const totalPages = Math.ceil((paging.total || 0) / (paging.pageSize || limit));

  return (
    <Container fluid className={styles.usersContainer}>
      <h2 className={styles.title}>User Management</h2>
      <h2 className={styles.title}>Total: {data.pagination?.total}</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                NAME {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                EMAIL {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('address')} style={{ cursor: 'pointer' }}>
                ADDRESS {sortBy === 'address' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('country')} style={{ cursor: 'pointer' }}>
                COUNTRY {sortBy === 'country' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>ROLE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {data.users && data.users.length > 0 ? (
              data.users
                .filter(user => user.email !== 'admin@gym.com' && !user.role?.scope?.includes('admin'))
                .map((user) => {
                  const isTrainer = user.role?.scope?.includes('trainer');
                  return (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.address}</td>
                      <td>{user.country}</td>
                      <td>
                        <span className={isTrainer ? styles.roleTrainer : styles.roleUser}>
                          {isTrainer ? (
                            <>
                              <Dumbbell className={styles.roleIcon} size={14} /> Trainer
                            </>
                          ) : (
                            <>
                              <User className={styles.roleIcon} size={14} /> User
                            </>
                          )}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        <button
                          className={`${styles.btn} ${styles.btnDelete}`}
                          onClick={() => handleDelete(user)}
                          title="Delete user"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                        {isTrainer ? (
                          <button
                            className={`${styles.btn} ${styles.btnDemote}`}
                            onClick={() => demoteToUser(user)}
                            title="Demote to regular user"
                          >
                            <ArrowDown size={14} /> Demote
                          </button>
                        ) : (
                          <button
                            className={`${styles.btn} ${styles.btnPromote}`}
                            onClick={() => promoteToTrainer(user)}
                            title="Promote to Personal Trainer"
                          >
                            <ArrowUp size={14} /> Promote
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="6" className={styles.emptyState}>
                  Nenhum utilizador encontrado
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
                    disabled={!data.pagination?.hasMore && (page + 1) >= totalPages}
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

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg">
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          Edit User
        </ModalHeader>
        <ModalBody>
          <form id="updateForm" onSubmit={handleSubmit(handleUpdate)}>
            <div className={styles.modalField}>
              <label htmlFor="editName">Name:</label>
              <input
                id="editName"
                type="text"
                required
                {...register("name")}
              />
            </div>

            <div className={styles.modalField}>
              <label htmlFor="editEmail">Email:</label>
              <input
                id="editEmail"
                type="email"
                required
                {...register("email")}
              />
            </div>

            <div className={styles.modalField}>
              <label htmlFor="editAddress">Address:</label>
              <input
                id="editAddress"
                type="text"
                required
                {...register("address")}
              />
            </div>

            <div className={styles.modalField}>
              <label htmlFor="editCountry">Country:</label>
              <input
                id="editCountry"
                type="text"
                required
                {...register("country")}
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button color="primary" type="submit" form="updateForm">
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default Users;
