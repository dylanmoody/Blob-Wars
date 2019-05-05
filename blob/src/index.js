let {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PointLight,
  Raycaster,
  Vector2,
  Vector3,
  DirectionalLight,
  MeshLambertMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  Mesh,
  Group,
  Color,
  Object3D
} = require('three');
let {
  colorRED, 
  colorGREEN,
  colorBLUE, 
  colorGRAY,  
  colorRED_fill,
  colorGREEN_fill,
  colorBLUE_fill,
  colorGRAY_fill, 
  colorSEL
} = require("./colors.js");
let Blob = require("./objects/Blob.js");
let Attack = require("./objects/Attack.js");
let loop = require("raf-loop");
let WAGNER = require("@superguigui/wagner");
let BloomPass = require("@superguigui/wagner/src/passes/bloom/MultiPassBloomPass");
let FXAAPass = require("@superguigui/wagner/src/passes/fxaa/FXAAPass");
let resize = require("brindille-resize");
let OrbitControls = require("./controls/OrbitControls");
let { gui } = require("./utils/debug");



let stage = {}
var ai = 0;
var ai_num = 0;
var mainBlobs = [];
/* Custom settings */
const SETTINGS = {
  useComposer: false,
  pause: true,
};

function button(value) {

  switch(value){
    case "begin":
      document.getElementById("TitleMenu").classList.add("hidden");
      document.getElementById("levelSelectMenu").classList.remove('hidden');
      break;

    case "level1":
      loadScene(1);
      document.getElementById("levelSelectPlay").classList.remove("hidden");
      break;

    case "level2":
      loadScene(2);
      document.getElementById("levelSelectPlay").classList.remove("hidden");
      break;

    case "level3":
      loadScene(3);
      document.getElementById("levelSelectPlay").classList.remove("hidden");
      break;

    case "play":
      document.getElementById("levelSelectMenu").classList.add('hidden');
      document.getElementById("levelSelectPlay").classList.add('hidden');
      document.getElementById("PlayMenu").classList.remove("hidden");
      SETTINGS.pause = false;

      // this is so that the list of ai blobs gets updated
      // otherwise switching scenes will have blobs that no longer
      // exist attacking
      ai = ai_num;
      break;

    case "pause":
      document.getElementById("PlayMenu").classList.add("hidden");
      document.getElementById("PauseMenu").classList.remove('hidden');
      SETTINGS.pause = true;
      break;

    case "resume":
      document.getElementById("PlayMenu").classList.remove("hidden");
      document.getElementById("PauseMenu").classList.add('hidden');
      SETTINGS.pause = false;
      break;

    case "restart":
      clearScene();
      document.getElementById("TitleMenu").classList.remove("hidden");
      document.getElementById("PauseMenu").classList.add('hidden');
      break;

    case "reset":
      clearScene();
      document.getElementById("TitleMenu").classList.remove("hidden");
      document.getElementById("WinMenu").classList.add('hidden');

      break;

  }
}
window.button = button

function showWinMessage(message) {
  var h1 = document.createElement("H1");
  h1.classList.add("winner");
  var text = document.createTextNode(message);
  h1.appendChild(text);
  document.getElementById("PlayMenu").classList.add("hidden");
  document.getElementById("TitleMenu").classList.add('hidden');
  document.getElementById("WinMenu").classList.remove("hidden");

  document.getElementById("WinMenu").replaceChild(h1, document.getElementsByClassName("winner")[0]);

}


/* Init renderer and canvas */
const container = document.body;
const renderer = new WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000);
container.style.overflow = "hidden";
container.style.margin = 0;
container.appendChild(renderer.domElement);

/* Composer for special effects */
const composer = new WAGNER.Composer(renderer);
const bloomPass = new BloomPass();
const fxaaPass = new FXAAPass();
const r = new Raycaster();
var mouse = new Vector2(0.5, 0.5)


/* Main scene and camera */
const scene = new Scene();

var selected;
var sceneSize = 100;
var aspectRatio = window.innerWidth/window.innerHeight;
var h = sceneSize;
var w = sceneSize * aspectRatio;
const camera = new OrthographicCamera( w/-2, w/2, h/2, h/-2, 0.1, 1000 );
// look down on the blobs from above
camera.position.z = 50;



/* Lights */
const frontLight = new PointLight(0xffffff, 1);
const backLight = new PointLight(0xffffff, 0.5);
scene.add(frontLight);
scene.add(backLight);
frontLight.position.x = 0;
frontLight.position.y = 0;
frontLight.position.z = 15;

backLight.position.x = 0;
backLight.position.y = 0;
backLight.position.z = -15;


//  Define Materials 
var materialRED = new MeshLambertMaterial({color:colorRED});
var materialRED_fill = new MeshLambertMaterial({color:colorRED_fill});
var materialGREEN = new MeshLambertMaterial({color:colorGREEN});
var materialGREEN_fill = new MeshLambertMaterial({color:colorGREEN_fill});
var materialBLUE = new MeshLambertMaterial({color:colorBLUE});
var materialBLUE_fill = new MeshLambertMaterial({color:colorBLUE_fill});
var materialGRAY = new MeshLambertMaterial({color:colorGRAY});
var materialGRAY_fill = new MeshLambertMaterial({color:colorGRAY_fill});


var geometry = new SphereGeometry(0, 32, 32);


function clearScene( ) {
  //empty the scene
  while(scene.children.length > 0){ 
    scene.remove(scene.children[0]); 
  }
}


function loadScene(stage){



  switch(stage) {
    case 1:
      stage = {
        blue: [
          {x: -60,y: -25, size: 7},
        ],
        red: [
          {x: 60,y: 25, size: 7},
        ],
        green: [
        ],
        gray: [
          {x: 30,y: 10, size: 3},
          {x: -30,y: 10, size: 3},
          {x: 30,y: -10, size: 3},
          {x: -30,y: -10, size: 3},
        ]
      }
      break;
    case 2:
      stage = {
        blue: [
          {x: -20,y: 0, size: 10},
        ],
        red: [
          {x: 20,y: 0, size: 10},
        ],
        green: [
        ],
        gray: [
          {x: 60,y: -33, size: 3},
          {x: 75,y: -20, size: 4},
          {x: 86,y: 0, size: 5},
          {x: 75,y: 20, size: 4},
          {x: 60,y: 33, size: 3},

          {x: -60,y: -33, size: 3},
          {x: -75,y: -20, size: 4},
          {x: -86,y: 0, size: 5},
          {x: -75,y: 20, size: 4},
          {x: -60,y: 33, size: 3},
        ] 
      }
      break;
    case 3:
      stage = {
        blue: [
          {x: 0,y: 0, size: 17},
          {x: 0,y: -40, size: 5},
          {x: 0,y: 40, size: 5},
        ],
        red: [
          {x: -60,y: 0, size: 5},
          {x: -35,y: -25, size: 5},
          {x: -35,y: 25, size: 5},
        ],
        green: [
          {x: 35,y: -25, size: 5},
          {x: 35,y: 25, size: 5},
          {x: 60,y: 0, size: 5},
        ],
        gray: [
        ] 
      }
      break;


  }



  clearScene();

  // Actual content of the scene 
  var directionalLight = new DirectionalLight( 0xffffff, 1.5 );
  directionalLight.position.set(0,0,1);
  scene.add( directionalLight );

  // ADD MAIN BLOBS 
  mainBlobs = [];
  let s;

  let count = 0;
  // CREATE RED BLOBS
  for (var i=0; i<stage.red.length; i++){
    s = stage.red[i].size;
    var blob = new Blob("main"+count, new Vector3(s,s,s), new Vector3(stage.red[i].x,stage.red[i].y,0),
     new Vector3(.004,.004,.004), geometry, materialRED, materialRED_fill, "red");
    mainBlobs.push(blob);
    count++;
  }


  // CREATE GREEN BLOBS
  for (var i=0; i<stage.green.length; i++){
    s = stage.green[i].size;
    var blob = new Blob("main"+count, new Vector3(s,s,s), new Vector3(stage.green[i].x,stage.green[i].y,0), 
      new Vector3(.004,.004,.004), geometry, materialGREEN, materialGREEN_fill, "green");
    mainBlobs.push(blob);
    count++;
  }


  // CREATE BLUE BLOBS
  for (var i=0; i<stage.blue.length; i++){
    s = stage.blue[i].size;
    var blob = new Blob("main"+count, new Vector3(s,s,s), new Vector3(stage.blue[i].x,stage.blue[i].y,0), 
      new Vector3(.004,.004,.004), geometry, materialBLUE, materialBLUE_fill, "blue");
    mainBlobs.push(blob);
    count++;
  }


  // CREATE NEUTRAL BLOBS 
  for (var i=0; i<stage.gray.length; i++){
    s = stage.gray[i].size;
    var blob = new Blob("main"+count, new Vector3(s,s,s), new Vector3(stage.gray[i].x,stage.gray[i].y,0), 
      new Vector3(0,0,0), geometry, materialGRAY, materialGRAY_fill, "gray");
    mainBlobs.push(blob);
    count++;
  }
  

  // this is necessary so that we can call intersect on all of them (for selection)
  // might also use it for checking if the attack blobs are intersecting with main blobs
  for (var i=0; i<mainBlobs.length; i++){
    scene.add(mainBlobs[i]);
    scene.add(mainBlobs[i].getFill())
  }


}

/* Various event listeners */
resize.addListener(onResize);
document.addEventListener("mousedown", onClick, false);


/* create and launch main loop */
const engine = loop(render);
engine.start();

/* create gui components */
gui.add(SETTINGS, "useComposer");
gui.add(SETTINGS, "pause");
gui.add(SETTINGS, "resetGrid");

// create constants for player color reference
const AICOLOR = ['red', 'green'];
const PLAYERCOLOR = 'blue';
const NEUTRALCOLOR = 'gray';

/* -------------------------------------------------------------------------------- */

//  Resize canvas
function onResize() {
  camera.aspect = resize.width / resize.height;
  // camera.updateProjectionMatrix();
  renderer.setSize(resize.width, resize.height);
  composer.setSize(resize.width, resize.height);
}


// when the user clicks we need to know where and decide if they are trying to attack or select
// one of their own blobs
function onClick(event){

  if(SETTINGS.pause){
    return;
  }
  event.preventDefault();


  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  r.setFromCamera( mouse, camera );
  var intersects = r.intersectObjects( mainBlobs.map(b => b.children[0]) );


  if(intersects.length === 0 && selected !== undefined ){
    selected.material.color.sub(colorSEL);
    selected = undefined;
  } 
  else {

    for( var i = 0; i < intersects.length; i++ ) {
      var obj = intersects[ i ].object;

      if (selected !== undefined){
        if (selected.name === obj.name){
          continue;
        }
        selected.material.color.sub(colorSEL);


        //name, size, position, move, grow, geometry, material, opacity, parent

        // make the target the parent so that way we can tell when its has struck
        // dont need to know the original blob for anything other than color position and
        // scale which we can initialize the attack blob with

        // maybe coming up with a naming convention for attack would be useful, need to figure out concatenation in js
        var tempFill = selected.parent.getFill();
        var end = obj;
        var dist = Math.sqrt(Math.pow(selected.position.x - end.position.x,2) + Math.pow(selected.position.y - end.position.y,2));
        let attack = new Attack("", geometry, selected.material, tempFill.scale, tempFill.position, end.position, 100*dist, end, selected.parent.getColor());
        scene.add(attack);
        selected.parent.shrink();
        selected = undefined;
      }
      else if (obj.parent.color === PLAYERCOLOR){
        selected = obj;

        obj.material.color.add(colorSEL);
      }

    }
  }
}
function dist(v1, v2) {
    return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) + Math.pow(v1.z - v2.z, 2));
}


// check if anyone has won the game
var ai_list = [];
var colorIndex = 0;
function winCondition(scene) {
  let blobs = scene.children.filter(o => o instanceof Blob)
  let color0 = blobs[0].color;
  let gameOver = blobs.reduce((r, o) => r && o.color === color0, true)

  if (gameOver){
    showWinMessage(color0 + " wins");
    SETTINGS.pause = true;
  }

  return gameOver;
}



function render(dt) {
  


  renderer.render(scene, camera);
  if (SETTINGS.pause) return;

  if(winCondition(scene)) {
    return;
  }

  d = new Date();
  let t = d.getTime();

  // for moving blobs
  for(var i = 0; i < scene.children.length; i++) {
    let child = scene.children[i];
    if(child.update) child.update(t)
  }

  // for the ai
  if (ai === ai_num) {
    ai_list = scene.children.filter(o => o instanceof Blob  && o.color !== PLAYERCOLOR && o.color !== NEUTRALCOLOR);
    ai_num = ai_list.length;
    ai = 0;
  } else {
    let attack = ai_list[ai].aiMove(scene);
    if (attack){      
      let aiTarget = ai_list[ai];
      opponentBlobs = scene.children.filter(o => o instanceof Blob && (o.getColor() !== aiTarget.getColor() )
                                                                   && o.getSphere().scale.x < aiTarget.getSphere().scale.x);
      if (opponentBlobs.length < 1){
        opponentBlobs = scene.children.filter(o => o instanceof Blob && o.color !== aiTarget.getColor());
      }
      opponentBlobs.sort(function(a,b){return b.getFill().scale.x - a.getFill().scale.x});
      var target = opponentBlobs[0];


      let di = dist(aiTarget.getFill().position, target.getFill().position);

      let a = new Attack("", geometry, aiTarget.getSphere().material, aiTarget.getFill().scale, aiTarget.getFill().position, target.getFill().position, 100*di, target.children[0], aiTarget.getColor());
      scene.add(a);
      aiTarget.shrink();

    }
    ai++;   
  }

  
}
