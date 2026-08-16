'use client'
import React, { useContext } from 'react'
import { Check } from 'lucide-react'
import StripePlans from '@/data/StripePlans'
import { UserDetailsContext } from '@/context/UserDetailContext'
import { Button } from '@/components/ui/button'
import PageShell from '@/components/custom/PageShell'

const Pricing = () => {
  const { userDetails } = useContext(UserDetailsContext)

  const checkout = (link) => {
    if (!link) return
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <PageShell wide>
      <div className='text-center sm:text-left'>
        <h1 className='text-3xl font-bold'>My Subscription</h1>
        <p className='text-gray-400 mt-1 max-w-2xl mx-auto sm:mx-0'>
          Upgrade with Stripe. These are test-mode links, so use a Stripe test card
          (for example <span className='text-gray-300'>4242 4242 4242 4242</span>).
        </p>
      </div>

      <section className='mt-8 border rounded-xl bg-[#151515] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <div className='text-sm text-gray-400'>Current plan</div>
          <div className='text-2xl font-semibold mt-1'>Free</div>
          {userDetails?.email && (
            <div className='text-sm text-gray-400 mt-1'>{userDetails.email}</div>
          )}
        </div>
        <p className='text-sm text-gray-400 max-w-sm'>
          After checkout, Stripe handles the subscription. Returning here does not
          auto-update the plan badge until a webhook is wired — the charge still goes through.
        </p>
      </section>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-3xl mx-auto w-full'>
        {StripePlans.map((plan) => (
          <div
            key={plan.priceId}
            className={`border rounded-xl bg-[#151515] p-6 flex flex-col ${
              plan.highlight
                ? 'border-blue-500/60 ring-1 ring-blue-500/40'
                : 'hover:border-blue-500/40'
            } transition-colors`}
          >
            {plan.highlight && (
              <span className='text-xs text-blue-400 font-medium mb-2'>Best value</span>
            )}
            <div className='font-semibold text-lg'>{plan.name}</div>
            <div className='mt-2'>
              <span className='text-3xl font-bold'>${plan.price}</span>
              <span className='text-gray-400 text-sm'>
                /{plan.duration === 'Yearly' ? 'year' : 'month'}
              </span>
            </div>
            <p className='text-sm text-gray-400 mt-3 leading-6'>{plan.desc}</p>
            <ul className='mt-4 space-y-2 text-sm text-gray-400 flex-1'>
              {plan.features.map((feature) => (
                <li key={feature} className='flex items-start gap-2'>
                  <Check className='h-4 w-4 mt-0.5 shrink-0 text-blue-400' />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className='mt-6 w-full bg-blue-500 text-white hover:bg-blue-600'
              onClick={() => checkout(plan.link)}
            >
              Subscribe with Stripe
            </Button>
          </div>
        ))}
      </div>

      <section className='mt-8 border rounded-xl bg-[#151515] p-6 max-w-3xl mx-auto w-full'>
        <h2 className='font-semibold mb-3'>What every account gets today</h2>
        <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-400'>
          {[
            'Unlimited saved projects',
            'Full editor with live preview',
            'Export and open in CodeSandbox',
            'Projects available on any device'
          ].map((item) => (
            <li key={item} className='flex items-start gap-2'>
              <Check className='h-4 w-4 mt-0.5 shrink-0 text-blue-400' />
              {item}
            </li>
          ))}
        </ul>
        <p className='text-xs text-gray-500 mt-5'>
          Checkout opens Stripe&apos;s hosted page. Links are in test mode until you switch
          them to live payment links in the Stripe Dashboard.
        </p>
      </section>
    </PageShell>
  )
}

export default Pricing
