import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';

// Utility function to format a Date object into a local datetime string for input fields
const toLocalDateTimeString = (date) => {
  if (!date) return ''; // Return empty string if date is invalid
  const pad = (num) => num.toString().padStart(2, '0'); // Helper to pad single digits with leading zero
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are 0-based, so add 1
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`; // Format: YYYY-MM-DDThh:mm
};

// EventModal component to handle creating or editing events in a modal dialog
const EventModal = ({ open, onClose, onCreateOrUpdate, onDelete, defaultDate, event, events, isOverlapping }) => {
  // State for form inputs and modal behavior
  const [title, setTitle] = useState(''); // Event title
  const [description, setDescription] = useState(''); // Event description
  const [start, setStart] = useState(defaultDate || new Date()); // Event start time
  const [end, setEnd] = useState(defaultDate || new Date()); // Event end time
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // State for confirmation dialog visibility
  const [confirmAction, setConfirmAction] = useState(null); // Tracks the action to confirm (create, update, delete)
  const [error, setError] = useState(''); // Error message for validation failures

  // Effect to initialize form fields when modal opens or event/defaultDate changes
  useEffect(() => {
    if (event) {
      // Pre-fill form for editing an existing event
      setTitle(event.title);
      setDescription(event.description || '');
      setStart(event.start);
      setEnd(event.end);
    } else if (defaultDate) {
      // Set default values for a new event
      setTitle('');
      setDescription('');
      setStart(defaultDate);
      setEnd(new Date(defaultDate.getTime() + 30 * 60 * 1000)); // Default to 30 minutes duration
    }
    setError(''); // Reset error message when modal opens
  }, [event, defaultDate]);

  // Validate the event data before submission
  const validateEvent = () => {
    const now = new Date(); // Current date and time for validation (e.g., 03:19 AM PKT, May 21, 2025)
    const startTime = new Date(start);
    const endTime = new Date(end);

    // Validation 1: Ensure title is not empty
    if (!title.trim()) {
      return 'Title cannot be empty.';
    }

    // Validation 2: Prevent past dates for start time
    if (startTime < now) {
      return 'Start time cannot be in the past.';
    }

    // Validation 3: Ensure end time is after start time
    if (endTime <= startTime) {
      return 'End time must be after start time.';
    }

    // Validation 4: Ensure minimum duration of 15 minutes
    const minDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
    if (endTime - startTime < minDuration) {
      return 'Event must be at least 15 minutes long.';
    }

    // Validation 5: Check for overlap with other events
    const otherEvents = event ? events.filter(e => e.id !== event.id) : events; // Exclude current event if editing
    const hasOverlap = otherEvents.some(existingEvent =>
      isOverlapping(startTime, endTime, existingEvent.start, existingEvent.end)
    );
    if (hasOverlap) {
      return 'This event overlaps with another event. Please choose a different time.';
    }

    return ''; // No errors found
  };

  // Handle form submission for creating or updating an event
  const handleSubmit = () => {
    const validationError = validateEvent();
    if (validationError) {
      setError(validationError); // Display validation error
      return;
    }

    // If validation passes, open confirmation dialog
    setError('');
    setConfirmAction(event ? 'update' : 'create'); // Set action type based on whether editing or creating
    setConfirmDialogOpen(true);
  };

  // Handle deletion of an event
  const handleDelete = () => {
    setError('');
    setConfirmAction('delete'); // Set action type to delete
    setConfirmDialogOpen(true);
  };

  // Confirm the action (create, update, or delete) after user confirmation
  const handleConfirmAction = () => {
    if (confirmAction === 'create' || confirmAction === 'update') {
      const eventData = {
        title,
        description,
        start: new Date(start),
        end: new Date(end),
      };
      onCreateOrUpdate(eventData); // Call parent handler to create or update event
    } else if (confirmAction === 'delete' && event && event.id) {
      onDelete(event.id); // Call parent handler to delete event
    }
    setConfirmDialogOpen(false); // Close confirmation dialog
  };

  // Cancel the confirmation dialog
  const handleCancelConfirm = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  // Styles for form inputs
  const inputStyle = {
    backgroundColor: '#ebebeb',
    borderRadius: '6px',
    fontSize: '14px',
    border: 'none',
    height: '40px',
  };

  // Styles for form labels
  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    color: '#000000',
    fontWeight: 'bold',
    fontSize: '14px',
    fontFamily: 'Inter, Montserrat, sans-serif',
  };

  return (
    <>
      {/* Main Event Modal for creating or editing events */}
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '8px', // Rounded corners for the modal
          },
        }}
      >
        {/* Modal Title */}
        <DialogTitle style={{ color: '#24cdcc', padding: '16px 16px 4px 16px', textAlign: 'left', fontWeight: '500', fontFamily: 'Inter, Montserrat, sans-serif' }}>
          {event ? 'Edit Event' : 'Add Event'} {/* Dynamic title based on action */}
        </DialogTitle>
        <hr style={{ border: 'none', borderTop: '2px solid #e0e0e0', margin: '0 16px' }} /> {/* Separator line */}
        <DialogContent style={{ padding: '16px' }}>
          {/* Title Input */}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Title</label>
            <TextField
              fullWidth
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(''); // Clear error on change
              }}
              placeholder="Add Title"
              InputProps={{ style: inputStyle }}
            />
          </div>
          {/* Description Input */}
          <div style={{ marginBottom: '6px' }}>
            <label style={labelStyle}>Description</label>
            <TextField
              fullWidth
              multiline
              rows={1}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError(''); // Clear error on change
              }}
              placeholder="Daily session"
              InputProps={{ style: inputStyle }}
            />
          </div>
          {/* Start Time Input */}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Start</label>
            <TextField
              fullWidth
              type="datetime-local"
              value={toLocalDateTimeString(start)}
              onChange={(e) => {
                setStart(new Date(e.target.value));
                setError(''); // Clear error on change
              }}
              InputProps={{
                style: {
                  ...inputStyle,
                  backgroundColor: '#e0f7fa',
                  border: '1px solid #24cdcc',
                  color: '#24cdcc',
                },
              }}
            />
          </div>
          {/* End Time Input */}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>End</label>
            <TextField
              fullWidth
              type="datetime-local"
              value={toLocalDateTimeString(end)}
              onChange={(e) => {
                setEnd(new Date(e.target.value));
                setError(''); // Clear error on change
              }}
              InputProps={{
                style: {
                  ...inputStyle,
                  backgroundColor: '#e0f7fa',
                  border: '1px solid #24cdcc',
                  color: '#24cdcc',
                },
              }}
            />
          </div>
          {/* Display validation error if any */}
          {error && (
            <Typography style={{ color: '#ff4444', fontSize: '14px', fontFamily: 'Inter, Montserrat, sans-serif', marginTop: '8px' }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        {/* Modal Action Buttons */}
        <DialogActions style={{ padding: '16px', justifyContent: 'flex-end' }}>
          {event && (
            <Button
              onClick={handleDelete}
              style={{
                backgroundColor: '#ff4444',
                color: '#fff',
                padding: '6px 16px',
                borderRadius: '8px',
                textTransform: 'none',
                fontFamily: 'Inter, Montserrat, sans-serif',
                height: '36px',
                lineHeight: 'normal',
                boxSizing: 'border-box',
                marginRight: '2px',
              }}
            >
              Delete {/* Delete button only shown when editing */}
            </Button>
          )}
          <Button
            onClick={onClose}
            style={{
              backgroundColor: '#e0f7fa',
              color: '#24cdcc',
              padding: '6px 16px',
              borderRadius: '8px',
              border: '2px solid #24cdcc',
              marginRight: '2px',
              textTransform: 'none',
              fontFamily: 'Inter, Montserrat, sans-serif',
              height: '36px',
              lineHeight: 'normal',
              boxSizing: 'border-box',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            style={{
              backgroundColor: '#24cdcc',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: '8px',
              textTransform: 'none',
              fontFamily: 'Inter, Montserrat, sans-serif',
              height: '36px',
              lineHeight: 'normal',
              boxSizing: 'border-box',
            }}
          >
            {event ? 'Update Event' : 'Add Event'} {/* Dynamic button text */}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for create/update/delete actions */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelConfirm}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '8px',
            padding: '10px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        {/* Confirmation Dialog Title */}
        <DialogTitle style={{ color: '#24cdcc', textAlign: 'center', fontWeight: '600', fontFamily: 'Inter, Montserrat, sans-serif', padding: '10px 16px' }}>
          Confirm Action
        </DialogTitle>
        <DialogContent style={{ padding: '16px', textAlign: 'center' }}>
          <Typography style={{ fontFamily: 'Inter, Montserrat, sans-serif', fontSize: '16px', color: '#333' }}>
            {confirmAction === 'delete'
              ? 'Are you sure you want to delete this event?'
              : confirmAction === 'update'
              ? 'Are you sure you want to update this event?'
              : 'Are you sure you want to create this event?'}
          </Typography>
        </DialogContent>
        {/* Confirmation Dialog Action Buttons */}
        <DialogActions style={{ padding: '10px 16px', justifyContent: 'center', gap: '10px' }}>
          <Button
            onClick={handleCancelConfirm}
            style={{
              backgroundColor: '#e0f7fa',
              color: '#24cdcc',
              padding: '6px 20px',
              borderRadius: '8px',
              border: '2px solid #24cdcc',
              textTransform: 'none',
              fontFamily: 'Inter, Montserrat, sans-serif',
              fontWeight: '500',
              height: '36px',
              lineHeight: 'normal',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d0e9f0'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e0f7fa'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            style={{
              backgroundColor: confirmAction === 'delete' ? '#ff4444' : '#24cdcc',
              color: '#fff',
              padding: '6px 20px',
              borderRadius: '8px',
              textTransform: 'none',
              fontFamily: 'Inter, Montserrat, sans-serif',
              fontWeight: '500',
              height: '36px',
              lineHeight: 'normal',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = confirmAction === 'delete' ? '#e03b3b' : '#20b8b8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = confirmAction === 'delete' ? '#ff4444' : '#24cdcc'}
          >
            {confirmAction === 'delete' ? 'Delete' : 'Confirm'} {/* Dynamic button text */}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventModal;