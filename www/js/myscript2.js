document.addEventListener("deviceready", init, false);

function init() {
   //checkDB();
   deleteDB();
}

function checkDB(){
    db = openDatabase('kdb', '', 'K DB', 1024*1024);
    if(db.version == ''){
        db.changeVersion('', '1.0', createDB, fatalError, createDBSuccess);		
       	 getDatabaseInfo();
    }else{  
       	 getDatabaseInfo();
    }
}
function deleteDB(){
    db = openDatabase('kdb', '', 'K DB', 1024*1024);
    if(db.version == '1.0'){
       db.changeVersion('1.0', '1.0', dropDB, fatalError, deleteDBSuccess);
		//db.changeVersion('1.0', '1.0', createDB, fatalError, createDBSuccess);		
       	//getDatabaseInfo();
    }
}
function createDB (trans){             
	trans.executeSql('CREATE TABLE songs(name_id INTEGER PRIMARY KEY AUTOINCREMENT, name_text TEXT, path_text TEXT, pic_text TEXT )', [], 
					function(tx, rs){
					},
					function(tx, err){
						console.info( err.message);
					});   
	trans.executeSql('INSERT INTO songs(name_text, path_text, pic_text) VALUES(?,?,?)', ["CHRISTMAS", "data/files/podcasts/jon.mp3", "HALLOWEEN.jpg"], 
					function(tx, rs){  
						console.log('WE BE INSERTING');;
					},
					function(tx, err){
						console.info( err.message);
					});            
}
function dropDB (trans){            
	trans.executeSql('DROP TABLE songs', [], 
					function(tx, rs){
					},
					function(tx, err){
						console.info( err.message);
					});
}
function getDatabaseInfo() {	
	db.transaction(function(trans){
        trans.executeSql('SELECT * FROM songs', [], 
            function(tx, rs){
				  var html6 = '';
				  for (i=0;i<rs.rows.length; i++){
					 html6 += 'name_text: ' + rs.rows.item(i).name_text + ' path_text: ' + rs.rows.item(i).path_text + ' pic_text: ' + rs.rows.item(i).pic_text; 
				  }
                console.log (html6);
            }, 
            function(tx, err){
                console.info( err.message);
            });    
    }, transErr, transSuccess);
	
	db.transaction(function(trans){
        trans.executeSql('DELETE FROM songs WHERE path_text = ?', ["data/files/podcasts/jon.mp3"], 
            function(tx, rs){
                console.log ("SUCCESSFULLY DELETED");
            }, 
            function(tx, err){
                console.info( err.message);
            });    
    }, transErr, transSuccess);	
	/*
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