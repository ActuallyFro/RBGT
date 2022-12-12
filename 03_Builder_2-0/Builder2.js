// Separate Popper & JS:
/* <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.5/dist/umd/popper.min.js" integrity="sha384-Xe+8cL9oJa6tN/veChSP7q+mnSPaj5Bcu9mPX5F5xIGE0DVittaqT5lorf0EI7Vk" crossorigin="anonymous"></script> */
/* <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.min.js" integrity="sha384-ODmDIVzN+pFdexxHEHFBQH3/9/vQ9uori45z4JjnFsRydbmQbmL5t1tQ0culUzyK" crossorigin="anonymous"></script> --> */

//////////////////////////////////////
// Table of Contents
// =================
// I. Vars and Lookups
// II. OnPageLoad/Init
// III. GUI Usage Functions
// IV. Usage/Async I/O Functions
// V. Import/Export
//////////////////////////////////////


//////////////////////////////////////
// I. Vars and Lookups

// var isEntryEmpty = true;
var isEntryEmpty = true;
var EntryTableArray = [];

var objects = [
  ["", "", "", ""],
  ["", "=== Graph objects ===", "GUI - Selection Title", "Disabled"],
  ["Node", "Graph", "GraphObjects", ""],
  ["Edge", "Graph", "GraphObjects", ""]
];

var EntryIDTargets = [];

var isSetupGraphNode = false;
//////////////////////////////////////

//////////////////////////////////////
// II. OnPageLoad/Init

//1. Page setup:
//============== 
window.onload = function() {
  //BAD: LocalStorageClear(true);

  //1. Determine if LocalStorage's EntryTableArray[] is empty: (a) if not -- load, else -- print empty:
  var totalLSKeys = LocalStorageLoadMainKeys(); //LocalStorageLoadMainKeys(true)
  console.log("[NOTICE] (Builder2.js) total LSKeys loaded: " + totalLSKeys);
  //2. Setup Page Elements
  SetupBracketDropDown();

  //3. Setup Event Listeners/Watchers
  SetupWatcherUserPicksBracketDropDown();
  SetupWatcherUserTogglesSettingDarkMode(); 

}

function SetupObjectGraphNode(){
  if (!isSetupGraphNode){
    //jQuery!
    $(document).ready(function(){
      var maxField = 10; //Input fields increment limitation
      var addButton = $('.add_button'); //Add button selector
      var wrapper = $('.OptionAttributeEntryGraphNodeFieldsDynamic'); //Input field wrapper
      var fieldHTML = '<div> \
                        <label for="fieldNodeKeyVal">Key</label>\
                        <input type="text" name="fieldNodeKeyVal" value=""/>\
                        <label for="fieldNodeDataVal">Value</label>\
                        <textarea name="fieldNodeDataVal" placeholder=""></textarea>\
                        <a href="javascript:void(0);" class="remove_button"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-file-minus\" viewBox=\"0 0 16 16\"><path d=\"M5.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z\"/><path d=\"M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z\"/></svg></a>\
                        </div>'; //New input field html 
      var x = 1; //Initial field counter is 1
      
      //Once add button is clicked
      $(addButton).click(function(){
          //Check maximum number of input fields
          if(x < maxField){ 
              x++; //Increment field counter
              $(wrapper).append(fieldHTML); //Add field html
          }
      });
      
      //Once remove button is clicked
      $(wrapper).on('click', '.remove_button', function(e){
          e.preventDefault();
          $(this).parent('div').remove(); //Remove field html
          x--; //Decrement field counter
      });
    });



    isSetupGraphNode = true;
    
  }    
}

function SetupWatcherUserPicksBracketDropDown(debug=false){
  document.getElementById("BracketDropDown").addEventListener("change", function() {
    var selectedBracketTag = document.getElementById("BracketDropDown").value;
    if (debug){
      console.log("[DEBUG] User selected dropdown:" + selectedBracketTag);  
    }

    SetupEntryIDTargetsBasedOnBracketPick(selectedBracketTag);
  });
  
}

function SetupWatcherUserTogglesSettingDarkMode(debug=false){
  document.getElementById("toggleSettingDarkMode").addEventListener("change", function() {
    var isDarkMode = document.getElementById("toggleSettingDarkMode").checked;
    if (debug){
      console.log("[DEBUG] User toggled DarkMode to: " + isDarkMode);
    }
    ToggleDarkMode(isDarkMode);
  });
}

function ToggleDarkMode(isDarkMode, debug=false){
  if (debug){
    console.log("[DEBUG] User toggled DarkMode to: " + isDarkMode);
  }
  if (isDarkMode){
    document.getElementById("body").className = "bg-dark text-light";
    document.getElementById("Navigation").className = "navbar navbar-expand-lg navbar-dark bg-secondary";
    var elms = document.querySelectorAll("#BtnDiceDark");
    for(var i = 0; i < elms.length; i++) {
      elms[i].className = "btn btn-light";
    }

    document.getElementById("LabelEntryTable").style = "font-size: 40px; background-color: #000000; padding: 0px 5px;"
    doesTableEntryTableExist = document.getElementById("TableEntryTable");
    if (doesTableEntryTableExist){
      document.getElementById("TableEntryTable").className = "table table-striped table-dark table-bordered table-hover text-white";
    }

  } else {
    document.getElementById("body").className = "bg-light text-dark";
    document.getElementById("Navigation").className = "navbar navbar-expand-lg navbar-light bg-light";

    var elms = document.querySelectorAll("#BtnDiceDark");
    for(var i = 0; i < elms.length; i++) {
      elms[i].className = "btn btn-dark";
    }

    document.getElementById("LabelEntryTable").style = "font-size: 40px; background-color: #F3F5F6; padding: 0px 5px;"
    doesTableEntryTableExist = document.getElementById("TableEntryTable");
    if (doesTableEntryTableExist){
      document.getElementById("TableEntryTable").className = "table table-striped"
    }

  }


  if (debug){
    console.log("[DEBUG] Saving Setting to LocalStorage!");
  }
  LocalStorageSettingsSaveDarkMode(isDarkMode);

}

function MenuClearStorage(debug=true){
  if (debug){
    console.log("[DEBUG] User clicked ClearStorage");
  }
  LocalStorageClear(true);  
}

// N1. NOT-Bracket, but Object Drop Down setup:
//============================ 
function SetupBracketDropDown(){
  document.getElementById("BracketDropDown").innerHTML = null; //reset buttons

  for (var i = 0; i < objects.length; i++) {
    var option = document.createElement("option");

    option.value = objects[i][0];

    if (objects[i][1] != ""){
      option.text = objects[i][1] + ": " + objects[i][0];
    } else {
      option.text = "";
    }

    if (objects[i][3] == "Disabled") {
      option.disabled = true;
    }
    
    document.getElementById("BracketDropDown").appendChild(option);

  }

}

//2. All EntryIDTargets setup:
//===================== 
function SetupAllEntryIDTargets() {
  //TO DO -- determine localstorage load, then run this.
  SetupEntryIDTargetsBasedOnBracketPick("");
}

//3. Speciifc Class of EntryIDTargets setup:
//===================================
function SetupEntryIDTargetsBasedOnBracketPick(SelectedBracket, debug=false){
  // console.log("Selected Bracket: '" + SelectedBracket + "'");
  document.getElementById("OptionAttributeEntryIDList").innerHTML = null; //reset EntryIDTargets
  // document.getElementById("TargetButtons").innerHTML = null; //reset buttons

  if (debug){
    console.log("[DEBUG] Selected Bracket: '" + SelectedBracket + "'");
  }

  if (SelectedBracket == "") {
    LoadAllEntryIDTargetsAsOptions(); //(true) //TODO: figure out what this does...
    // console.log("[WARNING] No type selected!");
    document.getElementById("SelectionMenuOption").innerHTML = "<i>{Select above}</i>";

  } else {

    //QUESTION: Render 'menus' based on selection...
    
    if (SelectedBracket == "Node") {
      document.getElementById("SelectionMenuOption").innerHTML = "<u><b>Graph - Node Options:</b></u>";

      document.getElementById("SelectionMenuOption").innerHTML += "<div class=\"form-group\" id=\"OptionAttributeEntryGraphNodeDivGroup\">";

      document.getElementById("SelectionMenuOption").innerHTML += "<div class=\"OptionAttributeEntryGraphNodeFieldsDynamic\">";
      document.getElementById("SelectionMenuOption").innerHTML += "  <!-- Source: https://www.codexworld.com/add-remove-input-fields-dynamically-using-jquery/ -->";
      document.getElementById("SelectionMenuOption").innerHTML += "  <div>";
      document.getElementById("SelectionMenuOption").innerHTML += "    <label for=\"OptionAttributeEntryGraphNodeFieldKeyVal\">Key</label>";
      document.getElementById("SelectionMenuOption").innerHTML += "    <input type=\"text\" name=\"OptionAttributeEntryGraphNodeFieldKeyVal\" value=\"\"/>";
      document.getElementById("SelectionMenuOption").innerHTML += "    <label for=\"OptionAttributeEntryGraphNodeFieldDataVal\">Value</label>";
      document.getElementById("SelectionMenuOption").innerHTML += "    <textarea name=\"OptionAttributeEntryGraphNodeFieldDataVal\" placeholder=\"\"></textarea>";
      document.getElementById("SelectionMenuOption").innerHTML += "      <a href=\"javascript:void(0);\" class=\"add_button\" title=\"Add field\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-file-plus\" viewBox=\"0 0 16 16\"><path d=\"M8.5 6a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5V10a.5.5 0 0 0 1 0V8.5H10a.5.5 0 0 0 0-1H8.5V6z\"/><path d=\"M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z\"/></svg></a>";
      document.getElementById("SelectionMenuOption").innerHTML += "  </div>";
      document.getElementById("SelectionMenuOption").innerHTML += "</div>";
      document.getElementById("SelectionMenuOption").innerHTML += "</div>  ";

      SetupObjectGraphNode();

      document.getElementById("SelectionMenuOption").innerHTML += "<hr>";
      document.getElementById("SelectionMenuOption").innerHTML += "<input type=\"button\" class=\"btn btn-danger\" value=\"Clear Node Entry\" onclick=\"ClearGraphEntryNode()\">";
      document.getElementById("hiddenGlobalObjectType").value = "GraphNode";

    } else if (SelectedBracket == "Edge") {
      document.getElementById("SelectionMenuOption").innerHTML = "<u><b>Graph - Edge Options:</b></u>";
      document.getElementById("SelectionMenuOption").innerHTML += "<div class=\"form-group\" id=\"OptionAttributeEntryGraphEdgeDivGroup\">";
      document.getElementById("SelectionMenuOption").innerHTML += "<div class=\"row\">";
      document.getElementById("SelectionMenuOption").innerHTML += "  <div class=\"col-6\">";
      document.getElementById("SelectionMenuOption").innerHTML += "    <label for=\"eFieldSource\">Source</label>";
      document.getElementById("SelectionMenuOption").innerHTML += "    <input type=\"text\" class=\"form-control w-100\" id=\"OptionAttributeEntryGraphEdgeFieldSource\" placeholder=\"the 'id' for source\">";
      document.getElementById("SelectionMenuOption").innerHTML += "  </div>";
      document.getElementById("SelectionMenuOption").innerHTML += "  <div class=\"col-6\">";
      document.getElementById("SelectionMenuOption").innerHTML += "    <label for=\"OptionAttributeEntryGraphEdgeFieldTarget\">Target</label>";
      document.getElementById("SelectionMenuOption").innerHTML += "    <input type=\"text\" class=\"form-control w-100\" id=\"OptionAttributeEntryGraphEdgeFieldTarget\" placeholder=\"the 'id' for target\">";
      document.getElementById("SelectionMenuOption").innerHTML += "  </div>";
      document.getElementById("SelectionMenuOption").innerHTML += "</div>";
      document.getElementById("SelectionMenuOption").innerHTML += "</div>";


      document.getElementById("SelectionMenuOption").innerHTML += "<hr>";
      document.getElementById("SelectionMenuOption").innerHTML += "<input type=\"button\" class=\"btn btn-danger\" value=\"Clear Edge Entry\" onclick=\"ClearGraphEntryEdge()\">";
      document.getElementById("hiddenGlobalObjectType").value = "GraphEdge";

//       document.getElementById("hiddenGlobalObjectType").value = "GraphEdge";
//<input type="button" class="btn btn-primary" onclick="EntryIt(true)" value="Add It!">

// update onClick="EntryIt(true)" to onClick="EntryIt(true, 'GraphEdge')" for id

    }
  }
}


//////////////////////////////////////

//////////////////////////////////////
// III. GUI Usage Functions

//1. Clear - Entry 
//=============
function ClearEntry(debug=false) {
  if (isEntryEmpty){
    return;
  }

  isEntryEmpty = true;

  if (debug){
    console.log("[DEBUG][ClearEntry] NO entries -- showing empty table!");
  }
  document.getElementById("EntriesContainer").innerHTML = "<br><br><div id=\"EntryTableDiv\" style=\"background-color:rgba(178, 178, 188, 0.571);\"><h2><i>{Entries are empty}</i></h2></div>";

  EntryTableArray = [];
  LocalStorageClearEntriesOnly();
}

//2. Clear -For the Target ID
//================
function ClearObjectsEntry() {
  document.getElementById("OptionAttributeEntryID").value = "";
}

//3. Clear - ALL Entries in the Target ID Array
//================
function ClearTargetArray() {
  if (EntryIDTargets.length === 0) {
    return;
  }

  EntryIDTargets = [];
  LocalStorageClearEntryIDTargetsOnly();
}

//4. Clear - ALL entered data for <Graph> - {Edge}
//================
function ClearGraphEntryEdge(debug=false){
  if(debug){
    console.log("[DEBUG] [ClearGraphEntryEdge()] Clearing Edge Entry");
  }

  ClearObjectsEntry();

  document.getElementById("OptionAttributeEntryGraphEdgeFieldSource").value = "";
  document.getElementById("OptionAttributeEntryGraphEdgeFieldTarget").value = "";
}



//////////////////////////////////////

//////////////////////////////////////
// IV. Usage/Async I/O Functions

//1. Target - Check if Exists, Add if not
//=======================================
function CheckAndAddTarget(){

  //Likely: all 'target' are 'OptionAttributeEntryID'
  var EntryIDTargetToCheck = document.getElementById("OptionAttributeEntryID").value;

  if (EntryIDTargetToCheck == ""){
    return;
  }

  var newEntryIDTarget = true;
  for (var i = 0; i < EntryIDTargets.length; i++) {
    if (EntryIDTargets[i][0] == EntryIDTargetToCheck) {
      newEntryIDTarget = false; //target exists
    }
  }

  var objectselectedOption = document.getElementById("BracketDropDown").selectedIndex;

  var BannedOption = true;
  var objectsetting = objects[objectselectedOption][3];
  // for (var j = 0; j < objects.length; j++) {
  if (objectsetting != "Dice" && objectsetting != "Ignore") {
    BannedOption = false; //target exists
  }

  var Repeat = false;
  for (var k = 0; k < EntryIDTargets.length; k++) {
    // console.log("[DEBUG] [CheckAndAddTarget()] Comparing " + EntryIDTargetToCheck + " to " + EntryIDTargets[k][0]);
    if (EntryIDTargets[k][0] == EntryIDTargetToCheck) {
      Repeat = true; //target exists
      // console.log("[DEBUG] [CheckAndAddTarget()] Repeating Target... skipping!");
    }
  }

  if (newEntryIDTarget && !BannedOption && !Repeat) {
    // var option = document.createElement("option");
    // option.text = targetToCheck;
    // document.getElementById("EntryIDTargets").appendChild(option);
    
    console.log("[DEBUG] [CheckAndAddTarget()] Adding Target: " + EntryIDTargetToCheck + " with category: " + objects[objectselectedOption][2]);
    // var newTarget = [targetToCheck, objects[adjustedBracketNumber][2] , ""];
    var newEntryIDTargetTuple = [EntryIDTargetToCheck, objects[objectselectedOption][2] , ""];
    EntryIDTargets.push(newEntryIDTargetTuple);

    LocalStorageEntryIDTargetsSave(); //(true)
  }

}

//2. AddObject 
//===========
function AddObject(debug=true) {
  if (debug){
    console.log("[DEBUG] [AddObject()] Setting hasBracketBeenPlaced is: " + hasBracketBeenPlaced);
  }

  var tempTarget = document.getElementById("target").value;

  if (tempTarget == ""){
    console.log("[ERROR] [AddObject()] Target is empty! Skipping add!");
    return;
  }

  //isEntryEmpty =?= hasBracketBuildingStarted??
  if (isEntryEmpty){    
    if (debug){
      console.log("[DEBUG] [AddObject()] {Empty Ledger} Updating flags!");
    }

    isEntryEmpty = false;
  }

  CheckAndAddTarget();

  if (debug){
    console.log("[DEBUG] [AddObject()] DONE!!!");
  }

  //EXAMPLE: move cursor to the end of the ledger input field
  // var obj = document.getElementById("ledger");
  //obj.focus(); // THIS will pop up a keyboard prompt on mobile devices
  // obj.setSelectionRange(obj.value.length, obj.value.length);
}

function PrepareEntryGraphEdge(debug=true){
  var finalEntry = "";

  // Example: <edge id="WithinSystem" source="PlanetEarth" target="SystemSol"/>
  var EntryID = document.getElementById("OptionAttributeEntryID").value;
  var source = document.getElementById("OptionAttributeEntryGraphEdgeFieldSource").value;
  var target = document.getElementById("OptionAttributeEntryGraphEdgeFieldTarget").value;

  if (debug){
    console.log("[DEBUG] [PrepareEntryGraphEdge()] Started");
    console.log("[DEBUG] [PrepareEntryGraphEdge()]     EntryID: " + EntryID);
    console.log("[DEBUG] [PrepareEntryGraphEdge()]     Source: " + source);
    console.log("[DEBUG] [PrepareEntryGraphEdge()]     Target: " + target);
  }

  finalEntry = "<edge id=\"" + EntryID + "\" source=\"" + source + "\" target=\"" + target + "\"/>";

  if (debug){
    console.log("[DEBUG] [PrepareEntryGraphEdge()] Final Entry: " + finalEntry);
  }

  return finalEntry;
}




function PrepareEntryGraphNode(debug=true){
  if (debug){
    console.log("[DEBUG] [PrepareEntryGraphNode()] Started");
  }

  var finalEntry = "{NO ENTRY!}";

  var EntryID = document.getElementById("OptionAttributeEntryID").value;

  // var nodeDataValues = "";
  // var nodeDataKeys = ""; 

  // nodeDataKeysArray = document.getElementsByName("fieldNodeKeyVal");
  // nodeDataValuesArray = document.getElementsByName("fieldNodeDataVal");

  finalEntry = "<node id=\""+ EntryID +"\">\n";

  //TODO: Migrate
  // if(nodeDataKeysArray.length > 0 && nodeDataValuesArray.length > 0) {
  //   for(var index=0; index < nodeDataKeysArray.length; index++) {
  //     nodeString.textContent += "\t<data key=\""+nodeDataKeysArray[index].value+"\">";

  //     if ( nodeDataKeysArray[index].value == "descriptionNode"){
  //       nodeString.textContent += "<![CDATA[\n";
        
  //       var textareaBuffer = nodeDataValuesArray[index].value;

  //       var textareaLines = textareaBuffer.split("\n");
  //       for(var lineIndex=0; lineIndex < textareaLines.length; lineIndex++) {
  //         textareaLines[lineIndex] = "\t\t" + textareaLines[lineIndex];
  //       }
  //       nodeString.textContent += textareaLines.join("\n");

  //       nodeString.textContent += "\n\t]]></data>\n";

  //     } else {
  //       nodeString.textContent += nodeDataValuesArray[index].value;
  //       nodeString.textContent +="</data>\n";
  //     }

  //   }

  // } else {
  //   nodeString.textContent += "\t<data key=\"\"> EMPTY! </data>\n";
  // }

  finalEntry += "</node\> \n\n";

  if (debug){
    console.log("[DEBUG] [PrepareEntryGraphNode()] Final Entry: " + finalEntry);
  }

  return finalEntry;
}


function PrepareEntry(debug=true){
  var finalEntry = "";

  type = document.getElementById("hiddenGlobalObjectType").value;
  if (debug){
    console.log("[DEBUG] [PrepareEntry()] Started");
    console.log("[DEBUG] [PrepareEntry()] Type: " + type);
  }


  if (type == "GraphEdge"){
    finalEntry = PrepareEntryGraphEdge();

  } else if (type == "GraphNode"){
    finalEntry = PrepareEntryGraphNode();

  } else {
    finalEntry = "{NONE PROCESSED!}";
  }

  if (debug){
    console.log("[DEBUG] [PrepareEntry()] Pushing Entry: " + finalEntry);
  }

  return finalEntry;
}

//3. EntryIt 
//===========
function EntryIt(debug=true) {

  if (isEntryEmpty){
    isEntryEmpty = false;
    document.getElementById("EntriesContainer").innerHTML = "<br><br><table id=\"TableEntryTable\" class=\"table table-striped\"><tbody id=\"TableEntryBody\"></tbody></table>";
    //console.log("[DEBUG] [EntryIt()] Entries table created");
    if (debug){
      console.log("[DEBUG] [EntryIt()] {Empty} Table for Entries! Creating new table!");
    }
  } 

  newEntry = PrepareEntry();

  EntryTableArray.push(newEntry);

  var row = document.createElement("tr");
  var cell = document.createElement("td");
  safeCurrentStr = newEntry.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  cell.innerHTML = safeCurrentStr;
  row.appendChild(cell);
  document.getElementById("TableEntryTable").appendChild(row);

  CheckAndAddTarget();

  LocalStorageEntriesSave();

  if (debug){
    console.log("[DEBUG] [EntryIt()] DONE!!!");
  }

}

//4. RemoveLastEntry 
//================
function RemoveLastEntry(debug=true) {
  if (debug){
    console.log("[DEBUG] [RemoveLastEntry()] DONE!!!");
  }


  if (isEntryEmpty){
    if (debug){
      console.log("[DEBUG] [RemoveLastEntry()] {Empty Ledger}! NO Action!");
    }
    return;
  }

  EntryTableArray.pop();
  if (EntryTableArray.length > 0){
    var table = document.getElementById('TableEntryTable');
    table.removeChild(table.children[table.children.length - 1]);

    LocalStorageEntriesSave();
    if (debug){
      console.log("[DEBUG] [RemoveLastEntry()] Removed entry & saved entries!");
    }
  
  } else {
    if (debug){
      console.log("[DEBUG] [RemoveLastEntry()] Running ClearEntry()!");
    }
    ClearEntry();
  }
}
//////////////////////////////////////

//////////////////////////////////////
// V. Import/Export

//1. Prep EntryIDTargets as JSON String
//=========================
function TargetArrayStringifyAsJSON(){
  return JSON.stringify(EntryIDTargets);
}

//2. Prep Entries as JSON String
//=========================
function EntriesStringifyAsJSON(){
  return JSON.stringify(EntryTableArray);
}

//3. Export - EntryIDTargets (JSON)
//=========================
function ExportTargetArrayToJson() {
  var text = TargetArrayStringifyAsJSON();
  var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "GSL_EntryIDTargets.json");
}

//4. Export - Entries (JSON)
//=========================
function ExportEntryToJson() {
  var text = EntriesStringifyAsJSON();
  var blob = new Blob([text], {type: "text/plain;charset=utf-8"});

  var date = new Date();
  var textIso = date.toISOString();  
  console.log("[DEBUG] [ExportEntryToJson()] date str:<" + textIso+">");

  saveAs(blob, "GSL_Entry_"+textIso+".json");
}
/////////////////////////////////

function LoadArrayIntoEntry(PassedArray){ //Passed JSON Parsed from String
  EntryTableArray = [];
  for (var i = 0; i < PassedArray.length; i++) {
    EntryTableArray.push(PassedArray[i]);
  }
}

function LoadEntryArrayIntoTable(debug=false){  // \" class=\"table table-striped\"><tbody id=\"TableEntryBody
  if (debug){
    console.log("[DEBUG] [LoadEntryArrayIntoTable()] Started");
    console.log("[DEBUG] [LoadEntryArrayIntoTable()]     EntryTableArray.length: " + EntryTableArray.length);
  }
  document.getElementById("EntriesContainer").innerHTML = "<br><br><table id=\"TableEntryTable\" class=\"table table-striped\"><tbody id=\"TableEntryBody\"></tbody></table>";

  for (var j = 0; j < EntryTableArray.length; j++) {
    var row = document.createElement("tr");
    var cell = document.createElement("td");

    // cell.innerHTML = EntryTableArray[j];
    safeCurrentStr = EntryTableArray[j].replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safeCurrentStr = safeCurrentStr.replace(/\n/g, "<br>"); //<Graph> - {Node} uses '\n'

    cell.innerHTML = safeCurrentStr;
    row.appendChild(cell);

    document.getElementById("TableEntryTable").appendChild(row);
       
    if (debug){
      console.log("[DEBUG] [LoadEntryArrayIntoTable()]     Loaded Entry: '"+EntryTableArray[j]+"'");
    }
  }

  if (debug){
    console.log("[DEBUG] [LoadEntryArrayIntoTable()] DONE!!!");
  }

}

function LoadArrayIntoEntryIDTargets(PassedArray, debug=false){ //Passed JSON Parsed from String
  EntryIDTargets = [];
  for (var i = 0; i < PassedArray.length; i++) {
    EntryIDTargets.push(PassedArray[i]);
    if(debug){
      console.log("[DEBUG] [LoadArrayIntoEntryIDTargets()] Loaded Target: '"+EntryIDTargets[i][0]+"'");
    }
  }

}

function LoadAllEntryIDTargetsAsOptions(debug=false){ //this vs. SetupEntryIDTargetsBasedOnB
  for (var j = 0; j < EntryIDTargets.length; j++) {
    var hasTwoEntryIDTargets = false;
    var currentTarget = EntryIDTargets[j][0];
    var secondaryTarget = "";

    var option = document.createElement("option");
    option.text = currentTarget;


    if (debug){
      console.log("[DEBUG] [LoadAllEntryIDTargetsAsOptions()] '"+EntryIDTargets[j][0]+"'");
    }

    document.getElementById("OptionAttributeEntryIDList").appendChild(option);
  } 
}


//////////////////////////////////////

//5. Import - Entries (JSON)
//=======================
function ImportJsonToEntry(){
  //(a) Take provided file (and ONLY one file, if multiple files passed), (b) load content into EntryTableArray[] array, (c) load into <table>, (d) then check if valid.
  var file_to_read = document.getElementById("fileInputEntry").files[0];
  var fileread = new FileReader();

  fileread.onload = function(e) {
    var content = e.target.result;
    var parsedEntry = JSON.parse(content);

    //(b) - Load content into EntryTableArray[]
    LoadArrayIntoEntry(parsedEntry);

    //(c) - load EntryTableArray[] entries into <table>
    LoadEntryArrayIntoTable();

    //(d) - Check if load was valid/successful
    if (EntryTableArray.length > 0) {
      isEntryEmpty = false;
      alert("Successfully loaded '"+ EntryTableArray.length +"' Entries!");

      LocalStorageEntriesSave();

    } else {
      isEntryEmpty = true;      
      alert("[Warning] No Entries imported, please check source file!");
    }

  };

  //(a) 
  fileread.readAsText(file_to_read);
}


//6. Import - EntryIDTargets (JSON)
//=========================
function ImportJsonToEntryIDTargets(){
  var file_to_read = document.getElementById("fileInputEntryIDTargets").files[0];
  var fileread = new FileReader();

  fileread.onload = function(e) {
    var content = e.target.result;
    var parsedTarget = JSON.parse(content);

    LoadArrayIntoEntryIDTargets(parsedTarget);

    LoadAllEntryIDTargetsAsOptions(); //(true)
    alert("Successfully loaded (" + EntryIDTargets.length + ") EntryIDTargets!");
  
  };

  fileread.readAsText(file_to_read);
}

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

function LocalStorageClearEntriesOnly(debug=false){
  localStorage.removeItem('Builder-TableEntries');
  if (debug){
    console.log("[DEBUG][LocalStorageClear] Cleared all user/page created keys - for Entries!");
  }
}

function LocalStorageClearEntryIDTargetsOnly(debug=false){
  localStorage.removeItem('Builder-EntryIDTargets');
  if (debug){
    console.log("[DEBUG][LocalStorageClear] Cleared all user/page created keys - for EntryIDTargets!");
  }
}

//9. localstorage - Get Total Keys
//=======================
function LocalStorageLoadMainKeys(debug=false){
  var totalKeys=0;

  var loadedEntries = false;

  for(var key in window.localStorage){
    if(window.localStorage.hasOwnProperty(key)){ //aka: NOT inherited; otherwise ALL defaults counted (e.g., length, clear, get, remove, set, etc.)
      totalKeys++;
      if (debug){
        console.log("[DEBUG][LocalStorageLoadMainKeys()] Found key: '" + key + "'");
        console.log("[DEBUG][LocalStorageLoadMainKeys()]     " + key + " = " + ((window.localStorage[key].length * 16)/(8 * 1024)).toFixed(2) + ' KB' );
      }

      if (key === "Builder-TableEntries"){
        if (debug){
          console.log("[DEBUG][LocalStorageLoadMainKeys()] Loading Entries saved in 'Builder-TableEntries'!");
        }
        
        var storedEntries = localStorage.getItem('Builder-TableEntries');
        var parsedEntry = JSON.parse(storedEntries);
        LoadArrayIntoEntry(parsedEntry);

        if (debug){
          // console.log("[DEBUG][LocalStorageLoadMainKeys()] Loaded string <" + storedEntries + ">");
          console.log("[DEBUG][LocalStorageLoadMainKeys()] Parsed string <" + parsedEntry + ">");
          console.log("[DEBUG][LocalStorageLoadMainKeys()] Loaded '" + EntryTableArray.length + "' Entries");
        }

        LoadEntryArrayIntoTable();

        loadedEntries = true;
        isEntryEmpty = false;

      } else if (key === "Builder-EntryIDTargets"){
        if (debug){
          console.log("[DEBUG][LocalStorageLoadMainKeys()] Loading EntryIDTargets saved in 'Builder-EntryIDTargets'!");
        }

        var loadedStorage = localStorage.getItem('Builder-EntryIDTargets');
        var parsedTarget = JSON.parse(loadedStorage);
        LoadArrayIntoEntryIDTargets(parsedTarget, true);
        LoadAllEntryIDTargetsAsOptions(); //(true)

        SetupAllEntryIDTargets();

      } else if (key === "Builder-SettingsDarkMode"){
        var loadedDarkMode = localStorage.getItem('Builder-SettingsDarkMode');

        if (debug){
          console.log("[DEBUG][LocalStorageLoadMainKeys()] Loading DarkMode saved in 'Builder-SettingsDarkMode'!");        
          console.log("[DEBUG][LocalStorageLoadMainKeys()]     Loaded '" + loadedDarkMode + "'");
        }

        if (loadedDarkMode === "true"){ //first load is a string vs. bool...
          document.getElementById("toggleSettingDarkMode").checked = true;
          ToggleDarkMode(loadedDarkMode);
        }

      }
    }
  }

  if (!loadedEntries){
    if (debug){
      console.log("[DEBUG][LocalStorageLoadMainKeys()] NO entries -- showing empty table!");
    }

    document.getElementById("EntriesContainer").innerHTML = "<br><br><div id=\"EntriesStatus\" style=\"background-color:rgba(178, 178, 188, 0.571);\"><h2><i>{Entries are empty}</i></h2></div>";
  }

  return totalKeys;
}

//10. localstorage - Save Entries
//=======================
function LocalStorageEntriesSave(debug=false){
  var newEntriesStr = EntriesStringifyAsJSON();

  if (debug){
    console.log("[DEBUG][LocalStorageEntriesSave] Saving Entries to localstorage...");    
    console.log("[DEBUG][LocalStorageEntriesSave] NewString: " + newEntriesStr);
  }

  localStorage.setItem('Builder-TableEntries', newEntriesStr);
}

function LocalStorageSettingsSaveDarkMode(passedMode, debug=false){
  localStorage.setItem('Builder-SettingsDarkMode', passedMode);
}

//10. localstorage - Save EntryIDTargets
//=======================
function LocalStorageEntryIDTargetsSave(debug=false){
  var newEntryIDTargetstr = TargetArrayStringifyAsJSON();

  if (debug){
    console.log("[DEBUG][LocalStorageEntryIDTargetsSave] Saving EntryIDTargets to localstorage...");    
    console.log("[DEBUG][LocalStorageEntryIDTargetsSave] NewString: " + newEntryIDTargetstr);
  }

  localStorage.setItem('Builder-EntryIDTargets', newEntryIDTargetstr);

}

//////////////////////////////////////








