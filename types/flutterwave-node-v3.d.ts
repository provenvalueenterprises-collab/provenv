declare module 'flutterwave-node-v3' {
  interface FlutterwaveConfig {
    public_key: string;
    secret_key: string;
    encryption_key?: string;
  }

  interface PaymentPayload {
    tx_ref: string;
    amount: number;
    currency: string;
    payment_options: string;
    redirect_url: string;
    customer: {
      email: string;
      phonenumber?: string;
      name: string;
    };
    customizations: {
      title: string;
      description: string;
      logo?: string;
    };
  }

  interface PaymentResponse {
    status: string;
    message: string;
    data: {
      link: string;
    };
  }

  interface VerificationResponse {
    status: string;
    message: string;
    data: {
      id: number;
      tx_ref: string;
      flw_ref: string;
      device_fingerprint: string;
      amount: number;
      currency: string;
      charged_amount: number;
      app_fee: number;
      merchant_fee: number;
      processor_response: string;
      auth_model: string;
      ip: string;
      narration: string;
      status: string;
      payment_type: string;
      created_at: string;
      account_id: number;
      customer: {
        id: number;
        name: string;
        phone_number: string;
        email: string;
        created_at: string;
      };
    };
  }

  class Flutterwave {
    constructor(config: FlutterwaveConfig);
    Payment: {
      initiate(payload: PaymentPayload): Promise<PaymentResponse>;
    };
    Transaction: {
      verify(params: { id: string }): Promise<VerificationResponse>;
    };
  }

  export = Flutterwave;
}
