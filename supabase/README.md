# Setup do Supabase — Tasks Lagos

Passo-a-passo único, rode na ordem.

## 1. Rodar o schema

1. Abra `supabase.com` → seu projeto.
2. Sidebar → **SQL Editor** → **New query**.
3. Cole TODO o conteúdo de `schema.sql` e clique **Run**.
4. Confira: sidebar **Database → Tables** deve listar `profiles`, `boards`, `columns`, `tasks`.

## 2. Desativar confirmação por email (para o demo)

1. Sidebar → **Authentication** → **Sign In / Up** (ou Providers → Email).
2. Desmarque **Confirm email** e salve.
   - Sem isso, signup exige clicar num link enviado por email.

## 3. Criar os 3 admins (Heads)

1. Sidebar → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Para cada Head, preencha:
   - Email: use um email real ou de teste (ex: `david@lagos.local`)
   - Password: `8D9A3#2*`
   - Marque **Auto Confirm User**
3. Crie os três: **David**, **Rafael**, **Alexandre**.
4. Logo após criar cada um, abra o usuário e edite **User Metadata** (raw):
   ```json
   { "name": "David" }
   ```
   (mesmo padrão para Rafael e Alexandre)

> Alternativa mais rápida: deixe o nome como o prefixo do email — o trigger usa `split_part(email, '@', 1)` se `name` não vier nos metadados.

## 4. Promover os Heads a admin

No SQL Editor:

```sql
update public.profiles
set role = 'admin'
where name in ('David', 'Rafael', 'Alexandre');
```

(ou use os emails se preferir: `where id in (select id from auth.users where email in ('david@lagos.local','rafael@lagos.local','alexandre@lagos.local'))`)

## 5. Configurar o frontend

Crie um arquivo `.env.local` na raiz do projeto (já feito automaticamente):

```
VITE_SUPABASE_URL=https://mgsfqkimskawwpsjgveo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_aPjjCngFTykCOUBraP528A_sdGcNnxW
```

Depois:

```
npm install
npm run dev
```

## ⚠️ Segurança

- A senha `8D9A3#2*` foi compartilhada em chat. Recomendação: cada Head troque a própria senha após o primeiro login.
- A **JWT secret** que você compartilhou (`f9659a93-...`) **NÃO** vai pro frontend. Mantenha-a em segredo — ela permite assinar tokens em nome de qualquer usuário. Se algum dia ela vazar, gere uma nova em **Project Settings → API → Reset JWT Secret**.
- Apenas a chave **publishable** (`sb_publishable_...`) entra no `.env.local`. RLS no banco é o que efetivamente protege os dados.
