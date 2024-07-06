// Created by carolsail

import GameManager from "./manager/GameManager";
import UIManager from "./manager/UIManager";

export class StaticInstance {
    static uiManager: UIManager | undefined = undefined;
    static gameManager: GameManager | undefined = undefined;


    static setUIManager(context: UIManager) {
        StaticInstance.uiManager = context;
    }

    static setGameManager(context: GameManager) {
        StaticInstance.gameManager = context;
    }
}