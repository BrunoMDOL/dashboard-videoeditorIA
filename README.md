# Dashboard de Reels | Besser Home

Biblioteca interna dos Reels do @besser.home. Cada vídeo tem uma análise profunda da edição (cortes, ritmo, legendas, movimento, cor, áudio), com botão para copiar e colar no ChatGPT (modo Work) e replicar o estilo no Premiere.

## Estado atual

Prévia visual com uma amostra real de Reels coletada da API da Meta em 25/09/2026 (`src/lib/mock/reels.json`, capas em `public/mock/covers`). Três Reels têm análise de exemplo feita manualmente, para validar o formato.

Próximas etapas:

1. Banco no Supabase (projeto besser-calculadora, schema próprio) e login restrito à lista de e-mails.
2. Sincronização a cada 30 min com o token próprio da Meta (Edge Function + pg_cron).
3. Análise automática de cada Reel com Gemini.
4. Métricas, score de desempenho calculado por código e destaque automático.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Estrutura

- `src/lib/dados.ts`: única porta de acesso aos dados. Hoje lê a amostra; depois lê do Supabase.
- `src/lib/periodos.ts`: filtros de período no horário de Brasília (semana de segunda a domingo).
- `src/lib/analise.ts`: seções da análise e o texto que vai para a área de transferência.
- `src/components/faixa-de-cortes.tsx`: a linha do tempo de planos, com o gancho em vermelho.
