import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, MessageCircle, Upload, X } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { useSiteImage } from "@/hooks/useSiteImage";
import { WHATSAPP_GROUP, categoriesQuery, citiesQuery, formatMoney, nextEditionQuery, paymentMethodsQuery } from "@/lib/site-content";
import { FORM_BUCKET, uploadFile } from "@/lib/storage";
import { isValidCPF, isValidEmail, isValidPhone, isValidUrl, maskCPF, maskPhone } from "@/lib/validators";

export const Route = createFileRoute("/inscricao")({
  head: () => ({ meta: [
    { title: "Inscrição — Festival Aviva Cultura" },
    { name: "description", content: "Inscreva seu trabalho artístico na próxima edição do Festival Aviva Cultura." },
    { property: "og:title", content: "Inscrição — Festival Aviva Cultura" },
    { property: "og:description", content: "Formulário de inscrição para artistas, grupos e coletivos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: RegistrationPage,
});

const PAYMENT_OPTIONS = ["pessoa física", "MEI", "pessoa jurídica", "coletivo sem CNPJ, com representante"];
const RATINGS = ["Livre", "10 anos", "12 anos", "14 anos", "16 anos", "18 anos"];
const AGE_GROUPS = ["anos iniciais, 6 a 10 anos", "anos finais, 11 a 14 anos", "ensino médio", "qualquer idade"];
const DECLARATIONS = [
  "Declaro que todas as informações que prestei neste formulário são verdadeiras.",
  "Declaro que sou autor ou autora do trabalho inscrito, ou que tenho autorização para apresentá-lo, e que respondo por qualquer uso de obra de outra pessoa.",
  "Declaro que moro em Embu das Artes ou em um dos municípios aceitos pelo regulamento, e que comprovo isso se for selecionado.",
  "Declaro que não sou dirigente, funcionário ou prestador de serviço da ACRIART, nem integrante da equipe do projeto, da curadoria ou da Comissão de Seleção, e que não sou cônjuge, companheiro ou parente até terceiro grau dessas pessoas.",
  "Declaro que, se for selecionado, entrego os documentos pedidos e assino o contrato nos prazos do regulamento.",
  "Declaro que li e aceito integralmente o Regulamento de Participação.",
  "Estou ciente de que meus dados serão usados para a inscrição, a seleção, a contratação, o pagamento e a prestação de contas da Mostra, conforme o aviso de privacidade.",
];

const MAX_PHOTO_MB = 10;
const ACCEPTED = ["image/jpeg", "image/png", "image/heic", "image/heif"];

type Form = {
  nome_artistico: string; responsavel: string; cpf: string; email: string; emailConfirm: string;
  whatsapp: string; cidade: string; forma_cache: string; categoria: string; titulo_trabalho: string;
  descricao_trabalho: string; video_url: string; redes_sociais: string; duracao: string; classificacao: string;
  oficina_titulo: string; oficina_descricao: string; oficina_faixas: string[]; oficina_participantes: string; oficina_materiais: string;
};

const initialForm: Form = {
  nome_artistico: "", responsavel: "", cpf: "", email: "", emailConfirm: "", whatsapp: "", cidade: "",
  forma_cache: "", categoria: "", titulo_trabalho: "", descricao_trabalho: "", video_url: "", redes_sociais: "",
  duracao: "", classificacao: "", oficina_titulo: "", oficina_descricao: "", oficina_faixas: [], oficina_participantes: "", oficina_materiais: "",
};

function RegistrationPage() {
  const image = useSiteImage();
  const hero = image("inscricao-hero");
  const { data: cities = [] } = useQuery(citiesQuery());
  const { data: categories = [] } = useQuery(categoriesQuery());
  const { data: payments = [] } = useQuery(paymentMethodsQuery(true));
  const { data: next } = useQuery(nextEditionQuery());
  const hasWorkshop = next?.possui_oficinas ?? false;

  const [form, setForm] = useState<Form>(initialForm);
  const [photos, setPhotos] = useState<File[]>([]);
  const [checks, setChecks] = useState<boolean[]>(Array(7).fill(false));
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  // Categorias de artesanato e linguagens similares não pedem duração.
  const needsDuration = Boolean(form.categoria) && !/^c[.\s]/i.test(form.categoria.trim());

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.nome_artistico.trim()) e.nome_artistico = "Informe o nome do artista, grupo ou coletivo.";
    if (!form.responsavel.trim()) e.responsavel = "Informe o nome completo do responsável.";
    if (!isValidCPF(form.cpf)) e.cpf = "CPF inválido.";
    if (!isValidEmail(form.email)) e.email = "E-mail inválido.";
    if (form.email.trim().toLowerCase() !== form.emailConfirm.trim().toLowerCase()) e.emailConfirm = "Os e-mails não são iguais.";
    if (!isValidPhone(form.whatsapp)) e.whatsapp = "Informe um WhatsApp válido.";
    if (!form.cidade) e.cidade = "Selecione a cidade onde mora.";
    if (!form.forma_cache) e.forma_cache = "Selecione como pretende receber o cachê.";
    if (!form.categoria) e.categoria = "Selecione uma categoria.";
    if (!form.titulo_trabalho.trim()) e.titulo_trabalho = "Informe o título do trabalho.";
    if (!form.descricao_trabalho.trim()) e.descricao_trabalho = "Conte sobre o seu trabalho.";
    const videoOk = form.video_url.trim() ? isValidUrl(form.video_url) : false;
    if (form.video_url.trim() && !videoOk) e.video_url = "Informe uma URL válida.";
    const photosOk = photos.length >= 3 && photos.length <= 5;
    if (!photosOk && !videoOk) e.midia = "Envie de 3 a 5 fotos ou informe um link de vídeo válido.";
    if (needsDuration && (!form.duracao || Number(form.duracao) <= 0)) e.duracao = "Informe a duração aproximada em minutos.";
    if (!form.classificacao) e.classificacao = "Selecione a classificação indicativa.";
    if (hasWorkshop) {
      if (!form.oficina_titulo.trim()) e.oficina_titulo = "Informe o título da oficina.";
      if (!form.oficina_descricao.trim()) e.oficina_descricao = "Descreva a oficina.";
      if (form.oficina_faixas.length === 0) e.oficina_faixas = "Selecione ao menos uma faixa etária.";
      if (!form.oficina_participantes || Number(form.oficina_participantes) < 15) e.oficina_participantes = "O mínimo é 15 participantes.";
      if (!form.oficina_materiais.trim()) e.oficina_materiais = "Informe os materiais necessários.";
    }
    if (checks.some((c) => !c)) e.declaracoes = "Marque todas as sete declarações.";
    return e;
  }, [form, photos, checks, hasWorkshop, needsDuration]);

  const valid = Object.keys(errors).length === 0;

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    const invalid = list.find((f) => !ACCEPTED.includes(f.type) && !/\.heic$/i.test(f.name));
    if (invalid) return toast.error("Formatos aceitos: JPG, PNG e HEIC.");
    const tooBig = list.find((f) => f.size > MAX_PHOTO_MB * 1024 * 1024);
    if (tooBig) return toast.error(`Cada arquivo pode ter no máximo ${MAX_PHOTO_MB} MB.`);
    setPhotos((p) => [...p, ...list].slice(0, 5));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid) return toast.error("Revise os campos destacados antes de enviar.");
    setSending(true);
    try {
      const paths: string[] = [];
      for (const file of photos) paths.push(await uploadFile(FORM_BUCKET, "fotos", file));
      const { error } = await supabase.from("registrations").insert({
        nome_artistico: form.nome_artistico.trim(),
        responsavel: form.responsavel.trim(),
        cpf: form.cpf,
        email: form.email.trim(),
        whatsapp: form.whatsapp,
        cidade: form.cidade,
        forma_cache: form.forma_cache,
        categoria: form.categoria,
        titulo_trabalho: form.titulo_trabalho.trim(),
        descricao_trabalho: form.descricao_trabalho.trim(),
        fotos: paths,
        video_url: form.video_url.trim() || null,
        redes_sociais: form.redes_sociais.trim() || null,
        duracao_minutos: needsDuration ? Number(form.duracao) : null,
        classificacao: form.classificacao,
        oficina_titulo: hasWorkshop ? form.oficina_titulo.trim() : null,
        oficina_descricao: hasWorkshop ? form.oficina_descricao.trim() : null,
        oficina_faixas: hasWorkshop ? form.oficina_faixas : [],
        oficina_participantes: hasWorkshop ? Number(form.oficina_participantes) : null,
        oficina_materiais: hasWorkshop ? form.oficina_materiais.trim() : null,
        declaracoes: Object.fromEntries(DECLARATIONS.map((text, i) => [String(i + 1), { texto: text, aceito: checks[i] }])),
      });
      if (error) throw error;
      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar sua inscrição.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8">
          <CheckCircle2 className="mx-auto size-16 text-brand-teal" />
          <h1 className="mt-6 font-display text-3xl uppercase sm:text-4xl md:text-5xl">Inscrição recebida!</h1>
          <p className="mt-4 text-lg text-muted-foreground">Recebemos sua inscrição. Todos os avisos serão enviados para o e-mail informado.</p>
          <a href={WHATSAPP_GROUP} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-3 bg-brand-pink px-6 py-4 text-sm font-bold uppercase text-primary-foreground">
            <MessageCircle className="size-5" /> Entrar no grupo de WhatsApp
          </a>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-brand-purple text-primary-foreground">
        {hero && <div className="relative aspect-[4/3] md:absolute md:inset-0 md:aspect-auto"><img src={hero} alt="Artista em apresentação no Festival Aviva Cultura" className="size-full object-cover" /></div>}
        <div className="hidden md:absolute md:inset-0 md:block md:bg-gradient-to-r md:from-brand-purple md:via-brand-purple/80 md:to-brand-purple/10" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
          <p className="text-sm font-bold uppercase text-brand-yellow">Inscrições</p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl uppercase leading-tight sm:text-4xl md:text-6xl">Inscreva seu trabalho</h1>
        </div>
      </section>

      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-10 px-5 py-14 md:px-8 md:py-20" noValidate>
        {/* Bloco 1 */}
        <Block title="Bloco 1 — Quem está se inscrevendo">
          <Field label="1. Nome do artista, grupo ou coletivo" help="é o nome que vai aparecer na programação." error={errors.nome_artistico}>
            <input maxLength={80} value={form.nome_artistico} onChange={(e) => set("nome_artistico", e.target.value)} className={inputCls} />
          </Field>
          <Field label="2. Nome completo do responsável pela inscrição" help="quem a produção procura para tratar da inscrição." error={errors.responsavel}>
            <input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} className={inputCls} />
          </Field>
          <Field label="3. CPF do responsável" help="usamos só para identificar sua inscrição. Nenhum documento é pedido agora." error={errors.cpf}>
            <input inputMode="numeric" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => set("cpf", maskCPF(e.target.value))} className={inputCls} />
          </Field>
          <Field label="4. E-mail" help="é por aqui que avisamos o resultado, confira se está certo." error={errors.email}>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Confirme seu e-mail" error={errors.emailConfirm}>
            <input type="email" value={form.emailConfirm} onChange={(e) => set("emailConfirm", e.target.value)} className={inputCls} />
          </Field>
          <Field label="5. WhatsApp" help="usamos só se precisarmos falar rápido com você." error={errors.whatsapp}>
            <input inputMode="numeric" placeholder="(11) 90000-0000" value={form.whatsapp} onChange={(e) => set("whatsapp", maskPhone(e.target.value))} className={inputCls} />
          </Field>
          <Field label="6. Cidade onde mora" error={errors.cidade}>
            <select value={form.cidade} onChange={(e) => set("cidade", e.target.value)} className={inputCls}>
              <option value="">Selecione</option>
              {cities.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
            </select>
          </Field>
          <Field label="7. Se for selecionado, como pretende receber o cachê?" help="dá para mudar depois, é só para a gente se organizar." error={errors.forma_cache}>
            <select value={form.forma_cache} onChange={(e) => set("forma_cache", e.target.value)} className={inputCls}>
              <option value="">Selecione</option>
              {PAYMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </Block>

        {/* Bloco 2 */}
        <Block title="Bloco 2 — A proposta">
          <Field label="8. Categoria" error={errors.categoria}>
            <div className="space-y-2">
              {categories.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-start gap-3 border border-border p-3 text-sm">
                  <input type="radio" name="categoria" checked={form.categoria === c.nome} onChange={() => set("categoria", c.nome)} className="mt-1" />
                  <span>{c.nome}{formatMoney(c.valor) ? ` — ${formatMoney(c.valor)}` : ""}</span>
                </label>
              ))}
              {categories.length === 0 && <p className="text-sm text-muted-foreground">As categorias desta edição ainda não foram publicadas.</p>}
            </div>
          </Field>
          {payments.length > 0 && (
            <Field label="Formas de pagamento desta edição">
              <p className="text-sm text-foreground/80">{payments.map((p) => p.nome).join(" · ")}</p>
            </Field>
          )}
          <Field label="9. Título do trabalho" error={errors.titulo_trabalho}>
            <input maxLength={100} value={form.titulo_trabalho} onChange={(e) => set("titulo_trabalho", e.target.value)} className={inputCls} />
          </Field>
          <Field label="10. Conte sobre o seu trabalho" help="escreva do seu jeito. Queremos entender o que é o trabalho, como ele nasceu e o que o público vai ver. Não precisa de linguagem formal." error={errors.descricao_trabalho}>
            <textarea rows={7} maxLength={2000} value={form.descricao_trabalho} onChange={(e) => set("descricao_trabalho", e.target.value)} className={inputCls} />
            <p className="mt-1 text-right text-xs text-muted-foreground">{form.descricao_trabalho.length}/2000</p>
          </Field>
          <Field label="11. Fotos do trabalho (3 a 5 arquivos, JPG/PNG/HEIC, até 10 MB cada)" help="podem ser fotos de celular." error={errors.midia}>
            <label className="inline-flex cursor-pointer items-center gap-2 border border-dashed border-border px-4 py-3 text-sm font-semibold">
              <Upload className="size-4" /> Escolher fotos
              <input type="file" multiple accept=".jpg,.jpeg,.png,.heic,image/*" className="hidden" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
            </label>
            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="relative">
                    <img src={URL.createObjectURL(file)} alt={file.name} className="aspect-square w-full object-cover" />
                    <button type="button" onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 bg-background/90 p-1"><X className="size-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </Field>
          <Field label="12. Link de vídeo (opcional)" help="se enviou as fotos, pode deixar em branco. Deixe o link público ou não listado." error={errors.video_url}>
            <input type="url" placeholder="https://..." value={form.video_url} onChange={(e) => set("video_url", e.target.value)} className={inputCls} />
          </Field>
          <Field label="13. Site ou redes sociais (opcional)">
            <input value={form.redes_sociais} onChange={(e) => set("redes_sociais", e.target.value)} className={inputCls} />
          </Field>
          {needsDuration && (
            <Field label="14. Duração aproximada, em minutos" error={errors.duracao}>
              <input type="number" min={1} value={form.duracao} onChange={(e) => set("duracao", e.target.value)} className={inputCls} />
            </Field>
          )}
          <Field label="15. Classificação indicativa" help="na dúvida, marque livre." error={errors.classificacao}>
            <select value={form.classificacao} onChange={(e) => set("classificacao", e.target.value)} className={inputCls}>
              <option value="">Selecione</option>
              {RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
        </Block>

        {/* Bloco 3 */}
        {hasWorkshop && (
          <Block title="Bloco 3 — A oficina">
            <Field label="17. Título da oficina" error={errors.oficina_titulo}>
              <input maxLength={100} value={form.oficina_titulo} onChange={(e) => set("oficina_titulo", e.target.value)} className={inputCls} />
            </Field>
            <Field label="18. O que os participantes vão fazer na oficina?" help="conte o passo a passo do que acontece em uma hora de oficina." error={errors.oficina_descricao}>
              <textarea rows={6} maxLength={1000} value={form.oficina_descricao} onChange={(e) => set("oficina_descricao", e.target.value)} className={inputCls} />
              <p className="mt-1 text-right text-xs text-muted-foreground">{form.oficina_descricao.length}/1000</p>
            </Field>
            <Field label="19. Faixa etária indicada" error={errors.oficina_faixas}>
              <div className="space-y-2">
                {AGE_GROUPS.map((g) => (
                  <label key={g} className="flex cursor-pointer items-center gap-3 text-sm">
                    <input type="checkbox" checked={form.oficina_faixas.includes(g)} onChange={(e) => set("oficina_faixas", e.target.checked ? [...form.oficina_faixas, g] : form.oficina_faixas.filter((x) => x !== g))} />
                    {g}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="20. Quantos participantes você atende bem de uma vez?" help="mínimo de 15 participantes. Se o seu limite for menor, fale com a produção antes de se inscrever — podemos avaliar o caso." error={errors.oficina_participantes}>
              <input type="number" min={15} value={form.oficina_participantes} onChange={(e) => set("oficina_participantes", e.target.value)} className={inputCls} />
            </Field>
            <Field label="21. De que material a oficina precisa?" help="diga o que você traz e o que precisa que a gente providencie." error={errors.oficina_materiais}>
              <textarea rows={4} maxLength={500} value={form.oficina_materiais} onChange={(e) => set("oficina_materiais", e.target.value)} className={inputCls} />
              <p className="mt-1 text-right text-xs text-muted-foreground">{form.oficina_materiais.length}/500</p>
            </Field>
          </Block>
        )}

        {/* Bloco 5 */}
        <Block title="Bloco 5 — Declarações">
          <div className="space-y-4">
            {DECLARATIONS.map((text, i) => (
              <label key={i} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                <input type="checkbox" checked={checks[i]} onChange={(e) => setChecks((c) => c.map((v, idx) => (idx === i ? e.target.checked : v)))} className="mt-1 shrink-0" />
                <span>
                  {text}
                  {i === 5 && next?.regulamentoUrl && (
                    <> <a href={next.regulamentoUrl} target="_blank" rel="noreferrer" className="font-bold text-brand-pink underline">[Ver Regulamento]</a></>
                  )}
                </span>
              </label>
            ))}
          </div>
          {errors.declaracoes && <p className="mt-3 text-sm font-semibold text-destructive">{errors.declaracoes}</p>}
        </Block>

        <button disabled={!valid || sending} className="w-full bg-brand-pink px-6 py-4 text-sm font-bold uppercase text-primary-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground">
          {sending ? "Enviando..." : "Enviar inscrição"}
        </button>
        {!valid && <p className="text-center text-sm text-muted-foreground">Preencha todos os campos obrigatórios e marque as sete declarações para liberar o envio.</p>}
      </form>
    </SiteShell>
  );
}

const inputCls = "w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-brand-pink";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border p-6 md:p-8">
      <h2 className="font-display text-xl uppercase text-brand-pink md:text-2xl">{title}</h2>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

function Field({ label, help, error, children }: { label: string; help?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold">{label}</label>
      {help && <p className="mt-1 text-xs text-muted-foreground">{help}</p>}
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1 text-sm font-semibold text-destructive">{error}</p>}
    </div>
  );
}
