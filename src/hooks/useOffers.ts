import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Offer } from "@/types";

export const useOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    const { data } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
    if (data) {
      setOffers(data.map(o => ({
        id: o.id,
        title: o.title,
        description: o.description,
        discount_percent: o.discount_percent,
        code: o.code,
        valid_until: o.valid_until,
        image: o.image,
        active: o.active,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  return { offers, loading, refetchOffers: fetchOffers };
};
