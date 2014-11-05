 var canvas, ctx, patriclesNum, particles = [], w, h, colors = ['#D7D7D7','#F7F7F7','#898C90','#BDBEC2','#DBDDDE'], animateMusic;
 //BEST ONE: colors = ['#D7D7D7','#898C90','#FF3B30','#FF5E3A','#DBDDDE'];
 //colors = ['#007AFF','#C643FC','#FF9500','#4CD964','#5856D6'];
 //colors = ['#f35d4f','#f36849','#c0d988','#6ddaf1','#f1e85b'];
 function Factory(){  
  this.x =  Math.round( Math.random() * w);
  this.y =  Math.round( Math.random() * h);
  this.rad = Math.round( Math.random() * 1) + 1;
  this.rgba = colors[ Math.round( Math.random() * 3) ];
  this.vx = Math.round( Math.random() * 3) - 1.5;
  this.vy = Math.round( Math.random() * 3) - 1.5;
}
   
function draw(){
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'lighter';
  for(var i = 0;i < patriclesNum; i++){
    var temp = particles[i];
    var factor = 1;
    if (temp == null) {
		//console.log("MADE IT");
		break;
	}
    for(var j = 0; j<patriclesNum; j++){
      
       var temp2 = particles[j];
       ctx.linewidth = 0.5;
      
       if(temp.rgba == temp2.rgba && findDistance(temp, temp2)<50){
          ctx.strokeStyle = temp.rgba;
          ctx.beginPath();
          ctx.moveTo(temp.x, temp.y);
          ctx.lineTo(temp2.x, temp2.y);
          ctx.stroke();
          factor++;
       }
    }
    
    
    ctx.fillStyle = temp.rgba;
    ctx.strokeStyle = temp.rgba;
    
    ctx.beginPath();
    ctx.arc(temp.x, temp.y, temp.rad*factor, 0, Math.PI*2, true);
    ctx.fill();
    ctx.closePath();
    
    ctx.beginPath();
    ctx.arc(temp.x, temp.y, (temp.rad+5)*factor, 0, Math.PI*2, true);
    ctx.stroke();
    ctx.closePath();
    

    temp.x += temp.vx;
    temp.y += temp.vy;
    
    if(temp.x > w)temp.x = 0;
    if(temp.x < 0)temp.x = w;
    if(temp.y > h)temp.y = 0;
    if(temp.y < 0)temp.y = h;
  }
}

function findDistance(p1,p2){  
  return Math.sqrt( Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) );
}
/*
requestAnimFrame = (function(){
  return  requestAnimationFrame       ||
          webkitRequestAnimationFrame ||
          mozRequestAnimationFrame    ||
          function( callback ){
            setTimeout(callback, 1000 / 60);
          };
})();
*/
