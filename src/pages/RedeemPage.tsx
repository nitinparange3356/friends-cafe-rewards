import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Award, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RedeemItem {
  id: string;
  name: string;
  description: string;
  points: number;
  image: string;
  category: string;
  discount?: string;
}

const REDEEM_ITEMS: RedeemItem[] = [
  {
    id: "mojito",
    name: "Mojito",
    description: "Refreshing minty beverage",
    points: 300,
    image: "https://images.unsplash.com/photo-1582733711529-5411feb81f5e?w=400&h=300&fit=crop",
    category: "Drinks",
  },
  {
    id: "fries",
    name: "Fries",
    description: "Crispy golden fries",
    points: 400,
    image: "https://images.unsplash.com/photo-1585238341710-4dd0e06651fe?w=400&h=300&fit=crop",
    category: "Snacks",
  },
  {
    id: "classic-burger",
    name: "Classic Burger",
    description: "Juicy beef burger with fresh toppings",
    points: 500,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    category: "Burgers",
  },
  {
    id: "coke-fries",
    name: "Coke + Fries",
    description: "Cold Coke with crispy fries",
    points: 600,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561084?w=400&h=300&fit=crop",
    category: "Combos",
    discount: "Most Popular",
  },
  {
    id: "margarita-pizza",
    name: "Margarita Pizza",
    description: "Classic pizza with fresh basil",
    points: 750,
    image: "https://images.unsplash.com/photo-1604068549290-daea0971b4c3?w=400&h=300&fit=crop",
    category: "Mains",
  },
  {
    id: "burger-meal",
    name: "Burger Meal",
    description: "Burger + Fries + Coke combo",
    points: 1000,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859b98?w=400&h=300&fit=crop",
    category: "Combos",
    discount: "Best Value",
  },
];

const RedeemPage = () => {
  const { user, redeemPoints } = useAuth();
  const navigate = useNavigate();
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
      setRedeemingId(null);
    } catch (error) {
      toast.error("Failed to redeem");
      setRedeemingId(null);
    }
  };

  if (!user) return null;

  const categories = ["All", ...new Set(REDEEM_ITEMS.map(item => item.category))];
  const filteredItems = selectedCategory && selectedCategory !== "All"
    ? REDEEM_ITEMS.filter(item => item.category === selectedCategory)
    : REDEEM_ITEMS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="px-3 md:px-0 md:max-w-5xl md:mx-auto py-4 md:py-8">
        
        {/* Hero Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">Premium Rewards</span>
                </div>
                <h1 className="font-display text-2xl md:text-4xl font-bold mb-1">Redeem with Points</h1>
                <p className="text-muted-foreground text-sm md:text-base">Exchange your rewards for amazing items from our menu</p>
              </div>
            </div>
          </div>

          {/* Points Card - Prominent Display */}
          <div className="bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl p-6 md:p-8 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-foreground/80 text-sm mb-1 font-medium">Available Points</p>
                <p className="font-display text-4xl md:text-5xl font-bold">{user.reward_points || 0}</p>
              </div>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                <Award className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </div>
            <p className="text-secondary-foreground/70 text-xs md:text-sm mt-4 font-medium">Every ₹2 spent = 1 point earned</p>
          </div>
        </div>

        {/* Category Filter - Mobile and Desktop */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 md:pb-0 md:flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category === "All" ? null : category)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                (selectedCategory === null && category === "All") || selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Items Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredItems.map((item) => {
            const canRedeem = (user.reward_points || 0) >= item.points;
            const isRedeeming = redeemingId === item.id;
            
            return (
              <div
                key={item.id}
                className={`group relative bg-card rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  canRedeem
                    ? "hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                    : "opacity-70 border-muted"
                }`}
              >
                {/* Image Container */}
                <div className="relative h-40 md:h-44 overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {item.discount && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-950 font-bold text-xs md:text-sm">
                        <Zap className="h-3 w-3 mr-1" />
                        {item.discount}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-4 md:p-5 space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-display font-bold text-base md:text-lg leading-tight">{item.name}</h3>
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">{item.description}</p>
                  </div>

                  {/* Points Badge */}
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg w-fit">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="font-bold text-sm md:text-base text-primary">{item.points}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">points</span>
                  </div>

                  {/* Redeem Button */}
                  <Button
                    onClick={() => handleRedeem(item)}
                    disabled={!canRedeem || isRedeeming}
                    className={`w-full font-semibold transition-all text-sm md:text-base py-2 md:py-3 ${
                      canRedeem
                        ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:shadow-lg hover:shadow-yellow-400/40 text-yellow-950"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    {isRedeeming ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Redeeming...
                      </span>
                    ) : (
                      <>Redeem Now</>
                    )}
                  </Button>

                  {!canRedeem && (
                    <p className="text-center text-[10px] text-destructive font-medium mt-2">
                      Need {item.points - (user.reward_points || 0)} more points
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No items in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedeemPage;
