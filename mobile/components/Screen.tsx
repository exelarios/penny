import { SafeAreaView } from "react-native";

type ScreenProps = {
  children?: React.ReactNode
}

function Screen(props: ScreenProps) {
  return (
    <SafeAreaView>
      {props.children}
    </SafeAreaView>
  )
}