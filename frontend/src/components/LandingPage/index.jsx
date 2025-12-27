import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import { Dumbbell, Users, Clock, Target } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeProvider/ThemeProvider';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import './styles.scss';

const slideImages = [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540496905036-5937c10647cc?q=80&w=2070&auto=format&fit=crop"
];

const LandingPage = () => {
    const { isDarkMode } = useTheme();
    const [activeIndex, setActiveIndex] = useState(2);
    const [swiperInstance, setSwiperInstance] = useState(null);
    const [swiperReady, setSwiperReady] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    useEffect(() => {
        let loaded = 0;
        const total = slideImages.length;

        slideImages.forEach(src => {
            const img = new Image();
            img.onload = img.onerror = () => {
                loaded++;
                if (loaded >= total) {
                    setImagesLoaded(true);
                }
            };
            img.src = src;
        });

        const fallbackTimer = setTimeout(() => setImagesLoaded(true), 2000);
        return () => clearTimeout(fallbackTimer);
    }, []);

    return (
        <div className={`landing-page ${isDarkMode ? 'dark-mode' : ''}`}>
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-text">
                        <h1 className="hero-title fade-in">
                            <span className="gradient-red">
                                FIT   LIFE
                            </span>
                            <br />
                        </h1>

                        <p className="hero-description slide-up">
                            TREINA. EVOLUI. DOMINA.
                        </p>

                        <Link
                            to="/login"
                            className="cta-button slide-up"
                        >
                            Acessar
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>

                <div className={`carousel-wrapper ${(imagesLoaded && swiperReady) ? 'ready' : 'loading'}`}>
                    <Swiper
                        effect={'coverflow'}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={3}
                        initialSlide={2}
                        loop={true}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        onSwiper={(swiper) => {
                            setSwiperInstance(swiper);
                            setTimeout(() => setSwiperReady(true), 2000);
                        }}
                        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex % 5)}
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 0,
                            depth: 150,
                            modifier: 2,
                            slideShadows: false,
                        }}
                        modules={[EffectCoverflow, Autoplay]}
                        className="swiper-dark"
                    >

                        <SwiperSlide>
                            <div className="slide-card-dark">
                                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="Musculação" />
                                <div className="slide-overlay-dark"></div>
                                <div className="slide-content-dark">
                                    <h2>MUSCULAÇÃO SMART</h2>
                                    <p>Equipamento de elite conectado ao teu plano digital.</p>

                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="slide-card-dark">
                                <img src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop" alt="Cardio" />
                                <div className="slide-overlay-dark"></div>
                                <div className="slide-content-dark">
                                    <h2>ZONA CARDIO</h2>
                                    <p>Monitorização em tempo real do teu desempenho.</p>

                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="slide-card-dark">
                                <img src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=2070&auto=format&fit=crop" alt="Cross Training" />
                                <div className="slide-overlay-dark"></div>
                                <div className="slide-content-dark">
                                    <h2>CROSS TRAINING</h2>
                                    <p>Supera limites com o apoio da nossa comunidade.</p>

                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="slide-card-dark">
                                <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop" alt="Personal Trainer" />
                                <div className="slide-overlay-dark"></div>
                                <div className="slide-content-dark">
                                    <h2>Gestão de Personal Trainers</h2>
                                    <p>O teu treinador.</p>

                                </div>
                            </div>
                        </SwiperSlide>



                        <SwiperSlide>
                            <div className="slide-card-dark">
                                <img src="https://images.unsplash.com/photo-1540496905036-5937c10647cc?q=80&w=2070&auto=format&fit=crop" alt="Spinning" />
                                <div className="slide-overlay-dark"></div>
                                <div className="slide-content-dark">
                                    <h2>ESTÚDIO CYCLING</h2>
                                    <p>Imersão total com som, luzes e instrutores de topo.</p>
                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="slide-card-dark">
                                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="Musculação" />
                                <div className="slide-overlay-dark"></div>
                                <div className="slide-content-dark">
                                    <h2>MUSCULAÇÃO SMART</h2>
                                    <p>Equipamento de elite conectado ao teu plano digital.</p>

                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="slide-card-dark">
                                <img src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop" alt="Cardio" />
                                <div className="slide-overlay-dark"></div>
                                <div className="slide-content-dark">
                                    <h2>ZONA CARDIO</h2>
                                    <p>Monitorização em tempo real do teu desempenho.</p>

                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="slide-card-dark">
                                <img src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=2070&auto=format&fit=crop" alt="Cross Training" />
                                <div className="slide-overlay-dark"></div>
                                <div className="slide-content-dark">
                                    <h2>CROSS TRAINING</h2>
                                    <p>Supera limites com o apoio da nossa comunidade.</p>

                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="slide-card-dark">
                                <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop" alt="Personal Trainer" />
                                <div className="slide-overlay-dark"></div>
                                <div className="slide-content-dark">
                                    <h2>Gestão de Personal Trainers</h2>
                                    <p>O teu treinador.</p>

                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className="slide-card-dark">
                                <img src="https://images.unsplash.com/photo-1540496905036-5937c10647cc?q=80&w=2070&auto=format&fit=crop" alt="Spinning" />
                                <div className="slide-overlay-dark"></div>
                                <div className="slide-content-dark">
                                    <h2>ESTÚDIO CYCLING</h2>
                                    <p>Imersão total com som, luzes e instrutores de topo.</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                    <div className="swiper-custom-pagination">
                        {[0, 1, 2, 3, 4].map((index) => (
                            <span
                                key={index}
                                className={`swiper-pagination-bullet ${activeIndex === index ? 'swiper-pagination-bullet-active' : ''}`}
                                onClick={() => swiperInstance?.slideToLoop(index)}
                            ></span>
                        ))}
                    </div>
                </div>
            </section>


            <section className="features-section">
                <div className="features-container">
                    <div className="features-header">
                        <span className="features-label">Porquê Nós?</span>
                        <h2 className="features-title">
                            O TEU <span className="features-title-highlight">SUCESSO</span> COMEÇA AQUI
                        </h2>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Dumbbell className="feature-icon" size={32} color="white" />
                            </div>
                            <h3 className="feature-card-title">Equipamento Premium</h3>
                            <p className="feature-card-text">Máquinas de última geração e pesos livres para todos os níveis.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Users className="feature-icon" size={32} color="white" />
                            </div>
                            <h3 className="feature-card-title">Personal Trainers</h3>
                            <p className="feature-card-text">Profissionais certificados para guiar a tua transformação.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Clock className="feature-icon" size={32} color="white" />
                            </div>
                            <h3 className="feature-card-title">Acesso 24/7</h3>
                            <p className="feature-card-text">Treina quando quiseres. O ginásio está sempre aberto para ti.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Target className="feature-icon" size={32} color="white" />
                            </div>
                            <h3 className="feature-card-title">Resultados Reais</h3>
                            <p className="feature-card-text">Programas personalizados focados nos teus objetivos.</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
