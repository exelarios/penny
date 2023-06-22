import {
  Text as RN_Text,
  TextProps as RN_TextProps,
  StyleSheet
} from "react-native";

type Variant = "h1" | "h2" | "p";

type TextProps = RN_TextProps & {
  variant?: Variant
};

function Text(props: TextProps) {
  const { children, variant, ...otherProps } = props;

  return (
    <RN_Text style={styles[variant]} {...otherProps}>
      {children}
    </RN_Text>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 30,
    fontWeight: "bold"
  },
  h2: {
    fontWeight: "bold",
    fontSize: 20,
  },
  p: {

  }
});

export default Text;