import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import Header from '@/components/Header'

interface ContactEndpoint {
  id: string
  name: string
  type: string
}

interface ConversationResult {
  index: number
  customerName: string
  status: 'pending' | 'success' | 'error'
  error?: string
}

const VERTICALS = [
  'E-commerce',
  'SaaS',
  'Financial Services',
  'Healthcare',
  'Travel',
  'Telecom',
]

export default function ConversationGeneratorPage() {
  const [apiToken, setApiToken] = useState('')
  const [vertical, setVertical] = useState('E-commerce')
  const [contactEndpoints, setContactEndpoints] = useState<ContactEndpoint[]>([])
  const [selectedEndpointId, setSelectedEndpointId] = useState('')
  const [numberOfConversations, setNumberOfConversations] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<ConversationResult[]>([])
  const [error, setError] = useState('')
  const [loadingEndpoints, setLoadingEndpoints] = useState(false)

  // Load API token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('dixa_api_token')
    if (savedToken) {
      setApiToken(savedToken)
      fetchContactEndpoints(savedToken)
    }
  }, [])

  const fetchContactEndpoints = async (token: string) => {
    setLoadingEndpoints(true)
    setError('')
    try {
      const response = await fetch('https://dev.dixa.io/v1/contact-endpoints', {
        headers: {
          Authorization: token,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch contact endpoints. Check your API token.')
      }

      const data = await response.json()
      const emailEndpoints = data.data.filter((ep: ContactEndpoint) => ep.type === 'Email')
      setContactEndpoints(emailEndpoints)

      if (emailEndpoints.length > 0) {
        setSelectedEndpointId(emailEndpoints[0].id)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contact endpoints')
      setContactEndpoints([])
    } finally {
      setLoadingEndpoints(false)
    }
  }

  const handleTokenChange = (e: ChangeEvent<HTMLInputElement>) => {
    const token = e.target.value
    setApiToken(token)
    if (token) {
      localStorage.setItem('dixa_api_token', token)
      fetchContactEndpoints(token)
    } else {
      localStorage.removeItem('dixa_api_token')
      setContactEndpoints([])
    }
  }

  const generateCustomerData = (index: number) => {
    const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const displayName = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}.${index}@testcustomer.com`

    return { displayName, email }
  }

  const generateConversationContent = (vertical: string) => {
    const templates: Record<string, { subjects: string[]; messages: string[] }> = {
      'E-commerce': {
        subjects: [
          'Question about my order #12345',
          'Return request for recent purchase',
          'Product not as described',
          'Delivery tracking issue',
          'Discount code not working',
        ],
        messages: [
          'Hi, I placed an order last week but haven\'t received any tracking information yet. Can you help me find out where my package is?',
          'I received my order today, but the item doesn\'t match the description on your website. I\'d like to return it for a refund.',
          'The discount code I received via email isn\'t working at checkout. Can you please check what\'s wrong?',
          'My package was marked as delivered but I haven\'t received it. Can you help me locate it?',
          'I\'m trying to change my shipping address before my order ships. Is this still possible?',
        ],
      },
      'SaaS': {
        subjects: [
          'Cannot log into my account',
          'Feature request: Export functionality',
          'Billing question about recent charge',
          'Integration with third-party tool',
          'Account upgrade inquiry',
        ],
        messages: [
          'I\'ve been trying to log into my account for the past hour but keep getting an error message. Can you help?',
          'Is there a way to export my data to CSV? I couldn\'t find this option in the dashboard.',
          'I noticed a charge on my card that I wasn\'t expecting. Can you explain what this is for?',
          'Does your platform integrate with Salesforce? I need to sync our customer data.',
          'I\'d like to upgrade my plan to get access to the advanced features. What are my options?',
        ],
      },
      'Financial Services': {
        subjects: [
          'Question about recent transaction',
          'Card declined at merchant',
          'Requesting account statement',
          'Interest rate inquiry',
          'Lost card replacement',
        ],
        messages: [
          'I see a transaction on my account that I don\'t recognize. Can you provide more details about this charge?',
          'My card was declined when I tried to make a purchase today, even though I have sufficient funds. What could be the issue?',
          'Could you please send me a statement for the last 3 months? I need it for my records.',
          'What are the current interest rates for savings accounts? I\'m considering transferring funds.',
          'I lost my card yesterday. Can you freeze it and send me a replacement?',
        ],
      },
      'Healthcare': {
        subjects: [
          'Appointment rescheduling request',
          'Question about test results',
          'Prescription refill needed',
          'Insurance coverage inquiry',
          'Medical records request',
        ],
        messages: [
          'I need to reschedule my appointment next week due to a conflict. Are there any available slots earlier?',
          'I had blood work done last week and was told results would be ready in 3 days. Can you check on the status?',
          'My prescription is about to run out. Can I get a refill without coming in for an appointment?',
          'Does my insurance plan cover the procedure we discussed? I want to understand my out-of-pocket costs.',
          'I\'m moving to a new city and need copies of my medical records. How do I request these?',
        ],
      },
      'Travel': {
        subjects: [
          'Flight cancellation and refund',
          'Hotel booking modification',
          'Luggage lost during flight',
          'Travel insurance claim',
          'Booking confirmation not received',
        ],
        messages: [
          'My flight was cancelled and I need to rebook. What are my options and will I get a refund?',
          'I need to change the dates of my hotel reservation. The original booking was for next month.',
          'I arrived at my destination but my luggage didn\'t. Can you help me track it down?',
          'I had to cancel my trip due to a medical emergency. How do I file a claim with travel insurance?',
          'I completed my booking online but never received a confirmation email. Can you verify my reservation?',
        ],
      },
      'Telecom': {
        subjects: [
          'Internet connection issues',
          'Bill higher than expected',
          'Upgrade to faster plan',
          'Service outage in my area',
          'Router troubleshooting help',
        ],
        messages: [
          'My internet has been very slow for the past few days. I\'ve tried restarting the router but it hasn\'t helped.',
          'My bill this month is $20 higher than usual. Can you explain what changed?',
          'I\'m interested in upgrading to your fiber plan. Is it available in my area?',
          'Is there a service outage in my neighborhood? My internet has been down since this morning.',
          'My router keeps disconnecting every few hours. Can you walk me through some troubleshooting steps?',
        ],
      },
    }

    const template = templates[vertical] || templates['E-commerce']
    const randomSubject = template.subjects[Math.floor(Math.random() * template.subjects.length)]
    const randomMessage = template.messages[Math.floor(Math.random() * template.messages.length)]

    return { subject: randomSubject, message: randomMessage }
  }

  const createEndUser = async (displayName: string, email: string) => {
    const response = await fetch('https://dev.dixa.io/v1/endusers', {
      method: 'POST',
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ displayName, email }),
    })

    if (!response.ok) {
      throw new Error('Failed to create end user')
    }

    const data = await response.json()
    return data.data.id
  }

  const createConversation = async (endUserId: string, contactEndpointId: string, subject: string, message: string) => {
    const response = await fetch('https://dev.dixa.io/v1/conversations', {
      method: 'POST',
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requesterId: endUserId,
        contactEndpointId,
        subject,
        message: { content: message },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create conversation')
    }

    return await response.json()
  }

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsGenerating(true)
    setResults([])

    try {
      // Initialize results array
      const initialResults: ConversationResult[] = Array.from({ length: numberOfConversations }, (_, i) => ({
        index: i + 1,
        customerName: '',
        status: 'pending',
      }))
      setResults(initialResults)

      // Create conversations one by one
      for (let i = 0; i < numberOfConversations; i++) {
        const { displayName, email } = generateCustomerData(i)
        const { subject, message } = generateConversationContent(vertical)

        try {
          // Update status to show we're working on this one
          setResults((prev) => prev.map((r, idx) => idx === i ? { ...r, customerName: displayName } : r))

          // Create end user
          const endUserId = await createEndUser(displayName, email)

          // Create conversation
          await createConversation(endUserId, selectedEndpointId, subject, message)

          // Mark as success
          setResults((prev) =>
            prev.map((r, idx) =>
              idx === i ? { ...r, status: 'success' } : r
            )
          )
        } catch (err: any) {
          // Mark as error
          setResults((prev) =>
            prev.map((r, idx) =>
              idx === i ? { ...r, status: 'error', error: err.message } : r
            )
          )
        }

        // Small delay between requests to avoid rate limiting
        if (i < numberOfConversations - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate conversations')
    } finally {
      setIsGenerating(false)
    }
  }

  const successCount = results.filter((r) => r.status === 'success').length
  const errorCount = results.filter((r) => r.status === 'error').length
  const pendingCount = results.filter((r) => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-background-light">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-secondary hover:text-primary transition-colors">
            ← Back to Hub
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Conversation Generator</h1>
          <p className="text-secondary">
            Generate test conversations in your Dixa instance for demo and testing purposes
          </p>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-lg border border-secondary/20 p-6 mb-6">
          <h2 className="text-xl font-semibold text-primary mb-4">Configuration</h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* API Token */}
            <div>
              <label htmlFor="apiToken" className="block text-sm font-medium text-primary mb-2">
                Dixa API Token *
              </label>
              <input
                id="apiToken"
                type="password"
                value={apiToken}
                onChange={handleTokenChange}
                required
                placeholder="Enter your Dixa API token"
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="mt-1 text-xs text-secondary">
                Your API token is stored locally in your browser
              </p>
            </div>

            {/* Vertical/Theme */}
            <div>
              <label htmlFor="vertical" className="block text-sm font-medium text-primary mb-2">
                Industry Vertical *
              </label>
              <select
                id="vertical"
                value={vertical}
                onChange={(e) => setVertical(e.target.value)}
                required
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {VERTICALS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Endpoint */}
            <div>
              <label htmlFor="endpoint" className="block text-sm font-medium text-primary mb-2">
                Email Contact Endpoint *
              </label>
              <select
                id="endpoint"
                value={selectedEndpointId}
                onChange={(e) => setSelectedEndpointId(e.target.value)}
                required
                disabled={loadingEndpoints || contactEndpoints.length === 0}
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingEndpoints ? (
                  <option>Loading endpoints...</option>
                ) : contactEndpoints.length === 0 ? (
                  <option>No email endpoints found</option>
                ) : (
                  contactEndpoints.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      {ep.name}
                    </option>
                  ))
                )}
              </select>
              {contactEndpoints.length === 0 && apiToken && !loadingEndpoints && (
                <p className="mt-1 text-xs text-error-red">
                  No email endpoints found. Check your API token or create an email endpoint in Dixa.
                </p>
              )}
            </div>

            {/* Number of Conversations */}
            <div>
              <label htmlFor="count" className="block text-sm font-medium text-primary mb-2">
                Number of Conversations *
              </label>
              <input
                id="count"
                type="number"
                min="1"
                max="50"
                value={numberOfConversations}
                onChange={(e) => setNumberOfConversations(Math.min(50, Math.max(1, parseInt(e.target.value) || 10)))}
                required
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="mt-1 text-xs text-secondary">
                Create between 1 and 50 conversations
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-error-red/20 text-error-red px-4 py-3 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating || !apiToken || contactEndpoints.length === 0}
              className="w-full bg-primary text-light-text py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating Conversations...' : 'Generate Conversations'}
            </button>
          </form>
        </div>

        {/* Progress and Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg border border-secondary/20 p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Progress</h2>

            {/* Summary */}
            <div className="mb-4 flex gap-4 text-sm">
              <span className="text-secondary">
                ✅ Success: <span className="font-semibold text-green-600">{successCount}</span>
              </span>
              <span className="text-secondary">
                ❌ Failed: <span className="font-semibold text-error-red">{errorCount}</span>
              </span>
              <span className="text-secondary">
                ⏳ Pending: <span className="font-semibold text-secondary">{pendingCount}</span>
              </span>
            </div>

            {/* Results List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.index}
                  className={`p-3 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : result.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-primary">
                        Conversation {result.index}
                        {result.customerName && ` - ${result.customerName}`}
                      </span>
                      {result.error && (
                        <p className="text-xs text-error-red mt-1">{result.error}</p>
                      )}
                    </div>
                    <div className="ml-4">
                      {result.status === 'success' && <span className="text-green-600">✅</span>}
                      {result.status === 'error' && <span className="text-error-red">❌</span>}
                      {result.status === 'pending' && <span className="text-secondary">⏳</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Summary */}
            {!isGenerating && results.length > 0 && (
              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-primary">
                  <strong>Generation Complete!</strong> Created {successCount} of {results.length} conversations successfully.
                  {errorCount > 0 && ` ${errorCount} failed.`}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
