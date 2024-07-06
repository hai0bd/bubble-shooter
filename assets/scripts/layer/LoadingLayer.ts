import { _decorator, Sprite } from "cc";
import { ENUM_UI_TYPE } from "../Enum";
import DataManager from "../manager/DataManager";
import BaseLayer from "./Baselayer";
import { StaticInstance } from "../StaticInstance";
import CGManager from "../manager/CGManager";

const { ccclass, property } = _decorator;

@ccclass
export default class LoadingLayer extends BaseLayer {

    @property(Sprite)
    loadfill: Sprite = null

    protected async start() {
        const res = await CGManager.Instance.init();
        if (res) {
            await CGManager.Instance.loadData();
            await CGManager.Instance.getUserInfo();
        }

        const data = {
            level: DataManager.instance.level,
            maxLevel: DataManager.instance.maxLevel,
            isSoundOn: DataManager.instance.isSoundOn,
            isMusicOn: DataManager.instance.isMusicOn,
            maxScore: DataManager.instance.maxScore,
            skillNums: DataManager.instance.skillNums,
            lastTime: Date.now()
        }
        await CGManager.Instance.saveData(JSON.stringify({ data }));
    }

    update(dt: number) {
        if (this.loadfill && this.node.active) {
            this.loadfill.fillRange = DataManager.instance.loadingRate
            if (DataManager.instance.loadingRate >= 1) {
                // menu已加载完毕
                if (StaticInstance.uiManager.isActive(ENUM_UI_TYPE.MENU)) {
                    this.hide()
                }
            }
        }
    }
}
