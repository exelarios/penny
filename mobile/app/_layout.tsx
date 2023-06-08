import { Slot, useRouter } from "expo-router"
import { useEffect } from "react";

export const unstable_settings = {
  initialRouteName: "home",
};

function Layout() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, []);

  return (
    <Slot/>
  );
}

export default Layout;