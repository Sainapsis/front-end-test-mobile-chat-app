export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

export const getPreviousDay = (date: Date): Date => {
  const previousDay = new Date(date);
  previousDay.setDate(date.getDate() - 1);
  return previousDay;
};

export const formatTimeOnly = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  }); 
};

export const formatDateOnly = (date: Date, today: Date): string => {
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
};

export const formatMessageDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();

  if (isSameDay(date, today)) {
    return formatTimeOnly(date);
  }

  if (isSameDay(date, getPreviousDay(today))) {
    return 'Yesterday';
  }

  return formatDateOnly(date, today);
}; 