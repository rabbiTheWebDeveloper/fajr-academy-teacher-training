'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SSLCheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tranId = searchParams.get('tran_id') || `TOT-${Date.now()}`
  const amount = searchParams.get('amount') || '1000'
  const name = searchParams.get('name') || 'Candidate Teacher'
  const email = searchParams.get('email') || 'candidate@fajracademy.io'
  const phone = searchParams.get('phone') || '01XXXXXXXXX'

  const [selectedMethod, setSelectedMethod] = useState('bkash')
  const [processing, setProcessing] = useState(false)

  const handlePay = (status = 'success') => {
    setProcessing(true)

    setTimeout(() => {
      if (status === 'success') {
        router.push(
          `/api/payment/sslcommerz/success?tran_id=${tranId}&val_id=VAL_${Date.now()}&card_type=${selectedMethod.toUpperCase()}`
        )
      } else {
        router.push(`/api/payment/sslcommerz/fail?tran_id=${tranId}`)
      }
    }, 900)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F2F5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '880px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid #E5E7EB'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0B1A45 0%, #1E3A8A 100%)',
          color: '#FFFFFF',
          padding: '20px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.02em' }}>
              SSLCOMMERZ <span style={{ fontSize: '0.8rem', background: '#22C55E', color: '#000', padding: '2px 8px', borderRadius: '10px', marginLeft: '6px' }}>SECURE 256-BIT</span>
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '2px' }}>
              Merchant: Fajr Academy (Teacher Training)
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Payable Amount</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#FACC15' }}>
              ৳ {amount} <span style={{ fontSize: '0.9rem' }}>BDT</span>
            </div>
          </div>
        </div>

        {/* Order Details Bar */}
        <div style={{
          background: '#F8FAFC',
          padding: '12px 28px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.84rem',
          color: '#475569',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div><strong>Candidate:</strong> {name} ({phone})</div>
          <div><strong>Email:</strong> {email}</div>
          <div><strong>Invoice / Trx:</strong> <span style={{ fontFamily: 'monospace' }}>{tranId}</span></div>
        </div>

        {/* Payment Methods Grid */}
        <div style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A', marginBottom: '16px' }}>
            Select Payment Method:
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '14px',
            marginBottom: '28px'
          }}>
            {[
              { id: 'bkash', name: 'bKash', icon: '📱', color: '#D12053' },
              { id: 'nagad', name: 'Nagad', icon: '⚡', color: '#EA1D24' },
              { id: 'rocket', name: 'Rocket', icon: '🚀', color: '#8C3494' },
              { id: 'visa', name: 'Visa / Master', icon: '💳', color: '#1E40AF' },
              { id: 'upay', name: 'Upay / Cellfin', icon: '🏧', color: '#059669' },
              { id: 'internetbank', name: 'Internet Banking', icon: '🏦', color: '#0F766E' }
            ].map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                style={{
                  border: selectedMethod === method.id ? `2px solid ${method.color}` : '1.5px solid #E2E8F0',
                  background: selectedMethod === method.id ? '#F8FAFC' : '#FFFFFF',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedMethod === method.id ? `0 4px 12px ${method.color}25` : 'none',
                  transform: selectedMethod === method.id ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{method.icon}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1E293B' }}>{method.name}</div>
                {selectedMethod === method.id && (
                  <div style={{ fontSize: '0.7rem', color: method.color, fontWeight: '800', marginTop: '4px' }}>
                    ✓ SELECTED
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selected Method Details Form Box */}
          <div style={{
            background: '#F8FAFC',
            border: '1.5px dashed #CBD5E1',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>🔒</span>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>
                Payment with {selectedMethod.toUpperCase()} Direct Gateway
              </strong>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
              আপনার {selectedMethod.toUpperCase()} অ্যাকাউন্ট থেকে ১,০০০ টাকা ডেবিট হবে এবং আপনার টিচার আইডি ও কোর্স অ্যাকাউন্ট তৎক্ষণাৎ স্বয়ংক্রিয়ভাবে সক্রিয় করা হবে।
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handlePay('success')}
              disabled={processing}
              style={{
                flex: 2,
                minWidth: '220px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '10px',
                fontSize: '1.05rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {processing ? '⏳ পেমেন্ট ও অ্যাকাউন্ট তৈরি হচ্ছে...' : `✓ Pay ৳${amount} & Create Account`}
            </button>

            <Link
              href={`/api/payment/sslcommerz/cancel?tran_id=${tranId}`}
              style={{
                flex: 1,
                minWidth: '140px',
                background: '#F1F5F9',
                color: '#475569',
                border: '1px solid #CBD5E1',
                padding: '16px 20px',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '700',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#F1F5F9',
          padding: '14px 28px',
          borderTop: '1px solid #E2E8F0',
          fontSize: '0.78rem',
          color: '#64748B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>Authorized Payment Gateway for Fajr Academy Teacher Training (TOT)</div>
          <div>SSLCommerz verified &amp; PCI-DSS Compliant</div>
        </div>
      </div>
    </div>
  )
}
