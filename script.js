(() => {
  const translations = {
    'zh-Hant': {
      brand: '坦克日誌',
      language: '繁體中文',
      eyebrow: '東京 · 開發者的休息時間',
      title: '日本程序員的一天',
      subtitle: '寫完程式，開一台坦克去兜風吧。',
      status: '戰場進行中',
      score: '擊破',
      hint: '移動滑鼠控制坦克 · 左鍵開火（也可用 WASD / 空白鍵）',
      mission: '任務：收集 20 張小抄',
      cheatSheets: '小抄',
      actionCopy: '忙了一整天，來點補給吧？',
      hungryButton: '呼叫拉麵補給',
      fire: '開火',
      restart: '重新開始',
      victory: '勝利！集齊 20 張小抄了！',
      victoryPraise: '你真厲害！',
      graduationTitle: '畢業典禮',
      graduationCaption: '老師頒獎，同學們熱烈鼓掌！',
      gameOver: '遊戲結束，三次機會已用完。',
      gameOverKicker: '這回合結束了',
      gameOverTitle: '別擔心，還有選擇！',
      gameOverText: '再試一次，或把煩惱變成像素。',
      retry: '再試驗（+1 生命）',
      pixelEnding: '把煩惱變成像素',
      endingTitle: '煩惱已經像素化！',
      endingText: '休息一下，再帶著滿滿的小抄回來吧。',
      footer: '小心敵方坦克，祝你在東京戰場玩得開心。'
    },
    ja: {
      brand: 'タンク日誌',
      language: '日本語',
      eyebrow: '東京 · 開発者の休憩時間',
      title: '日本程序員的一天',
      subtitle: 'コードを書いたら、戦車でひと走り。',
      status: '戦闘中',
      score: '撃破',
      hint: 'マウスで移動 · 左クリックで発射（WASD / Spaceも可）',
      mission: 'ミッション：カンニングペーパーを20枚集める',
      cheatSheets: 'カンニングペーパー',
      actionCopy: '一日お疲れさま。補給しよう！',
      hungryButton: 'ラーメン補給を呼ぶ',
      fire: '発射',
      restart: 'もう一度プレイ',
      victory: '勝利！カンニングペーパーを20枚集めた！',
      victoryPraise: 'すごいね！',
      graduationTitle: '卒業式',
      graduationCaption: '先生から賞を受け取り、みんなが拍手！',
      gameOver: 'ゲームオーバー。3回のチャンスを使い切りました。',
      gameOverKicker: 'このラウンドは終了',
      gameOverTitle: '大丈夫、まだ選べるよ！',
      gameOverText: 'もう一度挑戦するか、悩みをドットに変えよう。',
      retry: 'もう一度（ライフ＋1）',
      pixelEnding: '悩みをドットに変える',
      endingTitle: '悩みをドットに変えた！',
      endingText: '少し休んで、小テスト対策を持って戻ろう。',
      footer: '敵の戦車に気をつけて、東京の戦場を楽しもう。'
    },
    en: {
      brand: 'Tank Journal',
      language: 'English',
      eyebrow: 'TOKYO · DEVELOPER BREAK TIME',
      title: '日本程序員的一天',
      subtitle: 'Clock out of coding and take a tank for a spin.',
      status: 'Battle in progress',
      score: 'DEFEATED',
      hint: 'Move mouse to steer · Left-click to fire (WASD / Space also work)',
      mission: 'MISSION: Collect 20 cheat sheets',
      cheatSheets: 'SHEETS',
      actionCopy: 'Long day? Time for a supply drop.',
      hungryButton: 'Call in ramen supplies',
      fire: 'FIRE',
      restart: 'Play again',
      victory: 'Victory! You collected all 20 cheat sheets!',
      victoryPraise: 'You did amazing!',
      graduationTitle: 'GRADUATION DAY',
      graduationCaption: 'Your teacher presents the award as everyone applauds!',
      gameOver: 'Game over. You used all three chances.',
      gameOverKicker: 'ROUND COMPLETE',
      gameOverTitle: 'No worries, you have options!',
      gameOverText: 'Try again, or turn those worries into pixels.',
      retry: 'Try again (+1 life)',
      pixelEnding: 'Turn worries into pixels',
      endingTitle: 'Worries pixelated!',
      endingText: 'Take a break, then come back for more cheat sheets.',
      footer: 'Watch out for enemy tanks. Have fun in the Tokyo arena.'
    }
  };

  const canvas = document.querySelector('#arena');
  const context = canvas.getContext('2d');
  const message = document.querySelector('#message');
  const scoreElement = document.querySelector('#score');
  const cheatsElement = document.querySelector('#cheats');
  const healthElement = document.querySelector('#health');
  const restartButton = document.querySelector('#restart-button');
  const endingRestartButton = document.querySelector('#ending-restart-button');
  const gameOverPanel = document.querySelector('#game-over');
  const keys = new Set();
  const pressedDirections = new Set();
  const worries = ['作業', '考試', '畢業設計', '報告', '出席率', '補考', '學分不足', '期末專題', '小組報告', '論文口試'];
  const languages = ['zh-Hant', 'ja', 'en'];
  let languageIndex = 0;
  let score = 0;
  let cheatSheets = 0;
  let health = 3;
  let lastTime = 0;
  let spawnTimer = 0;
  let bullets = [];
  let enemies = [];
  let pickups = [];
  let particles = [];
  let mouseTarget = null;
  let mouseFiring = false;
  let gameState = 'playing';
  let endingStartedAt = 0;
  let player = { x: 0, y: 0, angle: -Math.PI / 2, speed: 150, cooldown: 0, invulnerable: 0 };

  function setLanguage(language) {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = translations[language][element.dataset.i18n];
    });
  }

  document.querySelector('#language-button').addEventListener('click', () => {
    languageIndex = (languageIndex + 1) % languages.length;
    setLanguage(languages[languageIndex]);
  });

  document.querySelector('#hungry-button').addEventListener('click', () => {
    message.textContent = '肚子餓了！';
  });

  restartButton.addEventListener('click', restartGame);
  endingRestartButton.addEventListener('click', restartGame);
  document.querySelector('#retry-button').addEventListener('click', () => {
    health = 1;
    healthElement.textContent = health;
    gameState = 'playing';
    bullets = bullets.filter((bullet) => !bullet.enemy);
    enemies = [];
    player.invulnerable = 2;
    mouseFiring = false;
    gameOverPanel.hidden = true;
    message.textContent = '';
  });
  document.querySelector('#pixel-ending-button').addEventListener('click', () => {
    gameState = 'school-ending';
    endingStartedAt = performance.now();
    gameOverPanel.hidden = true;
    restartButton.hidden = true;
    endingRestartButton.hidden = true;
    mouseFiring = false;
  });

  function restartGame() {
    score = 0;
    cheatSheets = 0;
    health = 3;
    bullets = [];
    enemies = [];
    pickups = [];
    particles = [];
    spawnTimer = 0;
    gameState = 'playing';
    scoreElement.textContent = score;
    cheatsElement.textContent = `${cheatSheets}/20`;
    healthElement.textContent = health;
    restartButton.hidden = true;
    endingRestartButton.hidden = true;
    gameOverPanel.hidden = true;
    message.textContent = '';
  }

  function resizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bounds.width * ratio);
    canvas.height = Math.round(bounds.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    player.x = Math.min(Math.max(player.x || bounds.width / 2, 20), bounds.width - 20);
    player.y = Math.min(Math.max(player.y || bounds.height / 2, 20), bounds.height - 20);
  }

  function fire() {
    if (player.cooldown > 0) return;
    bullets.push({
      x: player.x + Math.cos(player.angle) * 22,
      y: player.y + Math.sin(player.angle) * 22,
      vx: Math.cos(player.angle) * 350,
      vy: Math.sin(player.angle) * 350,
      life: 1.3
    });
    player.cooldown = .28;
  }

  function spawnEnemy(width, height) {
    const side = Math.floor(Math.random() * 4);
    const margin = 24;
    const x = side < 2 ? Math.random() * width : (side === 2 ? -margin : width + margin);
    const y = side >= 2 ? Math.random() * height : (side === 0 ? -margin : height + margin);
    enemies.push({
      x,
      y,
      angle: Math.random() * Math.PI * 2,
      cooldown: 1 + Math.random() * 2,
      worry: worries[Math.floor(Math.random() * worries.length)]
    });
  }

  function drawTank(x, y, angle, color, outline, size = 1) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.scale(size, size);
    context.fillStyle = 'rgba(0,0,0,.25)';
    context.fillRect(-13, -10, 26, 22);
    context.fillStyle = outline;
    context.fillRect(-13, -10, 26, 20);
    context.fillStyle = color;
    context.fillRect(-10, -8, 20, 16);
    context.fillStyle = '#17221e';
    context.fillRect(0, -3, 19, 6);
    context.fillStyle = color;
    context.beginPath();
    context.arc(-1, 0, 5, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawArena(width, height) {
    context.fillStyle = '#30483d';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'rgba(210, 230, 196, .055)';
    context.lineWidth = 1;
    const grid = 32;
    for (let x = 0; x < width; x += grid) {
      for (let y = 0; y < height; y += grid) {
        context.strokeRect(x, y, grid, grid);
        const seed = Math.sin(x * 13 + y * 7) * 10000;
        if (seed - Math.floor(seed) > .82) {
          context.fillStyle = 'rgba(184, 209, 146, .12)';
          context.beginPath();
          context.arc(x + 5 + (seed % 18), y + 5 + (seed % 18), 1.4, 0, Math.PI * 2);
          context.fill();
        }
      }
    }
    const blocks = [
      [width * .23, height * .28], [width * .72, height * .25],
      [width * .31, height * .72], [width * .68, height * .68]
    ];
    blocks.forEach(([x, y]) => {
      context.fillStyle = '#5c5845';
      context.fillRect(x - 15, y - 12, 30, 24);
      context.strokeStyle = 'rgba(255,255,255,.12)';
      context.strokeRect(x - 15, y - 12, 30, 24);
      context.fillStyle = 'rgba(18, 28, 24, .2)';
      context.fillRect(x - 12, y - 9, 24, 4);
    });
  }

  function drawLabel(text, x, y, color = '#f1f5ee') {
    context.font = 'bold 10px "Noto Sans TC", "Noto Sans JP", sans-serif';
    const textWidth = context.measureText(text).width;
    context.fillStyle = 'rgba(13, 23, 24, .82)';
    context.fillRect(x - textWidth / 2 - 5, y - 8, textWidth + 10, 15);
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, x, y);
  }

  function drawPickup(pickup) {
    context.save();
    context.translate(pickup.x, pickup.y);
    context.rotate(Math.sin(performance.now() / 300 + pickup.x) * .08);
    context.fillStyle = '#f3e5a5';
    context.fillRect(-8, -9, 16, 18);
    context.strokeStyle = '#8d7440';
    context.strokeRect(-8, -9, 16, 18);
    context.strokeStyle = 'rgba(91, 73, 39, .55)';
    context.beginPath();
    context.moveTo(-4, -4);
    context.lineTo(4, -4);
    context.moveTo(-4, 0);
    context.lineTo(4, 0);
    context.moveTo(-4, 4);
    context.lineTo(2, 4);
    context.stroke();
    context.restore();
  }

  function update(delta, width, height) {
    if (gameState !== 'playing') return;
    const up = keys.has('w') || keys.has('arrowup') || pressedDirections.has('up');
    const down = keys.has('s') || keys.has('arrowdown') || pressedDirections.has('down');
    const left = keys.has('a') || keys.has('arrowleft') || pressedDirections.has('left');
    const right = keys.has('d') || keys.has('arrowright') || pressedDirections.has('right');
    let dx = Number(right) - Number(left);
    let dy = Number(down) - Number(up);
    const distance = Math.hypot(dx, dy);
    if (distance) {
      dx /= distance;
      dy /= distance;
      player.x = Math.max(16, Math.min(width - 16, player.x + dx * player.speed * delta));
      player.y = Math.max(16, Math.min(height - 16, player.y + dy * player.speed * delta));
      if (!mouseTarget) player.angle = Math.atan2(dy, dx);
    } else if (mouseTarget) {
      const targetDx = mouseTarget.x - player.x;
      const targetDy = mouseTarget.y - player.y;
      const targetDistance = Math.hypot(targetDx, targetDy);
      if (targetDistance > 4) {
        const moveDistance = Math.min(targetDistance, player.speed * delta);
        player.x += targetDx / targetDistance * moveDistance;
        player.y += targetDy / targetDistance * moveDistance;
      }
    }
    if (keys.has(' ') || keys.has('enter') || mouseFiring) fire();
    player.cooldown = Math.max(0, player.cooldown - delta);
    player.invulnerable = Math.max(0, player.invulnerable - delta);

    spawnTimer -= delta;
    if (spawnTimer <= 0 && enemies.length < 5) {
      spawnEnemy(width, height);
      spawnTimer = Math.max(.8, 2.4 - score * .04);
    }

    enemies.forEach((enemy) => {
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      enemy.angle = angle;
      const gap = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (gap > 115) {
        enemy.x += Math.cos(angle) * 42 * delta;
        enemy.y += Math.sin(angle) * 42 * delta;
      }
      enemy.cooldown -= delta;
      if (enemy.cooldown <= 0 && gap < 300) {
        bullets.push({
          x: enemy.x + Math.cos(angle) * 18,
          y: enemy.y + Math.sin(angle) * 18,
          vx: Math.cos(angle) * 190,
          vy: Math.sin(angle) * 190,
          life: 1.6,
          enemy: true
        });
        enemy.cooldown = 1.8 + Math.random() * 1.2;
      }
      if (gap < 24 && player.invulnerable <= 0) damagePlayer();
    });

    pickups = pickups.filter((pickup) => {
      if (Math.hypot(player.x - pickup.x, player.y - pickup.y) >= 20) return true;
      cheatSheets += 1;
      cheatsElement.textContent = `${cheatSheets}/20`;
      if (cheatSheets >= 20) {
        gameState = 'graduation';
        endingStartedAt = performance.now();
        message.textContent = translations[languages[languageIndex]].victoryPraise;
        restartButton.hidden = true;
      }
      return false;
    });

    bullets = bullets.filter((bullet) => {
      bullet.x += bullet.vx * delta;
      bullet.y += bullet.vy * delta;
      bullet.life -= delta;
      if (!bullet.enemy) {
        const target = enemies.find((enemy) => Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < 17);
        if (target) {
          enemies = enemies.filter((enemy) => enemy !== target);
          score += 1;
          scoreElement.textContent = score;
          particles.push({ x: target.x, y: target.y, life: .35 });
          if (Math.random() < .8) {
            pickups.push({
              x: Math.max(14, Math.min(width - 14, target.x + (Math.random() - .5) * 44)),
              y: Math.max(14, Math.min(height - 14, target.y + (Math.random() - .5) * 44))
            });
          }
          return false;
        }
      } else if (Math.hypot(player.x - bullet.x, player.y - bullet.y) < 14 && player.invulnerable <= 0) {
        damagePlayer();
        return false;
      }
      return bullet.life > 0 && bullet.x > -10 && bullet.x < width + 10 && bullet.y > -10 && bullet.y < height + 10;
    });
    particles = particles.filter((particle) => (particle.life -= delta) > 0);
  }

  function damagePlayer() {
    if (player.invulnerable > 0) return;
    health = Math.max(0, health - 1);
    healthElement.textContent = health;
    player.invulnerable = 1.2;
    if (health === 0) {
      gameState = 'lost';
      gameOverPanel.hidden = false;
      document.querySelector('#game-over-title').textContent = translations[languages[languageIndex]].gameOverTitle;
    }
  }

  function drawPixelPerson(x, groundY, frame) {
    const walk = Math.floor(frame / 150) % 2;
    context.fillStyle = '#202a3a';
    context.fillRect(x - 6, groundY - 23, 12, 12);
    context.fillStyle = '#f0c49c';
    context.fillRect(x - 4, groundY - 21, 8, 8);
    context.fillStyle = '#e8b84e';
    context.fillRect(x - 6, groundY - 11, 12, 8);
    context.fillStyle = '#5268a5';
    context.fillRect(x - 6, groundY - 3, 5, 3 + walk);
    context.fillRect(x + 1, groundY - 3, 5, 4 - walk);
    context.fillStyle = '#f0c49c';
    context.fillRect(x + 5, groundY - 10, 3, 5);
  }

  function drawPixelEnding(width, height, time) {
    const elapsed = time - endingStartedAt;
    const groundY = height * .78;
    context.fillStyle = '#a9d8d0';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#eaf2d0';
    context.fillRect(0, groundY, width, height - groundY);
    context.fillStyle = '#7bad69';
    context.fillRect(0, groundY + 9, width, height - groundY - 9);

    const buildingX = width * .5 - 82;
    const buildingY = groundY - 98;
    const fade = Math.max(0, 1 - Math.max(0, elapsed - 2100) / 1150);
    if (fade > 0) {
      context.globalAlpha = fade;
      context.fillStyle = '#e4d7b8';
      context.fillRect(buildingX + 8, buildingY + 18, 148, 80);
      context.fillStyle = '#c76f61';
      context.fillRect(buildingX, buildingY + 12, 164, 16);
      context.fillRect(buildingX + 17, buildingY, 130, 12);
      context.fillStyle = '#8d665a';
      context.fillRect(buildingX + 28, buildingY + 37, 19, 22);
      context.fillRect(buildingX + 68, buildingY + 37, 19, 22);
      context.fillRect(buildingX + 108, buildingY + 37, 19, 22);
      context.fillStyle = '#806b50';
      context.fillRect(buildingX + 69, buildingY + 68, 27, 30);
      context.fillStyle = '#f5e8c1';
      context.font = 'bold 9px "Noto Sans TC", sans-serif';
      context.textAlign = 'center';
      context.fillText('學校', buildingX + 82, buildingY + 32);
      context.globalAlpha = 1;
    }

    const personX = Math.min(width * .5 - 110, 22 + elapsed * .075);
    drawPixelPerson(personX, groundY, elapsed);
    if (elapsed > 1100 && elapsed < 3400) {
      const progress = Math.min(1, (elapsed - 1100) / 1200);
      for (let index = 0; index < 12; index += 1) {
        const seed = index * 37;
        const sparkleX = personX + 13 + Math.sin(elapsed / 220 + seed) * (12 + progress * 55);
        const sparkleY = groundY - 16 - ((elapsed / 5 + seed * 3) % 65);
        context.fillStyle = ['#fff0a8', '#b7ee78', '#8bd8ef', '#e3b5f2'][index % 4];
        context.fillRect(sparkleX, sparkleY, 4, 4);
      }
    }

    if (elapsed > 3200) {
      if (endingRestartButton.hidden) {
        endingRestartButton.hidden = false;
        message.textContent = translations[languages[languageIndex]].endingText;
      }
      context.fillStyle = 'rgba(17, 26, 36, .72)';
      context.fillRect(0, 0, width, height);
      context.fillStyle = '#b7ee78';
      context.font = 'bold 19px "Noto Sans TC", "Noto Sans JP", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(translations[languages[languageIndex]].endingTitle, width / 2, height * .45);
      context.fillStyle = '#eef4f3';
      context.font = '12px "Noto Sans TC", "Noto Sans JP", sans-serif';
      context.fillText(translations[languages[languageIndex]].endingText, width / 2, height * .55);
    }
  }

  function drawPixelPersonAt(x, groundY, outfit, pose = 0, cap = false) {
    const clap = Math.floor(performance.now() / 180 + pose) % 2;
    context.fillStyle = '#30364a';
    context.fillRect(x - 7, groundY - 28, 14, 12);
    context.fillStyle = '#efc39e';
    context.fillRect(x - 5, groundY - 25, 10, 9);
    context.fillStyle = outfit;
    context.fillRect(x - 7, groundY - 15, 14, 12);
    context.fillStyle = '#30364a';
    context.fillRect(x - 6, groundY - 3, 5, 3);
    context.fillRect(x + 1, groundY - 3, 5, 3);
    context.fillStyle = '#efc39e';
    if (pose === 1) {
      context.fillRect(x - 12, groundY - 20 - clap * 3, 5, 4);
      context.fillRect(x + 7, groundY - 20 - clap * 3, 5, 4);
    } else {
      context.fillRect(x - 11, groundY - 9, 4, 5);
      context.fillRect(x + 7, groundY - 9, 4, 5);
    }
    if (cap) {
      context.fillStyle = '#202636';
      context.fillRect(x - 9, groundY - 29, 18, 3);
      context.fillRect(x - 5, groundY - 34, 10, 5);
      context.fillStyle = '#e2ba62';
      context.fillRect(x + 7, groundY - 27, 5, 2);
    }
  }

  function drawPixelTeacher(x, groundY) {
    context.fillStyle = '#d6d3c4';
    context.fillRect(x - 7, groundY - 28, 14, 12);
    context.fillStyle = '#efc39e';
    context.fillRect(x - 5, groundY - 25, 10, 9);
    context.fillStyle = '#8ea38d';
    context.fillRect(x - 8, groundY - 15, 16, 12);
    context.fillStyle = '#394354';
    context.fillRect(x - 6, groundY - 3, 5, 3);
    context.fillRect(x + 1, groundY - 3, 5, 3);
    context.fillStyle = '#efc39e';
    context.fillRect(x + 7, groundY - 12, 8, 4);
    context.fillStyle = '#f1d478';
    context.fillRect(x + 14, groundY - 15, 7, 7);
    context.fillStyle = '#fff1be';
    context.fillRect(x + 16, groundY - 13, 3, 3);
    context.fillStyle = '#566c8a';
    context.fillRect(x - 6, groundY - 10, 4, 2);
    context.fillRect(x + 2, groundY - 10, 4, 2);
  }

  function drawGraduation(width, height, time) {
    const elapsed = time - endingStartedAt;
    const groundY = height * .78;
    const centerX = width / 2;
    context.fillStyle = '#21364a';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#2c4960';
    context.fillRect(0, height * .62, width, height * .16);
    context.fillStyle = '#7bad69';
    context.fillRect(0, groundY, width, height - groundY);

    for (let index = 0; index < 12; index += 1) {
      const x = 14 + index * (width - 28) / 11;
      context.fillStyle = index % 2 ? '#f0d47a' : '#f1a4a0';
      context.fillRect(x, height * .2 + (index % 3) * 11, 5, 5);
      context.fillStyle = '#b7ee78';
      context.fillRect(x + 4, height * .25 + (index % 2) * 8, 4, 4);
    }

    const stageX = centerX - Math.min(115, width * .32);
    context.fillStyle = '#9b765b';
    context.fillRect(stageX, groundY - 10, Math.min(230, width * .64), 10);
    context.fillStyle = '#c49a6c';
    context.fillRect(stageX + 8, groundY - 15, Math.min(214, width * .64 - 16), 5);

    drawPixelPersonAt(centerX - 88, groundY - 15, '#586b9b', 1);
    drawPixelPersonAt(centerX + 78, groundY - 15, '#53688f', 1);
    drawPixelPersonAt(centerX - 112, groundY - 15, '#a86969', 1);
    drawPixelPersonAt(centerX + 112, groundY - 15, '#7b6598', 1);

    const awardX = centerX;
    const awardY = groundY - 15;
    drawPixelTeacher(awardX - 24, awardY);
    drawPixelPersonAt(awardX, awardY, '#222b3e', 0, true);
    context.fillStyle = '#f1d478';
    context.fillRect(awardX - 3, awardY - 13, 6, 6);
    context.fillRect(awardX - 6, awardY - 8, 12, 2);
    context.fillStyle = '#e7ca7b';
    context.fillRect(awardX + 10, awardY - 18, 8, 7);
    context.fillStyle = '#fff1be';
    context.fillRect(awardX + 12, awardY - 16, 4, 3);

    if (elapsed < 1000) {
      const rise = Math.min(1, elapsed / 550);
      context.fillStyle = '#f1d478';
      context.fillRect(awardX + 14, awardY - 18 - rise * 13, 3, 3);
    }

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#f1d478';
    context.font = 'bold 19px "Noto Sans TC", "Noto Sans JP", sans-serif';
    context.fillText(translations[languages[languageIndex]].graduationTitle, centerX, height * .12);
    context.fillStyle = '#f3f5e9';
    context.font = '12px "Noto Sans TC", "Noto Sans JP", sans-serif';
    context.fillText(translations[languages[languageIndex]].graduationCaption, centerX, height * .2);
    context.fillStyle = '#b7ee78';
    context.font = 'bold 17px "Noto Sans TC", "Noto Sans JP", sans-serif';
    context.fillText(translations[languages[languageIndex]].victoryPraise, centerX, height * .36);

    if (elapsed > 2800) endingRestartButton.hidden = false;
  }

  function render(time) {
    const delta = Math.min((time - lastTime) / 1000 || 0, .04);
    lastTime = time;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (gameState === 'school-ending') {
      drawPixelEnding(width, height, time);
      requestAnimationFrame(render);
      return;
    }
    if (gameState === 'graduation') {
      drawGraduation(width, height, time);
      requestAnimationFrame(render);
      return;
    }
    update(delta, width, height);
    drawArena(width, height);
    pickups.forEach(drawPickup);
    enemies.forEach((enemy) => {
      drawTank(enemy.x, enemy.y, enemy.angle, '#d77861', '#633f38');
      drawLabel(enemy.worry, enemy.x, enemy.y - 22, '#ffc3a8');
    });
    drawTank(player.x, player.y, player.angle, '#b7ee78', '#51683d');
    drawLabel('學生', player.x, player.y - 22, '#d8ffac');
    bullets.forEach((bullet) => {
      context.fillStyle = bullet.enemy ? '#ffae72' : '#f6edb1';
      context.beginPath();
      context.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
      context.fill();
    });
    particles.forEach((particle) => {
      context.fillStyle = `rgba(255, 213, 122, ${particle.life * 2})`;
      context.beginPath();
      context.arc(particle.x, particle.y, (1 - particle.life / .35) * 18, 0, Math.PI * 2);
      context.fill();
    });
    if (player.invulnerable > 0 && Math.floor(time / 100) % 2 === 0) {
      context.strokeStyle = 'rgba(255,255,255,.8)';
      context.beginPath();
      context.arc(player.x, player.y, 19, 0, Math.PI * 2);
      context.stroke();
    }
    if (gameState !== 'playing') {
      context.fillStyle = 'rgba(10, 18, 19, .72)';
      context.fillRect(0, 0, width, height);
      context.fillStyle = gameState === 'won' ? '#b7ee78' : '#ffd0be';
      context.font = 'bold 20px "Noto Sans TC", "Noto Sans JP", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(translations[languages[languageIndex]][gameState === 'won' ? 'victory' : 'gameOver'], width / 2, height / 2);
    }
    requestAnimationFrame(render);
  }

  function updateMouseTarget(event) {
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    player.angle = Math.atan2(y - player.y, x - player.x);
    mouseTarget = { x, y };
  }

  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') updateMouseTarget(event);
  });
  canvas.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    updateMouseTarget(event);
    mouseFiring = true;
    fire();
  });
  window.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'mouse' && event.button === 0) mouseFiring = false;
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
    keys.add(key);
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => {
    keys.clear();
    pressedDirections.clear();
    mouseFiring = false;
  });
  document.querySelectorAll('[data-move]').forEach((button) => {
    const direction = button.dataset.move;
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      pressedDirections.add(direction);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => {
      button.addEventListener(type, () => pressedDirections.delete(direction));
    });
  });
  document.querySelector('#fire-button').addEventListener('pointerdown', (event) => {
    event.preventDefault();
    fire();
  });
  window.addEventListener('resize', resizeCanvas);
  setLanguage(languages[languageIndex]);
  resizeCanvas();
  requestAnimationFrame(render);
})();
