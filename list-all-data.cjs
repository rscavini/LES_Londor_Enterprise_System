const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, orderBy, query } = require("firebase/firestore");
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
        const categories = {};
        catSnap.forEach(doc => {
            categories[doc.id] = doc.data();
        });

        const subSnap = await getDocs(collection(db, "subcategories"));
        const subcategories = [];
        subSnap.forEach(doc => {
            subcategories.push({ id: doc.id, ...doc.data() });
        });

        console.log("--- CATEGORIES AND SUBCATEGORIES ---");
        for (const catId in categories) {
            const cat = categories[catId];
            console.log(`\nCATEGORY: ${cat.name} (${catId}) [Active: ${cat.isActive}]`);
            const subs = subcategories.filter(s => s.categoryId === catId);
            if (subs.length === 0) {
                console.log("  (No subcategories)");
            } else {
                subs.forEach(sub => {
                    console.log(`  - ${sub.name} (${sub.id}) [Active: ${sub.isActive}]`);
                });
            }
        }

    } catch (error) {
        console.error("Error checking data:", error);
    }
}

checkData();
