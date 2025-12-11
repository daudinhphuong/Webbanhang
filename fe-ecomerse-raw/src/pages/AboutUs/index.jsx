import MyFooter from '@components/Footer/Footer';
import MyHeader from '@components/Header/Header';
import MainLayout from '@components/Layout/Layout';
import styles from './styles.module.scss';
import Logos from '@/pages/AboutUs/components/Logos';
import axiosClient from '@/apis/axiosClient';
import { useEffect, useState } from 'react';

function AboutUs() {
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

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get('/about-posts');
        const items = Array.isArray(res.data) ? res.data : [];
        const published = items.filter((it) => it.publishedAt).sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        setPost(published[0] || null);
      } catch (e) {
        setError('Không tải được nội dung About');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <MyHeader />

      <MainLayout>
        <div className={container}>
          <div className={functionBox}>
            <div>
              Home &gt; <span className={specialText}>About us</span>
            </div>
            <div className={btnBack} onClick={() => handleBackPreviousPage()}>
              &lt; Return to previous page
            </div>
          </div>

          <div className={containerTitle}>
            <div className={line}>
              <div className={title}>
                <div className={textS}>we try our best for you</div>
                <div className={textL}>{post?.title || 'Welcome to the Marseille04 Shop'}</div>
              </div>
            </div>
          </div>

          <div className={containerContent}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Đang tải nội dung...</p>
              </div>
            ) : error ? (
              <div className={styles.errorContainer}>
                <div className={styles.errorIcon}>⚠️</div>
                <div className={des}>{error}</div>
              </div>
            ) : post ? (
              <div>
                {post.thumbnail ? (
                  <div className={styles.aboutImageContainer}>
                    <img 
                      src={post.thumbnail} 
                      alt={post.title || "About us"} 
                      className={styles.aboutImage}
                      onError={(e) => {
                        console.log('About image failed to load:', post.thumbnail);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className={styles.aboutImagePlaceholder}>
                    <div className={styles.placeholderContent}>
                      <div className={styles.placeholderIcon}>🏢</div>
                      <div className={styles.placeholderText}>About Us</div>
                    </div>
                  </div>
                )}
                <div className={des}>{post.content}</div>
              </div>
            ) : (
              <div className={styles.noContentContainer}>
                <div className={styles.noContentIcon}>📄</div>
                <div className={styles.noContentText}>Chưa có nội dung About</div>
                <div className={styles.noContentSubtext}>Nội dung sẽ được cập nhật sớm</div>
              </div>
            )}
          </div>

          <Logos />
        </div>
      </MainLayout>

      <MyFooter />
    </>
  );
}

export default AboutUs;
