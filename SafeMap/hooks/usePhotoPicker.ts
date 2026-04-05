import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

/**
 * Shows an action sheet letting the user choose between Camera and Photo Library,
 * then returns the selected image URI (or null if cancelled).
 */
export async function pickProfilePhoto(): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert("Profile Photo", "Choose a source", [
      {
        text: "Take Photo",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert("Permission required", "Camera access is needed to take a photo.");
            return resolve(null);
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          resolve(result.canceled ? null : result.assets[0].uri);
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert("Permission required", "Photo library access is needed.");
            return resolve(null);
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });
          resolve(result.canceled ? null : result.assets[0].uri);
        },
      },
      { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
    ]);
  });
}
