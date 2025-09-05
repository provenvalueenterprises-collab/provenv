import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

interface ContributionPlan {
  id: string
  name: string
  category: string
  accounts_count: number
  registration_fee: number
  daily_amount: number
  total_contribution: number
  settlement_amount: number
  duration_months: number
}

export default function PlanSelection() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plans, setPlans] = useState<ContributionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || !session) {
      router.push('/login')
      return
    }

    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans/available')
        if (response.ok) {
          const data = await response.json()
          setPlans(data.plans || [])
        }
      } catch (error) {
        console.error('Error fetching plans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [session, status, router])

  const handleEnroll = async (planId: string) => {
    if (!selectedPlan) return
    
    setEnrolling(true)
    try {
      const response = await fetch('/api/thrift/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      if (response.ok) {
        router.push('/dashboard?enrolled=true')
      } else {
        const error = await response.json()
        alert(`Enrollment failed: ${error.message}`)
      }
    } catch (error) {
      console.error('Enrollment error:', error)
      alert('Enrollment failed. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>🔄</div>
          <div style={{ fontSize: '18px' }}>Loading contribution plans...</div>
        </div>
      </div>
    )
  }

  const standardPlans = plans.filter(p => p.category === 'standard')
  const otherPlans = plans.filter(p => p.category !== 'standard')

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          marginBottom: '30px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', color: '#1f2937' }}>
            🎯 Choose Your Thrift Plan
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280', margin: 0 }}>
            Start your savings journey with ProVenv. All plans mature in 1 year with guaranteed returns.
          </p>
        </div>

        {/* Standard Plans */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#1f2937' }}>
            📊 Standard Plans
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {standardPlans.map((plan) => (
              <div key={plan.id} style={{
                backgroundColor: 'white',
                border: selectedPlan === plan.id ? '3px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '25px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedPlan === plan.id ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => setSelectedPlan(plan.id)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ fontSize: '20px', margin: 0, color: '#1f2937' }}>
                    {plan.name}
                  </h3>
                  <div style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {plan.accounts_count} Account{plan.accounts_count > 1 ? 's' : ''}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    fontSize: '14px'
                  }}>
                    <div>
                      <span style={{ color: '#6b7280' }}>Registration:</span>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937' }}>
                        ₦{plan.registration_fee.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Daily Amount:</span>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937' }}>
                        ₦{plan.daily_amount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Total Contribution:</span>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#dc2626' }}>
                        ₦{plan.total_contribution.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Settlement:</span>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#10b981' }}>
                        ₦{plan.settlement_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#f3f4f6',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                    Profit after 1 year:
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                    ₦{(plan.settlement_amount - plan.total_contribution).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                    {Math.round(((plan.settlement_amount - plan.total_contribution) / plan.total_contribution) * 100)}% return
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Plans */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#1f2937' }}>
            💎 Other Packages
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {otherPlans.map((plan) => (
              <div key={plan.id} style={{
                backgroundColor: 'white',
                border: selectedPlan === plan.id ? '3px solid #10b981' : '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '25px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedPlan === plan.id ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => setSelectedPlan(plan.id)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ fontSize: '20px', margin: 0, color: '#1f2937' }}>
                    {plan.name}
                  </h3>
                  <div style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {plan.category.toUpperCase()}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    fontSize: '14px'
                  }}>
                    <div>
                      <span style={{ color: '#6b7280' }}>Registration:</span>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937' }}>
                        ₦{plan.registration_fee.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Daily Amount:</span>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937' }}>
                        ₦{plan.daily_amount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Total Contribution:</span>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#dc2626' }}>
                        ₦{plan.total_contribution.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Settlement:</span>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#10b981' }}>
                        ₦{plan.settlement_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#f3f4f6',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                    Profit after 1 year:
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                    ₦{(plan.settlement_amount - plan.total_contribution).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                    {Math.round(((plan.settlement_amount - plan.total_contribution) / plan.total_contribution) * 100)}% return
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment Section */}
        {selectedPlan && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #3b82f6'
          }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#1f2937' }}>
              🎯 Ready to Start?
            </h3>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px' }}>
              You've selected a plan. Click below to enroll and start your thrift journey!
            </p>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <button 
                onClick={() => handleEnroll(selectedPlan)}
                disabled={enrolling}
                style={{
                  backgroundColor: enrolling ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  cursor: enrolling ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {enrolling ? '⏳ Enrolling...' : '🚀 Enroll Now'}
              </button>
              
              <button 
                onClick={() => setSelectedPlan(null)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '10px',
          padding: '20px',
          marginTop: '30px'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#92400e' }}>
            ⚡ Fast Track Opportunity
          </h3>
          <div style={{ fontSize: '14px', color: '#92400e', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 10px 0' }}>
              🔥 <strong>Refer 10+ people within 2 months</strong> to unlock Fast Track benefits:
            </p>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li>⚡ Settlement in <strong>9 months instead of 12</strong></li>
              <li>💰 <strong>₦50,000 total referral bonus</strong></li>
              <li>🎁 <strong>₦5,000 recharge card reward</strong></li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
