import { _decorator, Label, Node, tween, Vec3 } from "cc";
import { ENUM_AUDIO_CLIP, ENUM_GAME_EVENT, ENUM_GAME_STATUS, ENUM_UI_TYPE } from "../Enum";
import AudioManager from "../manager/AudioManager";
import DataManager from "../manager/DataManager";
import SdkManager from "../manager/SdkManager";
import { StaticInstance } from "../StaticInstance";
import BaseLayer from "./Baselayer";

const { ccclass, property } = _decorator;

@ccclass
export default class MainLayer extends BaseLayer {
    @property(Label)
    level: Label = null;

    @property(Label)
    score: Label = null;

    @property(Node)
    propsNode: Node = null;

    onEnable() { }

    protected onDisable(): void { }

    onSettingClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.setSettingStyle(1)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.SETTING)
        DataManager.instance.status = ENUM_GAME_STATUS.UNRUNING
    }

    setLevelLabel() {
        this.level.string = "Level " + DataManager.instance.level;
    }

    setScoreLabel(score: number) {
        if (score !== 0) {
            let old: any = this.score.string
            if (score > 0) {
                if (DataManager.instance.combo > 1) score *= DataManager.instance.combo
            }
            score += old * 1
            if (score > DataManager.instance.maxScore) {
                DataManager.instance.maxScore = score
                DataManager.instance.save()
                // 设置排行榜
                SdkManager.instance.setRank(score)
            }
        }
        this.score.string = `${score}`
        tween(this.score.node)
            .to(0.2, { scale: new Vec3(0.8, 0.8, 0.8) })
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .to(0.2, { scale: new Vec3(1.2, 1.2, 1.2) })
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .union()
            .start();

    }

    // 设置技能点数
    setPropNum() {
        this.propsNode.children.forEach((prop, index) => {
            const nums = prop.getChildByName('num')
            if (nums) {
                nums.getChildByName('Label').getComponent(Label).string = `${DataManager.instance.skillNums[index]}`
            }
            else {
                console.log("none num");
            }
        })
    }

    onIceClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK2)
        StaticInstance.uiManager.setRewardStyle(0)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.REWARD)
    }

    onBoomClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK2)
        StaticInstance.uiManager.setRewardStyle(1)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.REWARD)
    }
}
