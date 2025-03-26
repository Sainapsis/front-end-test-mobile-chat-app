/**
 * Formats a timestamp into a string with 2-digit hour and minute representation (HH:MM).
 *
 * @param {number} timestamp - The timestamp in milliseconds to format.
 * @returns {string} A string representing the formatted time in "HH:MM" format.
 *
 * @example
 * const formattedTime = formatTimeTo2HourDigit(Date.now()); // "9:45" or "21:30"
 */

const formatTimeTo2HourDigit = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default formatTimeTo2HourDigit;
