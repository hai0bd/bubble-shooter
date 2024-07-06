import { ENUM_GAME_EVENT } from "../Enum";
import DataManager from "./DataManager";
import EventManager from "./EventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CGManager extends cc.Component {

    private static _instance: CGManager;

    public static get Instance(): CGManager {
        if (!this._instance) {
            this._instance = new CGManager()
        }
        return this._instance
    }
    /**Client ID của game*/
    private clientID = "3ca742915ebae381ce660aee7faa18b41705999217977";
    // Flappy rabbit pvp   87c49ff2d1475161962bec0ffd4064761705053666522
    // Bắt trộm    1625d17448e50a05caa3801b3a32c4c71704771469682
    // Candy Crush 8843dd02cfd4cf9521786dc59a5d279e1704771218654
    // Dogogo  69bd23900b6a70827b583a5049e3c8bb1704771467994
    // Bắn cá  e92aba9772c0a8a8a302aaae0a32ccbe1704771127679
    // Đào vàng    7759b823e40e020dd4c8ebcf2987dc1a1704771471213
    // Nhà hàng thú cưng   835d9a3143e47a8394d5647c2e536596
    // Đánh bài    17baadeba85f7c3b2bf2ff4e333636c21705905363567
    // Survival    7954bd165d22e513a3410e47a918bd981704771138869
    // Bubble pop  3ca742915ebae381ce660aee7faa18b41705999217977

    /**URL api server game */
    private urlApi = "http://103.23.135.57:3500/v1/api";
    /**Token game */
    private portalToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3LCJyb2xlIjoiRU5EX1VTRVIiLCJpYXQiOjE3MDYxNjU2NTIsImV4cCI6OTAwMTcwNjE2NTY1Mn0.btfuUkpAVIyPuCebnofzIVYzUenLxYylj3ngz7Ub_So";
    /**Bearrer Token */
    private bearrerToken = "";

    private isDebug = true;




    //**hàm khởi tạo cùng với game */
    public async init() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.portalToken = urlParams.get('portalToken') ? urlParams.get('portalToken') : this.portalToken;
        const isSuccess = await this.loginGame(this.portalToken);
        if (isSuccess) return true;
        return false;
    }

    public async loginGame(portalToken) {
        let data = {
            clientId: this.clientID,
            portalToken: portalToken
        }

        let response = await this.callAPI("POST", data, "/loginGame", null)
        if (this.isDebug) {
            console.warn("loginGame", response)
        }
        if (response.code == 200) {
            this.bearrerToken = response.data.accessToken;
            return true;
        }
    }

    public async getUserInfo() {
        let data = null;
        let response = await this.callAPI("GET", data, "/user/info", null, true);
        console.warn("getUserInfo", response)

        return response
    }

    /** get data game đã lưu ở server*/
    public async loadData() {
        let response = await this.callAPI("GET", {}, "/user/gameData", null, true)
        if (this.isDebug) {
            console.warn("loadData", response)
        }
        if (response.code == 200) {
            return response.data.data;
        }
    }
    /** lưu data game lên server*/
    public async saveData(dataGame) {
        let data = {
            data: dataGame
        }
        let response = await this.callAPI("PUT", data, "/user/gameData", null, true)
        if (this.isDebug) {
            console.warn("saveData", response)
        }
    }
    //** gửi lên mua package ID, cần cộng tiền hay gì thì xử lý ở hàm call back*/
    public async purchaseItem(itemID, callback = null) {
        let data = {
            productId: itemID
        }
        let response = await this.callAPI("POST", data, "/item/buyRequest", callback, true)
        if (this.isDebug) {
            console.warn("purchaseItem", response)
        }
        if (response.code == 200) {
            let transactionIds = [];
            transactionIds.push(response.data.transactionId)
            this.setUnresolvedCode(transactionIds);
        }

        // DataManager.instance.msgPortal = response.message;
        EventManager.instance.emit(ENUM_GAME_EVENT.PURCHASE_RESPONSE, response);
    }
    //** lấy danh sách transaction chưa được xử lý ở client về để xử lý và update lại lên server, tránh trường hợp bị package loss*/
    public async getUnresolvedCode(packageID, callback: Function = null) {
        let data = {
            clientId: this.clientID,
            portalToken: this.portalToken
        }
        let response = await this.callAPI("POST", data, "/item/listPaid", null, true)
        if (this.isDebug) {
            console.warn("getUnresolvedCode", response)
        }
        if (response.code == 200) {
            let transactionIds = [];
            for (let i = 0; i < response.data.length; i++) {
                if (callback) {
                    callback(response.data[i].productId)
                }
                transactionIds.push(response.data[i].transactionId)
            }
            this.setUnresolvedCode(transactionIds);
        }
    }
    //** xác nhận các mã giao dịch đã cộng item và tiền của các transaction*/
    public async setUnresolvedCode(transactionIds) {
        let data = {
            transactionId: transactionIds
        }
        let response = await this.callAPI("POST", data, "/item/buyConfirm", null, true)
        if (this.isDebug) {
            console.warn("setUnresolvedCode", response)
        }
    }

    async callAPI(method: string, data: object, api: string, callback: Function, bearrerAuth = false) {
        try {
            // 👇️ const response: Response
            let dataRequest = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            if (bearrerAuth) {
                dataRequest.headers["Authorization"] = "Bearer " + this.bearrerToken
            }
            if (method != "GET" && method != "HEAD") {
                dataRequest["body"] = JSON.stringify(data);
            }
            const response = await fetch(this.urlApi + api, dataRequest);

            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }

            // 👇️ const result: CreateUserResponse
            const result = (await response.json());
            // console.log('result is: ', JSON.stringify(result, null, 4));
            if (callback) {
                callback(result);
            }

            return result;
        } catch (error) {
            if (error instanceof Error) {
                debugger
                return -1;
            } else {
                return -1;
            }
        }
    }

}
