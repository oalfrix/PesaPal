javascript
/*
|--------------------------------------------------------------------------
| Supabase Configuration
|--------------------------------------------------------------------------
*/

const SUPABASE_URL =
  "https://hoaeocddgcrdpjrmnxxm.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_PYFCQ0sTuxyUNAPFPedBpQ_1IQvlJTc";


/*
|--------------------------------------------------------------------------
| Elements
|--------------------------------------------------------------------------
*/

const paymentForm =
  document.getElementById("paymentForm");

const payButton =
  document.getElementById("payButton");

const message =
  document.getElementById("message");

const paymentLoader =
  document.getElementById("paymentLoader");


/*
|--------------------------------------------------------------------------
| Payment Form
|--------------------------------------------------------------------------
*/

paymentForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    /*
    |--------------------------------------------------------------------------
    | Get Form Values
    |--------------------------------------------------------------------------
    */

    const name =
      document
        .getElementById("name")
        .value
        .trim();

    const email =
      document
        .getElementById("email")
        .value
        .trim();

    const phone =
      document
        .getElementById("phone")
        .value
        .trim();

    const amount =
      Number(
        document
          .getElementById("amount")
          .value
      );


    /*
    |--------------------------------------------------------------------------
    | Validate Form
    |--------------------------------------------------------------------------
    */

    if (!name) {

      message.textContent =
        "Please enter your full name.";

      return;
    }


    if (!email) {

      message.textContent =
        "Please enter your email address.";

      return;
    }


    if (!phone) {

      message.textContent =
        "Please enter your phone number.";

      return;
    }


    if (!amount || amount <= 0) {

      message.textContent =
        "Please enter a valid amount.";

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | Show Payment Loader
    |--------------------------------------------------------------------------
    */

    paymentLoader.classList.remove(
      "hidden"
    );

    payButton.disabled = true;

    payButton.textContent =
      "Processing...";

    message.textContent = "";


    /*
    |--------------------------------------------------------------------------
    | Send Payment Request To Supabase
    |--------------------------------------------------------------------------
    */

    try {

      const response =
        await fetch(

          `${SUPABASE_URL}/functions/v1/pesapal-create-order`,

          {
            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              "apikey":
                SUPABASE_ANON_KEY,

              "Authorization":
                `Bearer ${SUPABASE_ANON_KEY}`

            },

            body: JSON.stringify({

              amount: amount,

              description:
                "Website Payment",

              customer_name:
                name,

              customer_email:
                email,

              customer_phone:
                phone

            })

          }

        );


      /*
      |--------------------------------------------------------------------------
      | Read Response
      |--------------------------------------------------------------------------
      */

      const data =
        await response.json();


      console.log(
        "PesaPal Response:",
        data
      );


      /*
      |--------------------------------------------------------------------------
      | Check Response
      |--------------------------------------------------------------------------
      */

      if (
        !response.ok ||
        !data.success ||
        !data.redirect_url
      ) {

        throw new Error(
          data.error ||
          "Unable to start payment."
        );

      }


      /*
      |--------------------------------------------------------------------------
      | Save Payment Information
      |--------------------------------------------------------------------------
      |
      | sessionStorage is used because we only need this information
      | while the customer is completing this payment.
      |
      */

      sessionStorage.setItem(

        "pesapal_payment_result",

        JSON.stringify({

          orderId:
            data.order_id,

          merchantReference:
            data.merchant_reference,

          trackingId:
            data.order_tracking_id

        })

      );


      /*
      |--------------------------------------------------------------------------
      | Update Loader
      |--------------------------------------------------------------------------
      */

      const loaderTitle =
        document.getElementById(
          "loaderTitle"
        );

      const loaderMessage =
        document.getElementById(
          "loaderMessage"
        );


      if (loaderTitle) {

        loaderTitle.textContent =
          "Opening PesaPal";

      }


      if (loaderMessage) {

        loaderMessage.textContent =
          "Please complete your payment. You will automatically return here when finished.";

      }


      /*
      |--------------------------------------------------------------------------
      | Open PesaPal Checkout
      |--------------------------------------------------------------------------
      */

      window.location.href =
        data.redirect_url;

    }


    /*
    |--------------------------------------------------------------------------
    | Handle Errors
    |--------------------------------------------------------------------------
    */

    catch (error) {

      console.error(
        "Payment Error:",
        error
      );


      /*
      |--------------------------------------------------------------------------
      | Hide Loader
      |--------------------------------------------------------------------------
      */

      paymentLoader.classList.add(
        "hidden"
      );


      /*
      |--------------------------------------------------------------------------
      | Enable Payment Button
      |--------------------------------------------------------------------------
      */

      payButton.disabled = false;

      payButton.textContent =
        "Pay with PesaPal";


      /*
      |--------------------------------------------------------------------------
      | Show Error
      |--------------------------------------------------------------------------
      */

      message.textContent =
        error.message ||
        "Something went wrong. Please try again.";

    }

  }
);

