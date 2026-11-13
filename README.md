# 10 e FAIXA — catálogo

Catálogo on-line da loja 10 e FAIXA (Jacobina - BA). O cliente monta o pedido e envia pelo WhatsApp; o lojista marca o que tem em estoque e cadastra produtos.

- `/` — catálogo com filtros, fotos em carrossel, ampliar foto e "Meu pedido" que abre o WhatsApp com a mensagem pronta.
- `/admin` — painel do lojista (senha): disponível/esgotado, cadastrar/editar/excluir produtos com fotos, criar/renomear/excluir categorias.

## Stack

Next.js 16 (App Router) · Postgres (Neon, pela Vercel Marketplace) · Vercel Blob (fotos) · Tailwind CSS 4.

As tabelas são criadas sozinhas no primeiro acesso, e com o banco vazio entram produtos de exemplo (podem ser excluídos pelo painel).

## Variáveis de ambiente

Veja `.env.example`:

| Variável | O que é |
| --- | --- |
| `DATABASE_URL` | Postgres. Preenchida ao conectar o Neon ao projeto na Vercel. |
| `BLOB_READ_WRITE_TOKEN` | Fotos. Preenchida ao conectar um Blob store ao projeto. |
| `ADMIN_PASSWORD` | Senha da área do lojista. |
| `AUTH_SECRET` | Texto aleatório longo para assinar o login. |
| `NEXT_PUBLIC_WHATSAPP` | Número que recebe os pedidos (só dígitos, com 55 + DDD). |

Sem `DATABASE_URL` o site mostra os produtos de exemplo em modo leitura.

## Rodando local

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev
```
