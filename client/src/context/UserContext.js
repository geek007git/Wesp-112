import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import http from "../api/http";

const UserContext = createContext({
  user: null,
  loading: true,
  refresh: () => {},
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await http.post("/user/getUserData");
      setUser(res.data.success ? res.data.data : null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <UserContext.Provider value={{ user, loading, refresh, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
