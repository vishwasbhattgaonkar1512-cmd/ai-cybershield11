import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import app from "../firebase";

const auth = getAuth(app);

export const signup = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);