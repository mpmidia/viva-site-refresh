# Múltiplas próximas edições e experiência pública

## Resultado
- A Área da Equipe passa a ter uma lista de próximas edições, com criação, edição e exclusão.
- Cada edição mantém seus próprios locais, datas, capa, regulamento, logos, programação, categorias, valores e opções de recebimento de cachê.
- Sem edições anunciadas, as páginas públicas mostram somente “Em breve”.
- Com várias edições, “Próxima Edição” lista todas; inscrição exige escolher uma; programação mostra uma edição por vez.

## Área da Equipe
- Transformar “Próxima Edição” em uma lista gerenciável com botão para nova edição e ações de editar/excluir.
- Preservar o cadastro existente como a primeira edição da lista, sem perda de conteúdo ou arquivos.
- Adicionar um seletor de edição nas áreas Programação e Inscrições, evitando mistura de atrações, configurações e inscrições recebidas.
- Manter os controles atuais de capas, regulamento, oficinas e barra de logos dentro de cada edição.
- Trocar todos os textos visíveis de “formas de pagamento” por “formas de recebimento do cachê”.

## Páginas públicas
- Reformular “Próxima Edição” como uma lista visual de edições anunciadas, priorizando capa, cidade, locais, período do evento e situação das inscrições.
- Destacar o período de inscrições com hierarquia visual mais clara e linguagem voltada a artistas, grupos e coletivos.
- Levar cada edição para seus detalhes, inscrições e programação sem misturar dados de outras cidades.
- Usar a primeira capa cadastrada da edição como sua identidade visual também na Programação; sem capa, não exibir imagem substituta.
- Na Programação, oferecer seleção clara da edição e mostrar apenas suas atrações, datas, locais e logos.
- Na Inscrição, exigir a escolha de uma edição com inscrições abertas e atualizar categorias, valores, recebimento de cachê, regulamento e oficinas conforme a seleção.

## Dados e persistência
- Relacionar atrações, inscrições, cidades do formulário, categorias e opções de recebimento à próxima edição correspondente.
- Migrar os dados atuais para a edição já cadastrada antes de tornar esses vínculos obrigatórios.
- Manter as regras de acesso atuais: leitura pública apenas do necessário e gerenciamento restrito à equipe.
- Organizar novos uploads em pastas por edição, mantendo compatibilidade com os arquivos existentes.
- Excluir uma edição somente após confirmação, removendo seus registros relacionados; arquivos associados também serão removidos pelo painel quando aplicável.

## Validação
- Conferir criação, edição, exclusão e persistência após atualizar, sair e entrar novamente.
- Conferir duas edições simultâneas sem cruzamento de atrações, inscrições ou configurações.
- Conferir os estados antes, durante e depois das inscrições, além do estado sem edição.
- Conferir capas, regulamento, logos, oficinas e programação por edição.
- Conferir as páginas em desktop, tablet e celular, sem sobreposição, imagens quebradas ou rolagem lateral.

## Detalhes técnicos
- Adicionar `next_edition_id` às tabelas relacionadas, com índices, chaves estrangeiras e migração segura dos registros existentes.
- Manter `next_edition` como entidade operacional separada do histórico em `editions`.
- Parametrizar consultas e chaves de cache por edição para impedir dados antigos ou de outra edição na tela.
- Criar páginas de detalhe com identificador na URL e manter as URLs atuais como listas/seletores públicos.
