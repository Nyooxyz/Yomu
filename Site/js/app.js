 // HTML links
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

 // File links
 const jlpt5 = '../kanji_data/jlpt-5/questions.json'
 const jlpt4 = ''
 const jlpt3 = ''
 const jlpt2 = ''
 const jlpt1 = ''

 const diff = 1 // Difficulté choisie
 



 updateProblem()


 let state = {
   score: 0,
   wrongAnswers: 0,
   combo: 0,
   kanj: null,
   hira: null
 }

 /* let improve = {
   word: [],
   read: []
 } */

 function initProblem(data){
   let i = randomIntFromInterval(0,587)
   
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
     console.log(state.hira)
   })
 }

 function randomIntFromInterval(min, max) { 
   return Math.floor(Math.random() * (max - min + 1) + min)
 }

 ourForm.addEventListener("submit", handleSubmit)

 function handleSubmit(e){
   e.preventDefault()


   // RIGHT ANSWER --                                                              --
   if (ourField.value === state.hira){
     rightAnsAnim()
     state.combo++
     state.score += 300 + ((300 * state.combo * diff)/15)
     score.textContent = state.score
     combo.textContent = state.combo
     updateProblem()
     

     // WRONG ANSWER --                                                             --
   } else{
     wrongAnsAnim2()
     state.wrongAnswers++
     state.combo = 0
     wrong.textContent = state.wrongAnswers
     combo.textContent = state.combo

     addRow(state.kanj,state.hira)

     updateProblem()
   }
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

 function addRow(kanj,hira) {
   let newRow = tableRef.insertRow(-1)
   let newCell1 = newRow.insertCell(0)
   let newCell2 = newRow.insertCell(1)
   let newText1 = document.createTextNode(kanj)
   let newText2 = document.createTextNode(hira)

   newCell1.appendChild(newText1)
   newCell2.appendChild(newText2)

 }

 function clearTab(){

   while (tableRef.rows.length > 1) {
     tableRef.deleteRow(1)
   }
 }



// -- Wrong Answer Animation -- //

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

var countdownNumberEl = document.getElementById('countdown-number');
var countdown = 300;

countdownNumberEl.textContent = countdown;

function timerStart(){

  $("svg circle").css("animation","countdown 300s linear infinite forwards");

  setInterval(function() {
    countdown = --countdown <= 0 ? 300 : countdown;
  
    countdownNumberEl.textContent = countdown;
  }, 1000);
}