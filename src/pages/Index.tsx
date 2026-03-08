import { useState } from "react";
import { menuItems, categories } from "@/data/menu";
import MenuItemCard from "@/components/MenuItemCard";
import Navbar from "@/components/Navbar";
import { Search } from "lucide-react";
import type { MenuCategory, VegType } from "@/types";

const categoryImages: Record<string, string> = {
  Coffee: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=100&h=100&fit=crop",
  Burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop",
  Snacks: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=100&h=100&fit=crop",
  Combos: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=100&h=100&fit=crop",
  Desserts: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=100&h=100&fit=crop",
  Drinks: "https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=100&h=100&fit=crop",
};

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "All">("All");
  const [vegFilter, setVegFilter] = useState<VegType | null>(null);

  const filtered = menuItems
    .filter((i) => i.available)
    .filter((i) => activeCategory === "All" || i.category === activeCategory)
    .filter((i) => !vegFilter || i.veg_type === vegFilter);

  const getCategoryCount = (cat: string) =>
    menuItems.filter((i) => i.available && (cat === "All" || i.category === cat)).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-card border-b">
        <div className="container py-6">
          <h1 className="font-display text-2xl md:text-3xl text-center">Our Menu</h1>

          {/* Veg/Non-veg filters */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {(["veg", "non-veg", "egg"] as VegType[]).map((type) => {
              const isActive = vegFilter === type;
              const colors: Record<VegType, string> = {
                veg: "border-mcd-green",
                "non-veg": "border-primary",
                egg: "border-secondary",
              };
              const dotColors: Record<VegType, string> = {
                veg: "bg-mcd-green",
                "non-veg": "bg-primary",
                egg: "bg-secondary",
              };
              return (
                <button
                  key={type}
                  onClick={() => setVegFilter(isActive ? null : type)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
                    isActive
                      ? `${colors[type]} bg-card shadow-sm`
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 border-2 ${colors[type]} flex items-center justify-center rounded-sm`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${dotColors[type]}`} />
                  </div>
                  <span className="capitalize">{type}</span>
                </button>
              );
            })}

            <button
              onClick={() => setVegFilter(null)}
              className={`px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
                !vegFilter ? "border-foreground bg-foreground text-background" : "border-border hover:border-muted-foreground/30"
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container py-0">
        <div className="flex">
          {/* Sidebar categories - desktop */}
          <aside className="hidden md:block w-36 lg:w-44 flex-shrink-0 border-r bg-card overflow-y-auto sticky top-16 h-[calc(100vh-4rem)]">
            <div className="py-2">
              <button
                onClick={() => setActiveCategory("All")}
                className={`w-full flex flex-col items-center gap-1 py-3 px-2 text-xs font-semibold transition-colors relative ${
                  activeCategory === "All"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeCategory === "All" && (
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-full" />
                )}
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg">🍽️</div>
                <span>All ({getCategoryCount("All")})</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex flex-col items-center gap-1 py-3 px-2 text-xs font-semibold transition-colors relative ${
                    activeCategory === cat
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {activeCategory === cat && (
                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-full" />
                  )}
                  <img
                    src={categoryImages[cat]}
                    alt={cat}
                    className="w-14 h-14 rounded-full object-cover border-2 border-border"
                  />
                  <span>
                    {cat} ({getCategoryCount(cat)})
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* Mobile category tabs */}
          <div className="md:hidden sticky top-16 z-40 bg-card border-b w-full">
            <div className="flex gap-1 overflow-x-auto no-scrollbar px-3 py-2">
              <button
                onClick={() => setActiveCategory("All")}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-semibold whitespace-nowrap ${
                  activeCategory === "All" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="text-lg">🍽️</span>
                <span>All</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex flex-col items-center gap-1 px-2 py-1.5 text-[10px] font-semibold whitespace-nowrap ${
                    activeCategory === cat ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <img src={categoryImages[cat]} alt={cat} className="w-10 h-10 rounded-full object-cover" />
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Menu items */}
          <main className="flex-1 min-w-0">
            <div className="py-4 px-0 md:px-6">
              <p className="text-sm text-muted-foreground mb-2">
                {activeCategory === "All" ? "All Items" : activeCategory} ({filtered.length})
              </p>

              <div className="divide-y">
                {filtered.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-lg">No items found</p>
                  <p className="text-sm mt-1">Try changing the filter</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
