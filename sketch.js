var ship, shipa = 0, shipimg, homeplanet, planets = [], collft = [], isfpressed = false, restart, rb, homeplanetimg = [], curtime = [];
var oxygenlvl = 100, fuellvl = 101, lastshipposx = 0, lastshipposy = 0, shipr = 0, plantimg, waterimg, gameState = "play", bga = [];
var oxyimg, energyimg, hometrig, energylvl = 0, waterlvl = 0, plantslvl = 0, plntscollvls = [], maxfuel = 85, maxoxygen = 80, button1;
var button2, moonimg, moonarr = [], starimg, asster = [];

function preload(){
  shipimg = loadImage("sprites/ship.png");

  plantimg = loadImage("sprites/plant.png");

  waterimg = loadImage("sprites/water.png");

  oxyimg = loadImage("sprites/oxygen.png");

  energyimg = loadImage("sprites/energy.png");

  moonimg = loadImage("sprites/moon.png");

  starimg = loadImage("sprites/star.png");

  for(var i = 1; i <= 3; i++){
    var hmpltimg = loadImage("sprites/prt" + i + ".png");
    homeplanetimg.push(hmpltimg);
  }
}

function setup() {
  createCanvas(displayWidth-40, displayHeight-160);

  angleMode(DEGREES); 

  ship = createSprite(750, 380, 30, 50);
  ship.scale = 0.3;

  homeplanet = createSprite(0, 0, 50, 50);
  homeplanet.addImage("plntprt1", homeplanetimg[0]);
  homeplanet.scale = 0.5;
  homeplanet.setCollider("circle",0,0,455);

  hometrig = createSprite(0, 0, 1, 1);
  hometrig.setCollider("circle", 0, 0, 510);

  restart = createSprite(ship.x, ship.y, 200, 50);
  restart.depth = ship.depth + 1;
  restart.shapeColor = rgb(20,25,255);
  restart.visible = false;

  button1 = createSprite(ship.x, ship.y, 200, 50);
  button1.shapeColor = rgb(20,25,255);
  button1.depth = ship.depth + 1;
  button1.visible = false;

  button2 = createSprite(ship.x, ship.y, 200, 50);
  button2.depth = ship.depth + 1;
  button2.visible = false;

  rb = createSprite(ship.x, ship.y, displayWidth * 2, displayHeight * 2);
  rb.shapeColor = ('rgba(255,0,0,0.5)');
  rb.depth = ship.depth - 1;
  rb.visible = false;

  frameRate(60);
}

function draw(){
  background(0);  
  drawSprites();

  movecollectables();

  if(gameState === "mainmenu"){
    if(frameCount === 1){
      ship.x = homeplanet.x;
      ship.y = homeplanet.y;
      ship.rotation = 90;
    }
    ship.collide(homeplanet)
    player();
    button1.visible = true;
    homeplanet.depth = ship.depth - 1;
    button1.x = homeplanet.x - 400;
    button1.y = homeplanet.y - 100;
    textFont('Copperplate');
    textSize(20);
    text("Play", button1.x - 20, button1.y + 5);
    if(ship.collide(button1) || mousePressedOver(button1)){
      frameCount = 0;
      button1.visible = false;
      gameState = "play";
    }
  }
  if(gameState === "play"){
    if(frameCount === 1){
      spawnPlanets();
      bg(50);
      spawnmoon(3);
    }
    if(frameCount > 1){
    player();
    getTime();
    allmovement();
    hideplanets();
    oxynful();
    movebg();
    hmplt();
    mm(4,0);mm(4,3);mm(5,6);
    }
  }
  if(gameState === "survival"){

  }
  else if(gameState === "end"){
    fill(255);
    textSize(20);
    text("Restart", restart.x - 30, restart.y);
    textSize(50);
    text("GameOver", restart.x - 120, restart.y - 80);
    ship.velocityX = 0;
    ship.velocityY = 0;
    rb.visible = true;
    rb.x = ship.x;
    rb.y = ship.y;
    restart.visible = true;
    restart.x = ship.x;
    restart.y = ship.y - 100;
    if(mousePressedOver(restart)){
      gameState = "play";
      reset();
    }
  }
}

function getTimeForplnt(i){
  var m = minute();
  var h = hour();
  var s = second();
  var d = day();
  localStorage.setItem(i+'planethr',h+1);
  localStorage.setItem(i+'planetsec',s);
  localStorage.setItem(i+'planetmin',m);
  localStorage.setItem(i+'planetday',d);
}

function getTime(){
  curtime = [];
  var m = minute();
  var h = hour();
  var s = second();
  var d = day();
  curtime.push({min: m, hour: h, sec: s, day: d});
}

function hmplt(){
  ship.collide(homeplanet);

  if(ship.isTouching(hometrig)){
    if(keyIsDown(UP_ARROW) === false){
      ship.attractionPoint(2, homeplanet.x, homeplanet.y);
    }
  }
  else {
    ship.attractionPoint(0, homeplanet.x, homeplanet.y);
  }

  homeplanet.depth = ship.depth - 1;

  var plmaxcol = 120;

  var roundedenergy = map(energylvl,0,plmaxcol,0,100);
  var roundedwater = map(waterlvl,0,plmaxcol,0,100);
  var roundedplants = map(plantslvl,0,plmaxcol,0,100);

  if(roundedenergy > 95){
    roundedenergy = 100;
  }
  if(roundedwater > 95){
    roundedwater = 100;
  }
  if(roundedplants > 95){
    roundedplants = 100;
  }

  fill(255);
  textFont("Copperplate");
  text("energy: " + round(roundedenergy) + "%", homeplanet.x - 80, homeplanet.y - 100);
  text("water: " + round(roundedwater) + "%", homeplanet.x - 60, homeplanet.y);
  text("oxygen: " + round(roundedplants) + "%", homeplanet.x - 80, homeplanet.y + 100);
}

function player(){ 
  ship.setCollider("rectangle", 0, 0, 150, 120);

  shipr += 0.5;
  if(shipr > 360){
    shipr = 0;
  }

  camera.position.x = ship.x;
  camera.position.y = ship.y;

  ship.addImage("ship", shipimg);

  ship.rotation = shipa;

  if(fuellvl > 0){

  //right rotation
  if(keyIsDown(RIGHT_ARROW) || keyIsDown(68)){
    shipa += 10;
  }

  //left rotation
  if(keyIsDown(LEFT_ARROW) || keyIsDown(65)){
    shipa -= 10;
  }

  //thrust
  if(keyIsDown(UP_ARROW) || keyIsDown(87) || keyIsDown(32)){
    ship.setSpeed(15, shipa - 90);
  }
  else{
    ship.setSpeed(0, shipa);
  }

  //flip
  if(keyIsDown(70) && isfpressed === false){
    isfpressed = true;
    shipa += 180;
  }
  else{
    if(frameCount % 20 === 0){
    shipa += 0;
    isfpressed = false;
    }
  }
  }
  else{
    ship.velocityX = 0;
    ship.velocityY = 0;
  }

  if(shipa > 360){
    shipa = 0;
  }

  textSize(30)
  textFont("Copperplate");
  fill("white");
  text("x: " + Math.round(ship.x) + " y: " + Math.round(ship.y), ship.x - 100, ship.y - 300);
}

function spawnPlanets(){ 
  for(var i = 0; i <= 16; i++){
   var createplanets = createSprite(200,200,200,200);
   createplanets.depth = rb.depth - 1;
   if(i<17){
   var imgi = i + 1;
   }
   var thisplanetimg = loadImage("sprites/" + imgi + ".png")
   createplanets.addImage("planet "+ i, thisplanetimg);
   var trig = createSprite(0, 0, 50, 50);
   trig.depth = createplanets.depth - 1;
   trig.setCollider("circle",0,0,440);
   trig.shapeColor = (0)
   ship.depth = createplanets.depth + 1;
   var r = random(100, 200);
   createplanets.scale = 0.75;
   planets.push(createplanets, {r}, trig);
   var oxylvl, fullvl;
   switch(i){
    case 0:
      createplanets.setCollider("circle",0,0,290);  
      spawncollectables(2,0,0,0,0);
      oxylvl = 60;
      fullvl = 85;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 1:
      createplanets.setCollider("circle",0,0,340);
      spawncollectables(0,0,2,0,1);
      oxylvl = 85;
      fullvl = 100;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 2:
      createplanets.setCollider("circle",0,0,345);
      spawncollectables(0,1,0,1,2);
      oxylvl = 100;
      fullvl = 120;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 3:
      createplanets.setCollider("circle",0,0,195);
      spawncollectables(1,0,0,0,3);
      oxylvl = 120;
      fullvl = 140;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 4:
      createplanets.setCollider("circle",0,0,340);
      spawncollectables(0,2,0,0,4);
      oxylvl = 135;
      fullvl = 150;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 5:
      createplanets.setCollider("circle",0,-13,245);
      spawncollectables(0,0,0,2,5);
      oxylvl = 150;
      fullvl = 160;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 6:
      createplanets.setCollider("circle",0,0,295);
      spawncollectables(0,2,0,0,6);
      oxylvl = 250;
      fullvl = 205;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 7:
      createplanets.setCollider("circle",-25,20,330);
      spawncollectables(0,2,0,0,7);
      oxylvl = 280;
      fullvl = 235;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 8:
      createplanets.setCollider("circle",35,-15,330);
      spawncollectables(2,0,0,0,8);
      oxylvl = 300;
      fullvl = 350;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 9:
      createplanets.setCollider("circle",-45,-15,330);
      oxylvl = 315;
      fullvl = 400;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 10:
      createplanets.setCollider("circle",0,0,275);
      spawncollectables(0,0,0,2,10);
      oxylvl = 340;
      fullvl = 360;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 11:
      createplanets.setCollider("circle",0,10,325);
      spawncollectables(0,0,0,2,11);
      oxylvl = 400;
      fullvl = 410;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 12:
      createplanets.setCollider("circle",0,0,325);
      spawncollectables(0,0,3,0,12);
      oxylvl = 420;
      fullvl = 430;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 13:
      createplanets.setCollider("circle",0,0,325);
      spawncollectables(2,0,0,0,13);
      oxylvl = 430;
      fullvl = 430;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 14:
      createplanets.setCollider("circle",-20,0,325);
      spawncollectables(0,5,0,0,14);
      oxylvl = 437;
      fullvl = 442;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 15:
      createplanets.setCollider("circle",0,0,325);
      spawncollectables(5,0,0,0,15);
      oxylvl = 442;
      fullvl = 450;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 16:
      createplanets.setCollider("circle",-33,-13,333);
      spawncollectables(0,0,0,5,16);
      oxylvl = 450;
      fullvl = 461;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    }
  }
}

function allmovement(){
  for(var i = 0; i < planets.length; i+=3){
    if(localStorage.getItem(i+'planetregen') === null){
      localStorage.setItem(i+'planetregen', 0)
    }
    if(plntscollvls[i/3].oxy < plntscollvls[i/3].maxoxy || plntscollvls[i/3].ful < plntscollvls[i/3].maxful){
      if(localStorage.getItem(i+'planetregen') < 1){
        getTimeForplnt(i);
        localStorage.setItem(i+'planetregen',1)
        console.log(localStorage.getItem(i+'planetregen'));
      }
    }
    if(localStorage.getItem(i+'planetregen') > 0){
      var sec = localStorage.getItem(i+'planetsec');
      var min = localStorage.getItem(i+'planetmin');
      var hr = localStorage.getItem(i+'planethr');
      var day = localStorage.getItem(i+'planetday');
      if(day <= curtime[0].day){
        if(hr <= curtime[0].hour){
          if(min <= curtime[0].min){
            if(sec < curtime[0].sec){
              localStorage.setItem(i+'plntoxy',plntscollvls[i/3].maxoxy);
              localStorage.setItem(i+'plntful',plntscollvls[i/3].maxful);
              localStorage.setItem(i+'planetregen',0);
              localStorage.setItem(i+'planetsec',0);
              localStorage.setItem(i+'planetmin',0);
              localStorage.setItem(i+'planethr',0);
              console.log("clear");
           }
          }
        }
      }
    }
    if(localStorage.getItem(i+'planethr') > 24){
      var r = localStorage.getItem(i+'planethr') % 12;
      localStorage.setItem(i+'planethr',r);
    }
    if(localStorage.getItem(i+'planetsec') > 59){
      var r = localStorage.getItem(i+'planetsec') % 60;
      localStorage.setItem(i+'planetsec',r);
    }
    if(localStorage.getItem(i+'planetmin') > 59){
      var r = localStorage.getItem(i+'planetmin') % 60;
      localStorage.setItem(i+'planetmin',r);
    }

    if(frameCount === 2){
      planets[i].x = cos(homeplanet.rotation) * (1600 * i + 1600);
      planets[i].y = sin(homeplanet.rotation) * (1600 * i + 1600);
    }

    switch(i){
      case 0:
        planets[0].x = -1346*1.5;
        planets[0].y = 701*1.5;
      case 3:
        planets[3].x = -90*1.5;
        planets[3].y = 1280*1.5;
      case 6:
        planets[6].x = -2684*1.5;
        planets[6].y = -26*1.5;
      case 9: 
        planets[9].x = -3126*1.5;
        planets[9].y = 1627*1.5;
      case 12:
        planets[12].x = 1682*1.5;
        planets[12].y = -776*1.5;
      case 15:
        planets[15].x = 3488*1.5;
        planets[15].y = 1204*1.5;
      case 18: 
        planets[18].x = -2976*1.5;
        planets[18].y = -4188*1.5;
      case 21: 
        planets[21].x = 994*1.5;
        planets[21].y = -5879*1.5;
      case 24: 
        planets[24].x = -5414*1.5;
        planets[24].y = -6122*1.5;
      case 27:
        planets[27].x = -1646*1.5;
        planets[27].y = -8066*1.5;
      case 30:
        planets[27].x = 6208*1.5;
        planets[27].y = -6959*1.5
      case 33:
        planets[33].x = -4274*1.5;
        planets[33].y = -11676*1.5
      case 36:
        planets[36].x = 8008*1.5;
        planets[36].y = -10567*1.5;
      case 39:
        planets[39].x = 1932*1.5;
        planets[39].y = -14416*1.5;
      case 42:
        planets[42].x = 1870*1.5;
        planets[42].y = -17922*1.5;
      case 45:
        planets[45].x = 4172*1.5;
        planets[45].y = -17920*1.5;
      case 48:
        planets[48].x = 4450*1.5;
        planets[48].y = -22085*1.5;
    }
    //var rndoxylvl = map(plntscollvls[0].oxy, 0, plntscollvls[0].oxy, 0, 100);
    //var rndfullvl = map(plntscollvls[0].ful, 0, plntscollvls[0].ful, 0, 100);
    var oxyplntlvl,fulplntlvl;
    if(localStorage.getItem(i+'plntoxy') === null){
      localStorage.setItem(i+'plntoxy',plntscollvls[i/3].oxy);
      localStorage.setItem(i+'plntful',plntscollvls[i/3].ful);
    }
    else{
      oxyplntlvl = localStorage.getItem(i+'plntoxy');
      fulplntlvl = localStorage.getItem(i+'plntful');
    }
    fill(0);
    text("oxygen: " + oxyplntlvl + "%", planets[i].x - 80, planets[i].y - 20);
    text("fuel: " + fulplntlvl + "%", planets[i].x - 60, planets[i].y + 20);
    if(localStorage.getItem(i+'planetregen') > 0){
      text("regenerating in 1hr", planets[i].x - 100, planets[i].y + 60);
    }
    ship.collide(planets[i]);
    planets[i+2].x = planets[i].x;
    planets[i+2].y = planets[i].y;

    if(ship.collide(planets[i]) || ship.isTouching(planets[i])){
      if(oxygenlvl < maxoxygen && plntscollvls[i/3].oxy > 0){
        oxygenlvl += 1;
        plntscollvls[i/3].oxy -= 1;
        localStorage.setItem(i+'plntoxy',plntscollvls[i/3].oxy);
      }
      else{
        oxygenlvl += 0;
        plntscollvls[i/3].oxy -= 0;
      }
      if(fuellvl < maxfuel && plntscollvls[i/3].ful > 0){
        fuellvl += 1;
        plntscollvls[i/3].ful -= 1;
        localStorage.setItem(i+'plntful',plntscollvls[i/3].ful);
      }
      else{
        fuellvl += 0;
        plntscollvls[i/3].ful -= 0;
      }
    }
    if(ship.isTouching(planets[i+2])){
      if(keyIsDown(UP_ARROW) === false){
        ship.attractionPoint(2,planets[i].x,planets[i].y);
      }
    }
    else {
      ship.attractionPoint(0,planets[i].x, planets[i].y);
    }
  }
  if(frameCount === 3){
    ship.x = homeplanet.x;
    ship.y = homeplanet.y;
    lastshipposx = ship.x;
    lastshipposy = ship.y;
    planets[9].scale = 1.25;
  }
}

function hideplanets(){
  for(var i = 0; i <= planets.length - 1; i+=3){
    if(planets[i].position.x < ship.x - displayWidth || planets[i].position.x > ship.x + displayWidth || 
       planets[i].position.y < ship.y - displayHeight || planets[i].position.y > ship.y + displayHeight){
      planets[i].visible = false;
      planets[i+2].visible = false;
    }
    else{
      planets[i].visible = true;
      planets[i+2].visible = true;
    }
  }
}

function spawncollectables(plants, water, o2, energy, planetno){
  planetno *= 3;
  var touched = 0;
  var tp = plants;
  var tw = water;
  var to2 = o2;
  var te = energy;
  for(var p = 0; p < tp; p++){
    var plants = createSprite(planets[planetno].x, planets[planetno].y, 20, 20);
    plants.scale = 0.04;
    plants.addImage("plants",plantimg);
    var px = Math.round(random(400,500));
    var nx = Math.round(random(-400,-500));
    var plantsx = Math.round(random(px, nx));
    var py = Math.round(random(400,500));
    var ny = Math.round(random(-400,-500));
    var plantsy = Math.round(random(py, ny));
    var rotatingdist = random(50,150);
    var randomrotation = random(0,359)
    collft.push(plants, {x: plantsx, y: plantsy, planet: planetno, didtouched: touched, rdist: rotatingdist, rangle: randomrotation, type: "plants", onship: 0, ani: 0});
  }
  for(var p = 0; p < tw; p++){
    var water = createSprite(planets[planetno].x, planets[planetno].y, 20, 20);
    water.scale = 0.056;
    water.addImage("water",waterimg);
    var px = Math.round(random(400,500));
    var nx = Math.round(random(-400,-500));
    var waterx = Math.round(random(px, nx));
    var py = Math.round(random(400,500));
    var ny = Math.round(random(-400,-500));
    var watery = Math.round(random(py, ny));
    var rotatingdist = random(50,150);
    var randomrotation = random(0,359);
    collft.push(water, {x: waterx, y: watery, planet: planetno, didtouched: touched, rdist: rotatingdist, rangle: randomrotation, type: "water", onship: 0, ani: 0});
  }
  for(var p = 0; p < to2; p++){
    var o2 = createSprite(planets[planetno].x, planets[planetno].y, 20, 20);
    o2.scale = 0.05;
    o2.addImage("oxygen", oxyimg);
    var px = Math.round(random(400,500));
    var nx = Math.round(random(-400,-500));
    var oxyx = Math.round(random(px, nx));
    var py = Math.round(random(400,500));
    var ny = Math.round(random(-400,-500));
    var oxyy = Math.round(random(py, ny));
    var rotatingdist = random(50,150);
    var randomrotation = random(0,359);
    collft.push(o2, {x: oxyx, y: oxyy, planet: planetno, didtouched: touched, rdist: rotatingdist, rangle: randomrotation, type: "oxygen", onship: 0, ani: 0, destroy: 0});
  }
  for(var p = 0; p < te; p++){
    var energy = createSprite(planets[planetno].x, planets[planetno].y, 20, 20);
    energy.scale = 0.05;
    energy.addImage("oxygen", energyimg);
    var px = Math.round(random(400,500));
    var nx = Math.round(random(-400,-500));
    var enex = Math.round(random(px, nx));
    var py = Math.round(random(400,500));
    var ny = Math.round(random(-400,-500));
    var eney = Math.round(random(py, ny));
    var rotatingdist = random(50,150);
    var randomrotation = random(0,359);
    collft.push(energy, {x: enex, y: eney, planet: planetno, didtouched: touched, rdist: rotatingdist, rangle: randomrotation, type: "energy", onship: 0, ani: 0, destroy: 0});
  }
}

function movecollectables(){
  for(i = 0; i < collft.length; i += 2){
    if(gameState === "play"){

    if(collft[i].x > ship.x + displayWidth / 2 || collft[i].x < ship.x - displayWidth / 2 ||
      collft[i].y > ship.y + displayHeight / 2 || collft[i].y < ship.y - displayHeight / 2){
      collft[i].visible = false;
    }
    else{
      collft[i].visible = true;
    }
    collft[i].position.x = planets[collft[i+1].planet].x + collft[i+1].x;
    collft[i].position.y = planets[collft[i+1].planet].y + collft[i+1].y;
    collft[i].collide(ship);
    for(var k = 0; k < planets.length; k += 3){
      collft[i].collide(planets[k]);
    }

    for(var j = 0; j < collft.length; j += 2){
      collft[i].collide(collft[j]);
    }
    if(collft[i].collide(ship)){
      collft[i+1].onship = 1;
    }
    if(collft[i+1].onship === 1){
      collft[i].x = ship.x + (cos(shipr + collft[i+1].rangle) * (collft[i+1].rdist));
      collft[i].y = ship.y + (sin(shipr + collft[i+1].rangle) * (collft[i+1].rdist));
      for(var k = 0; k < planets.length; k += 3){
        collft[i].collide(planets[k]);
      }
    }
    if(keyIsDown(82)){
      if(collft[i+1].onship > 0){
        collft[i+1].ani = 1;
      }
    }

    if(collft[i+1].ani > 0 && collft[i].scale > 0){
      collft[i].scale = collft[i].scale - 0.0005
    }

    if(keyIsDown(16) && collft[i+1].type === "oxygen" && collft[i+1].onship === 1){
      collft[i+1].ani = 1;
      collft[i+1].destroy = 1;
    }
    if(mousePressedOver(collft[i]) && collft[i+1].onship === 1){
      collft[i+1].ani = 1;
      collft[i+1].destroy = 1;
    }

    if(collft[i].scale < 0){
      collft[i+1].didtouched = 0;
      collft[i+1].onship = 0;
      collft[i+1].ani = 0;
      if(collft[i+1].type === "plants"){
        collft[i].scale = 0.04;
      }
      if(collft[i+1].type === "water"){
        collft[i].scale = 0.056;
      }
      if(collft[i+1].type === "oxygen"){
        if(collft[i+1].destroy === 1){
          collft[i].destroy();
          oxygenlvl += 40;
        }
        else{
          collft[i].scale = 0.05;
        }
      }
    }
    if(localStorage.getItem('col'+i)>0){
      collft[i].destroy();
    }
    if(collft.length >= 0){
      if(collft[i].collide(homeplanet) && collft[i+1].onship > 0){
       var type = collft[i+1].type;
       if(type === "water"){
         collft[i].destroy();
          waterlvl += 40;
          localStorage.setItem('col'+i, 2);
        }
       if(type === "energy"){
          collft[i].destroy();
          energylvl += 40;
          localStorage.setItem('col'+i, 3);
        }
        if(type === "plants"){
          collft[i].destroy();
          localStorage.setItem('col'+i, 4);
          plantslvl += 40;
        }
      }
      if(localStorage.getItem('col'+i) === null){
        localStorage.setItem('col'+i, 0);
      }
    }
  }
  else if(gameState === "end"){
    collft[i].velocityX = 0;
    collft[i].velocityY = 0
  }
  }
}

function oxynful() {
  if(Math.round(ship.x) != Math.round(lastshipposx) || Math.round(ship.y) != Math.round(lastshipposy)){
    fuellvl -= 0.035;
    lastshipposx = ship.x;
    lastshipposy = ship.y;
  }

  if(frameCount % 6 === 0){
    //oxygenlvl -= 0.2;
  }

  if(oxygenlvl <= 0){
    oxygenlvl = 0;
    gameState = "end"
  }

  if(oxygenlvl > maxoxygen){
    oxygenlvl = maxoxygen;
  }

  if(fuellvl > maxfuel){
    fuellvl = maxfuel;
  }

  if(fuellvl < 0){
    fuellvl = 0;
  }

  noStroke();
  var oxybar = map(oxygenlvl, 0, maxoxygen, 1, 101, true);
  var fulbar = map(fuellvl, 0, maxfuel, 1, 101, true);
  fill('rgba(0,255,0,0.5)');
  rect(ship.x - displayWidth/2 + 50, ship.y + 230, oxybar*2, 20);
  fill('rgba(255,0,0,0.5)');
  rect(ship.x - displayWidth/2 + 50, ship.y + 300, fulbar*2, 20);

  textFont("Copperplate");

  if(oxygenlvl < 30){
    fill(rgb(255,0,0));
  }
  else{
    fill(255);
  }
  text("oxygen level: " + Math.round(oxybar - 1), ship.x - displayWidth/2 + 50, ship.y + 220);

  if(fuellvl < 30){
    fill(rgb(255,0,0));
  }
  else{
    fill(255);
  }
  text("fuel level: " + Math.round(fulbar - 1), ship.x - displayWidth/2 + 50, ship.y + 290);
}

function reset(){
  collft = [];
  oxygenlvl = 100;
  fuellvl = 101;
  rb.visible = false;
  restart.visible = false;
  spawncollectables();
  homeplanet = createSprite(0, 0, 50, 50);
  homeplanet.addImage("plntprt1", homeplanetimg[0]);
  homeplanet.scale = 0.5;
  homeplanet.setCollider("circle",0,0,455);
  ship.x = homeplanet.x ;
  ship.y = homeplanet.y;
  gameState = "mainmenu";
}

function spawnmoon(number){
  for(i = 0; i < number; i++){
    var moon = createSprite(0,0,1,1);
    moon.addImage("moon", moonimg);
    moon.setCollider("circle",0,0,200);
    moon.scale = 0.4;
    var a = createSprite(0,0,1,1);
    var rd = random(600,800);
    var rr = random(0,359);
    moonarr.push(moon,a,{dist: rd, rot: rr});
  }
}

function mm(planetno,moonno){
  planetno *= 3;
  moonarr[moonno].x = planets[planetno].x + cos(moonarr[moonno+1].rotation + moonarr[moonno+2].rot) * (moonarr[moonno+2].dist);
  moonarr[moonno].y = planets[planetno].y + sin(moonarr[moonno+1].rotation + moonarr[moonno+2].rot) * (moonarr[moonno+2].dist);
  moonarr[moonno+1].rotation += 0.5;
  ship.collide(moonarr[moonno]);
  if(moonarr[moonno].x > ship.x + displayWidth / 2 || moonarr[moonno].x < ship.x - displayWidth / 2 ||
    moonarr[moonno].y > ship.y + displayHeight / 2 || moonarr[moonno].y < ship.y - displayHeight / 2){
      moonarr[moonno].visible = false;
  }
  else{
    moonarr[moonno].visible = true;
  }
}

function bg(number){
  for(i = 0; i < number; i++){
    var w = random(-1200, 1200);
    var h = random(-800, 800);
    var s = random(0.1, 0.2);
    var star = createSprite(ship.x + w, ship.y + h,20,20);
    star.addImage("star",starimg);
    star.scale = s;
    star.shapeColor = (255);
    star.depth = homeplanet.depth - 1;
    for(j = 0; j < planets.length; j += 3){
      star.depth = planets[j].depth - 1
    }
    console.log(w + ", " + h);
    bga.push(star);
  }
}

function movebg(){
  for(i = 0; i < bga.length; i++){
    bga[i].velocityX = -1*ship.velocityX;
    bga[i].velocityY = -1*ship.velocityY;
    if(bga[i].x > ship.x + displayWidth){
      var r = random(0,50);
      bga[i].x = ship.x - displayWidth/2 - r;
    }
    if(bga[i].x < ship.x - displayWidth){
      var r = random(0,50);
      bga[i].x = ship.x + displayWidth/2 + r;
    }
    if(bga[i].y > ship.y + displayHeight){
      var r = random(0,50);
      bga[i].y = ship.y - displayHeight/2 - r;
    }
    if(bga[i].y < ship.y - displayHeight){
      var r = random(0,50);
      bga[i].y = ship.y + displayHeight/2 + r;
    }
  }
}

// function spawnastroids(number){
//   for(var i = 0; )
// }
