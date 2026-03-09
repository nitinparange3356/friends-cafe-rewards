import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem } from "@/types";

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenu = useCallback(async () => {
    const { data } = await supabase.from("menu_items").select("*").order("created_at", { ascending: true });
    if (data) {
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
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
    if (data) setCategories(data.map(c => c.name));
  }, []);

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, [fetchMenu, fetchCategories]);

  return { menuItems, categories, loading, refetchMenu: fetchMenu, refetchCategories: fetchCategories };
};
