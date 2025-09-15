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
    return res.status(400).send(`Webhook Error: ${error.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const { transactionId, appId } = session.metadata
        console.log("Processing checkout.session.completed for transactionId:", transactionId, "appId:", appId)

        if (appId === 'quickgpt') {
          const transaction = await Transaction.findOne({
            _id: transactionId,
            isPaid: false,
          })
          console.log("Transaction found:", !!transaction)
          if (transaction) {
            console.log("Transaction details:", { userId: transaction.userId, credits: transaction.credits })
            // add credits to user
            const userUpdateResult = await User.updateOne(
              { _id: transaction.userId },
              { $inc: { credits: transaction.credits } }
            )
            console.log("User update result:", userUpdateResult)

            // mark transaction as paid
            transaction.isPaid = true
            const saveResult = await transaction.save()
            console.log("Transaction save result:", saveResult)
          } else {
            console.log("Transaction not found or already paid for transactionId:", transactionId)
          }
        } else {
          console.log("AppId mismatch:", appId)
        }
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }
    console.log("Webhook event received:", event.type)
console.log("Session metadata:", event.data.object.metadata)


    res.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).send(`Internal server error: ${error.message}`)
  }
}
