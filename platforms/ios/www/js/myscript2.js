var fileDur, theMedia, theTimer, track, songStart, songEnd;
var data2 = [];
var store;
var items = [];
//URL of our asset
var assetURL;
//File name of our important data file we didn't ship with the app
var fileName;
document.addEventListener("deviceready", init, false);


//track = document.getElementById("track");
   
function init() {
   songStart = document.querySelector(".songTime .songStart");
   songEnd = document.querySelector(".songTime .songEnd");
  //"https://dl.dropboxusercontent.com/u/887989/test.mp3"
  //"http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3"
  //var fileName = "track 01.m4a";
  //alert (cordova.file.dataDirectory);
  //var fileName = "https://dl.dropboxusercontent.com/u/887989/test.mp3";
  //theMedia = new Media(fileName, onMediaSuccess, onMediaError, onMediaStatus);
 
  //track.innerHTML ="<strong>File:</strong> " + fileName;
  //time.innerHTML = 'Duration: ' + Math.round(theMedia.getDuration()) + ' seconds';
  //window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onRequestFileSystem, fail);
  //window.resolveLocalFileSystemURL(cordova.file.dataDirectory, makeFolder, weirdError);
  
 alert ("YO");
 	
	

  
	//var fileName = "https://dl.dropboxusercontent.com/u/887989/test.mp3";
  //theMedia = new Media(store + fileName, onMediaSuccess, onMediaError, onMediaStatus);
  
  var oReq = new XMLHttpRequest();

oReq.addEventListener("progress", updateProgress, false);
oReq.addEventListener("load", transferComplete, false);
oReq.addEventListener("error", transferFailed, false);
oReq.addEventListener("abort", transferCanceled, false);

oReq.open("GET", "http://feeds.feedburner.com/ThrillingAdventureHour", true);
oReq.send();

// ...


	//Check for the file. 
	//window.resolveLocalFileSystemURL(store + fileName, jt, downloadAsset);
  

 
  /*
var fileTransfer = new FileTransfer();
var uri = encodeURI("https://dl.dropboxusercontent.com/u/887989/test2.mp3");

fileTransfer.download(
    uri,
    "/android_asset/www/music",
    function(entry) {
        console.log("download complete: " + entry.toURL());
    },
    function(error) {
        console.log("download error source " + error.source);
        console.log("download error target " + error.target);
        console.log("upload error code" + error.code);
    },
    true,
    {
       
    }
);
*/
}
function makeFolder (dir) {
	//console.log ();
	dir.getDirectory("podcasts",{create: true, exclusive: false}, function(dir){console.log("Created dir "+dir.name);},function(error){console.log("Error creating directory "+ fileErrorCode(error.code));})
}
function weirdError () {
	console.log ("WEIRD ERROR");
}
function downloadFile (a) {
	
	fileName = a.epTitle;
	assetURL = a.dLink;
	store = cordova.file.dataDirectory + "podcasts/";
	console.log (store + fileName);
	//window.resolveLocalFileSystemURL(store + fileName +".mp3", jt, downloadAsset);
	

}
// progress on transfers from the server to the client (downloads)
function updateProgress (oEvent) {
  if (oEvent.lengthComputable) {
    var percentComplete = oEvent.loaded / oEvent.total;
	console.log ("PERCENT: " + percentComplete);
    // ...
  } else {
    // Unable to compute progress information since the total size is unknown
  }
}

function transferComplete(evt) {
  //alert("The transfer is complete.");
  //console.log (evt.target.responseText);
  
  var oParser = new DOMParser();
  var oDOM = oParser.parseFromString(evt.target.responseText, "text/xml");
	// print the name of the root element or error message
  var tpTitle1 = oDOM.getElementsByTagName('channel')[0];
  var tpTitle2 = tpTitle1.getElementsByTagName('title')[0].childNodes[0].nodeValue;
  var tpImage1 = oDOM.getElementsByTagName('image')[0];
  var tpImage2 = tpImage1.getElementsByTagName('url')[0].childNodes[0].nodeValue;
   	
	for (var i=0; i < 2; i++) {

		var tpItem = oDOM.getElementsByTagName('item')[i];
		var tpEpTitle = tpItem.getElementsByTagName('title')[0].childNodes[0].nodeValue;
		var tpLink = tpItem.getElementsByTagName('link')[0].childNodes[0].nodeValue;

		items.push({
			pdTitle: tpTitle2,
			epTitle: tpEpTitle,
			dLink: tpLink,
			image: tpImage2
		});
	}
	//downloadFile(items[0]);
/*
	console.log (items);
	console.log (oDOM);
	console.log(oDOM.documentElement.nodeName == "parsererror" ? "error while parsing" : oDOM.documentElement.nodeName);
*/
}

function transferFailed(evt) {
  console.log("An error occurred while transferring the file.");
}

function transferCanceled(evt) {
  alert("The transfer has been canceled by the user.");
}
function jt(fileEntry) {
	console.log ("YODA");
	//theMedia = new Media(store + fileName, onMediaSuccess, onMediaError, onMediaStatus);
	//console.log (fileEntry.getMetadata);
}
function downloadAsset() {
	var b = 0
	var fileTransfer = new FileTransfer();
	console.log("About to start transfer");
	fileTransfer.onprogress = function(progressEvent) {
		if (progressEvent.lengthComputable) {
		  console.log(progressEvent.loaded / progressEvent.total);
		} else {
		  console.log (b++);
		}
	};
	fileTransfer.download(assetURL, store + fileName, 
		function(entry) {
			console.log("Success!");
			var media = new Media(entry.fullPath, null, function(e) { alert(JSON.stringify(e));});
			media.play();
			//appStart();
		}, 
		function(err) {
			console.log("Error");
			console.dir(err);
		});
}
function onRequestFileSystem(fileSystem) {
	 //var jt = cordova.file.dataDirectory;
    var directoryReader = fileSystem.root.createReader();
    directoryReader.readEntries(onReadEntries, fail);
}
function fail () {
    alert ("FAIL");
}
function yoSuccess (fileEntry) {
	console.log (fileEntry);
}
function yoFailure () {
console.log ("FAIL");	
}
function onReadEntries(entries) {
	
/*	
	 for (var i = 0; i < entries.length; i++) {

        //Adding into Store for my example   
		if (entries[i].name == "music") {       
        data2.push({
            fileName : entries[i].name,
            isDirectory : entries[i].isDirectory,
            fullPath : entries[i].toURL() //instead of entries[i].fullPath
        });
		}
    }
*/
	 alert ("YO");   
    for (var i = 0; i < entries.length; i++) {
		console.log (entries[i].name);
		/*
       if (entries[i].isFile == true) {
         var name = entries[i].name;
         var tempM = name.substring(name.lastIndexOf(".")+1);
         if (tempM) {
             console.log (tempM);
         }
       }
       if (entries[i].isDirectory == true && entries[i].fullPath != "/LOST.DIR" && entries[i].fullPath != "/Android") {
         var directoryReader = entries[i].fullPath;
         directoryReader.readEntries(onReadEntries, fail);
       }
	   */
       //console.log ("KIRK");
    }
    
   //console.log (JSON.stringify(entries));
}
function onMediaSuccess() {
  console.log("onMediaSuccess");
  window.clearInterval(theTimer);
  theTimer = null;
}

function onMediaError(e) {
  var msgText = "Media error: " + e.message + "(" + e.code + ")";
  alert(msgText);
  //navigator.notification.alert(msgText, null, "Media Error");
}

function onMediaStatus(statusCode) {
  console.log("Status: " + statusCode);
}

function playMedia() {
  if(theMedia) {
    console.log("Play");
    //Start the media file playing
    theMedia.play();
    //fire off a timer to update the UI every second as it plays
    theTimer = setInterval(updateUI, 1000);
  } else {
    alert("No media file to play");
  }
}

function pauseMedia() {
  if(theMedia) {
    console.log("doPause");
    //Pause media play
    theMedia.pause();
    window.clearInterval(theTimer);
  }
}

function stopMedia() {
  if(theMedia) {
    console.log("doStop");
    //Kill the timer we have running
    theTimer = null;
    //Then stop playing the audio clip
    theMedia.stop();
  }
}

function updateUI() {
  //console.log("updateUI");
  theMedia.getCurrentPosition(onGetPosition, onMediaError);
}

function onGetPosition(filePos) {
  console.log("onGetPosition");

  if (theMedia.getDuration() != -1) {
    var updatedTime = (Math.floor(filePos) != -1 ? Math.floor(filePos) : 0);
    songStart.innerHTML = updatedTime;
	songEnd.innerHTML = theMedia.getDuration();
  }

  
}
