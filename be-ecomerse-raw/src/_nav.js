import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilChartPie,
  cilCommentSquare,
  cilDescription,
  cilNotes,
  cilPuzzle,
  cilSettings,
  cilSpeedometer,
  cilStar,
  cilUser,
  cilFolder,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'Components',
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/users',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Products',
    to: '/products',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Orders',
    to: '/orders-admin',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Returns',
    to: '/returns',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Discounts',
    to: '/discounts',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Coupons',
        to: '/coupons',
      },
      {
        component: CNavItem,
        name: 'Campaigns',
        to: '/campaigns',
      },
    ],
  },
  // Analytics section removed; Dashboard already covers analytics
  {
    component: CNavGroup,
    name: 'Settings',
    to: '/settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Shop Settings',
        to: '/shop-settings',
      },
      {
        component: CNavItem,
        name: 'Shipping',
        to: '/shipping-settings',
      },
      {
        component: CNavItem,
        name: 'Payment',
        to: '/payment-settings',
      },
      {
        component: CNavItem,
        name: 'Admin Management',
        to: '/admin-management',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reviews',
    to: '/reviews',
    icon: <CIcon icon={cilCommentSquare} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Reviews Management',
        to: '/reviews-management',
      },
      {
        component: CNavItem,
        name: 'Rating Statistics',
        to: '/product-rating-stats',
      },
      {
        component: CNavItem,
        name: 'Negative Reviews',
        to: '/negative-reviews-reports',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Support',
    to: '/support',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Customer Messages',
        to: '/customer-messages',
      },
      {
        component: CNavItem,
        name: 'Support Tickets',
        to: '/support-tickets',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'About Posts',
    to: '/about-posts',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Catalog',
    to: '/catalog',
    icon: <CIcon icon={cilFolder} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Categories',
        to: '/categories',
      },
      {
        component: CNavItem,
        name: 'Brands',
        to: '/brands',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Extras',
  },
  {
    component: CNavGroup,
    name: 'Pages',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Login',
        to: '/login',
      },
      {
        component: CNavItem,
        name: 'Register',
        to: '/register',
      },
      {
        component: CNavItem,
        name: 'Error 404',
        to: '/404',
      },
      {
        component: CNavItem,
        name: 'Error 500',
        to: '/500',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Hướng dẫn sử dụng',
    to: '/user-guide',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
]

export default _nav
