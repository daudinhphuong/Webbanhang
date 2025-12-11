import { useEffect, useState } from 'react'
import MyHeader from '@components/Header/Header'
import MainLayout from '@components/Layout/Layout'
import MyFooter from '@components/Footer/Footer'
import { fetchNews } from '@/apis/newsService'
import { Link } from 'react-router-dom'
import { getSafeImageUrl, extractImageFromContent, getRandomPlaceholder } from '@/utils/imageUtils'
import SafeImage from '@/components/SafeImage/SafeImage'
import './News.scss'

export default function NewsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews(1, 12)
      .then((res) => {
        console.log('News data:', res);
        const newsItems = res.items || [];
        
        // Add sample data if we have less than 6 items
        if (newsItems.length < 6) {
          const sampleData = [
            {
              _id: 'sample-1',
              title: 'Xu hướng thời trang mùa hè 2024',
              content: 'Khám phá những xu hướng thời trang nóng bỏng nhất mùa hè 2024. Từ màu sắc tươi sáng đến chất liệu thoáng mát, tất cả đều được cập nhật trong bài viết này.',
              thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center',
              createdAt: new Date().toISOString()
            },
            {
              _id: 'sample-2', 
              title: 'Bí quyết phối đồ cho văn phòng',
              content: 'Làm thế nào để luôn trông chuyên nghiệp và thời trang tại nơi làm việc? Bài viết này sẽ chia sẻ những bí quyết phối đồ văn phòng hiệu quả nhất.',
              thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center',
              createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
              _id: 'sample-3',
              title: 'Phụ kiện không thể thiếu',
              content: 'Những phụ kiện thời trang nào là cần thiết cho tủ đồ của bạn? Từ túi xách đến giày dép, khám phá những item không thể thiếu.',
              thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&crop=center',
              createdAt: new Date(Date.now() - 172800000).toISOString()
            },
            {
              _id: 'sample-4',
              title: 'Thời trang nam giới hiện đại',
              content: 'Cập nhật những xu hướng thời trang nam giới mới nhất. Từ áo sơ mi đến quần jeans, tất cả đều được cập nhật theo phong cách hiện đại.',
              thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop&crop=center',
              createdAt: new Date(Date.now() - 259200000).toISOString()
            },
            {
              _id: 'sample-5',
              title: 'Chọn màu sắc phù hợp',
              content: 'Màu sắc có ảnh hưởng lớn đến vẻ ngoài của bạn. Học cách chọn màu sắc phù hợp với tông da và phong cách cá nhân.',
              thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop&crop=center',
              createdAt: new Date(Date.now() - 345600000).toISOString()
            }
          ];
          
          setItems([...newsItems, ...sampleData]);
        } else {
          setItems(newsItems);
        }
      })
      .catch((error) => {
        console.error('Error fetching news:', error);
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <MyHeader />
      <MainLayout>
        <div className="news-page">
          {/* Hero Section */}
          <div className="news-hero">
            <div className="news-hero-content">
              <h1 className="news-hero-title">Tin tức thời trang & phong cách</h1>
              <p className="news-hero-subtitle">Khám phá những xu hướng thời trang mới nhất và bí quyết phong cách từ các chuyên gia</p>
            </div>
          </div>

          {loading ? (
            <div className="news-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải tin tức...</p>
            </div>
          ) : (
            <>
              {/* Debug Info - Remove in production */}
              {false && process.env.NODE_ENV === 'development' && (
                <div style={{background: '#f0f0f0', padding: '10px', margin: '10px 0', borderRadius: '5px', fontSize: '12px'}}>
                  <strong>Debug Info:</strong><br/>
                  Items count: {items.length}<br/>
                  First item: {items[0] ? JSON.stringify(items[0], null, 2) : 'No items'}
                </div>
              )}
            <div className="news-content">
              {(()=>{
                const [featured, ...rest] = items || []
                return (
                  <>
                    {/* Featured Article */}
                    {featured && (
                      <section className="featured-article">
                        <div className="featured-badge">Bài viết nổi bật</div>
                        <Link to={`/news/${featured._id||featured.id}`} className="featured-link">
                          <div className="featured-card">
                            <div className="featured-image-container">
                              {(featured.image || featured.thumbnail) && (
                                <img 
                                  alt={featured.title} 
                                  src={featured.image || featured.thumbnail} 
                                  className="featured-image"
                                />
                              )}
                              <div className="featured-overlay">
                                <div className="featured-category">Thời trang</div>
                              </div>
                            </div>
                            <div className="featured-content">
                              <h2 className="featured-title">{featured.title}</h2>
                              <p className="featured-excerpt">
                                {(() => {
                                  const content = featured.description || featured.content || '';
                                  const cleanContent = content
                                    .replace(/<[^>]*>/g, '')
                                    .replace(/&nbsp;/g, ' ')
                                    .replace(/&amp;/g, '&')
                                    .replace(/&lt;/g, '<')
                                    .replace(/&gt;/g, '>')
                                    .replace(/&quot;/g, '"')
                                    .replace(/&apos;/g, "'")
                                    .replace(/\s+/g, ' ')
                                    .trim();
                                  
                                  return cleanContent.length > 0 ? cleanContent.slice(0, 200) + '...' : 'Đang cập nhật nội dung...';
                                })()}
                              </p>
                              <div className="featured-meta">
                                <div className="featured-author">
                                  <div className="author-avatar">
                                    {featured.author ? featured.author.charAt(0).toUpperCase() : 'B'}
                                  </div>
                                  <span>{featured.author || 'Biên tập viên'}</span>
                                </div>
                                <div className="featured-date">
                                  {new Date(featured.createdAt||Date.now()).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </section>
                    )}

                    <div className="news-grid">
                      {/* Main Content */}
                      <div className="news-main">
                        <div className="news-section-header">
                          <h3>Tin tức mới nhất</h3>
                          <div className="news-filter">
                            <select className="filter-select">
                              <option value="all">Tất cả</option>
                              <option value="fashion">Thời trang</option>
                              <option value="lifestyle">Lối sống</option>
                              <option value="beauty">Làm đẹp</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="news-articles">
                          {rest && rest.length > 0 ? (rest.slice(0, 6).map((article, index) => (
                            <Link 
                              key={article._id||article.id} 
                              to={`/news/${article._id||article.id}`} 
                              className="news-article-card"
                            >
                              <div className="article-image-container">
                                <SafeImage
                                  src={article.image || article.thumbnail || extractImageFromContent(article.content)}
                                  alt={article.title || 'Bài viết'}
                                  className="article-image"
                                  category="fashion"
                                  fallback={getRandomPlaceholder('fashion')}
                                />
                                <div 
                                  className="article-image-placeholder"
                                  style={{ display: 'flex' }}
                                >
                                  <div className="placeholder-content">
                                    <div className="placeholder-icon">📰</div>
                                    <div className="placeholder-text">Thời trang</div>
                                  </div>
                                </div>
                                <div className="article-category">Thời trang</div>
                              </div>
                              <div className="article-content">
                                <h4 className="article-title">{article.title || 'Không có tiêu đề'}</h4>
                                <p className="article-excerpt">
                                  {(() => {
                                    const content = article.description || article.content || article.summary || '';
                                    // Remove HTML tags and clean up the content
                                    const cleanContent = content
                                      .replace(/<[^>]*>/g, '') // Remove HTML tags
                                      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
                                      .replace(/&amp;/g, '&') // Replace &amp; with &
                                      .replace(/&lt;/g, '<') // Replace &lt; with <
                                      .replace(/&gt;/g, '>') // Replace &gt; with >
                                      .replace(/&quot;/g, '"') // Replace &quot; with "
                                      .replace(/&apos;/g, "'") // Replace &apos; with '
                                      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                                      .trim();
                                    
                                    // If content is too short or empty, create a summary from title
                                    if (cleanContent.length < 50) {
                                      const titleSummary = article.title ? 
                                        `Bài viết về ${article.title.toLowerCase()}. Khám phá những thông tin hữu ích và xu hướng thời trang mới nhất.` : 
                                        'Đang cập nhật nội dung...';
                                      return titleSummary.slice(0, 120) + '...';
                                    }
                                    
                                    return cleanContent.slice(0, 120) + '...';
                                  })()}
                                </p>
                                <div className="article-meta">
                                  <span className="article-date">
                                    {new Date(article.createdAt||Date.now()).toLocaleDateString('vi-VN')}
                                  </span>
                                  <span className="article-read-time">5 phút đọc</span>
                                </div>
                              </div>
                            </Link>
                          ))) : (
                            <div className="no-articles">
                              <div className="no-articles-content">
                                <div className="no-articles-icon">📰</div>
                                <h3>Chưa có bài viết nào</h3>
                                <p>Chúng tôi đang cập nhật nội dung mới. Vui lòng quay lại sau!</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="news-pagination">
                          <button className="pagination-btn pagination-prev">Trước</button>
                          <div className="pagination-numbers">
                            <span className="pagination-number active">1</span>
                            <span className="pagination-number">2</span>
                            <span className="pagination-number">3</span>
                          </div>
                          <button className="pagination-btn pagination-next">Sau</button>
                        </div>
                      </div>

                      {/* Sidebar */}
                      <div className="news-sidebar">
                        <div className="sidebar-section">
                          <h4 className="sidebar-title">Bài viết mới nhất</h4>
                          <div className="sidebar-articles">
                            {rest.slice(0, 5).map((article) => (
                              <Link 
                                key={article._id||article.id} 
                                to={`/news/${article._id||article.id}`} 
                                className="sidebar-article"
                              >
                                <div className="sidebar-article-image">
                                  {(article.image || article.thumbnail) ? (
                                    <img 
                                      alt={article.title} 
                                      src={article.image || article.thumbnail} 
                                      className="sidebar-image"
                                    />
                                  ) : (
                                    <div className="sidebar-image-placeholder"></div>
                                  )}
                                </div>
                                <div className="sidebar-article-content">
                                  <h5 className="sidebar-article-title">{article.title}</h5>
                                  <span className="sidebar-article-date">
                                    {new Date(article.createdAt||Date.now()).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="sidebar-section">
                          <h4 className="sidebar-title">Chủ đề phổ biến</h4>
                          <div className="sidebar-tags">
                            <span className="sidebar-tag">Xu hướng 2024</span>
                            <span className="sidebar-tag">Phong cách</span>
                            <span className="sidebar-tag">Làm đẹp</span>
                            <span className="sidebar-tag">Thời trang nam</span>
                            <span className="sidebar-tag">Thời trang nữ</span>
                            <span className="sidebar-tag">Phụ kiện</span>
                          </div>
                        </div>

                        <div className="sidebar-section">
                          <h4 className="sidebar-title">Newsletter</h4>
                          <div className="newsletter-form">
                            <p className="newsletter-text">Đăng ký nhận tin tức mới nhất</p>
                            <div className="newsletter-input-group">
                              <input 
                                type="email" 
                                placeholder="Email của bạn" 
                                className="newsletter-input"
                              />
                              <button className="newsletter-btn">Đăng ký</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
            </>
          )}
        </div>
      </MainLayout>
      <MyFooter />
    </>
  )
}


