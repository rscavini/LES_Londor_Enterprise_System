const { initializeApp } = require("firebase/app");
const { getFirestore, doc, updateDoc, getDoc } = require("firebase/firestore");
const { getAuth, signInAnonymously } = require("firebase/auth");

const firebaseConfig = {
    apiKey: "AIzaSyAgJyk3_wGde1-QM4nuuvAo3pnhqJs7Zts",
    authDomain: "les-londor-enterprise-system.firebaseapp.com",
    projectId: "les-londor-enterprise-system",
    storageBucket: "les-londor-enterprise-system.firebasestorage.app",
    messagingSenderId: "505326457231",
    appId: "1:505326457231:web:e17e3f024828bec6f0bbfa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function testUpdate() {
    try {
        await signInAnonymously(auth);
        console.log("Logged in anonymously");

        const itemId = 'RX5j3XWzsesn5mvspqqI';
        const docRef = doc(db, "inventory", itemId);

        console.log(`Updating item ${itemId} to isApproved: true...`);
        await updateDoc(docRef, { isApproved: true });

        const updatedSnap = await getDoc(docRef);
        console.log("Update successful. New status:", updatedSnap.data().isApproved);
    } catch (error) {
        console.error("Error:", error);
    }
}

testUpdate();
