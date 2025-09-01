// lib/monnify.ts
import axios from 'axios';

interface MonnifyConfig {
  apiKey: string;
  secretKey: string;
  contractCode: string;
  baseUrl: string;
}

interface PaymentData {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  paymentDescription: string;
  contractCode: string;
  redirectUrl: string;
  paymentMethods: string[];
}

interface MonnifyResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseCode: string;
  responseBody: {
    checkoutUrl: string;
    paymentReference: string;
  };
}

class MonnifyService {
  private config: MonnifyConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY!,
      secretKey: process.env.NEXT_PUBLIC_MONNIFY_SECRET_KEY!,
      contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE!,
      baseUrl: process.env.NEXT_PUBLIC_MONNIFY_BASE_URL!,
    };
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(
        `${this.config.apiKey}:${this.config.secretKey}`
      ).toString('base64');

      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/auth/login`,
        {},
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.requestSuccessful) {
        this.accessToken = response.data.responseBody.accessToken;
        // Token expires in 1 hour
        this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000); // 55 minutes
        
        if (!this.accessToken) {
          throw new Error('Access token is null despite successful response');
        }
        
        return this.accessToken;
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('Monnify auth error:', error);
      throw new Error('Failed to authenticate with Monnify');
    }
  }

  async initializePayment(data: PaymentData): Promise<MonnifyResponse> {
    try {
      const token = await this.getAccessToken();

      const paymentPayload = {
        amount: data.amount,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        paymentReference: data.paymentReference,
        paymentDescription: data.paymentDescription,
        contractCode: this.config.contractCode,
        redirectUrl: data.redirectUrl,
        paymentMethods: data.paymentMethods,
      };

      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/merchant/transactions/init-transaction`,
        paymentPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Monnify payment initialization error:', error);
      throw new Error('Failed to initialize payment');
    }
  }

  async verifyPayment(paymentReference: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.config.baseUrl}/api/v1/merchant/transactions/${paymentReference}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Monnify payment verification error:', error);
      throw new Error('Failed to verify payment');
    }
  }
}

export const monnifyService = new MonnifyService();
