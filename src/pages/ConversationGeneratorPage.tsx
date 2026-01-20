import { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Header from '@/components/Header'
import CreateOrganizationModal from '@/components/CreateOrganizationModal'
import { dixaApi } from '@/lib/dixaApi'
import { supabase } from '@/lib/supabase'

interface Organization {
  id: string
  name: string
  subdomain: string
  status: string
  api_token_encrypted: string
}

interface EmailIntegration {
  id: string
  organization_id: string
  integration_id: string
  name: string
}

interface ConversationResult {
  index: number
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
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const [emailIntegrations, setEmailIntegrations] = useState<EmailIntegration[]>([])
  const [selectedIntegrationId, setSelectedIntegrationId] = useState('')
  const [vertical, setVertical] = useState('E-commerce')
  const [numberOfConversations, setNumberOfConversations] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<ConversationResult[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (selectedOrgId) {
      fetchEmailIntegrations(selectedOrgId)
    } else {
      setEmailIntegrations([])
      setSelectedIntegrationId('')
    }
  }, [selectedOrgId])

  const fetchOrganizations = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('status', 'Active')
        .order('name', { ascending: true })

      if (error) throw error

      setOrganizations(data || [])

      if (data && data.length > 0 && !selectedOrgId) {
        setSelectedOrgId(data[0].id)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch organizations')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmailIntegrations = async (orgId: string) => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('email_integrations')
        .select('*')
        .eq('organization_id', orgId)
        .order('name', { ascending: true })

      if (error) throw error

      setEmailIntegrations(data || [])

      if (data && data.length > 0) {
        setSelectedIntegrationId(data[0].integration_id)
      } else {
        setSelectedIntegrationId('')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch email integrations')
      setEmailIntegrations([])
    } finally {
      setLoading(false)
    }
  }

  const getApiToken = (orgId: string): string => {
    // Get the API token directly from organizations (stored as plain text)
    const org = organizations.find((org) => org.id === orgId)
    if (!org || !org.api_token_encrypted) {
      throw new Error('Organization API token not found')
    }
    return org.api_token_encrypted
  }

  const fetchEndUsers = async (): Promise<string[]> => {
    // Fetch all end users with Dixa IDs from database
    const { data, error } = await supabase
      .from('end_users')
      .select('dixa_user_id')
      .not('dixa_user_id', 'is', null)

    if (error) throw error

    if (!data || data.length === 0) {
      throw new Error('No end users found in database')
    }

    return data.map((user) => user.dixa_user_id)
  }

  const getRandomUserId = (userIds: string[]): string => {
    // Select a random user ID from the array
    const randomIndex = Math.floor(Math.random() * userIds.length)
    return userIds[randomIndex]
  }

  const createConversation = async (apiToken: string, integrationId: string, subject: string, message: string, requesterId: string) => {
    return await dixaApi(apiToken, '/v1/conversations', 'POST', {
      requesterId: requesterId,
      emailIntegrationId: integrationId,
      subject: subject,
      message: {
        content: {
          value: message,
          _type: 'Text',
        },
        attachments: [],
        _type: 'Inbound',
      },
      language: 'en',
      _type: 'Email',
    })
  }

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsGenerating(true)
    setResults([])

    if (!selectedOrgId) {
      setError('Please select an organization')
      setIsGenerating(false)
      return
    }

    if (!selectedIntegrationId) {
      setError('Please select an email integration')
      setIsGenerating(false)
      return
    }

    try {
      // Get API token
      const apiToken = getApiToken(selectedOrgId)

      // Fetch end users for random selection
      const endUserIds = await fetchEndUsers()

      // Fetch template for selected vertical
      const { data: templates, error: templateError } = await supabase
        .from('conversation_templates')
        .select('*')
        .eq('vertical', vertical)
        .limit(1)
        .single()

      if (templateError) throw templateError

      if (!templates) {
        throw new Error(`No template found for vertical: ${vertical}`)
      }

      // Initialize results array
      const initialResults: ConversationResult[] = Array.from({ length: numberOfConversations }, (_, i) => ({
        index: i + 1,
        status: 'pending',
      }))
      setResults(initialResults)

      // Create conversations one by one
      for (let i = 0; i < numberOfConversations; i++) {
        try {
          // Get a random user ID for this conversation
          const randomRequesterId = getRandomUserId(endUserIds)

          // Create conversation with template and random requester
          await createConversation(
            apiToken,
            selectedIntegrationId,
            templates.subject,
            templates.message_content,
            randomRequesterId
          )

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

  const handleRefreshIntegrations = async () => {
    if (!selectedOrgId) return

    setLoading(true)
    setError('')

    try {
      const apiToken = getApiToken(selectedOrgId)

      // Fetch fresh integrations from Dixa API
      const integrationsData = await dixaApi(apiToken, '/v1/contact-endpoints', 'GET')

      if (integrationsData && integrationsData.data && Array.isArray(integrationsData.data)) {
        // Delete existing integrations for this org
        await supabase
          .from('email_integrations')
          .delete()
          .eq('organization_id', selectedOrgId)

        // Insert fresh integrations
        const emailIntegrations = integrationsData.data
          .filter((integration: any) => integration._type === 'EmailEndpoint')
          .map((integration: any) => ({
            organization_id: selectedOrgId,
            integration_id: integration.address,
            name: integration.name || integration.address,
            type: 'Email',
          }))

        if (emailIntegrations.length > 0) {
          const { error: intError } = await supabase
            .from('email_integrations')
            .insert(emailIntegrations)

          if (intError) throw intError
        }

        // Refresh the list
        await fetchEmailIntegrations(selectedOrgId)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to refresh email integrations')
    } finally {
      setLoading(false)
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
            {/* Organization Selector */}
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-primary mb-2">
                Organization *
              </label>
              <div className="flex gap-2">
                <select
                  id="organization"
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  required
                  disabled={loading || organizations.length === 0}
                  className="flex-1 px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                >
                  {organizations.length === 0 ? (
                    <option value="">No organizations found</option>
                  ) : (
                    organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.subdomain})
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-primary text-light-text rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  + New
                </button>
              </div>
              {organizations.length === 0 && (
                <p className="mt-1 text-xs text-secondary">
                  Create an organization to get started
                </p>
              )}
            </div>

            {/* Email Integration Selector */}
            <div>
              <label htmlFor="integration" className="block text-sm font-medium text-primary mb-2">
                Email Integration *
              </label>
              <div className="flex gap-2">
                <select
                  id="integration"
                  value={selectedIntegrationId}
                  onChange={(e) => setSelectedIntegrationId(e.target.value)}
                  required
                  disabled={loading || emailIntegrations.length === 0 || !selectedOrgId}
                  className="flex-1 px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                >
                  {emailIntegrations.length === 0 ? (
                    <option value="">No email integrations found</option>
                  ) : (
                    emailIntegrations.map((integration) => (
                      <option key={integration.id} value={integration.integration_id}>
                        {integration.name}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  onClick={handleRefreshIntegrations}
                  disabled={loading || !selectedOrgId}
                  className="px-4 py-2 border border-secondary/30 text-secondary rounded-lg font-medium hover:border-secondary hover:text-primary transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  🔄 Refresh
                </button>
              </div>
              {emailIntegrations.length === 0 && selectedOrgId && (
                <p className="mt-1 text-xs text-error-red">
                  No email integrations found. Click Refresh to sync from Dixa.
                </p>
              )}
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
              disabled={isGenerating || !selectedOrgId || emailIntegrations.length === 0}
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

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchOrganizations}
      />
    </div>
  )
}
