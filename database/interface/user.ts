export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: UserStatus;
}