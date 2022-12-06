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
// 1. brackets -- N/A, since these are static/look-ups
// 2. targets -- yes (curretly are exported too)  {#2}
//   a. Needs a reset option {#a}
//   b. LocalStorage then needs to be added {#b} <WHEN a NEW target is added -- export list>
// 3. ledger -- no (these are dynamically built, treated as draft, when an entry is considered valid -- it moves to a Entry)
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

// Global var to store the propsed ledger entry, as array of strings
var isLedgerEmpty = true;
var isEntryEmpty = true;
var oldLedger = [];
var Entry = [];

var brackets = [
["", "", "", ""],
["", "=== Location Brackets ===", "GUI - Selection Title", "Disabled"],
["༺ ༻", "Realm", "Locations", ""],
["〖 〗", "City", "Locations", ""],
["《 》", "District", "Locations", ""],
["〈 〉", "Place/Building", "Locations", ""],
["⦓ ⦔", "Inner Place/Building (e.g., Room)", "Locations", ""],

["", "=== Timing Brackets ===", "GUI - Selection Title", "Disabled"],
["⟅ ⟆", "Round", "Timing", "Numbers"],
["⧼ ⧽", "Time/Duration", "Timing", "Ignore"],

["", "=== N/PC Brackets ===", "GUI - Selection Title", "Disabled"],
["[ ]", "PC or NPC", "PC or NPC Level Actions", ""],
["] [", "Hostile NPC/encounter (Single)", "PC or NPC Level Actions", ""],
["⟦ ⟧", "Grouping of PCs/NPC", "PC or NPC Level Actions", ""],
["⟧ ⟦", "Grouping of Hostile NPCs/encounter", "PC or NPC Level Actions", ""],

["", "=== Event/Action Brackets ===", "GUI - Selection Title", "Disabled"],
["⌊   ⌋", "Event/Encounter - Floor", "Event or Encounter", "Ignore"],
["⌈   ⌉", "Event/Encounter - Ceiling", "Event or Encounter", "Ignore"],
["( )", "Action", "Event or Encounter", "FilterAction"],
["< >", "Movement", "Event or Encounter", "Ignore"],
["(( ))", "Comment", "General Comment", ""],

["", "=== Object Brackets ===", "GUI - Selection Title", "Disabled"],
["{ }", "Item", "Object", "Ignore"],
["⸢   ⸣", "Right hand", "Object", "Ignore"],
["⸤   ⸥", "Left hand", "Object", "Ignore"],
["⸢   ⸥", "Both hands/two handed", "Object", "Ignore"],
["⦇ ⦈", "Armor class", "Object", "Numbers"],
["⦉ ⦊", "HP Amount", "Object", "Numbers"],

["", "=== Result Brackets ===", "GUI - Selection Title", "Disabled"],
["⟮ ⟯", "Dice Roll Success (check)", "Results", "Dice"],
["⟯ ⟮", "Dice Roll Failure (check)", "Results", "Dice"],
["⧘ ⧙", "Damage Amount", "Results", "Numbers"],
["〘 〙", "Dice Roll Initiative", "Results", "Dice"]
];

var targets = [
["Grevnyrch", "Locations", "G"],
["Kla'Bbbert", "Locations", "KB"]
];

var hasBracketBuildingStarted = false;

var isShowingNumbers = false;
var isInnerBracketToggled = false;
var isAutoBracketToggled = true;
var hasBracketBeenPlaced = false;

var LastBracketSize = 0;
var LastBracketWidth = 0; //SHOULD be (Size-1)/2 -- but I cannot say 100% ALWAYS will be...
var LastBracket ="";
var isInnerBracket = false;
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
  SetupBracketButtons();
  SetupBracketDropDown();
  SetupBracketButtonClear();

  // 3. Add shortcut buttons to Shortcut Divs
  //----------------------------
  SetupInnerBracketShortcutsDice();
  SetupInnerBracketShortcutsActionActivities();
  SetupInnerBracketShortcutsNandPCs();

  //4. Setup Event Listeners/Watchers
  SetupWatcherUserPicksBracketDropDown();
  SetupWatcherUserTogglesAutoBracket();
  SetupWatcherUserTogglesInnerBracket(); 
  SetupWatcherUserTogglesSettingDarkMode(); 

  //5. Setup default states
  ToggleDisableInnerbracket();
  ToggleEnableAutobracket();
  hideShowDice(false);
  hasBracketBuildingStarted = false;
}

function SetupInnerBracketShortcutsDice(){
  for (var k = 0; k <= 9; k++) {
    document.getElementById("Dice").innerHTML += "<button type=\"button\" id=\"BtnDiceDark\" class=\"btn btn-dark\" onclick=\"addLedgerStringInnerBracket(" + k + ")\">" + k + "</button>";
  }

  document.getElementById("Dice").innerHTML += "<button type=\"button\"  class=\"btn btn-secondary\" onclick=\"addLedgerStringInnerBracket('+')\"> + </button>";
  document.getElementById("Dice").innerHTML += "<button type=\"button\" class=\"btn btn-danger\" onclick=\"addLedgerStringInnerBracket('-')\"> - </button>";
  document.getElementById("Dice").innerHTML += "<button type=\"button\" class=\"btn btn-secondary\" onclick=\"addLedgerStringInnerBracket('=')\"> = </button>";
 
}

function SetupInnerBracketShortcutsActionActivities (){
  document.getElementById("ActivityButtons").innerHTML += "<button type=\"button\"  class=\"btn btn-success\" onclick=\"addLedgerStringInnerBracket('→')\"> → </button>";
}

function SetupInnerBracketShortcutsNandPCs (){
  document.getElementById("NandPCButtons").innerHTML += "<button type=\"button\"  class=\"btn btn-primary\" onclick=\"addLedgerStringInnerBracket(';;')\"> ;; </button>";
}

//BUG: target as the selction goes to an index of "n-1"; so if item #4 is selected, it will be 3...
function SetupWatcherUserPicksBracketDropDown(debug=false){
  document.getElementById("BracketDropDown").addEventListener("change", function() {
    var selectedBracketTag = document.getElementById("BracketDropDown").value;
    if (debug){
      console.Entry("[DEBUG] User selected dropdown:" + selectedBracketTag);  
    }

    SetupTargetsBasedOnBracketPick(selectedBracketTag);

    //Attempting to pass bracket number into UpdateTargetActivities()...
    var bracketNumber=0;
    for (var i = 0; i < brackets.length; i++) {
      var foundTargetBracket = brackets[i][0];
      if (brackets[i][0] == selectedBracketTag) {
        bracketNumber = i;
        if (debug){
          console.Entry("[DEBUG] Bracket Number: " + bracketNumber);
        }
        break;
      }
    }

    UpdateTargetActivities(bracketNumber);
      
    if(isAutoBracketToggled){
      LedgerIt();
      hasBracketBeenPlaced = true;
      // ToggleEnableInnerbracket(); //--more Entryic is needed for deconflicting target buttons...  
    }

  });
  
}

function SetupWatcherUserTogglesAutoBracket(debug=false){
  document.getElementById("toggleAutobracket").addEventListener("change", function() {
    var isAutoBracket = document.getElementById("toggleAutobracket").checked;
    isAutoBracketToggled = isAutoBracket;
    if (debug){
      console.Entry("[DEBUG] User toggled AutoBracket to: " + isAutoBracket);
    }
  });
}

function SetupWatcherUserTogglesInnerBracket(debug=false){
  document.getElementById("toggleInnerbracket").addEventListener("change", function() {
    var isInnerBracket = document.getElementById("toggleInnerbracket").checked;
    isInnerBracketToggled = isInnerBracket;
    if (debug){
      console.Entry("[DEBUG] User toggled InnerBracket to: " + isInnerBracket);
    }
  });
}

function SetupWatcherUserTogglesSettingDarkMode(debug=false){
  document.getElementById("toggleSettingDarkMode").addEventListener("change", function() {
    var isDarkMode = document.getElementById("toggleSettingDarkMode").checked;
    if (debug){
      console.Entry("[DEBUG] User toggled DarkMode to: " + isDarkMode);
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
    document.getElementById("TableEntryTable").className = "table table-striped table-dark table-bordered table-hover text-white";

  } else {
    document.getElementById("body").className = "bg-light text-dark";
    document.getElementById("Navigation").className = "navbar navbar-expand-lg navbar-light bg-light";

    var elms = document.querySelectorAll("#BtnDiceDark");
    for(var i = 0; i < elms.length; i++) {
      elms[i].className = "btn btn-dark";
    }

    document.getElementById("LabelEntryTable").style = "font-size: 40px; background-color: #F3F5F6; padding: 0px 5px;"
    document.getElementById("TableEntryTable").className = "table table-striped"

  }
}

// 1. Bracket Buttons setup:
//========================== 
function SetupBracketButtons(debug=false){
  for (var i = 0; i < brackets.length; i++) { //use btn-outline-* for more variants
    if (brackets[i][2] == "Locations"){
      document.getElementById("BracketButtons").innerHTML += "<button type=\"button\" class=\"btn btn-secondary\" onclick=\"addBracket(" + i + ")\">" + brackets[i][0] + "</button>";
    
    } else if (brackets[i][2] == "Timing"){
      document.getElementById("BracketButtons").innerHTML += "<button type=\"button\" class=\"btn btn-success\" onclick=\"addBracket(" + i + ")\">" + brackets[i][0] + "</button>";
    
    } else if (brackets[i][2] == "PC or NPC Level Actions"){
      document.getElementById("BracketButtons").innerHTML += "<button type=\"button\" class=\"btn btn-primary\" onclick=\"addBracket(" + i + ")\">" + brackets[i][0] + "</button>";

    } else if (brackets[i][2] == "Event or Encounter"){
      document.getElementById("BracketButtons").innerHTML += "<button type=\"button\" class=\"btn btn-success\" onclick=\"addBracket(" + i + ")\">" + brackets[i][0] + "</button>";
          
    } else if (brackets[i][2] == "Object"){
      document.getElementById("BracketButtons").innerHTML += "<button type=\"button\" class=\"btn btn-warning\" onclick=\"addBracket(" + i + ")\">" + brackets[i][0] + "</button>";

    } else if (brackets[i][2] == "Results"){
      document.getElementById("BracketButtons").innerHTML += "<button type=\"button\" id=\"BtnDiceDark\"class=\"btn btn-dark\" onclick=\"addBracket(" + i + ")\">" + brackets[i][0] + "</button>";

    } else if (brackets[i][2] != "GUI - Selection Title" && brackets[i][2] != ""){
      document.getElementById("BracketButtons").innerHTML += "<button type=\"button\" class=\"btn btn-info\" onclick=\"addBracket(" + i + ")\">" + brackets[i][0] + "</button>";
    }
  }

  if (debug){
    console.Entry("[DEBUG] Bracket Buttons Setup -- created " + brackets.length - 1 + " buttons");
  }
}


function SetupBracketButtonClear(){
  document.getElementById("BracketButtons").innerHTML += "<button type=\"button\" class=\"btn btn-danger\" onclick=\"addBracket(0)\"> Clear </button>";
}

// 2. Bracket Drop Down setup:
//============================ 
function SetupBracketDropDown(){
  document.getElementById("BracketDropDown").innerHTML = null; //reset buttons

  for (var i = 0; i < brackets.length; i++) {
    var option = document.createElement("option");

    option.value = brackets[i][0];

    if (brackets[i][1] != ""){
      option.text = brackets[i][1] + ": " + brackets[i][0];
    } else {
      option.text = "";
    }

    if (brackets[i][3] == "Disabled") {
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
function SetupTargetsBasedOnBracketPick(SelectedBracket){
  // console.Entry("Selected Bracket: '" + SelectedBracket + "'");
  document.getElementById("targets").innerHTML = null; //reset targets
  document.getElementById("TargetButtons").innerHTML = null; //reset buttons

  if (SelectedBracket == "") {
    LoadAllTargetsAsOptions(); //(true)

  } else {
    var SelectedBracketWords = ""

    for (var i = 0; i < brackets.length; i++) {
      var foundTargetBracket = brackets[i][0];
      // console.Entry("This(" + foundTargetBracket + ") vs. That(" + SelectedBracket + ")")
      if (brackets[i][0] == SelectedBracket) {
        //console.Entry("Found Bracket: " + foundTargetBracket);
        SelectedBracketWords = brackets[i][2];
        break;
      }
    }

    var foundTargets = 0;
    for (var j = 0; j < targets.length; j++) {
      if (targets[j][1] == SelectedBracketWords) {
        var option = document.createElement("option");
        option.text = targets[j][0];
      
        if (!targets[j][0].includes(";;")) { //;; denotes the 'full name';;'paraphrased name'
          document.getElementById("targets").appendChild(option);

          var safeStr = targets[j][0].replace(/'/g, "\\'");
          
          document.getElementById("TargetButtons").innerHTML += "<button type=\"button\" class=\"btn btn-secondary\" onclick=\"addLedgerStringInnerBracket('"+safeStr+ "')\">" + targets[j][0] + "</button>";

          foundTargets++;
        }

      }
    }
    //console.Entry("Found " + foundTargets + " targets, based on Bracket selection");  
  }
}

//////////////////////////////////////

//////////////////////////////////////
// III. GUI Usage Functions

//0. Update Target Activities
//===========================
function UpdateTargetActivities(bracketNumber, debug=false) {

  if (bracketNumber >= 0 && bracketNumber < brackets.length) {
    if(debug){
      console.Entry("[DEBUG] [UpdateTargetActivities()] Changing selected index to: " + bracketNumber);
    }
    document.getElementById("BracketDropDown").selectedIndex = bracketNumber; //This is N/A for drop down, but is used for buttons!

    if (brackets[bracketNumber][3] == "Dice" || brackets[bracketNumber][3] == "Numbers") {
      hideShowDice(true);

      if(debug){
        console.Entry("[DEBUG] [UpdateTargetActivities()] Toggle Dice - on");
      }

    // } else if (...) {
    //     Actions for: ()
    //     Numbers and Letters for: <>
    //     N/PC's for: ⸢  ⸣ || ⸤  ⸥ || ⸢  ⸥
    //     Numbers for: ⦇⦈

    } else {
      hideShowDice(false);

      if(debug){
        console.Entry("[DEBUG] [UpdateTargetActivities()] Toggle Dice - off");
      }
    }


  } else {
    hideShowDice(false);

    //Disable...
    //     Actions for: ()
    //     Numbers and Letters for: <>
    //     N/PC's for: ⸢  ⸣ || ⸤  ⸥ || ⸢  ⸥
    //     Numbers for: ⦇⦈
  }

}

//1. Generate Brackets:
//=====================
function addBracket(bracketNumber, debug=false) {
  UpdateTargetActivities(bracketNumber);

  var selectedBracketTag = document.getElementById("BracketDropDown").value;
  SetupTargetsBasedOnBracketPick(selectedBracketTag); //Determine bracket, to dynamically add targets buttons (brackets[i][2])

  if(debug){
    console.Entry("[DEBUG] [addBracket()] Adding Bracket: " + brackets[bracketNumber][0] +"; for selected bracket tag: '" + selectedBracketTag + "'");
  }

  if(isAutoBracketToggled){
    hasBracketBeenPlaced = true;
    LedgerIt();
  }
}

//2. Clear - Bracket
//================== 
function ClearBracket() {
  document.getElementById("BracketDropDown").value = "";
  hideShowDice(false);
}

//3. Clear - Ledger
//================
function ClearLedger() {
  isLedgerEmpty = true;
  document.getElementById("ledger").value = "";
  oldLedger = [];
}

//4. Clear - Entry 
//=============
function ClearEntry() {
  if (isEntryEmpty){
    return;
  }

  isEntryEmpty = true;
  document.getElementById("Entries").innerHTML = "<div id=\"EntryTableDiv\" style=\"background-color:rgba(178, 178, 188, 0.571);\"><h2><i>{Entries are empty}</i></h2></div>";

  Entry = [];
  LocalStorageClearEntriesOnly();
}

//5. Clear - Tag
//=============
function ClearTag() {
  document.getElementById("BracketDropDown").value = "";
}

//6. Clear - Target
//================
function ClearTarget() {
  document.getElementById("target").value = "";
}

function ClearTargetArray() {
  if (targets.length === 0) {
    return;
  }

  targets = [];
  LocalStorageClearTargetsOnly();
}


//7. Show/Hide Dice:
//================== 
function hideShowDice(showDice=false) { // https://www.w3schools.com/howto/howto_js_toggle_hide_show.asp
  var x = document.getElementById("Dice");
  if (isShowingNumbers && showDice){
    return;
  }

  if (x.style.display === "none" && showDice) {
    x.style.display = "block";
    isShowingNumbers = true;
  } else {
    x.style.display = "none";
    isShowingNumbers = false;
  }
}

//8. Undo - Ledger
//================
function UndoLedger() {
  if (oldLedger.length > 0) {
    document.getElementById("ledger").value = oldLedger[oldLedger.length-1];
    oldLedger.pop();  

  } else {
    ClearLedger();
  }
}

//////////////////////////////////////

//////////////////////////////////////
// IV. Usage/Async I/O Functions

//1. Target - Check if Exists, Add if not
//=======================================
function CheckAndAddTarget(){
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

  var bracketSelectedOption = document.getElementById("BracketDropDown").selectedIndex;

  var BannedOption = true;
  var bracketSetting = brackets[bracketSelectedOption][3];
  // for (var j = 0; j < brackets.length; j++) {
  if (bracketSetting != "Dice" && bracketSetting != "Ignore") {
    BannedOption = false; //target exists
  }

  var Repeat = false;
  for (var k = 0; k < targets.length; k++) {
    // console.Entry("[DEBUG] [CheckAndAddTarget()] Comparing " + targetToCheck + " to " + targets[k][0]);
    if (targets[k][0] == targetToCheck) {
      Repeat = true; //target exists
      // console.Entry("[DEBUG] [CheckAndAddTarget()] Repeating Target... skipping!");
    }
  }

  if (newTarget && !BannedOption && !Repeat) {
    // var option = document.createElement("option");
    // option.text = targetToCheck;
    // document.getElementById("targets").appendChild(option);
    
    //add to targets[]
    console.Entry("[DEBUG] [CheckAndAddTarget()] Adding Target: " + targetToCheck + " with category: " + brackets[bracketSelectedOption][2]);
    // var newTarget = [targetToCheck, brackets[adjustedBracketNumber][2] , ""];
    var newTarget = [targetToCheck, brackets[bracketSelectedOption][2] , ""];
    targets.push(newTarget);

    LocalStorageTargetsSave(); //(true)
  }

}

//2. LedgerIt 
//===========
function LedgerIt(debug=true) {
  if (debug){
    console.Entry("[DEBUG] [LedgerIt()] Setting hasBracketBeenPlaced is: " + hasBracketBeenPlaced);
  }

  //I. back, to allow a "rewind" of the ledger
  oldLedger.push(document.getElementById("ledger").value); //This is used for "Undo" Ledger Entry

  //II. Lookup Bracket, based on Bracket selection , set new size/width
  var obj = document.getElementById("BracketDropDown");
  var currentBracket = obj.options[obj.selectedIndex].value;

  CurrentBracketSize = currentBracket.length;
  CurrentBracketWidth = (CurrentBracketSize - 1)/2;

  if (LastBracketWidth < 1){
    console.Entry("[ERROR] Provided bracket is formmatted WRONG! (len: " + CurrentBracketSize + ")");
    //return;
  }
  //III. determine target from provided input field
  var tempTarget = document.getElementById("target").value;

  // IV. Add to Ledger
  var LeftSideBracket = currentBracket.slice(0,CurrentBracketWidth);
  var RightSideBracket = currentBracket.slice(-CurrentBracketWidth, CurrentBracketSize);

  //isLedgerEmpty =?= hasBracketBuildingStarted??
  if (isLedgerEmpty){    
    if (debug){
      console.Entry("[DEBUG] [LedgerIt()] {Empty Ledger} Updating flags!");
    }

    isLedgerEmpty = false;
    hasBracketBuildingStarted = true;
  }

  if (!isInnerBracketToggled) {
    if (debug){
      console.Entry("[DEBUG] [LedgerIt()] {Empty Ledger | !isInnerBracketToggled } Adding to Ledger: " + LeftSideBracket + tempTarget + RightSideBracket);
    }
    // document.getElementById("ledger").value += LeftSideBracket; -- this is direct menthod of the 'addLedgerStringAtEnd'
    // document.getElementById("ledger").value += RightSideBracket; -- this is direct menthod of the 'addLedgerStringAtEnd'
    addLedgerStringAtEnd(LeftSideBracket + tempTarget + RightSideBracket);

    CheckAndAddTarget();

    LastBracketSize = CurrentBracketSize;
    LastBracketWidth = CurrentBracketWidth;
    LastBracket = currentBracket;

  } else { //isInnerBracketToggled
    if (hasBracketBuildingStarted && LastBracket == currentBracket){
      if (debug){
        console.Entry("[DEBUG] [LedgerIt()] {isInnerBracketToggled} Adding to Ledger: " + tempTarget);
      }
      addLedgerStringInnerBracket(tempTarget);
      
    } else { //deals with the nesting of brackets --- ex: [PC](A→]enemy NPC[]); the ][-bracket is nested within the ()-bracket
      if (debug){
        console.Entry("[DEBUG] [LedgerIt()] {isInnerBracketToggled} Adding to Ledger: " + LeftSideBracket + tempTarget + RightSideBracket);
      }
      addLedgerStringInnerBracket(LeftSideBracket+tempTarget+RightSideBracket);
    }

  }

  // if (!hasBracketBuildingStarted){
  //   hasBracketBuildingStarted = true;
  // }

  if (debug){
    console.Entry("[DEBUG] [LedgerIt()] DONE!!!");
  }

  //move cursor to the end of the ledger input field
  var obj = document.getElementById("ledger");
  //obj.focus(); // THIS will pop up a keyboard prompt on mobile devices
  obj.setSelectionRange(obj.value.length, obj.value.length);


}

//3. EntryIt 
//===========
function EntryIt() {
  if (isLedgerEmpty){
    LedgerIt(); //Auto-ledger then Entry it
  }

  if (isEntryEmpty){
    isEntryEmpty = false;
    document.getElementById("Entries").innerHTML = "<table id=\"TableEntryTable\" class=\"table table-striped\"><tbody id=\"EntryTableBody\"></tbody></table>";
    //console.Entry("[DEBUG] [EntryIt()] Entries table created");
  } 

  var obj = document.getElementById("ledger");
  var currentLedger = document.getElementById("ledger").value;
  Entry.push(currentLedger);


  var row = document.createElement("tr");

  var cell = document.createElement("td");
  safeCurrentStr = currentLedger.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  cell.innerHTML = safeCurrentStr;
  row.appendChild(cell);
  document.getElementById("EntriesTable").appendChild(row);


  CheckAndAddTarget();
  ClearLedger();
  ClearTag();
  ClearTarget();

  LocalStorageEntriesSave();

  //Any time EntryIt() is called -- reset the inner-bracket toggles
  ToggleDisableInnerbracket();

  hasBracketBuildingStarted = false;
}

//4. RemoveLastEntry 
//================
function RemoveLastEntry() {
  if (isEntryEmpty){
    return;
  }

  Entry.pop();
  if (Entry.length > 0){
    var table = document.getElementById('EntriesTable');
    table.removeChild(table.children[table.children.length - 1]);

    LocalStorageEntriesSave();

  } else {
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

  console.Entry("[DEBUG] [addLedgerStringInnerBracket()] Ledger: '" + obj.value + "'");

  //Any impacts of "isInnerBracketToggled" == true ? <-- NO

  //Modify Activites are ALWAYS inner-bracket item; to save user click(s) this check will auto-toggle the next entry to be an innerbracket action
  if (PassedString == ";;"){
    ToggleEnableInnerbracket();
  }

}

function addLedgerStringAtEnd(PassedString){
  var obj = document.getElementById("ledger");
  obj.value += PassedString;

  console.Entry("[DEBUG] [addLedgerStringAtEnd()] Ledger: '" + obj.value + "'");
}

// function addLedgerStringAtEndBracket(PassedString){
//   var obj = document.getElementById("ledger");
//   obj.value += PassedString;

//TODO: bracket Left/Right side determination to then have: Left + Passed + Right....

//   console.Entry("[DEBUG] [addLedgerStringAtEndBracket()] Ledger: '" + obj.value + "'");
// }

function ToggleDisableAutobracket(){
  //console.Entry("[DEBUG] [ToggleDisableAutobracket()]");
  document.getElementById("toggleAutobracket").checked = false;
  isAutoBracketToggled = false;
  
}

function ToggleEnableAutobracket(){
  //console.Entry("[DEBUG] [ToggleEnableAutobracket()]");
  document.getElementById("toggleAutobracket").checked = true;
  isAutoBracketToggled = true;
}

function ToggleDisableInnerbracket(){
  //console.Entry("[DEBUG] [ToggleDisableInnerbracket()]");
  document.getElementById("toggleInnerbracket").checked = false;
  isInnerBracketToggled = false;
  
}

function ToggleEnableInnerbracket(){
  //console.Entry("[DEBUG] [ToggleEnableInnerbracket()]");
  document.getElementById("toggleInnerbracket").checked = true;
  isInnerBracketToggled = true;
}




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
  console.Entry("[DEBUG] [ExportEntryToJson()] date str:<" + textIso+">");

  saveAs(blob, "GSL_Entry_"+textIso+".json");
}

/////////////////////////////////

function LoadArrayIntoEntry(PassedArray){ //Passed JSON Parsed from String
  Entry = [];
  for (var i = 0; i < PassedArray.length; i++) {
    Entry.push(PassedArray[i]);
  }
}

function LoadEntryArrayIntoTable(){  // \" class=\"table table-striped\"><tbody id=\"EntryTableBody
  document.getElementById("Entries").innerHTML = "<table id=\"TableEntryTable\" class=\"table table-striped\"><tbody id=\"EntryTableBody\"></tbody></table>";
  for (var j = 0; j < Entry.length; j++) {
    var row = document.createElement("tr");
    var cell = document.createElement("td");

    cell.innerHTML = Entry[j];
    row.appendChild(cell);

    document.getElementById("EntriesTable").appendChild(row);      
  }
}

function LoadArrayIntoTargets(PassedArray){ //Passed JSON Parsed from String
  targets = [];
  for (var i = 0; i < PassedArray.length; i++) {
    targets.push(PassedArray[i]);
  }

}

function LoadAllTargetsAsOptions(debug=false){ //this vs. SetupTargetsBasedOnB
  for (var j = 0; j < targets.length; j++) {
    var hasTwoTargets = false;
    var currentTarget = targets[j][0];
    var secondaryTarget = "";
    /////////////
    //TODO:
    if (currentTarget.includes(";;")) {
      if (debug) {
        console.Entry("[DEBUG] [LoadAllTargetsAsOptions()] Target '"+targets[j][0]+"' includes ';;' !");
      }

      currentTarget = currentTarget.split(";;")[0];
      secondaryTarget = targets[j][0].split(";;")[1];
      hasTwoTargets = true;
    }
    /////////////
    var isDone = true;
    do {
      var option = document.createElement("option");
      option.text = currentTarget;
  
      var safeStr = targets[j][0].replace(/'/g, "\\'");
  
      if (debug){
        console.Entry("[DEBUG] [LoadAllTargetsAsOptions()] '"+targets[j][0]+"'");
        console.Entry("safeStr: '" + safeStr + "'");
      }
  
      document.getElementById("targets").appendChild(option);
      document.getElementById("TargetButtons").innerHTML += "<button type=\"button\" class=\"btn btn-secondary\" onclick=\"addLedgerStringInnerBracket('"+safeStr+ "')\">" + targets[j][0] + "</button>";

      if (hasTwoTargets){
        currentTarget = secondaryTarget;
        hasTwoTargets = false;
      } else {
        isDone = false;
      }

    } while (isDone);

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
    console.Entry("[DEBUG][LocalStorageClear] Cleared all user/page created keys!");
  }
}

function LocalStorageClearEntriesOnly(debug=false){
  localStorage.removeItem('Builder-Entries');
  if (debug){
    console.Entry("[DEBUG][LocalStorageClear] Cleared all user/page created keys - for Entries!");
  }
}

function LocalStorageClearTargetsOnly(debug=false){
  localStorage.removeItem('Builder-Targets');
  if (debug){
    console.Entry("[DEBUG][LocalStorageClear] Cleared all user/page created keys - for Targets!");
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
        console.Entry("[DEBUG][LocalStorageLoadMainKeys] Found key: '" + key + "'");
        console.Entry( key + " = " + ((window.localStorage[key].length * 16)/(8 * 1024)).toFixed(2) + ' KB' );
      }  
      if (key === "Builder-Entries"){
        if (debug){
          console.Entry("[DEBUG][LocalStorageLoadMainKeys] Loading Entries saved in 'Builder-Entries'!");
        }
        
        //Load content into Entry[]
        var storedEntries = localStorage.getItem('Builder-Entries');
        var parsedEntry = JSON.parse(storedEntries);
        LoadArrayIntoEntry(parsedEntry);
        if (debug){
          console.Entry("[DEBUG][LocalStorageLoadMainKeys] Loaded string <" + storedEntries + ">");
          console.Entry("[DEBUG][LocalStorageLoadMainKeys] Parsed string <" + parsedEntry + ">");
          console.Entry("[DEBUG][LocalStorageLoadMainKeys] Loaded '" + Entry.length + "' Entries");
        }

        //(c) - load Entry[] entries into <table>
        LoadEntryArrayIntoTable();

        loadedEntries = true;
        isEntryEmpty = false;

      } else if (key === "Builder-Targets"){
        debug = true; //BAD -- REMOVE!
        if (debug){
          console.Entry("[DEBUG][LocalStorageLoadMainKeys] Loading Targets saved in 'Builder-Targets'!");
        }

        var loadedStorage = localStorage.getItem('Builder-Targets');
        var parsedTarget = JSON.parse(loadedStorage);
        LoadArrayIntoTargets(parsedTarget);
        LoadAllTargetsAsOptions(); //(true)

        SetupAllTargets();
      }
    }
  }

  if (!loadedEntries){
    document.getElementById("Entries").innerHTML = "<div id=\"Entriestatus\" style=\"background-color:rgba(178, 178, 188, 0.571);\"><h2><i>{Entries are empty}</i></h2></div>";
  }

  return totalKeys;
}

//10. localstorage - Save Entries
//=======================
function LocalStorageEntriesSave(debug=false){
  var newEntriesStr = EntriesStringifyAsJSON();

  if (debug){
    console.Entry("[DEBUG][LocalStorageEntriesSave] Saving Entries to localstorage...");    
    console.Entry("[DEBUG][LocalStorageEntriesSave] NewString: " + newEntriesStr);
  }

  localStorage.setItem('Builder-Entries', newEntriesStr);

}

//10. localstorage - Save Targets
//=======================
function LocalStorageTargetsSave(debug=false){
  var newTargetStr = TargetArrayStringifyAsJSON();

  if (debug){
    console.Entry("[DEBUG][LocalStorageTargetsSave] Saving Targets to localstorage...");    
    console.Entry("[DEBUG][LocalStorageTargetsSave] NewString: " + newTargetStr);
  }

  localStorage.setItem('Builder-Targets', newTargetStr);

}

//////////////////////////////////////








