let bgImg, bgBlur1, bgBlur2;
let pixelatedGraphics = [];  // 预渲染多个不同大小的像素化图像
let pixelSizes = [18, 28, 34, 42];  // 4种马赛克大小

let sceneStep = 0;
let sceneTimer = 0;
let subtitle = "";

let showingWordRegionIdx = -1;
let typeInterval = 3;
let charIdx = 0;
let wordDisplayTimer = 0;
let finalMagnifierFrame;

// ============ Scene 0-1-2 字幕相关变量 ============
let lineIdx = 0;     // 当前字幕索引

// 第一段字幕（开场前）
let linesBeforeStart = [
  "Hey.",
  "Call from 2025.     A thousand yrs ago.",
  "OK.",
  "This is a Digital Will.",
  "These memories are what you're trying to keep.",
  "...For a thousand yrs.",
  "But a Will awakens when you look at it.",
  "And when awakened… it begins to decay.",
  "If you choose to open it now,",
  "you take responsibility for what remains.",
  "U ready?"
];

let pauseBeforeStart = [
  60,  //"Hey."
  60,  //"Call from 2025..." 
  60,  //"OK." 
  30,  //"This is a Digital Will." 
  60,  //"It has been sealed..." 
  30,  //"These memories..." 
  60,  //"...For a thousand yrs." 
  30,  //"But a Will awakens..." 
  60,  //"And when awakened…" 
  30,  //"If you choose..." 
  60,  //"you take responsibility..." 
  120  //"U ready?" (停顿后显示开场界面)
];

// 第二段字幕（点击START后）
let linesAfterStart = [
  "A glance through time.",
  "This is what is left."
];

let pauseAfterStart = [
  60,  //"A glance through time."
  90   //"This is what is left."
];

let btnX, btnY, btnW, btnH;
let currentLines = linesBeforeStart;  // 当前使用的字幕数组
let currentPauses = pauseBeforeStart;  // 当前使用的停顿数组

// ============ Scene 3 碎片相关变量 ============
let fragments = [];
let fragmentsInitialized = false;

// 区域定义（13个多边形）
let regions = [
  {
    name: "Tree(big)",
    points: [{x:5,y:1279},{x:45,y:1305},{x:57,y:1268},{x:54,y:1205},{x:94,y:1171},{x:131,y:1168},{x:165,y:1176},{x:174,y:1119},{x:185,y:1071},{x:248,y:1062},{x:308,y:1074},{x:351,y:1094},{x:368,y:1151},{x:417,y:1185},{x:488,y:1214},{x:560,y:1277},{x:537,y:1331},{x:523,y:1385},{x:511,y:1471},{x:494,y:1545},{x:431,y:1603},{x:397,y:1683},{x:5,y:1685}],
    labelX: 250,
    labelY: 1350,  // 下移50
    noiseOffset: 0
  },
  {
    name: "Wall(left)",
    points: [{x:5,y:1272},{x:37,y:1292},{x:42,y:1269},{x:37,y:1201},{x:82,y:1155},{x:148,y:1155},{x:168,y:1058},{x:254,y:1044},{x:351,y:1078},{x:383,y:1141},{x:471,y:1189},{x:563,y:1258},{x:826,y:1149},{x:971,y:1095},{x:954,y:606},{x:1054,y:575},{x:1046,y:423},{x:1134,y:412},{x:1117,y:180},{x:1266,y:154},{x:1286,y:8},{x:5,y:11}],
    labelX: 500,
    labelY: 600,
    noiseOffset: 100
  },
  {
    name: "Grassland",
    points: [{x:868,y:1149},{x:1489,y:1309},{x:988,y:1684},{x:405,y:1684},{x:437,y:1618},{x:494,y:1561},{x:520,y:1464},{x:534,y:1372},{x:571,y:1278}],
    labelX: 750,  // 右移50
    labelY: 1400,
    noiseOffset: 200
  },
  {
    name: "Entrance",
    points: [{x:886,y:1146},{x:983,y:1109},{x:963,y:617},{x:1051,y:592},{x:1800,y:658},{x:1920,y:612},{x:1923,y:778},{x:1986,y:786},{x:1980,y:1175},{x:1946,y:1189},{x:1929,y:1146},{x:1895,y:1129},{x:1852,y:1126},{x:1809,y:1144},{x:1794,y:1172},{x:1817,y:1195},{x:1774,y:1247},{x:1723,y:1309},{x:1554,y:1264},{x:1497,y:1304}],
    labelX: 1300,
    labelY: 900,
    noiseOffset: 300
  },
  {
    name: "Terrace",
    points: [{x:1068,y:583},{x:1054,y:434},{x:1143,y:420},{x:1917,y:452},{x:1920,y:603},{x:1794,y:652}],
    labelX: 1400,
    labelY: 520,
    noiseOffset: 400
  },
  {
    name: "Wall(middle)",
    points: [{x:1929,y:463},{x:1932,y:769},{x:1995,y:783},{x:1989,y:1172},{x:1972,y:1212},{x:1977,y:1289},{x:2072,y:1318},{x:2292,y:1044},{x:2298,y:800},{x:2683,y:835},{x:2738,y:483}],
    labelX: 2250,  // 右移50
    labelY: 750,   // 上移50
    noiseOffset: 500
  },
  {
    name: "Windows",
    points: [{x:1126,y:194},{x:1143,y:412},{x:2738,y:475},{x:2795,y:6},{x:1297,y:8},{x:1274,y:163}],
    labelX: 1800,
    labelY: 250,
    noiseOffset: 600
  },
  {
    name: "Tree(small)",
    points: [{x:2303,y:1041},{x:2355,y:1041},{x:2398,y:1052},{x:2420,y:1126},{x:2403,y:1175},{x:2438,y:1189},{x:2386,y:1295},{x:2146,y:1249}],
    labelX: 2300,
    labelY: 1150,
    noiseOffset: 700
  },
  {
    name: "Atrium",
    points: [{x:1017,y:1684},{x:1552,y:1284},{x:2063,y:1398},{x:2183,y:1461},{x:2197,y:1681}],
    labelX: 1600,
    labelY: 1480,  // 下移30
    noiseOffset: 800
  },
  {
    name: "Gate",
    points: [{x:2306,y:815},{x:2300,y:1032},{x:2358,y:1035},{x:2403,y:1041},{x:2429,y:1121},{x:2446,y:1149},{x:2626,y:1169},{x:2555,y:1006},{x:2583,y:840}],
    labelX: 2450,
    labelY: 1000,
    noiseOffset: 900
  },
  {
    name: "Tree(Smallest)",
    points: [{x:1763,y:1272},{x:1829,y:1206},{x:1806,y:1172},{x:1832,y:1149},{x:1860,y:1138},{x:1895,y:1144},{x:1923,y:1158},{x:1940,y:1198},{x:1963,y:1212},{x:1969,y:1295},{x:1957,y:1315}],
    labelX: 1880,
    labelY: 1220,
    noiseOffset: 1000
  },
  {
    name: "Wall(right)",
    points: [{x:2569,y:1009},{x:2600,y:846},{x:2692,y:849},{x:2806,y:14},{x:3018,y:11},{x:3012,y:1681},{x:2883,y:1684}],
    labelX: 2800,
    labelY: 900,
    noiseOffset: 1100
  },
  {
    name: "Ground",
    points: [{x:2866,y:1678},{x:2638,y:1189},{x:2443,y:1161},{x:2420,y:1169},{x:2452,y:1186},{x:2395,y:1304},{x:2140,y:1264},{x:2077,y:1329},{x:1983,y:1304},{x:1963,y:1324},{x:1760,y:1284},{x:1740,y:1318},{x:2069,y:1395},{x:2192,y:1458},{x:2209,y:1678}],
    labelX: 2250,  // 右移50
    labelY: 1450,  // 下移50
    noiseOffset: 1200
  }
];

let learnedRegions = {};

//字幕配音（Scene 0-1-2）
let audios = [];
//场景音效
//let audioHeartbeat, audioClock;
let hasPlayedAudio = {};

// ============ Fragment 碎片类（修复版 - 抖动减慢）============
class Fragment {
  constructor(regionIndex, drawW, drawH, offsetX, offsetY, scaleX, scaleY) {
    this.regionIndex = regionIndex;
    this.region = regions[regionIndex];
    this.name = this.region.name;
    
    // 保存绘图参数
    this.drawW = drawW;
    this.drawH = drawH;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    
    // 计算多边形中心点（原始图像坐标）
    let sumX = 0, sumY = 0;
    for (let pt of this.region.points) {
      sumX += pt.x;
      sumY += pt.y;
    }
    this.centerX = sumX / this.region.points.length;
    this.centerY = sumY / this.region.points.length;
    
    // 初始屏幕位置（原位置）
    this.startScreenX = offsetX + this.centerX * scaleX;
    this.startScreenY = offsetY + this.centerY * scaleY;
    
    // 缩放比例（碎片缩小到原来的0.35倍）
    this.fragScale = 0.35;
    
    // 计算目标位置（屏幕坐标，分布在画布边缘）
    this.calculateTargetPosition();
    
    // 当前屏幕位置
    this.screenX = this.startScreenX;
    this.screenY = this.startScreenY;
    
    // 抖动相关
    this.trembleX = 0;
    this.trembleY = 0;
    this.trembleIntensity = 0;
    
    // 为每个碎片创建独特的noise偏移量
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(1000);
    
    // 动画进度
    this.animationProgress = 0;
    
    // 透明度
    this.alpha = 180;
  }
  
  // 计算目标位置（分布在屏幕边缘，避开中心）
  calculateTargetPosition() {
    let idx = this.regionIndex;
    let margin = 120;
    
    if (idx < 4) {
      this.targetX = margin + random(0, 100);
      this.targetY = margin + idx * ((height - margin * 2) / 4) + random(0, 50);
    } else if (idx < 8) {
      this.targetX = width - margin - random(0, 100);
      this.targetY = margin + (idx - 4) * ((height - margin * 2) / 4) + random(0, 50);
    } else if (idx < 10) {
      this.targetX = width * 0.3 + (idx - 8) * (width * 0.4) + random(-30, 30);
      this.targetY = margin + random(0, 50);
    } else {
      this.targetX = width * 0.25 + (idx - 10) * (width * 0.25) + random(-30, 30);
      this.targetY = height - margin - random(0, 50);
    }
  }
  
  // 更新碎片状态（抖动减慢5-6倍）
  update(elapsedFrames) {
    if (this.animationProgress < 1) {
      this.animationProgress = min(1, elapsedFrames / 120);
      let easedProgress = this.easeOutCubic(this.animationProgress);
      this.screenX = lerp(this.startScreenX, this.targetX, easedProgress);
      this.screenY = lerp(this.startScreenY, this.targetY, easedProgress);
    }
    
    // 抖动强度增长速度减慢6倍（从0.015改为0.0025）
    // 并且延迟开始时间（从移动结束后300帧开始，即5秒后）
    if (elapsedFrames > 300) {
      let trembleTime = elapsedFrames - 300;
      this.trembleIntensity = min(25, trembleTime * 0.0025);
    }
    
    // 使用noise代替random，让抖动更平滑自然
    // noise速度也减慢（乘以0.02而不是直接用帧数）
    let noiseSpeed = 0.02;
    let noiseValX = noise(this.noiseOffsetX + elapsedFrames * noiseSpeed);
    let noiseValY = noise(this.noiseOffsetY + elapsedFrames * noiseSpeed);
    
    // 将noise值(0-1)映射到(-1, 1)范围
    this.trembleX = (noiseValX - 0.5) * 2 * this.trembleIntensity;
    this.trembleY = (noiseValY - 0.5) * 2 * this.trembleIntensity;
  }
  
  easeOutCubic(t) {
    return 1 - pow(1 - t, 3);
  }
  
  draw() {
    push();
    translate(this.screenX + this.trembleX, this.screenY + this.trembleY);
    scale(this.fragScale);
    
    fill(255, this.alpha);
    stroke(255);
    strokeWeight(3 / this.fragScale);
    
    beginShape();
    for (let pt of this.region.points) {
      let relX = (pt.x - this.centerX) * this.scaleX;
      let relY = (pt.y - this.centerY) * this.scaleY;
      vertex(relX, relY);
    }
    endShape(CLOSE);
    
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24 / this.fragScale);
    textStyle(NORMAL);
    text(this.name, 0, 0);
    
    pop();
  }
}

function preload() {
  bgImg = loadImage('assets/img1.png');
  
  // 加载配音
  // for (let i = 0; i < 13; i = i + 1) {
  //   let audioNum = i + 1;
  //   audios[i] = loadSound('assets/Audio ' + audioNum + '.mp3');
  // }

  // audioHeartbeat = loadSound('assets/heartbeat.mp3');
  // audioClock = loadSound('assets/clock.mp3');
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.id("p5-canvas");
  canvas.parent("p5-canvas-container");
  
  pixelDensity(1);
  
  // 初始化从Scene 1（第一段字幕）开始
  sceneStep = 1;
  currentLines = linesBeforeStart;
  currentPauses = pauseBeforeStart;
  
  // 按钮位置
  btnW = 200;
  btnH = 60;
  btnX = width / 2 - btnW / 2;
  btnY = height / 2 + 50;
  
  // ============ 优化：缩小图像后再模糊 ============
  console.log("正在生成模糊图像...");
  let smallW = floor(bgImg.width / 4);
  let smallH = floor(bgImg.height / 4);
  
  let bgSmall = createImage(smallW, smallH);
  bgSmall.copy(bgImg, 0, 0, bgImg.width, bgImg.height, 0, 0, smallW, smallH);
  
  bgBlur1 = bgSmall.get();
  bgBlur1.filter(BLUR, 3);
  
  bgBlur2 = bgSmall.get();
  bgBlur2.filter(BLUR, 8);
  console.log("模糊图像生成完成！");
  
  // ============ 预渲染多个不同大小的像素化图像 ============
  console.log("正在预渲染像素化图像...");
  for (let i = 0; i < pixelSizes.length; i++) {
    pixelatedGraphics[i] = createGraphics(bgImg.width, bgImg.height);
    preRenderPixelatedImage(pixelatedGraphics[i], pixelSizes[i]);
    console.log("预渲染完成: blockSize = " + pixelSizes[i]);
  }
  console.log("所有预渲染完成！");
  
  //设置心跳音效为循环模式 
  //audioHeartbeat.loop();
  //audioHeartbeat.pause();
  
  //设置时钟音效为循环模式
  //audioClock.loop();
  //audioClock.pause();
}

// ============ 预渲染像素化图像 ============
function preRenderPixelatedImage(pg, blockSize) {
  bgImg.loadPixels();
  pg.noStroke();
  
  for (let y = 0; y < bgImg.height; y += blockSize) {
    for (let x = 0; x < bgImg.width; x += blockSize) {
      let idx = 4 * (y * bgImg.width + x);
      let r = bgImg.pixels[idx];
      let g = bgImg.pixels[idx + 1];
      let b = bgImg.pixels[idx + 2];
      pg.fill(r, g, b);
      pg.rect(x, y, blockSize, blockSize);
    }
  }
}

// ============ 根据时间获取当前像素化等级 ============
function getCurrentPixelLevel(timer, totalFrames) {
  // 分4个阶段，每阶段马赛克变大一级
  let stage = floor(timer / (totalFrames / 4));
  stage = min(stage, pixelSizes.length - 1);
  return stage;
}

function draw() {
  background(0);

  let imgAspect = bgImg.width / bgImg.height;
  let availableW = width - 100;
  let availableH = height - 100;
  let canvasAspect = availableW / availableH;
  let drawW, drawH;
  if (imgAspect > canvasAspect) {
    drawW = availableW;
    drawH = availableW / imgAspect;
  } else {
    drawH = availableH;
    drawW = availableH * imgAspect;
  }
  imageMode(CENTER);

  // ============ Scene 0: 开场按钮界面 ============
  if (sceneStep === 0) {
    drawStartScreen();
  }
  // ============ Scene 1-2: 打字机字幕阶段（黑屏）============
  else if (sceneStep === 1) {
    runTypewriter();
  }
  // ============ Scene 3: 清晰图片 + 字幕 ============
  else if (sceneStep === 2) {
    //playAudioOnce(voiceAudios[0], 'take_a_close_look');
    image(bgImg, width/2, height/2, drawW, drawH);
    subtitle = "Take a close look.";
    drawSubtitle(subtitle);
    sceneTimer++;
    if (sceneTimer > 180) {
      sceneStep = 3; sceneTimer = 0;
    }
  }
  else if (sceneStep === 3) {
    image(bgImg, width/2, height/2, drawW, drawH);
    subtitle = "";
    drawSubtitle(subtitle);
    sceneTimer++;
    if (sceneTimer > 45) {
      sceneStep = 4; sceneTimer = 0;
    }
  }
  else if (sceneStep === 4) {
    //playAudioOnce(voiceAudios[1], 'never_get_back');
    image(bgImg, width/2, height/2, drawW, drawH);
    subtitle = "Coz you can never get back.";
    drawSubtitle(subtitle);
    sceneTimer++;
    if (sceneTimer > 150) {
      sceneStep = 5; sceneTimer = 0;
    }
  }
  else if (sceneStep === 5) {
    image(bgImg, width/2, height/2, drawW, drawH);
    subtitle = "";
    drawSubtitle(subtitle);
    sceneTimer++;
    if (sceneTimer > 75) {
      sceneStep = 6; sceneTimer = 0;
    }
  }
  else if (sceneStep === 6) {
    //blink1
    //if (sceneTimer === 0) {
    //  playAudioOnce(audioHeartbeat, 'blink1_heartbeat');
    //}
    blinkTransition(bgImg, bgBlur1, drawW, drawH);
    sceneTimer++;
    if (sceneTimer > 120) {
      sceneStep = 7; sceneTimer = 0;
    }
  }
  else if (sceneStep === 7) {
    //blink2
    //if (sceneTimer === 0) {
    //  playAudioOnce(audioHeartbeat, 'blink2_heartbeat');
    //}
    blinkTransition(bgBlur1, bgBlur2, drawW, drawH);
    sceneTimer++;
    if (sceneTimer > 120) {
      sceneStep = 8; sceneTimer = 0;
    }
  }
  else if (sceneStep === 8) {
    //blink3
    //if (sceneTimer === 0) {
    //  playAudioOnce(audioHeartbeat, 'blink3_heartbeat');
    //}
    blinkPixelation(bgBlur2, drawW, drawH);
    sceneTimer++;
    if (sceneTimer > 120) {
      //audioHeartbeat.pause();
      sceneStep = 9; sceneTimer = 0;
    }
  }
  else if (sceneStep === 9) {
    // 放大镜阶段：20秒（1200帧）
    let totalFrames = 1200;
    
    // 根据时间获取当前像素化等级
    let pixelLevel = getCurrentPixelLevel(sceneTimer, totalFrames);
    let currentBlockSize = pixelSizes[pixelLevel];
    
    let clearBlock = 4;
    let clearDist = 80;
    
    drawPixelationWithMagnifier(pixelLevel, clearBlock, drawW, drawH, clearDist);
    
    // 显示字幕
    if (sceneTimer < 90) {
      //if (sceneTimer === 0) {
      //  playAudioOnce(voiceAudios[2], 'try');
      //}
      drawSubtitle("Memorize every detail.");
    } else if (sceneTimer < 330) {
      //if (sceneTimer === 90) {
      //  playAudioOnce(voiceAudios[3], 'move');
      //}
      drawSubtitle("Move and tap your mouse.");
    } else if (sceneTimer < 510) {
      //if (sceneTimer === 330) {
      //  playAudioOnce(voiceAudios[4], 'memorize');
      //}
      drawSubtitle("Try.");
    }
    
    // 一直显示倒计时
    let remainingFrames = totalFrames - sceneTimer;
    drawCountdown(ceil(remainingFrames / 60));
    
    // 处理点击区域显示单词逻辑
    if (showingWordRegionIdx >= 0) {
      drawHighlightedRegion(drawW, drawH);
    }
    
    sceneTimer++;
    if (sceneTimer > totalFrames) {
      // 保存最后一帧（放大镜结束时的样子）
      finalMagnifierFrame = get();
      sceneStep = 10; 
      sceneTimer = 0;
    }
  }
  else if (sceneStep === 10) {
    // 黑屏上的两句字幕
    if (sceneTimer < 180) {
      //if (sceneTimer === 1) {
      //  playAudioOnce(voiceAudios[5], 'you_remember');
      //}
      subtitle = "You remember… only when you look.";
      drawSubtitle(subtitle);
    }
    else if (sceneTimer < 360) {
      //if (sceneTimer === 180) {
      //  playAudioOnce(voiceAudios[6], 'memory_decays');
      //}
      subtitle = "Memory decays when ignored.";
      drawSubtitle(subtitle);
    }
    else {
      // 字幕结束，进入"死亡动效"阶段
      sceneStep = 11;
      sceneTimer = 0;
    }
    sceneTimer++;
  }
  // ============ Scene 11: 死亡动效阶段（黑白快速闪烁）============
  else if (sceneStep === 11) {
    let t = sceneTimer;
    let deathDuration = 210;  // 3.5秒
    
    // 抖动幅度逐渐增大
    let shakeAmp = map(t, 0, deathDuration, 0, 15);
    let shakeX = sin(t * 0.3) * shakeAmp;
    let shakeY = cos(t * 0.45) * shakeAmp;
    
    push();
    translate(shakeX, shakeY);
    
    // 显示最模糊的像素化图像（pixelSize=42，即索引3）
    image(pixelatedGraphics[3], width/2, height/2, drawW, drawH);
    
    // 在图像上绘制所有区域标注（黑白快速闪烁）
    let offsetX = width/2 - drawW/2;
    let offsetY = height/2 - drawH/2;
    let scaleX = drawW / bgImg.width;
    let scaleY = drawH / bgImg.height;
    
    for (let i = 0; i < regions.length; i++) {
      let region = regions[i];
      
      // 使用noise生成快速闪烁（速度：0.5）
      let noiseVal = noise(region.noiseOffset + t * 0.5);
      // 透明度范围：30-200
      let polygonAlpha = map(noiseVal, 0, 1, 30, 200);
      
      // 绘制多边形边框（只用黑白，根据noise值决定）
      push();
      // noise值大于0.5用白色，小于0.5用黑色，模拟快速黑白闪烁
      let grayValue = noiseVal > 0.5 ? 255 : 0;
      
      fill(grayValue, polygonAlpha * 0.6);  // 填充带透明度
      stroke(grayValue, polygonAlpha);      // 边框
      strokeWeight(3);
      beginShape();
      for (let pt of region.points) {
        let sx = offsetX + pt.x * scaleX;
        let sy = offsetY + pt.y * scaleY;
        vertex(sx, sy);
      }
      endShape(CLOSE);
      pop();
      
      // 绘制区域名称（文字保持白色）
      let labelX = offsetX + region.labelX * scaleX;
      let labelY = offsetY + region.labelY * scaleY;
      push();
      fill(255, polygonAlpha * 1.2);  // 白色文字
      stroke(0, polygonAlpha * 0.8);   // 黑色描边
      strokeWeight(3);
      textAlign(CENTER, CENTER);
      textSize(32);
      textStyle(NORMAL);
      text(region.name, labelX, labelY);
      pop();
    }
    
    pop();
    
    // 整体亮度闪烁效果（叠加白色层）
    let flashIntensity = (sin(t * 0.4) * 0.5 + 0.5) * 80;
    push();
    fill(255, flashIntensity);
    noStroke();
    rect(0, 0, width, height);
    pop();
    
    sceneTimer++;
    if (sceneTimer > deathDuration) {
      // 进入碎片化阶段
      sceneStep = 12;
      sceneTimer = 0;
      fragmentsInitialized = false;
    }
  }
  // ============ Scene 12: 碎片化阶段 ============
  else if (sceneStep === 12) {
    let offsetX = width/2 - drawW/2;
    let offsetY = height/2 - drawH/2;
    let scaleX = drawW / bgImg.width;
    let scaleY = drawH / bgImg.height;
    
    // 第一帧：初始化碎片
    if (fragmentsInitialized === false) {
      fragments = [];
      for (let i = 0; i < regions.length; i++) {
        fragments.push(new Fragment(i, drawW, drawH, offsetX, offsetY, scaleX, scaleY));
      }
      fragmentsInitialized = true;
    }
    
    // 立即显示碎片（从第0帧开始）
    let elapsedFrames = sceneTimer;
    
    // 更新并绘制所有碎片
    for (let frag of fragments) {
      frag.update(elapsedFrames);
      frag.draw();
    }
    
    // 白色闪光叠加在碎片之上（前30帧）
    if (sceneTimer < 30) {
      let flashAlpha = map(sceneTimer, 0, 30, 220, 0);
      push();
      fill(255, flashAlpha);
      noStroke();
      rect(0, 0, width, height);
      pop();
    }
    
    // 显示字幕
    if (sceneTimer >= 30) {
      if (sceneTimer < 210) {
        drawSubtitle("Time separates meaning into pieces.");
      } else if (sceneTimer < 390) {
        drawSubtitle("It will not wait.");
      }
    }
    
    sceneTimer++;
  }
}

// ============ Scene 0: 开场界面（标题+按钮）============
function drawStartScreen() {
  textAlign(CENTER, CENTER);
  textSize(72);
  textStyle(NORMAL);
  fill(255);
  text("DIGITAL WILL", width / 2, height / 2 - 80);

  let isHover = false;
  if (mouseX > btnX) {
    if (mouseX < btnX + btnW) {
      if (mouseY > btnY) {
        if (mouseY < btnY + btnH) {
          isHover = true;
        }
      }
    }
  }

  if (isHover) {
    fill(255);
    stroke(255);
  } else {
    noFill();
    stroke(255);
  }
  strokeWeight(3);
  rect(btnX, btnY, btnW, btnH, 8);
  
  if (isHover) {
    fill(0);
  } else {
    fill(255);
  }
  textSize(24);
  textStyle(NORMAL);
  text("START", width / 2, btnY + btnH / 2);
}

// ============ Scene 1: 打字机字幕（黑屏）============
function runTypewriter() {
  textAlign(CENTER, CENTER);
  textSize(36);
  textStyle(NORMAL);
  fill(255);

  let line = currentLines[lineIdx];
  let currentPause = currentPauses[lineIdx];  //当前字幕的停顿时间

  //播放配音（一次，切换字幕时触发）
  // if (charIdx === 0) {
  //   if (sceneTimer === 0) {
  //     let audioIndex = lineIdx;
  //     // 如果是第二段字幕，音频索引需要加上第一段的数量
  //     if (currentLines === linesAfterStart) {
  //       audioIndex = audioIndex + linesBeforeStart.length;
  //     }
  //     playAudioOnce(audios[audioIndex], 'scene1_' + audioIndex);
  //   }
  // }

  //打字机效果
  if (charIdx < line.length) {
    if (frameCount % 4 === 0) {  // 打字机速度=4帧
      charIdx++;
    }
  } else {
    //一行打完后停currentPause帧（等字幕说完）
    if (sceneTimer < currentPause) {
      sceneTimer++;
    } else {
      lineIdx++;
      charIdx = 0;
      sceneTimer = 0;
      
      // 判断是否打完当前段落
      if (lineIdx >= currentLines.length) {
        if (currentLines === linesBeforeStart) {
          // 第一段打完，显示开场界面
          sceneStep = 0;
          lineIdx = 0;
          charIdx = 0;
          currentLines = linesAfterStart;  // 切换到第二段字幕
          currentPauses = pauseAfterStart;
        } else {
          // 第二段打完，进入Scene 2（图片场景）
          sceneStep = 2;
          sceneTimer = 0;
          lineIdx = 0;
          charIdx = 0;
        }
      }
    }
  }

  let toDisplay = line.substring(0, charIdx);
  text(toDisplay, width / 2, height / 2);
}

// 绘制高亮多边形和打字机文字
function drawHighlightedRegion(drawW, drawH) {
  if (showingWordRegionIdx < 0) return;
  
  let region = regions[showingWordRegionIdx];
  let offsetX = width/2 - drawW/2;
  let offsetY = height/2 - drawH/2;
  let scaleX = drawW / bgImg.width;
  let scaleY = drawH / bgImg.height;
  
  if (charIdx < region.name.length) {
    if (frameCount % typeInterval === 0) {
      charIdx++;
    }
  } else {
    wordDisplayTimer++;
    if (wordDisplayTimer >= 120) {
      showingWordRegionIdx = -1;
      charIdx = 0;
      wordDisplayTimer = 0;
    }
  }
  
  push();
  fill(255, 80);
  stroke(255, 255);
  strokeWeight(3);
  beginShape();
  for (let pt of region.points) {
    let sx = offsetX + pt.x * scaleX;
    let sy = offsetY + pt.y * scaleY;
    vertex(sx, sy);
  }
  endShape(CLOSE);
  pop();
  
  let labelX = offsetX + region.labelX * scaleX;
  let labelY = offsetY + region.labelY * scaleY;
  let toDisplay = region.name.substring(0, charIdx);
  textAlign(CENTER, CENTER);
  textSize(36);
  textStyle(NORMAL);
  fill(255);
  text(toDisplay, labelX, labelY);
}

// 点在多边形内判断（ray casting 算法）
function pointInPolygon(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x;
    let yi = polygon[i].y;
    let xj = polygon[j].x;
    let yj = polygon[j].y;
    
    let intersect = ((yi > py) !== (yj > py));
    if (intersect) {
      if (px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
  }
  return inside;
}

// ============ 显示预渲染的像素化图像 ============
function drawPixelation(pixelLevel, drawW, drawH) {
  image(pixelatedGraphics[pixelLevel], width/2, height/2, drawW, drawH);
}

// ============ 优化后的放大镜效果（使用预渲染图像）============
function drawPixelationWithMagnifier(pixelLevel, clearBlock, drawW, drawH, clearDist) {
  // 显示当前等级的预渲染像素化背景
  image(pixelatedGraphics[pixelLevel], width/2, height/2, drawW, drawH);
  
  // 只在鼠标周围区域绘制清晰像素
  let offsetX = width/2 - drawW/2;
  let offsetY = height/2 - drawH/2;
  let scaleX = drawW / bgImg.width;
  let scaleY = drawH / bgImg.height;
  
  let imgMouseX = map(mouseX, offsetX, offsetX + drawW, 0, bgImg.width);
  let imgMouseY = map(mouseY, offsetY, offsetY + drawH, 0, bgImg.height);
  
  let imgClearRadius = clearDist / scaleX;
  
  let startX = int(max(0, imgMouseX - imgClearRadius));
  let startY = int(max(0, imgMouseY - imgClearRadius));
  let endX = int(min(bgImg.width, imgMouseX + imgClearRadius));
  let endY = int(min(bgImg.height, imgMouseY + imgClearRadius));
  
  startX = int(startX / clearBlock) * clearBlock;
  startY = int(startY / clearBlock) * clearBlock;
  
  bgImg.loadPixels();
  noStroke();
  
  for (let y = startY; y < endY; y += clearBlock) {
    for (let x = startX; x < endX; x += clearBlock) {
      let idx = 4 * (y * bgImg.width + x);
      let r = bgImg.pixels[idx];
      let g = bgImg.pixels[idx + 1];
      let b = bgImg.pixels[idx + 2];
      let px = offsetX + x * scaleX;
      let py = offsetY + y * scaleY;
      let w = clearBlock * scaleX;
      let h = clearBlock * scaleY;
      fill(r, g, b);
      rect(px, py, w, h);
    }
  }

  // 绘制放大镜边框
  push();
  noFill();
  stroke(255);
  strokeWeight(6);
  rectMode(CENTER);
  rect(mouseX, mouseY, clearDist * 2, clearDist * 2);
  pop();
}

function blinkPixelation(imgA, drawW, drawH) {
  let phase = sceneTimer;
  let alpha = 0;
  if (phase < 60) {
    alpha = map(phase, 0, 60, 0, 255);
    image(imgA, width/2, height/2, drawW, drawH);
  } else {
    alpha = map(phase, 60, 120, 255, 0);
    drawPixelation(0, drawW, drawH);  // 使用最小的马赛克开始
  }
  push();
  fill(0, alpha);
  noStroke();
  rect(0, 0, width, height);
  pop();
}

function blinkTransition(imgA, imgB, drawW, drawH) {
  let phase = sceneTimer;
  let alpha = 0;
  if (phase < 60) {
    alpha = map(phase, 0, 60, 0, 255);
    image(imgA, width/2, height/2, drawW, drawH);
  }
  else {
    alpha = map(phase, 60, 120, 255, 0);
    image(imgB, width/2, height/2, drawW, drawH);
  }
  push();
  fill(0, alpha);
  noStroke();
  rect(0, 0, width, height);
  pop();
}

function drawCountdown(sec) {
  textAlign(LEFT, TOP);
  textSize(64);
  textStyle(BOLD);
  fill(255, 0, 0);
  text(sec + "s", 100, 75);
}

function drawSubtitle(txt) {
  textAlign(CENTER, CENTER);
  textSize(36);
  textStyle(NORMAL);
  fill(255);
  text(txt, width/2, height * 0.8);
}

//播放音频（只播放一次）
function playAudioOnce(audioObject, audioKey) {
  if (hasPlayedAudio[audioKey] === undefined) {
    audioObject.play();
    hasPlayedAudio[audioKey] = true;
  }
}

function mousePressed() {
  // Scene 0: 点击START按钮
  if (sceneStep === 0) {
    if (mouseX > btnX) {
      if (mouseX < btnX + btnW) {
        if (mouseY > btnY) {
          if (mouseY < btnY + btnH) {
            sceneStep = 1;
            lineIdx = 0;
            charIdx = 0;
            sceneTimer = 0;
          }
        }
      }
    }
  }
  // Scene 9: 点击区域显示单词
  else if (sceneStep === 9) {
    let imgMouseX = map(mouseX, width/2 - (width - 100)/2, width/2 + (width - 100)/2, 0, bgImg.width);
    let imgMouseY = map(mouseY, height/2 - (height - 100)/2, height/2 + (height - 100)/2, 0, bgImg.height);
    
    for (let i = 0; i < regions.length; i = i + 1) {
      if (pointInPolygon(imgMouseX, imgMouseY, regions[i].points)) {
        showingWordRegionIdx = i;
        charIdx = 0;
        wordDisplayTimer = 0;
        learnedRegions[regions[i].name] = true;
        break;
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  btnX = width / 2 - btnW / 2;
  btnY = height / 2 + 50;
}

// ============ 调试快捷键 ============
function keyPressed() {
  if (key === '0') { sceneStep = 0; sceneTimer = 0; lineIdx = 0; charIdx = 0; }
  if (key === '1') { sceneStep = 1; sceneTimer = 0; lineIdx = 0; charIdx = 0; }
  if (key === '2') { sceneStep = 2; sceneTimer = 0; }
  if (key === '9') { sceneStep = 9; sceneTimer = 0; }
  if (key === 'a') { sceneStep = 11; sceneTimer = 0; }
  if (key === 'b') { sceneStep = 12; sceneTimer = 0; fragmentsInitialized = false; }
}
