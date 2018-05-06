/********************************************
*Table is a surface with purely aesthetic legs
* @param left: the distance from the left of the canvas
* @param width: width of table surface
* @param height: y-coord of the top left
* @param angle: angle of table (radians)
* @param color: color of the table
*********************************************/
function Table (left, width, height, angle, color){
	if(left === undefined) { left = 10;}
	if(width === undefined) {width = 10;}
	if(height === undefined) {surface = 200;}
	if(angle === undefined) {angle = 0;}
	if(color === undefined) {color = "#8B4618";}
	this.left = left;
	this.width = width;
	this.height = height;
	this.angle = angle;
	this.color = color;
	this.type = "table";
	this.right = function(){
		return this.left + this.width* Math.cos(this.angle);
	}
}

Table.prototype.draw = function(context){
	var cosT = Math.cos(this.angle), sinT = -Math.sin(this.angle);
	context.save();
	context.lineWidth=1;
	context.strokeStyle = this.color;
	context.beginPath();
	//top
	context.moveTo(this.left, this.height);
	context.lineTo(this.left + this.width* cosT, this.height + this.width*sinT);
	//left leg
	context.moveTo(this.left*(1+.2*cosT), this.height + .2*this.left * sinT); 
	context.lineTo(this.left*(1+.2*cosT), context.canvas.height);
	//right leg
	context.moveTo(this.left+ (this.width-.2*this.left)*cosT, this.height + (this.width-.2*this.left)*sinT);
	context.lineTo(this.left+ (this.width-.2*this.left)*cosT, context.canvas.height);
	//ledges
	context.moveTo(this.left, this.height);
	context.lineTo(this.left + 5*sinT, this.height-5*cosT);
	context.moveTo(this.right(), this.height+this.width*sinT);
	context.lineTo(this.right() +5*sinT, this.height+this.width*sinT-5*cosT);
	context.stroke(); 
	context.restore();
}

