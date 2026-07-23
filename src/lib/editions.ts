import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Edition = {
  id: string;
  titulo: string;
  data: string;
  local: string;
  participantes: number;
  descricao: string;
  inscricao_url: string | null;
  imagem_url: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchEditions(): Promise<Edition[]> {
  const { data, error } = await supabase
    .from("editions")
    .select("*")
    .order("data", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Edition[];
}

export const editionsQuery = () =>
  queryOptions({
    queryKey: ["editions"],
    queryFn: fetchEditions,
    staleTime: 30_000,
  });
