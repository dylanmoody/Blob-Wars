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
let Blob = require("./objects/Blob.js");
let Attack = require("./objects/Attack.js");
let loop = require("raf-loop");
let WAGNER = require("@superguigui/wagner");
let BloomPass = require("@superguigui/wagner/src/passes/bloom/MultiPassBloomPass");
let FXAAPass = require("@superguigui/wagner/src/passes/fxaa/FXAAPass");
let resize = require("brindille-resize");
let OrbitControls = require("./controls/OrbitControls");
let { gui } = require("./utils/debug");

// let stage = {
//     blue: {x:0.1, y:0.5, health: 100},
//     red: {x:0.9, y:0.5, health: 100},
//     blobs: [
//         {x: -60,y: -25},
//         {x: 60,y: 25},
//         {x: 30,y: 10},
//         {x: -30,y: 10},
//         {x: 30,y: -10},
//         {x: -30,y: -10},
//     ]
// }

let stage = {
  blue: [
    {x: -60,y: -25, size: 7},
  ],
  red: [
    {x: 60,y: 25, size: 7},
  ],
  gray: [
    {x: 30,y: 10, size: 3},
    {x: -30,y: 10, size: 3},
    {x: 30,y: -10, size: 3},
    {x: -30,y: -10, size: 3},
  ]
}


/* Custom settings */
const SETTINGS = {
  useComposer: false,
  pause: false,
};
function playButton() {
  // alert('hi');
  console.log(document.getElementById("TitleMenu").classList)
  document.getElementById("TitleMenu").classList.add("hidden")
  document.getElementById("PlayMenu").classList.remove('hidden')
}
window.playButton = playButton

function menuButton() {
  console.log("sup")
  document.getElementById("PlayMenu").classList.add("hidden")
  document.getElementById("TitleMenu").classList.remove('hidden')
}
window.menuButton = menuButton


/*
  
  creating class to store the spheres here for now for convenience
  move it later
  
  I also dont remember what we decided on storing inside it, so mostly temporary for now



*/

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
// const camera = new PerspectiveCamera(
//   50,
//   resize.width / resize.height,
//   0.1,
//   1000
// );
// const controls = new OrbitControls(camera, {
//   enablePan: false,
//   element: renderer.domElement,
//   parent: renderer.domElement,
//   distance: 10,
//   phi: Math.PI * 0.5
// });

var selected;
var sceneSize = 100;
var aspectRatio = window.innerWidth/window.innerHeight;
var h = sceneSize;
var w = sceneSize * aspectRatio;
const camera = new OrthographicCamera( w/-2, w/2, h/2, h/-2, 0.1, 1000 );

/* Lights */
const frontLight = new PointLight(0xffffff, 1);
const backLight = new PointLight(0xffffff, 0.5);
scene.add(frontLight);
scene.add(backLight);
frontLight.position.x = 20;
frontLight.position.z = 15;
frontLight.position.y = 10;
backLight.position.x = -20;
backLight.position.y = -1;
backLight.position.z = -1;

/* Actual content of the scene */



var directionalLight = new DirectionalLight( 0xffffff, 1.5 );
directionalLight.position.set(0,0,1);
scene.add( directionalLight );
// scene.add( light );

/*

  Define Materials 

*/


var materialRED = new MeshLambertMaterial({color:0x900000});
var materialRED_fill = new MeshStandardMaterial({color:0xff2222});
var materialBLUE = new MeshLambertMaterial({color:0x0000ff});
var materialBLUE_fill = new MeshStandardMaterial({color:0x3333ff});
var materialGRAY = new MeshLambertMaterial({color:0x7d7d7d});
var materialGRAY_fill = new MeshLambertMaterial({color:0xa0a0a0});


var colorSEL = new Color(0x3f3f3f);


var geometry = new SphereGeometry(0, 32, 32);

// ADD MAIN BLOBS 
var mainBlobs = [];
var s;

// CREATE BLUE BLOBS
for (var i=0; i<stage.red.length; i++){
  s = stage.red[i].size;
  var blob = new Blob("main"+i, new Vector3(s,s,s), new Vector3(stage.red[i].x,stage.red[i].y,0), new Vector3(.004,.004,.004), 
    geometry, materialRED, materialRED_fill, "red");
  mainBlobs.push(blob);
}

// CREATE RED BLOBS
for (var i=0; i<stage.blue.length; i++){
  s = stage.blue[i].size;
  var blob = new Blob("main"+stage.red.length+i, new Vector3(s,s,s), new Vector3(stage.blue[i].x,stage.blue[i].y,0), 
    new Vector3(.004,.004,.004), geometry, materialBLUE, materialBLUE_fill, "blue");
  mainBlobs.push(blob);
}

// CREATE NEUTRAL BLOBS
for (var i=0; i<stage.gray.length; i++){
  s = stage.gray[i].size;
  var blob = new Blob("main"+stage.red.length+stage.blue.length+i, new Vector3(s,s,s), new Vector3(stage.gray[i].x,stage.gray[i].y,0), 
    new Vector3(0,0,0), geometry, materialGRAY, materialGRAY_fill, "gray");
  mainBlobs.push(blob);
}


// this is necessary so that we can call intersect on all of them (for selection)
// might also use it for checking if the attack blobs are intersecting with main blobs
var mainSpheres = [];
for (var i=0; i<mainBlobs.length; i++){
  mainSpheres.push(mainBlobs[i]);
  scene.add(mainBlobs[i]);
  scene.add(mainBlobs[i].getFill())
}



// CREATE ARRAY OF ATTACKING BLOBS BUT LEAVE IT EMPTY FOR NOW
var attacks = [];


// look down on the blobs from above
camera.position.z = 50;


/* Various event listeners */
resize.addListener(onResize);

/* create and launch main loop */
const engine = loop(render);
engine.start();

/* some stuff with gui */
gui.add(SETTINGS, "useComposer");
gui.add(SETTINGS, "pause");
gui.add(SETTINGS, "resetGrid");

document.addEventListener("mousemove", onDocumentMouseMove, false);

document.addEventListener("click", onClick, false);

/* -------------------------------------------------------------------------------- */

/**
  Resize canvas
*/
function onResize() {
  camera.aspect = resize.width / resize.height;
  // camera.updateProjectionMatrix();
  renderer.setSize(resize.width, resize.height);
  composer.setSize(resize.width, resize.height);
}



function onDocumentMouseMove(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

}

function onClick(event){

  r.setFromCamera( mouse, camera );
  var intersects = r.intersectObjects( mainSpheres.map(b => b.children[0]) );


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

        var end = obj

        var dist = Math.sqrt(Math.pow(selected.position.x - end.position.x,2) + Math.pow(selected.position.y - end.position.y,2));


        let attack = new Attack("", geometry, selected.material, tempFill.scale, tempFill.position, end.position, 100*dist, end, selected.parent.getColor());

        attacks.push(attack);

        scene.add(attack);

        selected = undefined;


      }
      else {
        selected = obj;

        obj.material.color.add(colorSEL);

      }
    }

  }

}


/**
  Render loop
*/
function render(dt) {
  if (SETTINGS.pause) return;
  d = new Date();
  let t = d.getTime();

  for(var i = 0; i < scene.children.length; i++) {
    let child = scene.children[i];
    if(child.update) child.update(t)
  }


  renderer.render(scene, camera);
}
