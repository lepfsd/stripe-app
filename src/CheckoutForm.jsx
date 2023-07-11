import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
//import { Button, Input } from "antd";
import { useState } from "react";

function CheckoutForm() {

  // collect data from the user
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // stripe items
  const stripe = useStripe();
  const elements = useElements();

  // main function
  const createSubscription = async () => {
    try {
      //crate payment method
      const paymentMethod = await stripe?.createPaymentMethod({
        type: "card",
        card: elements?.getElement(CardElement),
        billing_details: {
          name,
          email,
        },
      });
      console.log(`payment method: ${paymentMethod}`)
      // call the backend to create subscription
      const response = await fetch("http://localhost:4300/api/subscription/stripe/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: paymentMethod?.paymentMethod?.id,
          "app_store_id": "t5dcpa",
          "plan_id": 2
        }),
      }).then((res) => res.json());
      console.log(response.clientSecret)
      const confirmPayment = await stripe?.confirmCardPayment(
        response.clientSecret, {
          payment_method: {
            card: elements?.getElement(CardElement),
            billing_details: {
              name: name
            },
          },
        }  
      );
      console.log(confirmPayment?.paymentIntent?.id)
      // call the backend to confirm the payment
      const responsePayment = await fetch("http://localhost:4300/api/subscription/stripe/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_intent: confirmPayment?.paymentIntent?.id,
          payment_method: 'pm_card_visa',
          receipt_email: email,
          id: response.subscriptionId,
          client_id: response.clientId
       
        }),
      }).then((res) => res.json());

      console.log(responsePayment);
      alert("Success! Check your email for the invoice.");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="grid gap-4 m-auto">
      
      <input
        placeholder="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <input
        placeholder="Email"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <CardElement />
      <button onClick={createSubscription} disabled={!stripe}>
        Subscribe
      </button>
    </div>
  );

}

export default CheckoutForm;

 