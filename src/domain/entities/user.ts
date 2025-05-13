export enum UserStatus {
  Online = 'online',
  Offline = 'offline',
  Away = 'away',
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: UserStatus;
}