// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, serverTimestamp, onValue, update } from 'firebase/database';

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDTxxBl1DpVTEMA-R4bURsbnHXGvYNV2ho",
//   authDomain: "mob-app-dd71a.firebaseapp.com",
//   projectId: "mob-app-dd71a",
//   storageBucket: "mob-app-dd71a.appspot.com",
//   messagingSenderId: "901877241301",
//   appId: "1:901877241301:web:8add3a075794a872e3195c",
//   measurementId: "G-42V0DDBCF8",
//   databaseURL: "https://mob-app-dd71a-default-rtdb.firebaseio.com/"
// };
const firebaseConfig = {
  apiKey: "AIzaSyBsc_7RSZ-3La_JmRqMjIPeuB46xwxp1-s",
  authDomain: "mobapp-fa519.firebaseapp.com",
  projectId: "mobapp-fa519",
  storageBucket: "mobapp-fa519.appspot.com",
  messagingSenderId: "759173461067",
  appId: "1:759173461067:web:b903819f5e022f295849ce",
  measurementId: "G-DJVZVB4Z0X",
  databaseURL: "https://mobapp-fa519-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database, ref, set, serverTimestamp, onValue, update };
