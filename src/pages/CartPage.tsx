import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const CartPage = () => {
  const { items, updateQuantity, removeItem, totalAmount, clearCart } = useCart();
  const { user, placeOrder } = useAuth();
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    placeOrder({
      items: items.map(i => ({
        menu_item_id: i.menuItem.id,
        name: i.menuItem.name,
        quantity: i.quantity,
        price: i.menuItem.price,
      })),
      total_amount: totalAmount,
    });
    clearCart();
    navigate("/dashboard");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some delicious items from our menu!</p>
          <Button onClick={() => navigate("/")}>Browse Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-6">Your Cart</h1>

        <div className="space-y-3">
          {items.map(({ menuItem, quantity }) => (
            <div key={menuItem.id} className="flex items-center gap-4 bg-card rounded-xl p-4 border">
              <img src={menuItem.image} alt={menuItem.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{menuItem.name}</h3>
                <p className="text-primary font-bold text-sm">₹{menuItem.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(menuItem.id, quantity - 1)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="font-bold text-sm w-6 text-center">{quantity}</span>
                <button onClick={() => updateQuantity(menuItem.id, quantity + 1)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="font-bold text-sm w-16 text-right">₹{menuItem.price * quantity}</p>
              <button onClick={() => removeItem(menuItem.id)} className="text-destructive hover:text-destructive/80 p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-card rounded-xl border p-6 space-y-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">₹{totalAmount}</span>
          </div>
          <p className="text-xs text-muted-foreground">You'll earn <strong className="text-primary">{Math.floor(totalAmount / 100) * 10}</strong> reward points on this order!</p>
          <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
            {user ? "Place Order" : "Login to Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
