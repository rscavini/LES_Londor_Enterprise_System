const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
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

async function checkData() {
    try {
        await signInAnonymously(auth);
        console.log("Logged in anonymously");

        const catSnap = await getDocs(collection(db, "categories"));
        console.log(`Categories found: ${catSnap.size}`);
        catSnap.forEach(doc => console.log(` - [${doc.id}] ${doc.data().name}`));

        const subSnap = await getDocs(collection(db, "subcategories"));
        console.log(`Subcategories found: ${subSnap.size}`);
        subSnap.forEach(doc => console.log(` - [${doc.id}] ${doc.data().name} (Cat: ${doc.data().categoryId})`));

    } catch (error) {
        console.error("Error checking data:", error);
    }
}

checkData();
