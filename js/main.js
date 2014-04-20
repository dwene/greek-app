//Define Functions
    //get the scrollPos
    function scrollPos(){ $(window).scrollTop() }
    //find the position of the top of element
    function topPos(a){ var thistop = $(a).offset().top; return thistop; }
    //find the position of the bottom of element
    function bottomPos(a){ var thisbottom = $(a).offset().top + $(a).height(); return thisbottom; }


//Initialize Smoothscroll
smoothScroll.init();