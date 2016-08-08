/**
 * @title jQuery.domTank
 * @file A jQuery plugin for turning any DOM element into a movable tank.
 * @requires jQuery
 * @author Tim Scott Long
 * @contact contact@timlongcreative.com
 * @copyright Tim Scott Long 2016
 * @version 1.1.0
 * @modified August 7, 2016
 * @license Available for use under the MIT License
 */

/**
 * @description IIFE To maintain a local scope for the $ alias.
 * @param {Object} $ - Alias for jQuery, which is sent in as an argument here to prevent conflicts with other libraries using the same alias.
 */
;(function($) {
	/**
	 * @description Initializes and creates the tank.
	 * @param {Object} options - A list of options that the developer can use to modify the resulting tank.
	 * @returns The current jQuery object (wrapping the affected DOM element).
	 */
	$.fn.domTank = function (options) {
		// One tank at a time. If tank has already been created, do not create a new one.
		if($("#domTankCustomTank").length !==  0) {
			return this;
		}

		var thisElm = this, // Used in the undomTank function.
			$fullTank = null, // Will define our complete constructed tank.
			$tankBody = null,
			wid = this.outerWidth(),
			hght = this.outerHeight(),
			widString = "",
			hghtString = "",
			startingTop = this.offset().top - 22 - $("html").scrollTop(), // Shift up 22px to account for left wheel (to be constructed) and its borders.
			startingLeft = this.offset().left - $("html").scrollLeft(),
			$leftWheel = null,
			$rightWheel = null,
			$tankControls = null, // Used as a target for mouse-based controls.
			leftPos = 0, // A counter tracking the "position" of the first wheel.
			rightPos = 0,	// A counter tracking the "position" of the second wheel.
			leftMoving = false,
			rightMoving = false,
			backMoving = false,
			tankTimer = 1, // Used for our setInterval animation call.
			centerX = 0,
			centerY = 0,
			theta = 0, // Define the tank and bullets with polar coordinates. Begin with tank facing right.
			startingBulletX = centerX,
			startingBulletY = centerY,
			startingBulletTheta = theta,
			bulletR = 0,
			weaponFired = false,
			$clone = null,
			wheelPart = "|&nbsp;&nbsp;",
			wheelString = "",
			defaults = {
				tankSpeed: 1,
				angleSpeed: 1,
				bulletSpeed: 5,
				bulletRange : 500,
				wheelsCss: {},
				weaponCss: {},
				controlsCss: {},
				tankCss: {},
				controlsHtml: "Click/right click in this box<br/><br/>to drive the tank.",
				keys: true,
				mouse: true,			
				timerSpeed: 20, 
				controls: null,
				appendControlsTo: $("body")
			},
			opts = $.extend(defaults, options); // Final list of options, combining defaults and custom options from the "options" parameter.

		// Handle size changes with elements that have no width defined, or have it defined with %.
		if(this.css("width").indexOf("px") === -1)
			widString = (this.innerWidth()) + "px";

		if(this.css("height").indexOf("px") === -1)
			hghtString = (this.innerWidth()) + "px";

		// Constructing the tank.
		$fullTank = $("<div></div>").attr("id", "domTankCustomTank");
		$tankBody = this.clone()
			.css({
					"margin": "0",
					"width": widString,
					"max-height": hghtString
				})
			.css(opts.tankCss);

		$leftWheel = $("<div></div>")
			.attr("id", "leftWheel")
			.css({
				"background-color":"green",
				"color": "black",
				"height": "20px",
				"width": wid,
				"overflow": "hidden",
				"line-height": "20px",
				"font": "16px Times New Roman",
				"border-top": "1px solid black",
				"border-bottom": "1px solid black",
				"borde-left": "none",
				"border-right": "none",
				"margin": "0",
				"padding": "0"
			})
			.css(opts.wheelsCss);

		$rightWheel = $("<div></div>")
			.attr("id", "rightWheel")
			.css({
				"background-color":"green",
				"color": "black",
				"height": "20px",
				"width": wid,
				"overflow": "hidden",
				"line-height": "20px",
				"font": "16px Times New Roman",
				"border-top": "1px solid black",
				"border-bottom": "1px solid black",
				"borde-left": "none",
				"border-right": "none",
				"margin": "0",
				"padding": "0"
			})
			.css(opts.wheelsCss);

		$leftWheel.insertBefore($tankBody);
		$rightWheel.insertAfter($tankBody);

		// Draw the treads.
		for(var i = 0; i < wid; i += 6)
			wheelString += wheelPart;

		$leftWheel.html(wheelString);
		$rightWheel.html(wheelString);

		// Create the gun.
		var weapon = $("<div></div>")
			.css({
				"width": Math.min(80, wid/2) + "px",
				"height": "20px",
				"border": "1px solid black",
				"border-left": "none",
				"background": "green",
				"position": "absolute",
				"top": ((hght + 44)/2 - 11) + "px",
				"left": wid + "px",
				"margin": "0",
				"padding": "0"
			})
			.css(opts.weaponCss);

		$tankBody.append(weapon);

		// Position the constructed tank.
		$fullTank.css({
				"width": wid + "px",
				"height": (hght + 44) + "px",
				"position": "fixed",
				"top": startingTop + "px",
				"left": startingLeft + "px",
				"padding": "0",
				"border": "0",
				"margin": "0"
			})
			.append($leftWheel)
			.append($tankBody)
			.append($rightWheel);

		this.css("visibility", "hidden"); // Hide the element that was duplicated, without upsetting page flow.
		this.find("*").css("visibility", "hidden");
		
		// Set up mouse controls on page.
		if(opts.mouse) {
			if(!opts.controls) {
				$tankControls = $("<div></div>")
					.attr("id", "tankControls")
					.css({
						"position": "fixed",
						"bottom": "20px",
						"right": "20px",
						"width": "300px",
						"height": "200px",
						"background-color": "black",
						"color": "white",
						"cursor": "none",
						"margin": "0",
						"padding": "10px",
						"text-align": "right"
					})
					.css(opts.controlsCss)
					.html(opts.controlsHtml);
			} else {
				$tankControls = $(opts.controls)
					.css(opts.controlsCss)
					.html(opts.controlsHtml);
			}
		}

		addTank().done(function() {
				addEventListeners();
			});

		// Set animation timer for tank movements and bullet movements.
		tankTimer = setInterval(moveTank, opts.timerSpeed);

		/**
		 * @description Adds full tank and (when no controls are already set up) mouse controls to screen.
		 */
		function addTank() {
			var $deferred = $.Deferred();

			if(opts.mouse && !opts.controls) {
				$(opts.appendControlsTo).append($tankControls);
			}
			
			$("body").append($fullTank); // Add constructed tank to the page.
			
			setTimeout(function() {
					$deferred.resolve();
				}, 500);

			return $deferred.promise();
		} // End addTank()
		
		/**
		 * @description Binds mouse and key events for controlling the constructed tank.
		 */
		function addEventListeners() {
			if(opts.mouse) {
				$tankControls.on("mousedown", mousePressed);
				$tankControls.on("mouseup", mouseReleased);
				$tankControls.on("contextmenu", preventContext);
			}
		
			if(opts.keys) {
				$(window).on("keydown", keyDown);
				$(window).on("keyup", keyUp);
			}
		} // End addEventListeners()

		/**
		 * @description Draws treads for left part of tank. The "tread" text changes when left side of tank moves.
		 * @param {number | boolean} rightSide - 0 (or any falsy value) to apply to left side, 1 (or any truthy value) to apply to right side.
		 */
		function drawWheel(rightSide) {
			var wheelString = "",
				wheelPart = "",
				pos = rightSide ? rightPos : leftPos;

			switch(Math.abs(pos) % 6) {
				case 0:
				case 1:
					wheelPart = "|&nbsp;&nbsp;";
				break;
				case 2:
				case 3:
					wheelPart = "&nbsp;|&nbsp;";
				break;
				case 4:
				case 5:
					wheelPart = "&nbsp;&nbsp;|";
				break;
			}

			for(var i = 0; i < wid; i += 6)
				wheelString += wheelPart;

			if(rightSide) {
				$rightWheel.html(wheelString);	
			} else {
				$leftWheel.html(wheelString);
			}
		} // End drawWheel(0)

		/**
		 * @description Handles mousepressed events. Controls movement of the tank depending on if left, right, or middle mouse button is clicked.
		 * @param {Object} evt - A MouseEvent object describing the current mousepressed event.
		 * @notes There is no button on the mouse to make the tank go backward, or to fire the weapon.
		 */
		var mousePressed = function (evt) {
			evt.preventDefault();
			this.contextmenu = null; // Prevent right-click contextmenu - this is why it is preferred to use a smaller DOM element for $tankControls rather than the entire page.

			switch(evt.which) {
				case 1: // Left mouse button
					leftMoving = true;
					rightMoving = false;
				break;
				case 2: // Middle mouse button
					leftMoving = true;
					rightMoving = true;
				break;
				case 3: // Right mouse button
					rightMoving = true;
					leftMoving = false;
				break;
			}
		} // End mousePressed()

		/**
		 * @description Handles mousereleased events. Controls movement of the tank depending on if left, right, or middle mouse button is clicked.
		 * @param {Object} evt - A MouseEvent object describing the current mousereleased event.
		 * @notes evt.which gives the following values: 1 for left button, 2 for middle button, 3 for right button.
		 */
		var mouseReleased = function (evt) {
			evt.preventDefault();
			this.contextmenu = null;

			switch(evt.which) {
				case 1: // Left mouse button
					leftMoving = false;
				break;
				case 2: // Middle mouse button
					leftMoving = false;
					rightMoving = false;
				break;
				case 3: // Right mouse button
					rightMoving = false;
				break;
			}
		} // End mouseReleased()

		/**
		 * @description Handles keydown events. Controls movement of the tank depending on if left, right, or middle mouse button is clicked.
		 * @param {Object} evt - A KeyboardEvent object describing the current keydown event.
		 */
		var keyDown = function (evt) {
			switch(evt.which) {
				case 37: // Left arrow
				case 65: // A
					if(opts.keys === "reverse") {
						leftMoving = true;
						rightMoving = false;
					} else {
						rightMoving = true;
						leftMoving = false;
					}
				break;
				case 38: // Up arrow
				case 87: // W
					leftMoving = true;
					rightMoving = true;
				break;
				case 39: // Right arrow
				case 68: // D
					if(opts.keys === "reverse") {
						rightMoving = true;
						leftMoving = false;
					} else {
						leftMoving = true;
						rightMoving = false;
					}
				break;
				case 40: // Down arrow
				case 83: // S
					leftMoving = false;
					rightMoving = false;
					backMoving = true;
				break;
				case 13: // Enter
					fireWeapon();
				break;
				case 27: // Escape
					unDomTank();
				break;
				default: {}
			}
		} // End keyDown()

		/**
		 * @description Handles keyup events. Controls movement of the tank depending on if left, right, or middle mouse button is clicked.
		 * @param {Object} evt - A KeyboardEvent object describing the current keyup event.
		 */
		var keyUp = function (evt) {
			switch(evt.which) {
				case 37: // Left arrow
				case 65: // A
					if(opts.keys === "reverse") {
						leftMoving = false;
					} else {
						rightMoving = false;
					}
				break;
				case 38: // Up arrow
				case 87: // W
					leftMoving = false;
					rightMoving = false;
				break;
				case 39: // Right arrow
				case 68: // D
					if(opts.keys === "reverse") {
						rightMoving = false;
					} else {
						leftMoving = false;
					}
				break;
				case 40: // Down arrow
				case 83: // S
					backMoving = false;
				break;
				default: {}
			}
		} // End keyUp()

		/**
		 * @description Shoots a bullet from the tank gun, if there isn't already one present (from the latest shot).
		 * @notes This function can only be called with the keyboard (not the mouse) - press ENTER to call it.
		 */
		function fireWeapon() {
			// Remove current bullet if user fires again.
			if(weaponFired) {
				$("#domTankBullet").remove();
				bulletR = 0;
			}

			weaponFired = true;
			weaponR = wid/2 + Math.min(80, wid/2); // Length from center of the tank to the end of the gun.
			centerX = getTankCenter().x,
			centerY = getTankCenter().y;

			// Set the bullet's initial location on the page. The + 10 represents the size of the bullet.
			startingBulletX = centerX + (weaponR + 10) * Math.cos(Math.PI * theta / 180) - 5;
			startingBulletY = centerY + (weaponR + 10) * Math.sin(Math.PI * theta / 180) - 5;
			startingBulletTheta = theta;

			// Create the bullet.
			var $tankBullet = $("<div></div>")
				.attr("id", "domTankBullet")
				.css({
					"width": "10px",
					"height": "10px",
					"background": "orange",
					"position": "fixed",
					"left": startingBulletX + "px",
					"top": startingBulletY + "px",
					"border-radius": "2px",
					"margin": "0",
					"padding": "0",
					"border": "0",
					"box-shadow": "1px 1px 2px #222"
				});
 
			$("body").append($tankBullet);
		} // End fireWeapon()

		/**
		 * @description Reposition the latest bullet shot.
		 */
		function moveBullet() {
			var $tankBullet = $("#domTankBullet");

			// If no bullet is currently on the page, there's nothing left to do.
			if($tankBullet.length === 0) {
				return;
			}

			var x = startingBulletX + (bulletR + 10) * Math.cos(Math.PI * startingBulletTheta / 180),
				y = startingBulletY + (bulletR + 10) * Math.sin(Math.PI * startingBulletTheta / 180);

			$tankBullet.css({
					"left": x + "px",
					"top": y + "px"
				});
		} // End moveBullet()

		/**
		 * @description Returns the xy-coordinates on the page of the center of the tank, based on its CSS "left" and "top" properties.
		 * @returns {Object}
		 */
		function getTankCenter() {
			return {
				x: parseFloat($fullTank.css("left").substring(-2), 10) + wid/2,
				y: parseFloat($fullTank.css("top").substring(-2), 10) + (hght + 44)/2
			}
		} // End getTankCenter()

		/**
		 * @description Advances both wheels and moves the tank forward in its current direction.
		 */
		function moveTankForward() {	
			var currentX = parseFloat($fullTank.css("left").substring(0, $fullTank.css("left").length-2), 10) + wid/2,
				currentY = parseFloat($fullTank.css("top").substring(0, $fullTank.css("top").length-2), 10) + (hght + 44)/2;

			// Use polar coordinates to determine tank's new position on the page.
			newX = currentX + opts.tankSpeed*Math.cos(Math.PI*theta/180) - wid/2;
			newY = currentY + opts.tankSpeed*Math.sin(Math.PI*theta/180) - (hght + 44)/2;

			$fullTank.css({"left": newX + "px", "top": newY + "px"});

			leftPos += opts.tankSpeed;
			drawWheel(0);
			rightPos += opts.tankSpeed;
			drawWheel(1);
		} // End moveTankForward()

		/**
		 * @description Moves tank backward, setting both wheels backward as well.
		 * @notes This function can only be called with the keyboard (not the mouse).
		 */
		function moveTankBackward() {	
			var currentX = parseFloat($fullTank.css("left").substring(0, $fullTank.css("left").length-2), 10) + wid/2,
				currentY = parseFloat($fullTank.css("top").substring(0, $fullTank.css("top").length-2), 10) + (hght + 44)/2;

			// Use polar coordinates to determine tank's new position on the page.
			newX = currentX - opts.tankSpeed*Math.cos(Math.PI*theta/180) - wid/2;
			newY = currentY - opts.tankSpeed*Math.sin(Math.PI*theta/180) - (hght + 44)/2;

			$fullTank.css({"left": newX + "px", "top": newY + "px"});

			leftPos -= opts.tankSpeed;
			drawWheel(0);
			rightPos -= opts.tankSpeed;
			drawWheel(1);
		} // End moveTankBackward()

		/**
		 * @description Advances left wheel, thus turning the tank right if the right wheel is not also advancing.
		 */
		function moveLeftWheelForward() {
			leftPos += opts.tankSpeed;
			drawWheel(0);
			theta += opts.angleSpeed;
	
			if(theta >= 360) {
				theta -= 360;
			}
			
			$fullTank.css("transform", "rotate(" + theta + "deg)");
		} // End moveLeftWheelForward()

		/**
		 * @description Advances right wheel, thus turning the tank left if the left wheel is not also advancing.
		 */
		function moveRightWheelForward() {
			rightPos += opts.tankSpeed;
			drawWheel(1);
			theta -= opts.angleSpeed;

			if(theta < 0) {
				theta += 360;
			}
		
			$fullTank.css("transform", "rotate(" + theta + "deg)");
		} // End moveRightWheelForward()

		/**
		 * @description Delegates tank movement and bullet movement tasks to appropriate helper functions.
		 */
		function moveTank() {
			if(leftMoving && rightMoving) {
				moveTankForward();	
			} else if(leftMoving) {
				moveLeftWheelForward();
			} else if(rightMoving) {
				moveRightWheelForward();
			} else if(backMoving) {
				moveTankBackward();
			}

			// Keep an existing bullet moving.
			if(weaponFired) {
				bulletR += opts.bulletSpeed;
			}

			// Reload the weapon.
			if(bulletR > opts.bulletRange) {
				bulletR = 0;
				weaponFired = false;
				$("#domTankBullet").remove();
			}
			else {
				moveBullet();
			}
		} // End moveTank()

		/**
		 * @description Remove the constructed tank from the DOM, and set page back to its initial state.
		 */
		function unDomTank() {
			if(opts.mouse) {
				$tankControls.off("mousedown", mousePressed);
				$tankControls.off("mouseup", mouseReleased);
				$tankControls.off("contextmenu", preventContext);
			}
		
			if(opts.keys) {
				$(window).off("keydown", keyDown);
				$(window).off("keyup", keyUp);
			}
			
			$fullTank.remove();
			$tankControls.remove();
			$("#domTankBullet").remove();
			thisElm.css("visibility", "visible");
			thisElm.find("*").css("visibility", "visible");
			clearInterval(tankTimer);
		} // End unDomTank()

		function preventContext(e) {
			return false;
		};

		return this; // Allow jQuery method chaining, per usual.
	} // End jQuery.fn.domTank
}(jQuery));
