import React, { createContext, useContext, useState, useEffect } from 'react'
import AccountLockedModal from '../components/AccountLockedModal'

const AccountLockedContext = createContext()

export const useAccountLocked = () => {
  const context = useContext(AccountLockedContext)
  if (!context) {
    throw new Error('useAccountLocked must be used within AccountLockedProvider')
  }
  return context
}

export const AccountLockedProvider = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    const handleAccountLocked = () => {
      setIsLocked(true)
    }

    window.addEventListener('accountLocked', handleAccountLocked)

    return () => {
      window.removeEventListener('accountLocked', handleAccountLocked)
    }
  }, [])

  const showLockedModal = () => {
    setIsLocked(true)
  }

  const hideLockedModal = () => {
    setIsLocked(false)
  }

  return (
    <AccountLockedContext.Provider value={{ showLockedModal, hideLockedModal }}>
      {children}
      <AccountLockedModal visible={isLocked} onClose={hideLockedModal} />
    </AccountLockedContext.Provider>
  )
}

