import { goto } from "$app/navigation";
import { auth, googleProvider } from "$lib/firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, type User } from "firebase/auth";
import { writable } from "svelte/store";

export const authStore = writable<{user: User | null}>({
    user: null
});

export const authHandler = {
    logout: async () => {
        await auth.signOut();
        goto("/");
    },
    loginWithGoogle: async () => {
        console.log("Attemping login...");
        await signInWithPopup(auth, googleProvider);
        goto("/home");
    },
    signUpUserWithEmailAndPassword: async (email: string, password: string) => {
        console.log("Attemping to sign up...");
        try {
            await createUserWithEmailAndPassword(auth, email, password)
            await auth.signOut();
            alert("Account created! Please login.")
        } catch (error) {
            console.log(error);
        }
    },
    signInUserWithEmailAndPassword: async (email: string, password: string) => {
        console.log("Attemping to login...");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            await goto('/home').then(() => {alert("Login successful!")});
        } catch (error) {
            alert("Invalid credentials. Please try again.")
        }
    }
}