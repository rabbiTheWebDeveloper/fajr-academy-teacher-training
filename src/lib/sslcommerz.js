/**
 * SSLCommerz Payment Gateway Integration
 * Supports Next.js App Router with native fetch and SSLCommerz v4 API specifications.
 */

const STORE_ID =
  process.env.SSLCOMMERZ_STORE_ID ||
  process.env.SSL_STORE_ID ||
  "fajra6aa249a39ddb2";

const STORE_PASS =
  process.env.SSLCOMMERZ_STORE_PASSWORD ||
  process.env.SSL_STORE_PASS ||
  "fajra6aa249a39ddb2@ssl";

const IS_LIVE =
  process.env.SSLCOMMERZ_IS_LIVE === "true" ||
  process.env.SSLCOMMERZ_IS_LIVE === "1"
    ? true
    : false;

export class SSLCommerzPayment {
  constructor(store_id = STORE_ID, store_passwd = STORE_PASS, live = IS_LIVE) {
    this.baseURL = `https://${live ? "securepay" : "sandbox"}.sslcommerz.com`;
    this.initURL = `${this.baseURL}/gwprocess/v4/api.php`;
    this.validationURL = `${this.baseURL}/validator/api/validationserverAPI.php`;
    this.merchantTransIDURL = `${this.baseURL}/validator/api/merchantTransIDvalidationAPI.php`;
    this.store_id = store_id;
    this.store_passwd = store_passwd;
  }

  /**
   * Initialize payment session
   */
  async init(data) {
    const postData = {
      ...data,
      store_id: this.store_id,
      store_passwd: this.store_passwd,
    };

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(postData)) {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }

    const response = await fetch(this.initURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    });

    return await response.json();
  }

  /**
   * Validate order by val_id
   */
  async validate(data) {
    const params = new URLSearchParams({
      val_id: data.val_id,
      store_id: this.store_id,
      store_passwd: this.store_passwd,
      v: "1",
      format: "json",
    });

    const response = await fetch(`${this.validationURL}?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    });

    return await response.json();
  }

  /**
   * Initiate refund
   */
  async initiateRefund(data) {
    const params = new URLSearchParams({
      refund_amount: String(data.refund_amount),
      refund_remarks: data.refund_remarks || "",
      bank_tran_id: data.bank_tran_id,
      refe_id: data.refe_id,
      store_id: this.store_id,
      store_passwd: this.store_passwd,
      v: "1",
      format: "json",
    });

    const response = await fetch(`${this.merchantTransIDURL}?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    });

    return await response.json();
  }

  /**
   * Query status of a refund request
   */
  async refundQuery(data) {
    const params = new URLSearchParams({
      refund_ref_id: data.refund_ref_id,
      store_id: this.store_id,
      store_passwd: this.store_passwd,
      v: "1",
      format: "json",
    });

    const response = await fetch(`${this.merchantTransIDURL}?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    });

    return await response.json();
  }

  /**
   * Query transaction by session key
   */
  async transactionQueryBySessionId(data) {
    const params = new URLSearchParams({
      sessionkey: data.sessionkey,
      store_id: this.store_id,
      store_passwd: this.store_passwd,
      v: "1",
      format: "json",
    });

    const response = await fetch(`${this.merchantTransIDURL}?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    });

    return await response.json();
  }

  /**
   * Query transaction by transaction ID
   */
  async transactionQueryByTransactionId(data) {
    const params = new URLSearchParams({
      tran_id: data.tran_id,
      store_id: this.store_id,
      store_passwd: this.store_passwd,
      v: "1",
      format: "json",
    });

    const response = await fetch(`${this.merchantTransIDURL}?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    });

    return await response.json();
  }
}

/**
 * Helper to get instance
 */
export function getSSLCommerzInstance() {
  return new SSLCommerzPayment(STORE_ID, STORE_PASS, IS_LIVE);
}

/**
 * Initialize a Payment Session with SSLCommerz
 */
export async function initSSLCommerzPayment({
  tranId,
  amount = 1000,
  currency = "BDT",
  productName = "Fajr Academy Teacher Training (TOT)",
  productCategory = "Education",
  productProfile = "non-physical-goods",
  cusName = "Candidate Teacher",
  cusEmail = "candidate@fajracademy.io",
  cusPhone = "01700000000",
  cusAdd1 = "Dhaka, Bangladesh",
  cusAdd2 = "Dhaka",
  cusCity = "Dhaka",
  cusState = "Dhaka",
  cusPostcode = "1200",
  cusCountry = "Bangladesh",
  baseUrl,
}) {
  const rootUrl =
    baseUrl ||
    process.env.APP_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://careers.fajracademy.io"
      : "http://localhost:3000");

  const successUrl = `${rootUrl}/api/payment/sslcommerz/success?tran_id=${tranId}`;
  const failUrl = `${rootUrl}/api/payment/sslcommerz/fail?tran_id=${tranId}`;
  const cancelUrl = `${rootUrl}/api/payment/sslcommerz/cancel?tran_id=${tranId}`;
  const ipnUrl = `${rootUrl}/api/payment/sslcommerz/ipn`;

  const data = {
    total_amount: Number(amount) || 1000,
    currency: currency || "BDT",
    tran_id: tranId,
    success_url: successUrl,
    fail_url: failUrl,
    cancel_url: cancelUrl,
    ipn_url: ipnUrl,
    shipping_method: "NO",
    product_name: productName || "Teacher Training Course",
    product_category: productCategory || "Education",
    product_profile: productProfile || "non-physical-goods",
    cus_name: cusName || "Candidate Teacher",
    cus_email: cusEmail || "candidate@fajracademy.io",
    cus_add1: cusAdd1 || "Dhaka",
    cus_add2: cusAdd2 || "Dhaka",
    cus_city: cusCity || "Dhaka",
    cus_state: cusState || "Dhaka",
    cus_postcode: cusPostcode || "1000",
    cus_country: cusCountry || "Bangladesh",
    cus_phone: cusPhone || "01711111111",
    cus_fax: cusPhone || "01711111111",
    ship_name: cusName || "Candidate Teacher",
    ship_add1: cusAdd1 || "Dhaka",
    ship_add2: cusAdd2 || "Dhaka",
    ship_city: cusCity || "Dhaka",
    ship_state: cusState || "Dhaka",
    ship_postcode: cusPostcode || "1000",
    ship_country: cusCountry || "Bangladesh",
  };

  try {
    const sslcz = getSSLCommerzInstance();
    const apiResponse = await sslcz.init(data);

    if (apiResponse && apiResponse.GatewayPageURL) {
      return {
        success: true,
        gatewayUrl: apiResponse.GatewayPageURL,
        sessionkey: apiResponse.sessionkey,
        status: apiResponse.status,
        raw: apiResponse,
      };
    }

    throw new Error(
      apiResponse?.failedreason ||
        apiResponse?.message ||
        "SSLCommerz gateway session initialization failed."
    );
  } catch (error) {
    console.error("SSLCommerz Init Exception:", error);
    throw error;
  }
}

/**
 * Validate transaction after successful transaction
 */
export async function validateSSLCommerzPayment({ val_id }) {
  if (!val_id) {
    throw new Error("Validation ID (val_id) is required.");
  }
  const sslcz = getSSLCommerzInstance();
  return await sslcz.validate({ val_id });
}

/**
 * Initiate Refund through SSLCommerz API
 */
export async function initiateSSLCommerzRefund({
  refund_amount,
  refund_remarks = "Course Fee Refund",
  bank_tran_id,
  refe_id,
}) {
  if (!refund_amount || !bank_tran_id || !refe_id) {
    throw new Error("refund_amount, bank_tran_id, and refe_id are required for refund.");
  }
  const sslcz = getSSLCommerzInstance();
  return await sslcz.initiateRefund({
    refund_amount: Number(refund_amount),
    refund_remarks: refund_remarks || "Course Fee Refund",
    bank_tran_id,
    refe_id,
  });
}

/**
 * Query status of a refund request
 */
export async function querySSLCommerzRefund({ refund_ref_id }) {
  if (!refund_ref_id) {
    throw new Error("refund_ref_id is required.");
  }
  const sslcz = getSSLCommerzInstance();
  return await sslcz.refundQuery({ refund_ref_id });
}

/**
 * Query status of a transaction by Transaction ID (tran_id)
 */
export async function querySSLCommerzTransactionByTrxId({ tran_id }) {
  if (!tran_id) {
    throw new Error("tran_id is required.");
  }
  const sslcz = getSSLCommerzInstance();
  return await sslcz.transactionQueryByTransactionId({ tran_id });
}

/**
 * Query status of a transaction by Session ID (sessionkey)
 */
export async function querySSLCommerzTransactionBySessionId({ sessionkey }) {
  if (!sessionkey) {
    throw new Error("sessionkey is required.");
  }
  const sslcz = getSSLCommerzInstance();
  return await sslcz.transactionQueryBySessionId({ sessionkey });
}

export default SSLCommerzPayment;
