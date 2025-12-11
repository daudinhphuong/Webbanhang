// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useRef } from 'react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// Custom styles for the component
const styles = {
  container: {
    position: 'relative',
    marginTop: '80px',
    overflow: 'visible', // Đảm bảo nút điều hướng không bị cắt
  },
};

// Add custom CSS for hover effect
const customStyles = `
  .logos-slider .swiper-button-next,
  .logos-slider .swiper-button-prev {
    opacity: 0;
    transition: opacity 0.3s ease;
    color: black;
    width: 44px;
    height: 44px;
    margin-top: -22px;
  }
  
  .logos-slider:hover .swiper-button-next,
  .logos-slider:hover .swiper-button-prev {
    opacity: 1;
  }

  .logos-slider .swiper-button-next {
    right: -20px; /* Đặt nút next xa hơn về bên phải */
  }

  .logos-slider .swiper-button-prev {
    left: -20px; /* Đặt nút prev xa hơn về bên trái */
  }

  .logos-slider .swiper-button-next::after,
  .logos-slider .swiper-button-prev::after {
    font-size: 24px;
  }
`;

function Logos() {
  const dataLogos = [
    {
      id: '1',
      img: 'https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/2024/04/brand-01-min.png',
    },
    {
      id: '2',
      img: 'https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/2024/04/brand-01-min.png',
    },
    {
      id: '3',
      img: 'https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/2024/04/brand-01-min.png',
    },
    {
      id: '4',
      img: 'https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/2024/04/brand-01-min.png',
    },
    {
      id: '5',
      img: 'https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/2024/04/brand-01-min.png',
    },
    {
      id: '6',
      img: 'https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/2024/04/brand-01-min.png',
    },
    {
      id: '7',
      img: 'https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/2024/04/brand-01-min.png',
    },
    {
      id: '8',
      img: 'https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/2024/04/brand-01-min.png',
    },
  ];

  return (
    <div style={styles.container}>
      {/* Add style tag for custom CSS */}
      <style>{customStyles}</style>

      <Swiper
        spaceBetween={50}
        slidesPerView={5}
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => console.log(swiper)}
        navigation={true}
        modules={[Navigation]}
        className="logos-slider" // Add class for targeting in CSS
      >
        {dataLogos.map((item) => (
          <SwiperSlide
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={item.img}
              alt=""
              style={{
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Logos;
