<script lang='ts'>
    import { onMount } from 'svelte';
    import { collection, doc, getDocs, query, setDoc } from "firebase/firestore"; 
    import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged, type User } from 'firebase/auth';
	import { goto } from '$app/navigation';

    interface Profile {
        name: string;
        game: string;
        shinyHunts: number;
        totalEncounters: number;
    }
    let userID: string;

    let profileList: Profile[] = [];
    let newProfile = { 
        name: '', 
        game: '', 
        shinyHunts: 0, 
        totalEncounters: 0
    };
    
    onMount(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                userID = user.uid;
                const profileRef = collection(db, "users", userID, "profile");
                const profileInfo = await getDocs(profileRef);
                profileInfo.forEach((doc) => {
                    let newProfile = doc.data() as Profile;
                    profileList = [...profileList, newProfile];
                })
            } else {
                alert("User signed out. Returning to login page.");
                goto("/");
            }
        });
        return () => unsubscribe();
    })

    const profileCount = async() => {
        if (typeof userID === 'string') {
            const profileRef = collection(db, "users", userID, "profile");
            const querySnapshot = await getDocs(profileRef);
            console.log(userID, querySnapshot);
            return querySnapshot.size + 1;
        }
    };
    async function logProfileCount() {
        const count = await profileCount();  // Await the result of the async function
        console.log("Profile Count:", count);
    }   

    async function addProfile() {
        const profileID = "profile" + await profileCount();
        if (typeof userID === 'string' && userID != '') {
            try {
                await setDoc(doc(db, "users", userID, "profile", profileID), newProfile);
                alert("Successfully added profile!");
            } catch (error) {
                alert("Error adding profile. Please try again.");
            }
        } else {
            alert("Profile data insufficient. Please fill out all fields.")
        }
    }
    async function updateProfile() {
        if (typeof userID === 'string') {
            const profileRef = collection(db, "users", userID, "profile");
            const profileInfo = await getDocs(profileRef);
            profileList = [];
            profileInfo.forEach((doc) => {
                let newProfile = doc.data() as Profile;
                profileList = [...profileList, newProfile];
            })
        }
    }

</script>
<div class="">  
</div>

<style>
    .profile {
        cursor: pointer;
    }
</style>