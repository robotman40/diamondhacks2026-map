import { 
  Text,
  View, 
  TextInput, 
  TouchableOpacity,
} from "react-native";
import React, { useState } from 'react';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View>
      <Text >Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Enter your username"
        autoCapitalize="none"
      />

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
      />
    </View>
  );
}

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

      <Text>Username</Text>
      <TextInput></TextInput>

      <Text>Password</Text>
      <TextInput></TextInput>

    </View>
  );
}
