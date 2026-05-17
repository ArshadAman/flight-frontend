export const PAYMENT_CONFIG = {
  bankAccountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "987654321012",
  ifscCode: process.env.NEXT_PUBLIC_IFSC_CODE || "HDFC0001234",
  upiId: process.env.NEXT_PUBLIC_UPI_ID || "traveldeal@upi",
  splitPercentage: parseFloat(process.env.NEXT_PUBLIC_PAYMENT_SPLIT_PERCENTAGE || "0.5")
};
