import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import ChatNotifications from '../ChatNotifications';
import { initSocket } from '../../socket/socket';

const Layout = () => {
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                let data = null;
                let res = await fetch('/api/users/perfil', {
                    credentials: 'include',
                    headers: { Accept: 'application/json' }
                });
                if (res.ok) {
                    data = await res.json();
                }
                if (!data?.user?._id) {
                    res = await fetch('/api/trainers/perfil', {
                        credentials: 'include',
                        headers: { Accept: 'application/json' }
                    });
                    if (res.ok) {
                        data = await res.json();
                    }
                }
                if (data?.user?._id) {
                    setUserId(data.user._id);
                    setUserRole(data.user.role?.name);
                    initSocket();
                }
            } catch (e) { }
        };
        checkAuth();
    }, []);

    const handleMessageClick = React.useCallback((targetId) => {
        const query = targetId ? `?tab=messages&chatUser=${targetId}` : '?tab=messages';
        if (userRole === 'Trainer') {
            navigate(`/trainer${query}`);
        } else if (userRole === 'User') {
            navigate(`/user${query}`);
        }
    }, [userRole, navigate]);

    return (
        <>
            <Header />
            {userId && <ChatNotifications currentUserId={userId} onMessageClick={handleMessageClick} />}
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default Layout;
