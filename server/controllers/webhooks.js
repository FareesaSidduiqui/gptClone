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

        if (appId === 'quickgpt') {
          const transaction = await Transaction.findOne({
            _id: transactionId,
            isPaid: false,
          })

          if (transaction) {
            // add credits to user
            await User.updateOne(
              { _id: transaction.userId },
              { $inc: { credits: transaction.credits } }
            )

            // mark transaction as paid
            transaction.isPaid = true
            await transaction.save()
          }
        }
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).send(`Internal server error: ${error.message}`)
  }
}
