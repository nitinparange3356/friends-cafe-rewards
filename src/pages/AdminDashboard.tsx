import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { menuItems as defaultMenu, categories } from "@/data/menu";
import { MenuItem, MenuCategory, VegType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, LogOut, Plus, Edit2, Trash2, Coffee } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminDashboard = () => {
  const { isAdmin, adminLogin, logout, orders, approveOrder, rejectOrder } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Menu management (localStorage)
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem("friends-cafe-menu");
    return saved ? JSON.parse(saved) : defaultMenu;
  });
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", actual_price: "", offer: "", category: "Coffee" as MenuCategory, veg_type: "veg" as VegType, image: "", available: true
  });

  useEffect(() => {
    localStorage.setItem("friends-cafe-menu", JSON.stringify(menu));
  }, [menu]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    adminLogin(email, password);
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: "", description: "", price: "", actual_price: "", offer: "", category: "Coffee", veg_type: "veg", image: "", available: true });
    setMenuDialogOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({ name: item.name, description: item.description, price: String(item.price), actual_price: String(item.actual_price), offer: String(item.offer), category: item.category, veg_type: item.veg_type, image: item.image, available: item.available });
    setMenuDialogOpen(true);
  };

  const saveItem = () => {
    if (!form.name || !form.price) { toast.error("Name and price required"); return; }
    const item: MenuItem = {
      id: editingItem?.id || crypto.randomUUID(),
      name: form.name,
      description: form.description,
      price: Number(form.price),
      actual_price: Number(form.actual_price) || Number(form.price),
      offer: Number(form.offer) || 0,
      category: form.category,
      veg_type: form.veg_type,
      image: form.image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
      available: form.available,
    };
    if (editingItem) {
      setMenu(prev => prev.map(m => m.id === item.id ? item : m));
      toast.success("Item updated");
    } else {
      setMenu(prev => [...prev, item]);
      toast.success("Item added");
    }
    setMenuDialogOpen(false);
  };

  const deleteItem = (id: string) => {
    setMenu(prev => prev.filter(m => m.id !== id));
    toast.success("Item deleted");
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Coffee className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="font-display text-3xl font-bold">Admin Login</h1>
            <p className="text-muted-foreground text-sm mt-1">Friends Cafe Admin Panel</p>
          </div>
          <form onSubmit={handleLogin} className="bg-card rounded-2xl border p-6 space-y-4">
            <Input type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full">Login</Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">Demo: admin@friendscafe.com / admin123</p>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === "Pending");
  const allOrders = orders;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <h1 className="font-display text-lg font-bold flex items-center gap-2"><Coffee className="h-5 w-5 text-primary" /> Admin Panel</h1>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}><LogOut className="h-4 w-4 mr-1" /> Logout</Button>
        </div>
      </div>

      <div className="container py-6">
        <Tabs defaultValue="orders">
          <TabsList className="mb-6">
            <TabsTrigger value="orders">Orders {pendingOrders.length > 0 && `(${pendingOrders.length})`}</TabsTrigger>
            <TabsTrigger value="menu">Menu ({menu.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {allOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No orders yet</p>
            ) : (
              allOrders.map(order => (
                <div key={order.id} className="bg-card rounded-xl border p-5">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="font-semibold">{order.user_name}</p>
                      <p className="text-xs text-muted-foreground">{order.email} • {new Date(order.created_at).toLocaleString("en-IN")}</p>
                    </div>
                    <Badge variant={order.status === "Approved" ? "default" : order.status === "Rejected" ? "destructive" : "secondary"}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="font-bold">Total: ₹{order.total_amount}</span>
                    {order.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approveOrder(order.id)} className="gap-1"><Check className="h-3.5 w-3.5" /> Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectOrder(order.id)} className="gap-1"><X className="h-3.5 w-3.5" /> Reject</Button>
                      </div>
                    )}
                    {order.points_earned > 0 && <span className="text-xs text-cafe-gold font-medium">+{order.points_earned} pts awarded</span>}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="menu">
            <div className="flex justify-between items-center mb-4">
              <p className="text-muted-foreground text-sm">{menu.length} items</p>
              <Button size="sm" onClick={openAdd} className="gap-1"><Plus className="h-4 w-4" /> Add Item</Button>
            </div>
            <div className="space-y-3">
              {menu.map(item => (
                <div key={item.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                      {!item.available && <Badge variant="secondary" className="text-[10px]">Unavailable</Badge>}
                    </div>
                    <p className="text-sm text-primary font-bold">₹{item.price}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteItem(item.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Menu Item Dialog */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Price" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              <Input placeholder="Actual price" type="number" value={form.actual_price} onChange={e => setForm(f => ({ ...f, actual_price: e.target.value }))} />
              <Input placeholder="Offer %" type="number" value={form.offer} onChange={e => setForm(f => ({ ...f, offer: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as MenuCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
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
            <Input placeholder="Image URL" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} id="available" />
              <label htmlFor="available" className="text-sm">Available</label>
            </div>
            <Button onClick={saveItem} className="w-full">{editingItem ? "Update" : "Add"} Item</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
