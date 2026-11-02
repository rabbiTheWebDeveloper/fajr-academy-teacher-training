/**
 * Pure check of an SSLCommerz validation-API response against our stored payment.
 * Kept dependency-free so it can be unit-tested in isolation.
 *
 * @param {object|null} validation  response of validationserverAPI.php
 * @param {{tranId: string, amount: number, currency?: string}} payment  our record
 * @returns {null | "not_valid" | "tran_mismatch" | "currency_mismatch" | "amount_mismatch"}
 */
export const GATEWAY_OK = ["VALID", "VALIDATED"];

export function validationProblem(validation, payment) {
  if (!validation || !GATEWAY_OK.includes(validation.status)) return "not_valid";
  if (validation.tran_id !== payment.tranId) return "tran_mismatch";

  // currency_type / currency_amount = what the transaction was initiated with.
  const initiatedCurrency = validation.currency_type || validation.currency || "BDT";
  if (initiatedCurrency !== (payment.currency || "BDT")) return "currency_mismatch";

  const paid = Number(validation.currency_amount ?? validation.amount);
  if (!(paid >= Number(payment.amount) - 0.5)) return "amount_mismatch";
  return null;
}
