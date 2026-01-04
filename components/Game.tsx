
import React, { useRef, useEffect } from 'react';
import { 
  SETTINGS, 
  PLATFORM_WIDTH, 
  PLATFORM_HEIGHT, 
  PLAYER_SIZE, 
  MAX_PLATFORMS, 
  ITEM_SIZE, 
  SPRING_JUMP_FORCE, 
  ROCKET_SPEED, 
  ROCKET_DURATION, 
  SHIELD_DURATION,
  COIN_BONUS,
  MAX_MOVE_SPEED
} from '../constants';
import { Player, Platform, Item, PowerUpType } from '../types';
import { sounds } from '../utils/sound';
import { ASSETS } from '../utils/assets';

interface GameProps {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
  isPaused: boolean;
}

const Game: React.FC<GameProps> = ({ onGameOver, isPlaying, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  
  const playerRef = useRef<Player>({
    x: SETTINGS.canvasWidth / 2 - PLAYER_SIZE / 2,
    y: SETTINGS.canvasHeight - 150,
    vx: 0,
    vy: 0,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    facingLeft: false,
  });
  
  const platformsRef = useRef<Platform[]>([]);
  const scoreRef = useRef<number>(0);
  const cameraYRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const pointerXRef = useRef<number | null>(null);

  useEffect(() => {
    Object.entries(ASSETS).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      imagesRef.current[key] = img;
    });
  }, []);

  const init = () => {
    playerRef.current = {
      x: SETTINGS.canvasWidth / 2 - PLAYER_SIZE / 2,
      y: SETTINGS.canvasHeight - 150,
      vx: 0,
      vy: 0,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      facingLeft: false,
      activeRocket: 0,
      activeShield: 0,
    };
    
    scoreRef.current = 0;
    cameraYRef.current = 0;
    platformsRef.current = [];

    platformsRef.current.push({
      x: SETTINGS.canvasWidth / 2 - PLATFORM_WIDTH / 2,
      y: SETTINGS.canvasHeight - 50,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      type: 'normal'
    });

    for (let i = 1; i < MAX_PLATFORMS; i++) {
      spawnPlatform(SETTINGS.canvasHeight - i * (SETTINGS.canvasHeight / MAX_PLATFORMS));
    }
  };

  const spawnPlatform = (y: number) => {
    const typeRoll = Math.random();
    let type: Platform['type'] = 'normal';
    const diffFactor = Math.min(scoreRef.current / 15000, 0.7);
    
    if (typeRoll < diffFactor * 0.35) type = 'breaking';
    else if (typeRoll < diffFactor * 0.75) type = 'moving';

    const x = Math.random() * (SETTINGS.canvasWidth - PLATFORM_WIDTH);
    let item: Item | undefined = undefined;

    if (type !== 'breaking' && Math.random() < 0.18) {
      const itemRoll = Math.random();
      let itemType: PowerUpType = 'coin';
      if (itemRoll < 0.1) itemType = 'rocket';
      else if (itemRoll < 0.3) itemType = 'spring';
      else if (itemRoll < 0.5) itemType = 'shield';

      item = {
        type: itemType,
        x: x + (PLATFORM_WIDTH - ITEM_SIZE) / 2,
        y: y - ITEM_SIZE,
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        collected: false
      };
    }

    platformsRef.current.push({
      x, y, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT, type,
      movingDir: Math.random() < 0.5 ? -1 : 1,
      isBroken: false, item
    });
  };

  const update = () => {
    if (!isPlaying || isPaused) return;
    const player = playerRef.current;
    
    const leftPressed = keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A'];
    const rightPressed = keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D'];

    if (leftPressed) {
      player.vx -= SETTINGS.moveSpeed; player.facingLeft = true;
    } else if (rightPressed) {
      player.vx += SETTINGS.moveSpeed; player.facingLeft = false;
    } else if (pointerXRef.current !== null) {
      if (pointerXRef.current < SETTINGS.canvasWidth / 2) {
        player.vx -= SETTINGS.moveSpeed; player.facingLeft = true;
      } else {
        player.vx += SETTINGS.moveSpeed; player.facingLeft = false;
      }
    } else {
      player.vx *= SETTINGS.friction;
      if (Math.abs(player.vx) < 0.1) player.vx = 0;
    }

    if (player.vx > MAX_MOVE_SPEED) player.vx = MAX_MOVE_SPEED;
    if (player.vx < -MAX_MOVE_SPEED) player.vx = -MAX_MOVE_SPEED;

    if (player.activeRocket && player.activeRocket > 0) {
      player.vy = ROCKET_SPEED;
      player.activeRocket--;
    } else {
      player.vy += SETTINGS.gravity;
    }
    if (player.activeShield && player.activeShield > 0) player.activeShield--;

    player.x += player.vx;
    player.y += player.vy;

    if (player.x + player.width < 0) player.x = SETTINGS.canvasWidth;
    if (player.x > SETTINGS.canvasWidth) player.x = -player.width;

    platformsRef.current.forEach((p) => {
      if (p.type === 'moving' && p.movingDir) {
        p.x += p.movingDir * 1.5;
        if (p.x <= 0 || p.x + p.width >= SETTINGS.canvasWidth) p.movingDir *= -1;
        if (p.item) p.item.x = p.x + (PLATFORM_WIDTH - ITEM_SIZE) / 2;
      }

      if (p.item && !p.item.collected) {
        if (player.x < p.item.x + p.item.width && player.x + player.width > p.item.x &&
            player.y < p.item.y + p.item.height && player.y + player.height > p.item.y) {
          p.item.collected = true;
          switch (p.item.type) {
            case 'spring': player.vy = SPRING_JUMP_FORCE; sounds.playSpring(); break;
            case 'rocket': player.activeRocket = ROCKET_DURATION; sounds.playPowerup(); break;
            case 'shield': player.activeShield = SHIELD_DURATION; sounds.playPowerup(); break;
            case 'coin': scoreRef.current += COIN_BONUS; sounds.playCollect(); break;
          }
        }
      }

      if (player.vy > 0 && !p.isBroken && !player.activeRocket) {
        if (player.x < p.x + p.width && player.x + player.width > p.x &&
            player.y + player.height > p.y && player.y + player.height < p.y + p.height + player.vy + 5) {
          player.vy = SETTINGS.jumpForce;
          sounds.playJump();
          if (p.type === 'breaking') p.isBroken = true;
        }
      }
    });

    const viewCenter = SETTINGS.canvasHeight / 2;
    if (player.y < viewCenter + cameraYRef.current) {
      const diff = (viewCenter + cameraYRef.current) - player.y;
      cameraYRef.current -= diff;
      scoreRef.current += Math.floor(diff);
    }

    platformsRef.current = platformsRef.current.filter(p => p.y < cameraYRef.current + SETTINGS.canvasHeight + 100);
    while (platformsRef.current.length < MAX_PLATFORMS) {
      const highestY = Math.min(...platformsRef.current.map(p => p.y));
      spawnPlatform(highestY - (SETTINGS.canvasHeight / MAX_PLATFORMS));
    }

    if (player.y > cameraYRef.current + SETTINGS.canvasHeight) {
      if (player.activeShield && player.activeShield > 0) {
        player.vy = SPRING_JUMP_FORCE; player.activeShield = 0; sounds.playSpring();
      } else {
        sounds.playGameOver(); onGameOver(scoreRef.current);
      }
    }
  };

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    // Fill base color
    ctx.fillStyle = '#faf8ef';
    ctx.fillRect(0, 0, SETTINGS.canvasWidth, SETTINGS.canvasHeight);

    // Draw grid
    ctx.strokeStyle = '#e0eaf0';
    ctx.lineWidth = 1;

    const gridSize = 30;
    
    // Vertical lines (fixed)
    for (let x = 0; x <= SETTINGS.canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, SETTINGS.canvasHeight);
      ctx.stroke();
    }

    // Horizontal lines (scrolling)
    // We calculate the offset based on cameraYRef
    const offset = (-cameraYRef.current) % gridSize;
    for (let y = offset; y <= SETTINGS.canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(SETTINGS.canvasWidth, y);
      ctx.stroke();
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Draw the specialized background instead of just clearRect
    drawBackground(ctx);

    ctx.save();
    ctx.translate(0, -cameraYRef.current);

    // Draw Platforms
    platformsRef.current.forEach(p => {
      if (!p.isBroken) {
        let img = imagesRef.current.platformNormal;
        if (p.type === 'moving') img = imagesRef.current.platformMoving;
        if (p.type === 'breaking') img = imagesRef.current.platformBreaking;
        if (img) ctx.drawImage(img, p.x, p.y, p.width, p.height);
      }
      if (p.item && !p.item.collected) {
        const itemImg = imagesRef.current[p.item.type];
        if (itemImg) {
          const bounce = Math.sin(Date.now() / 200) * 3;
          ctx.drawImage(itemImg, p.item.x, p.item.y + bounce, p.item.width, p.item.height);
        }
      }
    });

    // Draw Player
    const p = playerRef.current;
    ctx.save();
    ctx.translate(p.x + p.width/2, p.y + p.height/2);
    
    if (p.activeShield && p.activeShield > 0) {
      const sImg = imagesRef.current.shield;
      if (sImg) ctx.drawImage(sImg, -p.width*0.8, -p.height*0.8, p.width*1.6, p.height*1.6);
    }

    if (p.facingLeft) ctx.scale(-1, 1);
    
    if (p.activeRocket && p.activeRocket > 0) {
      const rImg = imagesRef.current.rocket;
      if (rImg) ctx.drawImage(rImg, -10, 15, 20, 20);
      ctx.fillStyle = Math.random() > 0.5 ? '#ff9800' : '#f44336';
      ctx.beginPath();
      ctx.moveTo(-5, 35); ctx.lineTo(0, 45 + Math.random()*15); ctx.lineTo(5, 35); ctx.fill();
    }

    const pImg = imagesRef.current.player;
    if (pImg) ctx.drawImage(pImg, -p.width/2, -p.height/2, p.width, p.height);

    ctx.restore();
    ctx.restore();

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(scoreRef.current.toString(), 20, 40);

    if (p.activeRocket && p.activeRocket > 0) {
      ctx.fillStyle = '#f44336';
      ctx.fillRect(20, 55, (p.activeRocket / ROCKET_DURATION) * 80, 6);
    }
    if (p.activeShield && p.activeShield > 0) {
      ctx.fillStyle = '#03a9f4';
      ctx.fillRect(20, 65, (p.activeShield / SHIELD_DURATION) * 80, 6);
    }
  };

  const gameLoop = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    update();
    draw(ctx);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (isPlaying) {
      init();
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    
    const handleKD = (e: KeyboardEvent) => {
      if (!isPaused) keysRef.current[e.key] = true;
    };
    const handleKU = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isPaused || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = SETTINGS.canvasWidth / rect.width;
      pointerXRef.current = (e.clientX - rect.left) * scaleX;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (pointerXRef.current !== null && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = SETTINGS.canvasWidth / rect.width;
        pointerXRef.current = (e.clientX - rect.left) * scaleX;
      }
    };

    const handlePointerUp = () => {
      pointerXRef.current = null;
    };

    window.addEventListener('keydown', handleKD);
    window.addEventListener('keyup', handleKU);
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      canvas.style.touchAction = 'none';
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('keydown', handleKD);
      window.removeEventListener('keyup', handleKU);
      if (canvas) {
        canvas.removeEventListener('pointerdown', handlePointerDown);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isPlaying, isPaused]);

  return <canvas ref={canvasRef} width={SETTINGS.canvasWidth} height={SETTINGS.canvasHeight} className="w-full h-full block cursor-pointer" />;
};

export default Game;
