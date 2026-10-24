# Rota Brasil — Frontend

Jogo educativo **Rota Brasil: A Expedição de Aê** (Geografia do Brasil, BNCC 4º/5º ano).

## Stack

- React 18 + Vite 6 (JavaScript ES2022, sem TypeScript)
- CSS próprio (design tokens em `src/styles/tokens.css`)
- Narração com `SpeechSynthesis` do navegador
- Integração com a API Rota Brasil (pasta `../backend`)

## Executar

```bash
npm install
cp .env.example .env      # ajuste VITE_API_BASE_URL se preciso
npm run dev               # http://localhost:5173
```

O backend precisa estar rodando (veja o README na raiz do projeto).

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run build` | build de produção em `dist/` |
| `npm run preview` | serve o build para conferência |
| `npm run check:imports` | confere se todos os imports existem no Git com a grafia exata (simula o Linux da Vercel) |

## Como o frontend usa a API

Toda chamada HTTP está em **`src/services/ApiService.js`** (URL base vinda de `VITE_API_BASE_URL`). As telas não chamam a API diretamente: usam os serviços.

| Serviço | Momento | Endpoint |
|---|---|---|
| `PlayerSession.identifyPlayer` | digitou o apelido | `GET /players?nickname=` e, se novo, `POST /players` |
| `PlayerSession.beginAdventure` | escolheu o avatar | `PATCH /players/:id` (se mudou) e `POST /progress` |
| `PlayerSession.restartFromZero` | "Começar do zero" | `DELETE /players/:id/progress` |
| `PhaseSession.completePhase` | terminou uma fase | `POST /progress/phases` e `POST /progress` |
| `PhaseSession.completeBonus` | terminou o bônus | `POST /progress` (com `bonusCompleted`/`bonusSeal`) |
| `ExpeditionService.downloadReport` | "Gerar relatório em PDF" | `GET /reports/:id/pdf` |
| `ExpeditionService.finishExpedition` | "Finalizar jogo" | `POST /progress` |
| `useRanking` | tela de Ranking | `GET /ranking` e `GET /stats/phases` |

O progresso enviado vem sempre de `ProgressSnapshot.js` (retrato completo do estado), e o servidor consolida sem deixar regredir.

### Sem conexão

Se a API não responder, o jogo continua: o progresso fica no navegador (localStorage), o ranking mostra os jogadores do aparelho com um aviso e o PDF é gerado localmente (`ReportService.js`). Quando um perfil do aparelho tem um ID que o servidor não conhece mais (banco trocado), o jogador é recriado e o progresso local é reenviado.

`VITE_USE_MOCK=true` desliga a API de propósito (desenvolvimento só da interface).

## Importante

Nunca coloque chaves do Supabase no frontend: variáveis `VITE_*` ficam visíveis no navegador. Só o backend acessa o banco.
