import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Award, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RedeemItem {
  id: string;
  name: string;
  description: string;
  points: number;
  image: string;
}

const REDEEM_ITEMS: RedeemItem[] = [
  {
    id: "mojito",
    name: "Mojito",
    description: "Refreshing minty beverage",
    points: 300,
    image: "https://images.unsplash.com/photo-1582733711529-5411feb81f5e?w=400&h=300&fit=crop",
  },
  {
    id: "fries",
    name: "Fries",
    description: "Crispy golden fries",
    points: 400,
    image: "https://images.unsplash.com/photo-1585238341710-4dd0e06651fe?w=400&h=300&fit=crop",
  },
  {
    id: "classic-burger",
    name: "Classic Burger",
    description: "Juicy beef burger with fresh toppings",
    points: 500,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
  },
  {
    id: "coke-fries",
    name: "Coke + Fries",
    description: "Cold Coke with crispy fries",
    points: 600,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561084?w=400&h=300&fit=crop",
  },
  {
    id: "margarita-pizza",
    name: "Margarita Pizza",
    description: "Classic pizza with fresh basil",
    points: 750,
    image: "https://images.unsplash.com/photo-1604068549290-daea0971b4c3?w=400&h=300&fit=crop",
  },
  {
    id: "burger-meal",
    name: "Burger Meal",
    description: "Burger + Fries + Coke combo",
    points: 1000,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859b98?w=400&h=300&fit=crop",
  },
];

const RedeemPage = () => {
  const { user, logout, redeemPoints } = useAuth();
  const navigate = useNavigate();
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleRedeem = async (item: RedeemItem) => {
    if (!user || !redeemPoints) return;

    if ((user.reward_points || 0) < item.points) {
      toast.error("Insufficient points");
      return;
    }

    setRedeemingId(item.id);
    try {
      await redeemPoints(item.id, item.name, item.points);
      toast.success(`${item.name} redeemed successfully!`);
    } catch (error) {
      toast.error("Failed to redeem");
    } finally {
      setRedeemingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="px-3 md:px-0 md:max-w-4xl md:mx-auto py-4 md:py-8">
        {/* Header */}
        <div className="bg-card rounded-xl border p-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Redeem with Points</h1>
            <p className="text-muted-foreground text-sm">Exchange your reward points for delicious items</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-lg">
              <Award className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Your Points</p>
                <p className="font-bold text-lg">{user.reward_points || 0}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REDEEM_ITEMS.map((item) => {
            const canRedeem = (user.reward_points || 0) >= item.points;
            return (
              <div key={item.id} className="bg-card rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
                <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-base mb-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{item.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {item.points} points
                    </Badge>
                  </div>

                  <Button
                    onClick={() => handleRedeem(item)}
                    disabled={!canRedeem || redeemingId === item.id}
                    className={`w-full text-xs font-semibold ${
                      canRedeem
                        ? "bg-yellow-400 hover:bg-yellow-500 text-yellow-950"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    {redeemingId === item.id ? "Redeeming..." : "Redeem"}
                  </Button>

                  {!canRedeem && (
                    <p className="text-[10px] text-destructive mt-2 text-center">
                      Need {item.points - (user.reward_points || 0)} more points
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RedeemPage;
