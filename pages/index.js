import { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'; // Import calendar components
import format from 'date-fns/format'; // Date formatting utility
import parse from 'date-fns/parse'; // Date parsing utility
import startOfWeek from 'date-fns/startOfWeek'; // Utility to get start of week
import getDay from 'date-fns/getDay'; // Utility to get day of week
import enUS from 'date-fns/locale/en-US'; // English locale for date-fns
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Default styles for react-big-calendar
import EventModal from '../components/EventModal'; // Modal component for adding/editing events
import LeftMiniCalendar from '../components/LeftMiniCalendar'; // Mini calendar component for date selection
import { inter, montserrat } from '../lib/fonts'; // Custom fonts for styling

// Define locales for date-fns localizer
const locales = {
  'en-US': enUS,
};

// Initialize date-fns localizer for react-big-calendar
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Utility function to check if two time ranges overlap
function isOverlapping(newStart, newEnd, existingStart, existingEnd) {
  return newStart < existingEnd && existingStart < newEnd;
}

// Utility function to determine if a time slot is disabled (past or overlapping)
function isSlotDisabled(slotTime, events) {
  const now = new Date(); // Current date and time (e.g., 03:28 AM PKT, May 21, 2025)
  if (slotTime < now) return true; // Disable past time slots

  // Check for overlap with existing events (30-minute slot duration)
  return events.some(event =>
    isOverlapping(
      slotTime,
      new Date(slotTime.getTime() + 30 * 60000), // 30 minutes in milliseconds
      event.start,
      event.end
    )
  );
}

// Custom styling for calendar events
const eventStyleGetter = (event, start, end, isSelected) => {
  const style = {
    backgroundColor: '#f4a261', // Orange background for events
    borderRadius: '4px',
    color: '#fff', // White text
    border: 'none',
    display: 'block',
    padding: '2px 6px',
    fontSize: '12px',
  };
  return { style };
};

// Custom Toolbar Component for calendar navigation and view switching
const CustomToolbar = (toolbar) => {
  // Functions to switch calendar views
  const goToDay = () => toolbar.onView(Views.DAY);
  const goToWeek = () => toolbar.onView(Views.WEEK);
  const goToMonth = () => toolbar.onView(Views.MONTH);

  // Base button styles for view toggle buttons
  const buttonStyle = {
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: montserrat.style.fontFamily,
    fontSize: '14px',
  };

  // Highlighted style for active view button
  const highlightedStyle = {
    ...buttonStyle,
    backgroundColor: '#24cdcc',
    color: '#fff',
  };

  // Default style for inactive view buttons
  const defaultStyle = {
    ...buttonStyle,
    backgroundColor: '#e0f7fa',
    color: '#000000',
  };

  // Format date display for Day view
  const currentDayDate = toolbar.view === Views.DAY
    ? format(toolbar.date, 'EEEE, MMMM dd, yyyy')
    : null;

  return (
    <div style={{ backgroundColor: '#f0f0f0', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* Navigation Controls */}
      <div>
        <button
          onClick={() => toolbar.onNavigate('PREV')} // Navigate to previous period
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          {"<"}
        </button>
        {currentDayDate && (
          <span style={{ margin: '0 10px', fontFamily: montserrat.style.fontFamily, fontWeight: '500', fontSize: '16px' }}>
            {currentDayDate} {/* Display full date for Day view */}
          </span>
        )}
        {!currentDayDate && (
          <span style={{ margin: '0 10px', fontFamily: montserrat.style.fontFamily, fontWeight: '500', fontSize: '16px' }}>
            {format(toolbar.date, 'MMMM yyyy')} {/* Display month and year for Week/Month views */}
          </span>
        )}
        <button
          onClick={() => toolbar.onNavigate('NEXT')} // Navigate to next period
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          {">"}
        </button>
      </div>
      {/* View Toggle Buttons */}
      <div>
        <button
          onClick={goToDay}
          style={toolbar.view === Views.DAY ? highlightedStyle : defaultStyle}
        >
          Day
        </button>
        <button
          onClick={goToWeek}
          style={toolbar.view === Views.WEEK ? highlightedStyle : defaultStyle}
        >
          Week
        </button>
        <button
          onClick={goToMonth}
          style={toolbar.view === Views.MONTH ? highlightedStyle : defaultStyle}
        >
          Month
        </button>
      </div>
    </div>
  );
};

// Custom Event Component to control event rendering based on view
const CustomEvent = ({ event, currentView }) => {
  console.log('CustomEvent - CurrentView:', currentView, 'Event:', event, 'Rendered:', currentView === Views.MONTH ? `${event.title}\n${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}` : event.title);

  const startTime = format(event.start, 'h:mm a'); // Format start time (e.g., 10:00 AM)
  const endTime = format(event.end, 'h:mm a'); // Format end time (e.g., 11:00 AM)

  // Month view: Show title and time range
  if (currentView === Views.MONTH) {
    return (
      <div style={{ lineHeight: '1.2', overflow: 'visible' }}>
        <div>{event.title}</div>
        <div style={{ fontSize: '10px', color: '#fff', whiteSpace: 'nowrap' }}>
          {`${startTime} - ${endTime}`} {/* Display time range in Month view */}
        </div>
      </div>
    );
  }

  // Week and Day views: Show only the title
  return <div className="custom-event-title">{event.title}</div>;
};

// Custom Event Wrapper Component to modify event rendering behavior
const CustomEventWrapper = ({ event, children, currentView }) => {
  console.log('CustomEventWrapper - CurrentView:', currentView, 'Event:', event);
  // For Week and Day views, exclude the time label
  if (currentView === Views.WEEK || currentView === Views.DAY) {
    return <div className="custom-event-wrapper">{children}</div>;
  }
  return children;
};

// Main Home Component for the calendar application
export default function Home() {
  // State for managing events and calendar interactions
  const [events, setEvents] = useState([
    // Initial events data
    {
      id: 1,
      title: 'Demo Meeting',
      start: new Date(2025, 4, 20, 10, 0), // May 20, 2025, 10:00 AM
      end: new Date(2025, 4, 20, 11, 0), // May 20, 2025, 11:00 AM
      description: 'Initial demo event',
    },
    {
      id: 2,
      title: 'Bijan Test3',
      start: new Date(2025, 4, 16, 15, 30), // May 16, 2025, 3:30 PM
      end: new Date(2025, 4, 16, 16, 0), // May 16, 2025, 4:00 PM
      description: '',
    },
    {
      id: 3,
      title: 'Bijan Test2',
      start: new Date(2025, 4, 18, 0, 30), // May 18, 2025, 12:30 AM
      end: new Date(2025, 4, 18, 1, 0), // May 18, 2025, 1:00 AM
      description: '',
    },
    {
      id: 4,
      title: 'Demo check',
      description: 'demo meeting 1',
      start: new Date(2025, 4, 21, 2, 31), // May 21, 2025, 2:31 AM
      end: new Date(2025, 4, 21, 3, 0), // May 21, 2025, 3:00 AM
    },
    {
      id: 5,
      title: 'demo meeting 2',
      description: 'demo meeting 2',
      start: new Date(2025, 4, 21, 3, 0), // May 21, 2025, 3:00 AM
      end: new Date(2025, 4, 21, 3, 30), // May 21, 2025, 3:30 AM
    },
    {
      id: 6,
      title: 'Demo meeting 3',
      description: 'demo ',
      start: new Date(2025, 4, 21, 4, 0), // May 21, 2025, 4:00 AM
      end: new Date(2025, 4, 21, 4, 30), // May 21, 2025, 4:30 AM
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false); // State for modal visibility
  const [selectedSlot, setSelectedSlot] = useState(null); // Selected time slot for new event
  const [selectedDate, setSelectedDate] = useState(new Date()); // Currently selected date
  const [selectedEvent, setSelectedEvent] = useState(null); // Selected event for editing
  const [currentView, setCurrentView] = useState(Views.MONTH); // Current calendar view (Month, Week, Day)

  // Handle selecting a time slot to create a new event
  const handleSlotSelect = (slotInfo) => {
    const { start, end } = slotInfo;
    const now = new Date(); // Current date and time (e.g., 03:28 AM PKT, May 21, 2025)

    if (start < now) {
      alert('You cannot book a meeting in the past.');
      return;
    }

    // Check for overlap with existing events
    const hasOverlap = events.some(event =>
      isOverlapping(start, end, event.start, event.end)
    );

    if (hasOverlap) {
      alert('This time slot is already booked. Please select a different time.');
      return;
    }

    setSelectedSlot(slotInfo); // Set the selected slot for the modal
    setSelectedEvent(null); // Clear any selected event
    setModalOpen(true); // Open the event modal
  };

  // Handle selecting an existing event for editing
  const handleEventSelect = (event) => {
    setSelectedEvent(event); // Set the selected event for editing
    setSelectedSlot(null); // Clear any selected slot
    setModalOpen(true); // Open the event modal
  };

  // Handle creating or updating an event
  const handleEventCreateOrUpdate = (eventData) => {
    if (selectedEvent) {
      // Update existing event
      setEvents(events.map(event =>
        event.id === selectedEvent.id ? { id: event.id, ...eventData } : event
      ));
    } else {
      // Create new event with a unique ID
      const newEvent = {
        id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
        ...eventData,
      };
      setEvents([...events, newEvent]);
    }
    setModalOpen(false); // Close the modal
    setSelectedEvent(null); // Clear selected event
    setSelectedSlot(null); // Clear selected slot
  };

  // Handle deleting an event
  const handleEventDelete = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId)); // Remove event by ID
    setModalOpen(false); // Close the modal
    setSelectedEvent(null); // Clear selected event
    setSelectedSlot(null); // Clear selected slot
  };

  // Customize time slot styles (e.g., disable past or overlapping slots)
  const slotPropGetter = (date) => {
    if (isSlotDisabled(date, events)) {
      return {
        style: {
          backgroundColor: '#f0f0f0', // Gray background for disabled slots
          pointerEvents: 'none', // Disable interaction
          color: '#999', // Gray text
        },
      };
    }
    return {};
  };

  // Customize day cell styles (e.g., highlight today, gray out past days)
  const dayPropGetter = (date) => {
    const now = new Date(); // Current date and time (e.g., 03:28 AM PKT, May 21, 2025)
    const dateCopy = new Date(date.getTime());
    const nowCopy = new Date(now.getTime());

    // Normalize dates to midnight for comparison
    dateCopy.setHours(0, 0, 0, 0);
    nowCopy.setHours(0, 0, 0, 0);

    const isToday = dateCopy.getTime() === nowCopy.getTime();
    const isPast = dateCopy.getTime() < nowCopy.getTime();

    if (isPast) {
      return {
        style: {
          backgroundColor: '#fafafa', // Light gray for past days
          color: '#bbb', // Gray text
        },
      };
    }

    return isToday ? { className: 'rbc-today' } : {}; // Highlight today
  };

  return (
    <div
      className={`${inter.className} ${montserrat.className}`} // Apply custom fonts
      style={{
        display: 'flex',
        fontFamily: montserrat.style.fontFamily,
        backgroundColor: '#f0f0f0', // Gray background for the page
        minHeight: '100vh', // Full viewport height
      }}
    >
      {/* Global Styles */}
      <style jsx global>{`
        body, #__next {
          background-color: #f0f0f0 !important; // Ensure entire page background is gray
          margin: 0;
          padding: 0;
        }
        .rbc-time-view .rbc-event > .rbc-event-label {
          display: none !important; // Hide default event time labels in time views
        }
        .rbc-time-view .custom-event-wrapper .rbc-event-label {
          display: none !important; // Hide custom event wrapper time labels
        }
        .rbc-time-view .custom-event-title {
          font-size: 12px;
          color: #fff;
          line-height: 1.2; // Style for event titles in time views
        }
      `}</style>
      {/* Left Sidebar: Mini Calendar */}
      <div style={{ width: '25%', padding: '20px', paddingRight: '20px', paddingTop: '2em' }}>
        <LeftMiniCalendar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate} // Mini calendar for date navigation
        />
      </div>

      {/* Main Calendar Section */}
      <div style={{ width: '75%', padding: '20px', paddingLeft: '0' }}>
        {/* Add Event Button */}
        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f0f0', padding: '10px', paddingLeft: '0', borderRadius: '4px' }}>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setSelectedSlot(null);
              setModalOpen(true); // Open modal to add a new event
            }}
            style={{ padding: '8px 16px', backgroundColor: '#24cdcc', color: '#fff', border: 'none', borderRadius: '18px', cursor: 'pointer', fontFamily: montserrat.style.fontFamily }}
          >
            Add Event
          </button>
        </div>
        {/* Main Calendar Component */}
        <Calendar
          localizer={localizer} // Date localization
          events={events} // List of events to display
          startAccessor="start" // Event start time accessor
          endAccessor="end" // Event end time accessor
          selectable // Allow selecting time slots
          style={{ height: 600 }} // Calendar height
          onSelectSlot={handleSlotSelect} // Handle time slot selection
          onSelectEvent={handleEventSelect} // Handle event selection
          date={selectedDate} // Current date displayed
          onNavigate={(date) => setSelectedDate(date)} // Update date on navigation
          onView={(view) => setCurrentView(view)} // Update view on change
          view={currentView} // Current view (Month, Week, Day)
          slotPropGetter={slotPropGetter} // Customize slot styles
          dayPropGetter={dayPropGetter} // Customize day cell styles
          eventPropGetter={eventStyleGetter} // Customize event styles
          components={{
            toolbar: CustomToolbar, // Custom toolbar component
            event: (props) => <CustomEvent {...props} currentView={currentView} />, // Custom event rendering
            eventWrapper: (props) => <CustomEventWrapper {...props} currentView={currentView} />, // Custom event wrapper
          }}
          views={[Views.DAY, Views.WEEK, Views.MONTH]} // Available calendar views
        />
      </div>

      {/* Event Modal for Adding/Editing Events */}
      {modalOpen && (
        <EventModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedEvent(null);
            setSelectedSlot(null); // Close modal and clear selections
          }}
          onCreateOrUpdate={handleEventCreateOrUpdate} // Handle event creation/update
          onDelete={handleEventDelete} // Handle event deletion
          defaultDate={selectedSlot?.start || selectedEvent?.start} // Default date for new event
          event={selectedEvent} // Event to edit (if any)
          events={events} // Pass all events for overlap checking
          isOverlapping={isOverlapping} // Function to check overlaps
        />
      )}
    </div>
  );
}