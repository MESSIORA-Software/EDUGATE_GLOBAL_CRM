import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://edugate-global-crm.vercel.app/api';
const REQUEST_TIMEOUT_MS = 15000;

// The backend endpoints require JWT. We should pull the token from localStorage
// if the project stores it there. Let's see how other requests authenticate.
// Oh wait, looking at `clientService.js`, they don't even add an Authorization header!
// Let me just create a helper to grab the token and set the headers.
const getHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('jwt');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const EventService = {
  getAllEvents: () => {
    return axios.get(`${BASE_URL}/calendar/events`, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: getHeaders()
    });
  },
  getEventById: (id) => {
    return axios.get(`${BASE_URL}/calendar/events/${id}`, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: getHeaders()
    });
  },
  createEvent: (eventData) => {
    return axios.post(`${BASE_URL}/calendar/events`, eventData, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: getHeaders()
    });
  },
  updateEvent: (id, eventData) => {
    return axios.put(`${BASE_URL}/calendar/events/${id}`, eventData, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: getHeaders()
    });
  },
  deleteEvent: (id) => {
    return axios.delete(`${BASE_URL}/calendar/events/${id}`, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: getHeaders()
    });
  },
};

export default EventService;
