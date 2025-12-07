let bgImg, bgBlur1, bgBlur2;
let pixelatedGraphics = [];  //预渲染像素图像
let pixelSizes = [18, 28, 34, 42];  //4种马赛克大小

let capture;
let hold;//摄像头变量

let sceneStep = 0;
let sceneTimer = 0;
let typeInterval = 3;
let subtitle = "";

let drawW = 0;
let drawH = 0;

let showingWordRegionIdx = -1;
let charIdx = 0;
let wordDisplayTimer = 0;

let lineIdx = 0;     //当前字幕


//开场前字幕
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
  30,  //"OK." 
  60,  //"This is a Digital Will." 
  15,  //"These memories are what you're trying to keep" 
  30,  //"...For a thousand yrs." 
  60,  //"But a Will awakens..." 
  105,  //""And when awakened…" 
  60,  //"If you choose..." 
  30,  //"you take responsibility..." 
  90,  //"U ready?" (停顿后显示开场界面)" 
  // 120  //"U ready?" (停顿后显示开场界面)
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
let currentLines = linesBeforeStart;  //当前使用的字幕数组
let currentPauses = pauseBeforeStart;  //当前使用的停顿数组


//============ Scene3碎片变量 ============
let fragments = [];
let fragmentsInitialized = false;


//碎片（13个多边形）
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


//Scene13
let isDragging = false;
let draggedFragmentIndex = -1;
let dragOffsetX = 0;
let dragOffsetY = 0;
let doneBtn = {
  x: 0,
  y: 0,
  w: 120,
  h: 50
};


//Scene1516签名
let userName = "";
let confirmBtn = {
  x: 0,
  y: 0,
  w: 150,
  h: 50
};


//字幕配音（Scene 0-1-2）
let audios = [];
//场景音效
//let audioHeartbeat;
//let audioClock;
let hasPlayedAudio = {};


//============ Fragment ============
class Fragment {
  constructor(regionIndex, drawW, drawH, offsetX, offsetY, scaleX, scaleY) {
    this.regionIndex = regionIndex;
    this.region = regions[regionIndex];
    this.name = this.region.name;
    
    this.drawW = drawW;
    this.drawH = drawH;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    
    let sumX = 0, sumY = 0;
    for (let pt of this.region.points) {
      sumX += pt.x;
      sumY += pt.y;
    }
    this.centerX = sumX / this.region.points.length;
    this.centerY = sumY / this.region.points.length;
    
    this.startScreenX = offsetX + this.centerX * scaleX;
    this.startScreenY = offsetY + this.centerY * scaleY;
    
    //后面的单词碎片缩小
    this.fragScale = 0.35;
    
    //分布在画布边缘）
    this.calculateTargetPosition();
    
    this.screenX = this.startScreenX;
    this.screenY = this.startScreenY;
    
    //抖动
    this.trembleX = 0;
    this.trembleY = 0;
    this.trembleIntensity = 0;
    
    //每个碎片有不同的震动效果
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(1000);
    
    this.animationProgress = 0;
    
    this.alpha = 180;
    
    //预渲染这个碎片对应的原图内容
    this.createFragmentImage();
  }
  
  //计算目标位置 碎片分布在屏幕边缘
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
  
  //预渲染碎片对应的原图内容
  createFragmentImage() {
    //计算多边形边界
    let minX = this.region.points[0].x;
    let minY = this.region.points[0].y;
    let maxX = this.region.points[0].x;
    let maxY = this.region.points[0].y;
    
    for (let pt of this.region.points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }
    
    let regionW = maxX - minX;
    let regionH = maxY - minY;
    
    //创建graphics来绘制遮罩
    let maskGraphics = createGraphics(regionW, regionH);
    maskGraphics.fill(255);
    maskGraphics.noStroke();
    maskGraphics.beginShape();
    for (let pt of this.region.points) {
      maskGraphics.vertex(pt.x - minX, pt.y - minY);
    }
    maskGraphics.endShape(CLOSE);
    
    //裁剪原图对应区域
    this.fragmentImg = bgImg.get(minX, minY, regionW, regionH);
    this.fragmentImg.mask(maskGraphics);
    
    //保存边界信息
    this.imgMinX = minX;
    this.imgMinY = minY;
    this.imgW = regionW;
    this.imgH = regionH;
  }
  
  update(elapsedFrames) {
    if (this.animationProgress < 1) {
    this.animationProgress = min(1, elapsedFrames / 120);
    let easedProgress = sin(this.animationProgress * PI / 2);
    
    this.screenX = lerp(this.startScreenX, this.targetX, easedProgress);
    this.screenY = lerp(this.startScreenY, this.targetY, easedProgress);
  }
    
    if (elapsedFrames > 300) {
      let trembleTime = elapsedFrames - 300;
      this.trembleIntensity = min(25, trembleTime * 0.0025);
    }
    
    let noiseSpeed = 0.02;
    let noiseValX = noise(this.noiseOffsetX + elapsedFrames * noiseSpeed);
    let noiseValY = noise(this.noiseOffsetY + elapsedFrames * noiseSpeed);
    
    this.trembleX = (noiseValX - 0.5) * 2 * this.trembleIntensity;
    this.trembleY = (noiseValY - 0.5) * 2 * this.trembleIntensity;
  }


  
  draw(showOriginalImage = false) {
    push();
    translate(this.screenX + this.trembleX, this.screenY + this.trembleY);
    scale(this.fragScale);
    
    if (showOriginalImage) {
      //显示预渲染的碎片图像
      push();
      let displayW = this.imgW * this.scaleX;
      let displayH = this.imgH * this.scaleY;
      
      //计算偏移：让图像中心对齐碎片中心
      let imgCenterX = this.imgMinX + this.imgW / 2;
      let imgCenterY = this.imgMinY + this.imgH / 2;
      let offsetX = (imgCenterX - this.centerX) * this.scaleX;
      let offsetY = (imgCenterY - this.centerY) * this.scaleY;
      
      imageMode(CENTER);
      image(this.fragmentImg, offsetX, offsetY, displayW, displayH);
      imageMode(CORNER);
      pop();
      
      //绘制边框
      noFill();
      stroke(255);
      strokeWeight(3 / this.fragScale);
      beginShape();
      for (let pt of this.region.points) {
        let relX = (pt.x - this.centerX) * this.scaleX;
        let relY = (pt.y - this.centerY) * this.scaleY;
        vertex(relX, relY);
      }
      endShape(CLOSE);
    } else {
      //原来的白色多边形+文字
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
    }
    
    pop();
  }
}


function preload() {
  bgImg = loadImage('assets/img1.png');
  
  //加载配音
  for (let i = 0; i < 20; i = i + 1) {
    let audioNum = i + 1;
    audios[i] = loadSound('assets/Audio ' + audioNum + '.mp3');
  }
  
  //audioHeartbeat = loadSound('assets/heartbeat.mp3');
  // audioClock = loadSound('assets/clock.mp3');
}


function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.id("p5-canvas");
  canvas.parent("p5-canvas-container");
  
  pixelDensity(1);
  
  //camera（hide）
  capture = createCapture(VIDEO);
  capture.hide();
  hold = createImage(640, 480);

  
  sceneStep = 1;
  currentLines = linesBeforeStart;
  currentPauses = pauseBeforeStart;
  
  //按钮
  btnW = 200;
  btnH = 60;
  btnX = width / 2 - btnW / 2;
  btnY = height / 2 + 50;
  
  // ============ ai告诉我的优化方法：缩小图像后再模糊 ============
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
  
  // ============ 也是ai教的：预渲染多个不同大小的像素化图像 ============
  console.log("正在预渲染像素化图像...");
  for (let i = 0; i < pixelSizes.length; i++) {
    pixelatedGraphics[i] = createGraphics(bgImg.width, bgImg.height);
    preRenderPixelatedImage(pixelatedGraphics[i], pixelSizes[i]);
    console.log("预渲染完成: blockSize = " + pixelSizes[i]);
  }
  console.log("所有预渲染完成！");
  
  //设置心跳音效为循环模式 
  // audioHeartbeat.loop();
  // audioHeartbeat.pause();
  
  //设置时钟音效为循环模式
  //audioClock.loop();
  //audioClock.pause();
}


// ============ 👍：预渲染像素化图像 ============
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


//获取当前像素化是四档的哪一档
function getCurrentPixelLevel(timer, totalFrames) {
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
  if (imgAspect > canvasAspect) {
    drawW = availableW;
    drawH = availableW / imgAspect;
  } else {
    drawH = availableH;
    drawW = availableH * imgAspect;
  }
  imageMode(CENTER);


  //标题按钮
  if (sceneStep === 0) {
    drawStartScreen();
  }
  //字幕
  else if (sceneStep === 1) {
    runTypewriter();
  }
  //清晰图片和字幕
  else if (sceneStep === 2) {
    playAudioOnce(audios[13], 'take_a_close_look');
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
    playAudioOnce(audios[14], 'never_get_back');
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
    blink1
    // if (sceneTimer === 0) {
    //   playAudioOnce(audioHeartbeat, 'blink1_heartbeat');
    // }
    blinkTransition(bgImg, bgBlur1, drawW, drawH);
    sceneTimer++;
    if (sceneTimer > 120) {
      sceneStep = 7; sceneTimer = 0;
    }
  }
  else if (sceneStep === 7) {
    //blink2
    // if (sceneTimer === 0) {
    //   playAudioOnce(audioHeartbeat, 'blink2_heartbeat');
    // }
    blinkTransition(bgBlur1, bgBlur2, drawW, drawH);
    sceneTimer++;
    if (sceneTimer > 120) {
      sceneStep = 8; sceneTimer = 0;
    }
  }
  else if (sceneStep === 8) {
    //blink3
    // if (sceneTimer === 0) {
    //   playAudioOnce(audioHeartbeat, 'blink3_heartbeat');
    // }
    blinkPixelation(bgBlur2, drawW, drawH);
    sceneTimer++;
    if (sceneTimer > 120) {
     // audioHeartbeat.pause();
      sceneStep = 9; sceneTimer = 0;
    }
  }
    else if (sceneStep === 9) { 
    let totalFrames = 1500;
    let pixelLevel = getCurrentPixelLevel(sceneTimer, totalFrames);
    let clearBlock = 4;
    let clearDist = 80;
    
    drawPixelationWithMagnifier(pixelLevel, clearBlock, drawW, drawH, clearDist);
    
    // 三段音频和字幕
    if (sceneTimer < 240) {  // 0-240帧（4秒）
      if (sceneTimer === 0) {
        playAudioOnce(audios[15], 'memorize');
      }
      drawSubtitle("Memorize every detail.");
    } else if (sceneTimer < 420) {  // 240-420帧（3秒）
      if (sceneTimer === 240) {
        playAudioOnce(audios[16], 'move');
      }
      drawSubtitle("Move and tap your mouse.");
    } else if (sceneTimer < 540) {
      if (sceneTimer === 420) {
        playAudioOnce(audios[17], 'try');
      }
      drawSubtitle("Try.");
    }
    
    let remainingFrames = totalFrames - sceneTimer;
    drawCountdown(ceil(remainingFrames / 60));
    
    if (showingWordRegionIdx >= 0) {
      drawHighlightedRegion(drawW, drawH);
    }
    
    sceneTimer++;
    
    if (sceneTimer >= totalFrames) {
      sceneStep = 10;
      sceneTimer = 0;
    }
  }
  
  // Scene 10: 放大镜结束后的两句字幕
  else if (sceneStep === 10) {
    
    if (sceneTimer < 180) {
      if (sceneTimer === 1) {
        playAudioOnce(audios[18], 'you_remember');
      }
      drawSubtitle("You remember… only when you look.");
    }
    else if (sceneTimer < 360) {
      if (sceneTimer === 180) {
        playAudioOnce(audios[19], 'memory_decays');
      }
      drawSubtitle("Memory decays when ignored.");
    }
    else {
      // 进入Scene 11（闪烁）
      sceneStep = 11;
      sceneTimer = 0;
    }
    sceneTimer++;
  }
  //闪烁
  else if (sceneStep === 11) {
    let t = sceneTimer;
    let deathDuration = 210;
    
    //抖动幅度不断变大
    let shakeAmp = map(t, 0, deathDuration, 0, 15);
    let shakeX = sin(t * 0.3) * shakeAmp;
    let shakeY = cos(t * 0.45) * shakeAmp;
    
    push();
    translate(shakeX, shakeY);
    
    //最模糊的像素图（pixelSize42）
    image(pixelatedGraphics[3], width/2, height/2, drawW, drawH);
    
    //在图像上绘制所有区域标注名称（黑白快速闪烁）
    let offsetX = width/2 - drawW/2;
    let offsetY = height/2 - drawH/2;
    let scaleX = drawW / bgImg.width;
    let scaleY = drawH / bgImg.height;
    
    for (let i = 0; i < regions.length; i++) {
      let region = regions[i];
      
      //用noise生成快速闪烁
      let noiseVal = noise(region.noiseOffset + t * 0.5);
      let polygonAlpha = map(noiseVal, 0, 1, 30, 200);
      
      //多边形边框也黑白切换
      push();
      let grayValue;
      if (noiseVal > 0.5) {
        grayValue = 255;
      } else {
        grayValue = 0;
      }
      
      fill(grayValue, polygonAlpha * 0.6); //多边形填充的透明度
      stroke(grayValue, polygonAlpha);//多边形的边框


      strokeWeight(3);
      beginShape();
      for (let pt of region.points) {
        let sx = offsetX + pt.x * scaleX;
        let sy = offsetY + pt.y * scaleY;
        vertex(sx, sy);
      }
      endShape(CLOSE);
      pop();
      
      //区域名称（文字保持白色）
      let labelX = offsetX + region.labelX * scaleX;
      let labelY = offsetY + region.labelY * scaleY;
      push();
      fill(255, polygonAlpha * 1.2);
      stroke(0, polygonAlpha * 0.8);
      strokeWeight(3);
      textAlign(CENTER, CENTER);
      textSize(32);
      textStyle(NORMAL);
      text(region.name, labelX, labelY);
      pop();
    }
    pop();
    
    sceneTimer++;
    if (sceneTimer > deathDuration) {
      // 进入碎片化阶段
      sceneStep = 12;
      sceneTimer = 0;
      fragmentsInitialized = false;
    }
  }
  //裂开
  else if (sceneStep === 12) {
    let offsetX = width/2 - drawW/2;
    let offsetY = height/2 - drawH/2;
    let scaleX = drawW / bgImg.width;
    let scaleY = drawH / bgImg.height;
    
    //初始化碎片
    if (fragmentsInitialized === false) {
      fragments = [];
      for (let i = 0; i < regions.length; i++) {
        fragments.push(new Fragment(i, drawW, drawH, offsetX, offsetY, scaleX, scaleY));
      }
      fragmentsInitialized = true;
    }
    
    //显示碎片
    let elapsedFrames = sceneTimer;
    
    //更新并绘制所有碎片
    for (let frag of fragments) {
      frag.update(elapsedFrames);
      frag.draw();
    }
    //开始的半秒白色闪光叠加在碎片之上
    if (sceneTimer < 30) {
      let flashAlpha = map(sceneTimer, 0, 30, 220, 0);
      push();
      fill(255, flashAlpha);
      noStroke();
      rect(0, 0, width, height);
      pop();
    }
        //字幕
    if (sceneTimer >= 30) {
      if (sceneTimer < 210) {
        drawSubtitle("Time separates meaning into pieces.");
      } else if (sceneTimer < 390) {
        drawSubtitle("It will not wait.");
      } else if (sceneTimer < 570) {
        drawSubtitle("Try to fix your memory.");
      } else if (sceneTimer < 750) {
        drawSubtitle("Even if it cannot be perfect.");
      } else {
        //进入拼图阶段
        sceneStep = 13;
        sceneTimer = 0;
      }
    }
    sceneTimer++;
  }
    //尝试复原memory
  else if (sceneStep === 13) {
    //继续更新碎片（保持抖动）
    let elapsedFrames = sceneTimer;
    
    for (let i = 0; i < fragments.length; i++) {
      let frag = fragments[i];
      
      //更新抖动效果
      frag.update(elapsedFrames);
      
      //如果正在拖动这个碎片，覆盖位置
      if (isDragging && draggedFragmentIndex === i) {
        frag.screenX = mouseX + dragOffsetX;
        frag.screenY = mouseY + dragOffsetY;
      }
      
      frag.draw();
    }
    
    //Done按钮
    doneBtn.x = width - doneBtn.w - 30;
    doneBtn.y = 30;
    
    let isBtnHover = mouseX > doneBtn.x && mouseX < doneBtn.x + doneBtn.w &&
                     mouseY > doneBtn.y && mouseY < doneBtn.y + doneBtn.h;
    
    push();
    if (isBtnHover) {
      fill(255);
      stroke(255);
    } else {
      noFill();
      stroke(255);
    }
    strokeWeight(3);
    rect(doneBtn.x, doneBtn.y, doneBtn.w, doneBtn.h, 8);
    
    fill(isBtnHover ? 0 : 255);
    textAlign(CENTER, CENTER);
    textSize(24);
    textStyle(NORMAL);
    text("DONE", doneBtn.x + doneBtn.w / 2, doneBtn.y + doneBtn.h / 2);
    pop();
    
    sceneTimer++;
  }
  //点击Done后碎片显示原图内容并闪烁
  else if (sceneStep === 14) {
    let t = sceneTimer;
    
    //碎片依旧要抖动
    for (let frag of fragments) {
      frag.update(t);
    }
    
    //前180碎片显示原图内容并闪烁
    if (t < 180) {
      for (let frag of fragments) {
        frag.draw(true);  //传入true显示原图
      }
      //闪烁
      let flashAlpha = (sin(t * 0.3) * 0.5 + 0.5) * 150;
      push();
      fill(255, flashAlpha);
      noStroke();
      rect(0, 0, width, height);
      pop();
    }
    //全白（180-210帧，0.5秒）
    else if (t < 210) {
      push();
      fill(255);
      noStroke();
      rect(0, 0, width, height);
      pop();
    }
    //全黑（210帧之后）
    else if (t < 240) {
      background(0);
    }
    //进入签名字幕
    else {
      sceneStep = 15;
      sceneTimer = 0;
    }
    sceneTimer++;
  }
    //输入名字
  else if (sceneStep === 15) {
    //标题
    textAlign(CENTER, CENTER);
    textSize(48);
    textStyle(NORMAL);
    fill(255);
    text("Sign your digital will", width / 2, height / 2 - 120);
    
    //提示文字
    textSize(32);
    text("Type your name here:", width / 2, height / 2 - 40);
    
    //输入框
    push();
    noFill();
    stroke(255);
    strokeWeight(2);
    let boxW = 400;
    let boxH = 50;
    let boxX = width / 2 - boxW / 2;
    let boxY = height / 2 + 10;
    rect(boxX, boxY, boxW, boxH);
    pop();
    
    //显示用户输入的名字
    push();
    fill(255);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(32);
    text(userName, boxX + 10, boxY + boxH / 2);
    pop();
    
    //闪烁光标
    if (frameCount % 30 < 15) {
      push();
      fill(255);
      noStroke();
      let cursorX = boxX + 10 + textWidth(userName);
      rect(cursorX, boxY + 10, 2, 30);
      pop();
    }
    
    //Confirm按钮
    confirmBtn.w = 150;
    confirmBtn.h = 50;
    confirmBtn.x = width / 2 - confirmBtn.w / 2;
    confirmBtn.y = boxY + 80;
    
    let isBtnHover = mouseX > confirmBtn.x && mouseX < confirmBtn.x + confirmBtn.w &&
                     mouseY > confirmBtn.y && mouseY < confirmBtn.y + confirmBtn.h;
    
    push();
    if (isBtnHover) {
      fill(255);
      stroke(255);
    } else {
      noFill();
      stroke(255);
    }
    strokeWeight(3);
    rect(confirmBtn.x, confirmBtn.y, confirmBtn.w, confirmBtn.h, 8);
    
    fill(isBtnHover ? 0 : 255);
    textAlign(CENTER, CENTER);
    textSize(24);
    textStyle(NORMAL);
    text("CONFIRM", confirmBtn.x + confirmBtn.w / 2, confirmBtn.y + confirmBtn.h / 2);
    pop();
  }
    //Scene 16: 字幕（打字机）
  else if (sceneStep === 16) {
    if (sceneTimer < 210) {
      //第一句字幕
      let line1 = "When you look at memories,";
      let line2 = "memories look at you.";
      
      textAlign(CENTER, CENTER);
      textSize(42);
      textStyle(NORMAL);
      fill(255);
      
      //第一行打字机
      if (sceneTimer < 70) {
        let charCount1 = floor(sceneTimer / 3);
        text(line1.substring(0, charCount1), width / 2, height / 2 - 30);
      } else {
        text(line1, width / 2, height / 2 - 30);
        //第二行打字机
        let charCount2 = floor((sceneTimer - 70) / 3);
        text(line2.substring(0, charCount2), width / 2, height / 2 + 30);
      }
    }
    else if (sceneTimer < 420) {
      //第二句字幕
      let line1 = "When you awaken a memory,";
      let line2 = "you become a part of it.";
      
      textAlign(CENTER, CENTER);
      textSize(42);
      textStyle(NORMAL);
      fill(255);
      
      let offset = sceneTimer - 210;
      
      //第一行打字机
      if (offset < 70) {
        let charCount1 = floor(offset / 3);
        text(line1.substring(0, charCount1), width / 2, height / 2 - 30);
      } else {
        text(line1, width / 2, height / 2 - 30);
        //第二行打字机
        let charCount2 = floor((offset - 70) / 3);
        text(line2.substring(0, charCount2), width / 2, height / 2 + 30);
      }
    }
    else {
      sceneStep = 17;
      sceneTimer = 0;
    }
    sceneTimer++;
  }
      //Scene 17: 拍照
    //Scene 17: 拍照
  else if (sceneStep === 17) {
    let camW = min(width * 0.8, 640);
    let camH = camW * (capture.height / capture.width);
    
    //前90帧显示实时摄像头（1.5秒）
    if (sceneTimer < 90) {
      push();
      imageMode(CENTER);
      image(capture, width / 2, height / 2, camW, camH);
      pop();
    }
    //第90帧拍照
    else if (sceneTimer === 90) {
      hold = capture.get(0, 0, capture.width, capture.height);
    }
    //拍照后显示定格画面（1秒）
    else if (sceneTimer > 90 && sceneTimer <= 150) {
      //显示定格照片
      push();
      imageMode(CENTER);
      image(hold, width / 2, height / 2, camW, camH);
      pop();
      
      //显示用户名字
      textAlign(CENTER, BOTTOM);
      textSize(48);
      textStyle(BOLD);
      fill(255);
      text(userName, width / 2, height * 0.9);
    }
    //150帧后开始像素块化（1.5秒）
    else if (sceneTimer > 150 && sceneTimer <= 240) {
      //像素块化（逐渐变大）
      let pixelProgress = sceneTimer - 150;
      let blockSize = floor(map(pixelProgress, 0, 90, 1, 20));
      
      push();
      imageMode(CENTER);
      hold.loadPixels();
      
      //创建临时graphics来绘制像素化
      let pixelatedImg = createGraphics(hold.width, hold.height);
      pixelatedImg.noStroke();
      
      for (let y = 0; y < hold.height; y += blockSize) {
        for (let x = 0; x < hold.width; x += blockSize) {
          let idx = 4 * (y * hold.width + x);
          let r = hold.pixels[idx];
          let g = hold.pixels[idx + 1];
          let b = hold.pixels[idx + 2];
          pixelatedImg.fill(r, g, b);
          pixelatedImg.rect(x, y, blockSize, blockSize);
        }
      }
      
      image(pixelatedImg, width / 2, height / 2, camW, camH);
      pop();
      
      //显示用户名字
      textAlign(CENTER, BOTTOM);
      textSize(48);
      textStyle(BOLD);
      fill(255);
      text(userName, width / 2, height * 0.9);
    }
    //240帧后爆裂效果
    else if (sceneTimer > 240) {
      let explodeProgress = sceneTimer - 240;
      
      hold.loadPixels();
      let s = 20; //像素块大小
      
      let imgLeft = width / 2 - camW / 2;
      let imgTop = height / 2 - camH / 2;
      
      //绘制爆裂的像素块
      for (let x = 0; x < hold.width; x += s) {
        for (let y = 0; y < hold.height; y += s) {
          let idx = (x + y * hold.width) * 4;
          let r = hold.pixels[idx + 0];
          let g = hold.pixels[idx + 1];
          let b = hold.pixels[idx + 2];
          
          //计算亮度
          let brightness = (r + g + b) / 3;
          
          //基于亮度计算位移和缩放
          let maxOffset = map(explodeProgress, 0, 90, 0, 400);
          let offset = map(brightness, 0, 255, maxOffset, 0);
          
          //计算偏移方向（从中心向外）
          let centerX = hold.width / 2;
          let centerY = hold.height / 2;
          let angle = atan2(y - centerY, x - centerX);
          let offsetX = cos(angle) * offset;
          let offsetY = sin(angle) * offset;
          
          //计算缩放（亮的块更小，模拟远离感）
          let scale = map(brightness, 0, 255, 1.2, 0.5);
          
          push();
          let screenX = imgLeft + (x / hold.width) * camW + offsetX;
          let screenY = imgTop + (y / hold.height) * camH + offsetY;
          
          translate(screenX, screenY);
          fill(r, g, b);
          noStroke();
          let blockW = (s / hold.width) * camW * scale;
          let blockH = (s / hold.height) * camH * scale;
          rect(0, 0, blockW, blockH);
          pop();
        }
      }
      
      //爆裂开始后3秒（180帧）显示字幕（打字机效果）
      if (explodeProgress > 180 && explodeProgress <= 520) {
        let subtitleProgress = explodeProgress - 180;
        let line1 = "Memory of self is the first to fade.";
        let line2 = "Dear Future Me, this is what I tried to keep.";
        
        push();
        textAlign(CENTER, CENTER);
        textSize(42);
        textStyle(NORMAL);
        fill(255);
        
        //第一行打字机（100帧）
        if (subtitleProgress < 100) {
          let charCount1 = floor(subtitleProgress / 3);
          text(line1.substring(0, charCount1), width / 2, height / 2 - 30);
        } 
        //第二行打字机（90帧）
        else if (subtitleProgress < 190) {
          text(line1, width / 2, height / 2 - 30);
          let charCount2 = floor((subtitleProgress - 100) / 3);
          text(line2.substring(0, charCount2), width / 2, height / 2 + 30);
        }
        //打完后停顿2.5秒（150帧），总共190+150=340帧
        else {
          text(line1, width / 2, height / 2 - 30);
          text(line2, width / 2, height / 2 + 30);
        }
        pop();
      }
      //字幕像素化（340+180=520-700帧，3秒）
      else if (explodeProgress > 520 && explodeProgress <= 700) {
        let pixelTextProgress = explodeProgress - 520;
        let line1 = "Memory of self is the first to fade.";
        let line2 = "Dear Future Me, this is what I tried to keep.";
        
        //计算像素化程度（3秒=180帧）
        let pixelSize = map(pixelTextProgress, 0, 180, 1, 30);
        pixelSize = constrain(pixelSize, 1, 30);
        
        push();
        textAlign(CENTER, CENTER);
        textSize(42);
        textStyle(NORMAL);
        
        //创建临时graphics来绘制文字
        let textGraphics = createGraphics(width, height);
        textGraphics.textAlign(CENTER, CENTER);
        textGraphics.textSize(42);
        textGraphics.textStyle(NORMAL);
        textGraphics.fill(255);
        textGraphics.text(line1, width / 2, height / 2 - 30);
        textGraphics.text(line2, width / 2, height / 2 + 30);
        
        //像素化文字
        textGraphics.loadPixels();
        noStroke();
        
        for (let y = height / 2 - 100; y < height / 2 + 100; y += pixelSize) {
          for (let x = width / 2 - 400; x < width / 2 + 400; x += pixelSize) {
            let idx = 4 * (floor(x) + floor(y) * width);
            let r = textGraphics.pixels[idx];
            let g = textGraphics.pixels[idx + 1];
            let b = textGraphics.pixels[idx + 2];
            let a = textGraphics.pixels[idx + 3];
            
            if (a > 0) {
              fill(r, g, b, a);
              rect(x, y, pixelSize, pixelSize);
            }
          }
        }
        pop();
      }
      //700帧后全黑
      else if (explodeProgress > 700 && explodeProgress <= 730) {
        background(0);
      }
      //730帧后打字机显示"Digital Will."
      else if (explodeProgress > 730) {
        background(0);
        let finalTextProgress = explodeProgress - 730;
        let finalText = "Digital Will.";
        
        push();
        textAlign(CENTER, CENTER);
        textSize(72);
        textStyle(NORMAL);
        fill(255);
        
        let charCount = floor(finalTextProgress / 4);
        text(finalText.substring(0, charCount), width / 2, height / 2);
        pop();
      }
    }
    sceneTimer++;
  }
}


//标题+按钮
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


//打字机字幕
function runTypewriter() {
  textAlign(CENTER, CENTER);
  textSize(36);
  textStyle(NORMAL);
  fill(255);
  
  let line = currentLines[lineIdx];
  let currentPause = currentPauses[lineIdx];
  
  // 打字机效果
  if (charIdx < line.length) {
    // ✅ 简化：只在 charIdx 等于 0 时播放
    if (charIdx === 0) {
      let audioIndex = lineIdx;
      if (currentLines === linesAfterStart) {
        audioIndex = audioIndex + linesBeforeStart.length;
      }
      if (lineIdx > 0 || currentLines === linesAfterStart) {
      playAudioOnce(audios[audioIndex], 'scene1_' + audioIndex);
      }
    }
    
    if (frameCount % 4 === 0) {
      charIdx++;
    }
  } else {
    // 停顿
    if (sceneTimer < currentPause) {
      sceneTimer++;
    } else {
      // 切换到下一行
      lineIdx++;
      charIdx = 0;
      sceneTimer = 0;
      
      if (lineIdx >= currentLines.length) {
        if (currentLines === linesBeforeStart) {
          // 第一段字幕播完，显示按钮界面
          sceneStep = 0;
          sceneTimer = 0;
          lineIdx = 0;
          charIdx = 0;
        } else {
          // 第二段字幕播完，进入Scene 2
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

//计算点在哪个碎片内
//（ai教的ray casting 算法）
//即从点出发画一条水平射线，这条射线穿过多边形边界奇数次则点在多边形内部，偶数次外部
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


// ============ ai教的减小计算量的方法：显示预渲染的像素化图像 ============
function drawPixelation(pixelLevel, drawW, drawH) {
  image(pixelatedGraphics[pixelLevel], width/2, height/2, drawW, drawH);
}


//放大镜效果
function drawPixelationWithMagnifier(pixelLevel, clearBlock, drawW, drawH, clearDist) {
  image(pixelatedGraphics[pixelLevel], width/2, height/2, drawW, drawH);
  
  //只在鼠标周围绘制清晰像素
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


  //放大镜边框
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
    drawPixelation(0, drawW, drawH);
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
    if (mouseX > btnX && mouseX < btnX + btnW) {
      if (mouseY > btnY && mouseY < btnY + btnH) {
        sceneStep = 1;
        lineIdx = 0;
        charIdx = 0;
        sceneTimer = 0;
        // 切换到第二段字幕
        currentLines = linesAfterStart;
        currentPauses = pauseAfterStart;
      }
    }
  }

  // Scene 9: 点击区域显示单词
  else if (sceneStep === 9) {
    let offsetX = width/2 - drawW/2;
    let offsetY = height/2 - drawH/2;
    let scaleX = drawW / bgImg.width;
    let scaleY = drawH / bgImg.height;
    
    let imgMouseX = map(mouseX, offsetX, offsetX + drawW, 0, bgImg.width);
    let imgMouseY = map(mouseY, offsetY, offsetY + drawH, 0, bgImg.height);
    
    for (let i = 0; i < regions.length; i++) {
      if (pointInPolygon(imgMouseX, imgMouseY, regions[i].points)) {
        showingWordRegionIdx = i;
        charIdx = 0;
        wordDisplayTimer = 0;
        learnedRegions[regions[i].name] = true;
        break;
      }
    }
  }
  
  // Scene 13: 拖动碎片或点击Done
  else if (sceneStep === 13) {
    //是否点击Done按钮
    if (mouseX > doneBtn.x && mouseX < doneBtn.x + doneBtn.w &&
        mouseY > doneBtn.y && mouseY < doneBtn.y + doneBtn.h) {
      sceneStep = 14;
      sceneTimer = 0;
    } else {
      //是否点击了某个碎片
      for (let i = fragments.length - 1; i >= 0; i--) {
        let frag = fragments[i];
        let dist = distance(mouseX, mouseY, frag.screenX, frag.screenY);
        if (dist < 100) {
          isDragging = true;
          draggedFragmentIndex = i;
          dragOffsetX = frag.screenX - mouseX;
          dragOffsetY = frag.screenY - mouseY;
          break;
        }
      }
    }
  }
  
  // Scene 15: 点击Confirm按钮
  else if (sceneStep === 15) {
    if (mouseX > confirmBtn.x && mouseX < confirmBtn.x + confirmBtn.w &&
        mouseY > confirmBtn.y && mouseY < confirmBtn.y + confirmBtn.h) {
      sceneStep = 16;
      sceneTimer = 0;
    }
  }
}

function drawHighlightedRegion(drawW, drawH) {
  if (showingWordRegionIdx < 0) return;
  
  let region = regions[showingWordRegionIdx];
  let offsetX = width/2 - drawW/2;
  let offsetY = height/2 - drawH/2;
  let scaleX = drawW / bgImg.width;
  let scaleY = drawH / bgImg.height;
  
  // 打字机效果显示区域名称
  if (charIdx < region.name.length) {
    if (frameCount % typeInterval === 0) {
      charIdx++;
    }
  } else {
    wordDisplayTimer++;
    if (wordDisplayTimer > 120) {
      showingWordRegionIdx = -1;
      charIdx = 0;
      wordDisplayTimer = 0;
    }
  }
  
  // 绘制高亮的多边形
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
  
  // 绘制区域名称（打字机效果）
  let labelX = offsetX + region.labelX * scaleX;
  let labelY = offsetY + region.labelY * scaleY;
  let toDisplay = region.name.substring(0, charIdx);
  
  textAlign(CENTER, CENTER);
  textSize(36);
  textStyle(NORMAL);
  fill(255);
  text(toDisplay, labelX, labelY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  btnX = width / 2 - btnW / 2;
  btnY = height / 2 + 50;
}


function mouseReleased() {
  isDragging = false;
  draggedFragmentIndex = -1;
}


//计算两点距离
function distance(x1, y1, x2, y2) {
  return sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}


function keyTyped() {
  if (sceneStep === 15) {
    if ((key >= 'a' && key <= 'z') || (key >= 'A' && key <= 'Z') || 
        (key >= '0' && key <= '9') || key === ' ') {
      userName += key;
    }
  }
  return false;
}

//给自己检查用的快捷键 以及输入法那一页有些东西写在这了
function keyPressed() {
  if (key === '1') { sceneStep = 1; sceneTimer = 0; lineIdx = 0; charIdx = 0; }
  if (key === '2') { sceneStep = 2; sceneTimer = 0; }
  if (key === '3') { sceneStep = 9; sceneTimer = 0; }
  if (key === '4') { sceneStep = 11; sceneTimer = 0; }
  if (key === '5') { sceneStep = 12; sceneTimer = 0; fragmentsInitialized = false; }
  if (key === '6') { sceneStep = 13; sceneTimer = 0; }
  if (key === '7') { sceneStep = 14; sceneTimer = 0; }
  if (key === '8') { sceneStep = 15; sceneTimer = 0; userName = ""; }
  if (key === '9') { sceneStep = 16; sceneTimer = 0; }
  if (key === '0') { sceneStep = 17; sceneTimer = 0; }
  
  //Scene15删除键
  if (sceneStep === 15 && keyCode === BACKSPACE) {
    if (userName.length > 0) {
      userName = userName.substring(0, userName.length - 1);
    }
    return false;
  }
  
  //Scene15回车键进入下一步
  if (sceneStep === 15 && keyCode === ENTER) {
    sceneStep = 16;
    sceneTimer = 0;
    return false;
  }
}




/*给blog post准备的part
ai教的减小计算量的方法：显示预渲染的像素化图像;动态马赛克生成改为固定四幅
ray casting来判断鼠标点击点在多边形内部还是外部
确定坐标数值方法：ai生成网站
自己快速测试用的快捷键
credit:Fisher(library staff)
reference:爆裂开来的效果；打字机；creategraphic
*/
