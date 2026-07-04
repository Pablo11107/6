// firebase-init.js
// Módulo compartido por todas las páginas de FOCUS.
// Aquí vive la configuración de Firebase y las funciones de ayuda
// para autenticación y guardado/lectura de datos en Firestore.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =======================================================
// 1) PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE
//    (Firebase console > Configuración del proyecto > Tus apps > SDK config)
// =======================================================
const firebaseConfig = {
  apiKey: "AIzaSyBk0VfN4BATPOuMIB44zTOhSNya1q6uHd4",
  authDomain: "focus-app-2746d.firebaseapp.com",
  projectId: "focus-app-2746d",
  storageBucket: "focus-app-2746d.firebasestorage.app",
  messagingSenderId: "940097371366",
  appId: "1:940097371366:web:53efc673e5b563045b8f27"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// =======================================================
// Autenticación
// =======================================================

// Espera a saber si hay usuario logueado.
// Si NO lo hay, redirige a login.html.
// Si lo hay, devuelve el objeto user.
export function requireAuth() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        window.location.href = "login.html";
      }
    });
  });
}

export function logout() {
  return signOut(auth).then(() => {
    window.location.href = "login.html";
  });
}

// =======================================================
// Documento principal del usuario
// (guarda: profileInfo, timeSpent)
// =======================================================

export async function loadUserDoc(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

export async function saveUserDoc(uid, partialData) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, partialData, { merge: true });
}

// =======================================================
// Subcolecciones: posts (Socialclub), photos (Memories), chats (Communities)
// Cada usuario tiene su propia subcolección privada:
//   users/{uid}/posts
//   users/{uid}/photos
//   users/{uid}/chats
// =======================================================

export async function addItem(uid, subcollection, data) {
  const colRef = collection(db, "users", uid, subcollection);
  const docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function getItems(uid, subcollection, max = 20) {
  const colRef = collection(db, "users", uid, subcollection);
  const q = query(colRef, orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteItem(uid, subcollection, itemId) {
  await deleteDoc(doc(db, "users", uid, subcollection, itemId));
}
