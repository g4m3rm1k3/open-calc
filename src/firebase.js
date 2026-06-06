import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyC_XkByB7hh9YaVbX0yiI-XJ4uMTGkY-u4',
  authDomain: 'upskillos-f5e9f.firebaseapp.com',
  projectId: 'upskillos-f5e9f',
  storageBucket: 'upskillos-f5e9f.firebasestorage.app',
  messagingSenderId: '405434693865',
  appId: '1:405434693865:web:900f74d2746bd03d1a1878',
  measurementId: 'G-GN2XHVKQX1',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
