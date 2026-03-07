import { useState } from "react";
import { menuItems, categories } from "@/data/menu";
import MenuItemCard from "@/components/MenuItemCard";
import Navbar from "@/components/Navbar";
import { Coffee, Sparkles } from "lucide-react";
import type { MenuCategory } from "@/types";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "All">("All");

  const filtered = activeCategory === "All" ? menuItems.filter(i => i.available) : menuItems.filter(i => i.category === activeCategory && i.available);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-cafe-cream py-16 md:py-24">
        <div className="container text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" /> Earn rewards with every order
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Welcome to <span className="text-primary">Friends Cafe</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Discover our handcrafted menu, order your favorites, and earn reward points with every bite.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container py-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory("All")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === "All" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <section className="container py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Coffee className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p>No items available in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
