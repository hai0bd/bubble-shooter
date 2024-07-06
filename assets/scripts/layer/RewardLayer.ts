import { _decorator, color, Node, WebView } from "cc";
import { ENUM_AUDIO_CLIP, ENUM_GAME_EVENT } from "../Enum";
import AudioManager from "../manager/AudioManager";
import CGManager from "../manager/CGManager";
import DataManager from "../manager/DataManager";
import EventManager from "../manager/EventManager";
import SdkManager from "../manager/SdkManager";
import ToastManager from "../manager/ToastManager";
import { StaticInstance } from "../StaticInstance";
import BaseLayer from "./Baselayer";

const { ccclass, property } = _decorator;

@ccclass
export default class RewardLayer extends BaseLayer {

    @property(Node)
    styleNode: Node = null

    @property(Node)
    closeWV: Node = null

    @property(WebView)
    webViewNode: WebView = null

    point: number = 0;
    productId: string;

    protected onLoad(): void {
        EventManager.instance.on(ENUM_GAME_EVENT.PURCHASE_RESPONSE, this.onPurchaseResponse, this);
        this.closeWebView();
    }

    onPurchaseResponse(data) {
        console.log('onPurchaseResponse', data);
        ToastManager.instance.show(data.message, { gravity: 'BOTTOM', bg_color: color(226, 69, 109, 255) })
        if (data.code == 200) {
            if (this.productId == "packageice100pointgameid100") {
                DataManager.instance.skillNums[0] += 1;
            } else {
                DataManager.instance.skillNums[1] += 1;
            }
            DataManager.instance.save();
            StaticInstance.uiManager.setMainPropNum();
        }
        console.log("data=-=-==-==-", data.data.transactionInfo);
        let url = data.data.transactionInfo.topupUrl;
        let userId = data.data.transactionInfo.userId;
        if (data.code == 10011 && data.message == 'Not enough point') {
            this.webViewNode.url = `${url}?portalUserId=${userId}`;
            this.webViewNode.node.active = true;
            this.closeWV.active = true;
        }
    }
    onCloseClick(e: any) {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        this.hide()
    }

    setStyle(i: number) {
        this.styleNode.children.forEach((style, index) => {
            style.active = i === index
        })
        const style: Node = this.styleNode.children[i]
        this.fadeIn(style)
    }

    onIceSkillClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        if (DataManager.instance.skillNums[0] <= 0) {
            ToastManager.instance.show('Insufficient skills, Please get first', { gravity: 'BOTTOM', bg_color: color(226, 69, 109, 255) })
            return
        }
        this.hide()
        EventManager.instance.emit(ENUM_GAME_EVENT.ITEM_ICE_START)
    }

    // [{
    //     "name": "ICE",
    //     "productId": "packageice100pointgameid100"
    // },
    // {
    //     "name": "BOMB",
    //     "productId": "packagebomb100pointgameid100"
    // },
    // {
    //     "name": "REVIVE",
    //     "productId": "packagerevive150pointgameid100"
    // }]

    onIcelRewardClick() {
        this.productId = "packageice100pointgameid100"
        CGManager.Instance.purchaseItem(this.productId, () => {

            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
            SdkManager.instance.showVideoAd(() => {
                // ToastManager.instance.show('Skills point for distributed', { gravity: 'BOTTOM', bg_color: color(102, 202, 28, 255) })
            }, () => {
                // ToastManager.instance.show('Video playback interruption', { gravity: 'BOTTOM', bg_color: color(226, 69, 109, 255) })
            })
            return
        })

    }

    onBoomSkillClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        if (DataManager.instance.skillNums[1] <= 0) {
            ToastManager.instance.show('Insufficient skills, Please get first', { gravity: 'BOTTOM', bg_color: color(226, 69, 109, 255) })
            return
        }
        this.hide()
        EventManager.instance.emit(ENUM_GAME_EVENT.ITEM_BOOM)
    }

    onBoomRewardClick() {
        this.productId = "packagebomb100pointgameid100"
        CGManager.Instance.purchaseItem(this.productId, () => {

            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
            SdkManager.instance.showVideoAd(() => {
                // ToastManager.instance.show('Skills point for distributed', { gravity: 'BOTTOM', bg_color: color(102, 202, 28, 255) })
            }, () => {
                // ToastManager.instance.show('Video playback interruption', { gravity: 'BOTTOM', bg_color: color(226, 69, 109, 255) })
            })
            return
        })

    }

    closeWebView() {
        this.webViewNode.node.active = false;
        this.closeWV.active = false;
    }
}
