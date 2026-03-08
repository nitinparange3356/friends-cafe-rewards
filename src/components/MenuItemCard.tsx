import { MenuItem } from "@/types";
import { useCart } from "@/context/CartContext";
import { Plus, Minus } from "lucide-react";

const VegBadge = ({ type }: { type: string }) => {
  const config: Record<string, { border: string; dot: string }> = {
    veg: { border: "border-mcd-green", dot: "bg-mcd-green" },
    "non-veg": { border: "border-primary", dot: "bg-primary" },
    egg: { border: "border-secondary", dot: "bg-secondary" },
  };
  const c = config[type] || { border: "border-muted-foreground", dot: "bg-muted-foreground" };
  return (
    <div className={`w-3.5 h-3.5 border-[1.5px] ${c.border} flex items-center justify-center rounded-sm`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
    </div>
  );
};

const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.menuItem.id === item.id);

  return (
    <div className="flex gap-3 py-3 md:py-4 border-b last:border-b-0">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <VegBadge type={item.veg_type} />
          <h3 className="font-semibold text-sm md:text-base leading-tight truncate">{item.name}</h3>
        </div>
        <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-2 mb-1.5">{item.description}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold">₹{item.price}</span>
          {item.actual_price > item.price && (
            <span className="text-[11px] text-muted-foreground line-through">₹{item.actual_price}</span>
          )}
          {item.offer > 0 && (
            <span className="text-[10px] font-semibold text-mcd-green bg-mcd-green/10 px-1 py-0.5 rounded">
              {item.offer}% Off
            </span>
          )}
        </div>
      </div>

      {/* Image + Add button */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-muted">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="-mt-4 relative z-10">
          {!cartItem ? (
            <button
              onClick={() => addItem(item)}
              className="bg-card border-2 border-secondary text-secondary font-bold text-sm px-5 py-1 rounded-lg shadow-sm hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              ADD
            </button>
          ) : (
            <div className="inline-flex items-center bg-secondary rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center text-secondary-foreground hover:bg-secondary/80"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-secondary-foreground">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center text-secondary-foreground hover:bg-secondary/80"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
