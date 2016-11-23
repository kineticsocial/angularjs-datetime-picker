Simple Date / DateTime Picker For AngularJS
===========================================

No JQuery, No Bootstrap, Just AngularJS (ver. 1.4+)

[DEMO](https://rawgit.com/mani-s17/angularjs-datetime-picker/master/index.html)
[![Imgur](http://i.imgur.com/UJfYMN6.png?1)](https://rawgit.com/mani-s17/angularjs-datetime-picker/master/index.html)

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
  -  day: optional, day selected, e.g. 31
  -  hour: optional, hour selected, 23
  -  minute: optional, minute selected, 59
  -  date-only: optional, if set, timepicker will be hidden
  -  future-only: optional, if set, Date which is older than today's Date will be not be selectable (Past time for same date is not handled)
  -  start-date optional, if set, date which is on or after start-date will be selectable
  -  end-date optional, if set, date which is on or before end-date will be selectable
  -  start-date & end-date: optional, if set, date which is in between the range will only be selectable
  Note:
  future-only tag has more precedence than start-date & end-date tags

Examples
--------

    <input ng-model="date0" datetime-picker date-only />

    <input ng-model="date1" datetime-picker date-only future-only />

    <input ng-model="date6" datetime-picker start-date="11-20-2016" size="30" />

    <input ng-model="date6" datetime-picker end-date="02-25-2017" size="30" />

    <input ng-model="date6" datetime-picker start-date="11-20-2016" end-date="02-25-2017" size="30" />

    <input ng-model="date2" datetime-picker date-format="yyyy-MM-dd" date-only />

    <input ng-model="date3" datetime-picker date-format="yyyy-MM-dd HH:mm:ss" />

    <input ng-model="date4" datetime-picker hour="23" minute='59'/>

    <input ng-model="date5" datetime-picker date-format="yyyy-MM-dd HH:mm:ss" year="2014" month="12" day="31" />


This project has been forked from [KineticSocial-angularjs-datetime-picker](https://github.com/kineticsocial/angularjs-datetime-picker) an inactive project.
We are actively working on this project to enhance & fix issues.
