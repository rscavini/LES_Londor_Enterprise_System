const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");
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

async function inspectLocation(locationName) {
    try {
        await signInAnonymously(auth);
        console.log("Logged in anonymously");

        console.log(`Searching for location: ${locationName}`);
        const locationsSnap = await getDocs(query(collection(db, "locations"), where("name", "==", locationName)));

        if (locationsSnap.empty) {
            console.log("Location not found");
            // List some locations to help
            const allLocs = await getDocs(collection(db, "locations"));
            console.log("Available locations:");
            allLocs.forEach(d => console.log(` - ${d.data().name} (${d.id})`));
            return;
        }

        const locationDoc = locationsSnap.docs[0];
        const locationId = locationDoc.id;
        console.log(`Found location ID: ${locationId}`);

        const inventorySnap = await getDocs(query(
            collection(db, "inventory"),
            where("locationId", "==", locationId),
            where("isActive", "==", true)
        ));

        console.log(`Total active items in this location: ${inventorySnap.size}`);

        inventorySnap.forEach(doc => {
            const item = doc.data();
            console.log(`- [${item.itemCode}] ${item.name || item.description || 'No name'} (ID: ${doc.id})`);
            console.log(`  Approved: ${item.isApproved}`);
            console.log(`  Showcase: ${item.showcaseId || 'None'}`);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

inspectLocation('Tienda Provença');
