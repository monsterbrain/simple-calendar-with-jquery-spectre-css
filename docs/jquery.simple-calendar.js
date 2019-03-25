// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.

// Original source code from : https://github.com/brospars/simple-calendar
// Calendar stylings from Spectre.css : https://github.com/picturepan2/spectre
; (function ($, window, document, undefined) {

    "use strict";

    // Create the defaults once
    var pluginName = "simpleCalendar",
        defaults = {
            months: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'], //string of months starting from january
            days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], //string of days starting from sunday
            minDate: "YYYY-MM-DD", // minimum date
            maxDate: "YYYY-MM-DD", // maximum date
            insertEvent: true, // can insert events
            displayEvent: true, // display existing event
            fixedStartDay: true, // Week begin always by monday
            events: [], //List of event dates
            eventsInfo: [], //List of event Info
            selectCallback: function (selDate) { }, // Callback on date select
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.currentDate = new Date();
        this.events = options.events;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        init: function () {
            var container = $(this.element);
            var todayDate = this.currentDate;
            var events = this.events;

            var calendar = $('<div class="calendar"></div>');
            // navbar 
            // var header = $('<header>' +
            //     '<h2 class="month"></h2>' +
            //     '<a class="btn btn-prev" href="#"><</a>' +
            //     '<a class="btn btn-next" href="#">></a>' +
            //     '</header>');
            var header = $('<div class="calendar-nav navbar">'+
                    '<button class= "btn btn-action btn-link btn-lg btn-prev">' +
                    '<i class="icon icon-arrow-left"></i>'+
                    '</button>'+
                    '<div class="navbar-primary">March 2017</div>'+
                    '<button class="btn btn-action btn-link btn-lg btn-next">' +
                        '<i class="icon icon-arrow-right"></i>'+
                    '</button>'+
                '</div>');

            this.updateHeader(todayDate, header);
            calendar.append(header);

            this.buildCalendar(todayDate, calendar);
            container.append(calendar);

            this.bindEvents();
        },

        //Update the current month header
        updateHeader: function (date, header) {
            var monthName = this.settings.months[date.getMonth()];
            monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            header.find('.navbar-primary').html(monthName + ' ' + date.getFullYear());
        },

        testFunction: function (temp) {
            console.log('test function var = ' + temp);
        },

        //Build calendar of a month from date
        buildCalendar: function (fromDate, calendar) {
            var plugin = this;

            calendar.find('.calendar-container').remove();

            var container = $('<div class="calendar-container"></div>');
            var daysHeader = $('<div class="calendar-header"></div>');

            var datesBody = $('<div class="calendar-body"></div>');

            var thead = $('<thead></thead>');
            var tbody = $('<tbody></tbody>');

            //Header day in a week ( (1 to 8) % 7 to start the week by monday)
            for (var i = 1; i <= this.settings.days.length; i++) {
                const day = this.settings.days[i % 7].substring(0, 3);
                daysHeader.append($('<div class="calendar-date">' + day + '</div>'));
            }

            //setting current year and month
            var y = fromDate.getFullYear(), m = fromDate.getMonth();

            //first day of the month
            var firstDay = new Date(y, m, 1);
            //If not monday set to previous monday
            while (firstDay.getDay() != 1) {
                firstDay.setDate(firstDay.getDate() - 1);
            }
            //last day of the month
            var lastDay = new Date(y, m + 1, 0);
            //If not sunday set to next sunday
            while (lastDay.getDay() != 0) {
                lastDay.setDate(lastDay.getDate() + 1);
            }

            var todayStr = (new Date).toDateString();

            //For firstDay to lastDay
            for (var day = firstDay; day <= lastDay; day.setDate(day.getDate())) {

                //For each row
                for (var i = 0; i < 7; i++) {

                    var dateContainer = $('<div class="calendar-date"></div>');
                    var dateItem = $('<button class="date-item">'+day.getDate()+'</button>');

                    if (plugin.settings.displayEvent) {
                        const eventIndex = $.inArray(this.formatToYYYYMMDD(day), plugin.events);
                        if (eventIndex !== -1) {
                            console.log('found event');
                            // for tooltip.
                            dateContainer.addClass('tooltip').attr('data-tooltip', plugin.settings.eventsInfo[eventIndex]);

                            dateItem.addClass('badge');
                        }
                    }

                    //if today is this day
                    if (day.toDateString() === todayStr) {
                        dateItem.addClass('date-today');
                        dateContainer.addClass('tooltip').attr('data-tooltip', 'Today');
                    }
                    //if day is not in this month
                    if (day.getMonth() != fromDate.getMonth()) {
                        dateContainer.addClass("prev-month");
                    }

                    dateContainer.append(dateItem);
                    datesBody.append(dateContainer);

                    day.setDate(day.getDate() + 1);
                }
            }

            datesBody.on('click', '.date-item', function (e) {
                var day = '' + $(e.currentTarget).text(),
                    month = '' + (plugin.currentDate.getMonth() + 1),
                    year = plugin.currentDate.getFullYear();

                if (month.length < 2) month = '0' + month;
                if (day.length < 2) day = '0' + day;

                const selectedDate = [year, month, day].join('-');

                plugin.settings.selectCallback(selectedDate);

                e.preventDefault();
            });            

            container.append(daysHeader);
            container.append(datesBody);
            calendar.append(container);
        },
        //Init global events listeners
        bindEvents: function () {
            var plugin = this;

            //Click previous month
            $('.btn-prev').click(function (e) {
                plugin.currentDate.setMonth(plugin.currentDate.getMonth() - 1);
                plugin.buildCalendar(plugin.currentDate, $(plugin.element).find('.calendar'));
                plugin.updateHeader(plugin.currentDate, $(plugin.element).find('.calendar .calendar-nav'));
                e.preventDefault();
            });

            //Click next month
            $('.btn-next').click(function (e) {
                plugin.currentDate.setMonth(plugin.currentDate.getMonth() + 1);
                plugin.buildCalendar(plugin.currentDate, $(plugin.element).find('.calendar'));
                plugin.updateHeader(plugin.currentDate, $(plugin.element).find('.calendar .calendar-nav'));
                e.preventDefault();
            });
        },
        
        formatToYYYYMMDD: function (date) {
            var d = new Date(date),
                day = '' + d.getDate(),
                month = '' + (d.getMonth() + 1),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
