import { useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import _nav from '../_nav'

export const useNav = () => {
  const { t } = useLanguage()

  const nav = useMemo(() => {
    return _nav.map((item) => {
      // Map navigation names to translations
      const translationMap = {
        'Dashboard': t('nav.dashboard'),
        'Users': t('nav.users'),
        'Products': t('nav.products'),
        'Orders': t('nav.orders'),
        'Returns': t('nav.returns'),
        'Discounts': t('nav.discounts'),
        'Coupons': t('discounts.coupons'),
        'Campaigns': t('discounts.campaigns'),
        'Settings': t('nav.settings'),
        'Shop Settings': t('settings.shopSettings'),
        'Shipping': t('settings.shipping'),
        'Payment': t('settings.paymentSettings'),
        'Admin Management': t('settings.adminManagement'),
        'Reviews': t('nav.reviews'),
        'Reviews Management': t('reviews.title'),
        'Rating Statistics': 'Rating Statistics',
        'Negative Reviews': 'Negative Reviews',
        'Support': t('nav.support'),
        'Customer Messages': t('support.messages'),
        'Support Tickets': t('support.tickets'),
        'About Posts': t('nav.about'),
        'Catalog': t('nav.catalog'),
        'Categories': t('catalog.categories'),
        'Brands': t('catalog.brands'),
        'Pages': 'Pages',
        'Login': 'Login',
        'Register': 'Register',
        'Error 404': 'Error 404',
        'Error 500': 'Error 500',
        'Hướng dẫn sử dụng': 'Hướng dẫn sử dụng',
        'Components': 'Components',
        'Extras': 'Extras',
      }

      const translatedName = translationMap[item.name] || item.name

      if (item.items) {
        return {
          ...item,
          name: translatedName,
          items: item.items.map((subItem) => ({
            ...subItem,
            name: translationMap[subItem.name] || subItem.name,
          })),
        }
      }

      return {
        ...item,
        name: translatedName,
      }
    })
  }, [t])

  return nav
}

