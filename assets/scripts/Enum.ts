// Created by carolsail 

import { AudioClip, Prefab, SpriteFrame } from "cc";

// 游戏状态
export enum ENUM_GAME_STATUS {
    UNRUNING = 'UNRUNING',
    RUNING = 'RUNING'
}

// 事件
export enum ENUM_GAME_EVENT {
    GAME_START = 'GAME_START',
    BALL_SHOOT = 'BALL_SHOOT',
    ITEM_BOOM = 'ITEM_BOOM',
    ITEM_ICE_START = 'ITEM_ICE_START',
    ITEM_ICE_END = 'ITEM_ICE_END',
    PURCHASE_RESPONSE = 'PURCHASE_RESPONSE'
}

// 音效
export enum ENUM_AUDIO_CLIP {
    BGM = 'bgm',
    CLICK = 'click',
    CLICK2 = 'click2',
    LOSE = 'lose',
    WIN = 'win',
    BEGIN = 'begin',
    TOUCH = 'touch',
    ELIMINATE1 = 'eliminate1',
    ELIMINATE2 = 'eliminate2',
    ELIMINATE3 = 'eliminate3',
    ELIMINATE4 = 'eliminate4',
    ELIMINATE5 = 'eliminate5',
    ELIMINATE6 = 'eliminate6',
    ELIMINATE7 = 'eliminate7',
    ELIMINATE8 = 'eliminate8',
    GOOD = 'good',
    GREAT = 'great',
    EXCELLENT = 'excellent',
    AMAZING = 'amazing',
    UNBELIEVABLE = 'unbelievable',
    WARNING = 'warning',
    BOMB = 'bomb',
    TIMER = 'timer'
}

// ui层
export enum ENUM_UI_TYPE {
    MENU = 'MenuLayer',
    MAIN = 'MainLayer',
    SETTING = 'SettingLayer',
    LOSE = 'LoseLayer',
    WIN = 'WinLayer',
    COMBO = 'ComboLayer',
    ICE = 'IceEffectLayer',
    REWARD = 'RewardLayer',
    RANK = 'RankLayer',
}

// 资源
export const ENUM_RESOURCE_TYPE = ({
    AUDIO: { type: AudioClip, path: 'audio' },
    PREFAB: { type: Prefab, path: 'prefab' },
    SPRITE: { type: SpriteFrame, path: 'sprite' }
})

// 射线检测
export enum ENUM_PHYCOLLIDER_TAG {
    TARGET, // 目标（顶部墙体和泡泡）
    TURN, // 转向
    WARING, // 警告
    DEAD // 死亡
}   