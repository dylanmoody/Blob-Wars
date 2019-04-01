let {
  Object3D,
  Mesh
} = require('three');
class Attack extends Object3D {

  constructor(name, geometry, material, scale, start, end, duration, targetObject, color) {
    super()
    this.sphere = new Mesh(geometry, material.clone());
    this.add(this.sphere);
    this.sphere.name = name;
    this.sphere.scale.set(scale.x, scale.y, scale.z);
    this.sphere.position.set(start.x, start.y, start.z);

    this.color = color;
    console.log(color);
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