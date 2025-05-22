import { ReactNode, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { User } from "@/src/domain/entities/user";

interface Props {
  children: ReactNode;
}

function AuthContent({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
    }),
    [currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: Props) {
  return <AuthContent>{children}</AuthContent>;
}
