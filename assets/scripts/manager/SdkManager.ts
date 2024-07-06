export default class SdkManager {
    public static _instance: SdkManager = null

    public static get instance() {
        if (null == this._instance) {
            this._instance = new SdkManager();
        }
        return this._instance
    }

    shareMsg: string = 'Do you dare to challenge?It is said that no one can climb the 100th floor!'
    // 激励视频
    videoId: string = ''
    private videoAd = null
    // 插屏
    interstitialId: string = ''
    private interstitialAd = null
    // 横幅
    bannerId: string = ''
    private bannerAd = null

    // 主动分享
    activeShare() {
        if (typeof window['wx'] === 'undefined') {
            console.log('[Active sharing] Only support WeChat platform!')
            return
        }
        window['wx'].shareAppMessage({
            title: this.shareMsg
        });
    }

    // 被动分享
    passiveShare() {
        if (typeof window['wx'] === 'undefined') {
            console.log('[Passive Sharing] Only support WeChat platform!')
            return
        }
        window['wx'].showShareMenu({
            success: (res: any) => { },
            fail: (res: any) => { }
        });
        window['wx'].onShareAppMessage(() => {
            return {
                title: this.shareMsg
            }
        });
    }

    // 跳转
    turnToApp(appId: string) {
        if (typeof window['wx'] === 'undefined') {
            console.log('[Program jump] Only support WeChat platform!', appId)
            this.turnToBrowser(appId)
            return
        }
        window['wx'].navigateToMiniProgram({
            appId: appId
        });
    }

    // 浏览器跳转
    turnToBrowser(url: string) {
        window.open(url)
    }


    // 初始化横幅
    initBannerAd() {
        if (typeof window['wx'] === 'undefined') {
            console.log('[Stand -up of the main banner of traffic] Only support WeChat platforms!')
            return
        }
        if (this.bannerId == '') {
            console.log('[Traffic Main] Please configure banner advertising ID')
            return
        }
        let winSize = window['wx'].getSystemInfoSync();
        if (this.bannerAd == null) {
            this.bannerAd = window['wx'].createBannerAd({
                adUnitId: this.bannerId,
                adIntervals: 10,
                style: {
                    height: winSize.windowHeight - 80,
                    left: 0,
                    top: 500,
                    width: winSize.windowWidth
                }
            });
            this.bannerAd.onResize((res: any) => {
                this.bannerAd.style.top = winSize.windowHeight - this.bannerAd.style.realHeight;
                this.bannerAd.style.left = winSize.windowWidth / 2 - this.bannerAd.style.realWidth / 2;
            });
            this.bannerAd.onError((err: any) => {
                console.error('[Flow main banner] Initialization is wrong')
            });
        }
    }

    // 横幅展示
    toggleBannerAd(isShow: boolean) {
        if (typeof window['wx'] === 'undefined') {
            console.log('[Flow main banner] Only support WeChat platform!')
            return
        }
        if (this.bannerAd) {
            isShow ? this.bannerAd.show() : this.bannerAd.hide();
        }
    }

    // 初始化插屏
    initInterstitialAd() {
        if (typeof window['wx'] === 'undefined') {
            console.log('[Initialization of traffic main insertion screen] Only support WeChat platforms!')
            return
        }
        if (this.interstitialId == '') {
            console.log('[Traffic Main] Please configure the screen ads ID')
            return
        }
        if (this.interstitialAd == null) {
            this.interstitialAd = window['wx'].createInterstitialAd({
                adUnitId: this.interstitialId
            });
            this.interstitialAd.onError((err: any) => {
                console.error('[Flow main insertion screen] Initialization is wrong')
            });
        }
    }

    // 插屏展示
    showInterstitialAd() {
        if (typeof window['wx'] === 'undefined') {
            console.log('[Flow main insert screen] Only support WeChat platform!')
            return
        }
        if (this.interstitialAd) {
            this.interstitialAd.show().catch((err: any) => {
                console.error('[Flow main insert screen] Load failed')
            });
        }
    }

    // 初始化激励
    initVideoAd() {
        if (typeof window['wx'] === 'undefined') {
            console.log('[Traffic main incentive initialization] Only support WeChat platforms!')
            return
        }
        if (this.videoId == '') {
            console.log('[Traffic Master] Please configure the incentive video advertising ID')
            return
        }
        if (this.videoAd == null) {
            this.videoAd = window['wx'].createRewardedVideoAd({
                adUnitId: this.videoId
            });
            this.videoAd.onError((err: any) => {
                console.error('[Main incentives for traffic] Initialization is wrong')
            });
        }
    }

    // 激励展示
    showVideoAd(success: any, fail?: any) {
        if (typeof window['wx'] === 'undefined') {
            console.log('Incubic simulation success 1')
            return success && success()
        }
        if (this.videoAd) {
            this.videoAd.offClose();
            this.videoAd.onClose((res: any) => {
                this.videoAd.offClose();
                if (res && res.isEnded || res === undefined) {
                    return success && success()
                } else {
                    return fail && fail()
                }
            });
            this.videoAd.show().catch(() => {
                this.videoAd.load()
                    .then(() => this.videoAd.show())
                    .catch((err: any) => {
                        console.log('Advertising display failed')
                    })
            });
        } else {
            console.log('Incubic simulation success 2')
            return success && success()
        }
    }

    /**
     * 获取排行榜
     */
    getRank() {
        if (typeof window['wx'] === 'undefined') {
            console.log('[Get the ranking] Only support WeChat platform!')
            return
        }
        window['wx'].postMessage({
            event: 'getRank'
        })
    }

    /**
     * 设置排名
     * @param data 关卡数
     */
    setRank(data: number) {
        if (typeof window['wx'] === 'undefined') {
            console.log('[Settings ranking] Only support WeChat platform!', data)
            return
        }
        window['wx'].postMessage({
            event: 'setScore',
            score: data
        })
    }
}

