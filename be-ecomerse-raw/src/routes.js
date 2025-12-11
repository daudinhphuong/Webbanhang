import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))
const ProductsList = React.lazy(() => import('./views/products/ProductsList'))
const UsersList = React.lazy(() => import('./views/users/UsersList'))
const AboutPosts = React.lazy(() => import('./views/about/AboutPosts'))
const Categories = React.lazy(() => import('./views/catalog/Categories'))
const AdminBrands = React.lazy(() => import('./views/catalog/Brands'))
const Orders = React.lazy(() => import('./views/orders/Orders'))
const Returns = React.lazy(() => import('./views/orders/Returns'))
const Coupons = React.lazy(() => import('./views/discounts/Coupons'))
const Campaigns = React.lazy(() => import('./views/discounts/Campaigns'))
const Analytics = React.lazy(() => import('./views/analytics/Analytics'))
const Reports = React.lazy(() => import('./views/analytics/Reports'))
const ShopSettings = React.lazy(() => import('./views/settings/ShopSettings'))
const ShippingSettings = React.lazy(() => import('./views/settings/ShippingSettings'))
const PaymentSettings = React.lazy(() => import('./views/settings/PaymentSettings'))
const AdminManagement = React.lazy(() => import('./views/settings/AdminManagement'))
const ReviewsManagement = React.lazy(() => import('./views/reviews/ReviewsManagement'))
const ProductRatingStats = React.lazy(() => import('./views/reviews/ProductRatingStats'))
const NegativeReviewsReports = React.lazy(() => import('./views/reviews/NegativeReviewsReports'))
const CustomerMessages = React.lazy(() => import('./views/support/CustomerMessages'))
const SupportTickets = React.lazy(() => import('./views/support/SupportTickets'))
const UserGuide = React.lazy(() => import('./views/docs/UserGuide'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/base', name: 'Base', element: Cards, exact: true },
  { path: '/base/accordion', name: 'Accordion', element: Accordion },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', element: Cards },
  { path: '/base/carousels', name: 'Carousel', element: Carousels },
  { path: '/base/collapses', name: 'Collapse', element: Collapses },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
  { path: '/base/navs', name: 'Navs', element: Navs },
  { path: '/base/paginations', name: 'Paginations', element: Paginations },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
  { path: '/base/popovers', name: 'Popovers', element: Popovers },
  { path: '/base/progress', name: 'Progress', element: Progress },
  { path: '/base/spinners', name: 'Spinners', element: Spinners },
  { path: '/base/tabs', name: 'Tabs', element: Tabs },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
  { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/products', name: 'Products', element: ProductsList },
  { path: '/orders-admin', name: 'Orders', element: Orders },
  { path: '/returns', name: 'Returns', element: Returns },
  { path: '/coupons', name: 'Coupons', element: Coupons },
  { path: '/campaigns', name: 'Campaigns', element: Campaigns },
  { path: '/analytics', name: 'Analytics', element: Analytics },
  { path: '/reports', name: 'Reports', element: Reports },
  { path: '/shop-settings', name: 'Shop Settings', element: ShopSettings },
  { path: '/shipping-settings', name: 'Shipping Settings', element: ShippingSettings },
  { path: '/payment-settings', name: 'Payment Settings', element: PaymentSettings },
  { path: '/admin-management', name: 'Admin Management', element: AdminManagement },
  { path: '/reviews-management', name: 'Reviews Management', element: ReviewsManagement },
  { path: '/product-rating-stats', name: 'Product Rating Stats', element: ProductRatingStats },
  { path: '/negative-reviews-reports', name: 'Negative Reviews Reports', element: NegativeReviewsReports },
  { path: '/customer-messages', name: 'Customer Messages', element: CustomerMessages },
  { path: '/support-tickets', name: 'Support Tickets', element: SupportTickets },
  { path: '/user-guide', name: 'User Guide', element: UserGuide },
  { path: '/users', name: 'Users', element: UsersList },
  { path: '/about-posts', name: 'About Posts', element: AboutPosts },
  { path: '/categories', name: 'Categories', element: Categories },
  { path: '/brands', name: 'Brands', element: AdminBrands },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  { path: '/widgets', name: 'Widgets', element: Widgets },
]

export default routes
