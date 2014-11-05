// JavaScript Document
var wrapper, header, playing, settings, songContainer, songExtras, footer, footerButtons, page, headerButtons, songs, deleteBtn;
var runCanvas = true;
var playPause, rewindFF, orientation;
var myScroll;
var fileDur, theMedia, theTimer, track, songStart, songEnd, songInput, songVolume, volume, songTitle, songArtist;
var data2 = [];
var store;
var items = [];
var ajaxImg = '<img src="img/ajax-loader.gif" />';
var assetURL, picURL, epTitle, pdTitle;
var episodePlaying, eposideUniqueID, episodePlayingText;
var onlineOffline;
var downloadArray = [], ajaxOffline = [], ajaxArray = [];
var downloadInProgress;
var myVar, ajaxLoader;
var notFinished = false;

document.addEventListener("deviceready", onDeviceReady, false);
//document.addEventListener("DOMContentLoaded", onDeviceReady, false);

function onDeviceReady() {

    //FastClick.attach(document.body);

	
	checkDB();
   	//deleteDB();
	navigator.splashscreen.hide();
	//setScrollEvent(0);
	
	wrapper = document.querySelector('#wrapper');
	header = document.querySelector('#header');
	playing = document.querySelector('#playing');
	settings = document.querySelector('#settings');
	songContainer = document.querySelector('.songContainer');
	songs = document.querySelector('#songs');
	footer = document.querySelector('#footer');
	ajaxLoader = document.querySelector('#ajaxLoader');
	footerButtons = document.querySelectorAll('#footer .footerButtons');
	songExtras = document.querySelectorAll(".songExtras span");
	page = document.querySelectorAll('[data-role=page]');
	headerButtons = document.querySelectorAll('#header .headerButtons');
	canvas = document.querySelector('#musicCanvas');
	playPause = document.querySelector('#playPause');
	rewindFF = document.querySelectorAll('.songControls .rewindFF');
	songTitle = document.querySelector(".songInfo .songTitle");
	songArtist = document.querySelector(".songInfo .songArtist");
	songStart = document.querySelector(".songTime .songStart");
   	songEnd = document.querySelector(".songTime .songEnd");
	songInput = document.querySelector(".songTime #fader");
	songVolume = document.querySelectorAll(".songVolume img");
	volume = document.querySelector(".songVolume #volume");
	deleteBtn = document.querySelectorAll(".deleteBtn");
	
	playing.style.height = window.innerHeight + "px";
	settings.style.height = window.innerHeight + "px";
	
	
	if (window.innerHeight < 450) {
		canvas.style.display = "none";
		page[1].classList.add('noCanvas');
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

	if(runCanvas)setCanvasLogo("img/logo.png");
	setHeaderEvents();
	setFooterEvents();
	setSettingsEvents();
	setSongControls();
	
	
	document.addEventListener("online", appOnline, false);
    document.addEventListener("offline", appOffline, false);
	//This function simulates the device receiving and losing internet connection every 5 seconds
	ajaxOffline.push("feeds.feedburner.com/thrillingadventurehour");
	 		
    onlineOffline = true;
    setInterval(function() {
        if (onlineOffline) {
            sim.goOnline();
            onlineOffline = false;
        } else {
            sim.goOffline();
            onlineOffline = true;
        }
    }, 5000);
	
	//page[1].addEventListener("click", function(){alert("YO");}, true);
	//window.resolveLocalFileSystemURL(cordova.file.dataDirectory, makeFolder, weirdError);	
	
	/* Somewhat works but there is a better way PORTRAIT ONLY :)
	window.addEventListener("orientationchange", readDeviceOrientation, true);
	*/
}
function appOnline() {
	console.log("WE ONLINE");
	if (ajaxOffline.length) {
		console.log ("AJAXOFF ARRAY: " + ajaxArray.length);
		ajaxArray.push(ajaxOffline[0]);
		ajaxOffline.shift();
	}
	if (ajaxArray.length) {
		console.log ("AJAX ARRAY: " + ajaxArray.length);
		//alert (ajaxArray[0]);
		getAjax(ajaxArray[0]);
	}
    //getAjax("http://feeds.feedburner.com/ThrillingAdventureHour");
	if (downloadArray.length) {
		console.log ("Download ARRAY: " + downloadArray.length);
		//console.log ("WE DOWNLOADING");
		downloadThrillFile (downloadArray[0]);
	}
}

function appOffline() {
    console.log("WE OFFLINE");
}

function weirdError() {
	console.log ("WEIRD ERROR");
}
function transferFailed(evt) {
  console.log("An error occurred while transferring the file. Error Code " + evt);
  navigator.notification.confirm(
			'Please Enter a valid URL', // message
			 doNothing,            // callback to invoke with index of button pressed
			'Traks',           // title
			['OK']     // buttonLabels
	);
}
function getAjax(url) {
	
	ajaxLoader.innerHTML = ajaxImg;
	var tmpUrl = url.substring(0, 3);
	if (tmpUrl != "http") {
		url = "http://" + url;
	}
	console.log ("THE URL: "+ url);
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("error", transferFailed, false);
			//"http://feeds.feedburner.com/WelcomeToNightVale"
			//xhr.open("GET", "http://feeds.feedburner.com/ThrillingAdventureHour", true);
			//xhr.open("GET", "http://feeds.feedburner.com/7JoursSurLaPlaneteVideos", true);
			xhr.open("GET", url, true);
			
			xhr.onreadystatechange = function() {
			 
			  if (xhr.readyState == 4) {
				 ajaxLoader.innerHTML = "";
				// JSON.parse does not evaluate the attacker's scripts.
				try {
				var counter = 0;
				var oDOM = xhr.responseXML;
				//console.log (resp);
				//var oParser = new DOMParser();
				//var oDOM = oParser.parseFromString(resp, "text/xml");
				// print the name of the root element or error message
				
					var tpTitle1 = oDOM.getElementsByTagName('channel')[0];
					var tpTitle2 = tpTitle1.getElementsByTagName('title')[0].childNodes[0].nodeValue;
					var tpImage1 = oDOM.getElementsByTagName('image')[0];
					var tpImage2 = tpImage1.getElementsByTagName('url')[0].childNodes[0].nodeValue;
					var tpItems = oDOM.getElementsByTagName('item');
					
					if (tpItems.length > 2){counter = 2;}else {counter = tpItems.length;}
						items = [];
						for (var i = 0; i < counter; i++) {
							
							tpItem = tpItems[i];
							var tpEpTitle = tpItem.getElementsByTagName('title')[0].childNodes[0].nodeValue;
							var tpLink = tpItem.getElementsByTagName('enclosure')[0].attributes.getNamedItem('url').value
						
							items.push({
								pdTitle: tpTitle2,
								epTitle: tpEpTitle,
								dLink: tpLink,
								image: tpImage2
							});
							ajaxArray.shift();
							downloadArray.push(items[i]);	
							console.log("CALLED");	
						}
				}catch (ex) {
					console.log ("YO GUY");
					ajaxLoader.innerHTML = "";
					ajaxArray.shift();
					xhr.abort();
				}
						console.log (items[0]);
					
						if(onlineOffline){appOnline();}
					
				    }
			    }
			  

xhr.send();
}
function doNothing () {
	//Do nothing
}
function makeFolder (dir) {
	//console.log ();
	dir.getDirectory("podcasts",{create: true, exclusive: false}, function(dir){console.log("Created dir "+dir.name);},function(error){console.log("Error creating directory "+ fileErrorCode(error.code));})
}
function downloadThrillFile (a) {
	//var safeName = a.epTitle.replace(/[^a-z0-9]/gi, '_');
	console.log("DOWNLOAD INITIATED");
	if (!downloadInProgress) {
	console.log (a);
	assetURL = a.dLink;
	picURL = a.image;
	var tmpEpTitle = a.epTitle;
	var tmpPdTitle = a.pdTitle;
	pdTitle = tmpPdTitle.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
   return '&#'+i.charCodeAt(0)+';';
	});
	epTitle = tmpEpTitle.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
   return '&#'+i.charCodeAt(0)+';';
	});
	
	var n = a.dLink.lastIndexOf('/');
	fileName = a.dLink.substring(n + 1);
	store = cordova.file.dataDirectory + "podcasts/";
	console.log (store + fileName);
	window.resolveLocalFileSystemURL(store + fileName, alreadyD, downloadAsset);
	}
}

function alreadyD(fileEntry) {
	console.log ("It looks like you have already downloaded that File");
	downloadArray.shift();
	if (onlineOffline) {appOnline();}
}
function downloadAsset() {
	var calledOnce = false;
	var b = 0
	var fileTransfer = new FileTransfer();
	var newDiv, newSpan;
	var pComplete;
	console.log("About to start transfer");
	fileTransfer.onprogress = function(progressEvent) {
		
		if (!calledOnce) {
			wrapper.style.top = "50px";
			header.style.height = "50px";
		    newDiv = document.createElement("div"); 
			newDiv.className = "meter red";
			newSpan = document.createElement("span");
			newSpan.style.width = "0%";
			newDiv.appendChild(newSpan);
			header.appendChild(newDiv);
			downloadInProgress = true;
			calledOnce = true;
		}
		if (progressEvent.lengthComputable) {
		  pComplete = progressEvent.loaded / progressEvent.total * 100;
		  if (pComplete <= 25){
			  newSpan.style.width = progressEvent.loaded / progressEvent.total * 100 + "%";
			  //console.log (progressEvent.loaded / progressEvent.total * 100 );
		  }else if (pComplete > 25 && pComplete < 75 ){
			  newDiv.className = "meter orange";
			  newSpan.style.width = progressEvent.loaded / progressEvent.total * 100 + "%";
			  //console.log (progressEvent.loaded / progressEvent.total * 100 );
		  }else if (pComplete >= 75) {
			  newDiv.className = "meter green";
			  newSpan.style.width = progressEvent.loaded / progressEvent.total * 100 + "%";
			  //console.log (progressEvent.loaded / progressEvent.total * 100 );
		  }
		} else {
		  console.log (b++);
		}
	};
	console.log (store + fileName);
	fileTransfer.download(assetURL, store + fileName, 
		function(entry) {
			console.log("Success!");
			newDiv.parentElement.removeChild(newDiv);
			wrapper.style.top = "45px";
			header.style.height = "45px";
			console.log (entry.toURL());
			
			insertDB(pdTitle, epTitle, entry.toURL(), picURL);
			downloadInProgress = false;
			downloadArray.shift();
			if (onlineOffline) {appOnline();}
			/* CHANGE2 
			theMedia = new Media(entry.toURL(), onMediaSuccess, function(e) { alert(JSON.stringify(e));});
			if (theMedia) {
				episodePlaying = entry.toURL();
				playMedia();
			}
			*/
		}, 
		function(err) {
			console.log("Error");
			console.dir(err);
		});
}
function settingsClicked () {
	if (this.dataset.settings == "0") {
		navigator.notification.confirm(
			'This will delete all your podcasts', // message
			 deleteAllPodcasts1,            // callback to invoke with index of button pressed
			'Traks',           // title
			['OK', 'Cancel']     // buttonLabels
		);
		
	}else {
		navigator.notification.confirm(
			'This is a paid feature Upgrade!', // message
			 doNothing,            // callback to invoke with index of button pressed
			'Traks',           // title
			['OK']     // buttonLabels
			);
	}
}
function deletePodDirectory (entry) {

// remove the directory and all it's contents
	entry.removeRecursively(successDelete, failDelete);
}
function successDelete(parent) {
    	//alert("Remove Recursively Succeeded");
		deleteDB();
		
		if (theMedia) {
			theMedia.pause();
			clearInterval(theTimer);
			theTimer = null;
			theMedia = null;
		}
	}
	
	function failDelete(error) {
		alert("Failed to remove directory or it's contents: " + error.code);
	}
function badError (entry) {

	//Lying is good
	navigator.notification.confirm(
			'All Your Pods Have Been Deleted', // message
			 doNothing,            // callback to invoke with index of button pressed
			'Traks',           // title
			['OK']     // buttonLabels
	);
	
	
}
var deleteAllPodcasts1 = function(buttonIndex) {
		
		if (buttonIndex == 1){
			var podFolder = cordova.file.dataDirectory + "podcasts/";
			window.resolveLocalFileSystemURL(podFolder, deletePodDirectory, badError);
			//console.log (jon);
		}
};	

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}
function readDeviceOrientation() {                		
    if (Math.abs(window.orientation) === 90) {
		 songContainer.style.bottom = "none";
		 songContainer.style.top = "54px";
		 canvas.style.display = "none";
		 page[1].classList.add('noCanvas');
		 runCanvas = false;
    } else {
    	// Portrait
			 songContainer.style.top = "none";
		     songContainer.style.bottom = "48px";
			 canvas.style.display = "block";
			 if (page[1].classList.contains('noCanvas')){
				page[1].classList.remove('noCanvas');
				runCanvas = true; 
				setCanvasLogo();
			 }
		
    }
}

var setHeaderEvents = function() {
    for (var i = 0; i < headerButtons.length; i++) {  
		 myTap = new Tap(headerButtons[i]);     
        headerButtons[i].addEventListener('tap', headerClicked, false);
    }
};
var sim = {
    goOffline: function() {
        sim._dispatchEvent("offline");
    },
    goOnline: function() {
        sim._dispatchEvent("online");
    },
    _dispatchEvent: function(eventType) {
        var event = document.createEvent('Event');
        event.initEvent(eventType, true, true);
        document.dispatchEvent(event);
    }
};
var setVolumeEvents = function() {
    for (var i = 0; i < songVolume.length; i++) {
		 myTap = new Tap(songVolume[i]);       
        songVolume[i].addEventListener('tap', volumeClicked, false);
    }
};
var setSettingsEvents = function() {
    for (var i = 0; i < deleteBtn.length; i++) {
        deleteBtn[i].addEventListener('click', settingsClicked, false);
    }
};
var removeHeaderEvents = function() {
    for (var i = 0; i < headerButtons.length; i++) {      
        headerButtons[i].removeEventListener('tap', headerClicked, false);
    }
};
var setFooterEvents = function() {
    for (var i = 0; i < footerButtons.length; i++) { 
		 myTap = new Tap(footerButtons[i]);       
        footerButtons[i].addEventListener('tap', footerClicked, false);
    }
};
var removeFooterEvents = function() {
    for (var i = 0; i < footerButtons.length; i++) { 	    
        footerButtons[i].removeEventListener('tap', footerClicked, false);
    }
};
var setSongControls = function() {
	console.log("JAN");
	 //myTap = new Tap(playPause);
	 setVolumeEvents();
	 volume.addEventListener("change", volumeDragEvent, false);
	 songInput.addEventListener("change", seekMedia, false);
    playPause.addEventListener('click', playPauseClicked, false);
	
	for (var j = 0; j < songExtras.length; j++) {
		songExtras[j].addEventListener('click', songExtrasClicked, false);
	}
	
	for (var i = 0; i < rewindFF.length; i++) {
		rewindFF[i].addEventListener('click', rewindFFClicked, false);
	}
};

var removeSongControls = function() {
    for (var i = 0; i < headerButtons.length; i++) {      
        headerButtons[i].removeEventListener('click', headerClicked, false);
    }
};
function Variable(initVal, onChange) {
	this.val = initVal;
	this.onChange = onChange;
	
	this.getValue = function () {
		return this.val;
	}
	this.SetValue = function (value) {
		this.val = value;
		if (this.value == true) {
			this.onChange();
		}
	}
}
var setPodListEvents = function() {
	var podList = document.querySelectorAll('#home .podList');
	//alert (podList.length);
    for (var i = 0; i < podList.length; i++) { 
		//myTap = new Tap(podList[i]);     
        podList[i].addEventListener('click', podClicked, false);
    }
	
};
function songExtrasClicked () {
	if (this.innerHTML == "Delete") {
		if (theMedia) {
			clearInterval(theTimer);
			theTimer = null;
    		theMedia.stop();
		}
	}else {
		navigator.notification.confirm(
			'This is a paid feature Upgrade!', // message
			 doNothing,            // callback to invoke with index of button pressed
			'Traks',           // title
			['OK']     // buttonLabels
			);
	}
}
function podClicked() {
	if (theMedia) {
		if (eposideUniqueID != this.dataset.nameid) { 
			console.log ("LO");
			//myVar = new Variable(false, playNewlyClickedSong(this));
			notFinished = true;
			stopMedia();
			theMedia = new Media(this.dataset.podpath, onMediaSuccess, function(e) { console.log("MED ERR")});
			if (theMedia) {
				eposideUniqueID = this.dataset.nameid;
				episodePlaying = this.dataset.podpath;
				episodePlayingText = this.dataset.podepisode;
				console.log ("BO");
				songTitle.innerHTML = this.dataset.podepisode;
				songArtist.innerHTML = this.dataset.podpod;
				setCanvasLogo(this.dataset.podpic);
				playMedia();
				changePage(1);
				setTimeout(function() {
				 	playPause.dataset.play = "1";
					playPause.src = "img/pause.png";
				}, 100);
			}
		} else {
			changePage(1);
		}
	}else {
		console.log ("HO");
		theMedia = new Media(this.dataset.podpath, onMediaSuccess, function(e) { alert(JSON.stringify(e));});
		if (theMedia) {
			eposideUniqueID = this.dataset.nameid;
			episodePlaying = this.dataset.podpath;
			episodePlayingText = this.dataset.podepisode;
			songTitle.innerHTML = this.dataset.podepisode;
			songArtist.innerHTML = this.dataset.podpod;
			setCanvasLogo(this.dataset.podpic);
			playMedia();
			changePage(1);
		}
	}
}
function rewindFFClicked() {
	if(theMedia) {
		if (this.dataset.refa == "0") {
			theMedia.seekTo(parseInt(songInput.value)*1000 - 10000);
		}else {
			theMedia.seekTo(parseInt(songInput.value)*1000 + 30000);
		}
		
	}
}
function volumeClicked() {
	var convertVolume = parseFloat(volume.value);
	if (this.dataset.volume == "0") {
		volume.value = convertVolume - 0.1;
		if (theMedia) {
			theMedia.setVolume(volume.value);
		}
	}else {
		volume.value = convertVolume + 0.1;
		if (theMedia) {
			theMedia.setVolume(volume.value);
		}
	}
}
function playPauseClicked() {
	if (this.dataset.play == "0") {
		playMedia();
	}else {
		pauseMedia();
	}
}
/*  Was a good function to animate music playing but too slow on a phone
function startMusicAnimation() {
		draw();
  		animateMusic = requestAnimationFrame(startMusicAnimation);
}
function addParticlesForAnimation() {
	for(var i = 0; i < patriclesNum; i++){
		particles.push(new Factory);
	}
}
function stopMusicAnimation() {
	cancelAnimationFrame(animateMusic);
	particles = [];
}
*/

function setCanvasLogo(path) {
	ctx.clearRect(0, 0, w, h);
	var imageObj = new Image();
	imageObj.src = path;
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
	else if (data == "2"){
		changePage(3);
	}
}

function footerClicked(ev) {
	ev.preventDefault();
	
	if (footerButtons[4].classList.contains("active") && !this.classList.contains("active")) { 
		changePage(3);
	}else {
		if (this.dataset.footer != "3") {
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
				footerChangePage(this.dataset.footer);
			}
		}else {
			footerChangePage(this.dataset.footer);
		}
	}
}

function footerChangePage(switchToPage) {
	if (switchToPage == "0" || switchToPage == "1") {
		developerA("Will You", "I Will");
	}else if (switchToPage == "3") {
		urlPrompt();
	}else if (switchToPage == "4") {
		changePage(2);
	}
}
function urlPrompt () {
	navigator.notification.prompt(
		"Enter A URL of a Podcast to Initiate a Download", 
		urlPromptCallback, 
		'Traks', 
		["Get Podcast", "Cancel"], 
		"Enter Url Here"
	);
	
}
function urlPromptCallback(results) {
	if (results.buttonIndex == 1) {
    	if (urlValidation(results.input1)) {
			if (onlineOffline) {
				console.log(results.input1);
				ajaxArray.push(results.input1);
				appOnline();
			}else {
				ajaxOffline.push(results.input1);
			}

		}else {
			console.log("BAD URL: " + results.input1);
			navigator.notification.confirm(
			'Please Enter a valid URL', // message
			 doNothing,            // callback to invoke with index of button pressed
			'Traks',           // title
			['OK']     // buttonLabels
			);
			//Bad URL
		}
	}
}
function urlValidation(url) {
	
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  if(!pattern.test(url.trim())) {
    return false;
  } else {
    return true;
  }

    }
function developerA (a,b) {
	navigator.notification.confirm(
		a + ' Give The Developers an A+ So That They Can Complete These Extra Features Later On', // message
		 developerAConfirm,            // callback to invoke with index of button pressed
		'Traks',           // title
		[b,'No']     // buttonLabels
	);
}
function developerAConfirm(buttonIndex) {
	if (buttonIndex == 1){
		console.log ("SWEET");
	} else {
		developerA("You Must", "Fine");
	}
}
function changePage(switchToPage) {
	
	removeHeaderEvents();
	
	if (switchToPage == 0) {
		wrapper.style.overflow = "scroll";
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
        }, 500);
		 
	}else if (switchToPage == 1) {
		wrapper.scrollTop = 0;
		wrapper.style.bottom = "0";
		wrapper.style.overflow = "hidden";
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
        }, 500);
		 
	}else if (switchToPage == 2) {
		//removeFooterEvents();
		wrapper.scrollTop = 0;
		//wrapper.style.top = "0";
		wrapper.style.overflow = "hidden";
		page[0].classList.add('animation-slide-out-up');
		//header.classList.add('animation-slide-out-up');
		page[2].style.display = "block";
		page[2].classList.add('animation-slide-in-up');
		
		headerButtons[1].style.display = "none";
		headerButtons[2].style.display = "inline-block";
		
		setTimeout(function() {
			 page[0].style.display = "none";
			 //header.style.display = "none";
			 page[0].classList.remove('animation-slide-out-up');
			 //header.classList.remove('animation-slide-out-up');
			 page[2].classList.remove('animation-slide-in-up');
			 //setHeaderEvents();
			 setHeaderEvents();
        }, 500);
		 
	}else if (switchToPage == 3) {
		//wrapper.scrollTop = 0;
		//wrapper.style.top = "0";
		var tpHolder1 = footerButtons[4].children[0];
			  var tpHolder2 = tpHolder1.children[0];
			  tpHolder2.src = "img/" + tpHolder2.dataset.image + "-gray.png";
			  footerButtons[4].classList.remove("active");
			  footerButtons[4].children[1].classList.remove("active");
			  
			  var tpHolder3 = footerButtons[2].children[0];
			var tpHolder4 = tpHolder3.children[0];
			tpHolder4.src = "img/" + tpHolder4.dataset.image + "-red.png";
			footerButtons[2].classList.add("active");
			footerButtons[2].children[1].classList.add("active");
			
		page[0].classList.add('animation-slide-in-down');
		//header.classList.add('animation-slide-out-up');
		page[0].style.display = "block";
		page[2].classList.add('animation-slide-out-down');
		
		
		headerButtons[2].style.display = "none";
		if (theMedia) {
		headerButtons[1].style.display = "inline-block";
		}
		
		
		setTimeout(function() {
			//setFooterEvents();
			 page[2].style.display = "none";
			 //header.style.display = "none";
			 page[0].classList.remove('animation-slide-in-down');
			 //header.classList.remove('animation-slide-out-up');
			 page[2].classList.remove('animation-slide-out-down');
			 //setHeaderEvents();
			 wrapper.style.overflow = "scroll";
			  
			//footerChangePage(this.dataset.footer);
			
			 setHeaderEvents();
        }, 500);
		 
	}
}

function onMediaSuccess() {
  console.log("onMediaSuccess");
  clearInterval(theTimer);
  theTimer = null;
  playPause.dataset.play = "0";
	playPause.src = "img/play.png";
	songInput.value = 0;
  songStart.innerHTML = "00:00:00";
  //navigator.notification.prompt("Would you like to delete this episode?", promptCallback, ["Traks"], ["Yes", "No"], [])
if (!notFinished) {
	  navigator.notification.confirm(
		'Would you like to delete ' + episodePlayingText, // message
		 onConfirm,            // callback to invoke with index of button pressed
		'Traks',           // title
		['Yes','No']     // buttonLabels
	);
}
  
  
}

function onConfirm(buttonIndex) {
	if (buttonIndex == 1){
		console.log ("YES");
		window.resolveLocalFileSystemURL(episodePlaying, deletePod, deletePodError);
	} else {
		console.log ("NO");
	}
}

function deletePod (entry) {
	// remove the file
	entry.remove(deleteSuccess, deleteFail);
}

function deletePodError (e) {
	console.log ("Error Deleting File");
	navigator.notification.confirm(
		'Would you like try to delete this episode again?', // message
		 onConfirm,            // callback to invoke with index of button pressed
		'Traks',           // title
		['Yes','No']     // buttonLabels
	);
}
function deleteSuccess(entry) {
    console.log("Removal succeeded YYYYOOOWW");
	deletePodPath(eposideUniqueID);
	//window.clearInterval(theTimer);
	
	theMedia = null;
	songStart.innerHTML = "00:00:00";
	songEnd.innerHTML = "00:00:00";
	songTitle.innerHTML = "&nbsp;";
	songArtist.innerHTML = "&nbsp;";
	if(runCanvas)setCanvasLogo("img/logo.png");
	changePage(0);
	
	setTimeout(function() {
			headerButtons[1].style.display = "none"; 
        }, 200);
}

function deleteFail(error) {
    alert('Error removing file: ' + error.code);
}


function promptCallback(b){
	console.log (b);
}
function onMediaError(e) {
  var msgText = "Media error: " + e.message + "(" + e.code + ")";
  //alert(msgText);
  //navigator.notification.alert(msgText, null, "Media Error");
}

function onMediaStatus(statusCode) {
  console.log("Status: " + statusCode);
}

function playMedia() {
  if(theMedia) {
	 theMedia.play();
	playPause.dataset.play = "1";
	playPause.src = "img/pause.png";
    
	theMedia.setVolume(volume.value);
    //Timer to update the UI every second as it plays
    theTimer = setInterval(updateUI, 1000);
  } else {
    alert("No media file to play");
  }
}
function seekMedia(ev) {
	if(theMedia) {
		console.log (parseInt(this.value)*1000)
		theMedia.seekTo(parseInt(this.value)*1000);
	}
}
function volumeDragEvent(ev) {
	if(theMedia) {
		theMedia.setVolume(this.value);
	}
}
function pauseMedia() {
  if(theMedia) {
	playPause.dataset.play = "0";
	playPause.src = "img/play.png";
    theMedia.pause();
  }
}

function stopMedia() {
  if(theMedia) {
    theTimer = null;
    theMedia.stop();
  }
}

function updateUI() {
  theMedia.getCurrentPosition(onGetPosition, onMediaError);
}

function onGetPosition(filePos) {

  if (theMedia.getDuration() != -1) {
	 notFinished = false;
    var updatedTime = (Math.floor(filePos) != -1 ? Math.floor(filePos) : 0);
	songInput.max = theMedia.getDuration();
	songInput.value = updatedTime;
    songStart.innerHTML = updatedTime.toString().toHHMMSS();
	songEnd.innerHTML = theMedia.getDuration().toString().toHHMMSS();
  } else  {
	  
  }
}

/* DATABASE STUFF */

function checkDB(){
    db = openDatabase('kdb', '', 'K DB', 1024*1024);
    if(db.version == ''){
        db.changeVersion('', '1.0', createDB, fatalError, createDBSuccess);
		//getDatabaseInfo();		
    }else{  
       	 getDatabaseInfo();
    }
}
function deleteDB(){
    db = openDatabase('kdb', '', 'K DB', 1024*1024);
    if(db.version == '1.0'){
       db.changeVersion('1.0', '1.0', dropDB, fatalError, deleteDBSuccess);
		db.changeVersion('1.0', '1.0', createDB, fatalError, createDBSuccess);		
       	getDatabaseInfo();
    }
}
function createDB (trans){             
	trans.executeSql('CREATE TABLE podcasts(name_id INTEGER PRIMARY KEY AUTOINCREMENT, pod_text TEXT, episode_text TEXT, path_text TEXT, pic_text TEXT )', [], 
					function(tx, rs){
					},
					function(tx, err){
						console.info( err.message);
					});              
}
function insertDB(pdFull, epFull, pathFull, picFull) {
	db.transaction(function(trans){
        trans.executeSql('INSERT INTO podcasts(pod_text, episode_text, path_text, pic_text) VALUES(?,?,?,?)', [pdFull, epFull, pathFull, picFull], 
            function(tx, rs){
                console.log ("SUCCESSFULLY INSERTED");
				  getDatabaseInfo();
            }, 
            function(tx, err){
                console.info( err.message);
				  getDatabaseInfo();
            });    
    }, transErr, transSuccess);	
}
function deletePodPath(id) {
	console.log ("ID " + id);
	db.transaction(function(trans){
        trans.executeSql('DELETE FROM podcasts WHERE name_id = ?', [id], 
            function(tx, rs){
                console.log ("SUCCESSFULLY DELETED POD");
				  getDatabaseInfo();
            }, 
            function(tx, err){
                console.info( err.message);
				  getDatabaseInfo();
            });    
    }, transErr, transSuccess);	
}
function dropDB (trans){            
	trans.executeSql('DROP TABLE podcasts', [], 
					function(tx, rs){
						navigator.notification.confirm(
								'All Your Pods Have Been Deleted', // message
								 doNothing,            // callback to invoke with index of button pressed
								'Traks',           // title
								['OK']     // buttonLabels
						);
					},
					function(tx, err){
						console.info( err.message);
					});
}
function getDatabaseInfo() {	
	db.transaction(function(trans){
        trans.executeSql('SELECT * FROM podcasts', [], 
            function(tx, rs){
				  if (rs.rows.length > 0) {
					  console.log ("WE HAVE ROWS");
				  var html = '<ul>';
				  for (i=0;i<rs.rows.length; i++){
					  //for (var u=0; u<15; u++){
					 html += '<li class="podList" data-nameid="' + rs.rows.item(i).name_id + '" data-podpod="' + rs.rows.item(i).pod_text + '" data-podepisode="' + rs.rows.item(i).episode_text + '" data-podpath="' + rs.rows.item(i).path_text + '" data-podpic="' + rs.rows.item(i).pic_text + '">' + rs.rows.item(i).episode_text + '</li>'; 
					  //}
				  }
				  html += '</ul>';
				  console.log ("MANNNNNN");
				  page[0].innerHTML = "";
                page[0].insertAdjacentHTML('afterbegin',html);

				  setPodListEvents();
				  }else {
					  page[0].innerHTML = "";
					  
					 console.log ("WE HAVE NOOOO ROWS");
					 

				  }
            }, 
            function(tx, err){
                console.info( err.message);
            });    
    }, transErr, transSuccess);
	/*
	db.transaction(function(trans){
        trans.executeSql('DELETE FROM songs WHERE path_text = ?', ["data/files/podcasts/jon.mp3"], 
            function(tx, rs){
                console.log ("SUCCESSFULLY DELETED");
            }, 
            function(tx, err){
                console.info( err.message);
            });    
    }, transErr, transSuccess);	
	
	db.transaction(function(trans){
        trans.executeSql('INSERT INTO songs(name_text, path_text, pic_text) VALUES(?,?,?)', ["CHRISTMAS", "data/files/podcasts/jon.mp3", "HALLOWEEN.jpg"], 
            function(tx, rs){
                console.log ("SUCCESSFULLY DELETED");
            }, 
            function(tx, err){
                console.info( err.message);
            });    
    }, transErr, transSuccess);	
	*/
}

function transErr(tx, err){
    console.info("Error processing transaction: " + err);
}
function transSuccess(){
	console.info("Trans Successfully Completed");
}
function fatalError (err) {
	console.info( err.message);
}
function createDBSuccess () {
	console.info("DB created Successfully");
}
function deleteDBSuccess () {
	console.info("DB deleted Successfully");
}