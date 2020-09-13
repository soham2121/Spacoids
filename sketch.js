var ship, shipa = 0, shipimg, homeplanet, planets = [], collft = [], isfpressed = false, restart, rb, homeplanetimg = [], curtime = [];
var oxygenlvl = 100, fuellvl = 101, lastshipposx = 0, lastshipposy = 0, shipr = 0, plantimg, waterimg, gameState = "mainmenu", bu;
var isSaved, isSavedcheck, savecol, oxyimg, energyimg, hometrig, energylvl = 0, waterlvl = 0, plantslvl = 0, plntscollvls = [];
var maxfuel = 85, maxoxygen = 80, button1, button2;

function preload(){
  shipimg = loadImage("sprites/ship.png");

  plantimg = loadImage("sprites/plant.png");

  waterimg = loadImage("sprites/water.png");

  oxyimg = loadImage("sprites/oxygen.png");

  energyimg = loadImage("sprites/energy.png");

  for(var i = 1; i <= 3; i++){
    var hmpltimg = loadImage("sprites/prt" + i + ".png");
    homeplanetimg.push(hmpltimg);
  }
}

function setup() {
  createCanvas(displayWidth-5, displayHeight-120);

  angleMode(DEGREES); 

  ship = createSprite(750, 380, 30, 50);
  ship.scale = 0.3;

  homeplanet = createSprite(0, 0, 50, 50);
  homeplanet.addImage("plntprt1", homeplanetimg[0]);
  homeplanet.scale = 0.5;
  homeplanet.setCollider("circle",0,0,455);

  hometrig = createSprite(0, 0, 1, 1);
  hometrig.setCollider("circle", 0, 0, 510);

  restart = createSprite(ship.x, ship.y, 100, 50);
  restart.depth = ship.depth + 1;
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

  //isSavedcheck = localStorage.getItem("isSaved");
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
    }
    if(frameCount > 1){
    player();
    allmovement();
    hideplanets();
    oxynful();
    hmplt();
    }
  }
  else if(gameState === "end"){
    fill(255);
    text("Restart", restart.x - 17, restart.y);
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

async function getTime(){
  curtime = [];
  var m = minute();
  var h = hour();
  var s = second();
  curtime.push({min: m, hour: h, sec: s});
}

function hmplt(){
  ship.collide(homeplanet);

  homeplanet.life = 2;

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

  fill(255);
  textFont("Copperplate");
  text("energy: " + roundedenergy + "%", homeplanet.x - 80, homeplanet.y - 100);
  text("water: " + roundedwater + "%", homeplanet.x - 60, homeplanet.y);
  text("oxygen: " + roundedplants + "%", homeplanet.x - 80, homeplanet.y + 100);
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
   ship.setSpeed(10, shipa - 90);
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

  if(shipa > 360){
    shipa = 0;
  }

  textSize(30)
  textFont("Copperplate");
  fill("white");
  text("x: " + Math.round(ship.x) + " y: " + Math.round(ship.y), camera.x - 100, camera.y - 330);
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
      oxylvl = 60;
      fullvl = 85;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 1:
      createplanets.setCollider("circle",0,0,340);
      oxylvl = 85;
      fullvl = 100;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 2:
      createplanets.setCollider("circle",0,0,345);
      oxylvl = 100;
      fullvl = 120;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 3:
      createplanets.setCollider("circle",0,0,195);
      oxylvl = 120;
      fullvl = 140;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 4:
      createplanets.setCollider("circle",0,0,340);
      oxylvl = 135;
      fullvl = 150;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 5:
      createplanets.setCollider("circle",0,-13,245);
      oxylvl = 150;
      fullvl = 160;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 6:
      createplanets.setCollider("circle",0,0,295);
      oxylvl = 250;
      fullvl = 205;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 7:
      createplanets.setCollider("circle",-25,20,330);
      oxylvl = 280;
      fullvl = 235;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 8:
      createplanets.setCollider("circle",35,-15,330);
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
      oxylvl = 340;
      fullvl = 360;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 11:
      createplanets.setCollider("circle",0,10,325);
      oxylvl = 400;
      fullvl = 410;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 12:
      createplanets.setCollider("circle",0,0,325);
      oxylvl = 420;
      fullvl = 430;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 13:
      createplanets.setCollider("circle",0,0,325);
      oxylvl = 430;
      fullvl = 430;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 14:
      createplanets.setCollider("circle",-20,0,325);
      oxylvl = 437;
      fullvl = 442;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 15:
      createplanets.setCollider("circle",0,0,325);
      oxylvl = 442;
      fullvl = 450;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    case 16:
      createplanets.setCollider("circle",-33,-13,333);
      spawncollectables(3,3,0,3,16);
      oxylvl = 450;
      fullvl = 461;
      plntscollvls.push({oxy: oxylvl, ful: fullvl, maxoxy: oxylvl, maxful: fullvl, regen: 0, regentime: [{hour: 0, min: 0, sec: 0}]});
      break;
    }
  }
}

function allmovement(){
  for(var i = 0; i < planets.length; i+=3){
    if(ship.collide(planets[i]) || ship.isTouching(planets[i])){
      if(plntscollvls[i/3].regen === 0){
        getTime();
        plntscollvls[i/3].regentime[0].hour = curtime[0].hour + 1;
        plntscollvls[i/3].regentime[0].min = curtime[0].min + 1;
        plntscollvls[i/3].regentime[0].sec = curtime[0].sec;
        plntscollvls[i/3].regen = 1;
      }
    }
    if(plntscollvls[i/3].regen != 0){
      getTime();
      if(curtime[0].min >= plntscollvls[i/3].regentime[0].min){
        if(curtime[0].sec >= plntscollvls[i/3].regentime[0].sec){
          plntscollvls[i/3].oxy = plntscollvls[i/3].maxoxy;
          plntscollvls[i/3].ful = plntscollvls[i/3].maxful;
          plntscollvls[i/3].regen = 0;
        }
      }
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
        planets[18].x = -2976*1.5;
        planets[18].y = -4188*1.5;
      case 24: 
        planets[18].x = -5414*1.5;
        planets[18].y = -6122*1.5;
    }
    //var rndoxylvl = map(plntscollvls[0].oxy, 0, plntscollvls[0].oxy, 0, 100);
    //var rndfullvl = map(plntscollvls[0].ful, 0, plntscollvls[0].ful, 0, 100);
    fill(0);
    text("oxygen: " + plntscollvls[i/3].oxy + "%", planets[i].x - 80, planets[i].y - 20);
    text("fuel: " + plntscollvls[i/3].ful + "%", planets[i].x - 60, planets[i].y + 20);
    if(plntscollvls[i/3].regen > 0){
      text("regenerating in 1hr", planets[i].x - 100, planets[i].y + 60);
    }
    ship.collide(planets[i]);
    planets[i+2].x = planets[i].x;
    planets[i+2].y = planets[i].y;

    if(ship.collide(planets[i]) || ship.isTouching(planets[i])){
      if(oxygenlvl < maxoxygen && plntscollvls[i/3].oxy > 0){
        oxygenlvl += 1;
        plntscollvls[i/3].oxy -= 1;
      }
      else{
        oxygenlvl += 0;
        plntscollvls[i/3].oxy -= 0;
      }
      if(fuellvl < maxfuel && plntscollvls[i/3].ful > 0){
        fuellvl += 1;
        plntscollvls[i/3].ful -= 1;
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
  var touched = 0;
  for(var i = 0; i < planets.length; i += 3){
    switch(i){
      case 0:
        tp = 1;
        tw = 1;
        to2 = 1;
        te = 1;
        planetno = 0;
    }
  }
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
          oxygenlvl += 75;
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
          waterlvl += 30;
          localStorage.setItem('col'+i, 2);
        }
       if(type === "energy"){
          collft[i].destroy();
          energylvl += 30;
          localStorage.setItem('col'+i, 3);
        }
        if(type === "plants"){
          collft[i].destroy();
          localStorage.setItem('col'+i, 4);
          plantslvl += 30;
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
    oxygenlvl -= 0.2;
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
  rect(ship.x - displayWidth/2 + 20, ship.y + 230, oxybar*2, 20);
  fill('rgba(255,0,0,0.5)');
  rect(ship.x - displayWidth/2 + 20, ship.y + 300, fulbar*2, 20);

  textFont("Copperplate");

  if(oxygenlvl < 30){
    fill(rgb(255,0,0));
  }
  else{
    fill(255);
  }
  text("oxygen level: " + Math.round(oxybar - 1), ship.x - displayWidth/2 + 20, ship.y + 220);

  if(fuellvl < 30){
    fill(rgb(255,0,0));
  }
  else{
    fill(255);
  }
  text("fuel level: " + Math.round(fulbar - 1), ship.x - displayWidth/2 + 20, ship.y + 290);
}

function reset(){
  collft = [];
  localStorage.clear();
  oxygenlvl = 100;
  fuellvl = 101;
  rb.visible = false;
  restart.visible = false;
  spawncollectables();
  energylvl = 0;
  waterlvl = 0;
  plantslvl = 0;
  homeplanet = createSprite(0, 0, 50, 50);
  homeplanet.addImage("plntprt1", homeplanetimg[0]);
  homeplanet.scale = 0.5;
  homeplanet.setCollider("circle",0,0,455);
  ship.x = homeplanet.x ;
  ship.y = homeplanet.y;
  gameState = "mainmenu";
}
