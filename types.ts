
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export type PowerUpType = 'spring' | 'rocket' | 'shield' | 'coin';

export interface Item {
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'normal' | 'moving' | 'breaking' | 'vanishing';
  movingDir?: number;
  isBroken?: boolean;
  opacity?: number;
  item?: Item;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facingLeft: boolean;
  activeRocket?: number; // duration remaining
  activeShield?: number; // duration remaining
}

export interface GameSettings {
  gravity: number;
  jumpForce: number;
  moveSpeed: number;
  friction: number;
  canvasWidth: number;
  canvasHeight: number;
}
