function Vector (x, y, color){
	if (x === undefined) {x = 0;}
	if (y === undefined) {y = 0;}
	if (color === undefined) { color = "black"}
	this.x = x;
	this.y = y;
	// angle wrt __ axis
	this.rotation = function(){
		var ret= Math.atan2(this.y, this.x);
		if (ret===-Math.PI){
			ret=Math.PI;
		}
		return ret + Math.PI/2;
	}
	
	this.color = utils.parseColor(color);
	this.lineWidth = 4;
	//this.rotation = Math.atan2(this.y,this.x);
	this.scaleX = 1;
	this.scaleY = 1;
	this.scale = 1;
	this.offset = {x:0,y:0};
	//this.magnitude = Math.pow((Math.pow(this.x,2) + Math.pow(this.y,2)), .5);
	this.magnitude = function(){
		return Math.sqrt(this.x*this.x + this.y*this.y);
	};
	
}
Vector.prototype.dot = function (vect){
	return this.x*vect.x+this.y*vect.y;
};

Vector.prototype.draw = function (dContext){
	//var rotation = Math.atan2(this.y,this.x)+Math.PI/2;
	var magnitude = this.magnitude()*this.scale;
  dContext.save();
  //console.log(this.offset + ":");
 // console.log("Hello>>");
  dContext.translate(dContext.canvas.width/2+this.offset.x*this.scale, dContext.canvas.height/2+this.offset.y*this.scale);
  //console.log(dContext.canvas.width);
  
  dContext.rotate(this.rotation());
  dContext.scale(this.scaleX, this.scaleY);
  dContext.lineWidth = this.lineWidth;
  dContext.fillStyle = this.color;
  dContext.strokeStyle= this.color;
  dContext.beginPath();
  dContext.moveTo(0,0);
  dContext.lineTo(0,-magnitude);  
  //dContext.moveTo(diagram.width/2,diagram.height/2);
  //dContext.lineTo(diagram.width/2 + this.x, diagram.height/2 - this.y);
 // dContext.closePath();
  // draw arrow
  //dContext.beginPath();
  if(magnitude > 0.01){
  dContext.moveTo(-5, 5-magnitude);
  dContext.lineTo(0,-magnitude);
  dContext.lineTo(5, 5-magnitude);}
  dContext.closePath();
  
  
  //dContext.fill();
  if (this.lineWidth > 0) {
    dContext.stroke();
  }
  dContext.restore();
};

Vector.prototype.containsPoint= function(x,y,c){
	var cos = Math.cos(this.rotation()), sin=Math.sin(this.rotation());
	var mag = this.magnitude();
	var vertex = [ {x:(3+mag)*sin+c.x,y:-(3+mag)*cos+c.y},
		{x:-8*cos-sin*(8-mag)+c.x,y:-8*sin+(8-mag)*cos+c.y},
		{x:8*cos-sin*(8-mag)+c.x,y:8*sin+cos*(8-mag)+c.y}];
	var inside = true;
	//console.log(vertex);
	//console.log(x + " : " + y);
	if( (y-vertex[0].y)*(vertex[1].x - vertex[0].x) - (x-vertex[0].x)*(vertex[1].y-vertex[0].y)>0 ||
		 (y - vertex[1].y)*(vertex[2].x- vertex[1].x) - (x- vertex[1].x)*(vertex[2].y-vertex[1].y) >0 ||
		 (y- vertex[2].y)*(vertex[0].x - vertex[2].x) - (x - vertex[2].x)*(vertex[0].y-vertex[2].y) >0
	){
		inside = false;
	} 
	//console.log(inside);
	return inside;
};