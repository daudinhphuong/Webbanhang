import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import MyHeader from '@components/Header/Header'
import MainLayout from '@components/Layout/Layout'
import MyFooter from '@components/Footer/Footer'
import { fetchNewsDetail } from '@/apis/newsService'
import './NewsDetail.scss'

export default function NewsDetailPage() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchNewsDetail(id)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <>
        <MyHeader />
        <MainLayout>
          <div className="news-detail-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải bài viết...</p>
          </div>
        </MainLayout>
        <MyFooter />
      </>
    )
  }

  if (!item) {
    return (
      <>
        <MyHeader />
        <MainLayout>
          <div className="news-detail-error">
            <div className="error-content">
              <h2>Không tìm thấy bài viết</h2>
              <p>Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
              <Link to="/news" className="back-to-news-btn">
                ← Quay lại trang tin tức
              </Link>
            </div>
          </div>
        </MainLayout>
        <MyFooter />
      </>
    )
  }

  return (
    <>
      <MyHeader />
      <MainLayout>
        <div className="news-detail-page">
          {/* Breadcrumb */}
          <div className="news-breadcrumb">
            <Link to="/" className="breadcrumb-link">Trang chủ</Link>
            <span className="breadcrumb-separator">›</span>
            <Link to="/news" className="breadcrumb-link">Tin tức</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{item.title}</span>
          </div>

          <div className="news-detail-content">
            {/* Article Header */}
            <header className="article-header">
              <div className="article-category">Thời trang</div>
              <h1 className="article-title">{item.title}</h1>
              <div className="article-meta">
                <div className="article-author">
                  <div className="author-avatar">
                    {item.author ? item.author.charAt(0).toUpperCase() : 'B'}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{item.author || 'Biên tập viên'}</span>
                    <span className="author-role">Tác giả</span>
                  </div>
                </div>
                <div className="article-details">
                  <span className="article-date">
                    {new Date(item.createdAt || Date.now()).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="article-read-time">5 phút đọc</span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            <div className="article-featured-image">
              {item.image ? (
                <>
                  <img 
                    alt={item.title} 
                    src={item.image} 
                    className="featured-image"
                  />
                  <div className="image-caption">
                    Ảnh đại diện: {item.title}
                  </div>
                </>
              ) : (
                <div className="featured-image-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📰</div>
                    <h3 className="placeholder-title">{item.title}</h3>
                    <p className="placeholder-subtitle">Bài viết thời trang & phong cách</p>
                  </div>
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="article-body">
              <div className="article-content" dangerouslySetInnerHTML={{
                __html: item.content || item.description || 'Đang cập nhật nội dung...'
              }} />
              
              {/* Article Gallery */}
              {item.images && item.images.length > 0 && (
                <div className="article-gallery">
                  <h4 className="gallery-title">Hình ảnh bài viết</h4>
                  <div className="gallery-grid">
                    {item.images.map((image, index) => (
                      <div key={index} className="gallery-item">
                        <img 
                          src={image} 
                          alt={`${item.title} - Hình ${index + 1}`}
                          className="gallery-image"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Article Footer */}
            <footer className="article-footer">
              <div className="article-tags">
                <span className="tag-label">Tags:</span>
                <span className="article-tag">Thời trang</span>
                <span className="article-tag">Phong cách</span>
                <span className="article-tag">Xu hướng</span>
              </div>
              
              <div className="article-actions">
                <button className="action-btn share-btn">
                  <span>🔗</span> Chia sẻ
                </button>
                <button className="action-btn like-btn">
                  <span>❤️</span> Thích
                </button>
                <button className="action-btn bookmark-btn">
                  <span>🔖</span> Lưu
                </button>
              </div>
            </footer>

            {/* Related Articles */}
            <section className="related-articles">
              <h3 className="related-title">Bài viết liên quan</h3>
              <div className="related-grid">
                <div className="related-article">
                  <div className="related-image">
                    <div className="related-image-placeholder"></div>
                  </div>
                  <div className="related-content">
                    <h4 className="related-article-title">Xu hướng thời trang mùa hè 2024</h4>
                    <span className="related-date">15/01/2024</span>
                  </div>
                </div>
                <div className="related-article">
                  <div className="related-image">
                    <div className="related-image-placeholder"></div>
                  </div>
                  <div className="related-content">
                    <h4 className="related-article-title">Bí quyết phối đồ cho văn phòng</h4>
                    <span className="related-date">12/01/2024</span>
                  </div>
                </div>
                <div className="related-article">
                  <div className="related-image">
                    <div className="related-image-placeholder"></div>
                  </div>
                  <div className="related-content">
                    <h4 className="related-article-title">Phụ kiện không thể thiếu</h4>
                    <span className="related-date">10/01/2024</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </MainLayout>
      <MyFooter />
    </>
  )
}


