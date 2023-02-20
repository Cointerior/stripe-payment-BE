require("dotenv").config()
const express = require("express")
const app = express()
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
const cors = require("cors")

const PORT = process.env.PORT
app.use(express.json())
app.use(express.static("client"))

app.use(cors({
    origin: "http://127.0.0.1:5500"
}))

const storeItems = new Map([
    [1, { priceInCents: 10000, name: "Learn React Today" }], [2, { priceInCents: 20000, name: "Learn CSS today "}]
])

app.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment", // or subcription
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id)
                return {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInCents
                    },
                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.CLIENT_URL}/success.html`,
            cancel_url: `${process.env.CLIENT_URL}/cancel.html`
        })
        res.json({ url: session.url })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})