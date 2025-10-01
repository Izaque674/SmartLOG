// /front-end/src/firebase-config.js

import { initializeApp } from "firebase/app";
// IMPORTAMOS O SERVIÇO DE AUTENTICAÇÃO
import { getAuth } from "firebase/auth"; 
// IMPORTAMOS O SERVIÇO DE BANCO DE DADOS (VAMOS USAR EM BREVE)
import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCSRdF-Nt9vynPpX4paqtz-maELR-UEYUg",
  authDomain: "smartlog-tcc.firebaseapp.com",
  projectId: "smartlog-tcc",
  storageBucket: "smartlog-tcc.firebasestorage.app",
  messagingSenderId: "1088636045543",
  appId: "1:1088636045543:web:f17bdd2c2c9ae178dc3a42"
};

const app = initializeApp(firebaseConfig);

// INICIALIZAMOS OS SERVIÇOS E EXPORTAMOS ELES
// Assim, outros arquivos do nosso projeto podem usá-los.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);