
import { GameSettings } from './types';

export const SETTINGS: GameSettings = {
  gravity: 0.35,
  jumpForce: -11,
  moveSpeed: 0.8, // 略微增加加速度，让起步更灵敏
  friction: 0.8,  // 略微增加阻力 (减小该值)，防止漂移感太强
  canvasWidth: 400,
  canvasHeight: 650
};

export const MAX_MOVE_SPEED = 7.5; // 水平移动的最大速度限制

export const PLATFORM_WIDTH = 60;
export const PLATFORM_HEIGHT = 15;
export const PLAYER_SIZE = 45;
export const MAX_PLATFORMS = 15;

export const ITEM_SIZE = 24;
export const SPRING_JUMP_FORCE = -20;
export const ROCKET_SPEED = -25;
export const ROCKET_DURATION = 120; // frames
export const SHIELD_DURATION = 300; // frames
export const COIN_BONUS = 500;
