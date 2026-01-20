import { useState, FormEvent } from 'react'
import { dixaApi } from '@/lib/dixaApi'
import { supabase } from '@/lib/supabase'

interface CreateOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface DixaOrganization {
  id: string
  name: string
  subdomain: string
  status: string
}

export default function CreateOrganizationModal({ isOpen, onClose, onSuccess }: CreateOrganizationModalProps) {
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(false)
  const [orgDetails, setOrgDetails] = useState<DixaOrganization | null>(null)

  const handleValidateToken = async () => {
    if (!apiToken.trim()) {
      setError('Please enter an API token')
      return
    }

    setValidating(true)
    setError('')
    setOrgDetails(null)

    try {
      // Fetch organization details from Dixa API
      const data = await dixaApi(apiToken, '/v1/organization', 'GET')

      if (data && data.data) {
        setOrgDetails({
          id: data.data.id,
          name: data.data.name,
          subdomain: data.data.subdomain,
          status: data.data.status || 'Active',
        })
      } else {
        throw new Error('Unable to fetch organization details')
      }
    } catch (err: any) {
      // Extract error code if available
      const errorMessage = err.message || 'Failed to validate API token'
      const errorCode = errorMessage.match(/\d{3}/) ? errorMessage.match(/\d{3}/)[0] : 'UNKNOWN'
      setError(`Validation failed (Error: ${errorCode}). Please check your API token.`)
      setOrgDetails(null)
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!orgDetails) {
      setError('Please validate the API token first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in to create an organization')
      }

      // Create organization in our database
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgDetails.name,
          subdomain: orgDetails.subdomain,
          dixa_org_id: orgDetails.id,
          status: orgDetails.status,
          api_token_encrypted: apiToken, // Supabase will encrypt this via function
          created_by: user.id,
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Fetch and store email integrations
      try {
        const integrationsData = await dixaApi(apiToken, '/v1/email-integrations', 'GET')

        if (integrationsData && integrationsData.data && Array.isArray(integrationsData.data)) {
          const emailIntegrations = integrationsData.data
            .filter((integration: any) => integration.type === 'Email')
            .map((integration: any) => ({
              organization_id: org.id,
              integration_id: integration.id,
              name: integration.name || integration.id,
              type: 'Email',
            }))

          if (emailIntegrations.length > 0) {
            const { error: intError } = await supabase
              .from('email_integrations')
              .insert(emailIntegrations)

            if (intError) {
              console.error('Failed to store email integrations:', intError)
              // Don't fail the whole operation if integrations fail
            }
          }
        }
      } catch (intErr) {
        console.error('Failed to fetch email integrations:', intErr)
        // Don't fail the whole operation
      }

      // Success!
      onSuccess()
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create organization')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setApiToken('')
    setOrgDetails(null)
    setError('')
    setValidating(false)
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Create Organization</h2>
          <button
            onClick={handleClose}
            className="text-secondary hover:text-primary transition-colors"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* API Token Input */}
          <div>
            <label htmlFor="apiToken" className="block text-sm font-medium text-primary mb-2">
              Dixa API Token *
            </label>
            <div className="flex gap-2">
              <input
                id="apiToken"
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                required
                disabled={loading || validating || !!orgDetails}
                className="flex-1 px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                placeholder="Enter your Dixa API token"
              />
              {!orgDetails && (
                <button
                  type="button"
                  onClick={handleValidateToken}
                  disabled={validating || !apiToken.trim()}
                  className="px-4 py-2 bg-primary text-light-text rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {validating ? 'Validating...' : 'Validate'}
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-secondary">
              We'll fetch your organization details from Dixa
            </p>
          </div>

          {/* Organization Details (after validation) */}
          {orgDetails && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-green-800">✅ Organization Validated</p>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Name:</strong> {orgDetails.name}</p>
                <p><strong>Subdomain:</strong> {orgDetails.subdomain}</p>
                <p><strong>Status:</strong> {orgDetails.status}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrgDetails(null)
                  setApiToken('')
                }}
                className="text-xs text-secondary hover:text-primary underline"
              >
                Change API Token
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-error-red/20 text-error-red px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !orgDetails}
              className="flex-1 bg-primary text-light-text py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Organization'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 border border-secondary/30 rounded-lg font-medium text-secondary hover:border-secondary hover:text-primary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
