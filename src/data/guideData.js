/**
 * Dicas do Personagem Guia.
 *
 * Arquivo SEM dependência de Phaser/React: só dados. Pode ser reaproveitado
 * quando a interface migrar para React.
 *
 * Cada fase tem uma lista de dicas. A 1ª é mostrada automaticamente ao entrar
 * na fase; as demais aparecem quando a criança toca no guia.
 * Chave 5 = Fase Bônus.
 */
export const GUIDE_TIPS = {
  1: [
    "Vamos reconstruir a bússola! Arraste cada ponto cardeal até o lugar certo.",
    "O Sol nasce no LESTE e se põe no OESTE. Use isso como pista!",
    "Norte fica em cima, Sul embaixo. Leste à direita e Oeste à esquerda.",
    "Errou? Sem problema! Tente de novo, eu estou aqui com você."
  ],
  2: [
    "Olhe a paisagem do cartão e arraste para a região do Brasil onde ela existe.",
    "Leia a pista escrita no cartão. Ela ajuda a descobrir a região.",
    "As regiões são: Norte, Nordeste, Centro-Oeste, Sudeste e Sul.",
    "Se ficar em dúvida, use o botão de dica!"
  ],
  3: [
    "Cada cartão mostra um clima. Arraste para a paisagem que combina com ele.",
    "Pense: onde chove muito? Onde faz muito calor? Onde faz frio?",
    "Pistas de clima: úmido, seco, quente, frio e chuvoso.",
    "Quase lá! Cada acerto devolve uma peça da bússola."
  ],
  4: [
    "Vamos cuidar da natureza! Arraste cada objeto até a lixeira correta.",
    "Olhe de que material o objeto é feito: papel, plástico, vidro ou metal.",
    "Separar o lixo ajuda a proteger rios, florestas e animais.",
    "Falta pouco para a bússola ficar completa!"
  ],
  5: [
    "Fase bônus! Ouça o som e descubra qual animal brasileiro está falando.",
    "Toque no botão de ouvir quantas vezes quiser.",
    "Preste atenção: cada animal tem um som diferente."
  ]
};

export const GUIDE_CONFIG = {
  // Canto da tela (jogo é 1280x720). Troque aqui se algum canto atrapalhar.
  position: "bottom-left", // padrão: "bottom-left" | "bottom-right"
  // Exceções por fase (Fase 2: cartões na esquerda; Bônus: respostas no centro)
  positionByPhase: { 2: "bottom-right", 5: "bottom-right" },
  // Segundos até o balão se recolher sozinho (a criança toca no guia para reabrir)
  bubbleSeconds: 9
};