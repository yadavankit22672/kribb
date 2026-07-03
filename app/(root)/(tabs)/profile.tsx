import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView>
      <TouchableOpacity
        onPress={handleSignOut}
        className="w-full bg-blue-500 rounded-xl px-4 py-3 mb-4 items-center justify-center"
      >
        <Text className="text-white font-bold text-base">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Profile;
