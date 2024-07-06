import { _decorator, Component, Node } from 'cc';
import { ENUM_UI_TYPE } from './../Enum';
import { StaticInstance } from './../StaticInstance';
import BaseLayer from '../layer/Baselayer';
import PoolManager from './PoolManager';
import SettingLayer from '../layer/SettingLayer';
import MainLayer from '../layer/MainLayer';
import ComboLayer from '../layer/ComboLayer';
import RewardLayer from '../layer/RewardLayer';

const { ccclass, property } = _decorator;

@ccclass
export default class UIManager extends Component {

    private uiMap = new Map<ENUM_UI_TYPE, BaseLayer>()

    protected onLoad(): void {
        StaticInstance.setUIManager(this);
    }

    init() {
        for (let type in ENUM_UI_TYPE) {
            const node: Node = PoolManager.instance.getNode(ENUM_UI_TYPE[type], this.node)
            if (node && !this.uiMap.has(ENUM_UI_TYPE[type])) {
                (node.getComponent(ENUM_UI_TYPE[type]) as BaseLayer).hide()
                this.uiMap.set(ENUM_UI_TYPE[type], node.getComponent(ENUM_UI_TYPE[type]))
            }
        }
    }

    toggle(key: ENUM_UI_TYPE, status: boolean = true, callback?: () => void) {
        if (this.uiMap.has(key)) {
            const layer = this.uiMap.get(key)
            status ? layer.show() : layer.hide()
            callback && callback()
        }
    }

    isActive(key: ENUM_UI_TYPE) {
        if (this.uiMap.has(key)) {
            return this.uiMap.get(key).node.active
        }
        return false
    }

    setSettingStyle(index: number = 0) {
        const layer: SettingLayer = this.uiMap.get(ENUM_UI_TYPE.SETTING) as SettingLayer
        layer?.setStyle(index)
    }

    setMainLevelLabel() {
        const layer: MainLayer = this.uiMap.get(ENUM_UI_TYPE.MAIN) as MainLayer
        layer?.setLevelLabel()
    }

    setMainScoreLabel(score: number = 0) {
        console.log("score Ui manager: ", score);

        const layer: MainLayer = this.uiMap.get(ENUM_UI_TYPE.MAIN) as MainLayer
        layer?.setScoreLabel(score)
    }

    setComboLabel() {
        const layer: ComboLayer = this.uiMap.get(ENUM_UI_TYPE.COMBO) as ComboLayer
        layer?.setCombo()
    }

    setMainPropNum() {
        const layer: MainLayer = this.uiMap.get(ENUM_UI_TYPE.MAIN) as MainLayer
        layer.setPropNum()
    }

    setRewardStyle(index: number = 0) {
        const layer: RewardLayer = this.uiMap.get(ENUM_UI_TYPE.REWARD) as RewardLayer
        layer?.setStyle(index)
    }
}
