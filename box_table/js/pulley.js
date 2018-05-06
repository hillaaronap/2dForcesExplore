function Pulley (x,y,radius,toggle){
	this.x= x;
	this.y = y;
	this.radius = radius;
	this.toggle = toggle;
	this.containsPoint = function(ex,why){
		return Math.sqrt((ex - this.x)*(ex-this.x)+(why-this.y)*(why-this.y))<this.radius;
	}
	this.select= false;
	this.fillColor= "red";
	this.lineColor= "black";
	this.mountWidth=4;
	this.mount = {x:this.x, y:0};
	this.rope = {
		width:2, color:"white", start: {x:this.x,y:this.y},
		end: {x:this.x+100,y:this.y, radius:5,
			containsPoint: function(ex,why){
				return Math.sqrt((ex - this.x)*(ex-this.x)+(why-this.y)*(why-this.y))<this.radius;
			}
		}
	};
	this.hanging = undefined;
	this.hooked = undefined;
	this.type = "pulley";
}
Pulley.prototype.draw = function(context){
	//draw a pulley
	context.save();
	context.strokeStyle = this.lineColor;
	context.fillStyle = this.fillColor;
	context.lineWidth = 1;
	//pulley
	context.beginPath();
	context.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
	context.fill();
	context.stroke();
	context.closePath();
	//mount
	context.lineWidth = this.mountWidth;
	context.beginPath();
	context.moveTo(this.mount.x, this.mount.y);
	context.lineTo(this.x, this.y);
	context.stroke();
	//rope
	context.strokeStyle = this.rope.color;
	context.lineWidth = this.rope.width;
	context.beginPath();
	if(this.hanging!==undefined){
		context.moveTo(this.x-this.radius, this.rope.start.y);
		context.lineTo(this.hanging.x, this.hanging.y-this.hanging.height/2);
	}
	context.arc(this.x,this.y, this.radius, Math.PI, Math.PI-Math.atan2(this.x-this.rope.end.x, this.y-this.rope.end.y));
	context.lineTo(this.rope.end.x,this.rope.end.y);
	context.stroke();
	//hook
	context.strokeStyle = "#4682b4";
	context.lineWidth = 1;
	context.beginPath();
	context.arc(this.rope.end.x, this.rope.end.y, this.rope.end.radius, 0, Math.PI*2)
	context.stroke();
	context.restore();
};

Pulley.prototype.update = function (muStat, muKin, allowMotion, secStep, gravity, ppm){
	if(typeof this.hanging == 'undefined'){
		var theta = Math.atan2(this.hooked.x-this.x, this.hooked.y);
		this.hooked.update(0,0,false,secStep,gravity,ppm);
		if(typeof this.hooked.cForces[0] == 'undefined'){this.hooked.cForces[0] = new Vector(0,0);}
		var temp = new Vector(this.hooked.sumApplied.x-this.hooked.cForces[0].x + this.hooked.gForce.x, this.hooked.sumApplied.y-this.hooked.cForces[0].y+this.hooked.gForce.y);
		 
		 this.hooked.cForces[0] = new Vector(temp.magnitude()*Math.cos(-temp.rotation()-theta)*Math.sin(theta),Math.cos(theta)*temp.magnitude()*Math.cos(-temp.rotation()-theta),"blue");
		//	console.log(this.hooked);
		 this.hooked.update(0,0,true,secStep,gravity,ppm);
		 //console.log(this.hooked);
		 this.hooked.y = Math.sqrt((this.rope.end.x-this.x)*(this.rope.end.x-this.x)+(this.rope.end.y)*(this.rope.end.y)-(this.hooked.x-this.x)*(this.hooked.x-this.x))
		 if(this.hooked.y<0){this.hooked.y=0;}
		 //console.log(this.hooked.ay);
		if(Math.sqrt((this.rope.end.x-this.x)*(this.rope.end.x-this.x)+(this.rope.end.y-this.y)*(this.rope.end.y-this.y))!=
		   Math.sqrt((this.hooked.x-this.x)*(this.hooked.x-this.x)+(this.hooked.y-this.y)*(this.hooked.y-this.y))){
			   //this.hooked.y = (this.hooked.x-this.x)*(this.rope.end.y)/(this.rope.end.x-this.x);
		   }
		this.rope.end.x = this.hooked.x;
		this.rope.end.y = this.hooked.y;
	}
	else{
		var sumX=0, sumY=0;
		var dot, cos = Math.cos(this.hooked.theta), sin = -Math.sin(this.hooked.theta);
		var speed;
		if(typeof gravity == 'undefined'){gravity = 9.8;}
		for(var k=0; k<this.hooked.appliedForces.length; k++){
		 this.hooked.aForces[k] = new Vector(this.hooked.appliedForces[k].mag().x, this.hooked.appliedForces[k].mag().y, this.hooked.appliedForces[k].color);
		 //console.log(this.hooked.aForces[k].draw());
		 sumX = sumX + this.hooked.aForces[k].x;
		 sumY = sumY + this.hooked.aForces[k].y;
		}
		for(var k in this.hooked.cForces){
	 	 sumX = sumX + this.hooked.cForces[k].x;
		 sumY = sumY + this.hooked.cForces[k].y;
		
		}
	
	this.hooked.sumApplied = new Vector(sumX,sumY, "rgba(128,128,128,.65");
	//////console.log(this.hooked.sumApplied.x);
	this.hooked.sFriction.x = 0; this.hooked.sFriction.y = 0;
	this.hooked.kFriction.x = 0; this.hooked.kFriction.y = 0;
	if(this.hooked.contact.bottom){
		dot = (this.hooked.gForce.y + this.hooked.sumApplied.y)*cos - (this.hooked.sumApplied.x)*sin;
		this.hooked.nForce.x = dot*sin;
		this.hooked.nForce.y = -dot*cos;
		
		if(this.hooked.nForce.rotation()>Math.PI/2){
			this.hooked.nForce.x = 0; 
			this.hooked.nForce.y = 0;
		}
		//console.log("n",this.hooked.nForce.magnitude());
		//////console.log(this.hooked.vx*this.hooked.vx+this.hooked.vy*this.hooked.vy);
		if(this.hooked.vx*this.hooked.vx+this.hooked.vy*this.hooked.vy ==0){ 
			
				var ttemp = new Vector(this.hooked.nForce.x+this.hooked.sumApplied.x, this.hooked.nForce.y + this.hooked.sumApplied.y + this.hooked.gForce.y);
				
				if(ttemp.magnitude()<= muStat*this.hooked.nForce.magnitude()){
					
					this.hooked.sFriction.x = -ttemp.magnitude()*Math.sin(ttemp.rotation());
					this.hooked.sFriction.y = ttemp.magnitude()*Math.cos(ttemp.rotation());
					////console.log("fs: " + this.sFriction.magnitude());
					//noMotion=true;
				}
				
				
				
		}
		else{
		
			this.hooked.kFriction.x = -Math.sign(this.hooked.vx)* muKin*this.hooked.nForce.magnitude()*Math.abs(cos);
			this.hooked.kFriction.y = -Math.sign(this.hooked.vy)*muKin*this.hooked.nForce.magnitude()*Math.abs(sin);
			
		}
		//console.log("kf: ",this.kFriction.magnitude());
		//console.log("sf: ", this.sFriction.magnitude());
	}
	else{this.hooked.nForce.x =0; this.hooked.nForce.y = 0;}
	
	//set up offsets for arrow stacking on diagram
	for(var k in this.hooked.cForces){
	//	////console.log(k+ "lsit");
		this.hooked.cForces[k].offset = {x:0,y:0};
		if(k!=0&&this.hooked.cForces[0] !== undefined && Math.abs(this.hooked.cForces[k].rotation()-this.hooked.cForces[0].rotation())<0.01){
			this.hooked.cForces[k].offset.x += this.hooked.cForces[0].x+ this.hooked.cForces[0].offset.x;
			this.hooked.cForces[k].offset.y += this.hooked.cForces[0].y + this.hooked.cForces[0].offset.y;
		}
		if(Math.abs((this.hooked.cForces[k].rotation()-this.hooked.sFriction.rotation()))<0.01)
		{// ////console.log("sf");
			this.hooked.cForces[k].offset.x += this.hooked.sFriction.x;
			this.hooked.cForces[k].offset.y += this.hooked.sFriction.y;
		}else if(Math.abs((this.hooked.cForces[k].rotation()-this.hooked.kFriction.rotation()))<0.01 )//&& (this.hooked.aForces[k].x*this.hooked.kFriction.x)>=0 && (this.hooked.aForces[k].y*this.hooked.kFriction.y)>=0)
		{ //////console.log("kf");
			//////console.log("true");
			this.hooked.cForces[k].offset.x += this.hooked.kFriction.x;
			this.hooked.cForces[k].offset.y += this.hooked.kFriction.y;
		}else if(Math.abs((this.hooked.cForces[k].rotation()-this.hooked.gForce.rotation()))<0.01){
			//////console.log("grav");
			this.hooked.cForces[k].offset.y += this.hooked.gForce.y;
			//////console.log(k);
			//////console.log(this.hooked.cForces[k].offset.y);
		}else if(Math.abs((this.hooked.cForces[k].rotation()-this.hooked.nForce.rotation()))<0.01){
			this.hooked.cForces[k].offset.x += this.hooked.nForce.x;
			this.hooked.cForces[k].offset.y += this.hooked.nForce.y;
		}
		
		
		
	}
	for(var k =0; k<this.hooked.aForces.length; k++){
		this.hooked.aForces[k].offset={x:0, y:0};
		//////console.log("tom");
		for(var j=k+1; j<this.hooked.aForces.length;j++){
			//stacking wrt other aForces
			//rotation with 1/100th
			//////console.log("harry");
			if( Math.abs(this.hooked.aForces[k].rotation()-this.hooked.aForces[j].rotation())<0.01){
				this.hooked.aForces[k].offset.x = this.hooked.aForces[k].offset.x + this.hooked.aForces[j].x;
				this.hooked.aForces[k].offset.y = this.hooked.aForces[k].offset.y + this.hooked.aForces[j].y;
			}
		}
		for(var j in this.hooked.cForces){
			if(Math.abs(this.hooked.cForces[j].rotation()-this.hooked.aForces[k].rotation())<.01){
				this.hooked.aForces[k].offset.x = this.hooked.aForces[k].offset.x + this.hooked.cForces[j].x;
				this.hooked.aForces[k].offset.y = this.hooked.aForces[k].offset.y + this.hooked.cForces[j].y;
			}
		}
		//////console.log(this.hooked.aForces[k].rotation() + " : " + this.hooked.kFriction.rotation());
		if(Math.abs((this.hooked.aForces[k].rotation()-this.hooked.sFriction.rotation()))<0.01)
		{
			this.hooked.aForces[k].offset.x += this.hooked.sFriction.x;
			this.hooked.aForces[k].offset.y += this.hooked.sFriction.y;
		}else if(Math.abs((this.hooked.aForces[k].rotation()-this.hooked.kFriction.rotation()))<0.01 )//&& (this.hooked.aForces[k].x*this.hooked.kFriction.x)>=0 && (this.hooked.aForces[k].y*this.hooked.kFriction.y)>=0)
		{
			//////console.log("true");
			this.hooked.aForces[k].offset.x += this.hooked.kFriction.x;
			this.hooked.aForces[k].offset.y += this.hooked.kFriction.y;
		}else if(Math.abs((this.hooked.aForces[k].rotation()-this.hooked.gForce.rotation()))<0.01){
			this.hooked.aForces[k].offset.y += this.hooked.gForce.y;
		}else if(Math.abs((this.hooked.aForces[k].rotation()-this.hooked.nForce.rotation()))<0.01){
			this.hooked.aForces[k].offset.x += this.hooked.nForce.x;
			this.hooked.aForces[k].offset.y += this.hooked.nForce.y;
		}
		
		
		
	}
		if(typeof this.hooked.cForces[0] == 'undefined'){this.hooked.cForces[0] = new Vector(0,0);}
		if(allowMotion){
			/*this.hooked.ax = (-this.hanging.gForce.y*cos +this.hooked.sFriction.x+this.hooked.sumApplied.x-this.hooked.cForces[0].x+this.hooked.nForce.x)/(this.hanging.mass + this.hooked.mass);
			this.hooked.ay = (this.hanging.gForce.y*sin +this.hooked.sFriction.y + this.hooked.sumApplied.y-this.hooked.cForces[0].y + this.hooked.nForce.y)/(-this.hooked.mass + this.hanging.mass);
			this.hanging.ay = -Math.sqrt(this.hooked.ax*this.hooked.ax+this.hooked.ay*this.hooked.ay)*Math.sign(this.hooked.x);
			this.hooked.vx += secStep*this.hooked.ax;
			this.hooked.vy += secStep * this.hooked.ay;*/
			this.hooked.ax = (-gravity*this.hanging.mass + this.hooked.sFriction.x + this.hooked.sumApplied.x)/(this.hanging.mass+this.hooked.mass);
			this.hanging.ay = -this.hooked.ax;
			this.hooked.vx += secStep * this.hooked.ax;
			this.hanging.vy = -this.hooked.vx;
			//this.hooked.vx = 0;
			//this.hooked.vy += -secStep * Math.sign(this.hanging.vx)*Math.sqrt(this.hanging.vx*this.hanging.vx+this.hanging.vy*this.hanging.vy);
			
			speed = Math.sqrt(this.hooked.vx*this.hooked.vx+this.hooked.vy*this.hooked.vy);
			if(speed < .00000001){
				speed=0;
				this.hooked.vx=0;
				this.hooked.vy=0;
			}
			
			if(speed>0 && this.hooked.contact.bottom && parseFloat(muKin)>0){
			//console.log("kfric");
			//newV is the velocity after kinFriction acts (calculated via energy)
				var newV = speed*speed +2*gravity*this.hooked.vy*secStep - 2*parseFloat(muKin)*this.hooked.nForce.magnitude()*speed*secStep/this.hooked.mass;
				//console.log(.5*this.hooked.mass*newV, .5*this.hooked.mass*speed*speed, this.hooked.mass*gravity*this.hooked.vy*secStep, -parseFloat(muKin)*this.hooked.nForce.magnitude()*speed*secStep);
				if(newV<0 /*&& muStat > 0*/){
				//console.log(newV);
					this.hooked.vx = 0; this.hooked.vy=0;
				//console.log("catching point");
				////console.log("muStat: " + muStat);
				}
				else{
			//	console.log(this.hooked.vx, Math.sqrt(newV)*this.hooked.vx/speed);
			//	console.log(this.hooked.vy, Math.sqrt(newV)*this.hooked.vy/speed);
					this.hooked.vx =Math.sqrt(newV)*this.hooked.vx/speed; 
					this.hooked.vy =Math.sqrt(newV)*this.hooked.vy/speed;
					//console.log(Math.sqrt(this.vx*this.vx + this.vy*this.vy));
				}
			//console.log("kf: ",this.kFriction.magnitude());
			//console.log("sf: ", this.sFriction.magnitude());
			}
		//////console.log(this.vx + ", " + this.vy);
		//debugger;
			this.hooked.x += secStep*this.hooked.vx*ppm;
			this.hooked.y += secStep*this.hooked.vy*ppm;
			this.hanging.y += -secStep*ppm*Math.sign(this.hooked.vx)*Math.sqrt(this.hooked.vx*this.hooked.vx+this.hooked.vy*this.hooked.vy);
			console.log(Math.sin(this.hooked.vx));
			console.log(this.hanging.y, "hanging y");
			this.hanging.cForces[0] = new Vector(0,-this.hanging.mass*(-this.hanging.ay + gravity), "Blue");
			this.hooked.cForces[0] = new Vector(this.hanging.cForces[0].y*cos, this.hanging.cForces[0].y*sin, "Blue");
			//console.log(-this.hanging.gForce.y,cos ,this.hooked.sFriction.x,this.hooked.sumApplied.x,this.hooked.nForce.x,this.hanging.mass, this.hooked.mass, this.hooked.ay);
			console.log(this.hooked.vx, this.hooked.vy);
		}
		
		//var ax = (-this.hanging.gForce*Math.cos(this.hooked.theta)+this.hooked.sFriction.x
		/*this.hanging.update(ms, mk, false, secStep, g, m);
		this.hooked.update(ms, mk, false, secStep, g, m);
		this.hooked.cForces[0] = new Vector(-Math.abs(this.hanging.mass*(this.hanging.ay+g))*Math.cos(this.hooked.theta),
			Math.abs(this.hanging.mass*(this.hanging.ay+g))*Math.sin(this.hooked.theta),"Blue" );
		//this.hanging.update(ms, mk, false, secStep, g, m);
		var Tx = this.hooked.sumApplied.x -this.hooked.cForces[0].x+ this.hooked.sFriction.x+this.hooked.nForce.x+this.hooked.kFriction.x;
		var Ty = this.hooked.sumApplied.y -this.hooked.cForces[0].y+ this.hooked.sFriction.y+this.hooked.nForce.y+this.hooked.kFriction.y+this.hooked.gForce.y;
		this.hanging.cForces[0] = new Vector(0, -Math.sqrt(Tx*Tx +Ty*Ty),"Blue");
		//console.log(this.hooked.cForces[0].magnitude);
		this.hanging.update(ms, mk, allow_motion, secStep, g, m);
		this.hooked.update(ms, mk, allow_motion, secStep, g, m);*/
		this.rope.end.x = this.hooked.x;
		this.rope.end.y = this.hooked.y;
	
	}
};