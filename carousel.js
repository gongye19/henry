document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.hobby-carousel');
    const container = carousel.querySelector('.carousel-container');
    const images = container.querySelectorAll('img');
    const prevButton = carousel.querySelector('.prev');
    const nextButton = carousel.querySelector('.next');
    let currentIndex = 0;

    // 克隆第一张图片并添加到最后
    const firstImageClone = images[0].cloneNode(true);
    container.appendChild(firstImageClone);

    function updateCarousel(instant = false) {
        if (instant) {
            container.style.transition = 'none';
        } else {
            container.style.transition = 'transform 0.5s ease-in-out';
        }
        container.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
        currentIndex++;
        updateCarousel();

        if (currentIndex === images.length) {
            setTimeout(() => {
                currentIndex = 0;
                updateCarousel(true);
            }, 500); // 等待过渡效果结束后瞬间切换到第一张
        }
    }

    function prevSlide() {
        if (currentIndex === 0) {
            currentIndex = images.length;
            updateCarousel(true);
            setTimeout(() => {
                currentIndex--;
                updateCarousel();
            }, 20);
        } else {
            currentIndex--;
            updateCarousel();
        }
    }

    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);

    // 自动轮播
    setInterval(nextSlide, 5000);

    console.log('Carousel initialized');
});