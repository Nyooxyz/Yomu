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

 // File links
 const jlpt5 = '../kanji_data/jlpt-5/questions.json'
 const jlpt4 = ''
 const jlpt3 = ''
 const jlpt2 = ''
 const jlpt1 = ''

 const diff = 1 // Difficulté choisie
 



 updateProblem()




 // -- Timer --

 const display = document.querySelector('#timer');
 var fiveMinutes = 60 * 5
 let stop = false

 function initTimer(duration, display) {

   var timer = duration, minutes, seconds;
   var refreshInterval = setInterval(updateTimer,1000)

   function updateTimer() {
       minutes = parseInt(timer / 60, 10);
       seconds = parseInt(timer % 60, 10);

       minutes = minutes < 10 ? "0" + minutes : minutes;
       seconds = seconds < 10 ? "0" + seconds : seconds;

       display.textContent = minutes + ":" + seconds;

       if (--timer < 0) {
           clearInterval(refreshInterval)
           scoreMenu()
       }
       if (stop == true){
         clearInterval(refreshInterval)
         scoreMenu()
       }
   };
 }

 function startTimer(){
   stop = false
   initTimer(fiveMinutes,display)
 }

 function stopTimer(){
   stop = true
 } 

 function retryTimer(){
   stopTimer()
   setTimeout(function(){
     startTimer()
   },1000)
 }

 // --      -- 

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
     revealAnsNoJQ()
     //improve.word.push(state.kanj)
     //improve.read.push(state.hira)
     state.wrongAnswers++
     state.combo = 0
     wrong.textContent = state.wrongAnswers
     combo.textContent = state.combo

     addRow(state.kanj,state.hira)

     updateProblem()
   }
 }


 function resetGame(){
   state.combo = 0
   state.wrongAnswers = 0
   state.score = 0
 }

 // Fin de game - Tableau

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

 function revealAns(){

   $button = $('.correct-answer');
   $button.text("Right answer: "+state.hira)

   $button.show()

   setTimeout(function() {

       $button.fadeOut();

   }, 3000);

 }

 function revealAnsNoJQ(){
   var ans = document.querySelector('.correct-answer')
   ans.textContent = "Right answer: "+state.hira
   ans.style.display = 'block'

   setTimeout(function() {

     ans.style.display = 'none'

 }, 3000);

 }

 function wrongAnsAnim(){
   kanji.classList.add("wrong-anim")
   setTimeout(() => kanji.classList.remove("wrong-anim"),331)
 }
 function rightAnsAnim(){
   kanji.classList.add("right-anim")
   setTimeout(() => kanji.classList.remove("right-anim"),331)
 }

 var existingTimeout = null;

 function wrongAnsAnim2() {
  // sfx_no.play();
  Pop(state.hira);

  $(".kanji").addClass("shake-no");

  if (existingTimeout !== null) {
    clearTimeout(existingTimeout);
  }

  existingTimeout = setTimeout(function() {
    $(".kanji").removeClass("shake-no");
  }, 300);
}

$(document).ready(function() {
	$("body").append('<div id="dialogs"></div>');
	$("body").append('<div id="jin-pop" class="hidden">Test pop</div>');
});


var popTimer = null;
function Pop(text, time = 1000) {
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