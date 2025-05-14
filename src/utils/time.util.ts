  
export const transformTime = {
  formatTime(timestamp: number): String {
    const date = new Date(timestamp);

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },
  getDiffInDays(timestamp: number): String {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return this.formatTime(timestamp);
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  },
  generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}