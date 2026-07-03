import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const isLoading = fetchStatus === "fetching";

  const onVerifyPress = async () => {
    if (!signIn) return;

    try {
      const { error } = await signIn.mfa.verifyEmailCode({
        code: otp,
      });

      if (error) {
        console.error(JSON.stringify(error, null, 2));
        alert((error as any).errors?.[0]?.message || error.message);
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        // Navigate to the homescreen once the session is active
        router.replace("/(root)/(tabs)");
      } else {
        console.error(JSON.stringify(signIn, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      alert(err.errors?.[0]?.message || err.message);
    }
  };

  const handleSignIn = async () => {
    if (!signIn) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      const error = (result as any).error;
      if (error) {
        alert(error.message);
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }
            const url = decorateUrl("/");
            router.replace(url as any);
          },
        });
      } else if (signIn.status === "needs_second_factor") {
        await signIn.mfa.sendPhoneCode();
      } else if (signIn.status === "needs_client_trust") {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code",
        );
        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode();
        }
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Image
          source={require("@/assets/images/kribb.png")}
          className="w-32 h-16 mb-8"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Verify your account
        </Text>
        <Text className="text-base text-gray-600 mb-8 text-center">
          We sent a code to {email}
        </Text>
        <TextInput
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
          placeholder="Enter verification code"
          placeholderTextColor={"#6b7280"}
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          autoCapitalize="none"
        />
        <TouchableOpacity
          className="w-full bg-blue-500 rounded-xl px-4 py-3 mb-4 items-center justify-center"
          onPress={onVerifyPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Verify</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => signIn.mfa.sendEmailCode()}
          className="py-2"
        >
          <Text className="text-base font-bold text-blue-500 text-center">
            Resend Code
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-white"
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center px-6 py-12">
        <Image
          source={require("@/assets/images/kribb.png")}
          className="w-32 h-16 mb-8"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back
        </Text>
        <Text className="text-base text-gray-600 mb-8">
          Sign in to your account
        </Text>

        <View className="flex-row gap-3 mb-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
            placeholder="Email Address"
            placeholderTextColor={"#6b7280"}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>
        {errors?.fields?.identifier && (
          <Text className="text-red-500">
            {errors.fields.identifier.message}
          </Text>
        )}
        <View className="flex-row gap-3 mb-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
            placeholder="Password"
            placeholderTextColor={"#6b7280"}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry
          />
        </View>
        {errors?.fields?.password && (
          <Text className="text-red-500">{errors.fields.password.message}</Text>
        )}

        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            className="flex-1 border bg-blue-500 border-gray-300 rounded-xl px-4 py-3"
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base text-center">
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500"> Don't have an account?</Text>
          <Link href="/sign-up">
            <Text className="text-blue-500 font-bold"> Sign Up</Text>
          </Link>
        </View>
        <View nativeID="clerk-captcha"></View>
      </View>
    </ScrollView>
  );
}
