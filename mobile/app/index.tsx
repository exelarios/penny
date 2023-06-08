import { SafeAreaView, Text } from "react-native";
import { Link } from "expo-router";

export default function Root() {
  return (
    <SafeAreaView>
      <Text>bob was here</Text>
      <Link href="/home">home</Link>
    </SafeAreaView>
  );
}