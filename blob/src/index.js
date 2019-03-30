let {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PointLight,
  Raycaster,
  Vector2,
  DirectionalLight,
  MeshLambertMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  Mesh,
  Group
} = require('three')
let loop = require("raf-loop");
let WAGNER = require("@superguigui/wagner");
let BloomPass = require("@superguigui/wagner/src/passes/bloom/MultiPassBloomPass");
let FXAAPass = require("@superguigui/wagner/src/passes/fxaa/FXAAPass");
let resize = require("brindille-resize");
let OrbitControls = require("./controls/OrbitControls");
let { gui } = require("./utils/debug");

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
var mouse = new Vector2(0.5, 0.5),
  INTERSECTED;

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


var geometry = new SphereGeometry(0, 32, 32);
var sphere = new Mesh(geometry, materialRED);
sphere.scale.set(5,5,5);
sphere.material.opacity = .8;
var sphere_fill = new Mesh(geometry, materialRED_fill);
var sphere2 = new Mesh(geometry, materialBLUE);
sphere2.scale.set(5,5,5);
sphere.material.transparent = true;


var group = new Group();
group.add(sphere);
group.add(sphere2);
group.add(sphere_fill);

scene.add(group);



// var material = new THREE.MeshBasicMaterial({color: 0xffff00 });
sphere.position.set(-15,-5,0);
sphere_fill.position.set(-15,-5,0);
sphere2.position.set(10,10,0);

camera.position.z = 50;

var movex = 0.2;
var movey = -0.2;
//scene.add(torus)

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
  
  group.children[0].material.color.setRGB(.5,.5,.5);

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

  if (
    sphere.position.x < 50 / -2 + sphere.scale.x ||
    sphere.position.x > 50 / 2 - sphere.scale.x
  ) {
    movex *= -1;
  }
  if (
    sphere.position.y < 50 / -2 + sphere.scale.y ||
    sphere.position.y > 50 / 2 - sphere.scale.y
  ) {
    movey *= -1;
  }

  for(var i=0; i<group.children.length; i++){
    group.children[i].position.x += movex;
    group.children[i].position.y += movey;

  }


  // camera.rotation.x += .01;
  // camera.rotation.y += .01;

  // sphere_fill.scale.set(sphere_fill.radius*1.01,sphere_fill.radius*1.01,sphere_fill.radius*1.01);

  if (sphere_fill.scale.x < sphere.scale.x * 0.92) {
    sphere_fill.scale.set(
      sphere_fill.scale.x + 0.003,
      sphere_fill.scale.y + 0.003,
      sphere_fill.scale.z + 0.003
    );
  }
  renderer.render(scene, camera);
}
