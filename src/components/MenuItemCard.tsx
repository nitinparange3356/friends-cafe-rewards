import { MenuItem } from "@/types";
import { useCart } from "@/context/CartContext";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

const VegBadge = ({ type }: { type: string }) => {
  const config = {
    veg: { color: "bg-cafe-green", label: "Veg" },
    "non-veg": { color: "bg-cafe-red", label: "Non-Veg" },
    egg: { color: "bg-cafe-gold", label: "Egg" },
  }[type] || { color: "bg-muted", label: type };

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-primary-foreground ${config.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/80" />
      {config.label}
    </span>
  );
};

const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const cartItem = items.find(i => i.menuItem.id === item.id);

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {item.offer > 0 && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
            {item.offer}% OFF
          </span>
        )}
        <div className="absolute top-3 right-3">
          <VegBadge type={item.veg_type} />
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-display font-semibold text-lg leading-tight">{item.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">₹{item.price}</span>
            {item.actual_price > item.price && (
              <span className="text-sm text-muted-foreground line-through">₹{item.actual_price}</span>
            )}
          </div>

          {!cartItem ? (
            <Button size="sm" onClick={() => addItem(item)} className="gap-1 rounded-full">
              <Plus className="h-4 w-4" /> Add
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-primary rounded-full px-1 py-0.5">
              <button onClick={() => updateQuantity(item.id, cartItem.quantity - 1)} className="w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/30 transition-colors">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-bold text-primary-foreground min-w-[20px] text-center">{cartItem.quantity}</span>
              <button onClick={() => updateQuantity(item.id, cartItem.quantity + 1)} className="w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/30 transition-colors">
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
