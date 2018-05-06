/***************************************************
* Force class defines a force arrow on the primary canvas centered on a specific target
* @param {Crate} ac : a crate object to be the target of Force
* @param {integer} i_ac: the index of ac
* @param magnitude: the length of the arrow (~magnitude of force)
* @param distance: distance (pixels) of arrow tip from target (will remain constant through magnitude change)
* @param color: color of the displayed arrow 
* @param {boolean} tension: true if Force is a tension
***************************************************/
function Force (ac, i_ac, magnitude, distance, color, tension){
	if(ac === undefined || i_ac === undefined ){
		console.log("Global Forces not yet implemented, please specify Force target");
		ac = {x:0, y:0};
		i_ac = undefined;
	}
	if(magnitude === undefined) {magnitude = 30;}
	if(distance === undefined) {distance= 57;}
	if(color === undefined){color = "green";}
	if(tension === undefined){tension = "false";}
	this.iac = i_ac;
	this.ac = ac;
	this.theta= 0; //angle the arrow  makes with -x axis
	this.tension = Boolean(tension);
	this.magnitude = magnitude;
	this.distance = distance;
	this.color = utils.parseColor(color);
	this.active = true;
	/********************************
	* Vertex returns an array of the vertices
	* @returns an array of vertices ( [i] = {x_i, y_i} )
	*********************************/
	this.vertex = function(){
		var tx = this.ac.x, ty = this.ac.y;
		var aHead = (this.magnitude*6.6) /6;
		var cos = Math.cos(this.theta), sin = Math.sin(this.theta);
		return [ {x:tx-this.distance*cos,y:ty-this.distance*sin}, 
					{x: (tx - this.distance*cos) +(-aHead*cos + 10*sin),y: (ty - this.distance*sin) + -aHead*sin - 10*cos},
					{x: (tx - this.distance*cos) + (-aHead*cos + 5*sin), y: (ty - this.distance*sin) + (-aHead*sin -5*cos)},
					{x: (tx - this.distance*cos) +(-(this.magnitude*6.6)*cos + 5*sin), y: (ty - this.distance*sin) +(-(this.magnitude*6.6)*sin - 5*cos) },
					{x: (tx - this.distance*cos) + (-(this.magnitude*6.6)*cos - 5* sin), y:(ty - this.distance*sin) +  (-(this.magnitude*6.6)*sin+ 5*cos) },
					{x: (tx - this.distance*cos) + (-aHead*cos - 5*sin), y:(ty - this.distance*sin) + (-aHead * sin + 5*cos)},
					{x: (tx - this.distance*cos) + (-aHead*cos - 10*sin), y:(ty - this.distance*sin) + (-aHead*sin + 10*cos) },
					{x:tx-this.distance*cos,y:ty-this.distance*sin}];
	}
	this.vertex1 = function(){
		var tx = this.ac.x, ty = this.ac.y;
		var aHead = (this.magnitude*6.6) /6;
		var cos = Math.cos(this.theta), sin = Math.sin(this.theta);
		return [ {x: tx- this.distance*cos, y:ty - this.distance*sin},
				{x: (tx - this.distance*cos) + (5*sin),y: (ty - this.distance*sin) + (-5*cos)},
				{x: (tx - this.distance*cos) + (-((this.magnitude*6.6)-aHead)*cos + 5*sin), y: (ty-this.distance*sin) + (-((this.magnitude*6.6)-aHead)*sin -5*cos)},
				{x: (tx - this.distance*cos) + (-((this.magnitude*6.6)-aHead)*cos + 10*sin),y: (ty-this.distance*sin) + (-((this.magnitude*6.6)-aHead)*sin -10*cos)},
				{x: (tx - this.distance*cos) + (-(this.magnitude*6.6)*cos),                 y: (ty-this.distance*sin) + (-(this.magnitude*6.6)*sin)},
				{x: (tx - this.distance*cos) + (-((this.magnitude*6.6)-aHead)*cos - 10*sin),y: (ty-this.distance*sin) + (-((this.magnitude*6.6)-aHead)*sin +10*cos)},
				{x: (tx - this.distance*cos) + (-((this.magnitude*6.6)-aHead)*cos - 5*sin), y: (ty-this.distance*sin) + (-((this.magnitude*6.6)-aHead)*sin + 5*cos)},
				{x: (tx - this.distance*cos) + (-5*sin),y: (ty - this.distance*sin) + (5*cos)},
				{x: (tx - this.distance*cos), y: (ty - this.distance*sin)}
				
				]
	}
	
}
/************************************************
* 'mag' returns the magnitude of the Force
* @returns {x,y} the components magnitudes of the Force
*************************************************/
Force.prototype.mag= function() {
	var m = 1;
	if (this.tension){ m = -1;}
	return { x:m*this.magnitude*Math.cos(this.theta),
	y:m*this.magnitude*Math.sin(this.theta)};
}

/**************************************************
* prototype function 'draw' draws the arrow representation of a Force
* pointed towards its target
* @param c: context to be drawn to
***************************************************/
Force.prototype.draw = function(c) {
	var aHead = this.magnitude/6; /*<- width of arrow head*/
	var vertex = this.vertex();
	var vertex1 = this.vertex1();
	
	c.save();
	c.fillStyle=this.color;
	c.moveTo(vertex[0].x, vertex[1].y);
	c.beginPath();
	if(this.tension){
	//	for( i = vertex.length)
		for(i = 1; i<vertex1.length; i++){
			//c.lineTo(vertex[i].x+2*this.distance*Math.cos(this.theta), vertex[i].y + 2*this.distance*Math.sin(this.theta));
			c.lineTo(vertex1[i].x, vertex1[i].y);
		}
	}
	else{
		for( i = 1; i<vertex.length; i++ ){
			c.lineTo(vertex[i].x, vertex[i].y);
		}
	}
	c.closePath();
	if(this.active){ //draws black outline if this is the active force
		c.strokeStyle = "black";
		c.stroke();
	}
	c.fill();
	c.restore();
}
/****************************************************
* prototype function 'containsPoint' evaluates whether a given
* coordinate is within the drawn force arrow
* Specifically tests whether a point is ever to the right of a 
* counter-clockwise path around the arrow. 
*
* For simplicity and without loss of reasonable function, 
* the path tested is a the convex polygon which omits 
* vertices 2 and 5.
*
* @param x, y: the coordinate to be tested
* @returns inside : boolean, true point is inside
******************************************************/
Force.prototype.containsPoint= function (x,y){
	
	var inside = true;
	var vertex = this.vertex();
	
	if( (y-vertex[0].y)*(vertex[1].x - vertex[0].x) - (x-vertex[0].x)*(vertex[1].y-vertex[0].y)>0 ||
		 (y - vertex[1].y)*(vertex[3].x- vertex[1].x) - (x- vertex[1].x)*(vertex[3].y-vertex[1].y) >0 ||
		 (y- vertex[3].y)*(vertex[4].x - vertex[3].x) - (x - vertex[3].x)*(vertex[4].y-vertex[3].y) >0 ||
		 (y- vertex[4].y)*(vertex[6].x - vertex[4].x) - (x- vertex[4].x)*(vertex[6].y - vertex[4].y) >0 ||
		 (y- vertex[6].y)*(vertex[0].x - vertex[6].x) - (x-vertex[6].x)*(vertex[0].y - vertex[6].y) > 0
		)
		{
			inside = false;
		}
		//console.log(inside);
	return inside;
	
};