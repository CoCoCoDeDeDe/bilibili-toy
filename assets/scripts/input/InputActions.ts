import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

export enum Action {
    MOVE_FORWARD = 'MOVE_FORWARD',
    MOVE_BACKWARD = 'MOVE_BACKWARD',
    MOVE_LEFT = 'MOVE_LEFT',
    MOVE_RIGHT = 'MOVE_RIGHT',
    JUMP = 'JUMP',
    SPRINT = 'SPRINT',
    SNEAK = 'SNEAK',
    SWITCH_PERSPECTIVE = 'SWITCH_PERSPECTIVE',
    TOGGLE_SETTINGS = 'TOGGLE_SETTINGS',
    TOGGLE_MENU = 'TOGGLE_MENU',
}

export const ActionNames: Record<Action, string> = {
    [Action.MOVE_FORWARD]: '向前移动',
    [Action.MOVE_BACKWARD]: '向后移动',
    [Action.MOVE_LEFT]: '向左移动',
    [Action.MOVE_RIGHT]: '向右移动',
    [Action.JUMP]: '跳跃',
    [Action.SPRINT]: '冲刺',
    [Action.SNEAK]: '潜行',
    [Action.SWITCH_PERSPECTIVE]: '切换视角',
    [Action.TOGGLE_SETTINGS]: '打开设置',
    [Action.TOGGLE_MENU]: '主菜单',
};
