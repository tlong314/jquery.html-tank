# jquery.domTank

A jQuery plugin for turning any HTML element into a movable tank.

## Usage

Include an external script reference to the jquery.domTank.js file after your jQuery reference. To turn a DOM element into a tank, reference the element with jQuery and apply .domTank(); to resulting object:

```
$("#myDiv").domTank();
```

If you want to apply options, supply them as an argument in the domTank() method call, in the form of key-value pairs of an object:

```
$("#myDiv").domTank({
    bulletSpeed : 2,
    keys: true,
    appendControlsTo: $("#myOtherDiv")
  });
```

## Options

tankSpeed {number} - The number of pixels per animation call that the tank should move forward when advancing or move backward when in reverse. Default is 1.

angleSpeed {number} - The number of degrees (not radians) that the tank angle will change per animation call when turning left or right. Default is 1.

bulletSpeed {number} - The number of pixels each bullet will move per animation call. Default is 5.

wheelsCss {Object} - An object defining any specific CSS styles to be applied to the tank wheels. Same format as the argument object sent into a standard jQuery .css() (mutator/setter) call. Default is {}.

weaponCss {Object} - An object defining any specific CSS styles to be applied to the tank gun. Same format as the argument object sent into a standard jQuery .css() (mutator/setter) call. Default is {}.

controlsCss {Object} - An object defining any specific CSS styles to be applied to the DOM element to be used for the mouse controls. Same format as the argument object sent into a standard jQuery .css() (mutator/setter) call. Default is {}.

tankCSS {Object} - An object defining any specific CSS styles to be applied to the main tank. Same format as the argument object sent into a standard jQuery .css() (mutator/setter) call. Default is {}.

controlsHtml {string} - The HTML to be displayed inside the controls element. This can be plain text or formatted HTML. Default is '`Click/right click in this box<br/><br/>to drive the tank."`

keys {boolean} - Whether or not the use should be able to move the tank with the keyboard. Default is true.

mouse {boolean} - Whether or not the use should be able to move the tank with the mouse. Default is true.

timerSpeed {number} - The delay (in milliseconds) between animation calls. Default is 20.

controls {Object | string} -  A DOM element (or a jQuery object representing one) or a string selector representing a single DOM element to be used as the mouse controls rather than the default of constructing a new one. Default is null.

appendControlsTo {Object | string} - A DOM element (or a jQuery object representing one) or a string selector representing a single DOM element to be used as a parent node to hold the mouse controls. 

## License

jQuery.domTank is available for use under the MIT license.
