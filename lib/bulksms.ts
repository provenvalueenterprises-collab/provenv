import axios from 'axios';

interface BulkSMSConfig {
  apiToken: string;
  baseUrl: string;
}

interface SMSResponse {
  status: string;
  message: string;
  data?: any;
}

class BulkSMSNigeria {
  private config: BulkSMSConfig;

  constructor() {
    this.config = {
      apiToken: process.env.BULKSMS_API_TOKEN || '',
      baseUrl: 'https://www.bulksmsnigeria.com/api/v1'
    };

    if (!this.config.apiToken) {
      console.warn('⚠️ BulkSMS API token not configured. SMS functionality will be disabled.');
    }
  }

  /**
   * Send SMS using BulkSMSNigeria API
   */
  async sendSMS(to: string, message: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      if (!this.config.apiToken) {
        console.log(`📱 Development Mode - SMS to ${to}: ${message}`);
        return {
          success: true,
          message: 'SMS sent successfully (development mode)',
          data: { messageId: 'dev_' + Date.now() }
        };
      }

      // Clean phone number (remove any formatting)
      const cleanPhone = this.cleanPhoneNumber(to);
      
      console.log(`📱 Sending SMS via BulkSMSNigeria to ${cleanPhone}: ${message}`);

      const payload = {
        api_token: this.config.apiToken,
        to: cleanPhone,
        from: process.env.BULKSMS_SENDER_ID || 'PROVENV', // Your sender ID
        body: message,
        dnd: '2' // DND bypass option (check with BulkSMS for your account settings)
      };

      const response = await axios.post(`${this.config.baseUrl}/sms`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('✅ BulkSMS Response:', response.data);

      if (response.data && response.data.status === 'success') {
        return {
          success: true,
          message: 'SMS sent successfully',
          data: response.data.data
        };
      } else {
        console.error('❌ BulkSMS API Error:', response.data);
        return {
          success: false,
          message: response.data?.message || 'Failed to send SMS',
          data: response.data
        };
      }

    } catch (error: any) {
      console.error('❌ BulkSMS Error:', error.response?.data || error.message);
      
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || 'SMS service error',
          data: error.response.data
        };
      }

      return {
        success: false,
        message: 'Network error occurred while sending SMS'
      };
    }
  }

  /**
   * Send OTP SMS with standardized format
   */
  async sendOTP(phoneNumber: string, otp: string, expiryMinutes: number = 10): Promise<{ success: boolean; message: string }> {
    const message = `Your PROVENV verification code is: ${otp}. This code expires in ${expiryMinutes} minutes. Do not share this code with anyone.`;
    
    const result = await this.sendSMS(phoneNumber, message);
    return {
      success: result.success,
      message: result.message
    };
  }

  /**
   * Send password reset OTP
   */
  async sendPasswordResetOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
    const message = `Your PROVENV password reset code is: ${otp}. This code expires in 10 minutes. If you didn't request this, please ignore this message.`;
    
    const result = await this.sendSMS(phoneNumber, message);
    return {
      success: result.success,
      message: result.message
    };
  }

  /**
   * Clean phone number to Nigerian format
   */
  private cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle Nigerian phone numbers
    if (cleaned.startsWith('234')) {
      // Already in international format
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      // Local format (0803...) -> convert to international (234803...)
      return '234' + cleaned.substring(1);
    } else if (cleaned.length === 10) {
      // 10 digit format (803...) -> convert to international (234803...)
      return '234' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Get account balance (if supported by API)
   */
  async getBalance(): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      if (!this.config.apiToken) {
        return {
          success: false,
          message: 'API token not configured'
        };
      }

      const response = await axios.get(`${this.config.baseUrl}/balance`, {
        params: {
          api_token: this.config.apiToken
        },
        timeout: 15000
      });

      if (response.data && response.data.status === 'success') {
        return {
          success: true,
          balance: response.data.data?.balance,
          message: 'Balance retrieved successfully'
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Failed to get balance'
      };

    } catch (error: any) {
      console.error('❌ Balance Check Error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to check balance'
      };
    }
  }

  /**
   * Validate phone number format
   */
  isValidNigerianPhone(phone: string): boolean {
    const cleaned = this.cleanPhoneNumber(phone);
    
    // Check if it's a valid Nigerian number (234 + 10 digits)
    return /^234[7-9][0-1]\d{8}$/.test(cleaned);
  }
}

// Export singleton instance
export const bulkSMS = new BulkSMSNigeria();
export default bulkSMS;
