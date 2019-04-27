let {
  Object3D,
  Vector3,
  Mesh
} = require('three');
let {
  colorRED, 
  colorGRAY, 
  colorBLUE, 
  colorGRAY_fill, 
  colorBLUE_fill, 
  colorRED_fill,
  colorSEL
} = require("../colors.js");
let Attack = require("./Attack.js");
class Blob extends Object3D {
  constructor(name, size, p, grow, geometry, material, fill_mat, color) {
    super()
    this.grow = grow;
    this.color = color;
    this.name = name;
    this.geometry = geometry;

    this.sphere = new Mesh(geometry, material.clone());
    this.add(this.sphere)
    this.sphere.name = name;
    this.sphere.scale.set(size.x, size.y, size.z);
    this.sphere.position.set(p.x, p.y, p.z);



    this.fill = new Mesh(geometry, fill_mat.clone());
    let fs = size.multiplyScalar(0.9);
    if(color !== "gray"){
      let fs = size.multiplyScalar(0.1);
    }
    this.fill.scale.set(fs.x, fs.y,fs.z);
    this.fill.position.set(p.x, p.y, p.z);

    this.sphere.material.transparent = true;
    this.sphere.material.opacity = .8;  


  }

  setChild(child){
    this.sphere.children.push(child);
  }

  getColor() {
    return this.color;
  }

  getSphere() {
    return this.sphere;
  }

  getFill() {
    return this.fill
  }

  shrink() {
    this.fill.scale.set(
      this.fill.scale.x * .15,
      this.fill.scale.y * .15,
      this.fill.scale.z * .15);
  }


  dealDamage(attackBlob) {
    var s = attackBlob.getSize();

    if(attackBlob.getColor() === this.color){
      this.fill.scale.set(
        Math.min(this.fill.scale.x + s.x, .9 * this.sphere.scale.x),
        Math.min(this.fill.scale.y + s.y, .9 * this.sphere.scale.y),
        Math.min(this.fill.scale.z + s.z, .9 * this.sphere.scale.z)
        ); 
    }
    else {
      if(this.fill.scale.x - s.x < 0 ){
        this.fill.scale.set(Math.min(-1*(this.fill.scale.x - s.x), .9 * this.sphere.scale.x ), 
                            Math.min(-1*(this.fill.scale.y - s.y), .9 * this.sphere.scale.y ), 
                            Math.min(-1*(this.fill.scale.z - s.z), .9 * this.sphere.scale.z )  );
        
        this.sphere.material.color.set(attackBlob.getColor());
        this.fill.material.color.set(attackBlob.getColor())
        
        this.grow = new Vector3(.002,.002,.002);
        this.color = attackBlob.getColor();
      }
      else {
        this.fill.scale.set(
          this.fill.scale.x - s.x,
          this.fill.scale.y - s.y,
          this.fill.scale.z - s.z
          ); 
      }
    }   
  }

  update(t) {
    if (this.fill.scale.x < this.sphere.scale.x * 0.9) {
      this.fill.scale.set(
        this.fill.scale.x + this.grow.x,
        this.fill.scale.y + this.grow.y,
        this.fill.scale.z + this.grow.z
      );
    }

  }

  aiMove(scene) {
    let dist = (v1, v2) => {
      return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) );
    }
    let attackers = [];
    let opponentBlobs = [];
    let attack = false;


    attackers = scene.children.filter(o => o instanceof Attack && o.getColor() !== this.color && o.getEnd() === this.fill.position );
    if (attackers.length > 0){
      for(let i=0; i<attackers.length; i++) {

        if( attackers[i].sphere.scale.x < this.fill.scale.x ) {
          return attack;
        }

        if( dist(attackers[i].sphere.position, this.sphere.position) < 7 ) {
          attack = true;
        }
      }
    } else if(this.fill.scale.x > .35*this.sphere.scale.x) {
      attack = true;
    } else {
      opponentBlobs = scene.children.filter(o => o instanceof Blob && o.color !== this.color 
                                                                   && o.sphere.scale.x < this.sphere.scale.x);
      if (opponentBlobs.length > 0) {
        attack = true;
      }

    }

    return attack;
  }

}

module.exports = Blob
