import { createContext, useContext, useState, useEffect } from 'react'
import { getShopSettings } from '@/apis/settingsService'

const SettingsContext = createContext(null)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getShopSettings()
      setSettings(response.data || {})
    } catch (err) {
      console.error('Error loading settings:', err)
      setError(err.message)
      // Set default settings if API fails
      setSettings({
        shopName: 'TechStore',
        description: '',
        logo: '',
        contactEmail: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        zipCode: '',
        website: '',
        workingHours: '',
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: ''
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const value = {
    settings,
    loading,
    error,
    reloadSettings: loadSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

