import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 50, fontWeight: 'bold' }}>SafeRoute</Text>
      <Text>Never worry about routes again!</Text>
    </View>
  );
}
