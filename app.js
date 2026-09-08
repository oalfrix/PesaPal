
/*
|--------------------------------------------------------------------------
| SUPABASE
|--------------------------------------------------------------------------
*/

const SUPABASE_URL =
  "https://hoaeocddgcrdpjrmnxxm.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_PYFCQ0sTuxyUNAPFPedBpQ_1IQvlJTc";


/*
|--------------------------------------------------------------------------
| SUPABASE FUNCTIONS
|--------------------------------------------------------------------------
*/

const CREATE_ORDER_URL =
  `${SUPABASE_URL}/functions/v1/pesapal-create-order`;

const STATUS_URL =
  `${SUPABASE_URL}/functions/v1/pesapal-status`;


/*
|--------------------------------------------------------------------------
| ELEMENTS
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

const loaderTitle =
  document.getElementById("loaderTitle");

const loaderMessage =
  document.getElementById("loaderMessage");

const successPopup =
  document.getElementById("paymentSuccessPopup");

const failedPopup =
  document.getElementById("paymentFailedPopup");

const closeSuccess =
  document.getElementById("closeSuccessPopup");

const closeFailed =
  document.getElementById("closeFailedPopup");


/*
|--------------------------------------------------------------------------
| LOADER
|--------------------------------------------------------------------------
*/

function showLoader(title, text) {

  loaderTitle.textContent =
    title || "Processing Payment";

  loaderMessage.textContent =
    text || "Please wait...";

  paymentLoader.classList.remove(
    "hidden"
  );
}


function hideLoader() {

  paymentLoader.classList.add(
    "hidden"
  );

}


/*
|--------------------------------------------------------------------------
| SUCCESS POPUP
|--------------------------------------------------------------------------
*/

function showSuccess() {

  hideLoader();

  successPopup.classList.add(
    "show"
  );

}


/*
|--------------------------------------------------------------------------
| FAILED POPUP
|--------------------------------------------------------------------------
*/

function showFailed() {

  hideLoader();

  failedPopup.classList.add(
    "show"
  );

}


/*
|--------------------------------------------------------------------------
| CLEAN URL
|--------------------------------------------------------------------------
*/

function cleanUrl() {

  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );

}


/*
|--------------------------------------------------------------------------
| CLOSE SUCCESS
|--------------------------------------------------------------------------
*/

closeSuccess.addEventListener(
  "click",
  function () {

    successPopup.classList.remove(
      "show"
    );

    sessionStorage.removeItem(
      "pesapal_payment"
    );

    paymentForm.reset();

    payButton.disabled = false;

    payButton.textContent =
      "Pay with PesaPal";

    cleanUrl();

  }
);


/*
|--------------------------------------------------------------------------
| CLOSE FAILED
|--------------------------------------------------------------------------
*/

closeFailed.addEventListener(
  "click",
  function () {

    failedPopup.classList.remove(
      "show"
    );

    sessionStorage.removeItem(
      "pesapal_payment"
    );

    paymentForm.reset();

    payButton.disabled = false;

    payButton.textContent =
      "Pay with PesaPal";

    message.textContent = "";

    cleanUrl();

  }
);


/*
|--------------------------------------------------------------------------
| CHECK PAYMENT STATUS
|--------------------------------------------------------------------------
*/

async function checkPaymentStatus(
  trackingId
) {

  if (!trackingId) {
    return;
  }


  try {

    showLoader(
      "Confirming Payment",
      "Please wait while we confirm your payment..."
    );


    const response =
      await fetch(
        `${STATUS_URL}?OrderTrackingId=${encodeURIComponent(
          trackingId
        )}`
      );


    const data =
      await response.json();


    console.log(
      "Payment Status:",
      data
    );


    /*
    |--------------------------------------------------------------------------
    | PAID
    |--------------------------------------------------------------------------
    */

    if (
      data.status === "PAID"
    ) {

      sessionStorage.removeItem(
        "pesapal_payment"
      );

      showSuccess();

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | FAILED
    |--------------------------------------------------------------------------
    */

    if (
      data.status === "FAILED" ||
      data.status === "INVALID"
    ) {

      sessionStorage.removeItem(
        "pesapal_payment"
      );

      showFailed();

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | STILL PROCESSING
    |--------------------------------------------------------------------------
    */

    setTimeout(
      function () {

        checkPaymentStatus(
          trackingId
        );

      },
      3000
    );

  }

  catch (error) {

    console.error(
      "Status check error:",
      error
    );


    /*
    |--------------------------------------------------------------------------
    | RETRY
    |--------------------------------------------------------------------------
    */

    setTimeout(
      function () {

        checkPaymentStatus(
          trackingId
        );

      },
      3000
    );

  }

}


/*
|--------------------------------------------------------------------------
| CHECK IF CUSTOMER RETURNED FROM PESAPAL
|--------------------------------------------------------------------------
*/

const params =
  new URLSearchParams(
    window.location.search
  );


const trackingId =
  params.get(
    "OrderTrackingId"
  );


const merchantReference =
  params.get(
    "OrderMerchantReference"
  );


if (trackingId) {

  console.log(
    "Returned from PesaPal:",
    trackingId
  );


  sessionStorage.setItem(

    "pesapal_payment",

    JSON.stringify({

      trackingId:
        trackingId,

      merchantReference:
        merchantReference

    })

  );


  cleanUrl();


  checkPaymentStatus(
    trackingId
  );

}


/*
|--------------------------------------------------------------------------
| RESTORE PAYMENT CHECK
|--------------------------------------------------------------------------
*/

if (!trackingId) {

  const saved =
    sessionStorage.getItem(
      "pesapal_payment"
    );


  if (saved) {

    try {

      const payment =
        JSON.parse(
          saved
        );


      if (
        payment.trackingId
      ) {

        checkPaymentStatus(
          payment.trackingId
        );

      }

    }

    catch (error) {

      console.error(
        "Invalid payment data:",
        error
      );

      sessionStorage.removeItem(
        "pesapal_payment"
      );

    }

  }

}


/*
|--------------------------------------------------------------------------
| PAYMENT FORM
|--------------------------------------------------------------------------
*/

paymentForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    /*
    |--------------------------------------------------------------------------
    | GET VALUES
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
    | VALIDATION
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


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      message.textContent =
        "Please enter a valid amount.";

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | SHOW LOADING POPUP IMMEDIATELY
    |--------------------------------------------------------------------------
    */

    showLoader(
      "Processing Payment",
      "Please wait while we prepare your payment..."
    );


    payButton.disabled = true;

    payButton.textContent =
      "Processing...";

    message.textContent = "";


    /*
    |--------------------------------------------------------------------------
    | CREATE ORDER
    |--------------------------------------------------------------------------
    */

    try {

      const response =
        await fetch(
          CREATE_ORDER_URL,
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

              amount:
                amount,

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
      | READ RESPONSE
      |--------------------------------------------------------------------------
      */

      const data =
        await response.json();


      console.log(
        "Create Order Response:",
        data
      );


      /*
      |--------------------------------------------------------------------------
      | CHECK RESPONSE
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
      | SAVE PAYMENT
      |--------------------------------------------------------------------------
      */

      sessionStorage.setItem(

        "pesapal_payment",

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
      | UPDATE LOADER
      |--------------------------------------------------------------------------
      */

      loaderTitle.textContent =
        "Opening PesaPal";

      loaderMessage.textContent =
        "Please complete your payment. You will return here automatically.";


      /*
      |--------------------------------------------------------------------------
      | OPEN PESAPAL
      |--------------------------------------------------------------------------
      */

      window.location.href =
        data.redirect_url;

    }


    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

    catch (error) {

      console.error(
        "Payment Error:",
        error
      );


      hideLoader();


      payButton.disabled =
        false;

      payButton.textContent =
        "Pay with PesaPal";


      message.textContent =
        error.message ||
        "Something went wrong. Please try again.";

    }

  }
);
