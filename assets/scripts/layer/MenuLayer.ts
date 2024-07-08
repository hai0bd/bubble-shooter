import { _decorator } from "cc";
import { ENUM_AUDIO_CLIP, ENUM_GAME_EVENT, ENUM_UI_TYPE } from "../Enum";
import { StaticInstance } from './../StaticInstance';
import AudioManager from "../manager/AudioManager";
import BaseLayer from "./Baselayer";
import EventManager from "../manager/EventManager";

const { ccclass, property } = _decorator;

@ccclass
export default class MenuLayer extends BaseLayer {

    onStartClick() {
        /* AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        console.log("play sound ok"); */
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU, false);
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MAIN);
        EventManager.instance.emit(ENUM_GAME_EVENT.GAME_START);
    }

    onSettingClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK);
        StaticInstance.uiManager.setSettingStyle(0);
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.SETTING);
    }

    onRankClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK);
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.RANK);
    }
}
