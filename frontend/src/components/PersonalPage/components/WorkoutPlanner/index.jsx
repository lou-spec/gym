import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGetPerfil } from "../../../../hooks/useGetPerfil";
import { Save } from "lucide-react";
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import Swal from 'sweetalert2';
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

export const WorkoutPlanner = () => {
  const { register, handleSubmit, watch, setValue } = useForm();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [sessions, setSessions] = useState({});
  const [editingDay, setEditingDay] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useGetPerfil();
  const [selectedDays, setSelectedDays] = useState([]);
  const [timePickerDay, setTimePickerDay] = useState(null);
  const [tempStart, setTempStart] = useState('09:00');
  const [tempEnd, setTempEnd] = useState('10:00');
  const [activeSlot, setActiveSlot] = useState(null);
  const [selectedDayToView, setSelectedDayToView] = useState(null);
  const [originalSessions, setOriginalSessions] = useState({});
  const [planName, setPlanName] = useState('');

  useEffect(() => {
    if (workoutPlan) {
      setPlanName(workoutPlan.name || workoutPlan.goal || '');
    } else {
      setPlanName('');
    }
  }, [workoutPlan]);

  const getDayInfo = (name) => {
    const today = new Date();
    const currentDayIndex = (today.getDay() + 6) % 7;

    const ptToEn = {
      'Segunda': 'Monday', 'Seg': 'Monday',
      'Terça': 'Tuesday', 'Ter': 'Tuesday',
      'Quarta': 'Wednesday', 'Qua': 'Wednesday',
      'Quinta': 'Thursday', 'Qui': 'Thursday',
      'Sexta': 'Friday', 'Sex': 'Friday',
      'Sábado': 'Saturday', 'Sab': 'Saturday',
      'Domingo': 'Sunday', 'Dom': 'Sunday'
    };

    let targetName = ptToEn[name] || name;
    let targetDayIndex = DAYS_OF_WEEK.indexOf(targetName);

    if (targetDayIndex === -1) {
      console.warn('getDayInfo: Invalid day name:', name);

      targetDayIndex = DAYS_OF_WEEK.findIndex(d => d.toLowerCase() === name.toLowerCase());
      if (targetDayIndex === -1) return { date: today };
    }

    let diff = targetDayIndex - currentDayIndex;
    if (diff < 0) diff += 7;

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    return { date: targetDate };
  };

  const BODY_PARTS = [
    { id: 'peito', label: 'Peito', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=200&fit=crop' },
    { id: 'costas', label: 'Costas', img: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=300&h=200&fit=crop' },
    { id: 'ombros', label: 'Ombros', img: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=300&h=200&fit=crop' },
    { id: 'biceps', label: 'Bíceps', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=200&fit=crop' },
    { id: 'triceps', label: 'Tríceps', img: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=300&h=200&fit=crop' },
    { id: 'pernas', label: 'Pernas', img: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=300&h=200&fit=crop' },
    { id: 'gluteos', label: 'Glúteos', img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&h=200&fit=crop' },
    { id: 'abdominais', label: 'Abdominais', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop' },
    { id: 'cardio', label: 'Cardio', img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=300&h=200&fit=crop' },
  ];

  const EXERCISES = {
    peito: [
      { name: 'Supino Reto', sets: 4, reps: '8-12', video: 'https://www.youtube.com/watch?v=rT7DgCr-3pg', img: 'https://cdn.pixabay.com/photo/2017/08/07/14/02/man-2604149_640.jpg' },
      { name: 'Supino Inclinado', sets: 3, reps: '10-12', video: 'https://www.youtube.com/watch?v=jPLdzuHckI8', img: 'https://cdn.pixabay.com/photo/2016/11/19/12/43/barbell-1839086_640.jpg' },
      { name: 'Flexões', sets: 3, reps: '15-20', video: 'https://www.youtube.com/watch?v=IODxDxX7oi4', img: 'https://cdn.pixabay.com/photo/2017/04/27/08/29/man-2264825_640.jpg' },
      { name: 'Crucifixo', sets: 3, reps: '12-15', video: 'https://www.youtube.com/watch?v=eozdVDA78K0', img: 'https://cdn.pixabay.com/photo/2017/08/07/14/02/man-2604149_640.jpg' },
      { name: 'Chest Press Máquina', sets: 3, reps: '10-12', video: 'https://www.youtube.com/watch?v=xUm0BiZCWlQ', img: 'https://cdn.pixabay.com/photo/2016/11/29/09/00/dumbbell-1868763_640.jpg' },
    ],
    costas: [
      { name: 'Puxada Frontal', sets: 4, reps: '10-12', video: 'https://www.youtube.com/watch?v=CAwf7n6Luuc', img: 'https://cdn.pixabay.com/photo/2016/11/19/14/35/man-1839495_640.jpg' },
      { name: 'Remada Curvada', sets: 4, reps: '8-10', video: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ', img: 'https://cdn.pixabay.com/photo/2016/11/29/09/00/dumbbell-1868763_640.jpg' },
      { name: 'Pullover', sets: 3, reps: '12-15', video: 'https://www.youtube.com/watch?v=FK4rHfWKEac', img: 'https://cdn.pixabay.com/photo/2017/08/07/14/02/man-2604149_640.jpg' },
      { name: 'Remada Baixa', sets: 3, reps: '10-12', video: 'https://www.youtube.com/watch?v=xQNrFHEMhI4', img: 'https://cdn.pixabay.com/photo/2016/11/19/14/35/man-1839495_640.jpg' },
      { name: 'Elevações', sets: 3, reps: '6-10', video: 'https://www.youtube.com/watch?v=eGo4IYlbE5g', img: 'https://cdn.pixabay.com/photo/2016/03/27/21/59/sport-1284275_640.jpg' },
    ],
    ombros: [
      { name: 'Press Militar', sets: 4, reps: '8-10', video: 'https://www.youtube.com/watch?v=2yjwXTZQDDI', img: 'https://cdn.pixabay.com/photo/2016/11/29/09/00/dumbbell-1868763_640.jpg' },
      { name: 'Elevação Lateral', sets: 4, reps: '12-15', video: 'https://www.youtube.com/watch?v=3VcKaXpzqRo', img: 'https://cdn.pixabay.com/photo/2017/08/07/14/02/man-2604149_640.jpg' },
      { name: 'Elevação Frontal', sets: 3, reps: '12-15', video: 'https://www.youtube.com/watch?v=-t7fuZ0KhDA', img: 'https://cdn.pixabay.com/photo/2016/11/29/09/00/dumbbell-1868763_640.jpg' },
      { name: 'Arnold Press', sets: 3, reps: '10-12', video: 'https://www.youtube.com/watch?v=3ml7BH7mNwQ', img: 'https://cdn.pixabay.com/photo/2016/11/29/09/00/dumbbell-1868763_640.jpg' },
      { name: 'Face Pull', sets: 3, reps: '15-20', video: 'https://www.youtube.com/watch?v=rep-qVOkqgk', img: 'https://cdn.pixabay.com/photo/2016/11/19/14/35/man-1839495_640.jpg' },
    ],
    biceps: [
      { name: 'Rosca Direta', sets: 4, reps: '10-12', video: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo', img: 'https://cdn.pixabay.com/photo/2016/11/29/09/00/dumbbell-1868763_640.jpg' },
      { name: 'Rosca Martelo', sets: 3, reps: '10-12', video: 'https://www.youtube.com/watch?v=zC3nLlEvin4', img: 'https://cdn.pixabay.com/photo/2016/11/29/09/00/dumbbell-1868763_640.jpg' },
      { name: 'Rosca Concentrada', sets: 3, reps: '12-15', video: 'https://www.youtube.com/watch?v=0AUGkch3tzc', img: 'https://cdn.pixabay.com/photo/2016/11/29/09/00/dumbbell-1868763_640.jpg' },
      { name: 'Rosca Scott', sets: 3, reps: '10-12', video: 'https://www.youtube.com/watch?v=soxrZlIl35U', img: 'https://cdn.pixabay.com/photo/2016/11/29/09/00/dumbbell-1868763_640.jpg' },
      { name: 'Rosca Inclinada', sets: 3, reps: '10-12', video: 'https://www.youtube.com/watch?v=soxrZlIl35U', img: 'https://cdn.pixabay.com/photo/2016/11/29/09/00/dumbbell-1868763_640.jpg' },
    ],
    triceps: [
      { name: 'Triceps Pulley', sets: 4, reps: '12-15', video: 'https://www.youtube.com/watch?v=2-LAMcpzODU', img: 'https://cdn.pixabay.com/photo/2016/11/19/14/35/man-1839495_640.jpg' },
      { name: 'Triceps Francês', sets: 3, reps: '10-12', video: 'https://www.youtube.com/watch?v=d_KZxkY_0cM', img: 'https://cdn.pixabay.com/photo/2016/11/29/09/00/dumbbell-1868763_640.jpg' },
      { name: 'Mergulho Banco', sets: 3, reps: '10-15', video: 'https://www.youtube.com/watch?v=6kALZikXxLc', img: 'https://cdn.pixabay.com/photo/2017/04/27/08/29/man-2264825_640.jpg' },
      { name: 'Triceps Testa', sets: 3, reps: '10-12', video: 'https://www.youtube.com/watch?v=d_KZxkY_0cM', img: 'https://cdn.pixabay.com/photo/2017/08/07/14/02/man-2604149_640.jpg' },
      { name: 'Kickback', sets: 3, reps: '12-15', video: 'https://www.youtube.com/watch?v=6SS6K3lAwZ8', img: 'https://cdn.pixabay.com/photo/2016/11/29/09/00/dumbbell-1868763_640.jpg' },
    ],
    pernas: [
      { name: 'Agachamento', sets: 4, reps: '8-12', video: 'https://www.youtube.com/watch?v=ultWZbUMPL8', img: 'https://cdn.pixabay.com/photo/2016/11/19/12/43/barbell-1839086_640.jpg' },
      { name: 'Leg Press', sets: 4, reps: '10-12', video: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ', img: 'https://cdn.pixabay.com/photo/2016/11/19/14/35/man-1839495_640.jpg' },
      { name: 'Extensão de Pernas', sets: 3, reps: '12-15', video: 'https://www.youtube.com/watch?v=YyvSfVjQeL0', img: 'https://cdn.pixabay.com/photo/2016/11/19/14/35/man-1839495_640.jpg' },
      { name: 'Flexão de Pernas', sets: 3, reps: '12-15', video: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs', img: 'https://cdn.pixabay.com/photo/2016/11/19/14/35/man-1839495_640.jpg' },
      { name: 'Lunges', sets: 3, reps: '10/perna', video: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U', img: 'https://cdn.pixabay.com/photo/2017/04/27/08/29/man-2264825_640.jpg' },
    ],
    gluteos: [
      { name: 'Hip Thrust', sets: 4, reps: '10-12', video: 'https://www.youtube.com/watch?v=SEdqd1n0cvg', img: 'https://cdn.pixabay.com/photo/2016/11/19/12/43/barbell-1839086_640.jpg' },
      { name: 'Glute Bridge', sets: 3, reps: '15-20', video: 'https://www.youtube.com/watch?v=OUgsJ8-Vi0E', img: 'https://cdn.pixabay.com/photo/2017/04/27/08/29/man-2264825_640.jpg' },
      { name: 'Stiff', sets: 3, reps: '10-12', video: 'https://www.youtube.com/watch?v=1uDiW5--rAE', img: 'https://cdn.pixabay.com/photo/2016/11/19/12/43/barbell-1839086_640.jpg' },
      { name: 'Agachamento Sumo', sets: 3, reps: '12-15', video: 'https://www.youtube.com/watch?v=9ZuXKqRbT9k', img: 'https://cdn.pixabay.com/photo/2016/11/19/12/43/barbell-1839086_640.jpg' },
      { name: 'Abdução de Pernas', sets: 3, reps: '15-20', video: 'https://youtu.be/_ARUxqrII3Y?si=7Z1eWB77uQWPcBAA', img: 'https://cdn.pixabay.com/photo/2016/11/19/14/35/man-1839495_640.jpg' },
    ],
    abdominais: [
      { name: 'Crunch', sets: 4, reps: '20-25', video: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU', img: 'https://cdn.pixabay.com/photo/2017/04/27/08/29/man-2264825_640.jpg' },
      { name: 'Prancha', sets: 3, reps: '30-60s', video: 'https://www.youtube.com/watch?v=ASdvN_XEl_c', img: 'https://cdn.pixabay.com/photo/2017/04/27/08/29/man-2264825_640.jpg' },
      { name: 'Elevação de Pernas', sets: 3, reps: '15-20', video: 'https://www.youtube.com/watch?v=JB2oyawG9KI', img: 'https://cdn.pixabay.com/photo/2016/03/27/21/59/sport-1284275_640.jpg' },
      { name: 'Russian Twist', sets: 3, reps: '20/lado', video: 'https://www.youtube.com/watch?v=wkD8rjkodUI', img: 'https://cdn.pixabay.com/photo/2017/04/27/08/29/man-2264825_640.jpg' },
      { name: 'Mountain Climbers', sets: 3, reps: '30s', video: 'https://www.youtube.com/watch?v=nmwgirgXLYM', img: 'https://cdn.pixabay.com/photo/2017/04/27/08/29/man-2264825_640.jpg' },
    ],
    cardio: [
      { name: 'Corrida Passadeira', sets: 1, reps: '20-30min', video: 'https://youtu.be/8gWkLOFGzSo?si=w6_cmOc_W9TLUMo_', img: 'https://cdn.pixabay.com/photo/2015/07/02/10/40/writing-828911_640.jpg' },
      { name: 'Bicicleta', sets: 1, reps: '20-30min', video: 'https://youtu.be/fW-gDFOLaCk?si=pkSKWDJ01SiPx-Ro', img: 'https://cdn.pixabay.com/photo/2017/03/30/18/17/gym-2189830_640.jpg' },
      { name: 'Elíptica', sets: 1, reps: '20-30min', video: 'https://youtu.be/YWfswVvOaiI?si=M8ia3wO_M32eAIy_', img: 'https://cdn.pixabay.com/photo/2016/11/19/14/35/man-1839495_640.jpg' },
      { name: 'Burpees', sets: 4, reps: '10-15', video: 'https://www.youtube.com/watch?v=dZgVxmf6jkA', img: 'https://cdn.pixabay.com/photo/2017/04/27/08/29/man-2264825_640.jpg' },
      { name: 'Saltar à Corda', sets: 5, reps: '1min', video: 'https://youtu.be/IFgQfVQT_68?si=CzcQdKl1HicAtAVa', img: 'https://cdn.pixabay.com/photo/2016/03/27/21/59/sport-1284275_640.jpg' },
    ],
  };

  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [videoModal, setVideoModal] = useState(null);
  const [historyPlans, setHistoryPlans] = useState([]);
  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const weeklyFrequency = watch('weeklyFrequency');

  const daysWithSessions = Object.keys(sessions).length;
  const canAddMoreDays = selectedDays.length < parseInt(weeklyFrequency || 0);

  const TIME_SLOTS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];


  const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date,
        dateKey: date.toISOString().split('T')[0],
        dayName: DAY_LABELS[DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1]],
        englishDayName: ENGLISH_DAYS[date.getDay()],
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('pt-PT', { month: 'short' }),
        isToday: i === 0
      });
    }
    return days;
  };

  const next7Days = getNext7Days();
  const [pendingSelection, setPendingSelection] = useState(null);

  const toggleTimeSlot = (dayName, time) => {

    const existingSession = sessions[dayName];

    if (existingSession) {
      const newSessions = { ...sessions };
      delete newSessions[dayName];
      setSessions(newSessions);
      setSelectedDays(selectedDays.filter(d => d !== dayName));
      setPendingSelection(null);
      return;
    }

    if (pendingSelection && pendingSelection.dayName === dayName) {
      const startHour = parseInt(pendingSelection.time.split(':')[0]);
      const endHour = parseInt(time.split(':')[0]);

      if (endHour <= startHour) {
        setPendingSelection(null);
        return;
      }

      if (!selectedDays.includes(dayName)) {
        setSelectedDays([...selectedDays, dayName]);
      }
      setSessions({
        ...sessions,
        [dayName]: {
          startTime: pendingSelection.time,
          endTime: time,
          exercises: []
        }
      });
      setPendingSelection(null);
    } else if (selectedDays.includes(dayName) || canAddMoreDays) {
      setPendingSelection({ dayName, time });
    }
  };

  const isSlotSelected = (dayName, time) => {
    const session = sessions[dayName];
    if (!session) return false;
    const startHour = parseInt(session.startTime.split(':')[0]);
    const endHour = parseInt(session.endTime.split(':')[0]);
    const slotHour = parseInt(time.split(':')[0]);
    return slotHour >= startHour && slotHour < endHour;
  };

  const isPendingStart = (dayName, time) => {
    return pendingSelection && pendingSelection.dayName === dayName && pendingSelection.time === time;
  };

  const [pendingStart, setPendingStart] = useState(null);

  const handleCellClick = (dayName, hour) => {


    if (sessions[dayName]) {
      const session = sessions[dayName];
      const now = new Date();
      const [startHour, startMinute] = session.startTime.split(':');



      const dayInfo = getDayInfo(dayName);
      const sessionDateTime = new Date(dayInfo.date);
      sessionDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
      const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);



      setSelectedDayToView(selectedDayToView === dayName ? null : dayName);
      return;
    }


    if (pendingStart && pendingStart.dayName === dayName) {
      const startH = parseInt(pendingStart.hour);
      const endH = parseInt(hour);
      if (endH <= startH) {
        setPendingStart(null);
        return;
      }

      const now = new Date();


      const dayInfo = getDayInfo(dayName);
      const sessionDateTime = new Date(dayInfo.date);
      sessionDateTime.setHours(startH, 0, 0, 0);
      const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);

      if (hoursUntilSession < 2 && hoursUntilSession > 0) {
        toast.error('Não é possível criar sessão! Faltam menos de 2 horas.', {
          style: { background: '#ffffff', color: '#dc2626' },
          progressClassName: 'toast-progress-red',
          icon: <Save size={20} color="#ffffff" />
        });
        setPendingStart(null);
        return;
      }

      if (!selectedDays.includes(dayName)) {
        setSelectedDays([...selectedDays, dayName]);
      }
      setSessions({
        ...sessions,
        [dayName]: {
          startTime: `${pendingStart.hour}:00`,
          endTime: `${hour}:00`,
          exercises: []
        }
      });
      setPendingStart(null);
      setSelectedDayToView(dayName);
    } else if (selectedDays.includes(dayName) || canAddMoreDays) {
      setPendingStart({ dayName, hour });
    }
  };

  const isCellPending = (dayName, hour) => {
    return pendingStart && pendingStart.dayName === dayName && pendingStart.hour === hour;
  };

  const isCellInRange = (dayName, hour) => {
    if (!pendingStart || pendingStart.dayName !== dayName) return false;
    return parseInt(hour) > parseInt(pendingStart.hour);
  };



  const toggleDay = (dayName) => {
    if (selectedDays.includes(dayName)) {
      setSelectedDays(selectedDays.filter(d => d !== dayName));
      const newSessions = { ...sessions };
      delete newSessions[dayName];
      setSessions(newSessions);
    } else if (canAddMoreDays) {
      setSelectedDays([...selectedDays, dayName]);
    }
  };



  useEffect(() => {
    const freq = parseInt(weeklyFrequency) || 0;
    if (selectedDays.length > freq) {
      const daysToKeep = selectedDays.slice(0, freq);
      setSelectedDays(daysToKeep);
      const newSessions = {};
      daysToKeep.forEach(day => {
        if (sessions[day]) {
          newSessions[day] = sessions[day];
        }
      });
      setSessions(newSessions);
    }
  }, [weeklyFrequency]);

  useEffect(() => {
    const sessionsCount = Object.keys(sessions).length;
    if (sessionsCount > 0 && (!weeklyFrequency || parseInt(weeklyFrequency) < sessionsCount)) {
      setValue('weeklyFrequency', sessionsCount);
    }
  }, [sessions]);



  const loadClients = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/users/all-users?limit=100'), {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const data = await response.json();
      const currentUserId = currentUser?.data?._id;
      const userClients = (data.users || []).filter(u => {
        if (u.createdBy !== currentUserId) return false;
        if (!u.role) return true;
        if (typeof u.role === 'object' && u.role.name) {
          return u.role.name === 'User';
        }
        return true;
      });
      setClients(userClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Erro ao carregar clientes');
    }
  };

  const loadWorkoutPlan = async (clientId) => {
    setIsLoading(true);
    try {

      const plansResponse = await fetch(buildApiUrl('/api/workouts/plans/trainer'), {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const plansData = await plansResponse.json();
      const plan = plansData.plans.find(p => p.client._id === clientId);

      if (plan) {
        setWorkoutPlan(plan);
        setValue('weeklyFrequency', plan.weeklyFrequency);
        setPlanName(plan.name || plan.goal || '');


        const sessionsResponse = await fetch(buildApiUrl(`/api/workouts/sessions/${plan._id}`), {
          credentials: 'include',
          headers: { Accept: 'application/json' }
        });
        const sessionsData = await sessionsResponse.json();

        const sessionsMap = {};
        const daysWithSessions = [];
        sessionsData.sessions.forEach(session => {
          const fixedExercises = session.exercises?.map(ex => {
            if (ex.videoLink && !ex.img.includes('youtube.com')) {
              const videoId = ex.videoLink.match(/(?:v=|\/)([\ w-]{11})/)?.[1];
              return { ...ex, img: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` };
            }
            return ex;
          });
          sessionsMap[session.dayOfWeek] = { ...session, exercises: fixedExercises };
          daysWithSessions.push(session.dayOfWeek);
        });
        setSessions(sessionsMap);
        setOriginalSessions(JSON.parse(JSON.stringify(sessionsMap)));
        setSelectedDays(daysWithSessions);
      } else {
        setWorkoutPlan(null);
        setSessions({});
        setValue('weeklyFrequency', '');
      }


      const historyRes = await fetch(buildApiUrl(`/api/workouts/plans/history/${clientId}`), {
        credentials: 'include'
      });
      const historyData = await historyRes.json();
      if (historyData.plans) {
        setHistoryPlans(historyData.plans);
      }
    } catch (error) {
      console.error('Error loading workout plan:', error);
      toast.error('Erro ao carregar plano de treino');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.data?._id) {
      loadClients();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedClient) {
      setSessions({});
      setWorkoutPlan(null);
      setOriginalSessions({});
      setPlanName('');
      setValue('weeklyFrequency', '');
      loadWorkoutPlan(selectedClient);
    }
  }, [selectedClient]);

  const createPlan = async () => {
    if (!selectedClient) {
      toast.error('Selecione um cliente');
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/workouts/plans'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          weeklyFrequency: weeklyFrequency || 3,
          name: planName,
          goal: planName
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Plano criado!', {
          style: { background: '#ffffff', color: '#dc2626' },
          progressClassName: 'toast-progress-red',
          icon: <Save size={20} color="#ffffff" />
        });
        setWorkoutPlan(data.plan);
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Erro ao criar plano');
    }
  };

  const openDayEditor = (day) => {
    const session = sessions[day];


    if (session) {
      setEditingDay(day);
      setValue('startTime', session.startTime);
      setValue('endTime', session.endTime);
      setExercises(session.exercises || []);
      return;
    }


    if (!canAddMoreDays) {
      toast.error(`JÃ¡ atingiu o limite de ${weeklyFrequency} treinos por semana. Remova um treino existente para adicionar neste dia.`);
      return;
    }


    setEditingDay(day);
    setValue('startTime', '');
    setValue('endTime', '');
    setExercises([]);
  };

  const addExercise = () => {
    if (exercises.length >= 10) {
      toast.error('MÃ¡ximo de 10 exercÃ­cios por sessÃ£o');
      return;
    }
    setExercises([...exercises, {
      name: '',
      sets: 3,
      reps: '12',
      instructions: '',
      videoLink: '',
      order: exercises.length + 1
    }]);
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const removeExercise = (index) => {
    const updated = exercises.filter((_, i) => i !== index);

    updated.forEach((ex, i) => ex.order = i + 1);
    setExercises(updated);
  };

  const saveSession = async () => {
    if (!workoutPlan) {
      toast.error('Crie um plano primeiro');
      return;
    }

    if (!editingDay || !startTime || !endTime) {
      toast.error('Preencha dia, hora de inÃ­cio e fim');
      return;
    }

    if (exercises.length === 0) {
      toast.error('Adicione pelo menos um exercÃ­cio');
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/workouts/sessions'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutPlanId: workoutPlan._id,
          dayOfWeek: editingDay,
          startTime,
          endTime,
          exercises
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Treino salvo!');
        setSessions({ ...sessions, [editingDay]: data.session });
        setEditingDay(null);
        setExercises([]);
      }
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Erro ao salvar treino');
    }
  };

  const deleteSession = async (day) => {
    const session = sessions[day];
    if (!session) return;

    if (!window.confirm('Deseja apagar este treino?')) return;

    try {
      const response = await fetch(buildApiUrl(`/api/workouts/sessions/${session._id}`), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Treino apagado!');
        const updated = { ...sessions };
        delete updated[day];
        setSessions(updated);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Erro ao apagar');
    }
  };

  const updatePlanFrequency = async (newFreq) => {
    if (!workoutPlan || !newFreq) return;
    if (workoutPlan.weeklyFrequency === newFreq) return;

    try {
      const response = await fetch(buildApiUrl(`/api/workouts/plans/${workoutPlan._id}`), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyFrequency: newFreq })
      });

      if (response.ok) {
        setWorkoutPlan(prev => ({ ...prev, weeklyFrequency: newFreq }));
      }
    } catch (error) {
      console.error('Error updating frequency:', error);
    }
  };

  const updatePlanName = async () => {
    if (!workoutPlan || !planName) return;

    if (planName === (workoutPlan.name || workoutPlan.goal)) return;

    try {
      const response = await fetch(buildApiUrl(`/api/workouts/plans/${workoutPlan._id}`), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: planName, goal: planName })
      });

      if (response.ok) {
        toast.success('Nome do plano atualizado!', {
          style: { background: '#ffffff', color: '#dc2626' },
          progressClassName: 'toast-progress-red',
          icon: <Save size={20} color="#ffffff" />
        });

        setWorkoutPlan({ ...workoutPlan, name: planName, goal: planName });
      }
    } catch (error) {
      console.error('Error updating plan name:', error);
    }
  };

  const finalizePlan = async () => {
    if (!workoutPlan) return;

    const result = await Swal.fire({
      title: 'Finalizar Plano?',
      text: "O plano atual será arquivado no histórico. Poderás reativá-lo mais tarde.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      iconColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, finalizar!',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      color: '#1f2937'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(buildApiUrl(`/api/workouts/plans/${workoutPlan._id}`), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false, weeklyFrequency: parseInt(weeklyFrequency) })
      });

      if (response.ok) {
        Swal.fire({
          title: 'Sucesso!',
          text: 'Plano arquivado.',
          icon: 'success',
          confirmButtonColor: '#dc2626',
          iconColor: '#dc2626',
          background: '#ffffff',
          color: '#1f2937'
        });
        setWorkoutPlan(null);
        setSessions({});
        setPlanName('');
        setValue('weeklyFrequency', '');

        if (selectedClient) {
          loadWorkoutPlan(selectedClient);
        }
      } else {
        toast.error('Erro ao finalizar plano');
      }
    } catch (error) {
      console.error('Error finalizing:', error);
      toast.error('Erro de conexão');
    }
  };


  const deletePlan = async (planId) => {
    const result = await Swal.fire({
      title: 'Apagar Plano?',
      text: "Esta ação é irreversível. O plano e os treinos associados serão apagados.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      iconColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, apagar!',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      color: '#1f2937'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(buildApiUrl(`/api/workouts/plans/${planId}`), {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire({
          title: 'Apagado!',
          text: 'Plano removido com sucesso.',
          icon: 'success',
          confirmButtonColor: '#dc2626',
          iconColor: '#dc2626',
          background: '#ffffff',
          color: '#1f2937'
        });

        setHistoryPlans(historyPlans.filter(p => p._id !== planId));
      } else {
        toast.error('Erro ao apagar plano.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro de conexão ao apagar.');
    }
  };

  const reactivatePlan = async (plan) => {
    if (workoutPlan && workoutPlan._id === plan._id) return;

    const confirmTitle = workoutPlan
      ? 'Substituir Plano Atual?'
      : 'Reativar Plano?';

    const confirmText = workoutPlan
      ? `O plano "${planName}" será arquivado para ativar "${plan.name || plan.goal || 'Sem Nome'}".`
      : `Deseja reativar o plano "${plan.name || plan.goal || 'Sem Nome'}"?`;

    const result = await Swal.fire({
      title: confirmTitle,
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      iconColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, reativar!',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      color: '#1f2937'
    });

    if (!result.isConfirmed) return;

    try {
      if (workoutPlan) {
        await fetch(buildApiUrl(`/api/workouts/plans/${workoutPlan._id}`), {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: false })
        });
      }

      const response = await fetch(buildApiUrl(`/api/workouts/plans/${plan._id}`), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true })
      });

      if (response.ok) {
        Swal.fire({
          title: 'Reativado!',
          text: 'Plano carregado com sucesso.',
          icon: 'success',
          confirmButtonColor: '#dc2626',
          iconColor: '#dc2626',
          background: '#ffffff',
          color: '#1f2937'
        });
        setTimeout(() => {

          setSelectedClient(null);
          setTimeout(() => setSelectedClient(selectedClient), 100);
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Erro', 'Falha ao reativar plano.', 'error');
    }
  };







  const [clientSearchTerm, setClientSearchTerm] = useState('');


  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  return (
    <Container fluid className={styles.plannerContainer}>
      <h2 className={styles.title}>Planeamento de Treinos</h2>


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
          {filteredClients.length > 0 ? filteredClients.map(client => {
            const initials = client.name ? client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
            const isActive = selectedClient === client._id;
            return (
              <div
                key={client._id}
                className={`${styles.clientCard} ${isActive ? styles.active : ''}`}
                onClick={() => setSelectedClient(isActive ? null : client._id)}
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
          }) : (
            <div className={styles.emptyState}>
              {clientSearchTerm ? 'Nenhum cliente encontrado.' : 'Não tens clientes associados.'}
            </div>
          )}
        </div>

      </div>

      {selectedClient && (
        <div className={styles.selectionSection}>
          <h3 className={styles.sectionTitle}>Nome do Plano (Opcional)</h3>
          <div className={styles.planInputContainer}>
            <input
              type="text"
              className={styles.planInput}
              placeholder="Ex: Treino de Força (Inverno)"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              onBlur={updatePlanName}
            />
          </div>

          <h3 className={styles.sectionTitle}>
            Definir Frequencia Semanal <span style={{ fontSize: '0.8em', color: '#666', fontWeight: 'normal' }}>({Object.keys(sessions).length} agendados)</span>
          </h3>
          <div className={styles.frequencyOptions}>
            {[1, 2, 3, 4, 5, 6, 7].map(freq => {
              const isActive = parseInt(weeklyFrequency) === freq;
              const currentSessionsCount = Object.keys(sessions).length;
              const isBlocked = currentSessionsCount >= freq && !isActive;

              return (
                <div
                  key={freq}
                  className={`${styles.frequencyCard} ${isActive ? styles.active : ''} ${isBlocked ? styles.blocked : ''}`}
                  onClick={() => {
                    if (!isBlocked) {
                      setValue('weeklyFrequency', freq);
                      updatePlanFrequency(freq);
                    }
                  }}
                  style={{ cursor: isBlocked ? 'not-allowed' : 'pointer' }}
                >
                  <span className={styles.freqValue}>{freq}x</span>
                  <span className={styles.freqLabel}>semana</span>
                  {isBlocked && <div className={styles.blockedBadge}>Completo</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}



      {isLoading && <div className={styles.loading}>A carregar...</div>}


      {selectedClient && weeklyFrequency && (
        <>
          <div className={styles.miniCalendar}>
            <table className={styles.calTable}>
              <thead>
                <tr>
                  <th></th>
                  {next7Days.map(day => (
                    <th key={day.dateKey} className={day.isToday ? styles.todayTh : ''}>
                      <div>{day.dayName.substring(0, 3)}</div>
                      <div className={styles.thNum}>{day.dayNumber}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['08', '09', '10', '11', '12', '14', '15', '16', '17', '18', '19', '20'].map(hour => (
                  <tr key={hour}>
                    <td className={styles.hourTd}>{hour}:00</td>
                    {next7Days.map(day => {

                      const session = sessions[day.englishDayName];
                      const hourNum = parseInt(hour);

                      const startTimeH = session ? parseInt(session.startTime.split(':')[0]) : -1;
                      const endTimeH = session ? parseInt(session.endTime.split(':')[0]) : -1;

                      const isOccupied = session && hourNum >= startTimeH && hourNum < endTimeH;
                      const isPending = isCellPending(day.englishDayName, hour);
                      const isInRange = isCellInRange(day.englishDayName, hour);

                      const now = new Date();
                      const cellDateTime = new Date(day.date);
                      cellDateTime.setHours(parseInt(hour), 0, 0, 0);
                      const isPast = cellDateTime < now;

                      const hoursUntil = (cellDateTime - now) / (1000 * 60 * 60);
                      const isBlocked = !isPast && hoursUntil < 2 && hoursUntil > 0;

                      const canClick = isOccupied || (!isPast && !isBlocked && (selectedDays.includes(day.englishDayName) || canAddMoreDays || isPending || isInRange));

                      return (
                        <td
                          key={day.dateKey}
                          className={`${styles.cell} ${isOccupied ? styles.cellOccupied : ''} ${isPending ? styles.cellPending : ''} ${isInRange ? styles.cellInRange : ''} ${!canClick ? styles.cellDisabled : ''} ${isPast ? styles.cellPast : ''} ${isBlocked ? styles.cellBlocked : ''}`}
                          onClick={() => (isOccupied || (!isPast && !isBlocked)) && handleCellClick(day.englishDayName, hour)}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          {Object.keys(sessions).length > 0 && (
            <div className={styles.exerciseSlots}>
              {Object.keys(sessions).map(dayName => {

                const dayInfo = next7Days.find(d => d.englishDayName === dayName);
                const session = sessions[dayName];
                if (!session) return null;

                const startH = parseInt(session.startTime.split(':')[0]);
                const startM = parseInt(session.startTime.split(':')[1]) || 0;
                const endH = parseInt(session.endTime.split(':')[0]);
                const endM = parseInt(session.endTime.split(':')[1]) || 0;

                const slots = [];
                let currentH = startH;
                let currentM = startM;

                while (currentH < endH || (currentH === endH && currentM < endM)) {
                  const slotStart = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
                  currentM += 30;
                  if (currentM >= 60) {
                    currentM = 0;
                    currentH++;
                  }
                  const slotEnd = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
                  slots.push({ start: slotStart, end: slotEnd });
                }

                return (
                  <div key={dayName} className={styles.daySlots}>
                    <div className={styles.daySlotsHeader}>
                      <h4 className={styles.daySlotsTitle}>{dayInfo?.dayName} {dayInfo?.dayNumber} ({session.startTime}-{session.endTime})</h4>
                      <div className={styles.dayHeaderActions}>
                        <button
                          className={styles.btnCloseDay}
                          onClick={() => setSelectedDayToView(null)}
                        >
                          ← Fechar
                        </button>
                        {((new Date(dayInfo.date).setHours(parseInt(session.startTime.split(':')[0]), 0, 0, 0) - new Date()) / 36e5 >= 2) && (
                          <button
                            className={styles.btnRemoveDay}
                            onClick={async () => {
                              const now = new Date();
                              const [startHour, startMinute] = session.startTime.split(':');
                              const sessionDateTime = new Date(dayInfo.date);
                              sessionDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
                              const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);

                              if (hoursUntilSession < 2 && hoursUntilSession > 0) {
                                toast.error('Não é possível remover! Faltam menos de 2 horas para a sessão.', {
                                  style: { background: '#ffffff', color: '#dc2626' },
                                  progressClassName: 'toast-progress-red',
                                  icon: <Save size={20} color="#ffffff" />
                                });
                                return;
                              }

                              if (session._id) {
                                try {
                                  const response = await fetch(buildApiUrl(`/api/workouts/sessions/${session._id}`), {
                                    method: 'DELETE',
                                    credentials: 'include'
                                  });
                                  if (!response.ok) {
                                    toast.error('Erro ao remover do servidor');
                                    return;
                                  }
                                } catch (error) {
                                  toast.error('Erro ao remover do servidor');
                                  return;
                                }
                              }

                              const newSessions = { ...sessions };
                              delete newSessions[dayName];
                              setSessions(newSessions);
                              setSelectedDays(selectedDays.filter(d => d !== dayName));
                              setSelectedDayToView(null);
                              toast.success('Treino removido!', {
                                style: { background: '#ffffff', color: '#dc2626' },
                                progressClassName: 'toast-progress-red',
                                icon: <Save size={20} color="#ffffff" />
                              });
                            }}
                          >
                            ✕ Remover
                          </button>
                        )}

                      </div>
                    </div>
                    <div className={styles.slotsGrid}>
                      {slots.map((slot, idx) => {
                        const slotKey = `${dayName}_${idx}`;
                        const isActive = activeSlot === slotKey;
                        const exercise = session.exercises?.[idx];
                        const bodyPart = exercise?.bodyPart ? BODY_PARTS.find(b => b.id === exercise.bodyPart) : null;

                        const now = new Date();
                        const [slotHour, slotMinute] = slot.start.split(':');
                        const slotDateTime = new Date(dayInfo.date);
                        slotDateTime.setHours(parseInt(slotHour), parseInt(slotMinute), 0, 0);
                        const isSlotPast = slotDateTime < now;

                        const hoursUntilSlot = (slotDateTime - now) / (1000 * 60 * 60);
                        const isTimeBlocked = !isSlotPast && hoursUntilSlot < 2 && hoursUntilSlot > 0;


                        let isOutsideWindow = false;
                        const existingExercises = session.exercises || [];

                        if (!exercise) {
                          const filledIndices = existingExercises
                            .map((ex, i) => ex ? i : null)
                            .filter(i => i !== null);

                          if (filledIndices.length > 0) {
                            const [startH, startM] = session.startTime.split(':').map(Number);
                            const baseMinutes = startH * 60 + startM;

                            const filledMinutes = filledIndices.map(i => baseMinutes + (i * 30));
                            const earliestMinutes = Math.min(...filledMinutes);
                            const latestMinutes = Math.max(...filledMinutes);
                            const slotMinutes = parseInt(slotHour) * 60 + parseInt(slotMinute);

                            const maxAllowed = earliestMinutes + 300;
                            const minAllowed = latestMinutes - 300;

                            isOutsideWindow = slotMinutes >= maxAllowed || slotMinutes < minAllowed;
                          }
                        }

                        const isBlocked = isTimeBlocked || isOutsideWindow;

                        return (
                          <div
                            key={idx}
                            className={`${styles.slotCard} ${isActive ? styles.slotActive : ''} ${bodyPart ? styles.slotFilled : ''} ${isSlotPast ? styles.slotPast : ''} ${isBlocked ? styles.slotBlocked : ''} ${isOutsideWindow ? styles.slotOutsideWindow : ''}`}
                            onClick={() => {
                              if (!isSlotPast && !isOutsideWindow) {
                                if (isBlocked) {
                                  toast.error('Não é possível editar! Faltam menos de 2 horas para esta sessão.', {
                                    style: { background: '#ffffff', color: '#dc2626' },
                                    progressClassName: 'toast-progress-red',
                                    icon: <Save size={20} color="#ffffff" />
                                  });
                                  return;
                                }
                                setActiveSlot(isActive ? null : slotKey);
                              } else if (isOutsideWindow) {
                                toast.error('Limite de 5 horas atingido!', {
                                  style: { background: '#ffffff', color: '#dc2626' },
                                  progressClassName: 'toast-progress-red',
                                  icon: <Save size={20} color="#ffffff" />
                                });
                              }
                            }}
                          >
                            <div className={styles.slotTime}>{slot.start}-{slot.end}</div>
                            {exercise?.name ? (
                              <div className={styles.slotBody}>
                                {(exercise.video || exercise.img) && (
                                  <div
                                    className={styles.slotImgContainer}
                                    onClick={(e) => {
                                      if (exercise.video || exercise.videoLink) {
                                        e.stopPropagation();
                                        const videoId = (exercise.video || exercise.videoLink).match(/(?:v=|\/)([\w-]{11})/)?.[1];
                                        if (videoId) setVideoModal({ name: exercise.name, videoId });
                                      }
                                    }}
                                  >
                                    <img
                                      src={(exercise.video || exercise.videoLink) ? `https://img.youtube.com/vi/${(exercise.video || exercise.videoLink).match(/(?:v=|\/)([\w-]{11})/)?.[1]}/mqdefault.jpg` : exercise.img}
                                      alt={exercise.name}
                                      className={styles.slotExImg}
                                    />
                                    {(exercise.video || exercise.videoLink) && <div className={styles.slotPlayOverlay}>▶</div>}
                                  </div>
                                )}
                                <span className={styles.slotExName}>{exercise.name}</span>
                                <span className={styles.slotExSets}>{exercise.sets}×{exercise.reps}</span>
                                <button
                                  className={styles.btnRemoveSlot}
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    const now = new Date();
                                    const [startHour, startMinute] = slot.start.split(':');
                                    const sessionDateTime = new Date(dayInfo.date);
                                    sessionDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
                                    const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);



                                    if (hoursUntilSession < 2 && hoursUntilSession > 0) {
                                      toast.error('Não é possível remover! Faltam menos de 2 horas.', {
                                        style: { background: '#ffffff', color: '#dc2626' },
                                        progressClassName: 'toast-progress-red',
                                        icon: <Save size={20} color="#ffffff" />
                                      });
                                      return;
                                    }

                                    const newExercises = [...(session.exercises || [])];
                                    newExercises[idx] = null;
                                    setSessions({
                                      ...sessions,
                                      [dayName]: { ...session, exercises: newExercises }
                                    });
                                  }}
                                >✕</button>
                              </div>
                            ) : (
                              <div className={styles.slotEmpty}>Clica para escolher</div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {activeSlot?.startsWith(dayName) && !selectedBodyPart && (
                      <div className={styles.bodyPartMenu}>
                        <p className={styles.bodyPartTitle}>Escolhe a parte do corpo:</p>
                        <div className={styles.bodyPartGrid}>
                          {BODY_PARTS.map(part => (
                            <button
                              key={part.id}
                              className={styles.bodyPartBtn}
                              onClick={() => setSelectedBodyPart(part.id)}
                            >
                              <img src={part.img} alt={part.label} className={styles.partImg} />
                              <span>{part.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeSlot?.startsWith(dayName) && selectedBodyPart && (
                      <div className={styles.exerciseMenu}>
                        <div className={styles.exerciseMenuHeader}>
                          <button
                            className={styles.btnBack}
                            onClick={() => setSelectedBodyPart(null)}
                          >
                            ← Voltar
                          </button>
                          <p className={styles.exerciseMenuTitle}>
                            Exercícios de {BODY_PARTS.find(b => b.id === selectedBodyPart)?.label}:
                          </p>
                        </div>
                        <div className={styles.exerciseGrid}>
                          {EXERCISES[selectedBodyPart]?.map((ex, exIdx) => (
                            <div
                              key={exIdx}
                              className={styles.exerciseCard}
                              onClick={() => {
                                const slotIdx = parseInt(activeSlot.split('_')[1]);
                                const existingExercises = session.exercises || [];

                                const filledIndices = existingExercises
                                  .map((ex, i) => ex ? i : null)
                                  .filter(i => i !== null);

                                if (filledIndices.length > 0) {
                                  const [startH, startM] = session.startTime.split(':').map(Number);
                                  const baseMinutes = startH * 60 + startM;

                                  const filledMinutes = filledIndices.map(i => baseMinutes + (i * 30));
                                  const earliestMinutes = Math.min(...filledMinutes);
                                  const latestMinutes = Math.max(...filledMinutes);
                                  const newSlotMinutes = baseMinutes + (slotIdx * 30);

                                  const maxAllowed = earliestMinutes + 300;
                                  const minAllowed = latestMinutes - 300;

                                  if (newSlotMinutes >= maxAllowed || newSlotMinutes < minAllowed) {
                                    toast.error('Limite de 5 horas atingido! Não podes adicionar exercícios fora desta janela.', {
                                      style: { background: '#ffffff', color: '#dc2626' },
                                      progressClassName: 'toast-progress-red',
                                      icon: <Save size={20} color="#dc2626" />
                                    });
                                    return;
                                  }
                                }

                                const newExercises = [...existingExercises];
                                newExercises[slotIdx] = {
                                  name: ex.name,
                                  bodyPart: selectedBodyPart,
                                  sets: ex.sets,
                                  reps: ex.reps,
                                  video: ex.video
                                };
                                setSessions({
                                  ...sessions,
                                  [dayName]: { ...session, exercises: newExercises }
                                });
                                setActiveSlot(null);
                                setSelectedBodyPart(null);
                              }}
                            >
                              <div
                                className={styles.exerciseVideoThumb}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const videoId = ex.video.match(/(?:v=|\/)([\w-]{11})/)?.[1];
                                  setVideoModal({ name: ex.name, videoId });
                                }}
                              >
                                <img
                                  src={`https://img.youtube.com/vi/${ex.video.match(/(?:v=|\/)([\w-]{11})/)?.[1]}/mqdefault.jpg`}
                                  alt={ex.name}
                                  className={styles.exerciseCardImg}
                                />
                                <div className={styles.playOverlay}>▶</div>
                              </div>
                              <div className={styles.exerciseCardContent}>
                                <h5 className={styles.exerciseCardName}>{ex.name}</h5>
                                <p className={styles.exerciseCardSets}>{ex.sets} sets × {ex.reps}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(() => {
                      const originalSession = originalSessions[dayName];
                      if (!originalSession) return true;

                      const currentExercises = session.exercises || [];
                      const originalExercises = originalSession.exercises || [];

                      if (currentExercises.length !== originalExercises.length) return true;

                      return currentExercises.some((ex, idx) => {
                        const orig = originalExercises[idx];
                        if (!ex && !orig) return false;
                        if (!ex || !orig) return true;
                        return ex.name !== orig.name || ex.sets !== orig.sets || ex.reps !== orig.reps;
                      });
                    })() && (
                        <div className={styles.saveSessionSection}>
                          {((new Date(dayInfo.date).setHours(parseInt(session.startTime.split(':')[0]), 0, 0, 0) - new Date()) / 36e5 >= 2) && (

                            <button
                              className={styles.btnSaveSession}
                              onClick={async () => {
                                const now = new Date();
                                const [startHour, startMinute] = session.startTime.split(':');
                                const sessionDateTime = new Date(dayInfo.date);
                                sessionDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
                                const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);

                                if (hoursUntilSession < 2 && hoursUntilSession > 0) {
                                  toast.error('Não é possível editar! Faltam menos de 2 horas para a sessão.', {
                                    style: { background: '#ffffff', color: '#dc2626' },
                                    progressClassName: 'toast-progress-red',
                                    icon: <Save size={20} color="#ffffff" />
                                  });
                                  return;
                                }

                                try {
                                  const validExercises = session.exercises.filter(ex => ex && ex.name);

                                  let currentPlanId = workoutPlan?._id;

                                  if (!currentPlanId) {
                                    const planResponse = await fetch(buildApiUrl('/api/workouts/plans'), {
                                      method: 'POST',
                                      credentials: 'include',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        clientId: selectedClient,
                                        weeklyFrequency: parseInt(weeklyFrequency) || 1,
                                        goal: planName || 'Hypertrophy',
                                        name: planName,
                                        startDate: new Date(),
                                        notes: ''
                                      })
                                    });
                                    const planData = await planResponse.json();
                                    if (planData.success || planData._id) {
                                      const newPlan = planData.plan || planData;
                                      setWorkoutPlan(newPlan);
                                      currentPlanId = newPlan._id;
                                    } else {
                                      throw new Error('Falha ao criar plano base');
                                    }
                                  }

                                  const response = await fetch(buildApiUrl('/api/workouts/sessions'), {
                                    method: 'POST',
                                    credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      workoutPlanId: currentPlanId,
                                      dayOfWeek: dayName,
                                      startTime: session.startTime,
                                      endTime: session.endTime,
                                      exercises: validExercises.map((ex, idx) => ({
                                        name: ex.name,
                                        sets: ex.sets || 3,
                                        reps: ex.reps || '12',
                                        img: (ex.video || ex.videoLink) ? `https://img.youtube.com/vi/${(ex.video || ex.videoLink).match(/(?:v=|\/)([\w-]{11})/)?.[1]}/mqdefault.jpg` : (ex.img || ''),
                                        videoLink: ex.video || ex.videoLink,
                                        order: idx + 1
                                      }))
                                    })
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    toast.success('Alterações guardadas!', {
                                      style: { background: '#ffffff', color: '#dc2626' },
                                      progressClassName: 'toast-progress-red',
                                      icon: <Save size={20} color="#ffffffff" />
                                    });
                                    const updatedSessions = { ...sessions, [dayName]: data.session };
                                    setSessions(updatedSessions);
                                    setOriginalSessions(JSON.parse(JSON.stringify(updatedSessions)));
                                  }
                                } catch (error) {
                                  console.error('Error saving:', error);
                                  toast.error('Erro ao guardar');
                                }
                              }}
                            >
                              Guardar Alterações
                            </button>
                          )}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}





        </>
      )}



      {videoModal && (
        <div className={styles.videoModal} onClick={() => setVideoModal(null)}>
          <div className={styles.videoModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.videoModalHeader}>
              <h4 className={styles.videoModalTitle}>{videoModal.name}</h4>
              <button className={styles.btnCloseVideo} onClick={() => setVideoModal(null)}>✕</button>
            </div>
            <iframe
              className={styles.videoIframe}
              src={`https://www.youtube.com/embed/${videoModal.videoId}`}
              title={videoModal.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}


      {!isLoading && selectedClient && workoutPlan && (
        <div className={styles.finalizePlanSection}>
          <div className={styles.planSummary}>
            <h4>Plano Atual: <span>{planName || 'Sem Nome'}</span></h4>
            <p>Gerencie o seu plano atual:</p>
          </div>


          <button
            className={styles.btnSaveSession}
            onClick={finalizePlan}
            style={{ backgroundColor: '#1f2937', opacity: 0.9 }}
          >
            Finalizar Plano
          </button>
        </div>

      )}

      {selectedClient && historyPlans.length > 0 && (
        <div className={styles.historySection}>
          <h3>Historico de Planos Passados</h3>
          <div className={styles.historyGrid}>
            {historyPlans.map(plan => (
              <div key={plan._id} className={styles.historyCard}>
                <div className={styles.historyHeader}>
                  <div className={styles.headerLeft}>
                    <div className={styles.historyName}>{plan.name || plan.goal || 'Plano Sem Nome'}</div>
                    <div className={styles.historyDate}>
                      {new Date(plan.createdAt).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[plan.active ? 'active' : 'completed']}`}>
                    {plan.active ? 'Ativo' : 'Concluído'}
                  </span>
                </div>
                <div className={styles.historyStats}>
                  <div className={styles.stat}>
                    <span className={styles.label}>Frequência</span>
                    <span className={styles.value}>{plan.weeklyFrequency}x/sem</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>Criado por</span>
                    <span className={styles.value}>Treinador</span>
                  </div>
                  <div className={styles.historyActions}>
                    <button
                      className={styles.btnReactivate}
                      onClick={() => reactivatePlan(plan)}
                    >
                      Editar / Reativar
                    </button>
                    <button
                      className={styles.btnReactivate}
                      onClick={() => deletePlan(plan._id)}
                    >
                      Apagar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


    </Container>
  );
};

export default WorkoutPlanner;
