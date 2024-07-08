import { _decorator, Component, AudioSource, Node } from 'cc';
import { ENUM_AUDIO_CLIP } from './../Enum';
import DataManager from './DataManager';
import ResourceManager from "./ResourceManager";

const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export default class AudioManager extends Component {
    @property(AudioSource)
    private audioSource: AudioSource = null;

    private static _instance: AudioManager = null;

    static getInstance(): AudioManager {
        if (this._instance === null) {
            this._instance = new AudioManager();
            this._instance.init();
        }

        return this._instance;
    }

    static get instance(): AudioManager {
        return this.getInstance();
    }

    init() {
        /* if (!this.audioSource) {
            this.audioSource = this.getComponent(AudioSource);
        }
        this.audioSource.loop = true;
        this.audioSource.volume = 0.3; */
    }

    async playMusic() {
        /* if (!DataManager.instance.isMusicOn) return;
        if (this.audioSource.clip) {
            this.audioSource.play();
            return;
        }
        const clip = await ResourceManager.instance.getClip(ENUM_AUDIO_CLIP.BGM);
        this.audioSource.clip = clip;
        this.audioSource.play(); */
    }

    stopMusic() {
        // this.audioSource.stop();
    }

    async playSound(name: ENUM_AUDIO_CLIP | string, isLoop: boolean = false) {
       /*  if (!DataManager.instance.isSoundOn) return;
        const clip = await ResourceManager.instance.getClip(name);

        // Tạo một node mới hoặc sử dụng lại node hiện có cho hiệu ứng âm thanh
        const soundNode = new Node();
        const soundAudioSource = soundNode.addComponent(AudioSource);
        soundAudioSource.clip = clip;
        soundAudioSource.loop = isLoop;
        soundAudioSource.play();

        return soundAudioSource; */
    }

    stopSound(soundAudioSource: AudioSource) {
        /* if (soundAudioSource) {
            soundAudioSource.stop();
            // Bạn có thể hủy node nếu cần thiết
            soundAudioSource.node.destroy();
        } */
    }
}
