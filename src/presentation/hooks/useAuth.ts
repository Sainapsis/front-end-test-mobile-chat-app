import { LoginParams } from '@/src/data/interfaces/auth.interface';
import { authRepository } from '@/src/data/repositories/login.repository';
import { User } from '@/src/domain/entities/user';
import { authLogin } from '@/src/domain/usecases/auth.usecase';
import { Routes } from "@/src/presentation/constants/Routes";
import { RelativePathString, useRouter, useSegments } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const segments = useSegments();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const isLoggedIn = !!currentUser;

  useEffect(() => {
    const inAuthGroup = segments[0] === Routes.LOGIN;

    if (!isLoggedIn && !inAuthGroup) {
      router.replace(`/${Routes.LOGIN}` as RelativePathString);
    } else if (isLoggedIn && inAuthGroup) {
      router.replace(`/${Routes.TABS}` as RelativePathString);
    }
  }, [currentUser]);

  const loginImpl = useCallback(async ({ userId }: LoginParams) => {
    try {
      const user = await authLogin(authRepository)({ userId });      

      if (user) {
        setCurrentUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }, []);

  const logoutImpl = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return {
    currentUser,
    login: loginImpl,
    logout: logoutImpl,
  }
}
