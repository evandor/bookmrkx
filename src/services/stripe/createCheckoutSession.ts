import getStripe from "./initializeStripe"
import {collection, getDoc, doc, onSnapshot, setDoc, addDoc} from "firebase/firestore";
import FirebaseServices from "src/services/firebase/FirebaseServices";
//import {firestore} from "boot/firebase";

export async function createCheckoutSession(uid: string) {
  //     await setDoc(doc(firestore, "users", credentials.user.uid), {
  const cos = collection(FirebaseServices.getFirestore(), "users", uid, "checkout_sessions")
  const checkoutSessionData = {
    price:"price_1OWd4pCRr6mfm8sfBfcpGMtl",
    // success_url: window.location.origin,
    // cancel_url: window.location.origin
    success_url: "https://tabsets.web.app",
    cancel_url: "https://tabsets.web.app"
  }
  console.log("creating checkout session", checkoutSessionData)
  const checkoutSessionRef = await addDoc(cos, checkoutSessionData)
  // const checkoutSessionRef = addDoc(firestore, "users", uid, "checkout_sessions", {
  //   price:"price_1OWMMzCRr6mfm8sfmdhEphQ6",
  //   success_url: window.location.origin,
  //   cancel_url: window.location.origin
  // })


  onSnapshot(checkoutSessionRef, async (snap:any) => {
    console.log("onSnapshot", snap)
    const {sessionId} = snap.data()
    console.log("got sessionId", sessionId)
    if (sessionId) {
      const stripe = await getStripe()
      console.log("got stripe", stripe)
      stripe?.redirectToCheckout({sessionId})
    }
  })

}
