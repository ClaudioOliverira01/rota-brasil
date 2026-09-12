# Rota Brasil — Etapa 1.1

Correções aplicadas após o teste em vídeo:

- Corrigido o caminho do `main.js` para uso com Vite.
- Importação do CSS global no `main.js`.
- Campo de apelido reposicionado de forma responsiva em relação ao canvas do Phaser.
- Enter no campo de apelido inicia a aventura.
- Botões do menu ganharam área visual/interativa mais consistente.
- Modal de “Como Jogar” e “Acessibilidade” reorganizado para evitar sobreposição de textos.
- Acessibilidade agora permite ligar/desligar a narração pelo menu.
- Narração usa a API Speech Synthesis com seleção preferencial de voz em português do Brasil e preferência por vozes femininas/naturais disponíveis no computador.
- Voz ajustada para ritmo um pouco mais lento e pitch mais alto, buscando uma sonoridade mais amigável para crianças.
- Fase 1 recebeu nova implementação de arrastar e soltar baseada diretamente em pointerdown/pointermove/pointerup, evitando a inconsistência observada no teste.
- Slots da bússola ficaram maiores e mais fáceis de alcançar.
- As peças agora destacam o slot mais próximo durante o arraste.
- Tolerância de soltura ampliada sem permitir encaixes em direções erradas.
- Feedback de acerto/erro e pontuação atualizados em tempo real.
- Integração com `ApiService`, `GameState` e `ProgressManager` foi preservada.
