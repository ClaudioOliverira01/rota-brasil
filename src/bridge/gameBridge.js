/**
 * Ponte entre o Phaser e o React.
 * Um "mensageiro" minúsculo, sem dependências: o Phaser avisa
 * (emit) e o React escuta (on).
 */
export const BRIDGE_EVENTS = Object.freeze({
  // Uma cena do Phaser pediu para voltar ao menu principal
  MENU_REQUESTED: "menu:requested"
});

const listeners = new Map();

export const gameBridge = {
  /**
   * Registra um ouvinte e devolve a função que o remove.
   */
  on(eventName, handler) {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, new Set());
    }

    listeners.get(eventName).add(handler);

    return () => this.off(eventName, handler);
  },

  off(eventName, handler) {
    listeners.get(eventName)?.delete(handler);
  },

  emit(eventName, payload) {
    listeners.get(eventName)?.forEach(handler => handler(payload));
  }
};