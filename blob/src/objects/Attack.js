let {
  Object3D,
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
class Attack extends Object3D {

  constructor(name, geometry, fillMaterial, material, scale, start, end, duration, targetObject, color, aa) {
    super()
    this.fillMaterial = fillMaterial.clone();
    this.material = material.clone();
    this.sphere = new Mesh(geometry, fillMaterial);
    this.add(this.sphere);
    this.sphere.name = name;
    this.sphere.scale.set(scale.x*aa, scale.y*aa, scale.z*aa);
    this.sphere.position.set(start.x, start.y, start.z);

    this.color = color;
    this.s = start;
    this.e = end
    let d = new Date();
    this.duration = duration;
    this.startTime = d.getTime();
    this.targetObject = targetObject;
  }

  setChild(child){
    this.sphere.children.push(child);
  }

  getSphere() {
    return this.sphere;
  }

  getMaterial() {
    return this.material;
  }

  getFillMaterial() {
    return this.fillMaterial;
  }

  getEnd() {
    return this.e;
  }

  getSize() {
    return this.sphere.scale;
  }

  getColor() {
    return this.color;
  }

  update(t) {
    

    var s = this.s;
    var e = this.e;
    var dt = t - this.startTime;
    var iif = dt / (this.duration);
    var iiif = (1 - iif);

    if(dt > this.duration) {
      this.targetObject.parent.dealDamage(this);
      this.parent.remove(this);
      return;
    }
    

    this.sphere.position.set(s.x * iiif + e.x * iif, s.y * iiif + e.y * iif, s.z * iiif +  s.z * iif);
  }
}


module.exports = Attack