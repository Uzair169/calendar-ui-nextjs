import React, { useState, useEffect } from 'react'; // Import React and hooks
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, format, isSameDay } from 'date-fns'; // Date utilities

// LeftMiniCalendar component for displaying a compact monthly calendar
const LeftMiniCalendar = ({ selectedDate, setSelectedDate }) => {
  // State to track the current month displayed in the calendar
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate || new Date()));

  // Effect to update current month when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(startOfMonth(selectedDate)); // Sync current month with selected date
    }
  }, [selectedDate]);

  // Handler to navigate to the previous month
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1)); // Subtract one month
  };

  // Handler to navigate to the next month
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1)); // Add one month
  };

  // Calculate the start and end dates for the calendar grid
  const monthStart = startOfMonth(currentMonth); // First day of the current month
  const monthEnd = endOfMonth(currentMonth); // Last day of the current month
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Start of the week (Sunday) containing month start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 }); // End of the week (Saturday) containing month end

  // Generate an array of all days to display in the calendar grid
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Get today's date for highlighting (e.g., May 21, 2025, 03:31 AM PKT)
  const today = new Date();

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      {/* Header with month navigation buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button
          onClick={handlePrevMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          {"<"} {/* Previous month button */}
        </button>
        <span style={{ fontSize: '16px', fontWeight: '500' }}>
          {format(currentMonth, 'MMMM yyyy')} {/* Display current month and year */}
        </span>
        <button
          onClick={handleNextMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          {">"} {/* Next month button */}
        </button>
      </div>

      {/* Days of the week header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} style={{ padding: '5px 0' }}>
            {day} {/* Display abbreviated day names */}
          </div>
        ))}
      </div>

      {/* Calendar grid with days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
        {days.map((day) => {
          // Determine if the day belongs to the current month
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          // Check if the day is today
          const isToday = isSameDay(day, today);
          // Check if the day is the selected date
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div
              key={day.toString()}
              onClick={() => setSelectedDate(day)} // Set selected date on click
              style={{
                padding: '8px',
                fontSize: '14px',
                color: isCurrentMonth ? '#000' : '#ccc', // Gray out days from other months
                backgroundColor: isSelected ? '#24cdcc' : isToday ? '#f4a261' : 'transparent', // Highlight selected or today
                borderRadius: '50%', // Circular day cells
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                margin: '0 auto',
              }}
            >
              {format(day, 'd')} {/* Display day number */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeftMiniCalendar;