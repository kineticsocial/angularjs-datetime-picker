(function() {
  'use strict';

  angular.module('angularjs-datetime-picker', []);

  var getTimezoneOffset = function(date) {
    (typeof date == 'string')  && (date = new Date(date));
    var jan = new Date(date.getFullYear(), 0, 1);
    var jul = new Date(date.getFullYear(), 6, 1);
    var stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    var isDST = date.getTimezoneOffset() < stdTimezoneOffset;
    var offset = isDST ? stdTimezoneOffset - 60 : stdTimezoneOffset;
    var diff = offset >=0 ? '-' : '+';
    return diff +
      ("0"+ (offset / 60)).slice(-2) + ':' +
      ("0"+ (offset % 60)).slice(-2);
  };

  var DatetimePicker = function($compile, $document, $controller){
    var datetimePickerCtrl = $controller('DatetimePickerCtrl'); //directive controller
    return {
      open: function(options) {
        datetimePickerCtrl.openDatetimePicker(options);
      },
      close: function() {
        datetimePickerCtrl.closeDatetimePicker();
      }
    };
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
      var div = angular.element('<div datetime-picker-popup ng-cloak></div>');
      options.dateFormat && div.attr('date-format', options.dateFormat);
      options.ngModel  && div.attr('ng-model', options.ngModel);
      options.year     && div.attr('year', parseInt(options.year));
      options.month    && div.attr('month', parseInt(options.month));
      options.day      && div.attr('day', parseInt(options.day));
      options.hour     && div.attr('hour', parseInt(options.hour));
      options.minute   && div.attr('minute', parseInt(options.minute));
      if (options.dateOnly === '' || options.dateOnly === true) {
        div.attr('date-only', 'true');
      }
      if (options.closeOnSelect === 'false') {
        div.attr('close-on-select', 'false');
      }

      var triggerEl = options.triggerEl;
      options.scope = options.scope || angular.element(triggerEl).scope();
      datetimePickerEl = $compile(div)(options.scope)[0];
      datetimePickerEl.triggerEl = options.triggerEl;

      $document[0].body.appendChild(datetimePickerEl);

      //show datetimePicker below triggerEl
      var bcr = triggerEl.getBoundingClientRect();
      datetimePickerEl.style.position='absolute';
      datetimePickerEl.style.left= (bcr.left + window.scrollX) + 'px';

      options.scope.$apply();

      var datePickerElBcr = datetimePickerEl.getBoundingClientRect();

      if (bcr.top < 300 || window.innerHeight - bcr.bottom > 300) {
        datetimePickerEl.style.top = (bcr.bottom + window.scrollY) + 'px';
      } else {
        datetimePickerEl.style.top = (bcr.top - datePickerElBcr.height + window.scrollY) + 'px';
      }

      $document[0].body.addEventListener('click', this.closeDatetimePicker);
    };

    this.closeDatetimePicker = function(evt) {
      var target = evt && evt.target;
      var popupEl = $document[0].querySelector('div[datetime-picker-popup]');
      if (evt && target) {
        if (target.hasAttribute('datetime-picker')) {  // element with datetimePicker behaviour
          // do nothing
        } else if (popupEl && popupEl.contains(target)) { // datetimePicker itself
          // do nothing
        } else {
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
    '  <div class="adp-days" ng-click="setDate($event)">',
    '    <div class="adp-day-of-week" ng-repeat="dayOfWeek in ::daysOfWeek" title="{{dayOfWeek.fullName}}">{{::dayOfWeek.firstLetter}}</div>',
    '    <div class="adp-day" ng-repeat="day in mv.leadingDays">{{::day}}</div>',
    '    <div class="adp-day selectable" ng-repeat="day in mv.days" ',
    '      ng-class="{selected: (day == selectedDay)}">{{::day}}</div>',
    '    <div class="adp-day" ng-repeat="day in mv.trailingDays">{{::day}}</div>',
    '  </div>',
    '  <div class="adp-days" id="adp-time"> ',
    '    Time : {{("0"+inputHour).slice(-2)}} : {{("0"+inputMinute).slice(-2)}} <br/>',
    '    <label>Hour:</label> <input type="range" min="0" max="23" ng-model="inputHour" ng-change="updateNgModel()" />',
    '    <label>Min.:</label> <input type="range" min="0" max="59" ng-model="inputMinute"  ng-change="updateNgModel()"/> ',
    '  </div> ',
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
      if (month>11) {
        year++;
      } else if (month < 0) {
        year--;
      }
      month = (month + 12) % 12;
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
      initVars(); //initialize days, months, daysOfWeek, and firstDayOfWeek;
      var dateFormat = attrs.dateFormat || 'short';
      scope.months = months;
      scope.daysOfWeek = daysOfWeek;
      scope.inputHour;
      scope.inputMinute;

      if (scope.dateOnly === true){
        element[0].querySelector('#adp-time').style.display = 'none';
      }

      scope.$applyAsync( function() {
        ctrl.triggerEl = angular.element(element[0].triggerEl);
        if (attrs.ngModel) { // need to parse date string
          var dateStr = ''+ctrl.triggerEl.scope().$eval(attrs.ngModel);
          if (dateStr) {
            if (!dateStr.match(/[0-9]{2}:/)) {  // if no time is given, add 00:00:00 at the end
              dateStr += " 00:00:00";
            }
            dateStr = dateStr.replace(/([0-9]{2}-[0-9]{2})-([0-9]{4})/,'$2-$1');      //mm-dd-yyyy to yyyy-mm-dd
            dateStr = dateStr.replace(/([\/-][0-9]{2,4})\ ([0-9]{2}\:[0-9]{2}\:)/,'$1T$2'); //reformat for FF
            dateStr = dateStr.replace(/EDT|EST|CDT|CST|MDT|PDT|PST|UT|GMT/g,''); //remove timezone
            dateStr = dateStr.replace(/\s*\(\)\s*/,'');                          //remove timezone
            dateStr = dateStr.replace(/[\-\+][0-9]{2}:?[0-9]{2}$/,'');           //remove timezone
            dateStr += getTimezoneOffset(dateStr);
            var d = new Date(dateStr);
            scope.selectedDate = new Date(
              d.getFullYear(),
              d.getMonth(),
              d.getDate(),
              d.getHours(),
              d.getMinutes(),
              d.getSeconds()
            );
          }
        }

        if (!scope.selectedDate || isNaN(scope.selectedDate.getTime())) { // no predefined date
          var today = new Date();
          var year = scope.year || today.getFullYear();
          var month = scope.month ? (scope.month-1) : today.getMonth();
          var day = scope.day || today.getDate();
          var hour = scope.hour || today.getHours();
          var minute = scope.minute || today.getMinutes();
          scope.selectedDate = new Date(year, month, day, hour, minute, 0);
        }
        scope.inputHour   = scope.selectedDate.getHours();
        scope.inputMinute = scope.selectedDate.getMinutes();

        // Default to current year and month
        scope.mv = getMonthView(scope.selectedDate.getFullYear(), scope.selectedDate.getMonth());
        if (scope.mv.year == scope.selectedDate.getFullYear() && scope.mv.month == scope.selectedDate.getMonth()) {
          scope.selectedDay = scope.selectedDate.getDate();
        } else {
          scope.selectedDay = null;
        }
      });

      scope.addMonth = function (amount) {
        scope.mv = getMonthView(scope.mv.year, scope.mv.month + amount);
      };

      scope.setDate = function (evt) {
        var target = angular.element(evt.target)[0];
        if (target.className.indexOf('selectable')) {
          scope.updateNgModel(parseInt(target.innerHTML));
          if (scope.closeOnSelect !== false) {
            ctrl.closeDatetimePicker();
          }
        }
      };

      scope.updateNgModel = function(day) {
        day = day ? day : scope.selectedDate.getDate();
        scope.selectedDate = new Date(
          scope.mv.year, scope.mv.month, day, scope.inputHour, scope.inputMinute, 0
        );
        scope.selectedDay = scope.selectedDate.getDate();
        if (attrs.ngModel) {
          //console.log('attrs.ngModel',attrs.ngModel);
          var elScope = ctrl.triggerEl.scope(), dateValue;
          if (elScope.$eval(attrs.ngModel) && elScope.$eval(attrs.ngModel).constructor.name === 'Date') {
            dateValue = new Date(dateFilter(scope.selectedDate, dateFormat));
          } else {
            dateValue = dateFilter(scope.selectedDate, dateFormat);
          }
          elScope.$eval(attrs.ngModel + '= date', {date: dateValue});
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
        minute: '=',
        dateOnly: '=',
        closeOnSelect: '='
      },
      link: linkFunc
    };
  };
  datetimePickerPopup.$inject = ['$locale', 'dateFilter'];
  angular.module('angularjs-datetime-picker').directive('datetimePickerPopup', datetimePickerPopup);

  var datetimePicker  = function($parse, DatetimePicker) {
    return {
      // An ngModel is required to get the controller argument
      require: 'ngModel',
      link: function(scope, element, attrs, ctrl) {
        // Attach validation watcher
        scope.$watch(attrs.ngModel, function(value) {
          if( !value || value == '' ){
            return;
          }
          // The value has already been cleaned by the above code
          var date = new Date(value);
          ctrl.$setValidity('date', !date? false : true);
          var now = new Date();
          if( attrs.hasOwnProperty('futureOnly') ){
            ctrl.$setValidity('future-only', date < now? false : true);
          }
        });

        element[0].addEventListener('click', function() {
          DatetimePicker.open({
            triggerEl: element[0],
            dateFormat: attrs.dateFormat,
            ngModel: attrs.ngModel,
            year: attrs.year,
            month: attrs.month,
            day: attrs.day,
            hour: attrs.hour,
            minute: attrs.minute,
            dateOnly: attrs.dateOnly,
            futureOnly: attrs.futureOnly,
            closeOnSelect: attrs.closeOnSelect
          });
        });
      }
    };
  };
  datetimePicker.$inject=['$parse', 'DatetimePicker'];
  angular.module('angularjs-datetime-picker').directive('datetimePicker', datetimePicker);

})();
