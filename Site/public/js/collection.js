const next = document.querySelector(".arrow.right")
const previous = document.querySelector(".arrow.left")



$(document).ready(function () {
	$('#card-container').load('common/page1.html');
});

window.onload = function(){ 
  let page = 1

  previous.onclick = function(){
  if(page != 1){
    page--
    let linkPage = '../../common/page' + page + '.html' 
    console.log(page)

    $('#card-container').empty()

    $(document).ready(function () {
      $('#card-container').load(linkPage);
    });

  }

  }

  next.onclick = function(){
    if(page != 32){
      page++
      let linkPage = '../../common/page' + page + '.html' 
      console.log(page)
    
      $('#card-container').empty()
    
      $(document).ready(function () {
        $('#card-container').load(linkPage);
      });
    
    }
    
  }
};




// -- Progress bar for later animations -- //



function move() {
  var i = 0;
  if (i == 0) {
    i = 1;
    var elem = document.getElementById("myBar");
    var width = 10;
    var id = setInterval(frame, 10);
    function frame() {
      if (width >= 100) {
        clearInterval(id);
        i = 0;
      } else {
        width++;
        elem.style.width = width + "%";
        elem.innerHTML = width  + "%";
      }
    }
  }
}