import { useEffect, useState } from 'react';
import { getMyOrders } from '@/apis/orderService';
import { createReturn, getEligibleOrders } from '@/apis/returnService';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import MyHeader from '@components/Header/Header';
import MyFooter from '@components/Footer/Footer';
import MainLayout from '@components/Layout/Layout';
import styles from '@/pages/AboutUs/styles.module.scss';
import Logos from '@/pages/AboutUs/components/Logos';
import Button from '@components/Button/Button';

function Orders() {
  const {
    container,
    functionBox,
    specialText,
    btnBack,
    containerTitle,
    line,
    title,
    textS,
    textL,
    containerContent,
    des,
  } = styles;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnForm, setReturnForm] = useState({
    returnType: 'refund',
    reason: '',
    description: ''
  });
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userId = Cookies.get('userId');
    if (!userId) {
      navigate('/');
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await getMyOrders();
        const list = res?.data?.data ?? res?.data ?? [];
        setOrders(Array.isArray(list) ? list : []);
      } catch (e) {
        setError('Không tải được đơn hàng');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  const handleBackPreviousPage = () => {
    window.history.back();
  };

  return (
    <>
      <MyHeader />

      <MainLayout>
        <div className={container}>
          <div className={functionBox}>
            <div>
              Home {'>'} <span className={specialText}>Theo dõi đơn</span>
            </div>
            <div className={btnBack} onClick={() => handleBackPreviousPage()}>
              &lt; Return to previous page
            </div>
          </div>

          <div className={containerTitle}>
            <div className={line}>
              <div className={title}>
                <div className={textS}>your orders timeline</div>
                <div className={textL}>Lịch sử đơn hàng</div>
              </div>
            </div>
          </div>

          <div className={containerContent}>
            {/* Controls */}
            <div style={{background:'#f7f8fa', padding:16, borderRadius:12, marginBottom:16}}>
              <div style={{display:'flex', gap:12, marginBottom:12}}>
                <div style={{flex:1}}>
                  <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Tìm theo mã đơn, sản phẩm, địa chỉ..." style={{width:'100%', padding:'10px 12px', border:'1px solid #e6e8ec', borderRadius:10, outline:'none'}} />
                </div>
                <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} style={{padding:'10px 12px', border:'1px solid #e6e8ec', borderRadius:10, minWidth:120}}>
                  <option value="all">Tất cả</option>
                  <option value="pending">Đang xử lý</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipped">Đang vận chuyển</option>
                  <option value="delivered">Đã giao hàng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                <button onClick={()=>{ setQuery(''); setStatusFilter('all'); }} style={{padding:'10px 12px', border:'1px solid #e6e8ec', background:'#fff', borderRadius:10, cursor:'pointer', whiteSpace:'nowrap'}}>Đặt lại</button>
              </div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {[
                  { key:'processing', label:'Đang xử lý' },
                  { key:'shipped', label:'Đang vận chuyển' },
                  { key:'delivered', label:'Đã giao hàng' },
                ].map((chip)=> (
                  <button key={chip.key} onClick={()=>setStatusFilter(chip.key)} style={{
                    padding:'8px 12px', borderRadius:999, border:'1px solid #e6e8ec', background: statusFilter===chip.key?'#111':'#fff', color: statusFilter===chip.key?'#fff':'#111', cursor:'pointer'
                  }}>{chip.label}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className={des}>{error}</div>
            ) : !orders.length ? (
              <div className={des}>Bạn chưa có đơn hàng nào.</div>
            ) : (
              <div style={{display:'grid', gap: 16, gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))'}}>
                {orders
                  .filter((o)=> statusFilter==='all' ? true : ((o.orderStatus||o.status)===statusFilter))
                  .filter((o)=> {
                    if (!query) return true;
                    const q = query.toLowerCase();
                    const text = [o._id, o.email, o.street, o.cities, o.state].filter(Boolean).join(' ').toLowerCase();
                    return text.includes(q);
                  })
                  .map((o) => {
                    const st = (o.orderStatus || o.status || 'pending');
                    const colorMap = { processing:'#f59e0b', shipped:'#3b82f6', delivered:'#10b981', pending:'#9ca3af', cancelled:'#ef4444' };
                    const labelMap = { processing:'Đang xử lý', shipped:'Đang vận chuyển', delivered:'Đã giao hàng', pending:'Đang xử lý', cancelled:'Đã hủy' };
                    
                    // Calculate total quantity and product types
                    const totalQuantity = (o.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
                    const productTypes = o.items?.length || 0;
                    const totalPrice = o.finalTotal ?? o.totalPrice ?? o.totalAmount ?? 0;
                    const originalPrice = o.totalPrice ?? o.totalAmount ?? 0;
                    const hasDiscount = o.finalTotal && o.finalTotal < originalPrice;
                    
                    return (
                      <div key={o._id} style={{background:'#fff', border:'1px solid #eef0f3', borderRadius:16, padding:16, boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                          <div style={{padding:'6px 10px', borderRadius:999, background: colorMap[st] || '#9ca3af', color:'#fff', fontSize:12}}>
                            {labelMap[st] || st}
                          </div>
                        </div>
                        <div style={{display:'grid', gap:6, fontSize:14}}>
                          <div style={{display:'flex', justifyContent:'space-between'}}>
                            <div><strong>Mã Đơn:</strong> #{o._id?.slice(-6)}</div>
                            <div><strong>Ngày đặt:</strong> {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '-'}</div>
                          </div>
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'#f8f9fa', borderRadius:8, marginTop:4}}>
                            <div>
                              <div style={{fontWeight:600, color:'#111', fontSize:15}}>{totalQuantity} sản phẩm</div>
                              <div style={{fontSize:12, color:'#666', marginTop:2}}>{productTypes} loại sản phẩm</div>
                            </div>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontSize:18, fontWeight:700, color:'#111'}}>{totalPrice.toLocaleString('vi-VN')} đ</div>
                              {hasDiscount && (
                                <div style={{fontSize:12, color:'#666', textDecoration:'line-through', marginTop:2}}>
                                  {originalPrice.toLocaleString('vi-VN')} đ
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <strong style={{fontSize:15}}>Chi tiết sản phẩm:</strong>
                            <div style={{marginTop:8, display:'flex', flexDirection:'column', gap:8}}>
                              {(o.items||[]).map((it, idx) => {
                                const productId = it.productId;
                                const productName = it.name || it.productName || `SP-${productId?.slice(-6)}`;
                                const quantity = it.quantity || 1;
                                const price = it.price || 0;
                                const itemTotal = quantity * price;
                                const isDelivered = st === 'delivered';
                                return (
                                  <div key={idx} style={{
                                    display:'flex',
                                    justifyContent:'space-between',
                                    alignItems:'flex-start',
                                    padding:'12px',
                                    background:'#f8f9fa',
                                    borderRadius:8,
                                    gap:12,
                                    border:'1px solid #eef0f3'
                                  }}>
                                    <div style={{flex:1, display:'flex', gap:12, alignItems:'flex-start'}}>
                                      {it.productImage && (
                                        <img 
                                          src={it.productImage} 
                                          alt={productName}
                                          style={{width:60, height:60, objectFit:'cover', borderRadius:8, border:'1px solid #eef0f3'}}
                                        />
                                      )}
                                      <div style={{flex:1}}>
                                        <div style={{fontWeight:600, marginBottom:6, fontSize:14}}>{productName}</div>
                                        <div style={{fontSize:12, color:'#666', display:'flex', flexWrap:'wrap', gap:12}}>
                                          <span>Số lượng: <strong style={{color:'#111'}}>{quantity}</strong></span>
                                          <span>Giá: <strong style={{color:'#111'}}>{price.toLocaleString('vi-VN')} đ</strong></span>
                                          <span style={{fontWeight:600, color:'#111'}}>Thành tiền: {itemTotal.toLocaleString('vi-VN')} đ</span>
                                        </div>
                                        {it.size && (
                                          <div style={{fontSize:12, color:'#999', marginTop:4}}>Size: {it.size}</div>
                                        )}
                                      </div>
                                    </div>
                                    {isDelivered && (
                                      <div style={{display:'flex', gap:8}}>
                                        <Button
                                          content="Đánh giá"
                                          onClick={() => navigate(`/product/${productId}?review=true&orderId=${o._id}`)}
                                          style={{padding:'6px 12px', fontSize:12, minWidth:80}}
                                        />
                                        <Button
                                          content="Trả hàng"
                                          onClick={() => {
                                            setSelectedOrder(o);
                                            setSelectedItems([{
                                              productId: productId,
                                              productName: productName,
                                              quantity: quantity,
                                              price: price
                                            }]);
                                            setReturnForm({
                                              returnType: 'refund',
                                              reason: '',
                                              description: ''
                                            });
                                            setReturnModalOpen(true);
                                          }}
                                          style={{padding:'6px 12px', fontSize:12, minWidth:80, background:'#ef4444', color:'#fff'}}
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div style={{padding:'10px 12px', background:'#f8f9fa', borderRadius:8, marginTop:8}}>
                            <div style={{fontSize:13, color:'#666', marginBottom:4}}><strong>Địa chỉ giao hàng:</strong></div>
                            <div style={{fontSize:14, color:'#111'}}>
                              {o.firstName} {o.lastName}<br/>
                              {o.street}, {o.cities}, {o.state}<br/>
                              {o.country} {o.zipCode}<br/>
                              <span style={{color:'#666'}}>Điện thoại: {o.phone}</span>
                            </div>
                          </div>
                          {o.paymentMethod && (
                            <div style={{fontSize:13, color:'#666'}}>
                              <strong>Phương thức thanh toán:</strong> {o.paymentMethod}
                            </div>
                          )}
                        </div>
                        {hasDiscount && (
                          <div style={{marginTop:8, padding:'8px 12px', background:'#d4edda', borderRadius:8, fontSize:12, color:'#155724'}}>
                            🎉 Bạn đã tiết kiệm được {(originalPrice - totalPrice).toLocaleString('vi-VN')} đ với mã giảm giá!
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          <Logos />
        </div>
      </MainLayout>

      {/* Return Request Modal */}
      {returnModalOpen && selectedOrder && (
        <div style={{
          position:'fixed',
          top:0,
          left:0,
          right:0,
          bottom:0,
          background:'rgba(0,0,0,0.5)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          zIndex:9999,
          padding:20
        }}>
          <div style={{
            background:'#fff',
            borderRadius:16,
            padding:24,
            maxWidth:600,
            width:'100%',
            maxHeight:'90vh',
            overflow:'auto'
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
              <h2 style={{margin:0}}>Yêu cầu trả hàng</h2>
              <button onClick={() => {
                setReturnModalOpen(false);
                setSelectedOrder(null);
                setSelectedItems([]);
                setReturnSuccess('');
              }} style={{background:'none', border:'none', fontSize:24, cursor:'pointer'}}>×</button>
            </div>

            {returnSuccess && (
              <div style={{padding:12, background:'#d4edda', color:'#155724', borderRadius:8, marginBottom:16}}>
                {returnSuccess}
              </div>
            )}

            {error && (
              <div style={{padding:12, background:'#f8d7da', color:'#721c24', borderRadius:8, marginBottom:16}}>
                {error}
              </div>
            )}

            <div style={{marginBottom:16}}>
              <strong>Đơn hàng:</strong> #{selectedOrder._id?.slice(-6)}
            </div>

            <div style={{marginBottom:16}}>
              <strong>Sản phẩm trả:</strong>
              <div style={{marginTop:8, padding:12, background:'#f8f9fa', borderRadius:8}}>
                {selectedItems.map((item, idx) => (
                  <div key={idx} style={{marginBottom:8}}>
                    {item.productName} - Số lượng: {item.quantity} - Giá: {item.price?.toLocaleString('vi-VN')} đ
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                setSubmittingReturn(true);
                setError('');
                setReturnSuccess('');

                const returnData = {
                  orderId: selectedOrder._id,
                  returnType: returnForm.returnType,
                  reason: returnForm.reason,
                  description: returnForm.description,
                  items: selectedItems.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                    reason: ''
                  }))
                };

                const res = await createReturn(returnData);
                setReturnSuccess('Yêu cầu trả hàng đã được gửi thành công! Chúng tôi sẽ xử lý trong thời gian sớm nhất.');
                
                setTimeout(() => {
                  setReturnModalOpen(false);
                  setSelectedOrder(null);
                  setSelectedItems([]);
                  setReturnSuccess('');
                  // Reload orders
                  const fetchOrders = async () => {
                    try {
                      const res = await getMyOrders();
                      const list = res?.data?.data ?? res?.data ?? [];
                      setOrders(Array.isArray(list) ? list : []);
                    } catch (e) {
                      console.error('Error reloading orders:', e);
                    }
                  };
                  fetchOrders();
                }, 2000);
              } catch (err) {
                console.error('Error creating return:', err);
                setError('Lỗi khi gửi yêu cầu trả hàng: ' + (err.response?.data?.message || err.message));
              } finally {
                setSubmittingReturn(false);
              }
            }}>
              <div style={{marginBottom:16}}>
                <label style={{display:'block', marginBottom:8, fontWeight:600}}>Loại trả hàng *</label>
                <select
                  value={returnForm.returnType}
                  onChange={(e) => setReturnForm({...returnForm, returnType: e.target.value})}
                  required
                  style={{width:'100%', padding:'10px 12px', border:'1px solid #e6e8ec', borderRadius:8, outline:'none'}}
                >
                  <option value="refund">Hoàn tiền</option>
                  <option value="exchange">Đổi hàng</option>
                  <option value="repair">Sửa chữa</option>
                </select>
              </div>

              <div style={{marginBottom:16}}>
                <label style={{display:'block', marginBottom:8, fontWeight:600}}>Lý do trả hàng *</label>
                <input
                  type="text"
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({...returnForm, reason: e.target.value})}
                  placeholder="Ví dụ: Sản phẩm bị lỗi, không đúng mô tả..."
                  required
                  style={{width:'100%', padding:'10px 12px', border:'1px solid #e6e8ec', borderRadius:8, outline:'none'}}
                />
              </div>

              <div style={{marginBottom:16}}>
                <label style={{display:'block', marginBottom:8, fontWeight:600}}>Mô tả chi tiết</label>
                <textarea
                  value={returnForm.description}
                  onChange={(e) => setReturnForm({...returnForm, description: e.target.value})}
                  placeholder="Mô tả chi tiết về vấn đề..."
                  rows={4}
                  style={{width:'100%', padding:'10px 12px', border:'1px solid #e6e8ec', borderRadius:8, outline:'none', resize:'vertical'}}
                />
              </div>

              <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
                <button
                  type="button"
                  onClick={() => {
                    setReturnModalOpen(false);
                    setSelectedOrder(null);
                    setSelectedItems([]);
                    setReturnSuccess('');
                  }}
                  style={{padding:'10px 20px', border:'1px solid #e6e8ec', background:'#fff', borderRadius:8, cursor:'pointer'}}
                  disabled={submittingReturn}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  style={{padding:'10px 20px', border:'none', background:'#ef4444', color:'#fff', borderRadius:8, cursor:'pointer', fontWeight:600}}
                >
                  {submittingReturn ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MyFooter />
    </>
  );
}

export default Orders;
