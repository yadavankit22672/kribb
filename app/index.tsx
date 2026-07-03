import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

export default function RedirectToAbout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  //redirect based on auth state
  if (isSignedIn) return <Redirect href="/(root)/(tabs)" />;

  return <Redirect href="/sign-in" />;
}
