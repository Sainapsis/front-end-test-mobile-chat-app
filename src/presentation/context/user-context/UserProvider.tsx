import { ReactNode, useMemo, useState } from "react";
import { UserContext } from "./UserContext";
import { User } from "@/src/domain/entities/user";

interface Props {
  children: ReactNode;
}

function UserContent({ children }: Props) {
  const [users, setUsers] = useState<User[]>([]);

  const value = useMemo(
    () => ({
      users,
      setUsers,
    }),
    [users]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function UserProvider({ children }: Props) {
  return <UserContent>{children}</UserContent>;
}
