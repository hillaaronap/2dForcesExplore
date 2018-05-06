/********************************************************
* Crate is a square box...
* @param side: length of a side, pixels
* @param color: the color
* @param number: identifier to link with diagram
* @param diagram: the force diagram associated
* Note: width/height are intended for value fetches only, 
* 		do not attempt to change their value 
*********************************************************/

function Crate (side, color, number) {
  var quarterPi=Math.PI/4, beta = side/ 1.41421356237  //half diagonal distance
  if (side === undefined) { side = 79; }
  if (color === undefined) { color = "#ff0000"; }
  if (number === undefined) { number = ":-{(";}
  //if (diagram === undefined) { ////console.log("crate must have a diagram (diagram)");}
 /* switch (side){
		case 80: this.mass = 64.0; break;
		case 60: this.mass = 36.0; break;
		case 30: this.mass = 9.0; break;
		case 20: this.mass = 4.0; break;
		default: this.mass = 200.0;
	}*/
  this.mass = Math.floor(side*side*side*.00000585937) //kg
  this.number = number;
  this.x = 0; //position of center //pixels
  this.y = 0;
  this.width = side;
  this.height = side;
  this.ax=0; //acceleration m/s 
  this.ay=0;
  this.vx = 0; //velocity m/s
  this.vy = 0;
  this.color = utils.parseColor(color);
  this.theta = 0;
  this.lineWidth = 1;
  this.gForce;
  this.sFriction = new Vector(0,0,"magenta");
  this.kFriction = new Vector(0,0,"orange");
  this.nForce = new Vector(0,0, "purple");
  /*cForces are forces from other crates.
  * [0] reserved for pulley, [1] forces from a crate atop,
  * [2] from a crate on the left, [3] from a crate on the right
  */
  this.cForces = []; //diagram vectors
  this.aForces =[]; //diagram vectors
  this.appliedForces = []; //canvas forces
  this.active = false; // is this the active crate
  //this.energy = 0;
  this.sumApplied ;
  this.diagram; //context of the diagram
  this.type = "crate";
  this.contact={bottom: false, top: false, left: false, right: false}; //contact with table surface
  this.hooked = false; //is the pulley hooked to it
  
  /***********************
  * corner returns the corners of the crate.
  * at theta = 0, returns [bottom right, bottom left, top left, top right, bottom right]
  ***********************/
  this.corner = function() {
	  return [{x: this.x+beta*Math.cos(quarterPi-this.theta),y:this.y+beta*Math.sin(quarterPi- this.theta)},
	{x:this.x +beta*Math.cos(3*quarterPi-this.theta),y:this.y+beta*Math.sin(3*quarterPi- this.theta)},
	{x:this.x+beta*Math.cos(5*quarterPi-this.theta),y:this.y+beta*Math.sin(5*quarterPi- this.theta)},
  {x:this.x+beta*Math.cos(7*quarterPi-this.theta),y:this.y+beta*Math.sin(7*quarterPi- this.theta)},
  {x: this.x+beta*Math.cos(quarterPi-this.theta),y:this.y+beta*Math.sin(quarterPi- this.theta)}];
  };
};

/******************************************************
* draw function draws the Crate object to its context
* @param c: the context to draw the crate to
* @param s: scaling for vectors on diagram
* @param log: boolen, display as as logarythmic scaling
*******************************************************/
Crate.prototype.draw = function (c,s, log) {
	var corner = this.corner();
	var max,t;
	if(typeof(s) == 'undefined'){s = 1;}
	if(typeof(log) != 'boolean'){log = false;}
  
  c.save();
  c.lineWidth = this.lineWidth;
  c.fillStyle = this.color;
  
  c.beginPath();
  c.moveTo(corner[0].x, corner[0].y);
  c.lineTo(corner[1].x, corner[1].y);
  c.lineTo(corner[2].x, corner[2].y);
  c.lineTo(corner[3].x, corner[3].y);
  c.lineTo(corner[0].x, corner[0].y);
  c.closePath();
  c.fill();
  if (this.lineWidth > 0) {
	if(this.active){c.lineWidth = this.lineWidth + 2;} //the active crate gets a bolder outline
    c.stroke();
  }
  //Draw crate weights
  c.save();
  c.fillStyle = "Black";
  c.font = "bold 20px Comic sans";
  c.fillText(this.mass+"kg", this.x-15, this.y+10);
  c.restore();
  //c.fillStyle = "Black";
  //c.font= "30px Verdana";
  //c.fillText(this.number, this.x-10, this.y+10 );
  c.restore();
  /*draw crate's diagram*/
  this.diagram.clearRect(0,0, this.diagram.canvas.width, this.diagram.canvas.height);
  
 	//axes
	this.diagram.lineWidth = 1;
	this.diagram.strokeStyle = utils.parseColor("Black"); 
	this.diagram.beginPath();
	this.diagram.moveTo(0,this.diagram.canvas.height/2);
	this.diagram.lineTo(this.diagram.canvas.width, this.diagram.canvas.height/2);
	this.diagram.moveTo(this.diagram.canvas.width/2, 0);
	this.diagram.lineTo(this.diagram.canvas.width/2, this.diagram.canvas.height);
	this.diagram.closePath();
	this.diagram.stroke();
	//Normalize button
	/*this.diagram.save();
	this.diagram.fillStyle = "Grey";
	this.diagram.fillRect(this.diagram.canvas.width - 70,this.diagram.canvas.height - 30, 60, 20);
	this.diagram.fillStyle = "White";
	this.diagram.font = "10px Verdana";
	this.diagram.fillText("Normalize", this.diagram.canvas.width-68, this.diagram.canvas.height-15);
	this.diagram.restore();*/
	/*this.diagram.save();
	this.diagram.fillStyle = "Grey";
	this.diagram.font = "10px Verdana";
	this.diagram.fillText("Normalized", this.diagram.canvas.width-68, this.diagram.canvas.height-15);
	this.diagram.restore();*/
	//console.log("s", s);
  if(log ){//console.log("bob");
   max = Math.max(this.gForce.magnitude(), this.sFriction.magnitude(), this.kFriction.magnitude(), this.nForce.magnitude());
   for (var a=0; a < this.aForces.length; a++){
	//max = Math.max(max, this.aForces[a].magnitude()+Math.sqrt(this.aForces[a].offset.x*this.aForces[a].offset.x+this.aForces[a].offset.y*this.aForces[a].offset.y));
   max = Math.max(max, Math.sqrt((this.aForces[a].x+this.aForces[a].offset.x)*(this.aForces[a].x+this.aForces[a].offset.x)+(this.aForces[a].y+this.aForces[a].offset.y)*(this.aForces[a].y+this.aForces[a].offset.y)   ));
	//console.log(max, Math.sqrt((this.aForces[a].x+this.aForces[a].offset.x)*(this.aForces[a].x+this.aForces[a].offset.x)+(this.aForces[a].y+this.aForces[a].offset.y)*(this.aForces[a].y+this.aForces[a].offset.y)   ) );
  }
   for(var a=0; a <this.cForces.length; a++){
	max = Math.max(max, this.cForces[a].magnitude());
   }
 //  console.log(max);
   //console.log(max);
   if(log){
    t = this.diagram.canvas.height/(2.15*Math.log(max));
   //console.log(Math.log(this.gForce.magnitude()));
   
    s = {g:Math.log(this.gForce.magnitude())*t/this.gForce.magnitude(),
		n:Math.log(this.nForce.magnitude())*t/this.nForce.magnitude(),
		sf:Math.log(this.sFriction.magnitude())*t/this.sFriction.magnitude(),
		kf:Math.log(this.kFriction.magnitude())*t/this.kFriction.magnitude(),af:[], cf:[]};
	 //console.log(s.sf);
	 if(this.sFriction.magnitude()<.000001 || s.sf<0){s.sf = 1;}
	 if(this.kFriction.magnitude()<.000001 || s.kf<0){s.kf = 1;}
	 //console.log("152sf",s.sf, this.sFriction.magnitude());
	 for(var a=0; a<this.aForces.length; a++){
	  s.af.push(Math.log(this.aForces[a].magnitude())*t/this.aForces[a].magnitude());
	 // a.afo.push(Math.log(this.aForces[a].offset     )
	 // console.log(s.af[a]);
	 }
	 for(var a=0; a<this.cForces.length; a++){
	  s.cf.push(Math.log(this.cForces[a].magnitude())*t/this.cForces[a].magnitude());
	 }
   }
   
  }
  else{
	s={g:s,n:s,sf:s, kf:s, af:[], cf:[]};
	for(var a=0; a<this.aForces.length; a++){
	 s.af.push(s.g);
	}
	for(var a=0; a<this.cForces.length; a++){
	 s.cf.push(s.g);
	}
  }
  //console.log(s.g);
  
  this.diagram.font = "14px Verdana";
  /*draw crate's forces*/
  this.gForce.scale=s.g;
  this.gForce.draw(this.diagram);
  this.diagram.fillStyle = this.gForce.color;
  this.diagram.fillText("F",this.gForce.x*s.g+10+this.diagram.canvas.width/2,this.gForce.y*s.g+this.diagram.canvas.height/2);
  this.diagram.font = "10px Verdana";
  this.diagram.fillText("g",this.gForce.x*s.g+14+this.diagram.canvas.width/2,this.gForce.y*s.g+2+this.diagram.canvas.height/2);
  this.nForce.scale=s.n;
  this.nForce.draw(this.diagram);
  if(this.nForce.magnitude()!==0){
	  this.diagram.font = "14px Verdana";
	  this.diagram.fillStyle = this.nForce.color;
	  this.diagram.fillText("F",this.nForce.x*s.n+10+this.diagram.canvas.width/2,this.nForce.y*s.n+this.diagram.canvas.height/2);
	  this.diagram.font = "10px Verdana";
	  this.diagram.fillText("N",this.nForce.x*s.n+14+this.diagram.canvas.width/2,this.nForce.y*s.n+4+this.diagram.canvas.height/2);
  }
  //////console.log(this.nForce.magnitude());
  this.sFriction.scale = s.sf;
  this.sFriction.draw(this.diagram);
  if(this.sFriction.magnitude()!==0){
	  this.diagram.font = "14px Verdana";
	  this.diagram.fillStyle = this.sFriction.color;
	  this.diagram.fillText("f", this.sFriction.x*s.sf + 10 +this.diagram.canvas.width/2, this.sFriction.y*s.sf-10+this.diagram.canvas.height/2);
	  this.diagram.font = "10px Verdana";
	  this.diagram.fillText("s", this.sFriction.x*s.sf + 14 +this.diagram.canvas.width/2, this.sFriction.y*s.sf-6+this.diagram.canvas.height/2);
  }
  this.kFriction.scale = s.kf;
  this.kFriction.draw(this.diagram);
  if(this.kFriction.magnitude()!==0){
	  this.diagram.font = "14px Verdana";
	  this.diagram.fillStyle = this.kFriction.color;
	  this.diagram.fillText("f", this.kFriction.x*s.kf + 10 +this.diagram.canvas.width/2, this.kFriction.y*s.kf-10+this.diagram.canvas.height/2);
	  this.diagram.font = "10px Verdana";
	  this.diagram.fillText("k", this.kFriction.x*s.kf + 14 +this.diagram.canvas.width/2, this.kFriction.y*s.kf-6+this.diagram.canvas.height/2);
  }
  for(var p=0;p<this.appliedForces.length;p++){
	  //////console.log("harry");
	  this.appliedForces[p].draw(c);
	 // ////console.log(this.diagram);
	 //console.log(s.af[p]);
	  this.aForces[p].scale =s.af[p];
	  this.aForces[p].draw(this.diagram);
	  this.diagram.font = "14px Verdana";
	  this.diagram.fillStyle = this.aForces[p].color;
	  this.diagram.fillText("F", this.aForces[p].x*s.af[p] + this.aForces[p].offset.x*s.af[p] +10 + this.diagram.canvas.width/2, this.aForces[p].y*s.af[p] + this.aForces[p].offset.y*s.af[p]+this.diagram.canvas.height/2);
	  this.diagram.font = "10px Verdana";
	  if(this.appliedForces[p].tension){
		  this.diagram.fillText("T",  this.aForces[p].x*s.af[p] + this.aForces[p].offset.x*s.af[p] +12 + this.diagram.canvas.width/2, 
									this.aForces[p].y*s.af[p] + this.aForces[p].offset.y*s.af[p]+4+this.diagram.canvas.height/2);
	  }
	  this.diagram.fillText(p+1, this.aForces[p].x*s.af[p] + this.aForces[p].offset.x*s.af[p] +18+ this.diagram.canvas.width/2, this.aForces[p].y*s.af[p] + this.aForces[p].offset.y*s.af[p]+4+this.diagram.canvas.height/2);
	 // ////console.log(this.aForces[p].offset);
	  
  }
  for(var k in this.cForces){
	  this.cForces[k].scale=s.cf[k];
	  this.cForces[k].draw(this.diagram);
	  if(this.cForces[k].magnitude()!==0){
		  if(k==0){
			this.diagram.font = "14px Verdana";
			this.diagram.fillStyle = this.cForces[k].color;
			this.diagram.fillText("F", this.cForces[k].x*s.cf[k]+ this.cForces[k].offset.x*s.cf[k]+10+this.diagram.canvas.width/2, this.cForces[k].y*s.cf[k] + this.cForces[k].offset.y*s.cf[k]+this.diagram.canvas.height/2);
			this.diagram.font = "10px Verdana";
			this.diagram.fillText("T", this.cForces[k].x*s.cf[k] + this.cForces[k].offset.x*s.cf[k]+ 14 + this.diagram.canvas.width/2, this.cForces[k].y*s.cf[k] + this.cForces[k].offset.y*s.cf[k]+4+this.diagram.canvas.height/2);
		  }
		  else{
			this.diagram.font = "14px Verdana";
			this.diagram.fillStyle = this.cForces[k].color;
			this.diagram.fillText("F", this.cForces[k].x*s.cf[k]+ this.cForces[k].offset.x*s.cf[k]+10+this.diagram.canvas.width/2, this.cForces[k].y*s.cf[k] + this.cForces[k].offset.y*s.cf[k]+this.diagram.canvas.height/2);
			this.diagram.font = "10px Verdana";
			this.diagram.fillText("c", this.cForces[k].x*s.cf[k]+ this.cForces[k].offset.x*s.cf[k] + 14 + this.diagram.canvas.width/2, this.cForces[k].y*s.cf[k] + this.cForces[k].offset.y*s.cf[k]+4+this.diagram.canvas.height/2);
		  }
	  }
  }
  
};
/*****************************************************
* containsPoint returns true if the passed coordinates are
* 	within the crate. false otherwise. Specifically, it tests
*	whether the point is not to the right of each path drawn 
*	counterclockwise through the vertices.
* @param x: the x-coordinate of the test point
* @param y: the y-coordinate of the test point
*****************************************************/
Crate.prototype.containsPoint= function (x,y) {
	var inside=true;
	var corner = this.corner();
	for(j=0; j<4; j++){
			
			if(  (y-corner[j].y)*(corner[j+1].x-corner[j].x)-
					(x-corner[j].x)*(corner[j+1].y-corner[j].y)<0){
						//if Point is on right of line betwixt vertex j and j+1, it is outside
						inside = false;
						break;
					}
	}
	return inside;
	
};
/*****************************************
* void intersect: deals with collisions or
* 	intersections with objects. currently 
*	supports a table or a crate (glitchy)
*@param object: either a table object or a 
	crate object
*****************************************/

Crate.prototype.intersect = function(object) {
	var corner = this.corner();
	var cos = Math.cos(this.theta), sin= Math.sin(this.theta);
	if(object.type === "table"){
			//prevent falling through table
			if(this.y >= object.height -(this.x -object.left)*Math.tan(object.angle)-this.height/(2*cos) ){
				this.y = object.height - (this.x -object.left)*Math.tan(object.angle) - this.height/(2*cos);
				
				//this.vy = this.vy*sin*sin;
				//this.vx= this.vx*cos*cos;
				//this.vy = this.vy + Math.sqrt(this.vx*this.vx+this.vy*this.vy)*cos*cos;
				//this.vx = this.vx + Math.sqrt(this.vx*this.vx+this.vy*this.vy)*sin*sin;
				//if(!this.contact.bottom){ this.vx=0; this.vy=0; console.log("true");}
				if(!this.contact.bottom){
				 this.vy = 0;
				 this.vx = 0;
				}
				this.contact.bottom = true;
				
				
			}
			else{
				//this.contact.bottom = false;
			}
			
			//stop at edge of table
			if(this.contact.bottom){
				if(corner[0].x>= object.right()){
				 //console.log(object.right() - (this.height*sin + this.width*cos)/2, this.x);
				 this.x = object.right() - (this.height*sin + this.width*cos)/2;
				 this.y = object.height - (this.x -object.left)*Math.tan(object.angle) - this.height/(2*cos);
				 this.vx = 0;
				 this.vy = 0;
				}
				else if(corner[1].x <= object.left){
				 this.x = object.left + (-this.height*sin + this.width*cos)/2;
				 this.y = object.height - (this.x -object.left)*Math.tan(object.angle) - this.height/(2*cos);
				 this.vx = 0;
				 this.vy = 0;
				}
				//this.x -= this.vx;
				//this.y -= this.vy;
				
				
			}
	

	}
	else if(object.type === "crate"){
		var objCorner = object.corner();
		/*If object is below this crate*/
		
		if(corner[0].x > objCorner[2].x && corner[1].x < objCorner[3].x &&
			this.y >= objCorner[2].y -(this.x -objCorner[2].x)*Math.tan(object.theta)-this.height/(2*cos)
				&& this.y+this.height/2 <object.y){
				this.y = objCorner[2].y - (this.x -objCorner[2].x)*Math.tan(object.theta) - this.height/(2*cos);	
				//////console.log("tom");
				this.contact.bottom = true;
				object.contact.top = true;
				if(object.cForces[1] !== undefined){
					object.cForces[1].x = this.sumApplied.x+this.gForce.x;
					object.cForces[1].y = this.sumApplied.y+this.gForce.y;
					
				}
				else{
					object.cForces[1] = new Vector(this.sumApplied.x+this.gForce.x, this.sumApplied.y+this.gForce.y, "RebeccaPurple");
				}
				//////console.log(this.contact.bottom);
				//////console.log(object.nForce.x);
				//////console.log(object.sFriction.x +" " + object.sFriction.y);
		}
		else{
			delete object.cForces[1];
			object.contact.top=false;
		}
			
		/*if object is to the right of this crate*/
		if( corner[0].y>objCorner[2].y && corner[3].y < objCorner[1].y) 
		{//////console.log("bob");
				if(this.x >= objCorner[1].x -(this.y -objCorner[1].y)*Math.tan(-object.theta)-this.width/(2*cos)-2
				&& this.x +this.width/2<=object.x){
				this.x = objCorner[1].x - (this.y -objCorner[1].y)*Math.tan(-object.theta) - this.width/(2*cos)+1;	
				this.y+=1;
				////console.log("tom");
				this.contact.right = true;
				object.contact.left = true;
				var temp = new Vector(this.sumApplied.x+this.gForce.x+this.sFriction.x+this.kFriction.x+this.nForce.x,
											this.sumApplied.y+this.gForce.y+this.sFriction.y+this.kFriction.y+this.nForce.y);
				var tDot = temp.dot(new Vector(cos, -sin));
				if( tDot>0){
					if(object.cForces[2] !== undefined){
						object.cForces[2].x = tDot*cos;
						object.cForces[2].y = -tDot*sin;
						object.vx = this.vx;
						object.vy = this.vy;
					}
					else{
						object.cForces[2] = new Vector( tDot*cos,-tDot*sin, "RebeccaPurple");
					}
				}
				temp = new Vector(object.sumApplied.x+object.gForce.x+object.sFriction.x+object.kFriction.x+object.nForce.x,
									object.sumApplied.y+object.gForce.y+object.sFriction.y+object.kFriction.y+object.nForce.y);
				tDot = temp.dot(new Vector(-cos,sin));
				if(tDot>0){
					if(this.cForces[3] !== undefined){
						this.cForces[3].x = -tDot*cos;
						this.cForces[3].y = tDot*sin;
					}
					else{
						this.cForces[3] = new Vector( -tDot*cos,tDot*sin, "RebeccaPurple");
					}
				}
				//////console.log(this.contact.bottom);
				//////console.log(object.nForce.x);
				//////console.log(object.sFriction.x +" " + object.sFriction.y);
			}
			else{
				delete object.cForces[2];
				delete this.cForces[3];
				object.contact.left = false;
				this.contact.right = false;
			}
		}
		else{
			delete object.cForces[2];
			delete this.cForces[3];
			object.contact.left = false;
			this.contact.right = false;
		}
		
		
		//else{}
		//if  below
			//Is CoM between edges
				//Yes: Is CoM of above ?
				//No: Move beside
		//if left
			//cForce = sum all forces on crate pointing right
		//if right
			//cForce = sum all forces on crate pointing left
		//if above
			//cForce = sum all force on crate pointing down
	}
	//console.log(this.contact.bottom);
};
/***********************************************/
/**************************************************
* update updates the both velocity and
* the position of the crate. 
* @param muStat: static coefficient of friction
* @param muKin: kinetic coefficient of friction
* @param allowMotion: boolean, is motion allowed
* @param secStep: seconds per frame
* @param gravity: rate of gravity, m/sFriction
* @param ppm: pixels per meter
***************************************************/
Crate.prototype.update= function(muStat,muKin, allowMotion, secStep, gravity, ppm){
	
	var sumX=0, sumY=0;
	var dot, cos = Math.cos(this.theta), sin= -Math.sin(this.theta);
	var speed;
	//var noMotion = false;
	if(gravity == undefined){gravity = 9.8;}
	for(var k=0; k<this.appliedForces.length; k++){
		this.aForces[k] = new Vector(this.appliedForces[k].mag().x, this.appliedForces[k].mag().y, this.appliedForces[k].color);
		//console.log(this.aForces[k].draw());
		sumX = sumX + this.aForces[k].x;
		sumY = sumY + this.aForces[k].y;
	}
	for(var k in this.cForces){
		sumX = sumX + this.cForces[k].x;
		sumY = sumY + this.cForces[k].y;
		
	}
	
	this.sumApplied = new Vector(sumX,sumY, "rgba(128,128,128,.65");
	//////console.log(this.sumApplied.x);
	this.sFriction.x = 0; this.sFriction.y = 0;
	this.kFriction.x = 0; this.kFriction.y = 0;
	if(this.contact.bottom){
		dot = (this.gForce.y + this.sumApplied.y)*cos - (this.sumApplied.x)*sin;
		this.nForce.x = dot*sin;
		this.nForce.y = -dot*cos;
		
		if(this.nForce.rotation()>Math.PI/2){
			this.nForce.x = 0; 
			this.nForce.y = 0;
		}
		//console.log("n",this.nForce.magnitude());
		//////console.log(this.vx*this.vx+this.vy*this.vy);
		if(this.vx*this.vx+this.vy*this.vy ==0){ 
			////console.log("speed zero");
			//this.vx =0;
			//this.vy=0;
		//	////console.log(this.nForce.magnitude()*muStat +" : "+ Math.abs(-(this.sumApplied.x+ this.nForce.x)*cos + (this.sumApplied.y + this.gForce.y + this.nForce.y)*sin) + " : " + this.nForce.magnitude());
		//	////console.log(this.nForce.magnitude()*muStat > Math.abs(-(this.sumApplied.x+ this.nForce.x)*cos + (this.sumApplied.y + this.gForce.y + this.nForce.y)*sin));
			//if(this.nForce.magnitude()*muStat > Math.abs(-(this.sumApplied.x+ this.nForce.x)*cos + (this.sumApplied.y + this.gForce.y + this.nForce.y)*sin)){
				//////console.log("tom");
				//////console.log(this.nForce.magnitude());
				//////console.log(muStat);
				//////console.log(this.sumApplied.x)
				var ttemp = new Vector(this.nForce.x+this.sumApplied.x, this.nForce.y + this.sumApplied.y + this.gForce.y);
				//console.log(ttemp.magnitude(), muStat*this.nForce.magnitude());
				//console.log(ttemp.x, muStat*this.nForce.x);
				//console.log(ttemp.y, muStat*this.nForce.y);
				ttemp.scale = 10;
				ttemp.draw(this.diagram);
				if(ttemp.magnitude()<= muStat*this.nForce.magnitude()){
					//console.log("sFriction");
					////console.log("total force <= potential static force"); 
					////console.log("ttemp: " +ttemp.magnitude());
					////console.log("nForce: " + this.nForce.magnitude());
					this.sFriction.x = -ttemp.magnitude()*Math.sin(ttemp.rotation());
					this.sFriction.y = ttemp.magnitude()*Math.cos(ttemp.rotation());
					////console.log("fs: " + this.sFriction.magnitude());
					//noMotion=true;
				}
				
				//if(this.sFriction.magnitude()<muStat*this.nForce.magnitude()){
					//////console.log("static friction is less than potentional statice friction");
					//noMotion=true;
				//}
				//else{noMotion=false;}
				//this.sFriction.x = muStat * this.nForce.magnitude()*cos;
				//this.sFriction.y = muStat* this.nForce.magnitude()*sin;
				//////console.log(this.sFriction.magnitude());
				//if(this.sFriction.magnitude()<0.001){this.sFriction.x= 0; this.sFriction.y=0;}
			//}
				
		}
		else{
		//if(!noMotion){
			//debugger;
			//noMotion = false;
			////console.log(this.vx+ ": " + this.vy);
			//console.log("kFriction");
			this.kFriction.x = -Math.sign(this.vx)* muKin*this.nForce.magnitude()*Math.abs(cos);
			this.kFriction.y = -Math.sign(this.vy)*muKin*this.nForce.magnitude()*Math.abs(sin);
			//////console.log(Math.sign(this.vx)*muKin);
			//////console.log(this.kFriction);
			//debugger;
		}
		//console.log("kf: ",this.kFriction.magnitude());
		//console.log("sf: ", this.sFriction.magnitude());
	}
	else{this.nForce.x =0; this.nForce.y = 0;}
	
	//set up offsets for arrow stacking on diagram
	for(var k in this.cForces){
	//	////console.log(k+ "lsit");
		this.cForces[k].offset = {x:0,y:0};
		if(k!=0&&this.cForces[0] !== undefined && Math.abs(this.cForces[k].rotation()-this.cForces[0].rotation())<0.01){
			this.cForces[k].offset.x += this.cForces[0].x+ this.cForces[0].offset.x;
			this.cForces[k].offset.y += this.cForces[0].y + this.cForces[0].offset.y;
		}
		if(Math.abs((this.cForces[k].rotation()-this.sFriction.rotation()))<0.01)
		{// ////console.log("sf");
			this.cForces[k].offset.x += this.sFriction.x;
			this.cForces[k].offset.y += this.sFriction.y;
		}else if(Math.abs((this.cForces[k].rotation()-this.kFriction.rotation()))<0.01 )//&& (this.aForces[k].x*this.kFriction.x)>=0 && (this.aForces[k].y*this.kFriction.y)>=0)
		{ //////console.log("kf");
			//////console.log("true");
			this.cForces[k].offset.x += this.kFriction.x;
			this.cForces[k].offset.y += this.kFriction.y;
		}else if(Math.abs((this.cForces[k].rotation()-this.gForce.rotation()))<0.01){
			//////console.log("grav");
			this.cForces[k].offset.y += this.gForce.y;
			//////console.log(k);
			//////console.log(this.cForces[k].offset.y);
		}else if(Math.abs((this.cForces[k].rotation()-this.nForce.rotation()))<0.01){
			this.cForces[k].offset.x += this.nForce.x;
			this.cForces[k].offset.y += this.nForce.y;
		}
		
		
		
	}
	for(var k =0; k<this.aForces.length; k++){
		this.aForces[k].offset={x:0, y:0};
		//////console.log("tom");
		for(var j=k+1; j<this.aForces.length;j++){
			//stacking wrt other aForces
			//rotation with 1/100th
			//////console.log("harry");
			if( Math.abs(this.aForces[k].rotation()-this.aForces[j].rotation())<0.01){
				this.aForces[k].offset.x = this.aForces[k].offset.x + this.aForces[j].x;
				this.aForces[k].offset.y = this.aForces[k].offset.y + this.aForces[j].y;
			}
		}
		for(var j in this.cForces){
			if(Math.abs(this.cForces[j].rotation()-this.aForces[k].rotation())<.01){
				this.aForces[k].offset.x = this.aForces[k].offset.x + this.cForces[j].x;
				this.aForces[k].offset.y = this.aForces[k].offset.y + this.cForces[j].y;
			}
		}
		//////console.log(this.aForces[k].rotation() + " : " + this.kFriction.rotation());
		if(Math.abs((this.aForces[k].rotation()-this.sFriction.rotation()))<0.01)
		{
			this.aForces[k].offset.x += this.sFriction.x;
			this.aForces[k].offset.y += this.sFriction.y;
		}else if(Math.abs((this.aForces[k].rotation()-this.kFriction.rotation()))<0.01 )//&& (this.aForces[k].x*this.kFriction.x)>=0 && (this.aForces[k].y*this.kFriction.y)>=0)
		{
			//////console.log("true");
			this.aForces[k].offset.x += this.kFriction.x;
			this.aForces[k].offset.y += this.kFriction.y;
		}else if(Math.abs((this.aForces[k].rotation()-this.gForce.rotation()))<0.01){
			this.aForces[k].offset.y += this.gForce.y;
		}else if(Math.abs((this.aForces[k].rotation()-this.nForce.rotation()))<0.01){
			this.aForces[k].offset.x += this.nForce.x;
			this.aForces[k].offset.y += this.nForce.y;
		}
		
		
		
	}
	//////console.log(noMotion);
	//debugger;
	//////console.log(this.vx, this.vy);
	//console.log(this.mass);
	if(allowMotion /*&& !noMotion*/){
		this.ax = (this.sumApplied.x + this.sFriction.x + this.nForce.x)/this.mass;
		this.ay = (this.sumApplied.y + this.sFriction.y + this.nForce.y + this.gForce.y)/this.mass;
		//console.log(this.nForce.y, this.gForce.y, this.ay);
		//console.log("before increment"+ this.vx + " : " + this.vy);
		this.vx += secStep*this.ax;
		this.vy += secStep * this.ay;
		
		//console.log("after increment"+ this.vx + " : " + this.vy);
		speed = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
		if(speed < .00000001){
			speed = 0; 
			this.vx = 0;
			this.vy = 0;
		}
		//debugger;
	//	////console.log(speed,"bob",this.vx,this.vy);
		/*if(speed < this.kFriction.magnitude()/this.mass/scale){
			this.vx = 0;
			this.vy = 0;
			this.kFriction.x =0;
			this.kFriction.y = 0;
		} 
		else{
			this.vx = (speed-this.kFriction.magnitude()/this.mass/scale)*this.vx/speed;
			this.vy = (speed-this.kFriction.magnitude()/this.mass/scale)*this.vy/speed;
		//////console.log("vx , vy: "+this.vx +", "+ this.vy);
		}
		
		if(speed < .01 && this.contact.bottom && muKin>0){
			this.vx = 0;
			this.vy = 0;
		}
		*/
		
	//	////console.log(speed, parseFloat(muKin), this.nForce.magnitude(), this.mass, scale,this.vx,this.vy,gravity,speed*speed - 2*gravity*this.vy - parseFloat(muKin)*this.nForce.magnitude()*speed/this.mass/scale );
		//console.log(this.contact.bottom, speed, muKin);
		//console.log("speed", speed);
		if(speed>0 && this.contact.bottom && parseFloat(muKin)>0){
			//console.log("kfric");
			//newV is the velocity after kinFriction acts (calculated via energy)
			var newV = speed*speed +2*gravity*this.vy*secStep - 2*parseFloat(muKin)*this.nForce.magnitude()*speed*secStep/this.mass;
				//console.log(.5*this.mass*newV, .5*this.mass*speed*speed, this.mass*gravity*this.vy*secStep, -parseFloat(muKin)*this.nForce.magnitude()*speed*secStep);
			if(newV<0 /*&& muStat > 0*/){
				//console.log(newV);
				this.vx = 0; this.vy=0;
				//console.log("catching point");
				////console.log("muStat: " + muStat);
			}
			else{
			//	console.log(this.vx, Math.sqrt(newV)*this.vx/speed);
			//	console.log(this.vy, Math.sqrt(newV)*this.vy/speed);
				this.vx =Math.sqrt(newV)*this.vx/speed; 
				this.vy =Math.sqrt(newV)*this.vy/speed;
				//console.log(Math.sqrt(this.vx*this.vx + this.vy*this.vy));
			}
			//console.log("kf: ",this.kFriction.magnitude());
			//console.log("sf: ", this.sFriction.magnitude());
		}
		//////console.log(this.vx + ", " + this.vy);
		//debugger;
		this.x += secStep*this.vx*ppm;
		this.y += secStep*this.vy*ppm;
	}
	
};
/*
KinEnergy = .5 * this.mass* (this.vx*this.vx + this.vy*this.vy);
PotEnergy = this.mass*gravity*(1000-this.y);
f_k_work = Math.sqrt(this.vx*this.vx+this.vy*this.vy)*muKin* this.nForce.magnitude();
new_KinEnery = KinEnergy + PotEnergy- f_k_Work - new_PotEnergy;
.5*this.mass*(this.vx*this.vx + this.vy*this.vy) = .5*this.mass*(this.vx*this.vx + this.vy*this.vy)+ this.mass*gravity*(1000-this.y)
													-Math.sqrt(this.vx*this.vx+this.vy*this.vy)*muKin* this.nForce.magnitude()
													-this.mass*gravity*(1000-(this.y+this.vy))

*/
