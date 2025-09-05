import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

interface OrphanedUser {
  id: string
  email: string
  phone?: string
  first_name?: string
  last_name?: string
  created_at: string
}

interface CleanupData {
  success: boolean
  orphaned_profiles: OrphanedUser[]
  summary: {
    total_profiles: number
    total_auth_users: number
    orphaned_count: number
  }
}

export default function CleanupOrphanedUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<CleanupData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cleaning, setCleaning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || !session) {
      router.push('/login')
      return
    }

    fetchOrphanedUsers()
  }, [session, status, router])

  const fetchOrphanedUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/cleanup-orphaned-users')
      if (response.ok) {
        const result = await response.json()
        setData(result)
        setError(null)
      } else {
        setError('Failed to fetch orphaned users')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCleanup = async () => {
    if (!data || data.orphaned_profiles.length === 0) return

    const confirmCleanup = confirm(
      `Are you sure you want to delete ${data.orphaned_profiles.length} orphaned user profiles and all their related data? This action cannot be undone.`
    )

    if (!confirmCleanup) return

    try {
      setCleaning(true)
      const response = await fetch('/api/admin/cleanup-orphaned-users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE_ORPHANED_USERS' })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Successfully cleaned up ${result.deleted_profiles} orphaned user profiles!`)
        fetchOrphanedUsers() // Refresh the data
      } else {
        const errorData = await response.json()
        alert(`Cleanup failed: ${errorData.message}`)
      }
    } catch (err) {
      console.error('Cleanup error:', err)
      alert('Cleanup failed. Please try again.')
    } finally {
      setCleaning(false)
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
          <div style={{ fontSize: '18px' }}>Checking for orphaned users...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>❌</div>
          <div style={{ fontSize: '18px' }}>Error: {error}</div>
          <button 
            onClick={fetchOrphanedUsers}
            style={{
              marginTop: '20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: '#1f2937'
          }}>
            🧹 Cleanup Orphaned Users
          </h1>
          <p style={{ 
            color: '#6b7280', 
            marginBottom: '30px',
            fontSize: '16px'
          }}>
            Users that exist in users_profiles but have been deleted from auth.users
          </p>

          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              backgroundColor: '#eff6ff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #dbeafe'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
                {data?.summary.total_auth_users || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Auth Users</div>
            </div>
            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #dcfce7'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
                {data?.summary.total_profiles || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total User Profiles</div>
            </div>
            <div style={{
              backgroundColor: data?.summary.orphaned_count === 0 ? '#f0fdf4' : '#fef2f2',
              padding: '20px',
              borderRadius: '8px',
              border: `1px solid ${data?.summary.orphaned_count === 0 ? '#dcfce7' : '#fecaca'}`
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: data?.summary.orphaned_count === 0 ? '#166534' : '#dc2626'
              }}>
                {data?.summary.orphaned_count || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Orphaned Profiles</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <button
              onClick={fetchOrphanedUsers}
              disabled={loading}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: loading ? 0.7 : 1
              }}
            >
              🔄 Refresh Check
            </button>

            {data && data.orphaned_profiles.length > 0 && (
              <button
                onClick={handleCleanup}
                disabled={cleaning}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  cursor: cleaning ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: cleaning ? 0.7 : 1
                }}
              >
                {cleaning ? '🗑️ Cleaning...' : `🗑️ Delete ${data.orphaned_profiles.length} Orphaned Users`}
              </button>
            )}
          </div>

          {/* Results */}
          {data && data.orphaned_profiles.length === 0 ? (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #dcfce7',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#166534', marginBottom: '5px' }}>
                No Orphaned Users Found
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Your database is clean! All user profiles have corresponding auth records.
              </div>
            </div>
          ) : (
            data && (
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '20px',
                  color: '#1f2937'
                }}>
                  Orphaned User Profiles ({data.orphaned_profiles.length})
                </h3>
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '15px'
                  }}>
                    {data.orphaned_profiles.map((user) => (
                      <div
                        key={user.id}
                        style={{
                          backgroundColor: 'white',
                          padding: '15px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca'
                        }}
                      >
                        <div style={{
                          fontWeight: 'bold',
                          color: '#1f2937',
                          marginBottom: '5px'
                        }}>
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : 'No name'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '3px' }}>
                          📧 {user.email}
                        </div>
                        {user.phone && (
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '3px' }}>
                            📱 {user.phone}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Navigation Back */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
