// JavaScript Document

//Main components of layout
var wrapper, header, footer, footerButtons, page, headerButtons, initialDownloadSelect, addInitialDownload, amountOfPodcasts;

//Is changed to false if screen height is less then 450px so that no Canvas will be drawn
var runCanvas = true, canvas, ctx;

//Media key components
var theMedia, theTimer, playPause, songStart, songEnd, songInput, volume, songTitle, songArtist, ajaxLoader, noInternet;

//CONSTANTS
var STORE; //Set onDevice as it uses plugin cordova.file.dataDirectory + "podcasts/"; 
var AJAXIMG = '<img src="img/ajax-loader.gif" />';
var OFFLINEIMG = '<img src="img/no-internet.png" />';
var NOPODS = '<h2 style="margin-top:5rem; padding: 1rem;">You Currently Have No Podcasts, Use The Search In The Bottom Footer To Add A Podcast</h2>';
var MAXPODS = 5;  //Amount of latest episodes to give the user a pick of

//LocalStorage Variables (can be configured in the settings)
var initialPodCheck = ["http://feeds.feedburner.com/thrillingadventurehour","http://feeds.feedburner.com/welcometonightvale"];
var latestAmount = 2;

//Stores the info about the pod being downloaded
var assetURL, picURL, epTitle, pdTitle;

//Stores the info about the pod being played
var episodePlaying, eposideUniqueID, episodePlayingText;

//Stores network connectivity state (true;online, false;offline)
var onlineOffline;

//Arrays to store what needs to be downloaded
var ajaxOffline = [],
    ajaxArray = [],
    downloadArray = [];

//Set to true if download is in progress;    
var downloadInProgress = false;

//Set to true when song completely finishes
var notFinished = false;

//Set to "touchend" if device accepts touch or "click" if not
var touch;

//Set to true and touch all or songs tab in the footer
var beFunny = false;

document.addEventListener("deviceready", onDeviceReady, false);
//document.addEventListener("DOMContentLoaded", onDeviceReady, false);

function onDeviceReady() {

    touch = detectTouchSupport() ? "touchend" : "click";

    //Polyfill for old browsers
    if (!String.prototype.startsWith) {
      Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
          position = position || 0;
          return this.lastIndexOf(searchString, position) === position;
        }
      });
    }

    if (localStorage.getItem("initialPodCheck") === null) {
      window.localStorage.setItem("initialPodCheck", JSON.stringify(initialPodCheck));
    }else {
      initialPodCheck = JSON.parse(window.localStorage.getItem("initialPodCheck"));
    }

    if (localStorage.getItem("latestAmount") === null) {
      window.localStorage.setItem("latestAmount", latestAmount);
    }else {
      latestAmount = parseInt(window.localStorage.getItem("latestAmount"));
    }

    checkDB();
    STORE = cordova.file.dataDirectory + "podcasts/";
    navigator.splashscreen.hide();
    wrapper = document.querySelector('#wrapper');
    header = document.querySelector('#header');
    footer = document.querySelector('#footer');
    ajaxLoader = document.querySelector('#ajaxLoader');
    noInternet = document.querySelector('#noInternet');
    footerButtons = document.querySelectorAll('#footer .footerButtons');
    page = document.querySelectorAll('[data-role=page]');
    headerButtons = document.querySelectorAll('#header .headerButtons');
    canvas = document.querySelector('#musicCanvas');
    playPause = document.querySelector('#playPause');
    songTitle = document.querySelector(".songInfo .songTitle");
    songArtist = document.querySelector(".songInfo .songArtist");
    songStart = document.querySelector(".songTime .songStart");
    songEnd = document.querySelector(".songTime .songEnd");
    songInput = document.querySelector(".songTime #fader");
    volume = document.querySelector(".songVolume #volume");
    initialDownloadSelect = document.querySelector("#initialDownloadSelect");
    addInitialDownload = document.querySelector("#addInitialDownload");
    amountOfPodcasts = document.querySelector("#amountOfPodcasts");
    var playing = document.querySelector('#playing');
    var settings = document.querySelector('#settings');
    playing.style.height = window.innerHeight + "px";
    settings.style.height = window.innerHeight + "px";

    //If the phone height is less then 450px then we do not want to display the Music Canvas
    if (window.innerHeight < 450) {
        canvas.style.display = "none";
        page[1].classList.add('noCanvas');
        runCanvas = false;
    } else {
        runCanvas = true;
        ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        //Bottom controls height = 227 plus app header = 48 which gives total of 265 add an extra 15px padding = 290
        canvas.height = window.innerHeight - 290;
    }

    if (runCanvas) setCanvasLogo("img/logo.png");

    for (var i = 0; i < initialPodCheck.length ; i++) {
        var newListData = new Option(initialPodCheck[i], initialPodCheck[i]);
        newListData.setAttribute("selected", "selected");
        initialDownloadSelect.appendChild(newListData);
    }

    for (var j = 1; j <= MAXPODS; j++) {
        var newOpt = new Option(j, j);
        if (j === latestAmount) {
            newOpt.setAttribute("selected", "selected");
        }
        amountOfPodcasts.appendChild(newOpt);
    }
    
    setHeaderEvents();
    setFooterEvents();
    setSettingsEvents();
    setSongControls();
    initialDownloadSelectEvent();
    amountPodcastsSelectEvent();
    addInitialDownloadEvent();
    checkConnection();

    document.addEventListener("online", appOnline, false);
    document.addEventListener("offline", appOffline, false);

    /* // Uncomment this setInterval below to simulate device receiving and losing internet connection
    //This function simulates the device receiving and losing internet connection every 5 seconds       
    onlineOffline = false;
    setInterval(function() {
        if (onlineOffline) {
            sim.goOnline();
            onlineOffline = false;
        } else {
            sim.goOffline();
            onlineOffline = true;
        }
    }, 5000);
    */
}

function appOnline() {
    onlineOffline = true;
    noInternet.innerHTML="";
    console.log("APP ONLINE");

    if (ajaxOffline.length) {
        for (var i = 0; i < ajaxOffline.length; i++) {
          ajaxArray.push(ajaxOffline[i]);
        }  
        ajaxOffline = [];
    }

    if (ajaxArray.length) {
        getAjax(ajaxArray[0]);
    }

    if (downloadArray.length) {
        downloadThrillFile(downloadArray[0]);
    }
}

function appOffline() {
    onlineOffline = false;
    noInternet.innerHTML = OFFLINEIMG;
    console.log("APP OFFLINE");
}

function checkConnection() { 
    if(navigator.network.connection.type == Connection.NONE){
        //no connection 
        if (initialPodCheck.length) {
            for (var i = 0; i < initialPodCheck.length; i++) {
               ajaxOffline.push(initialPodCheck[i]); 
            }
        }
    }else{
        //You are connected.
        if (initialPodCheck.length) {
            for (var j = 0; j < initialPodCheck.length; j++) {
               ajaxArray.push(initialPodCheck[j]); 
            }
        }
    }
}

function ajaxError(evt) {
    console.log("Error Code " + evt);
    navigator.notification.confirm(
        'A search error occured with that URL', // message
        doNothing, // callback to invoke with index of button pressed
        'Traks', // title
        ['OK'] // buttonLabels
    );

    if (onlineOffline) {
        appOnline();
    }
}

function getAjax(url) {

    ajaxLoader.innerHTML = AJAXIMG; //Display an ajax loader

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("error", ajaxError, false);
    xhr.open("GET", url, true);

    xhr.onreadystatechange = function() {

        if (xhr.readyState == 4) {

            ajaxLoader.innerHTML = ""; //Clear ajax loader

            try { //Catch any errors in the XML check
                var counter = 0;
                var oDOM = xhr.responseXML;
                var tpTitle1 = oDOM.getElementsByTagName('channel')[0];
                var tpTitle2 = tpTitle1.getElementsByTagName('title')[0].childNodes[0].nodeValue;
                var tpImage1 = oDOM.getElementsByTagName('image')[0];
                var tpImage2 = tpImage1.getElementsByTagName('url')[0].childNodes[0].nodeValue;
                var tpItems = oDOM.getElementsByTagName('item');

                if (tpItems.length > latestAmount) {
                    counter = latestAmount;
                } else {
                    counter = tpItems.length;
                }

                var items = []; //Empty it
                for (var i = 0; i < counter; i++) {

                    var tpItem = tpItems[i];
                    var tpEpTitle = tpItem.getElementsByTagName('title')[0].childNodes[0].nodeValue;
                    var tpLink = tpItem.getElementsByTagName('enclosure')[0].attributes.getNamedItem('url').value;

                    items.push({
                        pdTitle: tpTitle2,
                        epTitle: tpEpTitle,
                        dLink: tpLink,
                        image: tpImage2
                    });
                    ajaxArray.shift();
                    downloadArray.push(items[i]);

                    if (onlineOffline) {
                        appOnline();
                    }
                }
            } catch (ex) { //If an error in the XML check occurs abort ajax
                ajaxLoader.innerHTML = "";
                ajaxArray.shift();
                xhr.abort();
            }
        }
    };

    xhr.send();
}

function doNothing() {
    //Do nothing 
}

function downloadThrillFile(a) {

    if (!downloadInProgress) { //Only download if there are no other downloads in progress
        downloadInProgress = true; //So no other files can be downloaded at the same time
        assetURL = a.dLink;
        picURL = a.image;
        var tmpEpTitle = a.epTitle;
        var tmpPdTitle = a.pdTitle;
        //Replace all bad possible characters with entities for sqlite database and filename
        pdTitle = tmpPdTitle.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
            return '&#' + i.charCodeAt(0) + ';';
        });
        epTitle = tmpEpTitle.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
            return '&#' + i.charCodeAt(0) + ';';
        });

        var n = a.dLink.lastIndexOf('/');
        fileName = a.dLink.substring(n + 1);

        //This automatically creates directory if it doesn't exist
        window.resolveLocalFileSystemURL(STORE + fileName, alreadyD, downloadAsset);
    }
}

function alreadyD(fileEntry) {
    console.log("It looks like you have already downloaded that File");
    downloadArray.shift(); //Since that path already exists, it must have been dl already, delete that item from queue

    downloadInProgress = false; //So that new downloads can commence
    if (onlineOffline) { //Recheck queue if apps online
        appOnline();
    }
}

function downloadAsset() {

    var calledOnce = false; //So that progress bar only gets created once
    var newDiv, newSpan, pComplete; //For progress bar
    var fileTransfer = new FileTransfer();

    fileTransfer.onprogress = function(progressEvent) {

        if (!calledOnce) {
            //Create a progress bar; set initially to color red
            wrapper.style.top = "50px";
            header.style.height = "50px";
            newDiv = document.createElement("div");
            newDiv.className = "meter red";
            newSpan = document.createElement("span");
            newSpan.style.width = "0%";
            newDiv.appendChild(newSpan);
            header.appendChild(newDiv);
            calledOnce = true;
        }
        //Show progress bar loading (stage 1: red less then 25% dl, stage 3: green more then 75% dl, stage 2: orange between stage 1 and 3)
        if (progressEvent.lengthComputable) {
            pComplete = progressEvent.loaded / progressEvent.total * 100;
            if (pComplete <= 25) {
                newSpan.style.width = progressEvent.loaded / progressEvent.total * 100 + "%";
            } else if (pComplete > 25 && pComplete < 75) {
                newDiv.className = "meter orange";
                newSpan.style.width = progressEvent.loaded / progressEvent.total * 100 + "%";
            } else if (pComplete >= 75) {
                newDiv.className = "meter green";
                newSpan.style.width = progressEvent.loaded / progressEvent.total * 100 + "%";
            }
        }
    };

    fileTransfer.download(assetURL, STORE + fileName,
        function(entry) { //File has been successfully dl
            //Remove progress bar
            newDiv.parentElement.removeChild(newDiv);
            wrapper.style.top = "45px";
            header.style.height = "45px";
            //Insert the file location and other info into sqlite db
            insertDB(pdTitle, epTitle, entry.toURL(), picURL);

            downloadArray.shift(); //Delete the just downloaded file from the queue
            downloadInProgress = false; //So that new downloads can commence

            if (onlineOffline) {
                appOnline();
            }
        },
        function(err) {
            //If an error occured during file transfer and progress bar exists; remove it
            downloadInProgress = false; //So that new downloads can commence
            if (newDiv !== null) {
                newDiv.parentElement.removeChild(newDiv);
                wrapper.style.top = "45px";
                header.style.height = "45px";
            }
            console.dir(err);
        });
}

function settingsClicked(ev) {
    ev.preventDefault();
    if (this.dataset.settings == "0") { //Confirm user really wants to delete everything
        navigator.notification.confirm(
            'This will delete all your podcasts', // message
            deleteAllPodcasts, // callback to invoke with index of button pressed
            'Traks', // title
            ['OK', 'Cancel'] // buttonLabels
        );
    } else {
        navigator.notification.confirm(
            'This is a paid feature Upgrade!', // message
            doNothing, // callback to invoke with index of button pressed
            'Traks', // title
            ['OK'] // buttonLabels
        );
    }
}

function deletePodDirectory(entry) {

    // remove the directory and all it's contents
    entry.removeRecursively(successDelete, failDelete);
}

function successDelete(parent) {

    //Podcast folder has now been deleted, drop the sqlite db now
    deleteDB();

    if (theMedia) { //If there is something playing stop it and get rid of it in the background
        theMedia.pause();
        clearInterval(theTimer);
        theTimer = null;
        theMedia = null;
    }
}

function failDelete(error) {
    console.log("Failed to remove directory or it's contents: " + error.code);
    navigator.notification.confirm(
        'An Error Occured While Deleting', // message
        doNothing, // callback to invoke with index of button pressed
        'Traks', // title
        ['OK'] // buttonLabels
    );
}

function deletePodDirectoryError(entry) {

    //Lying is good; if no pod directory exists everything must already be deleted
    navigator.notification.confirm(
        'All Your Pods Have Been Deleted', // message
        doNothing, // callback to invoke with index of button pressed
        'Traks', // title
        ['OK'] // buttonLabels
    );
}

var deleteAllPodcasts = function(buttonIndex) {

    if (buttonIndex == 1) { //User has confirmed complete wipe of pods, find podcast folder
        var podFolder = cordova.file.dataDirectory + "podcasts/";
        window.resolveLocalFileSystemURL(podFolder, deletePodDirectory, deletePodDirectoryError);
    }
};

//This function sets the media seconds to a more user friendly format
//http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
String.prototype.toHHMMSS = function() {
    var sec_num = parseInt(this, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = hours + ':' + minutes + ':' + seconds;
    return time;
};

/* This might be implemented in version 1.1, still has some bugs, Portrait only in version 1.0
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
        if (page[1].classList.contains('noCanvas')) {
            page[1].classList.remove('noCanvas');
            runCanvas = true;
            setCanvasLogo();
        }
    }
}
*/

function songExtrasClicked(ev) {
    ev.preventDefault();
    if (this.innerHTML == "Delete") {
        if (theMedia) {
            clearInterval(theTimer);
            theTimer = null;
            theMedia.stop();
        }
    } else {
        navigator.notification.confirm(
            'This is a paid feature Upgrade!', // message
            doNothing, // callback to invoke with index of button pressed
            'Traks', // title
            ['OK'] // buttonLabels
        );
    }
}

function podClicked() { //A pod from the list has been clicked

    if (theMedia) { //If there is already a song playing 

        if (eposideUniqueID != this.dataset.nameid) { //And the pod clicked is not equal to the one already playing

            notFinished = true; //By setting this it bypasses theMedia success callback and won't ask for a delete :)
            stopMedia(); //Stop the current media playing
            theMedia = new Media(this.dataset.podpath, onMediaSuccess, function(e) {}); //Set the newly clicked song into theMedia

            if (theMedia) { //If the above line was successfull, set Pod info and play
                eposideUniqueID = this.dataset.nameid;
                episodePlaying = this.dataset.podpath;
                episodePlayingText = this.dataset.podepisode;
                songTitle.innerHTML = this.dataset.podepisode;
                songArtist.innerHTML = this.dataset.podpod;
                setCanvasLogo(this.dataset.podpic);
                playMedia();
                changePage(1);
                setTimeout(function() { //Some strange reason pause img wouldn't get displayed, this 10 mil second delay fixes that
                    playPause.dataset.play = "1";
                    playPause.src = "img/pause.png";
                }, 100);
            }
        } else { //If the pod clicked is equal to the one already playing, switch to the media page
            changePage(1);
        }
    } else { //First time clicking a pod, set it up and switch to the media page
        theMedia = new Media(this.dataset.podpath, onMediaSuccess, function(e) {});
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

function rewindFFClicked(ev) {
    ev.preventDefault();
    if (theMedia) {
        if (this.dataset.refa == "0") { //If rewind is pressed, go back 10 seconds
            theMedia.seekTo(parseInt(songInput.value) * 1000 - 10000);
        } else { //Else fastforward was pressed, so go forward 30 seconds
            theMedia.seekTo(parseInt(songInput.value) * 1000 + 30000);
        }
    }
}

function volumeClicked(ev) {
    ev.preventDefault();
    var convertVolume = parseFloat(volume.value);
    if (this.dataset.volume == "0") { //If the lower volume img is pressed, lower volume by 0.1
        volume.value = convertVolume - 0.1;
        if (theMedia) {
            theMedia.setVolume(volume.value);
        }
    } else { //Else the increase volume img was pressed, increase volume by 0.1
        volume.value = convertVolume + 0.1;
        if (theMedia) {
            theMedia.setVolume(volume.value);
        }
    }
}

function playPauseClicked(ev) {
    ev.preventDefault();
    if (this.dataset.play == "0") { //If pause img is pressed, play
        playMedia();
    } else { //Else the play img was pressed, so pause
        pauseMedia();
    }
}

//This function accepts a path to the image that should be displayed onto the canvas CHANGEME
function setCanvasLogo(path) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var imageObj = new Image();
    imageObj.src = path;
    imageObj.onload = function() {
        ctx.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
        ctx.save();
    };
}

function headerClicked(ev) {
    ev.preventDefault();
    var data = this.dataset.page;
    if (data == "0") { //Now playing was pressed, go to media page
        changePage(1);
    } else if (data == "1") { //Back arrow was pressed, go to podlist page
        changePage(0);
    } else if (data == "2") { //The X on the settings page was pressed, go to podlist page
        changePage(3);
    }
}

function footerClicked(ev) { //Previously decided on a search page but decided to go with a native prompt, thats why its so confusing
    ev.preventDefault();

    if (footerButtons[4].classList.contains("active") && !this.classList.contains("active")) { //If settings page is active then close it
        changePage(3);
    } else {
        if (this.dataset.footer !== "3") { //If footer pressed is not equal to the search footer; I do this because I don't want search to highlight red
            if (!this.classList.contains("active")) { //If the footer pressed is not already active

                //Search through all footer buttons and set the newly pressed one to active while removing the previous active footer
                for (var i = 0; i < footerButtons.length; i++) {
                    if (footerButtons[i].classList.contains("active")) {
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
        } else {
            footerChangePage(this.dataset.footer);
        }
    }
}

function footerChangePage(switchToPage) {
    if (switchToPage == "0" || switchToPage == "1") { //If All or Songs was pressed 
       if (beFunny) { 
			developerA("Will You", "I Will");
	   }else {
		   navigator.notification.confirm(
            'This is a paid feature Upgrade!', // message
            doNothing, // callback to invoke with index of button pressed
            'Traks', // title
            ['OK'] // buttonLabels
        	);
	   }
    } else if (switchToPage == "3") { //If Searched was pressed 
        urlPrompt();
    } else if (switchToPage == "4") { //If Settings was pressed 
        changePage(2);
    }
}

//Prompts user for a url to download podcasts
function urlPrompt() {
    navigator.notification.prompt(
        "Enter A URL of a Podcast to Initiate a Download",
        urlPromptCallback,
        'Traks', ["Get Podcast", "Cancel"],
        "Enter Url Here"
    );
}

function urlPromptCallback(results) {
    if (results.buttonIndex == 1) { //User has selected the get podcast button
        if (urlValidation(results.input1)) { //Validate the url CHANGEME
            if (onlineOffline) { //If the app is online then set value to ajaxArray queue
                ajaxArray.push(results.input1);
                appOnline();
            } else { //Else the app is in offline mode so set value to ajaxOfflineArray queue
                ajaxOffline.push(results.input1);
            }
        } else { //If URL validation was unsuccessfull let them know
            badURL();
        }
    }
}

//CHANGEME
function urlValidation(url) {
    //NEW HATE REGEX
    if(url.startsWith("http://") || url.startsWith("https://")){
        return true;
    } else {
        return false;
    }
    /*OLD
    if(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(url)){
        return true;
    } else {
        return false;
    }
    */
}

function developerA(a, b) {
    navigator.notification.confirm(
        a + ' Give The Developers an A+ So That They Can Complete These Extra Features Later On', // message
        developerAConfirm, // callback to invoke with index of button pressed
        'Traks', // title
        [b, 'No'] // buttonLabels
    );
}

function developerAConfirm(buttonIndex) {
    if (buttonIndex == 1) {
        console.log("SWEET");
    } else {
        developerA("You Must", "Fine");
    }
}

function podChangeFromMedia() {
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
}

function mediaChangeFromPod() {
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
}

function settingsChangeFromPod() {
    wrapper.scrollTop = 0;
    wrapper.style.overflow = "hidden";
    page[0].classList.add('animation-slide-out-up');
    page[2].style.display = "block";
    page[2].classList.add('animation-slide-in-up');
    headerButtons[1].style.display = "none";
    headerButtons[2].style.display = "inline-block";

    setTimeout(function() {
        page[0].style.display = "none";
        page[0].classList.remove('animation-slide-out-up');
        page[2].classList.remove('animation-slide-in-up');
        setHeaderEvents();
    }, 500);
}

function podChangeFromSettings() {
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
    page[0].style.display = "block";
    page[2].classList.add('animation-slide-out-down');
    headerButtons[2].style.display = "none";

    if (theMedia) {
        headerButtons[1].style.display = "inline-block";
    }

    setTimeout(function() {
        page[2].style.display = "none";
        page[0].classList.remove('animation-slide-in-down');
        page[2].classList.remove('animation-slide-out-down');
        wrapper.style.overflow = "scroll";
        setHeaderEvents();
    }, 500);
}

function changePage(switchToPage) {

    removeHeaderEvents();

    if (switchToPage === 0) {
        podChangeFromMedia();
    } else if (switchToPage == 1) {
        mediaChangeFromPod();
    } else if (switchToPage == 2) {
        settingsChangeFromPod();
    } else if (switchToPage == 3) {
        podChangeFromSettings();
    }
}

function onMediaSuccess() {
    clearInterval(theTimer);
    theTimer = null;
    playPause.dataset.play = "0";
    playPause.src = "img/play.png";
    songInput.value = 0;
    songStart.innerHTML = "00:00:00";
    if (!notFinished) {
        navigator.notification.confirm(
            'Would you like to delete ' + episodePlayingText, // message
            onConfirm, // callback to invoke with index of button pressed
            'Traks', // title
            ['Yes', 'No'] // buttonLabels
        );
    }
}

function onConfirm(buttonIndex) {
    if (buttonIndex == 1) {
        window.resolveLocalFileSystemURL(episodePlaying, deletePod, deletePodError);
    }
}

function deletePod(entry) {
    // remove the file
    entry.remove(deleteSuccess, deleteFail);
}

function deletePodError(e) {
    navigator.notification.confirm(
        'Would you like try to delete this episode again?', // message
        onConfirm, // callback to invoke with index of button pressed
        'Traks', // title
        ['Yes', 'No'] // buttonLabels
    );
}

function deleteSuccess(entry) {
    //Entry successfully deleted so delete database entry too
    deletePodPath(eposideUniqueID);

    if (theTime !== null) {
        clearInterval(theTimer);
    }

    theMedia = null;
    songStart.innerHTML = "00:00:00";
    songEnd.innerHTML = "00:00:00";
    songTitle.innerHTML = "&nbsp;";
    songArtist.innerHTML = "&nbsp;";
    if (runCanvas) setCanvasLogo("img/logo.png");
    changePage(0);

    setTimeout(function() {
        headerButtons[1].style.display = "none";
    }, 200);
}

function deleteFail(error) {
    console.log('Error removing file: ' + error.code);
    navigator.notification.confirm(
        'An Error Occured While Deleting', // message
        doNothing, // callback to invoke with index of button pressed
        'Traks', // title
        ['OK'] // buttonLabels
    );
}

function onMediaError(e) {
    console.log("Media error: " + e.message + "(" + e.code + ")");
}

function playMedia() {
    if (theMedia) {
        theMedia.play();
        playPause.dataset.play = "1";
        playPause.src = "img/pause.png";
        theMedia.setVolume(volume.value);
        //Timer to update the UI every second as it plays
        theTimer = setInterval(updateUI, 1000);
    } else {
        //App should never get to this point just incase
        navigator.notification.confirm(
            'No media file to play', // message
            doNothing, // callback to invoke with index of button pressed
            'Traks', // title
            ['OK'] // buttonLabels
        );
    }
}

function seekMedia(ev) {
    if (theMedia) {
        theMedia.seekTo(parseInt(this.value) * 1000);
    }
}

function volumeDragEvent(ev) {
    if (theMedia) {
        theMedia.setVolume(this.value);
    }
}

function pauseMedia() {
    if (theMedia) {
        playPause.dataset.play = "0";
        playPause.src = "img/play.png";
        theMedia.pause();
    }
}

function stopMedia() {
    if (theMedia) {
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
    }
}

/* DATABASE STUFF */

function checkDB() {
    db = openDatabase('kdb', '', 'K DB', 1024 * 1024);
    if (db.version === '') {
        db.changeVersion('', '1.0', createDB, fatalError, createDBSuccess);
        getDatabaseInfo();
    } else {
        getDatabaseInfo();
    }
}

function deleteDB() {
    db = openDatabase('kdb', '', 'K DB', 1024 * 1024);
    if (db.version == '1.0') {
        db.changeVersion('1.0', '1.0', dropDB, fatalError, deleteDBSuccess);
        db.changeVersion('1.0', '1.0', createDB, fatalError, createDBSuccess);
        getDatabaseInfo();
    }
}

function createDB(trans) {
    trans.executeSql('CREATE TABLE podcasts(name_id INTEGER PRIMARY KEY AUTOINCREMENT, pod_text TEXT, episode_text TEXT, path_text TEXT, pic_text TEXT )', [],
        function(tx, rs) {},
        function(tx, err) {
            console.info(err.message);
        });
}

function insertDB(pdFull, epFull, pathFull, picFull) {
    db.transaction(function(trans) {
        trans.executeSql('INSERT INTO podcasts(pod_text, episode_text, path_text, pic_text) VALUES(?,?,?,?)', [pdFull, epFull, pathFull, picFull],
            function(tx, rs) {
                console.log("SQLITE: SUCCESSFULLY INSERTED POD");
                getDatabaseInfo();
            },
            function(tx, err) {
                console.info(err.message);
                getDatabaseInfo();
            });
    }, transErr, transSuccess);
}

function deletePodPath(id) {
    db.transaction(function(trans) {
        trans.executeSql('DELETE FROM podcasts WHERE name_id = ?', [id],
            function(tx, rs) {
                console.log("SQLITE: SUCCESSFULLY DELETED POD");
                getDatabaseInfo();
            },
            function(tx, err) {
                console.info(err.message);
                getDatabaseInfo();
            });
    }, transErr, transSuccess);
}

function dropDB(trans) {
    trans.executeSql('DROP TABLE podcasts', [],
        function(tx, rs) {
            navigator.notification.confirm(
                'All Your Pods Have Been Deleted', // message
                doNothing, // callback to invoke with index of button pressed
                'Traks', // title
                ['OK'] // buttonLabels
            );
        },
        function(tx, err) {
            console.info(err.message);
        });
}

function getDatabaseInfo() {
    db.transaction(function(trans) {
        trans.executeSql('SELECT * FROM podcasts', [],
            function(tx, rs) {
                if (rs.rows.length > 0) {
                    console.log("WE HAVE ROWS");
                    var html = '<ul>';
                    for (i = 0; i < rs.rows.length; i++) {
                        //for (var u=0; u<15; u++){
                        html += '<li class="podList" data-nameid="' + rs.rows.item(i).name_id + '" data-podpod="' + rs.rows.item(i).pod_text + '" data-podepisode="' + rs.rows.item(i).episode_text + '" data-podpath="' + rs.rows.item(i).path_text + '" data-podpic="' + rs.rows.item(i).pic_text + '">' + rs.rows.item(i).episode_text + '</li>';
                        //}
                    }
                    html += '</ul>';
                    page[0].innerHTML = "";
                    page[0].insertAdjacentHTML('afterbegin', html);
                    setPodListEvents();
                } else {
                    page[0].innerHTML = "";
                    page[0].insertAdjacentHTML('afterbegin', NOPODS);
                }
            },
            function(tx, err) {
                console.info(err.message);
            });
    }, transErr, transSuccess);
}

function transErr(tx, err) {
    console.info("Error processing transaction: " + err);
}

function transSuccess() {
    console.info("Trans Successfully Completed");
}

function fatalError(err) {
    console.info(err.message);
}

function createDBSuccess() {
    console.info("DB created Successfully");
}

function deleteDBSuccess() {
    console.info("DB deleted Successfully");
}

//Long list of setting event listeners
var setHeaderEvents = function() {
    for (var i = 0; i < headerButtons.length; i++) {
        headerButtons[i].addEventListener(touch, headerClicked, false);
    }
};
var setSettingsEvents = function() {
    var deleteBtn = document.querySelectorAll(".deleteBtn");
    for (var i = 0; i < deleteBtn.length; i++) {
        deleteBtn[i].addEventListener(touch, settingsClicked, false);
    }
};
var removeHeaderEvents = function() {
    for (var i = 0; i < headerButtons.length; i++) {
        headerButtons[i].removeEventListener(touch, headerClicked, false);
    }
};
var setFooterEvents = function() {
    for (var i = 0; i < footerButtons.length; i++) {
        footerButtons[i].addEventListener(touch, footerClicked, false);
    }
};
var removeFooterEvents = function() {
    for (var i = 0; i < footerButtons.length; i++) {
        footerButtons[i].removeEventListener('tap', footerClicked, false);
    }
};
var setSongControls = function() {
    var rewindFF = document.querySelectorAll('.songControls .rewindFF');
    var songExtras = document.querySelectorAll(".songExtras span");
    var songVolume = document.querySelectorAll(".songVolume img");

    volume.addEventListener("change", volumeDragEvent, false);
    songInput.addEventListener("change", seekMedia, false);
    playPause.addEventListener(touch, playPauseClicked, false);

    for (var i = 0; i < songVolume.length; i++) {
        songVolume[i].addEventListener(touch, volumeClicked, false);
    }

    for (var j = 0; j < songExtras.length; j++) { //Repeat and Delete Buttons 
        songExtras[j].addEventListener(touch, songExtrasClicked, false);
    }

    for (var h = 0; h < rewindFF.length; h++) { //FastForward and Rewind Buttons
        rewindFF[h].addEventListener(touch, rewindFFClicked, false);
    }
};

var addInitialDownloadEvent = function() {
    addInitialDownload.addEventListener(touch, addUrlPrompt, false); 
};
//Prompts user for a url to download podcasts
function addUrlPrompt() {
    navigator.notification.prompt(
        "Enter A URL of a Podcast to Add to Initial Download List",
        addUrlPromptCallback,
        'Traks', ["Add Podcast", "Cancel"],
        "Enter Url Here"
    );
}

function addUrlPromptCallback(results) {
    if (results.buttonIndex == 1) { //User has selected the add podcast button
        if (urlValidation(results.input1)) { //Validate the url CHANGEME
            var newListData = new Option(results.input1, results.input1);
            newListData.setAttribute("selected", "selected");
            initialDownloadSelect.appendChild(newListData);
            initialPodCheck.push(results.input1);
            window.localStorage.setItem("initialPodCheck", JSON.stringify(initialPodCheck));
        } else { //If URL validation was unsuccessfull let them know
            badURL();
        }
    }
}
function badURL () {
    navigator.notification.confirm(
                'Please Enter a valid URL it must begin with "http://" or "https://"', // message
                doNothing, // callback to invoke with index of button pressed
                'Traks', // title
                ['OK'] // buttonLabels
            );
}
var initialDownloadSelectEvent = function() {
    initialDownloadSelect.addEventListener('change', initialDownloadSelectChange, false); 
};
var amountPodcastsSelectEvent = function () {
    amountOfPodcasts.addEventListener('change', amountPodcastsSelectChange, false);
};
function amountPodcastsSelectChange() {
    latestAmount = parseInt(this.options[this.selectedIndex].value);
    window.localStorage.setItem("latestAmount", latestAmount);   
}
function initialDownloadSelectChange() {
    var newInitialArray = [];

    for (var i = 0; i < initialDownloadSelect.options.length; i++){  
        if(initialDownloadSelect.options[i].selected) {
            newInitialArray.push(initialDownloadSelect.options[i].value);
        }  
    } 

    window.localStorage.setItem("initialPodCheck", JSON.stringify(newInitialArray));
    
}
var setPodListEvents = function() {
    var podList = document.querySelectorAll('#home .podList');
    for (var i = 0; i < podList.length; i++) {
        podList[i].addEventListener('click', podClicked, false); //Only event that must be click as user needs to be able to drag down when list goes below footer
    }
};

//Cool Way to code object oriented with javascript
function Variable(initVal, onChange) {
    this.val = initVal;
    this.onChange = onChange;

    this.getValue = function() {
        return this.val;
    };
    this.SetValue = function(value) {
        this.val = value;
        if (this.value === true) {
            this.onChange();
        }
    };
}

//Object created by Simon M to simulate network service
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

//Touch check function curtesy of Steve G
function detectTouchSupport() {
    msGesture = navigator && navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 && MSGesture;
    touchSupport = (("ontouchstart" in window) || msGesture || (window.DocumentTouch && document instanceof DocumentTouch));
    return touchSupport;
}
