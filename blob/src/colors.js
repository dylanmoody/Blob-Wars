let {
  MeshLambertMaterial,
  MeshStandardMaterial,
} = require('three');

var materialRED = new MeshLambertMaterial({color:0x900000});
var materialRED_fill = new MeshStandardMaterial({color:0xff2222});
var materialBLUE = new MeshLambertMaterial({color:0x0000ff});
var materialBLUE_fill = new MeshStandardMaterial({color:0x3333ff});
var materialGRAY = new MeshLambertMaterial({color:0x7d7d7d});
var materialGRAY_fill = new MeshLambertMaterial({color:0xa0a0a0});

module.exports = {materialRED, materialGRAY, materialBLUE, materialGRAY_fill, materialBLUE_fill, materialRED_fill}