import { useMenu } from "@/hooks/useMenu";
import { useOffers } from "@/hooks/useOffers";
import Navbar from "@/components/Navbar";
import MenuItemCard from "@/components/MenuItemCard";
import { Percent, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const OffersPage = () => {
  const { menuItems } = useMenu();
  const { offers } = useOffers();

  const activeOffers = offers.filter(o => o.active);
  const offerItems = menuItems.filter(i => i.offer > 0 && i.available).sort((a, b) => b.offer - a.offer);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="px-3 md:px-0 md:max-w-3xl md:mx-auto py-4 md:py-8">
        {activeOffers.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-primary" /> Special Offers
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {activeOffers.map(offer => (
                <div key={offer.id} className="flex-shrink-0 w-72 bg-card rounded-xl border overflow-hidden">
                  {offer.image && <img src={offer.image} alt={offer.title} className="w-full h-32 object-cover" />}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm">{offer.title}</h3>
                      {offer.discount_percent > 0 && <Badge className="text-[9px] py-0 bg-mcd-green text-white">{offer.discount_percent}% Off</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{offer.description}</p>
                    {offer.code && (
                      <div className="mt-2 bg-primary/5 rounded-md px-2 py-1 inline-block">
                        <span className="text-[10px] text-muted-foreground">Code: </span>
                        <span className="text-xs font-mono font-bold text-primary">{offer.code}</span>
                      </div>
                    )}
                    {offer.valid_until && <p className="text-[9px] text-muted-foreground mt-1">Valid until {new Date(offer.valid_until).toLocaleDateString("en-IN")}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Percent className="h-3.5 w-3.5" /> Best Deals
          </div>
          <h1 className="font-display text-xl md:text-3xl">Discounted Items</h1>
        </div>

        <div className="divide-y">
          {offerItems.map(item => <MenuItemCard key={item.id} item={item} />)}
        </div>

        {offerItems.length === 0 && activeOffers.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Tag className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No offers available right now</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;
