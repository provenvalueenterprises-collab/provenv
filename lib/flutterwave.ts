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
      publicKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-DEVELOPMENT',
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY || 'FLWSECK_TEST-DEVELOPMENT',
      encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY || 'FLWSECK_TEST-encryption',
      webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH || 'test-webhook-secret',
    };

    // Check if we have real Flutterwave keys (test or live)
    const hasRealKeys = this.config.secretKey.startsWith('FLWSECK_TEST-') || 
                       this.config.secretKey.startsWith('FLWSECK-') ||
                       (this.config.publicKey.startsWith('FLWPUBK_TEST-') && !this.config.secretKey.includes('SANDBOXDEMOKEY'));

    if (hasRealKeys) {
      console.log('🔑 Initializing Flutterwave with real credentials...');
      this.flw = new Flutterwave({
        public_key: this.config.publicKey,
        secret_key: this.config.secretKey,
        encryption_key: this.config.encryptionKey
      });
    } else {
      console.log('🧪 Flutterwave initialized in development mode (placeholder keys detected)');
      this.flw = null; // Will use mock responses
    }
  }

  async initializePayment(data: PaymentData): Promise<FlutterwaveResponse> {
    try {
      // Check if we're in development mode
      if (!this.flw) {
        console.log('🧪 Development mode - using mock payment response');
        return this.initializePaymentAlternative(data);
      }

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
      // Check if we have real Flutterwave keys (test or live) vs placeholder keys
      const hasRealKeys = this.config.secretKey.startsWith('FLWSECK_TEST-') || 
                         this.config.secretKey.startsWith('FLWSECK-') ||
                         (this.config.publicKey.startsWith('FLWPUBK_TEST-') && !this.config.secretKey.includes('SANDBOXDEMOKEY'));

      if (!hasRealKeys) {
        console.log('🧪 Development mode detected - using mock Flutterwave response');
        console.log('💰 Amount:', data.amount);
        console.log('👤 Customer:', data.customerEmail);
        console.log('📝 Reference:', data.paymentReference);
        
        // Return a mock successful response that redirects to your test wallet page
        return {
          status: 'success',
          message: 'Mock payment initialized for development',
          data: {
            link: `${process.env.NEXTAUTH_URL}/wallet-test?amount=${data.amount}&ref=${data.paymentReference}&email=${data.customerEmail}`,
            id: `mock_${Date.now()}`,
            tx_ref: data.paymentReference,
          },
        };
      }

      console.log('🔄 Using Flutterwave Hosted Payment Link with real credentials...');
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
    bvn?: string;
    nin?: string;
    txRef: string;
    isPermanent?: boolean;
  }): Promise<any> {
    try {
      console.log('🏦 Creating virtual account for:', data.email);
      
      // Check if we're in development mode
      if (!this.flw) {
        console.log('🧪 Development mode: Creating mock virtual account');
        return {
          status: 'success',
          message: 'Mock virtual account created for development',
          data: {
            account_number: `90${Math.floor(Math.random() * 100000000)}`,
            bank_name: 'Test Bank (Development)',
            flw_ref: `MOCK_VA_${Date.now()}`,
            account_name: data.email.split('@')[0],
          }
        };
      }

      // Use either BVN or NIN (Flutterwave accepts both for static virtual accounts)
      const identificationNumber = data.bvn || data.nin;
      if (!identificationNumber) {
        throw new Error('Either BVN or NIN is required for virtual account creation');
      }

      const payload = {
        email: data.email,
        bvn: identificationNumber, // Flutterwave API uses 'bvn' field but accepts both BVN and NIN
        tx_ref: data.txRef,
        is_permanent: data.isPermanent !== false, // Default to true
      };

      console.log('📤 Sending virtual account creation request to Flutterwave...');
      console.log(`🆔 Using ${data.bvn ? 'BVN' : 'NIN'}:`, identificationNumber);

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
