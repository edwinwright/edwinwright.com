'use strict';

// dependencies
var Velocity = require('velocity-animate');

// bind events to explore buttons
var links = document.querySelectorAll('[data-scroll]');
console.log(links);

for (var i = 0; i < links.length; ++i) {
  var link = links[i];
  link.addEventListener('click', function(e) {
		e.preventDefault();
		var targetID = e.currentTarget.getAttribute('href');
		Velocity(document.querySelector(targetID), 'scroll', {
			duration: 750,
			offset: -50,
			easing: 'easeInOutQuint'
		});

		// TODO: add code to activate menu as you scroll down the page
		// setActiveBtn();
  });
}
