import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Order } from "@/types";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  orders: Order[];
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  adminLogin: (email: string, password: string) => boolean;
  logout: () => void;
  placeOrder: (order: Omit<Order, "id" | "user_id" | "user_name" | "email" | "status" | "created_at" | "points_earned">) => void;
  approveOrder: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "admin@friendscafe.com";
const ADMIN_PASSWORD = "admin123";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("friends-cafe-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("friends-cafe-admin") === "true";
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("friends-cafe-orders");
    return saved ? JSON.parse(saved) : [];
  });
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("friends-cafe-users");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) localStorage.setItem("friends-cafe-user", JSON.stringify(user));
    else localStorage.removeItem("friends-cafe-user");
  }, [user]);

  useEffect(() => {
    localStorage.setItem("friends-cafe-admin", String(isAdmin));
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem("friends-cafe-orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("friends-cafe-users", JSON.stringify(users));
  }, [users]);

  const signup = (name: string, email: string, password: string) => {
    const existing = users.find(u => u.email === email);
    if (existing) { toast.error("Email already registered"); return false; }
    const newUser: User = { id: crypto.randomUUID(), name, email, reward_points: 0, created_at: new Date().toISOString() };
    setUsers(prev => [...prev, { ...newUser, password } as any]);
    setUser(newUser);
    toast.success("Account created successfully!");
    return true;
  };

  const login = (email: string, password: string) => {
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (!found) { toast.error("Invalid credentials"); return false; }
    const { password: _, ...safeUser } = found as any;
    setUser(safeUser);
    toast.success("Welcome back!");
    return true;
  };

  const adminLogin = (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      toast.success("Admin logged in");
      return true;
    }
    toast.error("Invalid admin credentials");
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    toast.success("Logged out");
  };

  const placeOrder = (orderData: Omit<Order, "id" | "user_id" | "user_name" | "email" | "status" | "created_at" | "points_earned">) => {
    if (!user) return;
    const newOrder: Order = {
      ...orderData,
      id: crypto.randomUUID(),
      user_id: user.id,
      user_name: user.name,
      email: user.email,
      status: "Pending",
      created_at: new Date().toISOString(),
      points_earned: 0,
    };
    setOrders(prev => [newOrder, ...prev]);
    toast.success("Order placed successfully!");
  };

  const approveOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const points = Math.floor(o.total_amount / 100) * 10;
      // Update user points
      setUsers(prevUsers => prevUsers.map(u => u.id === o.user_id ? { ...u, reward_points: (u.reward_points || 0) + points } : u));
      // Update current user if it's them
      setUser(prevUser => prevUser && prevUser.id === o.user_id ? { ...prevUser, reward_points: (prevUser.reward_points || 0) + points } : prevUser);
      return { ...o, status: "Approved" as const, points_earned: points };
    }));
    toast.success("Order approved & points awarded!");
  };

  const rejectOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Rejected" as const } : o));
    toast.success("Order rejected");
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, orders, login, signup, adminLogin, logout, placeOrder, approveOrder, rejectOrder }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
