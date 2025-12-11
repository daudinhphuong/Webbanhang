import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import MainLayout from '@components/Layout/Layout'
import MyHeader from '@components/Header/Header'
import MyFooter from '@components/Footer/Footer'
import Banner from '@pages/OurShop/components/Banner'
import Filter from '@pages/OurShop/components/Filter'
import { OurShopProvider } from '@contexts/OurShopProvider'
import { useNavigate } from 'react-router-dom'
import { getBrands } from '@/apis/brandService'
import { getProducts } from '@/apis/productsService'
import ProductItem from '@components/ProductItem/ProductItem'

export default function BrandDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [brand, setBrand] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const list = await getBrands()
        const b = (list || []).find(x => String(x._id || x.id) === String(id))
        if (mounted) setBrand(b || null)
        const res = await getProducts({ sortType: '3', page: 1, limit: 'all', brandId: id })
        if (mounted) setProducts(Array.isArray(res?.contents) ? res.contents : [])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  return (
    <>
      <MyHeader />
      <OurShopProvider>
        <MainLayout>
          <div style={{ marginTop: 80 }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', color:'#666', fontSize:14, marginBottom:8}}>
              <div>
                <span style={{cursor:'pointer'}} onClick={()=>navigate('/')}>Home</span>
                <span style={{margin:'0 6px'}}>&gt;</span>
                <span style={{cursor:'pointer'}} onClick={()=>navigate('/brands')}>Brands</span>
                <span style={{margin:'0 6px'}}>&gt;</span>
                <span style={{color:'#222', fontWeight:600}}>{brand?.name || 'Brand'}</span>
              </div>
              <div style={{cursor:'pointer'}} onClick={()=>navigate(-1)}>&lt; Return to previous page</div>
            </div>
            <Banner />
            <Filter />
          </div>
          <div style={{display:'grid', gridTemplateColumns:'320px 1fr', gap:24, padding:'24px 0 120px'}}>
          <div style={{background:'#fff', borderRadius:12, padding:24, textAlign:'center', boxShadow:'0 4px 16px rgba(0,0,0,.06)'}}>
            <div style={{width:140, height:140, margin:'0 auto 12px', borderRadius:'50%', overflow:'hidden', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {brand?.logo ? <img src={brand.logo} alt={brand?.name} style={{maxWidth:'100%', maxHeight:'100%'}} /> : <div style={{fontSize:48, color:'#bbb'}}>{brand?.name?.[0] || 'B'}</div>}
            </div>
            <div style={{fontWeight:700, letterSpacing:1, marginBottom:6}}>{(brand?.name || '').toUpperCase()}</div>
            <div style={{color:'#777'}}>{products.length} Sản Phẩm</div>
            {brand?.description && <p style={{fontSize:13, color:'#666', marginTop:12}}>{brand.description}</p>}
          </div>

          <div>
            <h3 style={{marginTop:0}}>Sản Phẩm từ {(brand?.name || 'Brand').toUpperCase()}</h3>
            {loading ? (
              <div style={{padding:40, textAlign:'center'}}>Đang tải...</div>
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:16}}>
                {products.map(p => (
                  <ProductItem key={p._id||p.id} src={p.images?.[0]} prevSrc={p.images?.[1]} name={p.name} price={p.price} details={p} isHomepage={false} />
                ))}
              </div>
            )}
          </div>
          </div>
        </MainLayout>
      </OurShopProvider>
      <MyFooter />
    </>
  )
}


