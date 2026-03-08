import { MenuItem } from "@/types";
import { useCart } from "@/context/CartContext";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

const VegBadge = ({ type }: { type: string }) => {
  const config: Record<string, { border: string; dot: string }> = {
    veg: { border: "border-mcd-green", dot: "bg-mcd-green" },
    "non-veg": { border: "border-primary", dot: "bg-primary" },
    egg: { border: "border-secondary", dot: "bg-secondary" },
  };
  const c = config[type] || { border: "border-muted-foreground", dot: "bg-muted-foreground" };

  return (
    <div className={`w-4 h-4 border-2 ${c.border} flex items-center justify-center rounded-sm`}>
      <div className={`w-2 h-2 rounded-full ${c.dot}`} />
    </div>
  );
};

const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.menuItem.id === item.id);

  return (
    <div className="flex gap-4 py-5 border-b last:border-b-0">
      {/* Image */}
      <div className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-28 rounded-lg overflow-hidden bg-muted">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base sm:text-lg leading-tight">{item.name}</h3>
          <VegBadge type={item.veg_type} />
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          {item.actual_price > item.price && (
            <span className="text-sm text-muted-foreground line-through">₹{item.actual_price}</span>
          )}
          <span className="text-base font-bold text-foreground">₹{item.price}</span>
          {item.offer > 0 && (
            <span className="text-xs font-semibold text-mcd-green bg-mcd-green/10 px-1.5 py-0.5 rounded">
              {item.offer}% Off
            </span>
          )}
        </div>

        <div className="mt-3">
          {!cartItem ? (
            <Button
              size="sm"
              onClick={() => addItem(item)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-md px-6 h-8 text-sm"
            >
              Add
            </Button>
          ) : (
            <div className="inline-flex items-center gap-0 border-2 border-secondary rounded-md overflow-hidden">
              <button
                onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 h-8 flex items-center justify-center text-sm font-bold bg-card">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
