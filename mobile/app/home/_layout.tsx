import { Tabs } from "expo-router";

function Layout() {

  return (
    <Tabs
      initialRouteName="Explore"
      screenOptions={{
        headerShown: false
      }}>
    </Tabs>
  );
}

export default Layout;