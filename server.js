const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
dotenv.config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create a Checkout Session
app.post('/create-checkout-session', async (req, res) => {
    console.log(req.headers.origin)
    try {
        const { items } = req.body;

        const line_items = items.map(item => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        images: [item.image],
                    },
                    unit_amount: item.amount,
                },
                quantity: item.quantity,
            };
        })

        const session = await stripe.checkout.sessions.create({
            submit_type: 'pay',
            mode: 'payment',
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            shipping_options: [
                { shipping_rate: 'shr_1PsrpXJFvEq7Eqxk0VEgLpKY' },
                { shipping_rate: 'shr_1PsrsfJFvEq7EqxkSHPyXL5y' },
            ],
            line_items,
            success_url: `${req.headers.origin}/success`,
            cancel_url: `${req.headers.origin}/cancel`,
        });

        res.status(200).json(session);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

