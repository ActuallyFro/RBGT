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
// LocalStorage Plan:
// ------------------
// 0. Add in hooks to check for existing content, and load as appropriate... {#0} |< DONE >|
//   a. load Entries <import like Entry file import/load> {#a}
//   b. load targets <import like TARGET file import/load> {#b}
// 1. objects -- N/A, since these are static/look-ups
// 2. targets -- yes (curretly are exported too)  {#2}
//   a. Needs a reset option {#a}
//   b. LocalStorage then needs to be added {#b} <WHEN a NEW target is added -- export list>
// (REMOVED) 3. ledger -- no (these are dynamically built, treated as draft, when an entry is considered valid -- it moves to a Entry)
// 4. Entries -- yes (curretly are exported too) {#1}
//   a. LocalStorage needs to be added to reset {#a}  <WHEN a NEW Entry is added -- export list>
//
// Other LocalStorage issues
// -------------------------
// i. Showing total storage percent in navigation menu
//
//////////////////////////////////////

//////////////////////////////////////
// I. Vars and Lookups

// var isEntryEmpty = true;
var isEntryEmpty = true;
var oldEntry = [];
var Entry = [];

var objects = [
  ["", "", "", ""],
  ["", "=== Graph objects ===", "GUI - Selection Title", "Disabled"],
  ["Node", "Graph", "GraphObjects", ""],
  ["Edge", "Graph", "GraphObjects", ""]
];

var targets = [];

// var Lastobjectsize = 0;
//////////////////////////////////////

//////////////////////////////////////
// II. OnPageLoad/Init

//1. Page setup:
//============== 
window.onload = function() {
  //BAD: LocalStorageClear(true);

  //1. Determine if LocalStorage's Entry[] is empty: (a) if not -- load, else -- print empty:
  var totalLSKeys = LocalStorageLoadMainKeys(); //LocalStorageLoadMainKeys(true)

  //2. Setup Page Elements
  SetupBracketDropDown();

  // 3. Add shortcut buttons to Shortcut Divs
  //----------------------------
  // SetupInnerobjectshortcutsDice();
  // SetupInnerobjectshortcutsActionActivities();
  // SetupInnerobjectshortcutsNandPCs();

  //4. Setup Event Listeners/Watchers
  SetupWatcherUserPicksBracketDropDown();
  // SetupWatcherUserTogglesAutoBracket();
  // SetupWatcherUserTogglesInnerBracket(); 
  SetupWatcherUserTogglesSettingDarkMode(); 

}

function SetupWatcherUserPicksBracketDropDown(debug=false){
  document.getElementById("BracketDropDown").addEventListener("change", function() {
    var selectedBracketTag = document.getElementById("BracketDropDown").value;
    if (debug){
      console.log("[DEBUG] User selected dropdown:" + selectedBracketTag);  
    }

    SetupTargetsBasedOnBracketPick(selectedBracketTag);
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

function ToggleDarkMode(isDarkMode){
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

//2. All Targets setup:
//===================== 
function SetupAllTargets() {
  //TO DO -- determine localstorage load, then run this.
  SetupTargetsBasedOnBracketPick("");
}

//3. Speciifc Class of Targets setup:
//===================================
function SetupTargetsBasedOnBracketPick(SelectedBracket, debug=false){
  // console.log("Selected Bracket: '" + SelectedBracket + "'");
  document.getElementById("OptionAttributeEntryIDList").innerHTML = null; //reset targets
  // document.getElementById("TargetButtons").innerHTML = null; //reset buttons

  if (debug){
    console.log("[DEBUG] Selected Bracket: '" + SelectedBracket + "'");
  }

  if (SelectedBracket == "") {
    LoadAllTargetsAsOptions(); //(true) //TODO: figure out what this does...
    // console.log("[WARNING] No type selected!");
    document.getElementById("SelectionMenuOption").innerHTML = "<i>{Select above}</i>";

  } else {

    //QUESTION: Render 'menus' based on selection...
    
    if (SelectedBracket == "Node") {
      document.getElementById("SelectionMenuOption").innerHTML = "<u><b>Graph - Node Options:</b></u>";

      document.getElementById("SelectionMenuOption").innerHTML += "<div class=\"form-group\" id=\"OptionAttributeEntryGraphNodeDivGroup\">";

      //TOOLTIP:
      // document.getElementById("SelectionMenuOption").innerHTML += "<div class=\"tooltip\"><h3><label for=\"dynamicNodeDataFields\">Data Tag(s):</label></h3>";
      // document.getElementById("SelectionMenuOption").innerHTML += "  <span class=\"tooltiptext\"><u>The .gxl file has 3 main node items: </u>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    1) Element Name (id)- the reference for edges";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    2) Name Key - (nameNode) - human readable name";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    3) Description Key (descriptionNode)- HTML Optional, details about the node";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <b>Example:</b>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <b>1) id: boss_01_Andariel </b>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <b>2) key \"nameNode\": Andariel </b>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <b>3) key \"descriptionNode\": &lt;![CDATA[ <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "      &lt;ul style=\"list-style-type:disc\"&gt; <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "      &lt;li&gt;Lessor Evil: Maiden of Anguish&lt;/li&gt; <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "      &lt;li&gt;Once overthrew the three Prime Evils&lt;/li&gt; <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "      &lt;/ul&gt; <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "      <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "      &lt;p&gt;Source: http://classic.battle.net/diablo2exp/monsters/act1-andariel.shtml&lt;/p&gt;<br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "        ]]&gt;";

      // document.getElementById("SelectionMenuOption").innerHTML += "    </b>";
      // document.getElementById("SelectionMenuOption").innerHTML += "    <br>";
      // document.getElementById("SelectionMenuOption").innerHTML += "  </span>";
      // document.getElementById("SelectionMenuOption").innerHTML += "</div>";

      document.getElementById("SelectionMenuOption").innerHTML += "<div class=\"OptionAttributeEntryGraphNodeFieldsDynamic\">";
      document.getElementById("SelectionMenuOption").innerHTML += "  <!-- Source: https://www.codexworld.com/add-remove-input-fields-dynamically-using-jquery/ -->";
      document.getElementById("SelectionMenuOption").innerHTML += "  <div>";
      document.getElementById("SelectionMenuOption").innerHTML += "    <label for=\"OptionAttributeEntryGraphNodeFieldKeyVal\">Key</label>";
      document.getElementById("SelectionMenuOption").innerHTML += "    <input type=\"text\" name=\"OptionAttributeEntryGraphNodeFieldKeyVal\" value=\"\"/>";
      document.getElementById("SelectionMenuOption").innerHTML += "    <label for=\"OptionAttributeEntryGraphNodeFieldDataVal\">Value</label>";
      document.getElementById("SelectionMenuOption").innerHTML += "    <textarea name=\"OptionAttributeEntryGraphNodeFieldDataVal\" placeholder=\"\"></textarea>";
      document.getElementById("SelectionMenuOption").innerHTML += "      <a href=\"javascript:void(0);\" class=\"add_button\" title=\"Add field\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-file-plus\" viewBox=\"0 0 16 16\">";
      document.getElementById("SelectionMenuOption").innerHTML += "        <path d=\"M8.5 6a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5V10a.5.5 0 0 0 1 0V8.5H10a.5.5 0 0 0 0-1H8.5V6z\"/>";
      document.getElementById("SelectionMenuOption").innerHTML += "        <path d=\"M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z\"/>";
      document.getElementById("SelectionMenuOption").innerHTML += "      </svg></a>";
      document.getElementById("SelectionMenuOption").innerHTML += "  </div>";
      document.getElementById("SelectionMenuOption").innerHTML += "</div>";
      document.getElementById("SelectionMenuOption").innerHTML += "</div>  ";


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

//N1. Clear - Entry 
//=============
function ClearEntry() {
  if (isEntryEmpty){
    return;
  }

  isEntryEmpty = true;

  debug = true; //BAD -- REMOVE!
  if (debug){
    console.log("[DEBUG][ClearEntry] NO entries -- showing empty table!");
  }
  document.getElementById("EntriesContainer").innerHTML = "<div id=\"EntryTableDiv\" style=\"background-color:rgba(178, 178, 188, 0.571);\"><h2><i>{Entries are empty}</i></h2></div>";

  Entry = [];
  LocalStorageClearEntriesOnly();
}

function ClearGraphEntryEdge(debug=false){
  if(debug){
    console.log("[DEBUG] [ClearGraphEntryEdge()] Clearing Edge Entry");
  }

  ClearObjectsEntry();

  document.getElementById("OptionAttributeEntryGraphEdgeFieldSource").value = "";
  document.getElementById("OptionAttributeEntryGraphEdgeFieldTarget").value = "";
}


//5. Clear - Tag
//=============
function ClearTag() {
  document.getElementById("BracketDropDown").value = "";
}

//6. Clear - Target
//================
function ClearObjectsEntry() {
  document.getElementById("OptionAttributeEntryID").value = "";
}

function ClearTargetArray() {
  if (targets.length === 0) {
    return;
  }

  targets = [];
  LocalStorageClearTargetsOnly();
}

//////////////////////////////////////

//////////////////////////////////////
// IV. Usage/Async I/O Functions

//1. Target - Check if Exists, Add if not
//=======================================
function CheckAndAddTarget(){

  //Likely: OptionAttributeEntryID
  var targetToCheck = document.getElementById("target").value;

  if (targetToCheck == ""){
    return;
  }

  var newTarget = true;
  for (var i = 0; i < targets.length; i++) {
    if (targets[i][0] == targetToCheck) {
      newTarget = false; //target exists
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
  for (var k = 0; k < targets.length; k++) {
    // console.log("[DEBUG] [CheckAndAddTarget()] Comparing " + targetToCheck + " to " + targets[k][0]);
    if (targets[k][0] == targetToCheck) {
      Repeat = true; //target exists
      // console.log("[DEBUG] [CheckAndAddTarget()] Repeating Target... skipping!");
    }
  }

  if (newTarget && !BannedOption && !Repeat) {
    // var option = document.createElement("option");
    // option.text = targetToCheck;
    // document.getElementById("targets").appendChild(option);
    
    console.log("[DEBUG] [CheckAndAddTarget()] Adding Target: " + targetToCheck + " with category: " + objects[objectselectedOption][2]);
    // var newTarget = [targetToCheck, objects[adjustedBracketNumber][2] , ""];
    var newTarget = [targetToCheck, objects[objectselectedOption][2] , ""];
    targets.push(newTarget);

    LocalStorageTargetsSave(); //(true)
  }

}

//2. AddObject 
//===========
function AddObject(debug=true) {
  if (debug){
    console.log("[DEBUG] [AddObject()] Setting hasBracketBeenPlaced is: " + hasBracketBeenPlaced);
  }

  //TODO: Remove oldEntry IF it's just used for ledger... :
  // oldEntry.push(document.getElementById("ledger").value); //This is used for "Undo" Ledger Entry

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

//3. EntryIt 
//===========
function EntryIt(debug=true) {
  type = document.getElementById("hiddenGlobalObjectType").value;
  if (debug){
    console.log("[DEBUG] [EntryIt()] Started");
    console.log("[DEBUG] [EntryIt()] Type: " + type);
  }

  //Used in the ledger system...
  // if (isEntryEmpty){
  //   AddObject(); //Auto-ledger then Entry it
  // }

  if (isEntryEmpty){
    isEntryEmpty = false;
    document.getElementById("EntriesContainer").innerHTML = "<table id=\"TableEntryTable\" class=\"table table-striped\"><tbody id=\"TableEntryBody\"></tbody></table>";
    //console.log("[DEBUG] [EntryIt()] Entries table created");
  } 

  var obj = document.getElementById("ledger");
  var currentLedger = document.getElementById("ledger").value;
  //MASSIVE array,  depending on type, and details of entries...
  Entry.push(currentLedger);

  var row = document.createElement("tr");

  var cell = document.createElement("td");
  safeCurrentStr = currentLedger.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  cell.innerHTML = safeCurrentStr;
  row.appendChild(cell);
  document.getElementById("TableEntryTable").appendChild(row);

  CheckAndAddTarget();
  ClearTag();
  ClearTarget();

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

  Entry.pop();
  if (Entry.length > 0){
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

//Auto-deterines last bracket, and it's terminating bracket; then 'inserts' past string between the string-thru-terminating-bracket and the terminal-bracket
// In short: DEALS with "insert into the last-placed-bracket" 
function addLedgerStringInnerBracket(PassedString){
  var obj = document.getElementById("ledger");

  var tempLedger = obj.value.slice(0,obj.value.length-LastBracketWidth);
  var tempLedgerLastChar = obj.value.slice(-LastBracketWidth,obj.value.length);
  obj.value = tempLedger + PassedString + tempLedgerLastChar;

  console.log("[DEBUG] [addLedgerStringInnerBracket()] Ledger: '" + obj.value + "'");

  //Any impacts of "isInnerBracketToggled" == true ? <-- NO

  // //Modify Activites are ALWAYS inner-bracket item; to save user click(s) this check will auto-toggle the next entry to be an innerbracket action
  // if (PassedString == ";;"){
  //   ToggleEnableInnerbracket();
  // }

}

function addLedgerStringAtEnd(PassedString){
  var obj = document.getElementById("ledger");
  obj.value += PassedString;

  console.log("[DEBUG] [addLedgerStringAtEnd()] Ledger: '" + obj.value + "'");
}

// function addLedgerStringAtEndBracket(PassedString){
//   var obj = document.getElementById("ledger");
//   obj.value += PassedString;

//TODO: bracket Left/Right side determination to then have: Left + Passed + Right....

//   console.log("[DEBUG] [addLedgerStringAtEndBracket()] Ledger: '" + obj.value + "'");
// }

// function ToggleDisableAutobracket(){
//   //console.log("[DEBUG] [ToggleDisableAutobracket()]");
//   document.getElementById("toggleAutobracket").checked = false;
//   isAutoBracketToggled = false;
// }

// function ToggleEnableAutobracket(){
//   //console.log("[DEBUG] [ToggleEnableAutobracket()]");
//   document.getElementById("toggleAutobracket").checked = true;
//   isAutoBracketToggled = true;
// }

// function ToggleDisableInnerbracket(){
//   //console.log("[DEBUG] [ToggleDisableInnerbracket()]");
//   document.getElementById("toggleInnerbracket").checked = false;
//   isInnerBracketToggled = false;
  
// }

// function ToggleEnableInnerbracket(){
//   //console.log("[DEBUG] [ToggleEnableInnerbracket()]");
//   document.getElementById("toggleInnerbracket").checked = true;
//   isInnerBracketToggled = true;
// }




//////////////////////////////////////

//////////////////////////////////////
// V. Import/Export

//1. Prep Targets as JSON String
//=========================
function TargetArrayStringifyAsJSON(){
  return JSON.stringify(targets);
}

//2. Prep Entries as JSON String
//=========================
function EntriesStringifyAsJSON(){
  return JSON.stringify(Entry);
}


//3. Export - Targets (JSON)
//=========================
function ExportTargetArrayToJson() {
  var text = TargetArrayStringifyAsJSON();
  var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "GSL_Targets.json");
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
  Entry = [];
  for (var i = 0; i < PassedArray.length; i++) {
    Entry.push(PassedArray[i]);
  }
}

function LoadEntryArrayIntoTable(){  // \" class=\"table table-striped\"><tbody id=\"TableEntryBody
  document.getElementById("EntriesContainer").innerHTML = "<table id=\"TableEntryTable\" class=\"table table-striped\"><tbody id=\"TableEntryBody\"></tbody></table>";
  for (var j = 0; j < Entry.length; j++) {
    var row = document.createElement("tr");
    var cell = document.createElement("td");

    cell.innerHTML = Entry[j];
    row.appendChild(cell);

    document.getElementById("TableEntryTable").appendChild(row);      
  }
}

function LoadArrayIntoTargets(PassedArray, debug=false){ //Passed JSON Parsed from String
  targets = [];
  for (var i = 0; i < PassedArray.length; i++) {
    targets.push(PassedArray[i]);
    if(debug){
      console.log("[DEBUG] [LoadArrayIntoTargets()] Loaded Target: '"+targets[i][0]+"'");
    }
  }

}

function LoadAllTargetsAsOptions(debug=false){ //this vs. SetupTargetsBasedOnB
  for (var j = 0; j < targets.length; j++) {
    var hasTwoTargets = false;
    var currentTarget = targets[j][0];
    var secondaryTarget = "";
    // /////////////
    // //TODON'T:
    // if (currentTarget.includes(";;")) {
    //   if (debug) {
    //     console.log("[DEBUG] [LoadAllTargetsAsOptions()] Target '"+targets[j][0]+"' includes ';;' !");
    //   }

    //   currentTarget = currentTarget.split(";;")[0];
    //   secondaryTarget = targets[j][0].split(";;")[1];
    //   hasTwoTargets = true;
    // }
    // /////////////
    // var isDone = true;
    // do {
      var option = document.createElement("option");
      option.text = currentTarget;
  
      // var safeStr = targets[j][0].replace(/'/g, "\\'");
  
      if (debug){
        console.log("[DEBUG] [LoadAllTargetsAsOptions()] '"+targets[j][0]+"'");
        // console.log("safeStr: '" + safeStr + "'");
      }
  
      document.getElementById("OptionAttributeEntryIDList").appendChild(option);
      // document.getElementById("TargetButtons").innerHTML += "<button type=\"button\" class=\"btn btn-secondary\" onclick=\"addLedgerStringInnerBracket('"+safeStr+ "')\">" + targets[j][0] + "</button>";

    //   if (hasTwoTargets){
    //     currentTarget = secondaryTarget;
    //     hasTwoTargets = false;
    //   } else {
    //     isDone = false;
    //   }

    // } while (isDone);

    /////////////
  } 
}


//////////////////////////////////////

//5. Import - Entries (JSON)
//=======================
function ImportJsonToEntry(){
  //(a) Take provided file (and ONLY one file, if multiple files passed), (b) load content into Entry[] array, (c) load into <table>, (d) then check if valid.
  var file_to_read = document.getElementById("fileInputEntry").files[0];
  var fileread = new FileReader();

  fileread.onload = function(e) {
    var content = e.target.result;
    var parsedEntry = JSON.parse(content);

    //(b) - Load content into Entry[]
    LoadArrayIntoEntry(parsedEntry);

    //(c) - load Entry[] entries into <table>
    LoadEntryArrayIntoTable();

    //(d) - Check if load was valid/successful
    if (Entry.length > 0) {
      isEntryEmpty = false;
      alert("Successfully loaded '"+ Entry.length +"' Entries!");

      LocalStorageEntriesSave();

    } else {
      isEntryEmpty = true;      
      alert("[Warning] No Entries imported, please check source file!");
    }

  };

  //(a) 
  fileread.readAsText(file_to_read);
}


//6. Import - Targets (JSON)
//=========================
function ImportJsonToTargets(){
  var file_to_read = document.getElementById("fileInputTargets").files[0];
  var fileread = new FileReader();

  fileread.onload = function(e) {
    var content = e.target.result;
    var parsedTarget = JSON.parse(content);

    LoadArrayIntoTargets(parsedTarget);

    LoadAllTargetsAsOptions(); //(true)
    alert("Successfully loaded (" + targets.length + ") targets!");
  
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
  localStorage.removeItem('Builder-Entries');
  if (debug){
    console.log("[DEBUG][LocalStorageClear] Cleared all user/page created keys - for Entries!");
  }
}

function LocalStorageClearTargetsOnly(debug=false){
  localStorage.removeItem('Builder-Targets');
  if (debug){
    console.log("[DEBUG][LocalStorageClear] Cleared all user/page created keys - for Targets!");
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
        console.log("[DEBUG][LocalStorageLoadMainKeys] Found key: '" + key + "'");
        console.log( key + " = " + ((window.localStorage[key].length * 16)/(8 * 1024)).toFixed(2) + ' KB' );
      }  
      if (key === "Builder-Entries"){
        if (debug){
          console.log("[DEBUG][LocalStorageLoadMainKeys] Loading Entries saved in 'Builder-Entries'!");
        }
        
        //Load content into Entry[]
        var storedEntries = localStorage.getItem('Builder-Entries');
        var parsedEntry = JSON.parse(storedEntries);
        LoadArrayIntoEntry(parsedEntry);
        if (debug){
          console.log("[DEBUG][LocalStorageLoadMainKeys] Loaded string <" + storedEntries + ">");
          console.log("[DEBUG][LocalStorageLoadMainKeys] Parsed string <" + parsedEntry + ">");
          console.log("[DEBUG][LocalStorageLoadMainKeys] Loaded '" + Entry.length + "' Entries");
        }

        //(c) - load Entry[] entries into <table>
        LoadEntryArrayIntoTable();

        loadedEntries = true;
        isEntryEmpty = false;

      } else if (key === "Builder-Targets"){
        debug = true; //BAD -- REMOVE!
        if (debug){
          console.log("[DEBUG][LocalStorageLoadMainKeys] Loading Targets saved in 'Builder-Targets'!");
        }

        var loadedStorage = localStorage.getItem('Builder-Targets');
        var parsedTarget = JSON.parse(loadedStorage);
        LoadArrayIntoTargets(parsedTarget, true);
        LoadAllTargetsAsOptions(); //(true)

        SetupAllTargets();
      }
    }
  }

  if (!loadedEntries){
    debug = true; //BAD -- REMOVE!
    if (debug){
      console.log("[DEBUG][LocalStorageLoadMainKeys] NO entries -- showing empty table!");
    }

    document.getElementById("EntriesContainer").innerHTML = "<div id=\"EntriesStatus\" style=\"background-color:rgba(178, 178, 188, 0.571);\"><h2><i>{Entries are empty}</i></h2></div>";
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

  localStorage.setItem('Builder-Entries', newEntriesStr);

}

//10. localstorage - Save Targets
//=======================
function LocalStorageTargetsSave(debug=false){
  var newTargetStr = TargetArrayStringifyAsJSON();

  if (debug){
    console.log("[DEBUG][LocalStorageTargetsSave] Saving Targets to localstorage...");    
    console.log("[DEBUG][LocalStorageTargetsSave] NewString: " + newTargetStr);
  }

  localStorage.setItem('Builder-Targets', newTargetStr);

}

//////////////////////////////////////








