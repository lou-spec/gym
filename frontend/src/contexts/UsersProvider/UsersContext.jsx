import React from 'react';

const context ={
    setUsers: () => {},
    countUsers: () => {}
};

export const UsersContext = React.createContext(context);