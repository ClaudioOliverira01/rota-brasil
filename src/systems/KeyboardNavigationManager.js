import { GameState } from "./GameState.js";

export const KeyboardNavigationManager = {
  scene: null,
  items: [],
  currentIndex: -1,
  enabled: true,

  init(scene) {
    this.scene = scene;
    this.items = [];
    this.currentIndex = -1;

    this.enabled =
      GameState.get()
        .accessibility
        ?.keyboardNavigation !== false;

    if (!scene?.input?.keyboard) {
      return;
    }

    scene.input.keyboard.on(
      "keydown-TAB",
      event => {
        if (!this.enabled) return;

        event.preventDefault();

        this.move(
          event.shiftKey
            ? -1
            : 1
        );
      }
    );

    scene.input.keyboard.on(
      "keydown-ENTER",
      event => {
        if (!this.enabled) return;

        const item =
          this.items[
            this.currentIndex
          ];

        if (
          item &&
          typeof item.activate ===
            "function"
        ) {
          item.activate();
        }
      }
    );

    scene.input.keyboard.on(
      "keydown-ESC",
      () => {
        const item =
          this.items[
            this.currentIndex
          ];

        if (
          item &&
          typeof item.escape ===
            "function"
        ) {
          item.escape();
        }
      }
    );
  },

  register({
    object,
    activate,
    escape
  }) {
    this.items.push({
      object,
      activate,
      escape
    });
  },

  move(direction) {
    if (!this.items.length) {
      return;
    }

    this.currentIndex += direction;

    if (
      this.currentIndex >=
      this.items.length
    ) {
      this.currentIndex = 0;
    }

    if (
      this.currentIndex < 0
    ) {
      this.currentIndex =
        this.items.length - 1;
    }

    this.focusCurrent();
  },

  focusCurrent() {
    const item =
      this.items[
        this.currentIndex
      ];

    if (!item) return;

    this.items.forEach(
      entry => {
        if (
          entry.object?.setScale
        ) {
          entry.object.setScale(
            1
          );
        }
      }
    );

    if (
      item.object?.setScale
    ) {
      item.object.setScale(
        1.06
      );
    }
  },

  clear() {
    this.items = [];
    this.currentIndex = -1;
    this.scene = null;
  }
};