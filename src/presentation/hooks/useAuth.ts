import { Routes } from "@/src/presentation/constants/Routes";
import { RelativePathString, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export function useAuth({
  isLoggedIn,
  loading,
}: {
  isLoggedIn: boolean;
  loading: boolean;
}) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === Routes.LOGIN;

    if (!isLoggedIn && !inAuthGroup) {
      router.replace(`/${Routes.LOGIN}` as RelativePathString);
    } else if (isLoggedIn && inAuthGroup) {
      router.replace(`/${Routes.TABS}` as RelativePathString);
    }
  }, [isLoggedIn, segments, loading]);
}
