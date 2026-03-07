document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    let userClickedNav = false; 
    
    function forceHomeActive() {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        if (window.location.hash) {
            const hashLink = Array.from(navLinks).find(link => link.getAttribute('href') === window.location.hash);
            if (hashLink) {
                hashLink.classList.add('active');
                return;
            }
        }
        
        if (navLinks.length > 0) {
            navLinks[0].classList.add('active');
        }
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('href');
            const targetSection = document.querySelector(sectionId);
            
            if (targetSection) {
                navLinks.forEach(navLink => {
                    navLink.classList.remove('active');
                });
                
                this.classList.add('active');

                userClickedNav = true;
                
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
               
                if (history.pushState) {
                    history.pushState(null, null, sectionId);
                } else {
                    window.location.hash = sectionId;
                }
                
                activateCarouselsInSection(targetSection);
                
                setTimeout(() => {
                    userClickedNav = false;
                }, 1000);
            }
        });
    });
    
    window.addEventListener('scroll', function() {
        if (userClickedNav) return;
        
        if (!window.scrollTimeout) {
            window.scrollTimeout = setTimeout(function() {
                updateActiveNavOnScroll();
                window.scrollTimeout = null;
            }, 100);
        }
    });
    
    function updateActiveNavOnScroll() {
        if (userClickedNav) return;
        
        let current = '';
        const sections = document.querySelectorAll('section');
        const navHeight = document.querySelector('header')?.offsetHeight || 0;
        const scrollPosition = window.scrollY + navHeight + 50; 
        
        if (window.scrollY < 150) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link === navLinks[0]) {
                    link.classList.add('active');
                }
            });
            return;
        }
        
        let currentSection = null;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = '#' + section.getAttribute('id');
                currentSection = section;
            }
        });
        
        if (current) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === current) {
                    link.classList.add('active');
                }
            });
            
            if (currentSection) {
                activateCarouselsInSection(currentSection);
            }
        }
    }

    //Carousel
    const carouselPositions = new Map();
    let activeCarouselPositions = new Map(); 

    const categoryBtns = document.querySelectorAll('.category-btn');
    const carousels = document.querySelectorAll('.carousel');

    function hideAllCarousels() {
        carousels.forEach(carousel => {
            carousel.style.display = 'none';
        });
    }

    function resetCarouselsToOriginal(exceptCarouselId = null) {
        carousels.forEach(carousel => {
            if (carousel.id !== exceptCarouselId) {
                const currentPosition = carouselPositions.get(carousel.id) || 0;
                activeCarouselPositions.set(carousel.id, currentPosition);
                carouselPositions.set(carousel.id, 0);
                updateCarousel(carousel, 0);
            }
        });
    }

    function handleAlbumClick(albumElement, carouselId, albumIndex) {
        resetCarouselsToOriginal(carouselId);
        
        const currentCarousel = document.getElementById(carouselId);
        if (currentCarousel) {
            updateCarousel(currentCarousel, albumIndex);
        }
    }

    function activateCarouselsInSection(section) {
        const sectionCarousels = section.querySelectorAll('.carousel');
        
        if (sectionCarousels.length === 0) return;
        
        sectionCarousels.forEach(carousel => {
            carousel.style.display = 'none';
        });

        const sectionCategoryBtns = section.querySelectorAll('.category-btn');
        
        if (sectionCategoryBtns.length > 0) {
            const activeBtn = section.querySelector('.category-btn.active') || sectionCategoryBtns[0];
        
            if (!activeBtn.classList.contains('active')) {
                sectionCategoryBtns.forEach(btn => btn.classList.remove('active'));
                activeBtn.classList.add('active');
            }
            
            const category = activeBtn.getAttribute('data-category');
            const activeCarousel = section.querySelector(`#${category}-carousel`);
            
            if (activeCarousel) {
                activeCarousel.style.display = 'block';
                const storedPosition = carouselPositions.get(activeCarousel.id) || 0;
                updateCarousel(activeCarousel, storedPosition);
            }
        } else {
            sectionCarousels.forEach(carousel => {
                carousel.style.display = 'block';
                const storedPosition = carouselPositions.get(carousel.id) || 0;
                updateCarousel(carousel, storedPosition);
            });
        }
    }

    function initializeCarousels() {
        carousels.forEach(carousel => {
            const slides = carousel.querySelectorAll('.album-slide');
            
            if (slides.length > 0) {
                slides.forEach((slide, index) => {
                    slide.style.position = 'absolute';
                });
                
                createCarouselIndicators(carousel, slides.length);
                if (!carouselPositions.has(carousel.id)) {
                    carouselPositions.set(carousel.id, 0);
                }
            }
        });
        
        if (window.location.hash) {
            const targetSection = document.querySelector(window.location.hash);
            if (targetSection) {
                setTimeout(() => {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    activateCarouselsInSection(targetSection);
                }, 300);
            }
        } else {
            const defaultSection = document.querySelector('section');
            if (defaultSection) {
                activateCarouselsInSection(defaultSection);
            }
        }
    }

    function createCarouselIndicators(carousel, slideCount) {
        let indicatorsContainer = carousel.querySelector('.carousel-indicators');
        
        if (!indicatorsContainer) {
            indicatorsContainer = document.createElement('div');
            indicatorsContainer.className = 'carousel-indicators';
            carousel.appendChild(indicatorsContainer);
        } else {
            indicatorsContainer.innerHTML = '';
        }
        
        for (let i = 0; i < slideCount; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'carousel-indicator';
            indicator.setAttribute('data-index', i);
            
            indicator.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                updateCarousel(carousel, index);
            });
            
            indicatorsContainer.appendChild(indicator);
        }
    }

    function updateCarousel(carousel, centerIndex) {
        if (!carousel) return;
        
        const slides = carousel.querySelectorAll('.album-slide');
        const totalSlides = slides.length;
        
        if (totalSlides === 0) return;
        
        slides.forEach(slide => {
            slide.style.transform = '';
            slide.style.opacity = '0';
            slide.style.zIndex = '0';
            
            if (slide.querySelector('.album-info')) {
                slide.querySelector('.album-info').style.opacity = '0';
            }
        });

        centerIndex = Math.max(0, Math.min(centerIndex, totalSlides - 1));
        
        carouselPositions.set(carousel.id, centerIndex);
        
        for (let i = -2; i <= 2; i++) {
            const index = centerIndex + i;
            
            if (index < 0 || index >= totalSlides) continue;
            
            const slide = slides[index];
            const position = i;
            
            if (position === 0) {
                slide.style.transform = 'translateX(0) translateZ(0) scale(1)';
                slide.style.zIndex = '5';
                slide.style.opacity = '1';
                if (slide.querySelector('.album-info')) {
                    slide.querySelector('.album-info').style.opacity = '1';
                }
            } else if (position === -1) {
                slide.style.transform = 'translateX(-350px) translateZ(-80px) scale(0.85)';
                slide.style.zIndex = '2';
                slide.style.opacity = '0.8';
            } else if (position === 1) {
                slide.style.transform = 'translateX(350px) translateZ(-80px) scale(0.85)';
                slide.style.zIndex = '2';
                slide.style.opacity = '0.8';
            } else if (position === -2) {
                slide.style.transform = 'translateX(-700px) translateZ(-150px) scale(0.75)';
                slide.style.zIndex = '1';
                slide.style.opacity = '0.6';
            } else if (position === 2) {
                slide.style.transform = 'translateX(700px) translateZ(-150px) scale(0.75)';
                slide.style.zIndex = '1';
                slide.style.opacity = '0.6';
            }
        }
        
        const indicators = carousel.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            if (index === centerIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        slides.forEach((slide, index) => {
            slide.onclick = function(e) {
                if (index === centerIndex) {
                    handleAlbumClick(slide, carousel.id, index);
                } else {
                    updateCarousel(carousel, index);
                }
            };
            slide.ondblclick = function(e) {
                e.stopPropagation();
                handleAlbumClick(slide, carousel.id, index);
            };
        });
        
        const prevBtn = carousel.querySelector('.prev-btn');
        const nextBtn = carousel.querySelector('.next-btn');
        
        if (prevBtn) {
            prevBtn.onclick = function(e) {
                e.stopPropagation();
                const newIndex = (centerIndex > 0) ? centerIndex - 1 : totalSlides - 1;
                updateCarousel(carousel, newIndex);
            };
        }
        
        if (nextBtn) {
            nextBtn.onclick = function(e) {
                e.stopPropagation();
                const newIndex = (centerIndex < totalSlides - 1) ? centerIndex + 1 : 0;
                updateCarousel(carousel, newIndex);
            };
        }
    }

    if (categoryBtns.length > 0) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const parentSection = this.closest('section');
                if (!parentSection) return;
                
                const sectionBtns = parentSection.querySelectorAll('.category-btn');
                sectionBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const sectionCarousels = parentSection.querySelectorAll('.carousel');
                sectionCarousels.forEach(carousel => {
                    carousel.style.display = 'none';
                });
                
                const category = this.getAttribute('data-category');
                const activeCarousel = parentSection.querySelector(`#${category}-carousel`);
                if (activeCarousel) {
                    activeCarousel.style.display = 'block';
                    const storedPosition = carouselPositions.get(activeCarousel.id) || 0;
                    updateCarousel(activeCarousel, storedPosition);
                }
            });
        });
    }

    forceHomeActive();
    initializeCarousels();
    updateActiveNavOnScroll();

    window.addEventListener('load', function() {
        if (window.scrollY < 150) {
            forceHomeActive();
        } else {
            updateActiveNavOnScroll();
        }
        
        const currentSection = window.location.hash ? 
            document.querySelector(window.location.hash) : 
            document.querySelector('section');
            
        if (currentSection) {
            activateCarouselsInSection(currentSection);
        }
    });

    let scrollDebounceTimer;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollDebounceTimer);
        scrollDebounceTimer = setTimeout(function() {
            if (userClickedNav) return;
            
            const sections = document.querySelectorAll('section');
            const navHeight = document.querySelector('header')?.offsetHeight || 0;
            const scrollPosition = window.scrollY + navHeight + 50;
            
            let visibleSection = null;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    visibleSection = section;
                }
            });
            
            if (visibleSection) {
                activateCarouselsInSection(visibleSection);
            }
            
            if (window.scrollY < 150) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link === navLinks[0]) {
                        link.classList.add('active');
                    }
                });
            }
        }, 200); 
    });
    function restoreCarouselPositions() {
        activeCarouselPositions.forEach((position, carouselId) => {
            const carousel = document.getElementById(carouselId);
            if (carousel) {
                carouselPositions.set(carouselId, position);
                updateCarousel(carousel, position);
            }
        });
        activeCarouselPositions.clear();
    }
    function resetAllCarousels() {
        carousels.forEach(carousel => {
            carouselPositions.set(carousel.id, 0);
            updateCarousel(carousel, 0);
        });
        activeCarouselPositions.clear();
    }
    
    //Music PLayer
    let currentAlbum = null;
    let currentTrackIndex = 0;
    let isPlaying = false;
    let audioElement = new Audio();
    let progressInterval;

        const albumDatabase = {
            // Albums
            "Cosmic (Album)": {
                cover: "img/album/Cosmic-1.jpg",
                year: "2024",
                tracks: [
                    { title: "Cosmic", duration: "3:46", file: "audio/albums/Cosmic/Cosmic.mp3" },
                    { title: "Sunflower", duration: "3:17", file: "audio/albums/Cosmic/Red Velvet 레드벨벳 'Sunflower' (Official Audio).mp3" },
                    { title: "Last Drop", duration: "3:24", file: "audio/albums/Cosmic/Red Velvet 레드벨벳 'Last Drop' (Official Audio).mp3" },
                    { title: "Love Arcade", duration: "2:57", file: "audio/albums/Cosmic/Red Velvet (레드벨벳) - 'Love Arcade' Lyrics [Color CodedHanRomEng].mp3" },
                    { title: "Bubble", duration: "3:29", file: "audio/albums/Cosmic/Red Velvet 레드벨벳 'Bubble' (Official Audio).mp3" },
                    { title: "Night Drive", duration: "3:20", file: "audio/albums/Cosmic/Red Velvet 레드벨벳 'Night Drive' (Official Audio).mp3" },
                    { title: "Sweet Dreams", duration: "3:10", file: "audio/albums/Cosmic/Red Velvet (레드벨벳) 'Sweet Dreams' Official Audio.mp3"}
                ]
            },
            "Chill Kill": {
                cover: "img/album/Chill Kill.jpg",
                year: "2023",
                tracks: [
                    { title: "Chill Kill", duration: "3:35", file: "audio/albums/Chill Kill/Red Velvet (레드벨벳) - Chill Kill Official Audio.mp3" },
                    { title: "Knock Knock (Who's There?)", duration: "3:22", file: "audio/albums/Chill Kill/Knock Knock (Who's There_).mp3" },
                    { title: "Underwater", duration: "3:26", file: "audio/albums/Chill Kill/Underwater.mp3" },
                    { title: "Will I Ever See You Again?", duration: "3:12", file:"audio/albums/Chill Kill/Will I Ever See You Again_.mp3"},
                    { title: "Nightmare", duration: "3:26", file: "audio/albums/Chill Kill/Nightmare.mp3"},
                    { title: "Iced Coffee", duration: "3:19", file: "audio/albums/Chill Kill/Iced Coffee.mp3" },
                    { title: "One Kiss", duration: "3:20", file:"audio/albums/Chill Kill/One Kiss.mp3"},
                    { title: "Bulldozer", duration: "2:41", file: "audio/albums/Chill Kill/Bulldozer.mp3"},
                    { title: "Wings", duration: "3:44", file: "audio/albums/Chill Kill/Wings.mp3"},
                    { title: "풍경화 Scenery", duration: "3:30", file: "audio/albums/Chill Kill/풍경화 Scenery.mp3" }
                ]
            },
            "The ReVe Festival: Finale": {
                cover: "img/album/The ReVe Festival-Finale.jpg",
                year: "2019",
                tracks: [
                    { title: "Psycho", duration: "3:31", file: "audio/albums/The ReVe Festival - Finale/Psycho.mp3" },
                    { title: "In & Out", duration: "3:13", file: "audio/albums/The ReVe Festival - Finale/In & Out.mp3" },
                    { title: "Remember Forever", duration: "3:08", file: "audio/albums/The ReVe Festival - Finale/Remember Forever.mp3" },
                    { title: "눈 맞추고, 손 맞대고 Eyes Locked, Hands Locked", duration: "4:11", file: "audio/albums/The ReVe Festival - Finale/눈 맞추고, 손 맞대고 Eyes Locked, Hands Locked.mp3"},
                    { title: "Ladies Night", duration: "3:57", file: "audio/albums/The ReVe Festival - Finale/Ladies Night.mp3"},
                    { title: "Jumpin'", duration: "3:36", file: "audio/albums/The ReVe Festival - Finale/Jumpin.mp3"},
                    { title: "Love Is The Way", duration: "3:32", file: "audio/albums/The ReVe Festival - Finale/Love Is The Way.mp3"},
                    { title: "카풀 Carpool", duration: "3:27", file: "audio/albums/The ReVe Festival - Finale/카풀 Carpool.mp3"},
                    { title: "음파음파 Umpah Umpah", duration: "3:41", file: "audio/albums/The ReVe Festival - Finale/음파음파 Umpah Umpah.mp3"},
                    { title: "LP", duration: "3:28", file: "audio/albums/The ReVe Festival - Finale/LP.mp3"},
                    { title: "안녕, 여름 Parade", duration: "3:14", file: "audio/albums/The ReVe Festival - Finale/안녕, 여름 Parade.mp3"},
                    { title: "친구가 아냐 Bing Bing", duration: "3:23", file: "audio/albums/The ReVe Festival - Finale/친구가 아냐 Bing Bing.mp3"},
                    { title: "Milkshake", duration: "3:31", file: "audio/albums/The ReVe Festival - Finale/Milkshake.mp3"},
                    { title: "Sunny Side Up!", duration: "3:24", file: "audio/albums/The ReVe Festival - Finale/Sunny Side Up!.mp3"},
                    { title: "짐살라빔 Zimzalabim", duration: "3:11", file: "audio/albums/The ReVe Festival - Finale/짐살라빔 Zimzalabim.mp3"},
                    { title: "La Rouge (Special Track)", duration: "3:10", file: "audio/albums/The ReVe Festival - Finale/La Rouge (Special Track).mp3" }
                ]
            }, 
            "The Perfect Red Velvet (Repackage)" : {
                cover: "img/album/Perfect Red Velvet.jpg", 
                year: "2018", 
                tracks : [
                    { title: "Bad Boy", duration: "3:31", file: "audio/albums/The Perfect Red Velvet/Bad Boy.mp3"},
                    { title: "All Right", duration: "3:50", file: "audio/albums/The Perfect Red Velvet/All Right.mp3"},
                    { title: "피카부 Peek-A-Boo", duration: "3:10", file: "audio/albums/The Perfect Red Velvet/피카부 Peek-A-Boo.mp3"},
                    { title: "봐 Look", duration: "4:06", file: "audio/albums/The Perfect Red Velvet/봐 Look.mp3"}, 
                    { title: "I Just", duration: "3:09", file: "audio/albums/The Perfect Red Velvet/I Just.mp3"},
                    { title: "Kingdom Come", duration: "3:31", file: "audio/albums/The Perfect Red Velvet/Kingdom Come.mp3"},
                    { title: "Time to Love", duration: "3:16", file: "audio/albums/The Perfect Red Velvet/Time to Love.mp3"},
                    { title: "두 번째 데이트 My Second Date", duration: "3:15", file: "audio/albums/The Perfect Red Velvet/두 번째 데이트 My Second Date.mp3"},
                    { title: "Attaboy", duration: "3:17", file: "audio/albums/The Perfect Red Velvet/Attaboy.mp3"},
                    { title: "Perfect 10", duration: "3:30", file: "audio/albums/The Perfect Red Velvet/Perfect 10.mp3"},
                    { title: "About Love", duration: "3:26", file: "audio/albums/The Perfect Red Velvet/About Love.mp3"},
                    { title: "달빛 소리 Moonlight Melody", duration: "3:41", file: "audio/albums/The Perfect Red Velvet/달빛 소리 Moonlight Melody.mp3"}
                ]
            },
            "The Perfect Velvet" : {
                cover: "img/album/Perfect Velvet.jpg",
                year: "2017",
                tracks: [
                    { title: "피카부 Peek-A-Boo", duration: "3:10", file: "audio/albums/The Perfect Velvet/피카부 Peek-A-Boo.mp3"},
                    { title: "봐 Look", duration: "4:06", file: "audio/albums/The Perfect Velvet/봐 Look.mp3"},
                    { title: "I Just", duration: "3:09", file: "audio/albums/The Perfect Velvet/I Just.mp3"},
                    { title: "Kingdom Come", duration: "3:31", file: "audio/albums/The Perfect Velvet/Kingdom Come.mp3"},
                    { title: "두 번째 데이트 My Second Date", duration: "3:15", file: "audio/albums/The Perfect Velvet/두 번째 데이트 My Second Date.mp3"},
                    { title: "Attaboy", duration: "3:17", file: "audio/albums/The Perfect Velvet/Attaboy.mp3"},
                    { title: "Perfect 10", duration: "3:30", file: "audio/albums/The Perfect Velvet/Perfect 10.mp3"},
                    { title: "About Love", duration: "3:26", file: "audio/albums/The Perfect Velvet/About Love.mp3"}, 
                    { title: "달빛 소리 Moonlight Melody", duration: "3:41", file: "audio/albums/The Perfect Velvet/달빛 소리 Moonlight Melody.mp3"}
                ] 
            },
            "The Red" : {
                cover: "img/album/The Red.jpg",
                year: "2015", 
                tracks: [
                    { title: "Dumb Dumb", duration: "3:23", file: "audio/albums/The Red/Dumb Dumb.mp3"}, 
                    { title: "Huff n Puff", duration: "3:02", file: "audio/albums/The Red/Huff n Puff.mp3"},
                    { title: "Campfire", duration: "3:17", file: "audio/albums/The Red/Campfire.mp3"},
                    { title: "Red Dress", duration: "3:03", file: "audio/albums/The Red/Red Dress.mp3"},
                    { title: "Oh Boy", duration: "3:09", file: "audio/albums/The Red/Oh Boy.mp3"},
                    { title: "Lady's Room", duration: "3:16", file: "audio/albums/The Red/Lady's Room.mp3"},
                    { title: "Time Slip", duration: "3:40", file: "audio/albums/The Red/Time Slip.mp3"},
                    { title: "Don't U Wait No More", duration: "2:52", file: "audio/albums/The Red/Don't U Wait No More.mp3"},
                    { title: "Day 1", duration: "3:27", file: "audio/albums/The Red/Day 1.mp3"}, 
                    { title: "Cool World", duration: "4:06", file: "audio/albums/The Red/Cool World.mp3"}
                ]  
            },

            //Singles or EPS
            "Cosmic (EP)" : {
                cover: "img/singles-eps/cosmic-ep.jpg",
                year: "2024", 
                tracks: [
                    { title: "Cosmic", duration: "3:46", file: "audio/singles-eps/Cosmic - Ep/Cosmic.mp3"},
                    { title: "Sunflower", duration: "3:17", file: "audio/singles-eps/Cosmic - Ep/Sunflower.mp3" },
                    { title: "Last Drop", duration: "3:24", file: "audio/singles-eps/Cosmic - Ep/Last Drop.mp3" },
                    { title: "Love Arcade", duration: "2:57", file: "audio/singles-eps/Cosmic - Ep/Red Velvet (레드벨벳) - 'Love Arcade' Lyrics [Color CodedHanRomEng].mp3" },
                    { title: "Bubble", duration: "3:29", file: "audio/singles-eps/Cosmic - Ep/Bubble.mp3" },
                    { title: "Night Drive", duration: "3:20", file: "audio/singles-eps/Cosmic - Ep/Night Drive.mp3" },
                ]
            },
            "The ReVe Festival 2022 - Birthday": {
                cover: "img/singles-eps/The ReVe Festival-Birthday.jpg",
                year: "2022",
                tracks: [
                    { title: "Birthday", duration: "3:37", file: "audio/singles-eps/The ReVe  Festival  - Birthday/Birthday.mp3"},
                    { title: "BYE BYE", duration: "3:17", file: "audio/singles-eps/The ReVe  Festival  - Birthday/BYE BYE.mp3"}, 
                    { title: "롤러코스터 On A Ride", duration: "3:19", file: "audio/singles-eps/The ReVe  Festival  - Birthday/롤러코스터 On A Ride.mp3"},
                    { title: "ZOOM", duration: "3:05", file: "audio/singles-eps/The ReVe  Festival  - Birthday/ZOOM.mp3"},
                    { title: "Celebrate", duration: "2:45", file: "audio/singles-eps/The ReVe  Festival  - Birthday/Celebrate.mp3"}
                ]
            },
            "The ReVe Festival 2022 - Feel My Rhythm": {
                cover: "img/singles-eps/The ReVe Festival- Feel My Rhythm.jpg",
                year: "2022",
                tracks: [
                    { title: "Feel My Rhythm", duration: "3:31", file: "audio/singles-eps/The ReVe Festival - Feel My Rhythm/Feel My Rhythm.mp3"},
                    { title: "Rainbow Halo", duration: "3:29", file: "audio/singles-eps/The ReVe Festival - Feel My Rhythm/Rainbow Halo.mp3"},
                    { title: "Beg For Me", duration: "3:33", file: "audio/singles-eps/The ReVe Festival - Feel My Rhythm/Beg For Me.mp3"},
                    { title: "BAMBOLEO", duration: "3:29", file: "audio/singles-eps/The ReVe Festival - Feel My Rhythm/BAMBOLEO.mp3"},
                    { title: "Good, Bad, Ugly", duration: "3:02", file: "audio/singles-eps/The ReVe Festival - Feel My Rhythm/Good, Bad, Ugly.mp3"},
                    { title: "In My Dreams", duration: "3:25", file: "audio/singles-eps/The ReVe Festival - Feel My Rhythm/In My Dreams.mp3"}
                ]
            }, 
            "Queendom": {
                cover: "img/singles-eps/Queendom.jpg",
                year: "2021",
                tracks: [
                    { title: "Queendom", duration: "3:02", file: "audio/singles-eps/Queendom/Queendom.mp3"},
                    { title: "Pose", duration: "3:21", file: "audio/singles-eps/Queendom/Pose.mp3"},
                    { title: "Knock On Wood", duration: "3:41", file: "audio/singles-eps/Queendom/Knock On Wood.mp3"},
                    { title: "Better Be", duration: "3:01", file: "audio/singles-eps/Queendom/Better Be.mp3"},
                    { title: "Pushin' N Pullin'", duration: "3:04", file: "audio/singles-eps/Queendom/Pushin' N Pullin'.mp3"},
                    { title: "다시, 여름 Hello, Sunset", duration: "3:31", file: "audio/singles-eps/Queendom/다시, 여름 Hello, Sunset.mp3"}
                ]
            },
            "The ReVe Festival: Day 2": {
                cover: "img/singles-eps/The ReVe Festival - Day2.jpg",
                year: "2019",
                tracks: [
                    { title: "음파음파 Umpah Umpah", duration: "3:41", file: "audio/singles-eps/The ReVe Festival - Day 2/음파음파 Umpah Umpah.mp3"},
                    { title: "카풀 Carpool", duration: "3:27", file: "audio/singles-eps/The ReVe Festival - Day 2/카풀 Carpool.mp3"},
                    { title: "Love Is The Way", duration: "3:32", file: "audio/singles-eps/The ReVe Festival - Day 2/Love Is The Way.mp3"},
                    { title: "Jumpin'", duration: "3:36", file: "audio/singles-eps/The ReVe Festival - Day 2/Jumpin.mp3"},
                    { title: "Ladies Night", duration: "3:57", file: "audio/singles-eps/The ReVe Festival - Day 2/Ladies Night.mp3"},
                    { title: "눈 맞추고, 손 맞대고 Eyes Locked, Hands Locked", duration: "4:11", file: "audio/singles-eps/The ReVe Festival - Day 2/눈 맞추고, 손 맞대고 Eyes Locked, Hands Locked.mp3"}
                ]
            },
            "The ReVe Festival: Day 1": {
                cover: "img/singles-eps/The ReVe Festival - Day1.jpg",
                year: "2019",
                tracks: [
                    { title: "짐살라빔 Zimzalabim", duration: "3:11", file: "audio/singles-eps/The ReVe Festival - Day 1/짐살라빔 Zimzalabim.mp3"},
                    { title: "Sunny Side Up!", duration: "3:24", file: "audio/singles-eps/The ReVe Festival - Day 1/Sunny Side Up!.mp3"},
                    { title: "Milkshake", duration: "3:31", file: "audio/singles-eps/The ReVe Festival - Day 1/Milkshake.mp3"},
                    { title: "친구가 아냐 Bing Bing", duration: "3:23", file: "audio/singles-eps/The ReVe Festival - Day 1/친구가 아냐 Bing Bing.mp3"},
                    { title: "안녕, 여름 Parade", duration: "3:14", file: "audio/singles-eps/The ReVe Festival - Day 1/안녕, 여름 Parade.mp3"},
                    { title: "LP", duration: "3:28", file: "audio/singles-eps/The ReVe Festival - Day 1/LP.mp3"}
                ]
            },
            "SAPPY": {
                cover: "img/singles-eps/SAPPY.jpg",
                year: "2019",
                tracks: [
                    { title: "SAPPY", duration: "3:20", file: "audio/singles-eps/Sappy/Sappy  Red Velvet.mp3"},
                    { title: "Swimming Pool", duration: "3:21", file: "audio/singles-eps/Sappy/Swimming Pool.mp3"},
                    { title: "Sayonara", duration: "3:16", file: "audio/singles-eps/Sappy/Sayonara.mp3"},
                    { title: "Peek-a-Boo", duration: "3:10", file: "audio/singles-eps/Sappy/Peek-A-Boo (Japanese Version).mp3"},
                    { title: "Rookie", duration: "3:17", file: "audio/singles-eps/Sappy/Rookie (Japanese Version).mp3"},
                    { title: "Power Up", duration: "3:26", file: "audio/singles-eps/Sappy/Power Up (Japanese Ver.).mp3"}
                ]
            },
            "RBB": {
                cover: "img/singles-eps/RBB.jpg",
                year: "2018",
                tracks: [
                    { title: "RBB (Really Bad Boy)", duration: "3:09", file: "audio/singles-eps/RBB/RBB (Really Bad Boy).mp3"},
                    { title: "Butterflies", duration: "3:30", file: "audio/singles-eps/RBB/Butterflies.mp3"},
                    { title: "So Good", duration: "3:27", file: "audio/singles-eps/RBB/So Good.mp3"}, 
                    { title: "멋있게 (Sassy Me)", duration: "3:07", file: "audio/singles-eps/RBB/멋있게 (Sassy Me).mp3"},
                    { title: "Taste", duration: "3:05", file: "audio/singles-eps/RBB/Taste.mp3"},
                    { title: "RBB (Really Bad Boy) [English Version]", duration: "3:09", file: "audio/singles-eps/RBB/RBB (Really Bad Boy) [Eng].mp3"}
                ]
            },
            "Summer Magic": {
                cover: "img/singles-eps/Summer Magic.jpg",
                year: "2018",
                tracks: [
                    { title: "Power Up", duration: "3:23", file: "audio/singles-eps/Summer Magic/Power Up.mp3"},
                    { title: "한 여름의 크리스마스 (With You)", duration: "3:28", file: "audio/singles-eps/Summer Magic/한 여름의 크리스마스 (With You).mp3"},
                    { title: "Mr. E", duration: "3:39", file: "audio/singles-eps/Summer Magic/Mr. E.mp3"},
                    { title: "Mosquito", duration: "3:12", file: "audio/singles-eps/Summer Magic/Mosquito.mp3"},
                    { title: "Hit That Drum", duration: "3:13", file: "audio/singles-eps/Summer Magic/Hit That Drum.mp3"},
                    { title: "Blue Lemonade", duration: "3:17", file: "audio/singles-eps/Summer Magic/Blue Lemonade.mp3"},
                    { title: "Bad Boy ((English Version) [Bonus Track])", duration: "3:29", file: "audio/singles-eps/Summer Magic/Bad Boy ((English Version) [Bonus Track]).mp3"}
                ]
            },
            "The Red Summer": {
                cover: "img/singles-eps/The Red Summer.jpg",
                year: "2017",
                tracks: [
                    { title: "빨간 맛 Red Flavor", duration: "3:12", file: "audio/singles-eps/The Red Summer/빨간 맛 Red Flavor.mp3"},
                    { title: "You Better Know", duration: "4:11", file: "audio/singles-eps/The Red Summer/You Better Know.mp3"},
                    { title: "Zoo", duration: "3:25", file: "audio/singles-eps/The Red Summer/Zoo.mp3"},
                    { title: "여름빛 Mojito", duration: "3:05", file: "audio/singles-eps/The Red Summer/여름빛 Mojito.mp3"},
                    { title: "바다가 들려 Hear The Sea", duration: "3:23", file: "audio/singles-eps/The Red Summer/바다가 들려 Hear The Sea.mp3"}
                ]
            },
            "Rookie": {
                cover: "img/singles-eps/Rookie.jpg",
                year: "2017",
                tracks: [
                    { title: "Rookie", duration: "3:18", file: "audio/singles-eps/Rookie/Rookie.mp3"},
                    { title: "Little Little", duration: "4:00", file: "audio/singles-eps/Rookie/Little Little.mp3"},
                    { title: "Happily Ever After", duration: "3:22", file: "audio/singles-eps/Rookie/Happily Ever After.mp3"},
                    { title: "Talk to Me", duration: "3:33", file: "audio/singles-eps/Rookie/Talk To Me.mp3"},
                    { title: "Body Talk", duration: "3:40", file: "audio/singles-eps/Rookie/Body Talk.mp3"},
                    { title: "마지막 사랑 Last Love", duration: "4:55", file: "audio/singles-eps/Rookie/마지막 사랑 Last Love.mp3"}
                ]
            }, 
            "Russian Roulette": {
                cover: "img/singles-eps/Russian Roulette.jpg",
                year: "2016", 
                tracks: [
                    { title: "러시안 룰렛 Russian Roulette", duration: "3:32", file: "audio/singles-eps/Russian Roulette/러시안 룰렛 Russian Roulette.mp3"},
                    { title: "Lucky Girl", duration: "3:24", file: "audio/singles-eps/Russian Roulette/Lucky Girl.mp3"},
                    { title: "Bad Dracula", duration: "3:09", file: "audio/singles-eps/Russian Roulette/Bad Dracula.mp3"},
                    { title: "Sunny Afternoon", duration: "4:01", file: "audio/singles-eps/Russian Roulette/Sunny Afternoon.mp3"},
                    { title: "Fool", duration: "3:54", file: "audio/singles-eps/Russian Roulette/Fool.mp3"},
                    { title: "Some Love", duration: "3:17", file: "audio/singles-eps/Russian Roulette/Some Love.mp3"},
                    { title: "My Dear", duration: "3:35", file: "audio/singles-eps/Russian Roulette/My Dear.mp3"}
                ]
            },
            "The Velvet": {
                cover: "img/singles-eps/The Velvet.jpg",
                year: "2016",
                tracks: [
                    { title: "7월 7일 One Of These Nights", duration: "4:22", file: "audio/singles-eps/The Velvet/[AUDIO] Red Velvet (레드벨벳)  The Velvet  01.7월 7일 One Of These Nights.mp3"},
                    { title: "Cool Hot Sweet Love", duration: "3:54", file: "audio/singles-eps/The Velvet/Cool Hot Sweet Love.mp3"},
                    { title: "Light Me Up", duration: "3:33", file: "audio/singles-eps/The Velvet/Light Me Up.mp3"},
                    { title: "처음인가요 First Time", duration: "4:03", file: "audio/singles-eps/The Velvet/처음인가요 First Time.mp3"}, 
                    { title: "장미꽃 향기는 바람에 날리고 Rose Scent Breeze", duration: "4:53", file: "audio/singles-eps/The Velvet/장미꽃 향기는 바람에 날리고 Rose Scent Breeze.mp3"},
                    { title: "7월 7일 One Of These Nights (De-Capo Version)", duration: "4:12", file: "audio/singles-eps/The Velvet/7월 7일 One Of These Nights (De-Capo Version).mp3"},
                    { title: "7월 7일 One Of These Nights (Joe Millionaire Version)", duration: "4:08", file: "audio/singles-eps/The Velvet/7월 7일 One Of These Nights (Joe Millionaire Version).mp3"},
                    { title: "7월 7일 One Of These Nights (Piano Version)", duration: "4:06", file: "audio/singles-eps/The Velvet/7월 7일 One Of These Nights (Piano Version).mp3"}
                ]
            },
            "Ice Cream Cake": {
                cover: "img/singles-eps/Ice Cream Cake.jpg",
                year: "2015",
                tracks: [
                    { title: "Ice Cream Cake", duration: "3:12", file: "audio/singles-eps/Ice Cream Cake/Ice Cream Cake.mp3"},
                    { title: "Automatic", duration: "3:31", file: "audio/singles-eps/Ice Cream Cake/RedVelvet - Automatic.mp3"},
                    { title: "Somethin Kinda Crazy", duration: "3:20", file: "audio/singles-eps/Ice Cream Cake/Somethin Kinda Crazy.mp3"},
                    { title: "Stupid Cupid", duration: "3:30", file: "audio/singles-eps/Ice Cream Cake/Stupid Cupid.mp3"},
                    { title: "Take It Sow", duration: "3:32", file: "audio/singles-eps/Ice Cream Cake/Take It Slow.mp3"},
                    { title: "사탕 Candy", duration: "4:23", file: "audio/singles-eps/Ice Cream Cake/사탕 Candy.mp3"}
                ]
            },
            "Be Natural": {
                cover: "img/singles-eps/Be Natural.jpg",
                year: "2014",
                tracks: [
                    { title: "Be Natural", duration: "4:41", file: "audio/singles-eps/Be Natural/[MP3] Red Velvet - Be Natural (Feat. SR14B Taeyong).mp3"}
                ]
            }, 
            "Happiness": {
                cover: "img/singles-eps/Happiness.jpg",
                year: "2014",
                tracks: [
                    { title: "행복 Happiness", duration: "3:41", file: "audio/singles-eps/Happiness/Happiness-Red Velvet Official Audio.mp3"}
                ]
            },

            //solos
            "Monster": {
                cover: "img/solos/Monster.jpg",
                year: "2020",
                tracks: [
                    { title: "Monster", duration: "2:59", file: "audio/solos-units/Monster/Monster.mp3"},
                    { title: "Diamond", duration: "3:17", file: "audio/solos-units/Monster/Diamond.mp3"},
                    { title: "Feel Good", duration: "3:14", file: "audio/solos-units/Monster/Feel Good.mp3"},
                    { title: "Jelly", duration: "3:13", file: "audio/solos-units/Monster/Jelly.mp3"},
                    { title: "Uncover (Sung by SEULGI)", duration: "3:42", file: "audio/solos-units/Monster/Uncover (Sung by SEULGI).mp3"}
                ]
            },
            "Naughty": {
                cover: "img/solos/Naughty.jpg",
                year: "2020",
                tracks: [
                    { title: "놀이 Naughty", duration: "3:19", file: "audio/solos-units/Naughty/IRENE & SEULGI - 놀이 (Naughty) (Audio).mp3"}
                ]
            },
            "Like Water": {
                cover: "img/solos/Like Water.jpg",
                year: "2021",
                tracks: [
                    { title: "When This Rain Stops", duration: "4:05", file: "audio/solos-units/Like Water/When This Rain Stops.mp3"},
                    { title: "Like Water", duration: "4:22", file: "audio/solos-units/Like Water/WENDY (웬디) - Like Water (Audio).mp3"},
                    { title: "Why Can't You Love Me?", duration: "2:49", file: "audio/solos-units/Like Water/Why Can't You Love Me_.mp3"},
                    { title: "초행길 The Road", duration: "4:16", file: "audio/solos-units/Like Water/초행길 The Road.mp3"},
                    { title: "Best Friend (With Seulgi)", duration: "3:31", file: "audio/solos-units/Like Water/Best Friend (with SEULGI).mp3"}
                ]
            },
            "Hello": {
                cover: "img/solos/Hello.jpg",
                year: "2021",
                tracks: [
                    { title: "Hello", duration: "3:39", file: "audio/solos-units/Hello/안녕 Hello.mp3"},
                    { title: "Je T'aime", duration: "4:22", file: "audio/solos-units/Hello/Je T'aime.mp3"},
                    { title: "Day By Day", duration: "4:11", file: "audio/solos-units/Hello/Day By Day.mp3"},
                    { title: "좋을텐데 If Only", duration: "3:49", file: "audio/solos-units/Hello/좋을텐데 If Only.mp3"},
                    { title: "Happy Birthday To You", duration: "2:55", file: "audio/solos-units/Hello/Happy Birthday To You.mp3"},
                    { title: "Be There For You", duration: "3:57", file: "audio/solos-units/Hello/그럴때마다 Be There For You.mp3"}
                ]
            },
            "28 Reasons": {
                cover: "img/solos/28 Reasons.jpg",
                year: "2022",
                tracks: [
                    { title: "28 Reasons", duration: "3:10", file: "audio/solos-units/28 Reasons/28 Reasons.mp3"},
                    { title: "Dead Man Runnin'", duration: "3:20", file: "audio/solos-units/28 Reasons/Dead Man Runnin.mp3"},
                    { title: "Bad Boy, Sad Girl (feat. BE'O)", duration: "2:58", file: "audio/solos-units/28 Reasons/Bad Boy, Sad Girl.mp3"},
                    { title: "Anywhere But Home", duration: "3:22", file: "audio/solos-units/28 Reasons/Anywhere But Home.mp3"},
                    { title: "Los Angeles", duration: "3:43", file: "audio/solos-units/28 Reasons/Los Angeles.mp3"},
                    { title: "Crown", duration: "3:16", file: "audio/solos-units/28 Reasons/Crown.mp3"}
                ]
            },
            "Wish You Hell": {
                cover: "img/solos/Wish You Hell.jpg",
                year: "2024",
                tracks: [
                    { title: "Wish You Hell", duration: "2:51", file: "audio/solos-units/Wish You Hell/WENDY (웬디) 'Wish You Hell' Official Audio.mp3"},
                    { title: "His Car Isn't Yours", duration: "3:05", file: "audio/solos-units/Wish You Hell/WENDY 'His Car Isnt Yours' (Official Audio).mp3"},
                    { title: "Best Ever", duration: "3:09", file: "audio/solos-units/Wish You Hell/WENDY 'Best Ever' (Official Audio).mp3"},
                    { title: "Better Judgement", duration: "2:50", file: "audio/solos-units/Wish You Hell/WENDY 'Better Judgement' (Official Audio).mp3"},
                    { title: "Queen Of The Party", duration: "3:07", file: "audio/solos-units/Wish You Hell/WENDY 'Queen Of The Party' (Official Audio).mp3"},
                    { title: "Vermillion", duration: "3:12", file: "audio/solos-units/Wish You Hell/WENDY 'Vermilion' (Official Audio).mp3"}
                ]
            },
            "Like A Flower": {
                cover: "img/solos/Like A Flower.jpg",
                year: "2024",
                tracks: [
                    { title: "Like A Flower", duration: "3:13", file: "audio/solos-units/Like A Flower/Like A Flower.mp3"},
                    { title: "Summer Rain", duration: "3:32", file: "audio/solos-units/Like A Flower/Summer Rain.mp3"},
                    { title: "Calling Me Back", duration: "3:00", file: "audio/solos-units/Like A Flower/Calling Me Back.mp3"},
                    { title: "Strawberry Silhoutte", duration: "2:57", file: "audio/solos-units/Like A Flower/Strawberry Silhoutte.mp3"},
                    { title: "Start Line", duration: "2:59", file: "audio/solos-units/Like A Flower/Start Line.mp3"},
                    { title: "Winter Wish", duration: "2:56", file: "audio/solos-units/Like A Flower/Winter Wish.mp3"},
                    { title: "Ka-Ching (Special Track)", duration: "2:54", file: "audio/solos-units/Like A Flower/Ka-Ching (Special Track).mp3"},
                    { title: "I Feel Pretty (Special Track)", duration: "2:44", file: "audio/solos-units/Like A Flower/I Feel Pretty (Special Track).mp3"},
                ]
            },
            "Accidentally On Purpose": {
                cover: "img/solos/Accidentally On Purpose.jpg",
                year: "2025",
                tracks: [
                    { title: "Baby, Not Baby", duration: "3:14", file: "audio/solos-units/Accidentally On Purpose/Baby, Not Baby.mp3"},
                    { title: "Better Dayz", duration: "3:02", file: "audio/solos-units/Accidentally On Purpose/Better Dayz.mp3"},
                    { title: "Rollin' (With My Homies)", duration: "3:12", file: "audio/solos-units/Accidentally On Purpose/Rollin (With My Homies).mp3"},
                    { title: "Whatever", duration: "3:06", file: "audio/solos-units/Accidentally On Purpose/Whatever.mp3"},
                    { title: "Praying", duration: "3:06", file: "audio/solos-units/Accidentally On Purpose/Praying.mp3"},
                    { title: "Weakness", duration: "2:48", file: "audio/solos-units/Accidentally On Purpose/Weakness.mp3"}
                ]
            },
            "Tilt": {
                cover: "img/solos/tilt.jpg",
                year: "2025",
                tracks: [
                    { title: "TILT", duration: "3:05", file: "audio/solos-units/Tilt/TILT.mp3"},
                    { title: "What's Your Problem? (Feat. JULIE)", duration: "2:56", file: "audio/solos-units/Tilt/What's Your Problem_.mp3"},
                    { title: "Irresistible", duration: "2:57", file: "audio/solos-units/Tilt/Irresistible.mp3"},
                    { title: "Girl Next Door", duration: "2:54", file: "audio/solos-units/Tilt/Girl Next Door.mp3"},
                    { title: "Trampoline", duration: "2:37", file: "audio/solos-units/Tilt/Trampoline.mp3"},
                    { title: "Heaven", duration: "3:01", file: "audio/solos-units/Tilt/Heaven.mp3"}
                ]
            },
            "From JOY, with Love": {
                cover: "img/solos/From JOY, with Love.jpg",
                year: "2025",
                tracks: [
                    { title: "Love Splash!", duration: "3:09", file: "audio/solos-units/From Joy with Love/JOY Love Splash! Lyrics (Color Coded Lyrics).mp3"},
                    { title: "Get Up and Dance", duration: "3:09", file: "audio/solos-units/From Joy with Love/Get Up And Dance.mp3" },
                    { title: "La Vie En Bleu", duration: "3:16", file: "audio/solos-units/From Joy with Love/La Vie En Bleu.mp3"},
                    { title: "Unwritten Page", duration: "3:03", file: "audio/solos-units/From Joy with Love/Unwritten Page.mp3"},
                    { title: "여름 편지 Scent Of Green", duration: "3:13", file: "audio/solos-units/From Joy with Love/여름 편지 Scent Of Green.mp3"},
                    { title: "품 Cuddle", duration: "3:50", file: "audio/solos-units/From Joy with Love/JOY Cuddle Lyrics (Color Coded Lyrics).mp3"}
                ]
            }
        };

        function createMusicPlayer() {
        const playerContainer = document.createElement('div');
        playerContainer.className = 'music-player-container';
        playerContainer.id = 'music-player';
        playerContainer.style.display = 'none';
        
        playerContainer.innerHTML = `
            <div class="music-player">
                <div class="player-left">
                    <div class="album-artwork">
                        <img src="" alt="Album Cover" id="player-album-cover">
                    </div>
                    <div class="player-controls">
                        <button id="shuffle-btn" title="Shuffle"><i class="fa-solid fa-shuffle"></i></button>
                        <button id="prev-track-btn" title="Previous"><i class="fa-solid fa-backward-step"></i></button>
                        <button id="play-pause-btn" title="Play/Pause"><i class="fa-solid fa-play"></i></button>
                        <button id="next-track-btn" title="Next"><i class="fa-solid fa-forward-step"></i></button>
                        <button id="repeat-btn" title="Repeat"><i class="fa-solid fa-repeat"></i></button>
                    </div>
                </div>
                <div class="player-center">
                    <div class="now-playing-info">
                        <h3 id="track-title">Select a song</h3>
                        <p id="album-info">From: <span id="album-name"></span> (<span id="album-year"></span>)</p>
                    </div>
                    <div class="progress-container">
                        <span id="current-time">0:00</span>
                        <div class="progress-bar">
                            <div class="progress" id="song-progress"></div>
                        </div>
                        <span id="total-time">0:00</span>
                    </div>
                </div>
                <div class="player-right">
                    <div class="volume-control">
                        <i class="fa-solid fa-volume-high" id="volume-icon"></i>
                        <div class="volume-slider-container">
                            <input type="range" min="0" max="100" value="100" class="volume-slider" id="volume-slider">
                        </div>
                    </div>
                    <button id="close-player-btn" title="Close Player"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
            <div class="playlist">
                <h3 id="playlist-title">Tracklist</h3>
                <ul id="track-list"></ul>
            </div>
        `;
        
        const discographySection = document.querySelector('#discography .content-wrapper');
        if (discographySection) {
            discographySection.appendChild(playerContainer);
            setupPlayerEvents();
        }
    }

    function setupPlayerEvents() {
        document.getElementById('play-pause-btn').addEventListener('click', togglePlayPause);
        document.getElementById('next-track-btn').addEventListener('click', playNextTrack);
        document.getElementById('prev-track-btn').addEventListener('click', playPreviousTrack);
        document.getElementById('close-player-btn').addEventListener('click', hidePlayer);
        
        document.querySelector('.progress-bar').addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const clickPosition = e.clientX - rect.left;
            const progressBarWidth = rect.width;
            const percentageClicked = clickPosition / progressBarWidth;
            
            if (audioElement.src && audioElement.duration) {
                audioElement.currentTime = percentageClicked * audioElement.duration;
                updateProgressBar();
            }
        });
        
        document.getElementById('volume-slider').addEventListener('input', function() {
            const volumeValue = this.value / 100;
            audioElement.volume = volumeValue;
            updateVolumeIcon(volumeValue);
        });
        
        document.getElementById('shuffle-btn').addEventListener('click', function() {
            this.classList.toggle('active');
        });
        
        document.getElementById('repeat-btn').addEventListener('click', function() {
            this.classList.toggle('active');
            audioElement.loop = this.classList.contains('active');
        });
        
        audioElement.addEventListener('ended', function() {
            const repeatBtn = document.getElementById('repeat-btn');
            if (!repeatBtn.classList.contains('active')) {
                playNextTrack();
            }
        });
        
        audioElement.addEventListener('timeupdate', updateProgressBar);
        audioElement.addEventListener('loadedmetadata', function() {
            document.getElementById('total-time').textContent = formatTime(audioElement.duration);
        });
        
        audioElement.addEventListener('error', function(e) {
            console.error('Audio error:', e);
            showNotification('Error playing audio file', 'error');
        });
    }

    function updateVolumeIcon(volumeValue) {
        const volumeIcon = document.getElementById('volume-icon');
        if (volumeValue === 0) {
            volumeIcon.className = 'fa-solid fa-volume-xmark';
        } else if (volumeValue < 0.5) {
            volumeIcon.className = 'fa-solid fa-volume-low';
        } else {
            volumeIcon.className = 'fa-solid fa-volume-high';
        }
    }

    function focusOnDiscographySection() {
        const discographySection = document.querySelector('#discography');
        if (discographySection) {
            discographySection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    function loadAlbum(albumTitle) {
        if (!albumDatabase[albumTitle]) {
            console.error('Album not found:', albumTitle);
            showNotification(`Album "${albumTitle}" not found`, 'error');
            return;
        }
        
        pauseTrack();
        
        const isDifferentAlbum = currentAlbum !== albumTitle;
        if (isDifferentAlbum) {
           
        }
        
        currentAlbum = albumTitle;
        const albumData = albumDatabase[albumTitle];
        
        document.getElementById('player-album-cover').src = albumData.cover;
        document.getElementById('album-name').textContent = albumTitle;
        document.getElementById('album-year').textContent = albumData.year;
        document.getElementById('playlist-title').textContent = `${albumTitle} - Tracklist`;
        
        const trackList = document.getElementById('track-list');
        trackList.innerHTML = '';
        
        albumData.tracks.forEach((track, index) => {
            const trackItem = document.createElement('li');
            trackItem.innerHTML = `
                <div class="track-number">${index + 1}</div>
                <div class="track-info">
                    <div class="track-name">${track.title}</div>
                    <div class="track-duration">${track.duration}</div>
                </div>
            `;
            trackItem.addEventListener('click', function() {
                loadTrack(index);
                playTrack();
            });
            trackList.appendChild(trackItem);
        });
        
        loadTrack(0, false);
        showPlayer();
        showNotification(`Loaded album: ${albumTitle}`, 'success');
    }

    function loadTrack(index, autoplay = true) {
        if (!currentAlbum) return;
        
        const albumData = albumDatabase[currentAlbum];
        if (index < 0 || index >= albumData.tracks.length) return;
        
        currentTrackIndex = index;
        const track = albumData.tracks[index];
        
        document.getElementById('track-title').textContent = track.title;
        
        const trackItems = document.querySelectorAll('#track-list li');
        trackItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        
        audioElement.src = track.file;
        audioElement.load();
        
        document.getElementById('song-progress').style.width = '0%';
        document.getElementById('current-time').textContent = '0:00';
        document.getElementById('total-time').textContent = track.duration;
        
        if (autoplay) {
            playTrack();
        }
    }

    function playTrack() {
        if (!audioElement.src) {
            showNotification('No track loaded', 'error');
            return;
        }
        
        const playBtn = document.getElementById('play-pause-btn');
        
        audioElement.play()
            .then(() => {
                isPlaying = true;
                playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                startProgressInterval();
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                showNotification('Error playing audio. Please check the file path.', 'error');
            });
    }

    function pauseTrack() {
        audioElement.pause();
        isPlaying = false;
        document.getElementById('play-pause-btn').innerHTML = '<i class="fa-solid fa-play"></i>';
        clearInterval(progressInterval);
    }

    function togglePlayPause() {
        if (isPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    }

    function playNextTrack() {
        if (!currentAlbum) return;
        
        const albumData = albumDatabase[currentAlbum];
        const shuffleBtn = document.getElementById('shuffle-btn');
        let nextIndex;
        
        if (shuffleBtn && shuffleBtn.classList.contains('active')) {
            do {
                nextIndex = Math.floor(Math.random() * albumData.tracks.length);
            } while (nextIndex === currentTrackIndex && albumData.tracks.length > 1);
        } else {
            nextIndex = currentTrackIndex + 1;
            if (nextIndex >= albumData.tracks.length) {
                nextIndex = 0;
            }
        }
        
        loadTrack(nextIndex);
    }

    function playPreviousTrack() {
        if (!currentAlbum) return;
        
        const albumData = albumDatabase[currentAlbum];
        let prevIndex = currentTrackIndex - 1;
        
        if (prevIndex < 0) {
            prevIndex = albumData.tracks.length - 1;
        }
        
        loadTrack(prevIndex);
    }

    function updateProgressBar() {
        if (!audioElement.duration) return;
        
        const progress = (audioElement.currentTime / audioElement.duration) * 100;
        document.getElementById('song-progress').style.width = `${progress}%`;
        document.getElementById('current-time').textContent = formatTime(audioElement.currentTime);
    }

    function formatTime(timeInSeconds) {
        if (isNaN(timeInSeconds)) return '0:00';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function startProgressInterval() {
        clearInterval(progressInterval);
        progressInterval = setInterval(updateProgressBar, 1000);
    }

    function showPlayer() {
        const player = document.getElementById('music-player');
        player.style.display = 'block';
        
        setTimeout(() => {
            player.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }

    function hidePlayer() {
        pauseTrack();
        document.getElementById('music-player').style.display = 'none';
        currentAlbum = null;
        
        setTimeout(() => {
            focusOnDiscographySection();
        }, 100);
    }

    function setupAlbumClickListeners() {
        const albumSlides = document.querySelectorAll('.album-slide');
        
        albumSlides.forEach(slide => {
            slide.addEventListener('click', function() {
                const albumTitle = this.querySelector('.album-info h3').textContent;
                if (albumDatabase[albumTitle]) {
                    loadAlbum(albumTitle);
                } else {
                    console.log(`Album "${albumTitle}" not found in database`);
                    showNotification(`Album "${albumTitle}" not available`, 'warning');
                }
            });
        });
    }

    function setupCategoryButtons() {
        const categoryButtons = document.querySelectorAll('.category-btn');
        const carousels = {
            'albums': document.getElementById('albums-carousel'),
            'singles': document.getElementById('singles-carousel'),
            'solos': document.getElementById('solos-carousel')
        };

        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.dataset.category;
                
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                Object.keys(carousels).forEach(key => {
                    if (carousels[key]) {
                        carousels[key].style.display = key === category ? 'block' : 'none';
                    }
                });
            });
        });
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    function addInfoTip() {
        const discographySection = document.querySelector('#discography .content-wrapper');
        const existingTip = document.querySelector('.info-tip');
        
        if (discographySection && !existingTip) {
            const infoTip = document.createElement('div');
            infoTip.className = 'info-tip';
            infoTip.innerHTML = '<i class="fa-solid fa-circle-info"></i> Click on an album you wish to play';
            
            const categoriesDiv = discographySection.querySelector('.discography-categories');
            if (categoriesDiv) {
                discographySection.insertBefore(infoTip, categoriesDiv.nextSibling);
            }
        }
    }

    function initializeMusicPlayer() {
        createMusicPlayer();
        setupAlbumClickListeners();
        setupCategoryButtons();
        addInfoTip();
        
        audioElement.volume = 0.8;
        
        console.log('Music Player initialized successfully');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMusicPlayer);
    } else {
        initializeMusicPlayer();
    }

    //Video
    const categoryBtns1 = document.querySelectorAll('.video-category-btn');
    const videoCards = document.querySelectorAll('.video-card');

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    categoryBtns1.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns1.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.category;
            filterVideos(category);
        });
    });

    function filterVideos(category) {
        requestAnimationFrame(() => {
            videoCards.forEach((card, index) => {
                if (category === 'all' || card.dataset.category === category) {
                    if (card.classList.contains('featured-video')) {
                        card.style.display = 'grid'; 
                    } else {
                        card.style.display = 'block'; 
                    }
                    
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 20);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 250); 
                }
            });
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    const observerOptions = {
        threshold: [0.1, 0.5], 
        rootMargin: '50px 0px -100px 0px' 
    };

    const observerCallback = debounce((entries) => {
        requestAnimationFrame(() => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    
                    observer.unobserve(card);
                }
            });
        });
    }, 16); 

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    videoCards.forEach((card, index) => {
        card.style.cssText = `
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            transition-delay: ${Math.min(index * 0.05, 0.5)}s;
            will-change: opacity, transform;
        `;
        
        observer.observe(card);
    });

    document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent = `
            .video-card {
                contain: layout style paint;
                transform: translateZ(0); /* Force hardware acceleration */
            }
        `;
        document.head.appendChild(style);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            videoCards.forEach(card => {
                card.style.transitionDuration = '0.1s';
            });
        } else {
            videoCards.forEach(card => {
                card.style.transitionDuration = '0.4s';
            });
        }
    });
}); 
