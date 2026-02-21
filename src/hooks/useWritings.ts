import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Writing = Tables<"writings">;

export function useWritings(type?: string, genre?: string) {
  const [writings, setWritings] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchWritings();
  }, [type, genre]);

  async function fetchWritings() {
    setLoading(true);
    let query = supabase.from("writings").select("*").eq("is_published", true);
    
    if (type) query = query.eq("type", type as any);
    if (genre) query = query.eq("genre", genre);
    
    query = query.order("created_at", { ascending: false });
    
    const { data, error } = await query;
    if (!error && data) {
      setWritings(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMeta();
  }, []);

  async function fetchMeta() {
    const { data } = await supabase.from("writings").select("type, genre").eq("is_published", true);
    if (data) {
      const uniqueTypes = [...new Set(data.map(d => d.type))];
      const uniqueGenres = [...new Set(data.map(d => d.genre))];
      setTypes(uniqueTypes);
      setGenres(uniqueGenres);
    }
  }

  return { writings, loading, genres, types, refetch: fetchWritings };
}
