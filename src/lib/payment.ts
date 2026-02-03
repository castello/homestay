// 토스페이먼츠 결제 헬퍼
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || '';
const TOSS_API_URL = 'https://api.tosspayments.com/v1';

function getAuthHeader() {
  const encoded = Buffer.from(TOSS_SECRET_KEY + ':').toString('base64');
  return `Basic ${encoded}`;
}

export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
  const response = await fetch(`${TOSS_API_URL}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '결제 확인에 실패했습니다.');
  }

  return response.json();
}

export async function cancelPayment(paymentKey: string, cancelReason: string, cancelAmount?: number) {
  const body: Record<string, unknown> = { cancelReason };
  if (cancelAmount) body.cancelAmount = cancelAmount;

  const response = await fetch(`${TOSS_API_URL}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '결제 취소에 실패했습니다.');
  }

  return response.json();
}

export function generateOrderId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RSV-${dateStr}-${random}`;
}

export function calculateRefundAmount(
  totalAmount: number,
  cancelPolicy: string,
  checkInDate: Date
): number {
  const now = new Date();
  const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  switch (cancelPolicy) {
    case 'flexible':
      return daysUntilCheckIn >= 1 ? totalAmount : 0;
    case 'moderate':
      if (daysUntilCheckIn >= 5) return totalAmount;
      if (daysUntilCheckIn >= 1) return Math.floor(totalAmount * 0.5);
      return 0;
    case 'strict':
      if (daysUntilCheckIn >= 14) return totalAmount;
      if (daysUntilCheckIn >= 7) return Math.floor(totalAmount * 0.5);
      return 0;
    case 'super_strict':
      if (daysUntilCheckIn >= 30) return Math.floor(totalAmount * 0.5);
      return 0;
    default:
      return 0;
  }
}
