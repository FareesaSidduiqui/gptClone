import Stripe from 'stripe'
import Transaction from '../models/transaction.js'
import User from '../models/User.js'

export const stripeWebhooks = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.Stripe_Webhook_Signing_key
    )
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message)
    return res.status(400).send(`Webhook Error: ${error.message}`)
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        console.log("PaymentIntent succeeded:", paymentIntent.id)

        // get the Checkout Session linked to this paymentIntent
        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        })

        const session = sessionList.data[0]
        if (!session) {
          console.log("No session found for paymentIntent:", paymentIntent.id)
          break
        }

        const { transactionId, appId } = session.metadata || {}
        console.log("Metadata:", { transactionId, appId })

        if (appId === 'quickgpt') {
          const transaction = await Transaction.findOne({
            _id: transactionId,
            isPaid: false,
          })

          if (!transaction) {
            console.log("Transaction not found or already paid:", transactionId)
            break
          }

          // update user credits
          await User.updateOne(
            { _id: transaction.userId },
            { $inc: { credits: transaction.credits } }
          )
          console.log("Credits added to user:", transaction.userId)

          // mark transaction as paid
          transaction.isPaid = true
          await transaction.save()
          console.log("Transaction marked as paid:", transactionId)
        } else {
          console.log("AppId mismatch:", appId)
        }

        break
      }

      default:
        console.log("Unhandled event type:", event.type)
    }

    res.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    res.status(500).send(`Internal server error: ${error.message}`)
  }
}
