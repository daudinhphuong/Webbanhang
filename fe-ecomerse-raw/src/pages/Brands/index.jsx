import { useEffect, useState } from 'react'
import MainLayout from '@components/Layout/Layout'
import MyHeader from '@components/Header/Header'
import MyFooter from '@components/Footer/Footer'
import Banner from '@pages/OurShop/components/Banner'
import Filter from '@pages/OurShop/components/Filter'
import { OurShopProvider } from '@contexts/OurShopProvider'
import { getBrands } from '@/apis/brandService'
import { getProducts } from '@/apis/productsService'
import { useNavigate } from 'react-router-dom'

export default function BrandsPage() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getBrands()
      .then(async (list) => {
        // fetch product counts per brand
        const withCounts = await Promise.all(
          (list || []).map(async (b) => {
            try {
              const res = await getProducts({ sortType: '3', page: 1, limit: 'all', brandId: b._id || b.id })
              const count = Number(res?.total || 0)
              return { ...b, productCount: count }
            } catch {
              return { ...b, productCount: 0 }
            }
          })
        )
        setBrands(withCounts)
      })
      .catch(() => setError('Không tải được thương hiệu'))
      .finally(() => setLoading(false))
  }, [])

  const goToBrand = (brandId) => {
    window.location.href = `/brands/${encodeURIComponent(brandId)}`
  }

  return (
    <>
      <MyHeader />
      <OurShopProvider>
        <MainLayout>
          <div style={{ marginTop: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#666', fontSize: 14, marginBottom: 8 }}>
              <div>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
                {' '}
                <span style={{ margin: '0 6px' }}>&gt;</span>
                <span style={{ color: '#222', fontWeight: 600 }}>Brands</span>
              </div>
              <div style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>&lt; Return to previous page</div>
            </div>
            <Banner />
            <Filter />
          </div>
          <div style={{ padding: '32px 0', marginTop: 24 }}>
            <h2 style={{ textAlign: 'center', margin: '16px 0' }}>Các Thương Hiệu Nổi Bật</h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {brands.map((b) => (
                  <div key={b._id || b.id} style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                    <div style={{ width: 160, height: 160, margin: '0 auto 12px', borderRadius: '50%', overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                      {b.logo ? (
                        <img src={b.logo} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ fontSize: 48, color: '#bbb' }}>{b.name?.[0] || 'B'}</div>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, letterSpacing: 1 }}>{(b.name || '').toUpperCase()}</div>
                    <div style={{ margin: '6px 0 14px', color: '#666' }}>{b.productCount} Sản Phẩm</div>
                    <button onClick={() => goToBrand(b._id || b.id)} style={{ background: '#2f80ed', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Xem Thêm</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </MainLayout>
      </OurShopProvider>
      <MyFooter />
    </>
  )
}


