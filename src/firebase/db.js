import firebase from 'firebase/app'
import 'firebase/firestore'

// Get a Firestore instance
export const db = firebase
    .initializeApp({
        projectId: 'multi-maze',
        apiKey: 'AIzaSyB-Gc4MUuzVSZK8GEzaHHDUwoug8M2fa-I',
        authDomain: 'multi-maze.firebaseapp.com',
        storageBucket: 'multi-maze.appspot.com',
        messagingSenderId: '899803305814',
        appId: '1:899803305814:web:27233caacb44f9c65728f7',
    })
    .firestore()

// Export types that exists in Firestore
// This is not always necessary, but it's used in other examples
const { Timestamp, GeoPoint } = firebase.firestore
export { Timestamp, GeoPoint }

// if using Firebase JS SDK < 5.8.0
db.settings({ timestampsInSnapshots: true })
