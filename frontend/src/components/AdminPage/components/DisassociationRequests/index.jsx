import React, { useState, useEffect } from "react";
import styles from "./styles.module.scss";
import { toast } from "react-toastify";
import { showSwalConfirm, showSwalSuccess } from "../../../../utils/swalTheme";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const DisassociationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadRequests = async () => {
        try {
            const response = await fetch("/api/users/disassociation-requests/pending", {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            }
        } catch (error) {
            console.error("Error loading requests:", error);
            toast.error("Erro ao carregar pedidos.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleAction = async (request, action) => {
        const isApprove = action === 'approve';

        const result = await showSwalConfirm({
            title: isApprove ? 'Aprovar Desassociação?' : 'Rejeitar Pedido?',
            html: isApprove
                ? `Ao aprovar, o utilizador <strong>${request.user?.name}</strong> deixará de estar associado ao PT <strong>${request.trainer?.name}</strong> e todos os planos de treino criados por este PT para este utilizador serão eliminados.`
                : `Tens a certeza que queres rejeitar o pedido de <strong>${request.user?.name}</strong>?`,
            icon: isApprove ? 'warning' : 'question',
            iconColor: isApprove ? '#dc2626' : '#dc2626',
            confirmButtonText: isApprove ? 'Sim, Aprovar' : 'Sim, Rejeitar',
            confirmButtonColor: isApprove ? '#dc2626' : '#dc2626'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/users/disassociation-requests/${request._id}/${action}`, {
                    method: "POST",
                    credentials: "include"
                });

                if (response.ok) {
                    showSwalSuccess({
                        title: isApprove ? 'Aprovado!' : 'Rejeitado!',
                        icon: isApprove ? 'success' : 'error',
                        iconColor: isApprove ? '#dc2626' : '#dc2626',
                        text: isApprove
                            ? 'O utilizador foi desassociado com sucesso.'
                            : 'O pedido foi rejeitado.'
                    });
                    loadRequests();
                } else {
                    const data = await response.json();
                    toast.error(data.error || "Erro ao processar pedido.");
                }
            } catch (error) {
                console.error(`Error ${action} request:`, error);
                toast.error("Erro de comunicação com o servidor.");
            }
        }
    };

    if (isLoading) return <div className="text-center p-4">A carregar pedidos...</div>;
    if (requests.length === 0) return null;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                <AlertCircle size={28} style={{ marginRight: '10px' }} />
                Pedidos de Desassociação Pendentes
            </h2>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Utilizador</th>
                            <th>Personal Trainer</th>
                            <th>Motivo</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((request) => (
                            <tr key={request._id}>
                                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className={styles.userInfo}>
                                        <div className={styles.avatar}>
                                            {request.user?.profileImage ? (
                                                <img src={request.user.profileImage} alt={request.user.name} />
                                            ) : (
                                                request.user?.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className={styles.details}>
                                            <span className={styles.name}>{request.user?.name || 'Unknown'}</span>
                                            <span className={styles.email}>{request.user?.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.userInfo}>
                                        <div className={styles.details}>
                                            <span className={styles.name}>{request.trainer?.name || 'Unknown'}</span>
                                            <span className={styles.email}>{request.trainer?.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.reasonCol} title={request.reason}>
                                    {request.reason}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                                        <button
                                            className={`${styles.btn} ${styles.approve}`}
                                            onClick={() => handleAction(request, 'approve')}
                                            title="Aprovar e Desassociar"
                                        >
                                            <CheckCircle size={16} /> Aprovar
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.reject}`}
                                            onClick={() => handleAction(request, 'reject')}
                                            title="Rejeitar Pedido"
                                        >
                                            <XCircle size={16} /> Rejeitar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DisassociationRequests;
