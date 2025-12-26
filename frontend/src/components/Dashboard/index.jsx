import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import styles from "./styles.module.scss";
import { toast } from "react-toastify";
import { useGetData } from "../PersonalPage/hooks/useGetData";
import { buildApiUrl } from "../../utils/api";

const COLORS = ['var(--chart-completed)', 'var(--chart-missed)', 'var(--chart-rate)'];

export const Dashboard = ({ clientId, isTrainer, trainerId }) => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('month');
  const [selectedClient, setSelectedClient] = useState(clientId || '');
  const [clients, setClients] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [clientSearchTerm, setClientSearchTerm] = useState('');


  const { isError, isLoading: isLoadingClients, data: usersData } = useGetData("users/all-users", 0, 0);

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    if (isTrainer && usersData) {
      const all = usersData.clients ?? usersData.users ?? [];

      const userClients = all.filter(u => {
        const isUser = u.role?.name === 'User';
        const createdByMe = trainerId ? u.createdBy === trainerId : true;
        return isUser && createdByMe;
      });

      setClients(userClients);
    }
  }, [usersData, isTrainer, trainerId]);

  useEffect(() => {
    if (clientId) {
      setSelectedClient(clientId);
    }
  }, [clientId]);

  useEffect(() => {
    if (selectedClient) {
      loadStats(selectedClient, period);
    }
  }, [selectedClient, period, refreshKey]);

  useEffect(() => {
    const handleWorkoutCompleted = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
    };
  }, []);

  const loadStats = async (cId, per) => {
    setIsLoadingStats(true);
    try {
      const response = await fetch(buildApiUrl(`/api/workouts/stats/client/${cId}?period=${per}`), {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (isLoadingClients && isTrainer) {
    return <div className={styles.loading}>A carregar clientes...</div>;
  }

  const handleClientClick = (cId) => {
    if (selectedClient === cId) {
      setSelectedClient('');
      setStats(null);
    } else {
      setSelectedClient(cId);
    }
  };

  return (
    <Container fluid className={styles.dashboardContainer}>
      <h2 className={styles.title}>Dashboard</h2>

      {isTrainer && (
        <div className={styles.selectionSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Selecione o Cliente</h3>
          
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Pesquisar cliente..."
                className={styles.searchInput}
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.clientsGrid}>
            {filteredClients.length > 0 ? (
              filteredClients.map(client => {
                const initials = client.name ? client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
                const isActive = selectedClient === client._id;
                return (
                  <div
                    key={client._id}
                    className={`${styles.clientCard} ${isActive ? styles.active : ''}`}
                    onClick={() => handleClientClick(client._id)}
                  >
                    <div className={styles.clientAvatar}>
                      {client.profileImage ? (
                        <img src={client.profileImage} alt={client.name} />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className={styles.clientName}>{client.name}</div>
                    <div className={styles.clientEmail}>{client.email}</div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyStateCard}>
                <p>{clientSearchTerm ? 'Nenhum cliente encontrado.' : 'Não tens clientes associados.'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isLoadingStats && <div className={styles.loading}>Carregando estatísticas...</div>}

      {!isLoadingStats && selectedClient && (
        <div className={styles.statsContainer}>
          <div className={styles.toolbar}>
            <h3 className={styles.toolbarTitle}>
              {isTrainer
                ? `Estatísticas de ${clients.find(c => c._id === selectedClient)?.name || ''}`
                : 'As Minhas Estatísticas'
              }
            </h3>
            <div className={styles.periodSelector}>
              <label>Período:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
                <option value="year">Último Ano</option>
                <option value="all">Todo o Período</option>
              </select>
            </div>
          </div>

          {stats ? (
            <>

              <Row className={styles.statsRow}>
                <Col md={3}>
                  <div className={`${styles.statCard} ${styles.total}`}>
                    <div className={styles.statValue}>{stats.total || 0}</div>
                    <div className={styles.statLabel}>Total Treinos</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className={`${styles.statCard} ${styles.completed}`}>
                    <div className={styles.statValue}>{stats.completed || 0}</div>
                    <div className={styles.statLabel}>Completos</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className={`${styles.statCard} ${styles.missed}`}>
                    <div className={styles.statValue}>{stats.missed || 0}</div>
                    <div className={styles.statLabel}>Faltas</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className={`${styles.statCard} ${styles.rate}`}>
                    <div className={styles.statValue}>{stats.completionRate || 0}%</div>
                    <div className={styles.statLabel}>Taxa Conclusão</div>
                  </div>
                </Col>
              </Row>


              <Row className={styles.chartsRow}>
                <Col lg={8}>
                  <div className={styles.chartCard}>
                    <h3>Treinos por Semana</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={Object.entries(stats.byWeek || {}).map(([week, data]) => ({
                        name: week.split('-W')[1] ? `Sem. ${week.split('-W')[1]}` : week,
                        completed: data.completed,
                        missed: data.total - data.completed
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" name="Completos" fill="var(--chart-completed)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="missed" name="Faltas" fill="var(--chart-missed)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Col>
                <Col lg={4}>
                  <div className={styles.chartCard}>
                    <h3>Distribuição</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completos', value: stats.completed || 0 },
                            { name: 'Faltas', value: stats.missed || 0 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[{ name: 'Completos', value: stats.completed }, { name: 'Faltas', value: stats.missed }].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Col>
              </Row>
            </>
          ) : (
            <div className={styles.emptyState}>Sem dados disponíveis para este cliente neste período.</div>
          )}
        </div>
      )}
    </Container>
  );
};

export default Dashboard;
