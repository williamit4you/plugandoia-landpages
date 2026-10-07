# Plugando IA Landpages

Aplicação independente para as landing pages, analytics interno e recebimento de vendas da Hotmart.

## Rotas públicas

- `/vibecode`
- `/fundamentos-ia`
- `/curso-arquitetura-software`
- `/curso-rabbitmq`
- `/curso-saas`
- `/formacao-completa`
- `/landing-admin`
- `/landing-api/events`
- `/landing-api/webhooks/hotmart`
- `/landing-assets`

## Variáveis de ambiente

Nenhuma credencial deve ser salva no GitHub. Copie `.env.example` somente como referência e configure os valores reais no EasyPanel.

| Variável | Obrigatória | Uso |
|---|---:|---|
| `DATABASE_URL` | Sim | URL interna de um PostgreSQL exclusivo para este serviço |
| `ADMIN_EMAIL` | Sim | E-mail de acesso ao painel |
| `ADMIN_PASSWORD` | Sim | Senha forte do painel |
| `ADMIN_SESSION_SECRET` | Sim | Segredo aleatório com pelo menos 32 bytes |
| `ANALYTICS_IP_SALT` | Sim | Segredo diferente usado para anonimizar endereços IP |
| `HOTMART_WEBHOOK_TOKEN` | Sim para vendas | `hottok` informado pela Hotmart |
| `NEXT_PUBLIC_META_PIXEL_ID` | Sim | ID público do Meta Pixel |
| `NEXT_PUBLIC_VIBECODE_CHECKOUT_URL` | Sim | Checkout do Vibe Coding |
| `NEXT_PUBLIC_FORMACAO_COMPLETA_CHECKOUT_URL` | Sim | Checkout da formação completa |
| `NEXT_PUBLIC_RABBITMQ_CHECKOUT_URL` | Sim | Checkout do RabbitMQ |
| `NEXT_PUBLIC_RABBITMQ_YOUTUBE_VIDEO_ID` | Não | ID do vídeo da página RabbitMQ |
| `NEXT_PUBLIC_SAAS_PRICE` | Sim | Preço numérico do curso SaaS |
| `NEXT_PUBLIC_SAAS_CHECKOUT_URL` | Sim | Checkout do curso SaaS |
| `NEXT_PUBLIC_ARCHITECTURE_CHECKOUT_URL` | Sim | Checkout de Arquitetura |

Gere os dois segredos separadamente. Exemplo em PowerShell:

```powershell
[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

## EasyPanel

1. Crie um PostgreSQL exclusivo e copie sua URL interna para `DATABASE_URL`.
2. Crie um App chamado `landpages` usando este repositório e o `Dockerfile` da raiz.
3. Faça primeiro o deploy usando apenas o domínio temporário do EasyPanel.
4. Teste as seis páginas, `/landing-admin` e um webhook de teste da Hotmart.
5. Adicione ao novo serviço as rotas abaixo no host `plugandoia.cloud`:
   - cada uma das seis páginas públicas;
   - `/landing-admin`;
   - `/landing-api`;
   - `/landing-assets`.
6. Mantenha `plugandoia.cloud/` apontando para o serviço antigo.

O EasyPanel deve encaminhar todos os caminhos acima para a porta interna `3000` deste serviço.

## Hotmart

Cadastre a URL abaixo em **Ferramentas → Webhook (API e notificações)**:

```text
https://plugandoia.cloud/landing-api/webhooks/hotmart
```

Use a versão recomendada pela Hotmart e selecione compra aprovada/completa, aguardando pagamento, cancelada, reembolsada, chargeback e abandono de carrinho. Configure o mesmo `hottok` em `HOTMART_WEBHOOK_TOKEN`.

## Desenvolvimento

```bash
npm ci
npm run dev
```

O container executa automaticamente a migration idempotente antes de iniciar o servidor.
