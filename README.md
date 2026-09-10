# Diário de Obra — projeto web

## O que já está pronto
- Login real (e-mail + senha) via Supabase
- Banco de dados com controle de "ativo" por cliente (obra)
- Calendário + formulário diário + relatório mensal (igual ao protótipo)
- Perfis "preencher" (equipe) e "visualizar" (cliente)

## Passo A — Rodar na sua máquina para testar

1. Instale o [Node.js](https://nodejs.org) (versão 18 ou mais recente) se ainda não tiver
2. Abra o terminal dentro desta pasta e rode:
   ```
   npm install
   npm run dev
   ```
3. Abra o endereço que aparecer no terminal (geralmente `http://localhost:5173`)
4. Vai aparecer a tela de login — mas ainda não existe nenhum usuário. Siga o Passo B primeiro.

## Passo B — Criar sua primeira obra e seu primeiro usuário de teste

1. No painel do Supabase, vá em **Table Editor → obras** e clique em **Insert row**.
   Preencha `nome` com o nome da obra (ex: "Obra Teste") e salve. Copie o `id` gerado (um UUID) — vai precisar dele já já.
2. Vá em **Authentication → Users → Add user → Create new user**.
   Preencha e-mail e senha (essa será a conta de quem vai preencher o diário). Marque "Auto Confirm User".
3. Copie o `UID` desse usuário criado.
4. Vá em **Table Editor → profiles → Insert row** e preencha:
   - `id`: o UID copiado no passo 3
   - `email`: o e-mail usado
   - `papel`: `preencher`
   - `obra_id`: o id da obra copiado no passo 1
   - `ativo`: marque como `true`
5. Repita os passos 2 a 4 para criar um segundo usuário com `papel` = `visualizar` (o cliente final), usando o mesmo `obra_id`.

Pronto — agora dá pra fazer login com essas duas contas e testar os dois modos.

## Passo C — Publicar (deploy) para vender de verdade

Depois de testar localmente, o próximo passo é publicar isso na Vercel. Quando chegar
nessa etapa, volte a conversar com o Claude — ele te guia na configuração das variáveis
de ambiente lá (as mesmas do arquivo `.env`) e no processo de deploy.

## Passo D — Automatizar criação/bloqueio de acesso pela Hotmart

Hoje os passos B.2 a B.4 são manuais (você cria a conta e o perfil na mão a cada venda).
Isso já funciona para começar a vender. Quando o volume de vendas justificar, dá pra
automatizar com um webhook da Hotmart que cria o usuário e ativa/desativa o campo
`ativo` sozinho. Essa é a etapa seguinte do projeto.
