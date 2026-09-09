/**
 * SSLCommerz Gateway Helper for Fajr Academy
 */

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID || process.env.SSL_STORE_ID || "";
const STORE_PASS = process.env.SSLCOMMERZ_STORE_PASSWORD || process.env.SSL_STORE_PASS || "";
const IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === "true" || process.env.NODE_ENV === "production" && !!process.env.SSLCOMMERZ_STORE_ID;

export async function initSSLCommerzPayment({
  tranId,
  amount = 1000,
  productName = "Fajr Academy Teacher Training (TOT)",
  productCategory = "Education",
  cusName,
  cusEmail,
  cusPhone,
  cusAdd1 = "Dhaka, Bangladesh",
  cusCity = "Dhaka",
  cusCountry = "Bangladesh",
  baseUrl,
}) {
  const successUrl = `${baseUrl}/api/payment/sslcommerz/success?tran_id=${tranId}`;
  const failUrl = `${baseUrl}/api/payment/sslcommerz/fail?tran_id=${tranId}`;
  const cancelUrl = `${baseUrl}/api/payment/sslcommerz/cancel?tran_id=${tranId}`;
  const ipnUrl = `${baseUrl}/api/payment/sslcommerz/ipn`;

  // If live or sandbox credentials are present
  if (STORE_ID && STORE_PASS) {
    const endpoint = IS_LIVE
      ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
      : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

    const params = new URLSearchParams({
      store_id: STORE_ID,
      store_passwd: STORE_PASS,
      total_amount: amount.toString(),
      currency: "BDT",
      tran_id: tranId,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      ipn_url: ipnUrl,
      shipping_method: "NO",
      product_name: productName,
      product_category: productCategory,
      product_profile: "non-physical-goods",
      cus_name: cusName || "Candidate Teacher",
      cus_email: cusEmail || "teacher@fajracademy.io",
      cus_add1: cusAdd1,
      cus_city: cusCity,
      cus_country: cusCountry,
      cus_phone: cusPhone || "01700000000",
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (data.status === "SUCCESS" && data.GatewayPageURL) {
        return {
          success: true,
          gatewayUrl: data.GatewayPageURL,
          sessionKey: data.sessionkey,
          isSimulation: false,
        };
      }
    } catch (err) {
      console.warn("SSLCommerz live request error, falling back to simulated gateway:", err);
    }
  }

  // Fallback to dynamic SSLCommerz Gateway checkout UI
  const simulationUrl = `${baseUrl}/payment/ssl-checkout?tran_id=${tranId}&amount=${amount}&name=${encodeURIComponent(
    cusName || ""
  )}&email=${encodeURIComponent(cusEmail || "")}&phone=${encodeURIComponent(
    cusPhone || ""
  )}`;

  return {
    success: true,
    gatewayUrl: simulationUrl,
    sessionKey: `SIM_${Date.now()}`,
    isSimulation: true,
  };
}
