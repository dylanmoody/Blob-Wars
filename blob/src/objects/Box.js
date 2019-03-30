let { Object3D, BoxGeometry, MeshStandardMaterial, Mesh } = require('three')

var deadColor = 0x222222;
var firstGen = 0xaabb00;
var secondGen = 0xffaabb;
var thirdGen = 0x3344bb;
var activeColor = 0xbbbbbb;
export default class Box extends Object3D {
  constructor (s) {
    super()

    const geometry = new BoxGeometry(s,s,s)
    const material = new MeshStandardMaterial({color: deadColor, roughness: 0.18, metalness: 0.5})
    const mesh = new Mesh(geometry, material)

    this.shouldRotate = Math.random() > 0.5 ? true : false;
    this.alive = this.shouldRotate;
    this.generation = 0;
    this.add(mesh)
  }

  makeAlive() {
    this.alive = true;
    this.generation++;
    this.children[0].material.emissive.setHex(activeColor);
    //debugger;
    /*if(this.generation == 1) {
      this.children[0].material.emissive.setHex(activeColor);
    } else if(this.generation < 3) {
      this.children[0].material.emissive.setHex(firstGen);
    } else if(this.generation < 5) {
      this.children[0].material.emissive.setHex(secondGen);
    } else{
      this.children[0].material.emissive.setHex(thirdGen);
    }*/

    
  }
  makeDead() {
    this.generation = 0;
    this.alive = false;
    this.children[0].material.emissive.setHex(deadColor);
  }
}
