// src/lib/ipaymu.ts
import crypto from 'crypto';

function getIpaymuTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

export function generateIpaymuHeaders(
  body: Record<string, unknown>,
  method: 'POST' | 'GET' = 'POST'
) {
  const va = process.env.IPAYMU_VA!;
  const apiKey = process.env.IPAYMU_API_KEY!;

  const bodyString = JSON.stringify(body);
  const bodyHash = crypto
    .createHash('sha256')
    .update(bodyString)
    .digest('hex')
    .toLowerCase();

  const stringToSign = `${method}:${va}:${bodyHash}:${apiKey}`;
  const signature = crypto
    .createHmac('sha256', apiKey)
    .update(stringToSign)
    .digest('hex');

  return {
    headers: {
      'Content-Type': 'application/json',
      va,
      signature,
      timestamp: getIpaymuTimestamp(),
    },
    bodyString,
  };
}