import React, { useContext, useState } from "react";
import styles from "./styles.module.scss";
import { TabContext } from "../AdminPage/contexts/TabProvider/TabContext.jsx";
import { UsersContext } from "../../contexts/UsersProvider/UsersContext.jsx";
import { UsersIcon, LogOut } from "lucide-react";
import { showSwalSuccess } from "../../utils/swalTheme";
import { buildApiUrl } from "../../utils/api";

import {
  Row,
  Container,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import Users from "./components/Users/index.jsx";
import DisassociationRequests from "./components/DisassociationRequests/index.jsx";

const AdminPage = () => {

  const [activePage, setActivePage] = useState("1");
  const { countUsers } = useContext(UsersContext);

  const navItems = [
    {
      id: "1",
      title: "Users",
      count: countUsers,
      icon: <UsersIcon size={18} />,
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
    },
  ];

  const items = [
    {
      id: "1",
      children: (
        <>
          <Users />
          <DisassociationRequests />
        </>
      ),
    },
  ];


  return (
    <Container className={styles.container}>
      <h1>Admin</h1>
      <Row className={styles.row}>
        <Nav tabs>
          <div className={styles.sidebarTitle}>Admin Dashboard</div>
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
                    {item.count !== undefined && (<span className={styles.count} style={{ marginLeft: '8px' }}>{item.count}</span>)}
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

export default AdminPage;
