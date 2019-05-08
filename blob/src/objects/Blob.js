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
  constructor(name, size, fillSize, p, growRatio, geometry, material, fill_mat, color) {
    super()
    this.grow = growRatio * size.x;
    this.color = color;
    this.name = name;
    this.geometry = geometry;

    this.sphere = new Mesh(geometry, material.clone());
    this.add(this.sphere)
    this.sphere.name = name;
    this.sphere.scale.set(size.x, size.y, size.z);
    this.sphere.position.set(p.x, p.y, p.z);



    this.fill = new Mesh(geometry, fill_mat.clone());
    let fs = size.multiplyScalar(fillSize);
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

  shrink(amount) {
    this.fill.scale.set(  this.fill.scale.x * (1-amount), 
                          this.fill.scale.y * (1-amount),
                          this.fill.scale.z * (1-amount)     );
      
  }


  dealDamage(attackBlob) {
    var s = attackBlob.getSize();

    if(attackBlob.getColor() === this.color){
      //dont overcap the fill blobs
      this.fill.scale.set(
        Math.min(this.fill.scale.x + s.x, .9 * this.sphere.scale.x),
        Math.min(this.fill.scale.y + s.y, .9 * this.sphere.scale.y),
        Math.min(this.fill.scale.z + s.z, .9 * this.sphere.scale.z)
        ); 
    }
    else {
      // add the attack blob power to the negative of the current blob power
      if(this.fill.scale.x - s.x < 0 ){
        this.fill.scale.set(Math.min(-1*(this.fill.scale.x - s.x), .9 * this.sphere.scale.x ), 
                            Math.min(-1*(this.fill.scale.y - s.y), .9 * this.sphere.scale.y ), 
                            Math.min(-1*(this.fill.scale.z - s.z), .9 * this.sphere.scale.z )  );
        

        this.sphere.material.color.set(attackBlob.getMaterial().clone().color);
        this.fill.material.color.set(attackBlob.getFillMaterial().clone().color)
        
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
    if (this.color !== "gray" && this.fill.scale.x < this.sphere.scale.x * 0.9) {
      this.fill.scale.set(
        this.fill.scale.x + this.grow,
        this.fill.scale.y + this.grow,
        this.fill.scale.z + this.grow
      );
    }

  }

  // decide if the ai should attack
  aiMove(scene) {
    let dist = (v1, v2) => {
      return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) );
    }
    let attackers = [];
    let opponentBlobs = [];
    let attack = false;


    attackers = scene.children.filter(o => o instanceof Attack &&  o.getEnd().x === this.fill.position.x && o.getEnd().y === this.fill.position.y
                                            && o.getColor() !== this.color);
    if (attackers.length > 0){

      for(let i=0; i<attackers.length; i++) {

        if( attackers[i].sphere.scale.x > .9*this.fill.scale.x  ) {
          if( dist(attackers[i].sphere.position, this.fill.position) < 20 ) {
            return true;
          }

          return false;
        } 
      }
    } 
    if(this.fill.scale.x > .5*this.sphere.scale.x) {
      attack = true;
    } else if(this.fill.scale.x > .3*this.sphere.scale.x) {
      if (scene.children.filter(o => o instanceof Blob && o.fill.scale.x < this.fill.scale.x).length > 0){
        attack = true;

      }
    }
    return attack;
  }

}

module.exports = Blob
