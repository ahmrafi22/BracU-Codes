/*
 jQuery animateNumber plugin v0.0.14
 (c) 2013, Alexandr Borisov.
 https://github.com/aishek/jquery-animateNumber
*/
$(document).ready(function() {
    $('.counter-wrap').each(function() {
      var $this = $(this),
          countTo = $this.find('.number').attr('data-number');
      
      $({ countNum: 0 }).animate({
        countNum: countTo
      },
      {
        duration: 1500,
        easing: 'linear',
        step: function() {
          var num = Math.floor(this.countNum);
          $this.find('.number').text(num);
        },
        complete: function() {
          if ($this.find('.number').next('span').text().trim() === 'Customers rating') {
            var rating = parseFloat(this.countNum).toFixed(1);
            $this.find('.number').text(rating);
          }
        }
      });
    });
  });