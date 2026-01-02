import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Row,
  Container,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { Clients } from "./components/Clients";
import WorkoutPlanner from "./components/WorkoutPlanner";
import { Perfil } from "./components/Perfil";
import Dashboard from "../Dashboard";
import Chat from "../Chat";
import styles from "./styles.module.scss";
import { useGetPerfil } from "../../hooks/useGetPerfil";
import {
  socketAddListener,
  socketRemoveListener,
  initSocket,
} from "../../socket/socket";
import { toast } from "react-toastify";
import { User, Users, ClipboardList, LayoutDashboard, MessageCircle, LogOut } from "lucide-react";
import { showSwalSuccess } from "../../utils/swalTheme";
import { buildApiUrl } from "../../utils/api";


const PersonalPage = () => {
  const [activePage, setActivePage] = useState("1");
  const [searchParams] = useSearchParams();
  const { isError, isLoading, user, load } = useGetPerfil("trainers");
  const [targetChatUser, setTargetChatUser] = useState(null); // State for targeting chat

  const listenerConfigureRef = useRef(false);
  const userRef = useRef(user?.data); // Ref to avoid stale closure in listener

  useEffect(() => {
    userRef.current = user?.data;
  }, [user.data]);

  const newNotification = (data) => {

    if (data.key === "workout-missed") {
      toast.warn(data.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      toast.info(data.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  useEffect(() => {
    initSocket();
    if (!listenerConfigureRef.current) {
      const handleNotification = (data) => {
        newNotification(data);
      };

      // Removed local listener as it's now handled globally in ChatNotifications
      listenerConfigureRef.current = true;
    }
    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('tab') === 'messages') {
      setActivePage("5");
      const chatUser = searchParams.get('chatUser');
      if (chatUser) {
        setTargetChatUser(chatUser);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const handleNavigateToChat = (event) => {
      if (event.detail && event.detail.targetUserId) {
        setTargetChatUser(event.detail.targetUserId);
      }
      setActivePage("5");
    };
    window.addEventListener('navigateToChat', handleNavigateToChat);
    return () => window.removeEventListener('navigateToChat', handleNavigateToChat);
  }, []);

  const navItems = [
    {
      id: "1",
      title: "Perfil",
      icon: <User size={18} />,
    },
    {
      id: "2",
      title: "Clientes",
      icon: <Users size={18} />,
    },
    {
      id: "3",
      title: "Planos de Treino",
      icon: <ClipboardList size={18} />,
    },
    {
      id: "4",
      title: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: "5",
      title: "Mensagens",
      icon: <MessageCircle size={18} />,
    },
    {
      id: "logout",
      title: "Logout",
      icon: <LogOut size={18} />,
      onClick: async () => {
        try {
          await fetch(buildApiUrl('/api/auth/logout'), {
            method: 'POST',
            credentials: 'include'
          });
        } catch (e) {
          console.error('Logout error:', e);
        }
        await showSwalSuccess({
          title: 'Logout com sucesso!',
          text: 'Até à próxima!',
          timer: 1500,
          showConfirmButton: false
        });
        window.dispatchEvent(new Event('auth-change'));
        window.location.replace("/");
      }
    }
  ];

  const items = [
    {
      id: "1",
      children: <Perfil user={user.data} onUpdate={load} />,
    },
    {
      id: "2",
      children: <Clients />,
    },
    {
      id: "3",
      children: <WorkoutPlanner />,
    },
    {
      id: "4",
      children: <Dashboard isTrainer={true} trainerId={user.data?._id} />,
    },
    {
      id: "5",
      children: <Chat
        currentUserId={user.data?._id}
        currentUserName={user.data?.name}
        isTrainer={true}
        targetUserId={targetChatUser}
        onTargetSelected={() => setTargetChatUser(null)}
      />,
    },
  ];

  return (
    <Container className={styles.container}>
      <h1>Profile of Trainer {user.data && user.data.name}</h1>
      <Row className={styles.row}>
        <Nav tabs>
          <div className={styles.sidebarTitle}>Área do Treinador</div>
          {navItems.map((item) => {
            return (
              <NavItem key={item.id}>
                <NavLink
                  className={item.id === activePage ? 'active' : ''}
                  onClick={() => item.onClick ? item.onClick() : setActivePage(item.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%', paddingLeft: '20px' }}>
                    {item.icon && <span style={{ marginRight: '12px', display: 'flex' }}>{item.icon}</span>}
                    <span>{item.title}</span>
                    {item.count && (<span className={styles.count} style={{ marginLeft: 'auto', marginRight: '10px' }}>{item.count}</span>)}
                  </div>
                </NavLink>
              </NavItem>
            );
          })}
        </Nav>
        <TabContent activeTab={activePage}>
          {items.map((item) => {
            return (
              <TabPane key={item.id} tabId={item.id}>
                {item.children}
              </TabPane>
            );
          })}
        </TabContent>
      </Row>
      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '40px' }}>
      </div>
    </Container>
  );
};
export default PersonalPage;