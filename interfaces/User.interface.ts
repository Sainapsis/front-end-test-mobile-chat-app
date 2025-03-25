export interface UserInterface {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "away";
}
