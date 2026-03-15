import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const CartPage = () => {
  const { items, updateQuantity, removeItem, totalAmount, clearCart } = useCart();
  const { user, placeOrder } = useAuth();
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      await placeOrder({
        items: items.map(i => ({ menu_item_id: i.menuItem.id, name: i.menuItem.name, quantity: i.quantity, price: i.menuItem.price })),
        total_amount: totalAmount,
      });
      clearCart();
      navigate("/dashboard");
    } catch (error) {
      console.error("Order error:", error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 py-16 text-center">
          <ShoppingBag className="h-14 w-14 mx-auto text-muted-foreground/40 mb-3" />
          <h2 className="font-display text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm mb-5">Add some delicious items from our menu!</p>
          <Button onClick={() => navigate("/")}>Browse Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="px-3 md:px-0 md:max-w-2xl md:mx-auto py-4 md:py-8">
        <h1 className="font-display text-xl md:text-3xl font-bold mb-4">Your Cart</h1>

        {/* Cart Items - Minimal Compact Layout */}
        <div className="space-y-2 mb-4">
          {items.map(({ menuItem, quantity }) => (
            <div key={menuItem.id} className="flex items-center gap-2 bg-card rounded-lg border p-3 md:p-4">
              {/* Small Image - Optional on Mobile */}
              <img 
                src={menuItem.image} 
                alt={menuItem.name} 
                className="w-12 h-12 md:w-14 md:h-14 rounded object-cover flex-shrink-0" 
              />
              
              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base truncate">{menuItem.name}</h3>
                <p className="text-primary font-bold text-sm">₹{menuItem.price}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
                <button
                  onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                  className="w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center hover:bg-primary/10 text-xs"
                >
                  −
                </button>
                <span className="font-bold text-sm w-5 text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                  className="w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center hover:bg-primary/10 text-xs"
                >
                  +
                </button>
              </div>

              {/* Total Price */}
              <p className="font-bold text-sm md:text-base w-12 md:w-14 text-right">₹{menuItem.price * quantity}</p>

              {/* Delete Button */}
              <button
                onClick={() => removeItem(menuItem.id)}
                className="text-destructive p-1 flex-shrink-0 hover:bg-destructive/10 rounded transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 bg-card rounded-xl border p-4 md:p-6 space-y-3">
          <div className="flex justify-between text-base md:text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">₹{totalAmount}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            You'll earn <strong className="text-primary">{Math.floor(totalAmount / 2)}</strong> reward points!
          </p>
          <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
            {user ? "Place Order" : "Login to Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
