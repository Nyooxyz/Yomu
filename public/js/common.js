function hrefing(str){
    $('.grid_transi').removeClass('transi_in')
    $('.grid_transi').addClass('transi_out')
    setTimeout(function(){
        location.href=str
    },4000)
}