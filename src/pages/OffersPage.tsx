import Navbar from "@/components/Navbar";
import { menuItems } from "@/data/menu";
import MenuItemCard from "@/components/MenuItemCard";
import { Percent } from "lucide-react";

const OffersPage = () => {
  const offerItems = menuItems.filter(i => i.offer > 0 && i.available).sort((a, b) => b.offer - a.offer);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Percent className="h-4 w-4" /> Best Deals
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Special Offers</h1>
          <p className="text-muted-foreground mt-2">Grab these amazing deals before they're gone!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {offerItems.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
