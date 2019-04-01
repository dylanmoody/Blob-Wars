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
  Color
} = require('three')
let loop = require("raf-loop");
let WAGNER = require("@superguigui/wagner");
let BloomPass = require("@superguigui/wagner/src/passes/bloom/MultiPassBloomPass");
let FXAAPass = require("@superguigui/wagner/src/passes/fxaa/FXAAPass");
let resize = require("brindille-resize");
let OrbitControls = require("./controls/OrbitControls");
let { gui } = require("./utils/debug");

let stage = {
    blue: {x:0.1, y:0.5, health: 100},
    red: {x:0.9, y:0.5, health: 100},
    blobs: [
        {x: 0.25,y: 0.5},
        {x: 0.75,y: 0.5},
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


class Blob extends Object3D {

  constructor(name, size, position, move, grow, geometry, material, opacity) {
    super()
    this.move = move;
    this.grow = grow;


    this.sphere = new Mesh(geometry, material);
    this.sphere.name = name;
    this.sphere.scale.set(size.x, size.y, size.z);
    this.sphere.position.set(position.x, position.y, position.z);
    if (opacity){
      this.sphere.material.transparent = true;
      this.sphere.material.opacity = .8;  
    }
    if (parent !== undefined) {
      this.sphere.parent = parent;
    }

  }

  setChild(child){
    this.sphere.children.push(child);
  }

  getSphere() {
    return this.sphere;
  }

  updateScale() {
    //change the 5 to actually access the parent size
    if (this.sphere.scale.x < 5 * 0.92) {
      this.sphere.scale.set(
        this.sphere.scale.x + this.grow.x,
        this.sphere.scale.y + this.grow.y,
        this.sphere.scale.z + this.grow.z
      );
    }

  }
}


class Attack {

  constructor(name, size, position, move, geometry, material, opacity) {
    this.move = move;
    this.grow = grow;


    this.sphere = new Mesh(geometry, material);
    this.sphere.name = name;
    this.sphere.scale.set(size.x, size.y, size.z);
    this.sphere.position.set(position.x, position.y, position.z);
    if (opacity){
      this.sphere.material.transparent = true;
      this.sphere.material.opacity = .8;  
    }
    if (parent !== undefined) {
      this.sphere.parent = parent;
    }

  }

  setChild(child){
    this.sphere.children.push(child);
  }

  getSphere() {
    return this.sphere;
  }




  updatePos() {

    this.sphere.position.x = this.move.x;
    this.sphere.position.y = this.move.y;
  }


  sayHi() {
    console.log(this.sphere.position);
  }

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

var colorSEL = new Color(0x3f3f3f);


var geometry = new SphereGeometry(0, 32, 32);

//name, size, position, move, grow, geometry, material, opacity, parent
var blob = new Blob("main1", new Vector3(5,5,5), new Vector3(-15,-5,0), new Vector2(0,0), 
  new Vector3(0,0,0), geometry, materialRED, true, undefined);


var blob2 = new Blob("main2", new Vector3(5,5,5), new Vector3(10,10,0), new Vector2(0,0), 
  new Vector3(0,0,0), geometry, materialBLUE, true, undefined);


var blobFill = new Blob("fill1", new Vector3(.1,.1,.1), new Vector3(-15,-5,0), new Vector2(0,0), 
  new Vector3(.005,.005,.005), geometry, materialRED_fill, false, blob.getSphere());


// ADD MAIN BLOBS 
var mainBlobs = [];
mainBlobs.push(blob);
mainBlobs.push(blob2);

// this is necessary so that we can call intersect on all of them (for selection)
// might also use it for checking if the attack blobs are intersecting with main blobs
var mainSpheres = [];
for (var i=0; i<mainBlobs.length; i++){
  mainSpheres.push(mainBlobs[i].getSphere());
  scene.add(mainBlobs[i].getSphere());
}

// ADD FILL BLOBS
var fillBlobs = [];
fillBlobs.push(blobFill);

mainBlobs[0].setChild(fillBlobs[0].getSphere());


for(var i=0; i<fillBlobs.length; i++){
  scene.add(fillBlobs[i].getSphere());
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
  var intersects = r.intersectObjects( mainSpheres );

  console.log(intersects);

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

        for(var i=0; i<fillBlobs.length; i++){
          if(fillBlobs[i].getSphere().name.slice(4,5) === selected.name.slice(4,5)){
            var tempFill = fillBlobs[i].getSphere();
            break;
          }
        }

        var t = tempFill.scale;
        var p = tempFill.position;
        var mr = (obj.position.x - p.x) / (obj.position.y - p.y);
        console.log(1/mr*.01);

        attacks.push(new Blob("", new Vector3(t.x*.75, t.y*.75, t.z*.75), new Vector3(p.x, p.y, p.z), new Vector2(.03*mr,.03*(1/mr)), 
  new Vector3(0,0,0), geometry, selected.material, false, intersects[i].object));

        scene.add(attacks[attacks.length-1].getSphere());

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
  // camera.updateMatrixWorld();
  // r.setFromCamera(mouse, camera);


  //console.log(intersections.length > 0 ? intersections : null)
  

  // controls.update();

  // if (
  //   sphere.position.x < 50 / -2 + sphere.scale.x ||
  //   sphere.position.x > 50 / 2 - sphere.scale.x
  // ) {
  //   movex *= -1;
  // }
  // if (
  //   sphere.position.y < 50 / -2 + sphere.scale.y ||
  //   sphere.position.y > 50 / 2 - sphere.scale.y
  // ) {
  //   movey *= -1;
  // }

  for(var i=0; i<mainBlobs.length; i++){
    // mainBlobs.children[i].position.x += movex;
    // mainBlobs.children[i].position.y += movey;

  }


  for (var i=0; i<attacks.length; i++) {
    attacks[i].updatePos()
  }


  // sphere_fill.scale.set(sphere_fill.radius*1.01,sphere_fill.radius*1.01,sphere_fill.radius*1.01);

  for (var i = 0; i < fillBlobs.length; i++){
    fillBlobs[i].updateScale();
  }
  renderer.render(scene, camera);
}
