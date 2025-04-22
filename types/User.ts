/**
 * Represents a user in the application
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** Display name of the user */
  name: string;
  /** URL or path to the user's avatar image */
  avatar: string;
  /** Current status of the user */
  status: 'online' | 'offline' | 'away';
}