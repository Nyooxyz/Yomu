  // -- First time Im spending this much time on a project without dropping  -- //
    // -- Really hope to see it being useful to somebody at least not only for me  -- //
      // -- And sorry again If my terrible coding is making alot of people cringe this is horrible I know me and my few neurons did our best -- //
 
 // First mess
 const ourForm = document.querySelector(".our-form")
 const ourField = document.querySelector(".our-field")
 const score = document.querySelector(".score")
 const wrong = document.querySelector(".wrong")
 const combo = document.querySelector(".combo")
 const kanji = document.querySelector('.kanji')
 const content = document.querySelector('.content')
 const scoreMenuX = document.querySelector('#scoreMenuX')
 const tableRef = document.querySelector("#tableau")
 const scoreX = document.querySelector("#scoreRes")
 const main_ui = document.querySelector(".main-ui")
 const counters = document.querySelectorAll('.score')
 const acc = document.querySelector('.acc')

 // File links
 const jlpt5 = '../kanji_data/jlpt-5/questions.json'
 const jlpt4 = ''
 const jlpt3 = ''
 const jlpt2 = ''
 const jlpt1 = ''

 const diff = 1 // Game Difficulty WIP



 updateProblem() 



 // -- Game state -- //

 let state = {
   score: 0,
   wrongAnswers: 0,
   combo: 0,
   i:0,
   kanj: null,
   hira: null
 }

  // -- Array loop -- //

  const tabRes = []  // Array of results [0] = kanji -  [1] = hira  - [2] = misscount
  const arrAnki = [] // Anki array [0] = kanji -  [1] = hira  - [2] = i value

  // -- Initialisation -- //

 function initProblem(data){
   let i = randomIntFromInterval(0,587) // Choosing random word
   
   state.kanj = data[i]["question"]
   state.hira = data[i]["answer"]

   kanji.innerHTML = state.kanj
   ourField.value = ""
   ourField.focus()
 }


 function updateProblem(){ 
   fetch(jlpt5)
   .then(response => response.json()) 
   .then(function(data){
     initProblem(data)
     console.log(state.hira) // Coz Im dumb
   })
 }



  // -- Anki -- //

 function callAnkiOopa(){
  if(arrAnki.length != 0){
    return arrAnki[0].i === 0
  }
 }

 function callAnki(){
  

  state.kanj = arrAnki[0]["kanj"]
  state.hira = arrAnki[0]["hira"]
  

  kanji.innerHTML = state.kanj
  ourField.value = ""
  ourField.focus()
 }

 function addAnki(){
   arrAnki.push({
    kanj: state.kanj, 
    hira: state.hira,
    i: 6
  })
 }

 function doAnki(){
  // - Optimisation of function in progress - //

  if(arrAnki.length != 0){
    arrAnki.forEach(item => item.i--)
  }

  if (callAnkiOopa()){
    callAnki()
    arrAnki.shift()
  }
  else{
    updateProblem()
  }
 }

  // --         -- //


 function randomIntFromInterval(min, max) { 
   return Math.floor(Math.random() * (max - min + 1) + min)
 }



 function arrRes(){

  if (tabRes.some(e => e.kanj === state.kanj)) {

    const foundkanj = tabRes.find(k => {
    return k.kanj === state.kanj
    })
    foundkanj.miss++
  }

  else{
    tabRes.push({
      kanj: state.kanj, 
      hira: state.hira,
      miss: 1
    })
  }
 }

 function arrToTab(){
  tabRes.forEach((item) => {
    addRow(item.kanj,item.hira,item.miss)
  });

 }



 // -- Handling input -- //

 ourForm.addEventListener("submit", handleSubmit) 

 function handleSubmit(e){
   e.preventDefault()
   state.i++


     // RIGHT ANSWER --                                                              
   if (ourField.value === state.hira){

    rightAnsAnim2()
    setTimeout("rightAns()", 300)
    
     // WRONG ANSWER --                                                             
   } else{
     wrongAnsAnim2()
     wrongAns()
   }
 }

 function rightAns(){
  state.combo++
  state.score += 300 + ((300 * state.combo * diff)/15)
  scoreUpdate()
  acc.textContent = accCalc()
  combo.textContent = state.combo

  doAnki()
 }

 function wrongAns(){
  state.wrongAnswers++
  state.combo = 0
  acc.textContent = accCalc()
  wrong.textContent = state.wrongAnswers
  combo.textContent = state.combo

  arrRes()

  addAnki()

  doAnki()

 }




 // -- Reset -- //


 function resetGame(){
   state.combo = 0
   state.wrongAnswers = 0
   state.score = 0
 }

 // -- Tableau -- //

 function showContent(){
   content.style.display = 'block'
   scoreMenuX.style.display = 'none'
   resetGame()
   clearTab()
   }

 function scoreMenu(){
   content.style.display = 'none'
   scoreMenuX.style.display = 'block'

   scoreX.textContent = "Score: "+state.score+"Miss: "+state.wrongAnswers
 }

 function addRow(kanj,hira,miss) {

   let newRow = tableRef.insertRow(-1)
   let newCell1 = newRow.insertCell(0)
   let newCell2 = newRow.insertCell(1)
   let newCell3 = newRow.insertCell(2)
   let newCell4 = newRow.insertCell(3)
   let newText1 = document.createTextNode(kanj)
   let newText2 = document.createTextNode(hira)
   let newText3 = document.createTextNode(miss)
   let newText4 = document.createTextNode("Click for infos")

   newCell4.addEventListener("click",() => {window.open("https://jisho.org/word/"+kanj, "_blank");})

   newCell1.appendChild(newText1)
   newCell2.appendChild(newText2)
   newCell3.appendChild(newText3)
   newCell4.appendChild(newText4)

 }

 function clearTab(){

   while (tableRef.rows.length > 1) {
     tableRef.deleteRow(1)
   }
 }



// -- Answers Animations -- //

 var existingTimeout = null;

 function wrongAnsAnim2() {
  // sfx_no.play();
  Pop(state.hira);

  $(".main-ui").addClass("shake-no");

  if (existingTimeout !== null) {
    clearTimeout(existingTimeout);
  }

  existingTimeout = setTimeout(function() {
    $(".main-ui").removeClass("shake-no");
  }, 300);
}

function rightAnsAnim2() {
  // sfx_no.play();

  $(".main-ui").addClass("yes");

  if (existingTimeout !== null) {
    clearTimeout(existingTimeout);
  }

  existingTimeout = setTimeout(function() {
    $(".main-ui").removeClass("yes");
  }, 300);
}

// -- PopUp Right Answer -- //


$(document).ready(function() {
	$("body").append('<div id="dialogs"></div>');
	$("body").append('<div id="jin-pop" class="hidden">Test pop</div>');
});


var popTimer = null;
function Pop(text, time = 2000) {
	$("#jin-pop").html(text);
	$("#jin-pop").removeClass("hidden");

	if (popTimer !== null) {
		clearTimeout(popTimer);
		popTimer = null;
	}
	popTimer = setTimeout(function() {
		$("#jin-pop").addClass("hidden");
		popTimer = null;
	}, time);
}

// -- Timer -- //

var initial = 300000;
var count = initial;
var counter; // 10 will  run it every 100th of a second
var initialMillis;
var timerEL = document.getElementById("timer")

function timer() {
    if (count <= 0) {  //  end of game
        clearInterval(counter);
        arrToTab()
        scoreMenu()
        timerEL.style.display = "none";
        return;
    }
    var current = Date.now();
    
    count = count - (current - initialMillis);
    initialMillis = current;
    displayCount(count);
}

function displayCount(count) {
  let res = Math.floor(count / 1000);
  let milliseconds = count.toString().substring(3,5);
  let seconds = res % 60;
  let minutes = (res - seconds) / 60;

  timerEL.innerHTML =
      minutes + ':' + seconds  + "<span id='ms'>" +  milliseconds + "</span>";
}

$('#start').on('click', function () {

    $(".content").removeClass("tokiWoTomare");
    clearInterval(counter);
    timerEL.style.display = "block";
    initialMillis = Date.now();
    counter = setInterval(timer, 1);
    $( "#rules" ).hide();
});

$('#reset').on('click', function () {
  
    clearInterval(counter);
    arrToTab()
    scoreMenu()
    timerEL.style.display = "none";
    count = initial;
    displayCount(count);
});

$('.restartButton').on('click', function () {
  clearInterval(counter);
  count = initial;
  displayCount(count);
  initialMillis = Date.now();
  counter = setInterval(timer, 1);
  timerEL.style.display = "block";
});

displayCount(initial);

// -- Score animation -- //

const scoreAnimSpeed = 200;

function scoreUpdate(){
  counters.forEach( counter => {
    const animate = () => {
       const value = +state.score;
       const data = +counter.innerText;
      
       const time = value / scoreAnimSpeed;
      if(data < value) {
           counter.innerText = Math.ceil(data + time);
           setTimeout(animate, 1);
         }else{
           counter.innerText = value;
         }
      
    }
    
    animate();
 });
}

function accCalc(){
  return (((state.i-state.wrongAnswers)/state.i)*100).toPrecision(3)
}