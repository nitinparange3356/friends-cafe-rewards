import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { menuItems as defaultMenu } from "@/data/menu";
import { getCategories, saveCategories } from "@/data/menu";
import { MenuItem, VegType, Offer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, LogOut, Plus, Edit2, Trash2, Coffee, Users, BarChart3, Package, TrendingUp, IndianRupee, Award, Tag, FolderPlus, Percent } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ImageUpload";

const AdminDashboard = () => {
  const { isAdmin, adminLogin, logout, orders, approveOrder, rejectOrder } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Menu management
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem("friends-cafe-menu");
    return saved ? JSON.parse(saved) : defaultMenu;
  });
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", actual_price: "", offer: "", category: "", veg_type: "veg" as VegType, image: "", available: true
  });

  // Category management
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(getCategories);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCat, setEditingCat] = useState<string | null>(null);

  // Offers management
  const [offers, setOffers] = useState<Offer[]>(() => {
    const saved = localStorage.getItem("friends-cafe-offers");
    return saved ? JSON.parse(saved) : [];
  });
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerForm, setOfferForm] = useState({
    title: "", description: "", discount_percent: "", code: "", valid_until: "", image: "", active: true
  });

  // User points dialog
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [pointsAdjust, setPointsAdjust] = useState("");

  const [usersVersion, setUsersVersion] = useState(0);
  const allUsers = useMemo(() => {
    const saved = localStorage.getItem("friends-cafe-users");
    return saved ? JSON.parse(saved) : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, usersVersion]);

  // Persist
  useEffect(() => { localStorage.setItem("friends-cafe-menu", JSON.stringify(menu)); }, [menu]);
  useEffect(() => { localStorage.setItem("friends-cafe-offers", JSON.stringify(offers)); }, [offers]);
  useEffect(() => { saveCategories(dynamicCategories); }, [dynamicCategories]);

  // Analytics
  const analytics = useMemo(() => {
    const approved = orders.filter(o => o.status === "Approved");
    const totalRevenue = approved.reduce((s, o) => s + o.total_amount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = approved.length ? Math.round(totalRevenue / approved.length) : 0;
    const totalPoints = approved.reduce((s, o) => s + o.points_earned, 0);

    const statusData = [
      { name: "Pending", value: orders.filter(o => o.status === "Pending").length, color: "hsl(var(--secondary))" },
      { name: "Approved", value: approved.length, color: "hsl(var(--mcd-green))" },
      { name: "Rejected", value: orders.filter(o => o.status === "Rejected").length, color: "hsl(var(--destructive))" },
    ].filter(d => d.value > 0);

    const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(o => o.items.forEach(it => {
      if (!itemMap[it.name]) itemMap[it.name] = { name: it.name, qty: 0, revenue: 0 };
      itemMap[it.name].qty += it.quantity;
      itemMap[it.name].revenue += it.price * it.quantity;
    }));
    const topItems = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 6);

    const dayMap: Record<string, number> = {};
    approved.forEach(o => {
      const d = new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      dayMap[d] = (dayMap[d] || 0) + o.total_amount;
    });
    const revenueByDay = Object.entries(dayMap).slice(-7).map(([day, amt]) => ({ day, amount: amt }));

    return { totalRevenue, totalOrders, avgOrderValue, totalPoints, statusData, topItems, revenueByDay };
  }, [orders]);

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); adminLogin(email, password); };

  // === Menu ===
  const saveMenu = (updated: MenuItem[]) => setMenu(updated);

  const openAddMenu = () => {
    setEditingItem(null);
    setForm({ name: "", description: "", price: "", actual_price: "", offer: "", category: dynamicCategories[0] || "", veg_type: "veg", image: "", available: true });
    setMenuDialogOpen(true);
  };

  const openEditMenu = (item: MenuItem) => {
    setEditingItem(item);
    setForm({ name: item.name, description: item.description, price: String(item.price), actual_price: String(item.actual_price), offer: String(item.offer), category: item.category, veg_type: item.veg_type, image: item.image, available: item.available });
    setMenuDialogOpen(true);
  };

  const saveItem = () => {
    if (!form.name || !form.price || !form.category) { toast.error("Name, price & category required"); return; }
    const item: MenuItem = {
      id: editingItem?.id || crypto.randomUUID(), name: form.name, description: form.description,
      price: Number(form.price), actual_price: Number(form.actual_price) || Number(form.price),
      offer: Number(form.offer) || 0, category: form.category, veg_type: form.veg_type,
      image: form.image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
      available: form.available,
    };
    if (editingItem) {
      saveMenu(menu.map(m => m.id === item.id ? item : m));
      toast.success("Item updated");
    } else {
      saveMenu([...menu, item]);
      toast.success("Item added");
    }
    setMenuDialogOpen(false);
  };

  // === Categories ===
  const addCategory = () => {
    const name = newCatName.trim();
    if (!name) { toast.error("Enter a category name"); return; }
    if (dynamicCategories.includes(name)) { toast.error("Category already exists"); return; }
    if (editingCat) {
      // Rename category in menu items too
      setDynamicCategories(prev => prev.map(c => c === editingCat ? name : c));
      setMenu(prev => prev.map(m => m.category === editingCat ? { ...m, category: name } : m));
      toast.success("Category renamed");
    } else {
      setDynamicCategories(prev => [...prev, name]);
      toast.success("Category added");
    }
    setNewCatName("");
    setEditingCat(null);
    setCatDialogOpen(false);
  };

  const deleteCategory = (cat: string) => {
    const itemsInCat = menu.filter(m => m.category === cat).length;
    if (itemsInCat > 0) { toast.error(`Remove ${itemsInCat} items from "${cat}" first`); return; }
    setDynamicCategories(prev => prev.filter(c => c !== cat));
    toast.success("Category deleted");
  };

  // === Offers ===
  const openAddOffer = () => {
    setEditingOffer(null);
    setOfferForm({ title: "", description: "", discount_percent: "", code: "", valid_until: "", image: "", active: true });
    setOfferDialogOpen(true);
  };

  const openEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferForm({ title: offer.title, description: offer.description, discount_percent: String(offer.discount_percent), code: offer.code, valid_until: offer.valid_until, image: offer.image, active: offer.active });
    setOfferDialogOpen(true);
  };

  const saveOffer = () => {
    if (!offerForm.title) { toast.error("Title required"); return; }
    const offer: Offer = {
      id: editingOffer?.id || crypto.randomUUID(),
      title: offerForm.title, description: offerForm.description,
      discount_percent: Number(offerForm.discount_percent) || 0,
      code: offerForm.code.toUpperCase(), valid_until: offerForm.valid_until,
      image: offerForm.image, active: offerForm.active,
    };
    if (editingOffer) {
      setOffers(prev => prev.map(o => o.id === offer.id ? offer : o));
      toast.success("Offer updated");
    } else {
      setOffers(prev => [...prev, offer]);
      toast.success("Offer created");
    }
    setOfferDialogOpen(false);
  };

  // === Points ===
  const adjustPoints = () => {
    if (!selectedUserId || !pointsAdjust) return;
    const adj = Number(pointsAdjust);
    const usersRaw = localStorage.getItem("friends-cafe-users");
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const updated = users.map((u: any) => u.id === selectedUserId ? { ...u, reward_points: Math.max(0, (u.reward_points || 0) + adj) } : u);
    localStorage.setItem("friends-cafe-users", JSON.stringify(updated));
    const curUser = localStorage.getItem("friends-cafe-user");
    if (curUser) {
      const cu = JSON.parse(curUser);
      if (cu.id === selectedUserId) {
        cu.reward_points = Math.max(0, (cu.reward_points || 0) + adj);
        localStorage.setItem("friends-cafe-user", JSON.stringify(cu));
      }
    }
    toast.success(`Points adjusted by ${adj > 0 ? "+" : ""}${adj}`);
    setUsersVersion(v => v + 1);
    setPointsDialogOpen(false);
    setPointsAdjust("");
  };

  // Login screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center">
            <Coffee className="h-10 w-10 text-primary mx-auto mb-2" />
            <h1 className="font-display text-2xl font-bold">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="bg-card rounded-2xl border p-5 space-y-3">
            <Input type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full">Login</Button>
          </form>
          <p className="text-center text-[10px] text-muted-foreground">Demo: admin@friendscafe.com / admin123</p>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === "Pending");
  const chartConfig = { amount: { label: "Revenue", color: "hsl(var(--primary))" }, qty: { label: "Quantity", color: "hsl(var(--secondary))" } };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-3 md:px-6">
          <h1 className="font-display text-base font-bold flex items-center gap-2 text-primary-foreground">
            <Coffee className="h-5 w-5" /> Admin Panel
          </h1>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }} className="text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </div>

      <div className="px-3 md:px-6 md:max-w-6xl md:mx-auto py-4">
        <Tabs defaultValue="analytics">
          <div className="overflow-x-auto no-scrollbar -mx-3 px-3 mb-4">
            <TabsList className="w-auto inline-flex h-auto">
              <TabsTrigger value="analytics" className="text-[11px] py-2 gap-1"><BarChart3 className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
              <TabsTrigger value="orders" className="text-[11px] py-2 gap-1"><Package className="h-3.5 w-3.5" /> Orders {pendingOrders.length > 0 && <Badge variant="destructive" className="text-[9px] px-1 py-0 ml-0.5">{pendingOrders.length}</Badge>}</TabsTrigger>
              <TabsTrigger value="users" className="text-[11px] py-2 gap-1"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
              <TabsTrigger value="menu" className="text-[11px] py-2 gap-1"><Coffee className="h-3.5 w-3.5" /> Menu</TabsTrigger>
              <TabsTrigger value="categories" className="text-[11px] py-2 gap-1"><FolderPlus className="h-3.5 w-3.5" /> Categories</TabsTrigger>
              <TabsTrigger value="offers" className="text-[11px] py-2 gap-1"><Tag className="h-3.5 w-3.5" /> Offers</TabsTrigger>
            </TabsList>
          </div>

          {/* ===== ANALYTICS ===== */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><IndianRupee className="h-4 w-4 text-mcd-green" /><span className="text-xs text-muted-foreground">Revenue</span></div><p className="text-xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Package className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Orders</span></div><p className="text-xl font-bold">{analytics.totalOrders}</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-secondary" /><span className="text-xs text-muted-foreground">Avg Order</span></div><p className="text-xl font-bold">₹{analytics.avgOrderValue}</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Award className="h-4 w-4 text-cafe-gold" /><span className="text-xs text-muted-foreground">Points</span></div><p className="text-xl font-bold">{analytics.totalPoints}</p></CardContent></Card>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2 px-4 pt-4"><CardTitle className="text-sm">Revenue Trend</CardTitle></CardHeader>
                <CardContent className="px-2 pb-4">
                  {analytics.revenueByDay.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-48 w-full">
                      <LineChart data={analytics.revenueByDay}><XAxis dataKey="day" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><ChartTooltip content={<ChartTooltipContent />} /><Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} /></LineChart>
                    </ChartContainer>
                  ) : <p className="text-center text-muted-foreground text-sm py-12">No data yet</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 px-4 pt-4"><CardTitle className="text-sm">Top Items</CardTitle></CardHeader>
                <CardContent className="px-2 pb-4">
                  {analytics.topItems.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-48 w-full">
                      <BarChart data={analytics.topItems} layout="vertical"><XAxis type="number" tick={{ fontSize: 10 }} /><YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={80} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="qty" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} /></BarChart>
                    </ChartContainer>
                  ) : <p className="text-center text-muted-foreground text-sm py-12">No data yet</p>}
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader className="pb-2 px-4 pt-4"><CardTitle className="text-sm">Orders by Status</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center pb-4">
                  {analytics.statusData.length > 0 ? (
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-32"><ResponsiveContainer><PieChart><Pie data={analytics.statusData} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>{analytics.statusData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie></PieChart></ResponsiveContainer></div>
                      <div className="space-y-2">{analytics.statusData.map(d => <div key={d.name} className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} /><span>{d.name}: <strong>{d.value}</strong></span></div>)}</div>
                    </div>
                  ) : <p className="text-muted-foreground text-sm py-8">No orders yet</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ===== ORDERS ===== */}
          <TabsContent value="orders" className="space-y-3">
            {orders.length === 0 ? <p className="text-center text-muted-foreground py-12">No orders yet</p> : orders.map(order => (
              <div key={order.id} className="bg-card rounded-xl border p-4">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="min-w-0"><p className="font-semibold text-sm truncate">{order.user_name}</p><p className="text-[10px] text-muted-foreground truncate">{order.email} • {new Date(order.created_at).toLocaleString("en-IN")}</p></div>
                  <Badge variant={order.status === "Approved" ? "default" : order.status === "Rejected" ? "destructive" : "secondary"} className="text-[10px] flex-shrink-0">{order.status}</Badge>
                </div>
                <div className="space-y-0.5 mb-2">{order.items.map((item, i) => <div key={i} className="flex justify-between text-xs text-muted-foreground"><span>{item.name} × {item.quantity}</span><span>₹{item.price * item.quantity}</span></div>)}</div>
                <div className="border-t pt-2 flex items-center justify-between gap-2">
                  <span className="font-bold text-sm">₹{order.total_amount}</span>
                  {order.status === "Pending" && (
                    <div className="flex gap-1.5">
                      <Button size="sm" onClick={() => approveOrder(order.id)} className="gap-1 h-7 text-xs"><Check className="h-3 w-3" /> Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => rejectOrder(order.id)} className="gap-1 h-7 text-xs"><X className="h-3 w-3" /> Reject</Button>
                    </div>
                  )}
                  {order.points_earned > 0 && <span className="text-[10px] text-mcd-green font-medium">+{order.points_earned} pts</span>}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ===== USERS ===== */}
          <TabsContent value="users" className="space-y-3">
            {allUsers.length === 0 ? <p className="text-center text-muted-foreground py-12">No users yet</p> : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{allUsers.length} users</p>
                {allUsers.map((u: any) => {
                  const userOrders = orders.filter(o => o.user_id === u.id);
                  const totalSpent = userOrders.filter(o => o.status === "Approved").reduce((s: number, o: any) => s + o.total_amount, 0);
                  return (
                    <div key={u.id} className="bg-card rounded-xl border p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Users className="h-4 w-4 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{u.email} • {userOrders.length} orders • ₹{totalSpent}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-center"><p className="text-base font-bold text-secondary">{u.reward_points || 0}</p><p className="text-[8px] text-muted-foreground">pts</p></div>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => { setSelectedUserId(u.id); setPointsAdjust(""); setPointsDialogOpen(true); }}>Adjust</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== MENU ===== */}
          <TabsContent value="menu">
            <div className="flex justify-between items-center mb-3">
              <p className="text-muted-foreground text-xs">{menu.length} items</p>
              <Button size="sm" onClick={openAddMenu} className="gap-1 h-7 text-xs"><Plus className="h-3.5 w-3.5" /> Add Item</Button>
            </div>
            <div className="space-y-2">
              {menu.map(item => (
                <div key={item.id} className="bg-card rounded-xl border p-3 flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5"><h3 className="font-semibold text-xs truncate">{item.name}</h3><Badge variant="outline" className="text-[9px] py-0">{item.category}</Badge>{!item.available && <Badge variant="secondary" className="text-[9px] py-0">Off</Badge>}</div>
                    <p className="text-xs text-primary font-bold">₹{item.price} {item.offer > 0 && <span className="text-mcd-green text-[10px]">({item.offer}% off)</span>}</p>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditMenu(item)}><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { saveMenu(menu.filter(m => m.id !== item.id)); toast.success("Deleted"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ===== CATEGORIES ===== */}
          <TabsContent value="categories">
            <div className="flex justify-between items-center mb-3">
              <p className="text-muted-foreground text-xs">{dynamicCategories.length} categories</p>
              <Button size="sm" onClick={() => { setEditingCat(null); setNewCatName(""); setCatDialogOpen(true); }} className="gap-1 h-7 text-xs"><Plus className="h-3.5 w-3.5" /> Add</Button>
            </div>
            <div className="space-y-2">
              {dynamicCategories.map(cat => {
                const count = menu.filter(m => m.category === cat).length;
                return (
                  <div key={cat} className="bg-card rounded-xl border p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><FolderPlus className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{cat}</p>
                      <p className="text-[10px] text-muted-foreground">{count} item{count !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingCat(cat); setNewCatName(cat); setCatDialogOpen(true); }}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteCategory(cat)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ===== OFFERS ===== */}
          <TabsContent value="offers">
            <div className="flex justify-between items-center mb-3">
              <p className="text-muted-foreground text-xs">{offers.length} offers</p>
              <Button size="sm" onClick={openAddOffer} className="gap-1 h-7 text-xs"><Plus className="h-3.5 w-3.5" /> Add Offer</Button>
            </div>
            {offers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
                <Tag className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No offers created yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {offers.map(offer => (
                  <div key={offer.id} className="bg-card rounded-xl border p-3">
                    <div className="flex gap-3">
                      {offer.image && <img src={offer.image} alt={offer.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-sm truncate">{offer.title}</h3>
                          {!offer.active && <Badge variant="secondary" className="text-[9px] py-0">Inactive</Badge>}
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{offer.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {offer.discount_percent > 0 && <Badge className="text-[9px] py-0 bg-mcd-green text-white">{offer.discount_percent}% Off</Badge>}
                          {offer.code && <span className="text-[10px] font-mono font-bold text-primary">{offer.code}</span>}
                          {offer.valid_until && <span className="text-[9px] text-muted-foreground">until {new Date(offer.valid_until).toLocaleDateString("en-IN")}</span>}
                        </div>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditOffer(offer)}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setOffers(prev => prev.filter(o => o.id !== offer.id)); toast.success("Deleted"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ===== DIALOGS ===== */}

      {/* Menu Item Dialog */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="max-w-sm mx-3 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
            <DialogDescription className="text-xs">Fill in the details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <ImageUpload value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} />
            <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Textarea placeholder="Description" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Price" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              <Input placeholder="MRP" type="number" value={form.actual_price} onChange={e => setForm(f => ({ ...f, actual_price: e.target.value }))} />
              <Input placeholder="Offer %" type="number" value={form.offer} onChange={e => setForm(f => ({ ...f, offer: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{dynamicCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.veg_type} onValueChange={v => setForm(f => ({ ...f, veg_type: v as VegType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Veg</SelectItem>
                  <SelectItem value="non-veg">Non-Veg</SelectItem>
                  <SelectItem value="egg">Egg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} id="available" />
              <label htmlFor="available" className="text-xs">Available</label>
            </div>
            <Button onClick={saveItem} className="w-full" size="sm">{editingItem ? "Update" : "Add"} Item</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-xs mx-3">
          <DialogHeader>
            <DialogTitle className="text-base">{editingCat ? "Rename Category" : "Add Category"}</DialogTitle>
            <DialogDescription className="text-xs">Enter the category name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Category name" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCategory()} />
            <Button onClick={addCategory} className="w-full" size="sm">{editingCat ? "Rename" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Offer Dialog */}
      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent className="max-w-sm mx-3 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{editingOffer ? "Edit Offer" : "Create Offer"}</DialogTitle>
            <DialogDescription className="text-xs">Configure the promotional offer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <ImageUpload value={offerForm.image} onChange={url => setOfferForm(f => ({ ...f, image: url }))} />
            <Input placeholder="Title" value={offerForm.title} onChange={e => setOfferForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Description" rows={2} value={offerForm.description} onChange={e => setOfferForm(f => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Discount %" type="number" value={offerForm.discount_percent} onChange={e => setOfferForm(f => ({ ...f, discount_percent: e.target.value }))} />
              <Input placeholder="Code (e.g. SAVE20)" value={offerForm.code} onChange={e => setOfferForm(f => ({ ...f, code: e.target.value }))} />
            </div>
            <Input type="date" value={offerForm.valid_until} onChange={e => setOfferForm(f => ({ ...f, valid_until: e.target.value }))} />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={offerForm.active} onChange={e => setOfferForm(f => ({ ...f, active: e.target.checked }))} id="offer-active" />
              <label htmlFor="offer-active" className="text-xs">Active</label>
            </div>
            <Button onClick={saveOffer} className="w-full" size="sm">{editingOffer ? "Update" : "Create"} Offer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Points Dialog */}
      <Dialog open={pointsDialogOpen} onOpenChange={setPointsDialogOpen}>
        <DialogContent className="max-w-xs mx-3">
          <DialogHeader>
            <DialogTitle className="text-base">Adjust Points</DialogTitle>
            <DialogDescription className="text-xs">Enter positive to add or negative to deduct.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input type="number" placeholder="e.g. 50 or -20" value={pointsAdjust} onChange={e => setPointsAdjust(e.target.value)} />
            <Button onClick={adjustPoints} className="w-full" size="sm">Apply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
