let {
  Object3D,
  Mesh
} = require('three');
class Blob extends Object3D {
  constructor(name, size, p, grow, geometry, material, fill_mat) {
    super()
    this.grow = grow;


    this.sphere = new Mesh(geometry, material.clone());
    this.add(this.sphere)
    this.sphere.name = name;
    this.sphere.scale.set(size.x, size.y, size.z);
    this.sphere.position.set(p.x, p.y, p.z);



    this.fill = new Mesh(geometry, fill_mat.clone());

    let fs = size.multiplyScalar(0.1);
    this.fill.scale.set(fs.x, fs.y,fs.z);
    this.fill.position.set(p.x, p.y, p.z);

    this.sphere.material.transparent = true;
    this.sphere.material.opacity = .8;  


  }

  setChild(child){
    this.sphere.children.push(child);
  }

  getSphere() {
    return this.sphere;
  }

  getFill() {
    return this.fill
  }

  updateScale(t) {
    //change the 5 to actually access the parent size
    if (this.fill.scale.x < 5 * 0.92) {
      this.fill.scale.set(
        this.fill.scale.x + this.grow.x,
        this.fill.scale.y + this.grow.y,
        this.fill.scale.z + this.grow.z
      );
    }

  }
}

module.exports = Blob
