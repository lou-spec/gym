import React, { useMemo, useState } from "react";
import { TabContext } from "./TabContext";

export const TabProvider = ({ children }) => {
  const [currentTab, setTab] = useState("Users");
  const [gamesCount, setGamesCount] = useState(0);

  const value = useMemo(
    () => ({
      currentTab,
      setTab,
      gamesCount,
      setGamesCount,
    }),
    [currentTab, gamesCount]
  );

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
};
