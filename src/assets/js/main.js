gsap.registerPlugin(SplitText, CustomEase);

CustomEase.create("hop", "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1");

const carouselSlides = [
    {
        title: "Slide 01",
        image: "./src/assets/images/slide-img-1.jpg",
    },
    {
        title: "Slide 02",
        image: "./src/assets/images/slide-img-2.jpg",
    },
    {
        title: "Slide 03",
        image: "./src/assets/images/slide-img-3.jpg",
    },
    {
        title: "Slide 04",
        image: "./src/assets/images/slide-img-4.jpg",
    },
    {
        title: "Slide 05",
        image: "./src/assets/images/slide-img-5.jpg",
    },
];

let carousel, carouselImages, prevBtn, nextBtn;

let currentIndex = 0;
let carouselTextElements = [];
let splitTextInstances = [];
let isAnimating = false;

function initCarousel() {
    carousel = document.querySelector(".carousel");
    carouselImages = document.querySelector(".carousel-images");
    prevBtn = document.querySelector(".prev-btn");
    nextBtn = document.querySelector(".next-btn");

    createCarouselTitles();
    createInitialSlide();
    bindCarouselControls();

    document.fonts.ready.then(() => {
        splitTitles();
        initFirstSlide();
    });
}

function createCarouselTitles() {
    carouselSlides.forEach((slide) => {
        const slideTitleContainer = document.createElement("div");
        slideTitleContainer.classList.add("slide-title-container");

        const slideTitle = document.createElement("h1");
        slideTitle.classList.add("title");
        slideTitle.textContent = slide.title;

        slideTitleContainer.appendChild(slideTitle);
        carousel.appendChild(slideTitleContainer);

        carouselTextElements.push(slideTitleContainer);
    });
}

function createInitialSlide() {
    const initialSlideImgContainer = document.createElement("div");
    initialSlideImgContainer.classList.add("img");

    const initialSlideImg = document.createElement("img");
    initialSlideImg.src = carouselSlides[0].image;

    initialSlideImgContainer.appendChild(initialSlideImg);
    carouselImages.appendChild(initialSlideImgContainer);
}

function splitTitles() {
    carouselTextElements.forEach((slide) => {
        const slideTitle = slide.querySelector(".title");
        const splitText = new SplitText(slideTitle, {
            type: "words",
            wordsClass: "word",
        });

        // store instance and also ensure words start hidden + blurred
        splitTextInstances.push(splitText);

        // SplitText exposes splitText.words (array of DOM nodes)
        gsap.set(splitText.words, {
            filter: "blur(75px)",
            opacity: 0,
            // keep pointer-events none (title container has it) — we only animate visual properties
        });
    });
}

function bindCarouselControls() {
    nextBtn.addEventListener("click", () => {
        if (isAnimating) return;

        currentIndex = (currentIndex + 1) % carouselSlides.length;
        animateSlide("right");
    });

    prevBtn.addEventListener("click", () => {
        if (isAnimating) return;

        currentIndex = (currentIndex - 1 + carouselSlides.length) % carouselSlides.length;
        animateSlide("left");
    });
}

function initFirstSlide() {
    // Make sure everything else is hidden (safety)
    splitTextInstances.forEach((inst, idx) => {
        gsap.set(inst.words, { filter: "blur(75px)", opacity: 0 });
    });

    // Reveal the first slide words with a staggered animation
    const firstWords = splitTextInstances[0].words;
    gsap.to(firstWords, {
        filter: "blur(0px)",
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.06,
        onComplete: () => {
            // ensure final state
            gsap.set(firstWords, { filter: "blur(0px)", opacity: 1 });
        },
    });
}

function updateActiveTextSlide() {
    // Hide all words first (so previous slide's words are not visible)
    splitTextInstances.forEach((inst) => {
        gsap.set(inst.words, { filter: "blur(75px)", opacity: 0 });
    });

    // Then animate the current slide words in with a nice stagger
    const currentWords = splitTextInstances[currentIndex].words;

    gsap.to(currentWords, {
        filter: "blur(0px)",
        opacity: 1,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.06,
        onComplete: () => {
            // keep them visible and unblurred
            gsap.set(currentWords, { filter: "blur(0px)", opacity: 1 });
        },
    });
}

function animateSlide(direction) {
    if (isAnimating) return;
    isAnimating = true;

    const viewportWidth = window.innerWidth;
    const slideOffset = Math.min(viewportWidth * 0.5, 500);

    const currentSlide = carouselImages.querySelector(".img:last-child");
    const currentSlideImage = currentSlide.querySelector("img");

    const newSlideImgContainer = document.createElement("div");
    newSlideImgContainer.classList.add("img");

    const newSlideImg = document.createElement("img");
    newSlideImg.src = carouselSlides[currentIndex].image;

    gsap.set(newSlideImg, {
        x: direction === "left" ? -slideOffset : slideOffset,
    });

    newSlideImgContainer.appendChild(newSlideImg);
    carouselImages.appendChild(newSlideImgContainer);

    gsap.to(currentSlideImage, {
        x: direction === "left" ? slideOffset : -slideOffset,
        duration: 1.5,
        ease: "hop",
    });

    gsap.fromTo(
        newSlideImgContainer,
        {
            clipPath:
                direction === "left"
                    ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
                    : "polygon(100% 0%, 100% 0%, 100% 100% 100% 100%)",
        },
        {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.5,
            ease: "hop",
            onComplete: () => {
                cleanupCarouselSlide();
                isAnimating = false;
            },
        }
    );

    gsap.to(newSlideImg, {
        x: 0,
        duration: 1.5,
        ease: "hop",
    });

    updateActiveTextSlide();
}

function cleanupCarouselSlide() {
    const imgElements = carouselImages.querySelectorAll(".img");

    if (imgElements.length > 1) {
        for (let i = 0; i < imgElements.length - 1; i++) {
            imgElements[i].remove();
        }
    }
}

document.addEventListener("DOMContentLoaded", initCarousel);
