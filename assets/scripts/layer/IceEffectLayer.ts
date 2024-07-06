import { _decorator } from "cc";
import DataManager from "../manager/DataManager";
import EventManager from "../manager/EventManager";
import BaseLayer from "./Baselayer";
import { ENUM_GAME_EVENT } from "../Enum";

const {ccclass, property} = _decorator;

@ccclass
export default class IceEffectLayer extends BaseLayer {

    onEnable(){
        this.unscheduleAllCallbacks()
        this.scheduleOnce(()=>{
            EventManager.instance.emit(ENUM_GAME_EVENT.ITEM_ICE_END)
        }, DataManager.instance.iceTime)
    }
}
