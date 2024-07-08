// Created by carolsail
import { resources } from 'cc';
import { ENUM_RESOURCE_TYPE } from '../Enum';
import DataManager from './DataManager';
import PoolManager from './PoolManager';

export default class ResourceManager {

    public clipMap = {}

    public spriteMap = {}

    private static _instance: any = null

    static getInstance<T>(): T {
        if (this._instance === null) {
            this._instance = new this()
        }

        return this._instance
    }

    static get instance() {
        return this.getInstance<ResourceManager>()
    }

    public async loadRes(resource: any, ratio: number = 0) {
        return new Promise<void>((resolve, reject) => {
            const rate = DataManager.instance.loadingRate
            resources.loadDir(resource.path, resource.type, (finished: number, total: number) => {
                // 资源加载进度
                if (ratio > 0) DataManager.instance.loadingRate = Math.max(rate + ratio * finished / total, DataManager.instance.loadingRate)
            }, (err, assets) => {
                if (err) reject && reject()
                let asset: any
                if (resource == ENUM_RESOURCE_TYPE.AUDIO) {
                    for (let i = 0; i < assets.length; i++) {
                        asset = assets[i];
                        if (!this.clipMap[asset.name]) this.clipMap[asset.name] = asset
                    }
                }
                if (resource == ENUM_RESOURCE_TYPE.PREFAB) {
                    for (let i = 0; i < assets.length; i++) {
                        asset = assets[i];
                        PoolManager.instance.setPrefab(asset.data.name, asset)
                    }
                }
                if (resource == ENUM_RESOURCE_TYPE.SPRITE) {
                    for (let i = 0; i < assets.length; i++) {
                        asset = assets[i];
                        if (!this.spriteMap[asset.name]) this.spriteMap[asset.name] = asset
                    }
                }
                resolve && resolve()
            })
        })
    }

    public getClip(name: string) {
        return this.clipMap[name]
    }

    public getSprite(name: string) {
        return this.spriteMap[name]
    }
}
