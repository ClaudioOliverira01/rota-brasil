import Phaser from "phaser";

import {
    GAME_WIDTH,
    GAME_HEIGHT
} from "../config/gameConfig.js";

import { GameState } from "../systems/GameState.js";
import { ProgressManager } from "../systems/ProgressManager.js";
import { ApiService } from "../services/ApiService.js";

export class PlayerScene extends Phaser.Scene {

    constructor() {

        super("PlayerScene");

        this.inputElement = null;
    }

    create() {

        this.cameras.main.setBackgroundColor(
            "#DFF6EE"
        );

        this.createBackground();

        this.createTitle();

        this.createNicknameInput();

        this.createContinueButton();

        this.createBackButton();
    }

    createBackground() {

        const graphics =
            this.add.graphics();

        graphics.fillStyle(
            0xDFF6EE,
            1
        );

        graphics.fillRect(
            0,
            0,
            GAME_WIDTH,
            GAME_HEIGHT
        );

        graphics.fillStyle(
            0xBDE8D5,
            1
        );

        graphics.fillCircle(
            70,
            680,
            190
        );

        graphics.fillCircle(
            1210,
            680,
            220
        );
    }

    createTitle() {

        this.add.text(
            GAME_WIDTH / 2,
            105,
            "QUEM ESTÁ JOGANDO?",
            {
                fontFamily:
                    "Arial",

                fontSize:
                    "38px",

                fontStyle:
                    "bold",

                color:
                    "#07543D"
            }
        )
        .setOrigin(0.5);

        this.add.text(
            GAME_WIDTH / 2,
            155,
            "Digite seu apelido para começar sua aventura!",
            {
                fontFamily:
                    "Arial",

                fontSize:
                    "20px",

                color:
                    "#18332C"
            }
        )
        .setOrigin(0.5);

        this.add.text(
            GAME_WIDTH / 2,
            205,
            "Use de 2 a 15 caracteres.",
            {
                fontFamily:
                    "Arial",

                fontSize:
                    "16px",

                color:
                    "#5D756E"
            }
        )
        .setOrigin(0.5);
    }

    createNicknameInput() {

        this.inputElement =
            document.createElement(
                "input"
            );

        this.inputElement.id =
            "player-nickname-input";

        this.inputElement.type =
            "text";

        this.inputElement.maxLength =
            15;

        this.inputElement.placeholder =
            "Ex.: Neto";

        this.inputElement.autocomplete =
            "off";

        Object.assign(
            this.inputElement.style,
            {

                position: "absolute",

                width: "430px",

                height: "58px",

                borderRadius: "18px",

                border:
                    "4px solid #4C8A3A",

                outline: "none",

                padding:
                    "0 20px",

                fontFamily:
                    "Arial",

                fontSize:
                    "22px",

                textAlign:
                    "center",

                boxSizing:
                    "border-box",

                background:
                    "#FFFFFF",

                color:
                    "#18332C",

                zIndex: "1000"
            }
        );

        document.body.appendChild(
            this.inputElement
        );

        this.positionInput();

        this.scale.on(
            "resize",
            this.positionInput,
            this
        );

        this.inputElement.focus();

        this.inputElement.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    this.submitNickname();
                }
            }
        );
    }

    positionInput() {

        if (
            !this.inputElement
        ) {

            return;
        }

        const canvas =
            this.game.canvas;

        const rect =
            canvas.getBoundingClientRect();

        const scaleX =
            rect.width /
            GAME_WIDTH;

        const scaleY =
            rect.height /
            GAME_HEIGHT;

        const x =
            rect.left +
            (GAME_WIDTH / 2) *
            scaleX;

        const y =
            rect.top +
            275 *
            scaleY;

        this.inputElement.style.left =
            `${x}px`;

        this.inputElement.style.top =
            `${y}px`;

        this.inputElement.style.transform =
            "translate(-50%, -50%)";
    }

    createContinueButton() {

        const button =
            this.add.rectangle(
                GAME_WIDTH / 2,
                390,
                360,
                65,
                0x4C8A3A
            )
            .setStrokeStyle(
                4,
                0xFFFFFF
            )
            .setInteractive({
                useHandCursor:
                    true
            });

        this.add.text(
            GAME_WIDTH / 2,
            390,
            "▶ CONTINUAR",
            {
                fontFamily:
                    "Arial",

                fontSize:
                    "24px",

                fontStyle:
                    "bold",

                color:
                    "#FFFFFF"
            }
        )
        .setOrigin(0.5);

        button.on(
            "pointerdown",
            () => {

                this.submitNickname();
            }
        );
    }

    createBackButton() {

        const button =
            this.add.rectangle(
                GAME_WIDTH / 2,
                480,
                300,
                55,
                0xFFFFFF
            )
            .setStrokeStyle(
                3,
                0x4C8A3A
            )
            .setInteractive({
                useHandCursor:
                    true
            });

        this.add.text(
            GAME_WIDTH / 2,
            480,
            "🏠 VOLTAR AO MENU",
            {
                fontFamily:
                    "Arial",

                fontSize:
                    "18px",

                fontStyle:
                    "bold",

                color:
                    "#35652A"
            }
        )
        .setOrigin(0.5);

        button.on(
            "pointerdown",
            () => {

                this.scene.start(
                    "MenuScene"
                );
            }
        );
    }

    async submitNickname() {

        const nickname =
            this.inputElement.value.trim();

        const error =
            ProgressManager.validateNickname(
                nickname
            );

        if (error) {

            this.showMessage(
                error,
                "#B44A3A"
            );

            return;
        }

        try {

            /*
             * Primeiro verificamos no servidor.
             * O servidor é quem decide se o apelido
             * realmente já existe.
             */

            const existing =
                await ApiService.getPlayerByNickname(
                    nickname
                );

            if (
                existing
            ) {

                this.showExistingPlayer(
                    existing
                );

                return;
            }

            /*
             * Não existe.
             * Criamos um novo jogador.
             */

            const player =
                await ApiService.createPlayer({

                    nickname,

                    avatar:
                        "ae"
                });

            GameState.setPlayer({

                nickname:
                    player.nickname,

                avatar:
                    player.avatar ||
                    "ae",

                playerId:
                    player.id
            });

            ProgressManager.save();

            this.removeInput();

            this.scene.start(
                "AvatarScene"
            );

        } catch (error) {

            /*
             * Se a API estiver indisponível,
             * ainda permitimos jogar localmente.
             */

            console.warn(
                "API indisponível:",
                error
            );

            const profiles =
                ProgressManager
                    .findProfilesByNickname(
                        nickname
                    );

            if (
                profiles.length
            ) {

                this.showExistingPlayer(
                    profiles[0]
                );

                return;
            }

            ProgressManager
                .createNewProfile(
                    nickname
                );

            this.removeInput();

            this.scene.start(
                "AvatarScene"
            );
        }
    }

    showExistingPlayer(
        player
    ) {

        this.showMessage(
            "⚠️ Esse apelido já está sendo utilizado. Tente outro ou continue sua aventura.",
            "#9A6A21"
        );

        this.createContinueExistingButton(
            player
        );
    }

    createContinueExistingButton(
        player
    ) {

        if (
            this.existingButton
        ) {

            return;
        }

        this.existingButton =
            this.add.rectangle(
                GAME_WIDTH / 2,
                570,
                390,
                60,
                0xD89B3C
            )
            .setStrokeStyle(
                3,
                0xA87520
            )
            .setInteractive({
                useHandCursor:
                    true
            });

        this.existingButtonText =
            this.add.text(
                GAME_WIDTH / 2,
                570,
                "▶ CONTINUAR MINHA AVENTURA",
                {
                    fontFamily:
                        "Arial",

                    fontSize:
                        "17px",

                    fontStyle:
                        "bold",

                    color:
                        "#FFFFFF"
                }
            )
            .setOrigin(0.5);

        this.existingButton.on(
            "pointerdown",
            async () => {

                GameState.hydrate(
                    player
                );

                ProgressManager.save();

                this.removeInput();

                this.scene.start(
                    "AvatarScene"
                );
            }
        );
    }

    showMessage(
        message,
        color
    ) {

        if (
            this.messageText
        ) {

            this.messageText.destroy();
        }

        this.messageText =
            this.add.text(
                GAME_WIDTH / 2,
                350,
                message,
                {
                    fontFamily:
                        "Arial",

                    fontSize:
                        "17px",

                    fontStyle:
                        "bold",

                    color,

                    align:
                        "center",

                    wordWrap: {
                        width:
                            700
                    }
                }
            )
            .setOrigin(0.5);
    }

    removeInput() {

        if (
            this.inputElement
        ) {

            this.inputElement.remove();

            this.inputElement =
                null;
        }

        this.scale.off(
            "resize",
            this.positionInput,
            this
        );
    }

    shutdown() {

        this.removeInput();
    }
}