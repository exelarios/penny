import { Slot, useRouter } from "expo-router"
import { useEffect } from "react";

import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { MarkerProvider } from "@/context/MarkerContext";

export const unstable_settings = {
  initialRouteName: "home",
};

const queryClient = new QueryClient();

function Layout() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MarkerProvider>
        <Slot/>
      </MarkerProvider>
    </QueryClientProvider>
  );
}

export default Layout;