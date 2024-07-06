import { _decorator, Label } from "cc";
import DataManager from "../manager/DataManager";
import BaseLayer from "./Baselayer";

const {ccclass, property} = _decorator;

@ccclass
export default class ComboLayer extends BaseLayer {

    @property(Label)
    label: Label = null

    setCombo(){
        this.unscheduleAllCallbacks()
        this.label.string = `Combo x ${DataManager.instance.combo}`
        this.show()
        this.scheduleOnce(()=>{
            this.hide()
        }, 1)
    }
}
