
/*
|--------------------------------------------------------------------------
| Supabase Configuration
|--------------------------------------------------------------------------
|
| Replace these with your actual Supabase project details.
|
*/

const SUPABASE_URL =
  "https://YOUR_PROJECT_REF.supabase.co";

const SUPABASE_ANON_KEY =
  "YOUR_SUPABASE_PUBLISHABLE_KEY";


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
    | Validate Amount
    |--------------------------------------------------------------------------
    */

    if (!amount || amount <= 0) {

      message.textContent =
        "Please enter a valid amount.";

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | Show Loading
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
    | Send Payment Request
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
      | Save Order Information
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(

        "pesapal_order",

        JSON.stringify({

          order_id:
            data.order_id,

          merchant_reference:
            data.merchant_reference,

          tracking_id:
            data.order_tracking_id

        })

      );


      /*
      |--------------------------------------------------------------------------
      | Redirect To PesaPal
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
      | Enable Button
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
