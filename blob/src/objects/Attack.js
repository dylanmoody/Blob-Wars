let {
  Object3D,
  Mesh
} = require('three');
class Attack extends Object3D {

  constructor(name, geometry, material, scale, start, end, duration, targetObject) {
    super()
    this.sphere = new Mesh(geometry, material.clone());
    this.add(this.sphere);
    this.sphere.name = name;
    this.sphere.scale.set(scale.x, scale.y, scale.z);
    this.sphere.position.set(start.x, start.y, start.z);

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

  updatePos(t) {
    

    var s = this.s;
    var e = this.e;
    var dt = t - this.startTime;
    var iif = dt / (this.duration);
    var iiif = (1 - iif);

    if(dt > this.duration) {
      switch(this.targetObject.material.name) {
        case "red":
          // code block
          if(this.sphere.material.name === "red") {
            
          }
          console.log(this.targetObject.material.name);
          break;
        case "blue":
          // code block
          break;
        case "gray":
          // cs
          break;
        default:
          console.log("oh no");
          // code block
      } 
      return;
    }
    

    this.sphere.position.set(s.x * iiif + e.x * iif, s.y * iiif + e.y * iif, s.z * iiif +  s.z * iif);
  }
}


module.exports = Attack