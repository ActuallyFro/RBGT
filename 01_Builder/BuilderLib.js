// Global var to store the propsed ledger entry, as array of strings
var isLedgerEmpty = true;
var isLogEmpty = true;
var oldLedger = [];

// var targets = [
//   ["Grevnyrch", "Locations", "G"],
//   ["Kla'Bbbert", "Locations", "KB"]
//   ];

//Convert Log to ScratchPadEntries
var Log = [];



//3. LogIt 
//===========
function LogIt() {
  if (isLedgerEmpty){
    LedgerIt(); //Auto-ledger then log it
  }

  if (isLogEmpty){
    isLogEmpty = false;
    document.getElementById("ScratchPad").innerHTML = "<table id=\"TableScratchPad\" class=\"table table-striped\"><tbody id=\"ScratchPadBody\"></tbody></table>";
    //console.log("[DEBUG] [LogIt()] Logs table created");
  } 

  var obj = document.getElementById("ledger");
  var currentLedger = document.getElementById("ledger").value;
  Log.push(currentLedger);


  var row = document.createElement("tr");

  var cell = document.createElement("td");
  safeCurrentStr = currentLedger.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  cell.innerHTML = safeCurrentStr;
  row.appendChild(cell);
  document.getElementById("LogsTable").appendChild(row);


  CheckAndAddTarget();
  ClearLedger();
  ClearTag();
  ClearTarget();

  LocalStorageLogsSave();

  //Any time LogIt() is called -- reset the inner-bracket toggles
  ToggleDisableInnerbracket();

  hasBracketBuildingStarted = false;
}



//////////////////////////////////////
// V. Import/Export

// //1. Prep Targets as JSON String
// //=========================
// function TargetArrayStringifyAsJSON(){
//   return JSON.stringify(targets);
// }

//2. Prep Logs as JSON String
//=========================
function LogsStringifyAsJSON(){
  return JSON.stringify(Log);
}


//3. Export - Targets (JSON)
//=========================
// function ExportTargetArrayToJson() {
//   var text = TargetArrayStringifyAsJSON();
//   var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
//   saveAs(blob, "New_Graph.gxl");
// }

//4. Export - Logs (JSON)
//=========================
function ExportLogToJson() {
  var text = LogsStringifyAsJSON();
  var blob = new Blob([text], {type: "text/plain;charset=utf-8"});

  var date = new Date();
  var textIso = date.toISOString();  
  console.log("[DEBUG] [ExportLogToJson()] date str:<" + textIso+">");

  saveAs(blob, "RBGT_Graph_"+textIso+".gxl");
}

// /////////////////////////////////

// function LoadArrayIntoLog(PassedArray){ //Passed JSON Parsed from String
//   Log = [];
//   for (var i = 0; i < PassedArray.length; i++) {
//     Log.push(PassedArray[i]);
//   }
// }

// function LoadLogArrayIntoTable(){  // \" class=\"table table-striped\"><tbody id=\"LogTableBody
//   document.getElementById("Logs").innerHTML = "<table id=\"TableLogTable\" class=\"table table-striped\"><tbody id=\"LogTableBody\"></tbody></table>";
//   for (var j = 0; j < Log.length; j++) {
//     var row = document.createElement("tr");
//     var cell = document.createElement("td");

//     cell.innerHTML = Log[j];
//     row.appendChild(cell);

//     document.getElementById("LogsTable").appendChild(row);      
//   }
// }

// function LoadArrayIntoTargets(PassedArray){ //Passed JSON Parsed from String
//   targets = [];
//   for (var i = 0; i < PassedArray.length; i++) {
//     targets.push(PassedArray[i]);
//   }

// }

// function LoadAllTargetsAsOptions(debug=false){ //this vs. SetupTargetsBasedOnB
//   for (var j = 0; j < targets.length; j++) {
//     var hasTwoTargets = false;
//     var currentTarget = targets[j][0];
//     var secondaryTarget = "";
//     /////////////
//     //TODO:
//     if (currentTarget.includes(";;")) {
//       if (debug) {
//         console.log("[DEBUG] [LoadAllTargetsAsOptions()] Target '"+targets[j][0]+"' includes ';;' !");
//       }

//       currentTarget = currentTarget.split(";;")[0];
//       secondaryTarget = targets[j][0].split(";;")[1];
//       hasTwoTargets = true;
//     }
//     /////////////
//     var isDone = true;
//     do {
//       var option = document.createElement("option");
//       option.text = currentTarget;
  
//       var safeStr = targets[j][0].replace(/'/g, "\\'");
  
//       if (debug){
//         console.log("[DEBUG] [LoadAllTargetsAsOptions()] '"+targets[j][0]+"'");
//         console.log("safeStr: '" + safeStr + "'");
//       }
  
//       document.getElementById("targets").appendChild(option);
//       document.getElementById("TargetButtons").innerHTML += "<button type=\"button\" class=\"btn btn-secondary\" onclick=\"addLedgerStringInnerBracket('"+safeStr+ "')\">" + targets[j][0] + "</button>";

//       if (hasTwoTargets){
//         currentTarget = secondaryTarget;
//         hasTwoTargets = false;
//       } else {
//         isDone = false;
//       }

//     } while (isDone);

//     /////////////
//   } 



// }


//////////////////////////////////////

//5. Import - Logs (JSON)
//=======================
// function ImportJsonToLog(){
//   //(a) Take provided file (and ONLY one file, if multiple files passed), (b) load content into Log[] array, (c) load into <table>, (d) then check if valid.
//   var file_to_read = document.getElementById("fileInputLog").files[0];
//   var fileread = new FileReader();

//   fileread.onload = function(e) {
//     var content = e.target.result;
//     var parsedLog = JSON.parse(content);

//     //(b) - Load content into Log[]
//     LoadArrayIntoLog(parsedLog);

//     //(c) - load Log[] entries into <table>
//     LoadLogArrayIntoTable();

//     //(d) - Check if load was valid/successful
//     if (Log.length > 0) {
//       isLogEmpty = false;
//       alert("Successfully loaded '"+ Log.length +"' Logs!");

//       LocalStorageLogsSave();

//     } else {
//       isLogEmpty = true;      
//       alert("[Warning] No Logs imported, please check source file!");
//     }

//   };

//   //(a) 
//   fileread.readAsText(file_to_read);
// }


// //6. Import - Targets (JSON)
// //=========================
// function ImportJsonToTargets(){
//   var file_to_read = document.getElementById("fileInputTargets").files[0];
//   var fileread = new FileReader();

//   fileread.onload = function(e) {
//     var content = e.target.result;
//     var parsedTarget = JSON.parse(content);

//     LoadArrayIntoTargets(parsedTarget);

//     LoadAllTargetsAsOptions(); //(true)
//     alert("Successfully loaded (" + targets.length + ") targets!");
  
//   };

//   fileread.readAsText(file_to_read);
// }

//7. Export - SaveAs (creates download blob with a given filename)
//=========================
function saveAs(blob, filename) {
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(function() {
    URL.revokeObjectURL(url);
  }, 100);
}

//8. localstorage - Clear
//=======================
function LocalStorageClear(debug=false){
  localStorage.clear();  
  if (debug){
    console.log("[DEBUG][LocalStorageClear] Cleared all user/page created keys!");
  }
}

function LocalStorageClearLogsOnly(debug=false){
  localStorage.removeItem('RBGT-Logs');
  if (debug){
    console.log("[DEBUG][LocalStorageClear] Cleared all user/page created keys - for Logs!");
  }
}

// function LocalStorageClearTargetsOnly(debug=false){
//   localStorage.removeItem('RBGT-Targets');
//   if (debug){
//     console.log("[DEBUG][LocalStorageClear] Cleared all user/page created keys - for Targets!");
//   }
// }

//9. localstorage - Get Total Keys
//=======================
function LocalStorageLoadMainKeys(debug=false){
  var totalKeys=0;

  var loadedLogs = false;

  for(var key in window.localStorage){
    if(window.localStorage.hasOwnProperty(key)){ //aka: NOT inherited; otherwise ALL defaults counted (e.g., length, clear, get, remove, set, etc.)
      totalKeys++;
      if (debug){
        console.log("[DEBUG][LocalStorageLoadMainKeys] Found key: '" + key + "'");
        console.log( key + " = " + ((window.localStorage[key].length * 16)/(8 * 1024)).toFixed(2) + ' KB' );
      }  
      if (key === "RBGT-Logs"){
        if (debug){
          console.log("[DEBUG][LocalStorageLoadMainKeys] Loading Logs saved in 'RBGT-Logs'!");
        }
        
        //Load content into Log[]
        var storedlogs = localStorage.getItem('RBGT-Logs');
        var parsedLog = JSON.parse(storedlogs);
        LoadArrayIntoLog(parsedLog);
        if (debug){
          console.log("[DEBUG][LocalStorageLoadMainKeys] Loaded string <" + storedlogs + ">");
          console.log("[DEBUG][LocalStorageLoadMainKeys] Parsed string <" + parsedLog + ">");
          console.log("[DEBUG][LocalStorageLoadMainKeys] Loaded '" + Log.length + "' Logs");
        }

        //(c) - load Log[] entries into <table>
        LoadLogArrayIntoTable();

        loadedLogs = true;
        isLogEmpty = false;

      }
      // else if (key === "RBGT-Targets"){
      //   debug = true; //BAD -- REMOVE!
      //   if (debug){
      //     console.log("[DEBUG][LocalStorageLoadMainKeys] Loading Targets saved in 'RBGT-Targets'!");
      //   }

      //   var loadedStorage = localStorage.getItem('RBGT-Targets');
      //   var parsedTarget = JSON.parse(loadedStorage);
      //   LoadArrayIntoTargets(parsedTarget);
      //   LoadAllTargetsAsOptions(); //(true)

      //   SetupAllTargets();
      // }
    }
  }

  // FIX THIS:
  if (!loadedLogs){
    document.getElementById("ScratchPad").innerHTML = "<div id=\"ScratchPadStatus\" style=\"background-color:rgba(178, 178, 188, 0.571);\"><h2><i>{empty}</i></h2></div>";
  }

  return totalKeys;
}

//10. localstorage - Save Logs
//=======================
function LocalStorageLogsSave(debug=false){
  var newLogsStr = LogsStringifyAsJSON();

  if (debug){
    console.log("[DEBUG][LocalStorageLogsSave] Saving Logs to localstorage...");    
    console.log("[DEBUG][LocalStorageLogsSave] NewString: " + newLogsStr);
  }

  localStorage.setItem('RBGT-Logs', newLogsStr);

}

// //10. localstorage - Save Targets
// //=======================
// function LocalStorageTargetsSave(debug=false){
//   var newTargetStr = TargetArrayStringifyAsJSON();

//   if (debug){
//     console.log("[DEBUG][LocalStorageTargetsSave] Saving Targets to localstorage...");    
//     console.log("[DEBUG][LocalStorageTargetsSave] NewString: " + newTargetStr);
//   }

//   localStorage.setItem('RBGT-Targets', newTargetStr);

// }

//////////////////////////////////////




