import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User, Order, OrderItem } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupaUser } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  orders: Order[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  placeOrder: (order: { items: OrderItem[]; total_amount: number }) => Promise<void>;
  approveOrder: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string) => Promise<void>;
  adjustPoints: (userId: string, adjustment: number) => Promise<void>;
  allUsers: User[];
  refreshOrders: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (supaUser: SupaUser) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", supaUser.id).single();
    if (data) {
      setUser({ id: data.id, name: data.name, email: data.email, reward_points: data.reward_points, created_at: data.created_at });
    }
  };

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
    return !!data;
  };

  const fetchOrders = useCallback(async (userId?: string, admin?: boolean) => {
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    // RLS handles filtering - admins see all, users see own
    const { data: ordersData } = await query;
    if (!ordersData) return;

    // Fetch order items for all orders
    const orderIds = ordersData.map(o => o.id);
    if (orderIds.length === 0) { setOrders([]); return; }
    
    const { data: itemsData } = await supabase.from("order_items").select("*").in("order_id", orderIds);
    
    const mapped: Order[] = ordersData.map(o => ({
      id: o.id,
      user_id: o.user_id,
      user_name: o.user_name,
      email: o.email,
      total_amount: o.total_amount,
      status: o.status as Order["status"],
      points_earned: o.points_earned,
      created_at: o.created_at,
      items: (itemsData || []).filter(i => i.order_id === o.id).map(i => ({
        menu_item_id: i.menu_item_id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    }));
    setOrders(mapped);
  }, []);

  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  const fetchAllUsers = useCallback(async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) {
      setAllUsers(data.map(d => ({ id: d.id, name: d.name, email: d.email, reward_points: d.reward_points, created_at: d.created_at })));
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    await fetchAllUsers();
  }, [fetchAllUsers]);

  // Init auth
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user);
        const admin = await checkAdmin(session.user.id);
        await fetchOrders();
        await fetchAllUsers();
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user);
        const admin = await checkAdmin(session.user.id);
        await fetchOrders();
        await fetchAllUsers();
      } else {
        setUser(null);
        setIsAdmin(false);
        setOrders([]);
        setAllUsers([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Poll orders every 5s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      await fetchOrders();
      // Refresh user profile for points
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setUser(prev => prev ? { ...prev, reward_points: data.reward_points } : prev);
      }
      await fetchAllUsers();
    }, 5000);
    return () => clearInterval(interval);
  }, [user, fetchOrders, fetchAllUsers]);

  const signup = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } }
    });
    if (error) { toast.error(error.message); return false; }
    if (data.user) {
      toast.success("Account created! Please check your email to verify.");
      return true;
    }
    return false;
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); return false; }
    toast.success("Welcome back!");
    return true;
  };

  const adminLogin = async (email: string, password: string) => {
    console.log("🔐 Admin login attempt:", email);
    try {
      console.log("📧 Signing in with email/password...");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("✅ Sign in response:", { data: !!data, error });
      
      if (error) {
        console.error("❌ Sign in error:", error.message);
        toast.error(error.message);
        return false;
      }
      
      if (data.user) {
        console.log("👤 User signed in:", data.user.id);
        console.log("🔍 Checking admin role...");
        const admin = await checkAdmin(data.user.id);
        console.log("✅ Admin check result:", admin);
        
        if (!admin) {
          console.warn("⚠️ User is not an admin");
          toast.error("You are not an admin");
          await supabase.auth.signOut();
          return false;
        }
        console.log("✅ Admin verified!");
        toast.success("Admin logged in");
        return true;
      }
      return false;
    } catch (err) {
      console.error("💥 Admin login error:", err);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setOrders([]);
    setAllUsers([]);
    toast.success("Logged out");
  };

  const placeOrder = async (orderData: { items: OrderItem[]; total_amount: number }) => {
    if (!user) return;
    const { data: orderRow, error } = await supabase.from("orders").insert({
      user_id: user.id,
      user_name: user.name,
      email: user.email,
      total_amount: orderData.total_amount,
      status: "Pending",
      points_earned: 0,
    }).select().single();

    if (error || !orderRow) { toast.error("Failed to place order"); return; }

    const items = orderData.items.map(i => ({
      order_id: orderRow.id,
      menu_item_id: i.menu_item_id,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    }));

    await supabase.from("order_items").insert(items);
    toast.success("Order placed successfully!");
    await fetchOrders();
  };

  const approveOrder = async (orderId: string) => {
    const { error } = await supabase.rpc("approve_order", { order_id: orderId });
    if (error) { toast.error("Failed to approve: " + error.message); return; }
    toast.success("Order approved & points awarded!");
    await fetchOrders();
    await fetchAllUsers();
  };

  const rejectOrder = async (orderId: string) => {
    const { error } = await supabase.rpc("reject_order", { order_id: orderId });
    if (error) { toast.error("Failed to reject: " + error.message); return; }
    toast.success("Order rejected");
    await fetchOrders();
  };

  const adjustPoints = async (userId: string, adjustment: number) => {
    const { error } = await supabase.rpc("adjust_points", { target_user_id: userId, adjustment });
    if (error) { toast.error("Failed: " + error.message); return; }
    toast.success(`Points adjusted by ${adjustment > 0 ? "+" : ""}${adjustment}`);
    await fetchAllUsers();
    // Refresh current user if it's them
    if (user && user.id === userId) {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (data) setUser(prev => prev ? { ...prev, reward_points: data.reward_points } : prev);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, orders, loading, login, signup, adminLogin, logout, placeOrder, approveOrder, rejectOrder, adjustPoints, allUsers, refreshOrders, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
