(function() {
  'use strict';

  angular.module('angularjs-datetime-picker', []);

  var DatetimePicker = function($compile, $document, $controller){
    var datetimePickerCtrl = $controller('DatetimePickerCtrl'); //directive controller
    return {
      open: function(options) {
        datetimePickerCtrl.openDatetimePicker(options);
      },
      close: function() {
        datetimePickerCtrl.closeDatetimePicker();
      }
    }
  };
  DatetimePicker.$inject = ['$compile', '$document', '$controller'];
  angular.module('angularjs-datetime-picker').factory('DatetimePicker', DatetimePicker);

  var DatetimePickerCtrl = function($compile, $document) {
    var datetimePickerEl;
    var _this = this;
    var removeEl = function(el) {
      el && el.remove();
      $document[0].body.removeEventListener('click', _this.closeDatetimePicker);
    };

    this.openDatetimePicker = function(options) {
      this.closeDatetimePicker();
      var div = angular.element('<div datetime-picker-popup ng-cloak></div');
      options.dateFormat && div.attr('date-format', options.dateFormat);
      options.ngModel && div.attr('ng-model', options.ngModel);
      options.year    && div.attr('year', parseInt(options.year));
      options.month   && div.attr('month', parseInt(options.month));
      options.day     && div.attr('day', parseInt(options.day));
      options.hour    && div.attr('hour', parseInt(options.hour));
      options.minute  && div.attr('minute', parseInt(options.minute));

      var triggerEl = options.triggerEl;
      options.scope = options.scope || angular.element(triggerEl).scope();
      datetimePickerEl = $compile(div)(options.scope)[0];
      datetimePickerEl.triggerEl = options.triggerEl;
      $document[0].body.appendChild(datetimePickerEl);

      //show datetimePicker below triggerEl
      var bcr = triggerEl.getBoundingClientRect();
      datetimePickerEl.style.position='absolute';
      datetimePickerEl.style.top = (bcr.bottom + window.scrollY) + 'px';
      datetimePickerEl.style.left= (bcr.left + window.scrollX) + 'px';

      options.scope.$applyAsync();
      $document[0].body.addEventListener('click', this.closeDatetimePicker);
    };

    this.closeDatetimePicker = function(evt) {
      var target = evt && evt.target;
      var popupEl = $document[0].querySelector('div[datetime-picker-popup]');

      if (target) {
        if (target.hasAttribute('datetime-picker'));  // element with datetimePicker behaviour
        else if (popupEl && popupEl.contains(target)); // datetimePicker itself
        else {
          removeEl(popupEl);
        }
      } else {
        removeEl(popupEl);
      }
    }
  };
  DatetimePickerCtrl.$inject = ['$compile', '$document'];
  angular.module('angularjs-datetime-picker').controller('DatetimePickerCtrl', DatetimePickerCtrl);

  var tmpl = [
    '<div class="angularjs-datetime-picker">' ,
    '  <div class="adp-month">',
    '    <button type="button" class="adp-prev" ng-click="addMonth(-1)">&laquo;</button>',
    '    <span title="{{months[mv.month].fullName}}">{{months[mv.month].shortName}}</span> {{mv.year}}',
    '    <button type="button" class="adp-next" ng-click="addMonth(1)">&raquo;</button>',
    '  </div>',
    '  <div class="adp-days" ng-click="pickDay($event)">',
    '    <div class="adp-day-of-week" ng-repeat="dayOfWeek in ::daysOfWeek" title="{{dayOfWeek.fullName}}">{{::dayOfWeek.firstLetter}}</div>',
    '    <div class="adp-day" ng-repeat="day in mv.leadingDays">{{::day}}</div>',
    '    <div class="adp-day" ng-repeat="day in mv.days" date="{{::mv.year}}-{{::mv.month}}-{{::day}}" ',
    '      ng-class="{selected: (day == selectedDay)}">{{::day}}</div>',
    '    <div class="adp-day" ng-repeat="day in mv.trailingDays">{{::day}}</div>',
    '    <input type="range" min="0" max="1439" ng-model="minutes" /> {{hhmm(minutes)}} ',
    '  </div>',
    '</div>'].join("\n");

  var datetimePickerPopup = function($locale, dateFilter){
    var days, months, daysOfWeek, firstDayOfWeek;

    var initVars = function() {
      days =[], months=[]; daysOfWeek=[], firstDayOfWeek=0;
      for (var i = 1; i <= 31; i++) {
        days.push(i);
      }

      for (var i = 0; i < 12; i++) { //jshint ignore:line
        months.push({
          fullName: $locale.DATETIME_FORMATS.MONTH[i],
          shortName: $locale.DATETIME_FORMATS.SHORTMONTH[i]
        });
      }

      for (var i = 0; i < 7; i++) { //jshint ignore:line
        var day = $locale.DATETIME_FORMATS.DAY[(i + firstDayOfWeek) % 7];

        daysOfWeek.push({
          fullName: day,
          firstLetter: day.substr(0, 2)
        });
      }
      firstDayOfWeek = $locale.DATETIME_FORMATS.FIRSTDAYOFWEEK || 0;
    };

    var getMonthView = function(year, month) {
      var firstDayOfMonth = new Date(year, month, 1),
        lastDayOfMonth = new Date(year, month + 1, 0),
        lastDayOfPreviousMonth = new Date(year, month, 0),
        daysInMonth = lastDayOfMonth.getDate(),
        daysInLastMonth = lastDayOfPreviousMonth.getDate(),
        dayOfWeek = firstDayOfMonth.getDay(),
        leadingDays = (dayOfWeek - firstDayOfWeek + 7) % 7 || 7, // Ensure there are always leading days to give context
        trailingDays = days.slice(0, 6 * 7 - (leadingDays + daysInMonth));
      if (trailingDays.length > 7) {
        trailingDays = trailingDays.slice(0, trailingDays.length-7);
      }

      return {
        year: year,
        month: month,
        days: days.slice(0, daysInMonth),
        leadingDays: days.slice(- leadingDays - (31 - daysInLastMonth), daysInLastMonth),
        trailingDays: trailingDays
      };
    };

    var linkFunc = function(scope, element, attrs, ctrl) { //jshint ignore:line
      console.log('ctrl.date', ctrl.date);
      initVars(); //initialize days, months, daysOfWeek, and firstDayOfWeek;
      var dateFormat = attrs.dateFormat || 'short';
      scope.months = months;
      scope.daysOfWeek = daysOfWeek;

      scope.$applyAsync( function() {
        ctrl.triggerEl = angular.element(element[0].triggerEl);
        if (attrs.ngModel) {
          var dateStr = ctrl.triggerEl.scope()[attrs.ngModel];
          if (dateStr) {
            (dateStr.indexOf(':') == -1) && (dateStr += ' 00:00:00');
            scope.selectedDate = new Date(dateStr);
          }
        }
        if (!scope.selectedDate || isNaN(scope.selectedDate.getTime())) { // no predefined date
          var today = new Date();
          console.log('scope', scope);
          var year = scope.year || today.getFullYear();
          var month = scope.month ? (scope.month-1) : today.getMonth();
          var day = scope.day || today.getDate();
          var hour = scope.hour || today.getHours();
          var minute = scope.minute || today.getMinutes();
          scope.selectedDate = new Date(year, month, day, hour, minute, 0);
        } 
        scope.minutes = scope.selectedDate.getHours()*60 + scope.selectedDate.getMinutes();

        // Default to current year and month
        scope.mv = getMonthView(scope.selectedDate.getFullYear(), scope.selectedDate.getMonth());
        if (scope.mv.year == scope.selectedDate.getFullYear() && scope.mv.month == scope.selectedDate.getMonth()) {
          scope.selectedDay = scope.selectedDate.getDate();
        } else {
          scope.selectedDay = null;
        }
      });

      scope.hhmm = function(minutes) {
        var date = new Date(1970,1,1).setSeconds(minutes*60);
        return dateFilter(date, 'HH:mm');
      };

      scope.addMonth = function (amount) {
        scope.mv = getMonthView(scope.mv.year, scope.mv.month + amount);
      };

      scope.pickDay = function (evt) {
        var target = angular.element(evt.target)[0];

        if (target.hasAttribute('date')) { // selectable date
          scope.selectedDate = new Date(target.getAttribute('date') + ' '+scope.hhmm(scope.minutes));
          scope.selectedDay = scope.selectedDate.getDate();
          if (attrs.ngModel) {
            ctrl.triggerEl.scope()[attrs.ngModel] = dateFilter(scope.selectedDate, dateFormat);
          }
        }
      };

      scope.$on('$destroy', ctrl.closeDatetimePicker); 
    };

    return {
      restrict: 'A',
      template: tmpl,
      controller: 'DatetimePickerCtrl',
      replace: true,
      scope: {
        year: '=',
        month: '=',
        day: '=',
        hour: '=',
        minute: '='
      },
      link: linkFunc
    };
  };
  datetimePickerPopup.$inject = ['$locale', 'dateFilter'];
  angular.module('angularjs-datetime-picker').directive('datetimePickerPopup', datetimePickerPopup);

  var datetimePicker  = function($parse, DatetimePicker) {
    return {
      link: function(scope, element, attrs) {
        element[0].addEventListener('click', function() {
          DatetimePicker.open({
            triggerEl: element[0],
            dateFormat: attrs.dateFormat,
            ngModel: attrs.ngModel,
            year: attrs.year,
            month: attrs.month,
            day: attrs.day,
            hour: attrs.hour,
            minute: attrs.minute
          });
        });
      }
    };
  };
  datetimePicker.$inject=['$parse', 'DatetimePicker'];
  angular.module('angularjs-datetime-picker').directive('datetimePicker', datetimePicker);

})();
