import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User, Order, OrderItem } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { apiPost } from "@/lib/api";
import type { User as SupaUser } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  orders: Order[];
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
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
  const [authInitialized, setAuthInitialized] = useState(false);

  const fetchProfile = async (token: string) => {
    try {
      console.log("👤 [fetchProfile] START - Fetching profile via API");
      console.log("👤 [fetchProfile] Got token:", token?.substring(0, 20) + "...");
      
      if (!token) {
        console.error("❌ [fetchProfile] No auth token available");
        return;
      }
      
      console.log("👤 [fetchProfile] Calling /api/profile...");
      // Call backend API instead of direct Supabase query
      const response = await apiPost('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log("👤 [fetchProfile] Response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ [fetchProfile] API error:", errorData.error);
        return;
      }

      const data = await response.json();
      console.log("👤 [fetchProfile] Got profile data:", data);
      console.log("👤 [fetchProfile] Setting user state...");
      setUser(data);
      console.log("✅ [fetchProfile] DONE - Profile loaded:", data.name);
    } catch (err) {
      console.error("💥 [fetchProfile] Exception:", err);
    }
  };

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
    return !!data;
  };

  const fetchOrders = useCallback(async (token?: string) => {
    try {
      console.log("📦 [fetchOrders] START - Fetching orders via API");
      
      let authToken = token;
      if (!authToken) {
        console.log("📦 [fetchOrders] No token provided, attempting getSession...");
        const { data: { session } } = await supabase.auth.getSession();
        authToken = session?.access_token;
      }
      console.log("📦 [fetchOrders] Got token:", authToken?.substring(0, 20) + "...");
      
      if (!authToken) {
        console.error("❌ [fetchOrders] No auth token available");
        return;
      }
      
      console.log("📦 [fetchOrders] Calling /api/orders...");
      // Call backend API
      const response = await apiPost('/api/orders', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log("📦 [fetchOrders] Response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ [fetchOrders] API error:", errorData.error);
        return;
      }

      const data = await response.json();
      console.log("📦 [fetchOrders] Got orders data, count:", data.length);
      console.log("📦 [fetchOrders] Setting orders state...");
      setOrders(data);
      console.log("✅ [fetchOrders] DONE - Fetched", data.length, "orders");
    } catch (err) {
      console.error("💥 [fetchOrders] Exception:", err);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  const fetchAllUsers = useCallback(async (token?: string) => {
    try {
      console.log("👥 [fetchAllUsers] START - Fetching all users via API");
      
      let authToken = token;
      if (!authToken) {
        console.log("👥 [fetchAllUsers] No token provided, attempting getSession...");
        const { data: { session } } = await supabase.auth.getSession();
        authToken = session?.access_token;
      }
      console.log("👥 [fetchAllUsers] Got token:", authToken?.substring(0, 20) + "...");
      
      if (!authToken) {
        console.error("❌ [fetchAllUsers] No auth token available");
        return;
      }
      
      console.log("👥 [fetchAllUsers] Calling /api/users...");
      // Call backend API
      const response = await apiPost('/api/users', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log("👥 [fetchAllUsers] Response status:", response.status);
      if (!response.ok) {
        // Not an admin, silently fail
        console.log("👥 [fetchAllUsers] (Expected) User is not admin - 403");
        return;
      }

      const data = await response.json();
      console.log("👥 [fetchAllUsers] Got users data, count:", data.length);
      console.log("👥 [fetchAllUsers] Setting allUsers state...");
      setAllUsers(data);
      console.log("✅ [fetchAllUsers] DONE - Fetched", data.length, "users");
    } catch (err) {
      console.log("⚠️ [fetchAllUsers] Exception (non-admin user):", err.message);
      // Silently fail for non-admins
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    await fetchAllUsers();
  }, [fetchAllUsers]);

  // Init auth
  useEffect(() => {
    let isMounted = true;
    let isAuthListenerSetup = false;
    
    const init = async () => {
      try {
        console.log("🔐 [AuthContext] Initializing auth session...");
        
        // Debug: Check localStorage before getSession
        const allLocalStorageKeys = Object.keys(localStorage);
        // Look for the actual Supabase auth token key (includes project ID)
        const authTokenKeys = allLocalStorageKeys.filter(k => k.includes('auth-token'));
        console.log("🔑 [AuthContext] Auth token keys found:", authTokenKeys);
        
        // Don't use getSession() - it hangs. Let the listener handle auth restoration.
        // The listener will fire immediately if there's a persisted session.
      } catch (err) {
        console.error("💥 [AuthContext] Error during init:", err);
      }
    };
    
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 [AuthContext] onAuthStateChange - Event:", event, "Session:", session ? `YES ✅` : "NO ❌");
      
      // Skip TOKEN_REFRESHED to avoid infinite loops
      if (event === "TOKEN_REFRESHED") {
        console.log("⏭️ [AuthContext] Skipping TOKEN_REFRESHED event");
        return;
      }
      
      if (session?.user) {
        console.log("✅ [AuthContext] User authenticated:", session.user.id);
        const token = session.access_token;
        console.log("✅ [AuthContext] Token available:", token?.substring(0, 20) + "...");
        console.log("📍 [AuthContext] Starting data fetch sequence...");
        
        // Fetch data immediately - backend API is fast
        console.log("📍 [AuthContext] Step 1: Calling fetchProfile...");
        await fetchProfile(token);
        console.log("📍 [AuthContext] Step 2: fetchProfile done, calling fetchOrders...");
        
        await fetchOrders(token);
        console.log("📍 [AuthContext] Step 3: fetchOrders done, calling fetchAllUsers...");
        
        await fetchAllUsers(token);
        console.log("📍 [AuthContext] Step 4: fetchAllUsers done, checking admin...");
        
        // Check admin status in background (non-blocking)
        checkAdmin(session.user.id).catch(() => {});
        console.log("📍 [AuthContext] Step 5: All fetches done, checking isMounted...");
        
        if (isMounted) {
          console.log("📍 [AuthContext] Step 6: isMounted=true, setting authInitialized=true, loading=false");
          setAuthInitialized(true);
          setLoading(false);
          console.log("✅ [AuthContext] COMPLETE - Auth initialized and loading set to false");
        } else {
          console.log("⚠️ [AuthContext] isMounted=false, skipping state update");
        }
      } else {
        console.log("🚪 [AuthContext] User logged out");
        if (isMounted) {
          console.log("🚪 [AuthContext] Clearing user state...");
          setUser(null);
          setIsAdmin(false);
          setOrders([]);
          setAllUsers([]);
          setAuthInitialized(true);
          setLoading(false);
          console.log("✅ [AuthContext] User state cleared");
        }
      }
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchOrders, fetchAllUsers]);

  // Poll orders every 5s when user is logged in
  useEffect(() => {
    if (!user) return;
    
    // Don't poll - just fetch once
    fetchOrders();
    fetchAllUsers();
  }, [user, fetchOrders, fetchAllUsers]);

  const signup = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, phone_number: phone || null } }
      });
      if (error) { toast.error(error.message); return false; }
      if (data.user) {
        // Update profiles table with phone number - wait for profile to be created
        if (phone) {
          // Wait a moment for the trigger to create the profile row
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ phone_number: phone })
            .eq('id', data.user.id);
          
          if (updateError) {
            console.error("Error updating phone:", updateError);
            // Try insert if update fails (in case RLS prevents update)
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                name,
                email,
                phone_number: phone,
                reward_points: 0
              });
            if (insertError) console.error("Error inserting phone:", insertError);
          }
        }
        toast.success("Account created! Please check your email to verify.");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Signup failed");
      return false;
    }
  };

  const login = async (emailOrPhone: string, password: string) => {
    try {
      let email = emailOrPhone;
      
      // Check if input is a phone number (contains digits and optional +)
      if (/^[+]?[0-9]{10,}$/.test(emailOrPhone.replace(/\s/g, ''))) {
        // It's a phone number - normalize it (remove spaces) and look up the email
        const normalizedPhone = emailOrPhone.replace(/\s/g, '');
        const { data: profiles, error: lookupError } = await supabase
          .from('profiles')
          .select('email')
          .eq('phone_number', normalizedPhone)
          .single();
        
        if (lookupError || !profiles) {
          console.error("Phone lookup error:", lookupError);
          toast.error("No account found with this phone number");
          return false;
        }
        email = profiles.email;
        console.log("✅ Found email from phone number:", email);
      }
      
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return false;
      }
      toast.success("Welcome back!");
      return true;
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed");
      return false;
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      if (data.user) {
        const admin = await checkAdmin(data.user.id);
        
        if (!admin) {
          toast.error("You are not an admin");
          await supabase.auth.signOut();
          return false;
        }
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
    try {
      console.log("🚪 [AuthContext] Logging out user...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("❌ [AuthContext] Error during logout:", error);
        toast.error("Logout failed: " + error.message);
        return;
      }
      setUser(null);
      setIsAdmin(false);
      setOrders([]);
      setAllUsers([]);
      console.log("✅ [AuthContext] User logged out successfully");
      toast.success("Logged out");
    } catch (err) {
      toast.error("Logout failed");
    }
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
