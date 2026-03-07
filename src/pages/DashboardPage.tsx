import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Award, Package, User, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DashboardPage = () => {
  const { user, orders } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const userOrders = orders.filter(o => o.user_id === user.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-4xl">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl border p-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
            <div className="flex items-center gap-2 bg-cafe-gold/10 px-4 py-2 rounded-xl">
              <Award className="h-5 w-5 text-cafe-gold" />
              <div>
                <p className="text-xs text-muted-foreground">Reward Points</p>
                <p className="font-bold text-lg text-foreground">{user.reward_points}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> Order History
        </h2>

        {userOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No orders yet. Start ordering from our menu!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map(order => (
              <div key={order.id} className="bg-card rounded-xl border p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={order.status === "Approved" ? "default" : order.status === "Rejected" ? "destructive" : "secondary"}>
                      {order.status}
                    </Badge>
                    {order.points_earned > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-cafe-gold/10 text-cafe-gold px-2 py-1 rounded-full font-medium">
                        <Star className="h-3 w-3" /> +{order.points_earned} pts
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-3 pt-3 flex justify-between font-bold">
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
