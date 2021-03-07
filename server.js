// It is a node ja file
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
//  stripe with secret key
const stripe = require('stripe')("sk_test_51IRuUwB8Wa8sNbxw3HjQorwIDtRKcoai4x0NRXpW3a67hEKFpoo8zHOO3F1zPszRkRopr0eqMSWxuFqRY27YQUGd006rfaNi8Z");

const app = express();
app.use(cors());
app.use(express.json());

// get response home routes
app.get('/', (req, res) => {
    res.send('Welcome to react go shop website');
});

app.post('/checkout', async (req, res) => {
    let error;
    let status;
    try{
        // that have set at cart.js already
        const {product, token} = req.body;

        const customer = await stripe.customers.create({
            // email, id inside of token
            email: token.email,
            source: token.id,
        });
        // random id generator
        // const idempotency_key = Math.random();
        const key = uuidv4();
        // payment charge
        const charge = await stripe.charges.create({
            amount: product.price * 100,
            currency: 'INR', // use the currency of the country
            customer: customer.id,
            receipt_email: token.email,
            description: `Purchased the ${product.name}`,
            shipping: {
                name: token.card.name,
                address: {
                    line1: token.card.address_line1,
                    line2: token.card.address_line2,
                    city: token.card.address_city,
                    country: token.card.address_country,
                    postal_code: token.card.address_zip,

                }
            },


        }, {idempotencyKey: key});
        console.log('Charge->', {charge});
        status = "Success";
    }catch(error){
        console.log("Error->", error);
        status = "Failure";
    }
    // Data send in json format
    res.json({error, status});
});

app.listen(8080, () => {
    console.log('Your app is running on port 8080');
});