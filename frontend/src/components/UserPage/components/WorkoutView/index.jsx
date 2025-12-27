import React, { useState, useEffect } from "react";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import styles from "./styles.module.scss";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, AlertTriangle, Calendar, Clock, Dumbbell, Play, Eye, Edit3, Camera } from "lucide-react";
import { buildApiUrl } from "../../../../utils/api";

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_LABELS = {
  Monday: 'Segunda',
  Tuesday: 'Terça',
  Wednesday: 'Quarta',
  Thursday: 'Quinta',
  Friday: 'Sexta',
  Saturday: 'Sábado',
  Sunday: 'Domingo'
};

export const WorkoutView = () => {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [sessions, setSessions] = useState({});
  const [completions, setCompletions] = useState({});
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const [completed, setCompleted] = useState(true);
  const [reason, setReason] = useState('');
  const [proof, setProof] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    loadWorkoutPlan();

    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today.getTime());
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  }, []);

  useEffect(() => {
    if (workoutPlan) {
      loadCompletions();
    }
  }, [workoutPlan, currentWeekStart]);

  const loadWorkoutPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(buildApiUrl('/api/workouts/plans/my-plan'), {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const data = await response.json();

      if (data.plan) {
        setWorkoutPlan(data.plan);

        const sessionsMap = {};
        data.sessions.forEach(session => {
          sessionsMap[session.dayOfWeek] = session;
        });
        setSessions(sessionsMap);
      }
    } catch (error) {
      console.error('Error loading workout plan:', error);
      toast.error('Erro ao carregar plano de treino');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompletions = async () => {
    if (!workoutPlan) return;

    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    try {
      const response = await fetch(
        buildApiUrl(`/api/workouts/completions/client/${workoutPlan.client}?startDate=${currentWeekStart.toISOString()}&endDate=${weekEnd.toISOString()}`),
        {
          credentials: 'include',
          headers: { Accept: 'application/json' }
        }
      );
      const data = await response.json();

      const completionsMap = {};
      data.completions.forEach(comp => {
        const sessionDay = sessions[DAYS_OF_WEEK.find(d => sessions[d]?._id === comp.workoutSession._id)];
        if (sessionDay) {
          const dateKey = new Date(comp.date).toDateString();
          completionsMap[dateKey] = comp;
        }
      });
      setCompletions(completionsMap);
    } catch (error) {
      console.error('Error loading completions:', error);
    }
  };

  const getDateForDay = (dayOfWeek) => {
    const dayIndex = DAYS_OF_WEEK.indexOf(dayOfWeek);
    const date = new Date(currentWeekStart.getTime());
    date.setDate(date.getDate() + dayIndex);
    return date;
  };

  const openSessionDetails = (day) => {
    setSelectedSession({ day, session: sessions[day] });
    setModalOpen(true);
  };

  const openCompletionModal = (day) => {
    const date = getDateForDay(day);
    const dateKey = date.toDateString();
    const existing = completions[dateKey];

    const currentState = {
      completed: existing ? existing.completed : true,
      reason: existing?.reason || '',
      proof: existing?.proof || '',
      notes: existing?.notes || ''
    };

    if (existing) {
      setCompleted(existing.completed);
      setReason(existing.reason || '');
      setProof(existing.proof || '');
      setNotes(existing.notes || '');
    } else {
      setCompleted(true);
      setReason('');
      setProof('');
      setNotes('');
    }

    setInitialValues(currentState);
    setProofFile(null); // Reset file input

    setSelectedSession({ day, session: sessions[day], date });
    setCompletionModalOpen(true);
  };

  const hasChanges = () => {
    if (!initialValues) return false;
    if (proofFile) return true; // New file selected

    return (
      completed !== initialValues.completed ||
      reason !== initialValues.reason ||
      notes !== initialValues.notes ||
      (proof === '' && initialValues.proof !== '') // Removed proof
    );
  };

  const saveCompletion = async () => {
    if (!selectedSession) return;
    if (!hasChanges()) return;

    if (!completed && !reason) {
      toast.error('Indique o motivo por não ter completado');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('workoutSessionId', selectedSession.session._id);
      formData.append('date', selectedSession.date.toISOString());
      formData.append('completed', completed);
      formData.append('reason', completed ? '' : reason);
      formData.append('notes', notes);

      if (proofFile) {
        formData.append('proofImage', proofFile);
      }

      const response = await fetch(buildApiUrl('/api/workouts/completions'), {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Registo guardado');
        setCompletionModalOpen(false);
        setProof('');
        setProofFile(null);
        loadCompletions();
        window.dispatchEvent(new CustomEvent('workoutCompleted'));
      }
    } catch (error) {
      toast.error('Erro ao guardar');
    }
  };

  const changeWeek = (direction) => {
    const newDate = new Date(currentWeekStart.getTime());
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
  };

  const getCompletionStatus = (day) => {
    const date = getDateForDay(day);
    const dateKey = date.toDateString();
    return completions[dateKey];
  };

  if (isLoading) {
    return (
      <Container>
        <div className={styles.loading}>A carregar treino...</div>
      </Container>
    );
  }

  if (!workoutPlan) {
    return (
      <Container>
        <div className={styles.emptyState}>
          <h3>Sem Plano de Treino</h3>
          <p>Ainda não tem um plano de treino atribuído.</p>
          <p>Contacte o seu personal trainer.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className={styles.workoutViewContainer}>
      <h2 className={`text-center ${styles.title}`}>O Meu Plano de Treino</h2>

      {workoutPlan.trainer && (
        <div className={styles.trainerCard}>
          <span className={styles.trainerLabel}>O Meu Personal Trainer  </span>
          <div className={styles.trainerPhotoContainer}>
            {workoutPlan.trainer.profileImage ? (
              <img
                src={workoutPlan.trainer.profileImage}
                alt={workoutPlan.trainer.name}
                className={styles.trainerPhoto}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=PT'; }}
              />
            ) : (
              <div className={styles.placeholderPhoto}>
                {workoutPlan.trainer.name ? workoutPlan.trainer.name.charAt(0).toUpperCase() : 'PT'}
              </div>
            )}
          </div>
          <h3 className={styles.trainerName}>{workoutPlan.trainer.name}</h3>
        </div>
      )}

      {workoutPlan.name && (
        <div className={styles.planNameBadge}>
          <span className={styles.planLabel}>Plano Atual</span>
          <span className={styles.planName}>{workoutPlan.name}</span>
        </div>
      )}


      {(() => {
        const planCreatedAt = workoutPlan.createdAt ? new Date(workoutPlan.createdAt) : null;
        const planStartWeek = planCreatedAt ? (() => {
          const d = new Date(planCreatedAt.getTime());
          const day = d.getDay();
          const diff = day === 0 ? -6 : 1 - day;
          d.setDate(d.getDate() + diff);
          d.setHours(0, 0, 0, 0);
          return d;
        })() : null;

        const today = new Date();
        const currentRealWeek = (() => {
          const d = new Date(today.getTime());
          const day = d.getDay();
          const diff = day === 0 ? -6 : 1 - day;
          d.setDate(d.getDate() + diff);
          d.setHours(0, 0, 0, 0);
          return d;
        })();

        const canGoBack = planStartWeek ? currentWeekStart.getTime() > planStartWeek.getTime() : true;
        const nextWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        const oneDayBeforeNextWeek = new Date(nextWeekStart.getTime() - 24 * 60 * 60 * 1000);
        const canGoForward = today >= oneDayBeforeNextWeek || currentWeekStart.getTime() < currentRealWeek.getTime();

        return (
          <div className={styles.weekNavigator}>
            <button
              onClick={() => changeWeek(-1)}
              className={styles.btnNav}
              disabled={!canGoBack}
            >
              ← Semana Anterior
            </button>
            <span className={styles.weekLabel}>
              {currentWeekStart.toLocaleDateString('pt-PT')} - {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT')}
            </span>
            <button
              onClick={() => changeWeek(1)}
              className={styles.btnNav}
              disabled={!canGoForward}
            >
              Próxima Semana →
            </button>
          </div>
        );
      })()}


      <div className={styles.calendar}>
        <div className={styles.calendarGrid}>
          {DAYS_OF_WEEK.map(day => {
            const session = sessions[day];
            const date = getDateForDay(day);
            const completion = getCompletionStatus(day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPast = date < today;
            const isToday = date.toDateString() === today.toDateString();
            const canMark = isPast || isToday;

            return (
              <div key={day} className={`${styles.dayCard} ${!session ? styles.noSession : ''}`}>
                <div className={styles.dayHeader}>
                  <div className={styles.dayName}>{DAY_LABELS[day]}</div>
                  <div className={styles.dayDate}>{date.getDate()}/{date.getMonth() + 1}</div>
                </div>

                {session ? (
                  <>
                    <div className={styles.sessionInfo}>
                      <div className={styles.sessionTime}>
                        <Clock size={14} /> {session.startTime} - {session.endTime}
                      </div>
                      <div className={styles.sessionExCount}>
                        <Dumbbell size={14} /> {session.exercises.filter(e => e).length} exercícios
                      </div>
                    </div>

                    {/* Exercise Thumbnails Preview */}
                    <div className={styles.exerciseThumbs}>
                      {session.exercises.filter(e => e && e.name).slice(0, 3).map((ex, idx) => {
                        const videoId = (ex.videoLink || ex.video)?.match(/(?:v=|\/)([\w-]{11})/)?.[1];
                        const thumbUrl = videoId
                          ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                          : ex.img || 'https://via.placeholder.com/80?text=Ex';
                        return (
                          <div key={idx} className={styles.exThumb} title={ex.name}>
                            <img src={thumbUrl} alt={ex.name} />
                            <span className={styles.exThumbSets}>{ex.sets}×{ex.reps}</span>
                          </div>
                        );
                      })}
                      {session.exercises.filter(e => e && e.name).length > 3 && (
                        <div className={styles.exThumbMore}>
                          +{session.exercises.filter(e => e && e.name).length - 3}
                        </div>
                      )}
                    </div>

                    <div className={styles.completionStatus}>
                      {completion ? (
                        completion.completed ? (
                          <span className={styles.statusCompleted}>
                            <CheckCircle size={16} /> Completado
                          </span>
                        ) : (
                          <span className={styles.statusMissed}>
                            <XCircle size={16} /> Faltou
                          </span>
                        )
                      ) : isPast ? (
                        <span className={styles.statusPending}>
                          <AlertTriangle size={16} /> Sem resposta
                        </span>
                      ) : (
                        <span className={styles.statusScheduled}>
                          <Calendar size={16} /> Agendado
                        </span>
                      )}
                    </div>

                    <div className={styles.dayActions}>
                      <button
                        onClick={() => openSessionDetails(day)}
                        className={styles.btnDetails}
                      >
                        Ver Detalhes
                      </button>
                      {canMark && (
                        <button
                          onClick={() => openCompletionModal(day)}
                          className={styles.btnMark}
                        >
                          {completion ? 'Editar' : 'Confirmar'}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className={styles.noSessionText}>Sem treino</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg" contentClassName={styles.modalContent}>
        <ModalHeader toggle={() => setModalOpen(false)}>
          Treino - {selectedSession && DAY_LABELS[selectedSession.day]}
        </ModalHeader>
        <ModalBody>
          {selectedSession && selectedSession.session && (
            <div className={styles.exercisesList}>
              <div className={styles.modalTime}>
                <Clock size={18} /> <strong>Horário:</strong> {selectedSession.session.startTime} - {selectedSession.session.endTime}
              </div>

              <h4><Dumbbell size={20} /> Exercícios:</h4>
              {selectedSession.session.exercises.filter(ex => ex && ex.name).map((ex, index) => {
                const videoId = (ex.videoLink || ex.video)?.match(/(?:v=|\/|youtu\.be\/)([\w-]{11})/)?.[1];
                return (
                  <div key={index} className={styles.exerciseCard}>
                    <div className={styles.exerciseHeader}>
                      <div className={styles.exNumber}>#{index + 1}</div>
                      <div className={styles.exerciseInfo}>
                        <div className={styles.exName}>{ex.name}</div>
                        <div className={styles.exStats}>
                          <span className={styles.statBadge}>
                            <strong>{ex.sets}</strong> séries
                          </span>
                          <span className={styles.statBadge}>
                            <strong>{ex.reps}</strong> reps
                          </span>
                        </div>
                      </div>
                    </div>

                    {videoId && (
                      <div className={styles.videoContainer}>
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={ex.name}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {ex.instructions && (
                      <div className={styles.exInstructions}>
                        <strong>Instruções:</strong> {ex.instructions}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className={styles.btnClose}>
            Fechar
          </button>
        </ModalFooter>
      </Modal>

      {/* Modal de Cumprimento */}
      <Modal isOpen={completionModalOpen} toggle={() => setCompletionModalOpen(false)} contentClassName={styles.modalContent}>
        <ModalHeader toggle={() => setCompletionModalOpen(false)}>
          Registar Treino - {selectedSession && DAY_LABELS[selectedSession.day]}
        </ModalHeader>
        <ModalBody>
          <div className={styles.completionForm}>
            <div className={styles.formField}>
              <label>
                <input
                  type="radio"
                  checked={completed}
                  onChange={() => setCompleted(true)}
                />
                <span>Completei o treino</span>
              </label>
            </div>

            <div className={styles.formField}>
              <label>
                <input
                  type="radio"
                  checked={!completed}
                  onChange={() => setCompleted(false)}
                />
                <span>Não completei o treino</span>
              </label>
            </div>

            {!completed && (
              <div className={styles.formField}>
                <label htmlFor="reason">Motivo:</label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="Indisposição">Indisposição</option>
                  <option value="Falta de tempo">Falta de tempo</option>
                  <option value="Compromisso inesperado">Compromisso inesperado</option>
                  <option value="Lesão">Lesão</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            )}

            {completed && (
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Prova (opcional):</label>
                <div className={styles.proofUpload}>
                  <label htmlFor="proofFile" className={styles.uploadBtn}>
                    <input
                      type="file"
                      id="proofFile"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setProofFile(file);
                          const reader = new FileReader();
                          reader.onload = (ev) => setProof(ev.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <Camera size={18} /> Escolher Foto
                  </label>
                </div>
                {proof && (
                  <div className={styles.proofPreview}>
                    <img src={proof} alt="Prova" />
                    <button type="button" onClick={() => { setProof(''); setProofFile(null); }} className={styles.removeProof}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className={styles.formField}>
              <label htmlFor="notes">Notas (opcional):</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Observações adicionais..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setCompletionModalOpen(false)} className={styles.btnCancel}>
            Cancelar
          </button>
          <button onClick={saveCompletion} className={styles.btnSave} disabled={!hasChanges()}>
            Guardar
          </button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default WorkoutView;
