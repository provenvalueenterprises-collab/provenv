// lib/flutterwave.ts
import Flutterwave from 'flutterwave-node-v3';

interface FlutterwaveConfig {
  publicKey: string;
  secretKey: string;
  encryptionKey: string;
  webhookSecret: string;
}

interface PaymentData {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  paymentDescription: string;
  redirectUrl: string;
  currency?: string;
}

interface FlutterwaveResponse {
  status: string;
  message: string;
  data: {
    link: string;
    id: string;
    tx_ref: string;
  };
}

class FlutterwaveService {
  private flw: any;
  private config: FlutterwaveConfig;

  constructor() {
    this.config = {
      publicKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY!,
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
      encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY!,
      webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH!,
    };

    this.flw = new Flutterwave({
      public_key: this.config.publicKey,
      secret_key: this.config.secretKey,
      encryption_key: this.config.encryptionKey
    });
  }

  async initializePayment(data: PaymentData): Promise<FlutterwaveResponse> {
    try {
      console.log('🔐 Initializing Flutterwave payment...');
      console.log('💰 Amount:', data.amount);
      console.log('👤 Customer:', data.customerEmail);
      console.log('📝 Reference:', data.paymentReference);

      const payload = {
        tx_ref: data.paymentReference,
        amount: data.amount,
        currency: data.currency || 'NGN',
        redirect_url: data.redirectUrl,
        customer: {
          email: data.customerEmail,
          name: data.customerName,
        },
        customizations: {
          title: 'ProvenValue Payment',
          description: data.paymentDescription,
          logo: 'https://provenvalue.com/logo.png', // Add your logo URL
        },
        payment_options: 'card,banktransfer,ussd',
        meta: {
          source: 'web',
          consumer_id: data.customerEmail,
        },
      };

      console.log('📤 Sending payload to Flutterwave...');
      
      // Use the standard payment link creation
      const response = await this.flw.Payment.create(payload);

      console.log('📡 Flutterwave response status:', response.status);
      console.log('📄 Flutterwave response:', response);

      if (response.status === 'success') {
        console.log('✅ Flutterwave payment initialization successful');
        return {
          status: 'success',
          message: response.message,
          data: {
            link: response.data.link,
            id: response.data.id,
            tx_ref: response.data.tx_ref,
          },
        };
      } else {
        console.error('❌ Flutterwave payment initialization failed:', response);
        throw new Error(`Flutterwave error: ${response.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('❌ Flutterwave payment initialization error:', error.message);
      console.error('📄 Error details:', error);
      
      // If Payment.create doesn't exist, try alternative methods
      if (error.message.includes('Cannot read properties') || error.message.includes('is not a function')) {
        console.log('🔄 Trying alternative Flutterwave method...');
        return this.initializePaymentAlternative(data);
      }
      
      throw new Error('Failed to initialize payment with Flutterwave');
    }
  }

  async initializePaymentAlternative(data: PaymentData): Promise<FlutterwaveResponse> {
    try {
      console.log('🔄 Using Flutterwave Hosted Payment Link...');
      
      const payload = {
        tx_ref: data.paymentReference,
        amount: data.amount,
        currency: data.currency || 'NGN',
        redirect_url: data.redirectUrl,
        customer: {
          email: data.customerEmail,
          name: data.customerName,
        },
        customizations: {
          title: 'ProvenValue Payment',
          description: data.paymentDescription,
        },
        payment_options: 'card,banktransfer,ussd',
      };

      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      console.log('📡 Direct API response:', result);

      if (result.status === 'success') {
        return {
          status: 'success',
          message: result.message,
          data: {
            link: result.data.link,
            id: result.data.id || 'hosted-payment',
            tx_ref: result.data.tx_ref || data.paymentReference,
          },
        };
      } else {
        throw new Error(`Flutterwave API error: ${result.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('❌ Alternative payment method error:', error.message);
      throw new Error('Failed to initialize payment with Flutterwave alternative method');
    }
  }

  async verifyPayment(transactionId: string): Promise<any> {
    try {
      console.log('🔍 Verifying Flutterwave payment:', transactionId);
      
      const response = await this.flw.Transaction.verify({ id: transactionId });
      
      console.log('📡 Verification response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Payment verification error:', error.message);
      throw new Error('Failed to verify payment');
    }
  }

  async createVirtualAccount(data: {
    email: string;
    bvn: string;
    txRef: string;
    isPermanent?: boolean;
  }): Promise<any> {
    try {
      console.log('🏦 Creating virtual account for:', data.email);
      
      const payload = {
        email: data.email,
        bvn: data.bvn,
        tx_ref: data.txRef,
        is_permanent: data.isPermanent !== false, // Default to true
      };

      const response = await this.flw.VirtualAcct.create(payload);
      
      console.log('📡 Virtual account response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Virtual account creation error:', error.message);
      throw new Error('Failed to create virtual account');
    }
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      // Verify webhook signature using Flutterwave's method
      return signature === this.config.webhookSecret;
    } catch (error) {
      console.error('❌ Webhook verification error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const flutterwaveService = new FlutterwaveService();
export default flutterwaveService;
