import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Award, Package, User, Star, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
  const { user, orders, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const userOrders = (orders || []).filter(o => o.user_id === user.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="px-3 md:px-0 md:max-w-2xl md:mx-auto py-4 md:py-8">
        {/* Profile - Responsive Layout */}
        <div className="bg-card rounded-xl border p-4 mb-4">
          {/* Mobile: Stacked Layout */}
          <div className="md:hidden space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-lg font-bold break-words">{user.name}</h1>
                <p className="text-muted-foreground text-xs break-all">{user.email}</p>
                {user.phone_number && <p className="text-muted-foreground text-xs">{user.phone_number}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-secondary/10 px-3 py-2 rounded-lg w-fit">
              <Award className="h-5 w-5 text-secondary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Your Points</p>
                <p className="font-bold text-lg">{user.reward_points}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-lg font-bold truncate">{user.name}</h1>
              <p className="text-muted-foreground text-xs truncate">{user.email}</p>
              {user.phone_number && <p className="text-muted-foreground text-xs truncate">{user.phone_number}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-lg">
                <Award className="h-4 w-4 text-secondary" />
                <span className="font-bold text-sm">{user.reward_points}</span>
                <span className="text-[10px] text-muted-foreground">pts</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Orders */}
        <h2 className="font-display text-base font-bold mb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" /> Order History
        </h2>

        {userOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {userOrders.map(order => (
              <div key={order.id} className="bg-card rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={order.status === "Approved" ? "default" : order.status === "Rejected" ? "destructive" : "secondary"} className="text-[10px]">
                      {order.status}
                    </Badge>
                    {order.points_earned > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full font-medium">
                        <Star className="h-2.5 w-2.5" /> +{order.points_earned}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-0.5">
                  {(order.order_items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between font-bold text-sm">
                  <span>Total</span>
                  <span className="text-primary">₹{order.total_amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
