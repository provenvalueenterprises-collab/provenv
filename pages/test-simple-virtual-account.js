import { useSession } from 'next-auth/react'
import SimpleVirtualAccountCard from '../components/SimpleVirtualAccountCard'

export default function TestSimpleVirtualAccount() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🔒 Please log in to test the virtual account component</h1>
        <p>You need to be logged in to create and view virtual accounts.</p>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        🧪 Virtual Account Component Test
      </h1>
      
      <div style={{ 
        backgroundColor: '#e5e7eb', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>
          📧 Logged in as: {session.user.email}
        </h3>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          Testing the simplified Virtual Account Card component with working Flutterwave integration
        </p>
      </div>

      <SimpleVirtualAccountCard user={session.user} />

      <div style={{ 
        backgroundColor: '#dbeafe', 
        padding: '16px', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1e40af'
      }}>
        <strong>💡 How this component works:</strong><br />
        1. ✅ Checks if user has a virtual account<br />
        2. ✅ Shows "Generate Virtual Account" button if none exists<br />
        3. ✅ Collects NIN and creates account via Flutterwave API<br />
        4. ✅ Displays account details for funding<br />
        5. ✅ Provides Flutterwave payment integration for card funding
      </div>

      <div style={{ 
        fontSize: '12px', 
        color: '#6b7280', 
        textAlign: 'center', 
        marginTop: '32px' 
      }}>
        🔒 Test Environment • Complete Flutterwave Integration
      </div>
    </div>
  )
}
