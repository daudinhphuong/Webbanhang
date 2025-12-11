import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <span>VNB Store Admin Panel</span>
      </div>
      <div className="ms-auto">
        <span>© 2025 VNB Store. All rights reserved.</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
