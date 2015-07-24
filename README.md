Simple DateTime Piker For AngularJS
===================================

No JQuery, No Bootstrap, Just AngularJS

[DEMO](https://rawgit.com/kineticsocial/angularjs-datetime-picker/master/index.html)
[![Imgur](http://i.imgur.com/UJfYMN6.png?1)](https://rawgit.com/kineticsocial/angularjs-datetime-picker/master/index.html)

To Get Started
--------------

For Bower users,

  `$ bower install angularjs-datetime-picker`

1. Include `angularjs-datetime-picker.js` and `angularjs-datetime-picker.css`

        <link rel="stylesheet" href="angularjs-datetime-picker.css" />
        <script src="angularjs-datetime-picker.js"></script>

2. add it as a dependency

        var myApp = angular.module('myApp', ['angularjs-datetime-picker']);

3. Use it

        <input datetime-picker ng-model="model" />

Attributes
------------

  -  date-format: optional, date format e.g. 'yyyy-MM-dd'
  -  year: optional, year selected, e.g. 2015
  -  month: optional, month selected, e.g. 5
  -  day: optiona, day selected, e.g. 31
  -  hour: optional, hour selected, 23
  -  minute: optional, minute selected, 59
  -  date-only: optional, if set, timepicker will be hidden
  -  future-only: optional, if set, forces validation errors on dates earlier than now

Examples
--------

    <input ng-model="date1" datetime-picker date-only />

    <input ng-model="date1" datetime-picker date-only future-only />

    <input ng-model="date2" datetime-picker date-format="yyyy-MM-dd" date-only />

    <input ng-model="date3" datetime-picker date-format="yyyy-MM-dd HH:mm:ss" />

    <input ng-model="date4" datetime-picker hour="23" minute='59'/>

    <input ng-model="date5" datetime-picker date-format="yyyy-MM-dd HH:mm:ss" year="2014" month="12" day="31" />

