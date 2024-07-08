import { _decorator, Canvas, Component, director, Node, PhysicsSystem, PhysicsSystem2D, UITransform, view } from 'cc';
import { StaticInstance } from './StaticInstance';
import { ENUM_RESOURCE_TYPE, ENUM_UI_TYPE } from './Enum';
import AudioManager from "./manager/AudioManager";
import DataManager from './manager/DataManager';
import ResourceManager from "./manager/ResourceManager";
import SdkManager from './manager/SdkManager';

const { ccclass, property } = _decorator;

@ccclass
export default class Index extends Component {

    onLoad() {
        DataManager.instance.loadingRate = 0;
        PhysicsSystem2D.instance.enable = true;

        const view = director.getScene().getChildByName("Canvas");
        view.on(Node.EventType.SIZE_CHANGED, this.onResize, this);
    }

    async start() {
        // 加载资源
        await ResourceManager.instance.loadRes(ENUM_RESOURCE_TYPE.AUDIO, 0.6)
        await ResourceManager.instance.loadRes(ENUM_RESOURCE_TYPE.PREFAB, 0.4)
        // await ResourceManager.instance.loadRes(ENUM_RESOURCE_TYPE.SPRITE)
        // 加载ui
        StaticInstance.uiManager.init()
        // 设置场景尺寸
        DataManager.instance.setStageSize()
        // 读档
        DataManager.instance.restore()
        // 播放音乐
        // AudioManager.instance.playMusic()
        // 加载sdk
        /* SdkManager.instance.passiveShare()
        SdkManager.instance.getRank()
        SdkManager.instance.initBannerAd()
        SdkManager.instance.initInterstitialAd()
        SdkManager.instance.initVideoAd() */
        // 操作ui
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU);
    }

    onResize() {
        // Xử lý khi màn hình thay đổi kích thước
        DataManager.instance.setStageSize()
        console.log(`Màn hình đã thay đổi kích thước: `);
    }
}

export function getPhysicsManager() {
    throw new Error('Function not implemented.');
}

