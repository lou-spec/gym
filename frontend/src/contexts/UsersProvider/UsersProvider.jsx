import React, { useMemo, useState } from "react";
import { UsersContext } from "./UsersContext";

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  const value = useMemo(
    () => ({
      users,
      setUsers,
      countUsers: users.filter(user => !user.role?.scope?.includes('admin')).length,
    }),
    [users]
  );

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};
