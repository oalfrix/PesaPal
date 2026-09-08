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



  

    /* =========================================
       SUPABASE PAYMENT STATUS FUNCTION
    ========================================= */

    const SUPABASE_STATUS_URL =
      "https://hoaeocddgcrdpjrmnxxm.supabase.co/functions/v1/pesapal-status";


    /* =========================================
       ELEMENTS
    ========================================= */

    const paymentLoader =
      document.getElementById("paymentLoader");

    const loaderTitle =
      document.getElementById("loaderTitle");

    const loaderMessage =
      document.getElementById("loaderMessage");

    const paymentPopup =
      document.getElementById("paymentSuccessPopup");

    const failedPopup =
      document.getElementById("paymentFailedPopup");


    const closePaymentPopup =
      document.getElementById("closePaymentPopup");

    const closeFailedPopup =
      document.getElementById("closeFailedPopup");


    /* =========================================
       SHOW LOADER
    ========================================= */

    function showLoader(
      title = "Processing Payment",
      message = "Please wait..."
    ) {

      loaderTitle.textContent = title;

      loaderMessage.textContent = message;

      paymentLoader.classList.remove("hidden");
    }


    /* =========================================
       HIDE LOADER
    ========================================= */

    function hideLoader() {

      paymentLoader.classList.add("hidden");
    }


    /* =========================================
       SUCCESS POPUP
    ========================================= */

    function showSuccessPopup() {

      hideLoader();

      paymentPopup.classList.add("show");
    }


    /* =========================================
       FAILED POPUP
    ========================================= */

    function showFailedPopup() {

      hideLoader();

      failedPopup.classList.add("show");
    }


    /* =========================================
       CLOSE SUCCESS
    ========================================= */

    closePaymentPopup.addEventListener(
      "click",
      () => {

        paymentPopup.classList.remove("show");

        sessionStorage.removeItem(
          "pesapal_payment_result"
        );

        /*
          Remove PesaPal parameters from
          the browser address bar.
        */

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    );


    /* =========================================
       CLOSE FAILED
    ========================================= */

    closeFailedPopup.addEventListener(
      "click",
      () => {

        failedPopup.classList.remove("show");

        sessionStorage.removeItem(
          "pesapal_payment_result"
        );

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    );


    /* =========================================
       GET PESAPAL CALLBACK DATA
    ========================================= */

    const urlParams =
      new URLSearchParams(
        window.location.search
      );


    const trackingId =
      urlParams.get(
        "OrderTrackingId"
      );


    const merchantReference =
      urlParams.get(
        "OrderMerchantReference"
      );


    /* =========================================
       PAYMENT RETURNED FROM PESAPAL
    ========================================= */

    if (trackingId) {

      console.log(
        "PesaPal returned tracking ID:",
        trackingId
      );


      /*
        Save it in case the page refreshes.
      */

      sessionStorage.setItem(
        "pesapal_payment_result",

        JSON.stringify({
          trackingId,
          merchantReference,
          timestamp: Date.now()
        })
      );


      /*
        Start verification.
      */

      checkPaymentStatus(
        trackingId
      );

    }


    /* =========================================
       CHECK PAYMENT STATUS
    ========================================= */

    async function checkPaymentStatus(
      currentTrackingId
    ) {

      try {

        showLoader(
          "Confirming Payment",
          "Please wait while we confirm your payment..."
        );


        const response =
          await fetch(
            `${SUPABASE_STATUS_URL}?OrderTrackingId=${encodeURIComponent(
              currentTrackingId
            )}`
          );


        const data =
          await response.json();


        console.log(
          "Payment status:",
          data
        );


        /*
          SUCCESS
        */

        if (
          data.status === "PAID"
        ) {

          showSuccessPopup();

          sessionStorage.removeItem(
            "pesapal_payment_result"
          );

          return;
        }


        /*
          FAILED
        */

        if (
          data.status === "FAILED" ||
          data.status === "INVALID"
        ) {

          showFailedPopup();

          sessionStorage.removeItem(
            "pesapal_payment_result"
          );

          return;
        }


        /*
          STILL PROCESSING
        */

        setTimeout(
          () => {

            checkPaymentStatus(
              currentTrackingId
            );

          },
          3000
        );

      }

      catch (error) {

        console.error(
          "Payment status error:",
          error
        );


        /*
          Retry automatically.
        */

        setTimeout(
          () => {

            checkPaymentStatus(
              currentTrackingId
            );

          },
          3000
        );

      }

    }


    /* =========================================
       CHECK SAVED PAYMENT
       AFTER REFRESH
    ========================================= */

    if (!trackingId) {

      const savedPayment =
        sessionStorage.getItem(
          "pesapal_payment_result"
        );


      if (savedPayment) {

        try {

          const payment =
            JSON.parse(
              savedPayment
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
            "Invalid saved payment:",
            error
          );

          sessionStorage.removeItem(
            "pesapal_payment_result"
          );

        }

      }

    }


    /* =========================================
       CLEAN URL
       ========================================= */

    if (
      trackingId
    ) {

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

    }

  
