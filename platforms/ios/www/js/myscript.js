// JavaScript Document
var wrapper, playing, footer, footerButtons, page, headerButtons, songs;
var runCanvas = true;
var playPause, orientation;
var myScroll;

document.addEventListener("deviceready", onDeviceReady, false);
//document.addEventListener("DOMContentLoaded", onDeviceReady, false);

function onDeviceReady() {
	//navigator.splashscreen.hide();
	setScrollEvent(0);
	
	wrapper = document.querySelector('#wrapper');
	playing = document.querySelector('#playing');
	songs = document.querySelector('#songs');
	footer = document.querySelector('#footer');
	footerButtons = document.querySelectorAll('#footer .footerButtons');
	page = document.querySelectorAll('[data-role=page]');
	headerButtons = document.querySelectorAll('#header .headerButtons');
	canvas = document.querySelector('#musicCanvas');
	playPause = document.querySelector('#playPause');
	playing.style.height = window.innerHeight + "px";
	
	
	if (window.innerHeight < 450) {
		canvas.style.display = "none";
		runCanvas = false;
	}else {
		runCanvas = true;
		ctx = canvas.getContext('2d');
		canvas.width = window.innerWidth;
		//Bottom controls height = 217 plus app header = 48 which gives total of 265 add an extra 15px padding  280
		canvas.height = window.innerHeight - 280;
		patriclesNum = canvas.height - 100;
		w = canvas.width;
		h = canvas.height;
	}

	if(runCanvas)setCanvasLogo();
	setHeaderEvents();
	setFooterEvents();
	
	
	window.addEventListener("orientationchange", readDeviceOrientation, true);
}

function readDeviceOrientation() {                		
    if (Math.abs(window.orientation) === 90) {
        // Landscape
		 alert ("LANDSCAPE");
    } else {
    	// Portrait
		alert ("PORTRAIT");
    }
}

var setScrollEvent = function(r) {
    myScroll = new IScroll('#wrapper', { mouseWheel: true }, r);
};
var setHeaderEvents = function() {
    for (var i = 0; i < headerButtons.length; i++) {      
        headerButtons[i].addEventListener('click', headerClicked, false);
    }
};

var removeHeaderEvents = function() {
    for (var i = 0; i < headerButtons.length; i++) {      
        headerButtons[i].removeEventListener('click', headerClicked, false);
    }
};
var setFooterEvents = function() {
    for (var i = 0; i < footerButtons.length; i++) {      
        footerButtons[i].addEventListener('click', footerClicked, false);
    }
};
var removeFooterEvents = function() {
    for (var i = 0; i < footerButtons.length; i++) {      
        footerButtons[i].removeEventListener('click', footerClicked, false);
    }
};
var setSongControls = function() {
    playPause.addEventListener('click', playPauseClicked, false);
};

var removeSongControls = function() {
    for (var i = 0; i < headerButtons.length; i++) {      
        headerButtons[i].removeEventListener('click', headerClicked, false);
    }
};

function playPauseClicked() {

	if (this.dataset.play == "0") {
		playMedia();
		this.dataset.play = "1";
		this.src = "img/pause.png";
		
	}else {
		pauseMedia();
		this.dataset.play = "0";
		this.src = "img/play.png";
	}
}
/*
function startMusicAnimation() {
		draw();
  		animateMusic = requestAnimationFrame(startMusicAnimation);
}
*/
function addParticlesForAnimation() {
	for(var i = 0; i < patriclesNum; i++){
		particles.push(new Factory);
	}
}
/*
function stopMusicAnimation() {
	cancelAnimationFrame(animateMusic);
	particles = [];
}
*/
function setCanvasLogo() {
	ctx.clearRect(0, 0, w, h);
	var imageObj = new Image();
	imageObj.src = 'img/logo.png';
      imageObj.onload = function() {
        ctx.drawImage(imageObj, 0, 0, w, h);
		 ctx.save();
    };
}
function headerClicked(ev) {
	ev.preventDefault();
	var data = this.dataset.page;
	
	if (data == "0"){
		changePage(1);
	}else if (data == "1"){
		changePage(0);
	}
}

function footerClicked(ev) {
	ev.preventDefault();
	
	if (!this.classList.contains("active")){
		for (var i=0; i<footerButtons.length;i++){
			if(footerButtons[i].classList.contains("active")){
				var tpHolder1 = footerButtons[i].children[0];
				var tpHolder2 = tpHolder1.children[0];
				tpHolder2.src = "img/" + tpHolder2.dataset.image + "-gray.png";
				footerButtons[i].classList.remove("active");
				footerButtons[i].children[1].classList.remove("active");	
				
			}
		}
		var tpHolder3 = this.children[0];
		var tpHolder4 = tpHolder3.children[0];
		tpHolder4.src = "img/" + tpHolder4.dataset.image + "-red.png";
		this.classList.add("active");
		this.children[1].classList.add("active");
	}
}

function footerChangePage(switchToPage) {
	
}
function changePage(switchToPage) {
	
	removeHeaderEvents();
	
	if (switchToPage == 0) {
		wrapper.style.bottom = "48px";
		footer.style.display = "block";
		page[0].style.display = "block";
		headerButtons[1].style.display = "inline-block";
		headerButtons[0].style.display = "none";
		page[1].classList.add('animation-slide-out-right');
		page[0].classList.add('animation-slide-in-left');
		footer.classList.add('animation-slide-in-left');
		headerButtons[1].dataset.page = "0";
		
		setTimeout(function() {
			 
            page[1].style.display = "none";
			 page[0].classList.remove('animation-slide-in-left');
			 footer.classList.remove('animation-slide-in-left');
			 page[1].classList.remove('animation-slide-out-right');
			 setHeaderEvents();
			 setScrollEvent(0);
        }, 500);
		 
		 
	}else if (switchToPage == 1) {
		myScroll.disable();
		wrapper.style.bottom = "0";
		page[0].classList.add('animation-slide-out-left');
		footer.classList.add('animation-slide-out-left');
		page[1].style.display = "block";
		page[1].classList.add('animation-slide-in-right');
		headerButtons[1].style.display = "none";
		headerButtons[0].style.display = "inline-block";
		headerButtons[1].dataset.page = "1";
		
		setTimeout(function() {
			 page[0].style.display = "none";
			 footer.style.display = "none";
			 page[0].classList.remove('animation-slide-out-left');
			 footer.classList.remove('animation-slide-out-left');
			 page[1].classList.remove('animation-slide-in-right');
			 setHeaderEvents();
			 setSongControls();
        }, 500);
		 
	}
}