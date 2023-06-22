import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

type RouteProps = {
  name: String
}

type ScreenOptionProps = {
  route: RouteProps
}

const icons = {
  "Home": "home",
  "Explore": "location-sharp",
  "Settings": "settings"
}

function handleIcon(props) {
  const { route, color, size } = props;
  const routeName = route.name;
  return <Ionicons name={icons[routeName]} size={size} color={color} />
}

function options(props: ScreenOptionProps) {
  const { route } = props;
  return {
    headerShown: false,
    tabBarIcon: (props) => handleIcon({route, ...props})
  }
}

function Layout() {
  return (
    <Tabs
      initialRouteName="Explore"
      screenOptions={options}>
    </Tabs>
  );
}

export default Layout;