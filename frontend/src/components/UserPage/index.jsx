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
import WorkoutView from "./components/WorkoutView";
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
import { User, Dumbbell, LayoutDashboard, MessageCircle, LogOut } from "lucide-react";
import { showSwalSuccess } from "../../utils/swalTheme";
import { buildApiUrl } from "../../utils/api";

const UserPage = () => {
  const [activePage, setActivePage] = useState("1");
  const [searchParams] = useSearchParams();
  const { isError, isLoading, user, load } = useGetPerfil("users");

  const listenerConfigureRef = useRef(false);

  const newNotification = (data) => {
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
  };

  useEffect(() => {
    initSocket();
    if (!listenerConfigureRef.current) {
      const handleNotification = (data) => {
        newNotification(data);
      };
      socketAddListener("admin_notifications", handleNotification);
      listenerConfigureRef.current = true;
    }
    return () => {
      socketRemoveListener("admin_notifications");
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('tab') === 'messages') {
      setActivePage("4");
      const chatUser = searchParams.get('chatUser');
      if (chatUser) {
        setChatTargetUserId(chatUser);
      }
    }
  }, [searchParams]);

  const [chatTargetUserId, setChatTargetUserId] = useState(null);

  useEffect(() => {
    const handleNavigateToChat = (e) => {
      if (e.detail?.targetUserId) {
        setChatTargetUserId(e.detail.targetUserId);
      }
      setActivePage("4");
    };
    window.addEventListener('navigateToChat', handleNavigateToChat);
    return () => window.removeEventListener('navigateToChat', handleNavigateToChat);
  }, []);

  const navItems = [
    {
      id: "1",
      title: "O Meu Perfil",
      icon: <User size={18} />,
    },
    {
      id: "2",
      title: "O Meu Treino",
      icon: <Dumbbell size={18} />,
    },
    {
      id: "3",
      title: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: "4",
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
            credentials: 'include',
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
        window.location.href = "/";
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
      children: <WorkoutView />,
    },
    {
      id: "3",
      children: <Dashboard clientId={user.data?._id} isTrainer={false} />,
    },
    {
      id: "4",
      children: <Chat
        currentUserId={user.data?._id}
        currentUserName={user.data?.name}
        isTrainer={false}
        targetUserId={chatTargetUserId}
        onTargetSelected={() => setChatTargetUserId(null)}
      />,
    },
  ];

  return (
    <Container className={styles.container}>
      <h1>Profile of User {user.data.name}</h1>
      <Row className={styles.row}>
        <Nav tabs>
          <div className={styles.sidebarTitle}>O Meu Perfil</div>
          {navItems.map((item) => {
            return (
              <NavItem key={item.id}>
                <NavLink
                  className={item.id === activePage ? 'active' : ''}
                  onClick={() => item.onClick ? item.onClick() : setActivePage(item.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    {item.icon && <span style={{ marginRight: '8px' }}>{item.icon}</span>}
                    <span>{item.title}</span>
                    {item.count && (<span className={styles.count} style={{ marginLeft: '8px' }}>{item.count}</span>)}
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
    </Container>
  );
};
export default UserPage;