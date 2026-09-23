import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText, Trash2, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SITE_BUCKET, removeFile, signPath, uploadFile } from "@/lib/storage";
import { Card, FField, ghostBtn, inputCls, primaryBtn } from "./ui";

type Row = { id: string; whatsapp: string | null; midia_kit_path: string | null };

export function SponsorshipPanel() {
  const qc = useQueryClient();
  const [row, setRow] = useState<Row | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [kitUrl, setKitUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("sponsorship_settings").select("id, whatsapp, midia_kit_path").limit(1).maybeSingle();
    setRow(data);
    setWhatsapp(data?.whatsapp ?? "");
    setKitUrl(await signPath(SITE_BUCKET, data?.midia_kit_path));
    await qc.invalidateQueries({ queryKey: ["sponsorship"] });
  };
  useEffect(() => { void load(); }, []);

  const save = async (patch: Partial<Row>) => {
    const res = row
      ? await supabase.from("sponsorship_settings").update(patch).eq("id", row.id)
      : await supabase.from("sponsorship_settings").insert(patch);
    if (res.error) throw res.error;
  };

  const saveWhatsapp = async () => {
    const digits = whatsapp.replace(/\D/g, "");
    if (digits && digits.length < 10) return toast.error("Informe o WhatsApp com DDD.");
    try { await save({ whatsapp: digits || null }); toast.success("Contato salvo."); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Falha ao salvar."); }
  };

  const uploadKit = async (file: File) => {
    setBusy(true);
    try {
      const path = await uploadFile(SITE_BUCKET, "patrocinio", file);
      const old = row?.midia_kit_path;
      await save({ midia_kit_path: path });
      if (old) await removeFile(SITE_BUCKET, old);
      toast.success("Mídia kit enviado.");
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Falha no upload."); }
    finally { setBusy(false); }
  };

  const removeKit = async () => {
    if (!row?.midia_kit_path || !confirm("Excluir o mídia kit?")) return;
    try { await save({ midia_kit_path: null }); await removeFile(SITE_BUCKET, row.midia_kit_path); toast.success("Mídia kit excluído."); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Falha ao excluir."); }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Contato de captação" description="WhatsApp usado no botão “Fale com a Nossa Equipe de Captação”. Sem número, o botão aparece como “Em breve”.">
        <FField label="WhatsApp (com DDD)"><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" className={inputCls} /></FField>
        <button onClick={() => void saveWhatsapp()} className={primaryBtn + " mt-4"}>Salvar contato</button>
      </Card>
      <Card title="Mídia kit" description="Arquivo baixado no botão “Baixe o Mídia Kit de Patrocínio”. Sem arquivo, o botão aparece como “Em breve”.">
        {kitUrl && <a href={kitUrl} target="_blank" rel="noreferrer" className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-pink underline"><FileText className="size-4" /> Ver arquivo atual</a>}
        <div className="flex flex-wrap gap-2">
          <label className={ghostBtn + " inline-flex cursor-pointer items-center gap-2"}>
            <Upload className="size-4" /> {busy ? "Enviando..." : kitUrl ? "Substituir arquivo" : "Enviar arquivo"}
            <input type="file" accept=".pdf,image/*,.ppt,.pptx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadKit(f); }} />
          </label>
          {kitUrl && <button onClick={() => void removeKit()} className="rounded-full border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive"><Trash2 className="mr-1 inline size-4" />Excluir</button>}
        </div>
      </Card>
    </div>
  );
}
