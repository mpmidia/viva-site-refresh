# Reformulação do site Aviva Cultura

## Visão geral

Recriar o site mantendo textos e imagens do site atual, com visual modernizado (mesma identidade — rosa, amarelo, roxo, tipografia amigável). Adicionar backend com Lovable Cloud para autenticação admin e gerenciamento de edições. A cada nova edição criada, ela vira automaticamente a home; as anteriores caem em "Edições Anteriores".

## Menu (mantido igual ao original)

- Home
- O Festival
- Edições Anteriores
- Confira a Próxima Edição

## Páginas públicas

1. **Home (`/`)** — mostra a última edição cadastrada (nome, data, local, participantes, descrição, botão "Faça sua inscrição" com link externo). Se não houver edição, mostra o hero institucional atual + estatísticas (+174 artistas, +7.713 espectadores, +4 cidades).
2. **O Festival (`/o-festival`)** — blocos "O Festival" e "Quem faz" (ACRIART), com imagens do site atual.
3. **Edições Anteriores (`/edicoes-anteriores`)** — grid de todas as edições exceto a mais recente.
4. **Confira a Próxima Edição (`/proxima-edicao`)** — destaque completo da edição atual com CTA de inscrição.
5. **Login admin (`/auth`)** — email + senha + link "Esqueci minha senha".
6. **Reset de senha (`/reset-password`)** — formulário para definir nova senha.

## Dashboard admin (`/dashboard`, protegido)

- **Perfil**: nome, email, telefone, alterar senha.
- **Edições**: listar, criar, editar, excluir. Campos: título, data, local, número de participantes, descritivo, URL do botão de inscrição, imagem de capa (upload).
- A edição com data mais recente é automaticamente a "atual" (home + próxima edição).

## Backend (Lovable Cloud)

Tabelas:
- `profiles` (id → auth.users, nome, telefone, email)
- `user_roles` (id, user_id, role) + enum `app_role` + função `has_role` (padrão seguro)
- `editions` (id, titulo, data, local, participantes, descricao, inscricao_url, imagem_url, created_at)

RLS:
- `editions`: SELECT público para todos; INSERT/UPDATE/DELETE apenas para admins.
- `profiles`: usuário lê/edita o próprio.
- `user_roles`: leitura via `has_role`.

Storage bucket público `edition-images` para uploads.

Primeiro usuário cadastrado recebe role `admin` automaticamente (trigger). Cadastros seguintes são usuários comuns sem acesso ao dashboard.

## Design

- Paleta baseada no site atual: rosa magenta (#E63888), amarelo (#F5A623), roxo (#6B3FA0), bege claro de fundo.
- Tipografia: display arredondada tipo "Fredoka" para títulos + Inter para corpo.
- Formas orgânicas (curvas SVG nas seções), respingos coloridos como no logo, mais respiro e hierarquia moderna.
- Componentes shadcn customizados via tokens em `src/styles.css`.

## Detalhes técnicos

- TanStack Start + Cloud (Supabase gerenciado).
- Autenticação email/senha; reset via `resetPasswordForEmail` → `/reset-password`.
- Server functions com `requireSupabaseAuth` para mutações de edições.
- Loaders públicos usam client publishable server-side para SSR das edições.
- Uploads via `supabase.storage` no dashboard.
- Sitemap + robots atualizados com as 4 rotas públicas.

## Fora do escopo

- Não vou recriar comportamentos que dependam de plugins WordPress específicos (formulários de contato, integrações de terceiros) — só o que o pedido pede.
- Imagens são reaproveitadas via URL do site atual (hotlink) para manter idênticas.
