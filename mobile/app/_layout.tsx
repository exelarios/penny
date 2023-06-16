import { Slot, useRouter } from "expo-router"
import { useEffect } from "react";

import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";

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
      <Slot/>
    </QueryClientProvider>
  );
}

export default Layout;