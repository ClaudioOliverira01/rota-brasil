# Rota Brasil — Frontend Etapa 1

Frontend do jogo educativo **Rota Brasil: A Expedição de Aê**.

## Stack

- Phaser 3
- JavaScript ES6+
- HTML5
- CSS3
- Vite

## O que já está funcionando

- Menu inicial
- Tela de escolha de avatar
- Apelido genérico
- Introdução da história
- Fase 1 jogável
- Drag-and-drop dos pontos cardeais
- Feedback positivo para acerto
- Feedback orientativo para erro
- Pontuação
- Estrelas
- Persistência local via LocalStorage
- Camada `ApiService` preparada para integração com o backend
- Narração usando `SpeechSynthesis` do navegador
- Layout responsivo via Phaser Scale FIT

## Como executar

Abra o terminal dentro desta pasta e rode:

```bash
npm install
npm run dev
```

Depois abra o endereço mostrado pelo Vite, normalmente:

```text
http://localhost:5173
```

## Integração com o backend

Por padrão:

```env
VITE_USE_MOCK=true
```

Isso permite desenvolver o jogo mesmo enquanto o backend está sendo construído.

Quando o responsável pelo backend entregar os endpoints, altere:

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:3333/api
```

Os endpoints atualmente previstos no frontend estão concentrados exclusivamente em:

```text
src/services/ApiService.js
```

Assim, as cenas do jogo não precisam conhecer detalhes do banco ou do Express.

## Importante

Não coloque as credenciais do Supabase no frontend. O frontend deve conversar com a API do backend, e o backend é quem deve acessar o banco.

## Próxima etapa

Depois de validar esta base:

1. transformar a Fase 1 em uma experiência visual mais rica;
2. adicionar assets do Aê;
3. adicionar mapa estilizado;
4. implementar Fase 2;
5. implementar Fase 3;
6. implementar Fase 4;
7. implementar fase bônus;
8. completar acessibilidade;
9. conectar aos endpoints reais do backend.
