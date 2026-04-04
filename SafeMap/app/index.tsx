import { 
  Text,
  View, 
  TextInput
} from "react-native";
import React, { useState } from 'react';

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
