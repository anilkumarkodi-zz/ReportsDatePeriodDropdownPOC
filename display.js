dhis2.util.namespace('dhis2.dsr');

dhis2.dsr.currentPeriodOffset = 0;

var init = {};
var defaultCalendarId = 'gregorian';
init.calendar = $.calendars.instance(defaultCalendarId);
var periodGenerator = new dhis2.period.PeriodGenerator(init.calendar, 'yyyy-mm-dd');

console.log(periodGenerator.generatePeriods("Monthly", dhis2.dsr.currentPeriodOffset));