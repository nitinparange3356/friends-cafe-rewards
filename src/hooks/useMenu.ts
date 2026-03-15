import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem, Category } from "@/types";

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, Category>>({});
  const [loading, setLoading] = useState(true);

  const fetchMenu = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("menu_items").select("*").order("created_at", { ascending: true });
      console.log("Menu fetch result:", { data, error });
      if (error) {
        console.error("Error fetching menu:", error);
        return;
      }
      if (data) {
        console.log("Menu items count:", data.length);
        setMenuItems(data.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description,
          price: d.price,
          actual_price: d.actual_price,
          offer: d.offer,
          category: d.category,
          veg_type: d.veg_type as MenuItem["veg_type"],
          image: d.image,
          available: d.available,
        })));
      }
    } catch (err) {
      console.error("Error in fetchMenu:", err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }
      if (data) {
        const map: Record<string, Category> = {};
        data.forEach(cat => {
          map[cat.name] = {
            id: cat.id,
            name: cat.name,
            image: cat.image || undefined,
            sort_order: cat.sort_order,
          };
        });
        setCategoryMap(map);
        setCategories(data.map(c => c.name));
      }
    } catch (err) {
      console.error("Error in fetchCategories:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await Promise.all([fetchMenu(), fetchCategories()]);
      if (isMounted) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchMenu, fetchCategories]);

  return { menuItems, categories, categoryMap, loading, refetchMenu: fetchMenu, refetchCategories: fetchCategories };
};
