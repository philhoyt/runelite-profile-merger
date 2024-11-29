const DEBUG = false;  // Set to true to enable debug logging

export const debug = (message, data) => {
  if (DEBUG) {
    console.log(`DEBUG - ${message}:`, data);
  }
};

export default debug;
