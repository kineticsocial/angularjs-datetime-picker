(function () {
	'use strict';

	var tmpl = [
	  '<div class="angularjs-datetime-picker">',
	  '  <div class="adp-month">',
	  '    <button type="button" class="adp-prev" ng-click="addMonth(-1)">&laquo;</button>',
	  '    <span title="{{months[mv.month].fullName}}">{{months[mv.month].shortName}}</span> {{mv.year}}',
	  '    <button type="button" class="adp-next" ng-click="addMonth(1)">&raquo;</button>',
	  '  </div>',
	  '  <div class="adp-days" ng-click="setDate($event)">',
	  '    <div class="adp-day-of-week" ng-repeat="dayOfWeek in ::daysOfWeek" title="{{dayOfWeek.fullName}}">{{::dayOfWeek.firstLetter}}</div>',
	  '    <div class="adp-day" ng-show="mv.leadingDays.length < 7" ng-repeat="day in mv.leadingDays">{{::day}}</div>',
	  '    <div class="adp-day selectable" ng-repeat="day in mv.days" ',
	  '      today="{{today}}" d2="{{mv.year + \'-\' + (mv.month + 1) + \'-\' + day}}"',
	  '      ng-class="{',
	  '        selected: (day == selectedDay),',
	  '        today: (today == (mv.year + \'-\' + (mv.month + 1) + \'-\' + day)),',
	  '        weekend: (mv.leadingDays.length + day)%7 == 1 || (mv.leadingDays.length + day)%7 == 0',
	  '      }">',
	  '      {{::day}}',
	  '    </div>',
	  '    <div class="adp-day" ng-show="mv.trailingDays.length < 7" ng-repeat="day in mv.trailingDays">{{::day}}</div>',
	  '  </div>',
	  '  <div class="adp-days" id="adp-time"> ',
	  '    <label class="timeLabel">Time:</label> <span class="timeValue">{{("0"+inputHour).slice(-2)}} : {{("0"+inputMinute).slice(-2)}}</span><br/>',
	  '    <label class="hourLabel">Hour:</label> <input class="hourInput" type="range" min="0" max="23" ng-model="inputHour" ng-change="updateNgModel()" />',
	  '    <label class="minutesLabel">Min:</label> <input class="minutesInput" type="range" min="0" max="59" ng-model="inputMinute"  ng-change="updateNgModel()"/> ',
	  '  </div> ',
	  '  <div class="adp-days" id="clear-date"> ',
	  '    <label class="clear-date-label" ng-click="clearDate()">Clear</label>',
	  '  </div> ',
	  '</div>'].join("\n");

	angular.module('angularjs-datetime-picker', [])
		.factory('DatetimePicker', DatetimePickerFactory)
		.directive('datetimePickerPopup', datetimePickerPopup)
		.directive('datetimePicker', datetimePicker);

	DatetimePickerFactory.$inject = ['$compile', '$document'];
	function DatetimePickerFactory($compile, $document) {
		return DatetimePicker;

		function DatetimePicker(_options) {
			var self = this;
			var popupElement;
			var triggerElement;
			var scope;
			var options;
			var isOpened = false;

			self.triggerElementScope = null;

			self.open = open;
			self.close = close;

			activate();

			function activate() {
				options = _options;
				triggerElement = options.triggerEl;
				self.triggerElementScope = angular.element(triggerElement).scope();

				scope = options.scope || self.triggerElementScope;
				scope.popupCtrl = self;
			}

			function close() {
				$document[0].body.removeEventListener('mousedown', onMousedownOutside);

				if (popupElement) {
					popupElement.removeEventListener('mousedown', onMousedown);
					popupElement.parentElement.removeChild(popupElement);
					popupElement = null;
				}

				isOpened = false;
			}

			function open() {
				if (isOpened)
					return;

				var div = angular.element('<div datetime-picker-popup ng-cloak popup-ctrl="popupCtrl"></div>');

				options.dateFormat && div.attr('date-format', options.dateFormat);
				options.ngModel && div.attr('ng-model', options.ngModel);
				options.year && div.attr('year', parseInt(options.year));
				options.month && div.attr('month', parseInt(options.month));
				options.day && div.attr('day', parseInt(options.day));
				options.hour && div.attr('hour', parseInt(options.hour));
				options.minute && div.attr('minute', parseInt(options.minute));

				if (options.dateOnly === '' || options.dateOnly === true) {
					div.attr('date-only', 'true');
				}
				if (options.closeOnSelect === 'false') {
					div.attr('close-on-select', 'false');
				}
				
				popupElement = $compile(div)(scope)[0];
				popupElement.triggerEl = triggerElement;

				$document[0].body.appendChild(popupElement);

				//show datetimePicker below triggerEl
				var bcr = triggerElement.getBoundingClientRect();

				scope.$apply();

				var datePickerElBcr = popupElement.getBoundingClientRect();

				popupElement.style.position = 'absolute';
				if (bcr.width > datePickerElBcr.width) {
					popupElement.style.left = (bcr.left + bcr.width - datePickerElBcr.width + window.pageXOffset) + 'px';
				} else {
					popupElement.style.left = (bcr.left + window.pageXOffset) + 'px';
				}

				if (bcr.top < 300 || window.innerHeight - bcr.bottom > 300) {
					popupElement.style.top = (bcr.bottom + window.pageYOffset) + 'px';
				} else {
					popupElement.style.top = (bcr.top - datePickerElBcr.height + window.pageYOffset) + 'px';
				}

				$document[0].body.addEventListener('mousedown', onMousedownOutside);
				popupElement.addEventListener('mousedown', onMousedown);

				isOpened = true;
			}

			function onMousedownOutside(e) {
				if (!popupElement)
					return;

				var target = e && e.target;
				if (target.hasAttribute('datetime-picker'))
					return;

				close(popupElement);
			}

			function onMousedown(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
			}
		}
	}
	
	datetimePickerPopup.$inject = ['$locale', 'dateFilter'];
	function datetimePickerPopup($locale, dateFilter) {
		var days, months, daysOfWeek, firstDayOfWeek;

		return {
			restrict: 'A',
			template: tmpl,
			replace: true,
			scope: {
				year: '=',
				month: '=',
				day: '=',
				hour: '=',
				minute: '=',
				dateOnly: '=',
				closeOnSelect: '=',
				popupCtrl: '='
			},
			link: link
		};

		function link(scope, element, attrs) { //jshint ignore:line
			initVars(); //initialize days, months, daysOfWeek, and firstDayOfWeek;

			var dateFormat = attrs.dateFormat || 'short';
			scope.dateFormat = dateFormat;
			scope.months = months;
			scope.daysOfWeek = daysOfWeek;
			scope.inputHour = null;
			scope.inputMinute = null;

			if (scope.dateOnly === true) {
				element[0].querySelector('#adp-time').style.display = 'none';
			}

			scope.$applyAsync(function () {
				if (attrs.ngModel) { // need to parse date string
					var dateStr = '' + (scope.popupCtrl.triggerElementScope.$eval(attrs.ngModel) || '');

					if (dateStr)
						scope.selectedDate = parseDate(dateStr, dateFormat);
				}

				if (!scope.selectedDate || isNaN(scope.selectedDate.getTime())) { // no predefined date
					var today = new Date();
					var year = scope.year || today.getFullYear();
					var month = scope.month ? (scope.month - 1) : today.getMonth();
					var day = scope.day || today.getDate();
					var hour = scope.hour || today.getHours();
					var minute = scope.minute || today.getMinutes();
					scope.selectedDate = new Date(year, month, day, hour, minute, 0);
				}
				scope.inputHour = scope.selectedDate.getHours();
				scope.inputMinute = scope.selectedDate.getMinutes();

				// Default to current year and month
				scope.mv = getMonthView(scope.selectedDate.getFullYear(), scope.selectedDate.getMonth());
				scope.today = dateFilter(new Date(), 'yyyy-M-d');
				if (scope.mv.year == scope.selectedDate.getFullYear() && scope.mv.month == scope.selectedDate.getMonth()) {
					scope.selectedDay = scope.selectedDate.getDate();
				} else {
					scope.selectedDay = null;
				}
			});

			scope.addMonth = addMonth;
			scope.clearDate = clearDate;
			scope.setDate = setDate;
			scope.updateNgModel = updateNgModel;

			scope.$on('$destroy', scope.popupCtrl.close);

			function addMonth(amount) {
				scope.mv = getMonthView(scope.mv.year, scope.mv.month + amount);
			}

			function clearDate() {
				scope.selectedDate = null;

				var elScope = scope.popupCtrl.triggerElementScope;
				elScope.$eval(attrs.ngModel + '= date', { date: null });
				scope.$emit('datetime-picker-changed', null);
			}

			function setDate(evt) {
				var target = angular.element(evt.target)[0];
				if (target.className.indexOf('selectable') !== -1) {
					scope.updateNgModel(parseInt(target.innerHTML));
					if (scope.closeOnSelect !== false) {
						scope.popupCtrl.close();
					}
				}
			}

			function updateNgModel(day) {
				day = day ? day : scope.selectedDate.getDate();
				scope.selectedDate = new Date(
					scope.mv.year,
					scope.mv.month,
					day,
					scope.inputHour,
					scope.inputMinute,
					0
				);
				scope.selectedDay = scope.selectedDate.getDate();
				if (attrs.ngModel) {
					var elScope = scope.popupCtrl.triggerElementScope, dateValue;
					if (elScope.$eval(attrs.ngModel) && elScope.$eval(attrs.ngModel).constructor.name === 'Date') {
						dateValue = new Date(dateFilter(scope.selectedDate, scope.dateFormat));
					} else {
						dateValue = dateFilter(scope.selectedDate, scope.dateFormat);
					}
					elScope.$eval(attrs.ngModel + '= date', { date: dateValue });

					scope.$emit('datetime-picker-changed', dateValue);
				}
			}
		}

		function initVars() {
			days = [], months = []; daysOfWeek = [], firstDayOfWeek = 0;
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
					firstLetter: day.substr(0, 1)
				});
			}
			firstDayOfWeek = 0;
		}

		function getMonthView(year, month) {
			if (month > 11) {
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
				trailingDays = trailingDays.slice(0, trailingDays.length - 7);
			}

			return {
				year: year,
				month: month,
				days: days.slice(0, daysInMonth),
				leadingDays: days.slice(-leadingDays - (31 - daysInLastMonth), daysInLastMonth),
				trailingDays: trailingDays
			};
		}
	}
	
	datetimePicker.$inject = ['$parse', 'DatetimePicker', '$timeout'];
	function datetimePicker($parse, DatetimePicker, $timeout) {
		return {
			// An ngModel is required to get the controller argument
			require: 'ngModel',
			link: function (scope, element, attrs, ctrl) {
				var datetimePicker = new DatetimePicker({
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

				// Attach validation watcher
				scope.$watch(attrs.ngModel, function (value) {
					if (!value || value == '') {
						return;
					}
					// The value has already been cleaned by the above code
					var date = new Date(value);
					ctrl.$setValidity('date', !date ? false : true);
					var now = new Date();
					if (attrs.hasOwnProperty('futureOnly')) {
						ctrl.$setValidity('future-only', date < now ? false : true);
					}
				});

				element[0].addEventListener('click', function () {
					datetimePicker.open();
				});

				element[0].addEventListener('blur', function () {
					$timeout(function() {
						 datetimePicker.close();
					}, 0);
				});
			}
		};
	};

	function getTimezoneOffset(date) {
		(typeof date == 'string') && (date = new Date(date));
		var jan = new Date(date.getFullYear(), 0, 1);
		var jul = new Date(date.getFullYear(), 6, 1);
		var stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
		var isDST = date.getTimezoneOffset() < stdTimezoneOffset;
		var offset = isDST ? stdTimezoneOffset - 60 : stdTimezoneOffset;
		var diff = offset >= 0 ? '-' : '+';

		return diff + pad(Math.abs(offset) / 60, 2) + ':' + pad(Math.abs(offset % 60), 2);
	}

	function parseDate(src, format) {
		var dateStr = '';
		format = format.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
		var formatRegex = format;

		var dateParts = [
			{ key: 'day', spec: 'd', s: 0, e: 0 },
			{ key: 'month', spec: 'M', s: 0, e: 0 },
			{ key: 'year', spec: 'y', s: 0, e: 0 }
		];

		for (var i = 0; i < dateParts.length; i++) {
			var matcher = new RegExp('[' + dateParts[i].spec + ']+');

			var match = matcher.exec(format);

			dateParts[i].s = match.index;
			dateParts[i].e = match.index + match[0].length;
		}
		dateParts = dateParts
			.sort(function (one, other) { return other.s - one.s; });

		for (var i = 0; i < dateParts.length; i++)
			formatRegex = formatRegex.slice(0, dateParts[i].s) + '([0-9]+)' + formatRegex.slice(dateParts[i].e);

		formatRegex = new RegExp(formatRegex);

		var matches = formatRegex.exec(src);
		dateParts.reverse();
		var date = {
			day: 0,
			month: 0,
			year: 0
		}
		for (var i = 0; i < dateParts.length; i++)
			date[dateParts[i].key] = +matches[i + 1];

		dateStr = pad(date.year, 4) + '-' + pad(date.month, 2) + '-' + pad(date.day, 2);

		if (!dateStr.match(/[0-9]{2}:/)) // if no time is given, add 00:00:00 at the end
			dateStr += " 00:00:00";

		dateStr = dateStr.replace(/([0-9]{2}-[0-9]{2})-([0-9]{4})/, '$2-$1');      //mm-dd-yyyy to yyyy-mm-dd
		dateStr = dateStr.replace(/([\/-][0-9]{2,4})\ ([0-9]{2}\:[0-9]{2}\:)/, '$1T$2'); //reformat for FF
		dateStr = dateStr.replace(/EDT|EST|CDT|CST|MDT|PDT|PST|UT|GMT/g, ''); //remove timezone
		dateStr = dateStr.replace(/\s*\(\)\s*/, '');                          //remove timezone
		dateStr = dateStr.replace(/[\-\+][0-9]{2}:?[0-9]{2}$/, '');           //remove timezone
		dateStr += getTimezoneOffset(dateStr);
		var d = new Date(dateStr);
		return new Date(
			d.getFullYear(),
			d.getMonth(),
			d.getDate(),
			d.getHours(),
			d.getMinutes(),
			d.getSeconds()
		);
	}

	function pad(val, nchar) {
		return ('0000' + val).slice(-nchar);
	}
})();
