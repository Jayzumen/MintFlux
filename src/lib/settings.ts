import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { UserSettings } from "../types/settings";

export const saveUserSettings = async (uid: string, settings: UserSettings) => {
  try {
    await setDoc(doc(db, "users", uid), settings, { merge: true });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getUserSettings = async (
  uid: string,
): Promise<UserSettings | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserSettings;
    }
    return null;
  } catch (error) {
    return null;
  }
};
