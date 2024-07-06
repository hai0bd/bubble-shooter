import { _decorator } from "cc";
import { ENUM_AUDIO_CLIP, ENUM_GAME_EVENT, ENUM_UI_TYPE } from "../Enum";
import { StaticInstance } from './../StaticInstance';
import AudioManager from "../manager/AudioManager";
import BaseLayer from "./Baselayer";
import EventManager from "../manager/EventManager";
import SdkManager from "../manager/SdkManager";

const {ccclass, property} = _decorator;

@ccclass
export default class WinLayer extends BaseLayer {

    protected onEnable(): void {
        const panel = this.node.getChildByName('style').getChildByName('panel')
        if(panel) this.fadeIn(panel)
    }

    onNextClick(){
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.WIN, false)
        EventManager.instance.emit(ENUM_GAME_EVENT.GAME_START)
    }

    onShareClick(){
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        SdkManager.instance.activeShare()
    }
}
