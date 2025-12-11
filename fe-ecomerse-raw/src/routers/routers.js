import { lazy } from 'react';

const routers = [
  {
    path: '/',
    component: lazy(() => import('@components/HomePage/HomePage')),
  },
  {
    path: '/blog',
    component: lazy(() => import('@components/Blog/Blog')),
  },
  {
    path: '/shop',
    component: lazy(() => import('@pages/OurShop/OurShop')),
  },
  {
    path: '/brands',
    component: lazy(() => import('@pages/Brands')),
  },
  {
    path: '/brands/:id',
    component: lazy(() => import('@pages/Brands/BrandDetail')),
  },
  {
    path: '/cart',
    component: lazy(() => import('@pages/Cart/Cart')),
  },
  {
    path: '/product/:id',
    component: lazy(() => import('@pages/DetailProduct')),
  },
  {
    path: '/news',
    component: lazy(() => import('@pages/News')),
  },
  {
    path: '/news/:id',
    component: lazy(() => import('@pages/News/Detail')),
  },
  {
    path: '/order',
    component: lazy(() => import('@pages/Orders')),
  },
  {
    path: '/checkout',
    component: lazy(() => import('@pages/Checkout')),
  },
  {
    path: '/contacts',
    component: lazy(() => import('@pages/Contacts')),
  },
  {
    path: '/settings-test',
    component: lazy(() => import('@pages/SettingsTest')),
  },
  {
    path: '/user-settings',
    component: lazy(() => import('@pages/UserSettings')),
  },
  {
    path: '/user-test',
    component: lazy(() => import('@pages/UserTest')),
  },
  {
    path: '/support',
    component: lazy(() => import('@pages/Support')),
  },
];

export default routers;
