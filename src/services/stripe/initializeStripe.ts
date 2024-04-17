
let stripePromise: any | null

const initializeStripe = async () => {
  // initializing only on non-bex (yields error otherwise)
  if (process.env.MODE !== 'bex') {
    const stripe = await import ("@stripe/stripe-js")
    const {loadStripe} = stripe
    if (!stripePromise) {
      stripePromise = await loadStripe("pk_test_51Liaq8CRr6mfm8sfWjPJwrWRfcP1DDZxuruR6TaccotBFN4ugOlqpXGvaEcLpLOgfeLrK1hR1eCHLaGFSnxFvder00en9ZYYrd")
    }
    return stripePromise
  }

  return stripePromise
}

export default initializeStripe


