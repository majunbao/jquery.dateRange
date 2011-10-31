;(function($) {
    $.dateRange = function(el, options) {

        var defaults = {

            days : ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
			months : ["January","February","March","April","May","June","July","August","September","October","November","December"],
			calendarClass : "calendar",
			containerClass : "calendarContainer",
			prevButtonText : 'Prev',
			nextButtonText : 'Next',
			prevButtonClass : 'prev',
			nextButtonClass : 'next',
			dayAbbrLength : 2,
			dayDisabledClass : "disabled",
			dayActiveClass : "active",
			selectedClass : "selected",
			dateSeparator : " - ",
			monthFirst : true,
			readOnly : true,
        }

        var plugin = this;
        plugin.settings = {}

        var init = function() {

            plugin.settings = $.extend({}, defaults, options);
            plugin.el = el;
			
			var onCalendar, activeElement, created = false;
            var changed = false;
			
			if(plugin.settings.readOnly){
				el.attr("readonly", "readonly");
			}
			
			el.focus(function() {
				activeElement = $(this);
                var startCalendar, endCalendar;                

                var calendars = $('.'+plugin.settings.calendarClass);
			    if(activeElement.val() && activeElement.val() != getCalendarDate(calendars.first()) + plugin.settings.dateSeparator + getCalendarDate(calendars.last())){
                    changed = true;
                }          

				if(created && !changed){

					$('.' + plugin.settings.containerClass).show();

				}else if(created && changed){

                    var arr = activeElement.val().split(plugin.settings.dateSeparator);
                    var startDate = arr[0].split("/");
                    var endDate = arr[1].split("/");
                    startCalendar = new Date();
                    endCalendar = new Date();
                    startCalendar.setFullYear(startDate[2], startDate[0] -1, startDate[1]);
                    endCalendar.setFullYear(endDate[2], endDate[0] -1, endDate[1]);
                    var calendarContainer = $('.' + plugin.settings.containerClass);
                    calendarContainer.replaceWith(getCalendarContainer(startCalendar, endCalendar));
                    changed = false;

                }else{

					startCalendar = new Date();
					endCalendar = new Date();
					endCalendar.setMonth(startCalendar.getMonth()+1);
					$('body').append(getCalendarContainer(startCalendar, endCalendar));
					created = true;
				}

				$('.' + plugin.settings.containerClass).css({
						'left' : activeElement.offset().left, 'top' : (activeElement.offset().top + activeElement.outerHeight())
				});
			});
			
			el.blur(function() {
				if(created && !onCalendar){
					$('.' + plugin.settings.containerClass).hide();
				}
			});
			
			$('.' + plugin.settings.dayActiveClass).live('click', function() {
				var currentCalendar = $(this).parents('.' + plugin.settings.calendarClass);				
				var day = $(this).html();
				currentCalendar.attr("data-day", day);				
				currentCalendar.find('.' + plugin.settings.selectedClass).removeClass(plugin.settings.selectedClass);											   
				$(this).addClass(plugin.settings.selectedClass);				
				updateValue(activeElement);
			});
			
			$('.'+plugin.settings.containerClass).live('mouseenter', function() {
    			onCalendar = true;
			}).live('mouseleave',function(){
				onCalendar = false;
				activeElement.focus();
			});
			
			$('.' + plugin.settings.prevButtonClass + ', ' + '.' + plugin.settings.nextButtonClass).live('click', function() {
				var calendar = $(this).parent('.' + plugin.settings.calendarClass);
				var month = calendar.attr("data-month");
				var year = calendar.attr("data-year");
				var day = calendar.attr("data-day");
				if($(this).hasClass(plugin.settings.prevButtonClass)){
					month-=2;
				}
				switch(true){
					case(month <= 0):
						year--;
						month = 11;
					break;
					case(month >= 12):
						year++;
						month = 0;
					break;
				}
				var newCalendar = new Date(year, month, day);
				calendar.replaceWith(getCalendar(newCalendar));
				updateValue(activeElement);
			});
        }

        var getCalendarContainer = function(startCalendar, endCalendar) {
            return '<div class="' + plugin.settings.containerClass + '">' +
							getCalendar(startCalendar) + getCalendar(endCalendar) + '</div>';
        }

        var getCalendar = function(date) {
			var i, j=0;
			var firstDayOfMonth = getFirstDayOfMonth(date.getMonth(), date.getFullYear());
			
            var calendar = '<div data-month="' + (date.getMonth()+1) + '" data-year="' + date.getFullYear() +
							'" data-day="' + date.getDate() + '" class="' + plugin.settings.calendarClass + '">' +
							'<span role="button" class="'+ plugin.settings.prevButtonClass +
							'">'+ plugin.settings.prevButtonText +'</span><span role="button" class="'+ 
							plugin.settings.nextButtonClass +'">'+ plugin.settings.nextButtonText +'</span><table><caption>' +
							plugin.settings.months[date.getMonth()] + ' ' + date.getFullYear() + '</caption><thead><tr>';
							
			for(i = 0; i < plugin.settings.days.length; i++){
				calendar += '<th scope="col"><abbr title="' + plugin.settings.days[i] + '">' +
				plugin.settings.days[i].substring(0,plugin.settings.dayAbbrLength) + '</abbr></th>';
			}
			
			calendar += '</tr></thead><tbody><tr>';
			
			for(i = firstDayOfMonth -1; i >= 0; i--){
				calendar += '<td class="'+ plugin.settings.dayDisabledClass +'">' +
				(daysInMonth((date.getMonth()-1), date.getFullYear()) - i) + '</td>';
			}
			
			for(i= 0; i < daysInMonth(date.getMonth(), date.getFullYear()); i++){
				calendar += '<td class="'+ plugin.settings.dayActiveClass;
				if(date.getDate() === i+1){calendar += ' ' + plugin.settings.selectedClass}
				calendar += '">' + (i+1) + '</td>';
				if((i + firstDayOfMonth + 1) % 7 == 0){
					calendar += '</tr><tr>';
				}
			}
			
			while ((i + firstDayOfMonth) % 7 != 0)
			{
				calendar += '<td class="'+ plugin.settings.dayDisabledClass +'">' + ++j + '</td>';
				i++;
			}
			
			calendar += '</tr></tbody></table></div>';
			
			return calendar			
        }
		
		var daysInMonth = function (month,year) {
    		return 32 - new Date(year, month, 32).getDate();
		}
		
		var getFirstDayOfMonth =  function (month, year) {
			return new Date(year, month, 1).getDay();
		}
		
		var getCalendarDate =  function (calendar) {
			var calendarDate = "";
			if(plugin.settings.monthFirst){
				calendarDate += calendar.attr("data-month") + '/' + calendar.attr("data-day") + '/';
			}else{
				calendarDate += calendar.attr("data-day") + '/' + calendar.attr("data-month") + '/';
			}
			calendarDate +=	calendar.attr("data-year");
			return calendarDate;
		}
		
		var updateValue = function(element) {
			var calendars = $('.'+plugin.settings.calendarClass);
			element.val(getCalendarDate(calendars.first()) + plugin.settings.dateSeparator + getCalendarDate(calendars.last()));
		}

        init();
    }

})(jQuery);