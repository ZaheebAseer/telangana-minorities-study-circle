document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const navToggleMobile = document.getElementById('navToggleMobile');
  const navLinks = document.getElementById('navLinks');
  if (navToggleMobile && navLinks) {
    navToggleMobile.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
    }));
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !navToggleMobile.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  // 2. Login Dropdown Toggle
  const loginTrigger = document.getElementById('loginTrigger');
  const loginMenu = document.getElementById('loginMenu');
  if (loginTrigger && loginMenu) {
    loginTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      loginMenu.classList.toggle('open');
      loginTrigger.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!loginMenu.contains(e.target) && !loginTrigger.contains(e.target)) {
        loginMenu.classList.remove('open');
        loginTrigger.classList.remove('open');
      }
    });
  }

  // 3. Live Clock (Indian Standard Time formatting)
  function updateClock() {
    const el = document.getElementById('liveClock');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' | ' + now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  updateClock();
  setInterval(updateClock, 30000);

  // 4. Highlight Active Navigation Item
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navAnchors = document.querySelectorAll('.navlinks a, .dropdown-menu a');
  navAnchors.forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const targetPath = href.split('/').pop();
    if ((currentPath === '' || currentPath === 'index.html') && (targetPath === 'index.html' || href === '#home' || href === './')) {
      a.classList.add('active');
    } else if (currentPath && currentPath === targetPath) {
      a.classList.add('active');
    }
  });

  // 5. Generic Form Validation and Simulated Feedback Handlers
  function setupForm(formId, successMsgId, customHandler) {
    const form = document.getElementById(formId);
    const successMsg = document.getElementById(successMsgId);
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (customHandler) {
        customHandler(form, successMsg);
      } else if (successMsg) {
        successMsg.classList.add('visible');
        form.reset();
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // Serializes a form and saves it to Firestore's "submissions" collection,
  // so it shows up centrally on admin.html for every visitor - not just this browser.
  function saveSubmission(form, formLabel) {
    if (!window.tmsccFirebaseReady || !window.tmsccDb) return;
    const data = {};
    new FormData(form).forEach((value, key) => { data[key] = value; });
    data.formSource = formLabel;
    data.type = form.querySelector('[name="usertype"]')?.value || formLabel;
    data.timestamp = firebase.firestore.FieldValue.serverTimestamp();
    data.page = window.location.pathname;
    window.tmsccDb.collection('submissions').add(data).catch((err) => {
      console.warn('Could not save submission:', err.message);
    });
  }

  setupForm('jobseekerForm', 'jobseekerSuccess', (form, msg) => {
    const name = form.querySelector('[name="fullname"]')?.value || 'Candidate';
    saveSubmission(form, 'Jobseeker Form');
    if (msg) {
      msg.innerHTML = '<strong>Registration Submitted!</strong><br>Thank you, ' + name + '. Your details have been registered with the Telangana Minorities Study Circle. Our academic counsellor will review your preferences and contact you with batch details.';
      msg.classList.add('visible');
      form.reset();
      msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  setupForm('employerForm', 'employerSuccess', (form, msg) => {
    const org = form.querySelector('[name="orgname"]')?.value || 'Partner';
    saveSubmission(form, 'Employer Form');
    if (msg) {
      msg.innerHTML = '<strong>Partnership Request Received!</strong><br>Thank you, ' + org + '. Your recruitment / partnership request has been recorded. Our Industry Placement Cell will get in touch with you shortly.';
      msg.classList.add('visible');
      form.reset();
      msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  setupForm('contactForm', 'contactSuccess', (form, msg) => {
    const name = form.querySelector('[name="fullname"]')?.value || 'Visitor';
    saveSubmission(form, 'Contact Form');
    if (msg) {
      msg.innerHTML = '<strong>Enquiry Submitted Successfully!</strong><br>Thank you, ' + name + '. Your message has been sent to our Head Office at Masab Tank, Hyderabad. Our team will contact you within 1-2 business days.';
      msg.classList.add('visible');
      form.reset();
      msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // 5b. Keep the administration entry available from every standard page header.
  // (admin.html itself now requires a real Firebase Auth login - see js/admin.js.)
  document.querySelectorAll('.login-menu').forEach(menu => {
    if (!menu.querySelector('a[href="admin.html"]')) {
      const adminLink = document.createElement('a');
      adminLink.href = 'admin.html';
      adminLink.textContent = 'Admin Dashboard';
      menu.appendChild(adminLink);
    }
  });

  // 5c. Gently cycle the home-page upcoming events; pause whenever a visitor reads or hovers it.
  const updatesScroll = document.getElementById('updatesScroll');
  if (updatesScroll) {
    let updatesPaused = false;
    let direction = 1;
    const pauseUpdates = () => { updatesPaused = true; };
    const resumeUpdates = () => { updatesPaused = false; };
    updatesScroll.addEventListener('mouseenter', pauseUpdates);
    updatesScroll.addEventListener('mouseleave', resumeUpdates);
    updatesScroll.addEventListener('focusin', pauseUpdates);
    updatesScroll.addEventListener('focusout', resumeUpdates);
    setInterval(() => {
      if (updatesPaused || updatesScroll.scrollHeight <= updatesScroll.clientHeight) return;
      const maxScroll = updatesScroll.scrollHeight - updatesScroll.clientHeight;
      if (updatesScroll.scrollTop >= maxScroll - 1) direction = -1;
      if (updatesScroll.scrollTop <= 0) direction = 1;
      updatesScroll.scrollTop += direction;
    }, 45);
  }

  // 6. Events Category Filter
  const eventTabs = document.querySelectorAll('.filter-tabs .tab-btn');
  const eventCards = document.querySelectorAll('.event-card');
  if (eventTabs.length && eventCards.length) {
    eventTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        eventTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter || 'all';
        eventCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'grid';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 7. District Directory Filter (Contact Page)
  const districtSearch = document.getElementById('districtSearch');
  const districtCards = document.querySelectorAll('.district-card');
  if (districtSearch && districtCards.length) {
    districtSearch.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      districtCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(term)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // 8. Infrastructure Gallery Filter
  const galleryTabs = document.querySelectorAll('.gallery-filter-tabs .tab-btn');
  const galleryItems = document.querySelectorAll('.gallery-card');
  if (galleryTabs.length && galleryItems.length) {
    galleryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        galleryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter || 'all';
        galleryItems.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // 9. Upcoming Event Popup (Home Page)
  const eventPopupOverlay = document.getElementById('eventPopupOverlay');
  if (eventPopupOverlay) {
    const eventPopupClose = document.getElementById('eventPopupClose');
    const eventPopupDismiss = document.getElementById('eventPopupDismiss');
    const POPUP_KEY = 'tmscc_event_popup_seen';
    const closeEventPopup = () => {
      eventPopupOverlay.classList.remove('open');
      document.body.style.overflow = '';
    };
    const openEventPopup = () => {
      eventPopupOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      sessionStorage.setItem(POPUP_KEY, '1');
    };
    if (!sessionStorage.getItem(POPUP_KEY)) {
      setTimeout(openEventPopup, 700);
    }
    eventPopupClose?.addEventListener('click', closeEventPopup);
    eventPopupDismiss?.addEventListener('click', closeEventPopup);
    eventPopupOverlay.addEventListener('click', (e) => {
      if (e.target === eventPopupOverlay) closeEventPopup();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeEventPopup();
    });
  }

  // Team page slider: advances through the supplied staff profiles in the requested order.
  document.querySelectorAll('[data-staff-slider]').forEach(slider => {
    const track = slider.querySelector('.staff-slider-track');
    const slides = Array.from(slider.querySelectorAll('.staff-slide'));
    const previous = slider.querySelector('.staff-slider-btn.prev');
    const next = slider.querySelector('.staff-slider-btn.next');
    if (!track || !slides.length) return;
    let current = 0;
    let paused = false;
    const show = index => {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
    };
    previous?.addEventListener('click', () => show(current - 1));
    next?.addEventListener('click', () => show(current + 1));
    slider.addEventListener('mouseenter', () => { paused = true; });
    slider.addEventListener('mouseleave', () => { paused = false; });
    slider.addEventListener('focusin', () => { paused = true; });
    slider.addEventListener('focusout', () => { paused = false; });
    setInterval(() => { if (!paused) show(current + 1); }, 5500);
  });

  // Homepage campus photo carousel: autoplay with dot navigation and manual controls.
  document.querySelectorAll('[data-photo-slider]').forEach(slider => {
    const track = slider.querySelector('.photo-slider-track');
    const slides = Array.from(slider.querySelectorAll('.photo-slide'));
    const previous = slider.querySelector('.photo-slider-btn.prev');
    const next = slider.querySelector('.photo-slider-btn.next');
    const dotsWrap = slider.querySelector('.photo-slider-dots');
    if (!track || !slides.length) return;
    let current = 0;
    let paused = false;
    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'photo-slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => show(i));
      dotsWrap?.appendChild(dot);
      return dot;
    });
    const show = index => {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    };
    previous?.addEventListener('click', () => show(current - 1));
    next?.addEventListener('click', () => show(current + 1));
    slider.addEventListener('mouseenter', () => { paused = true; });
    slider.addEventListener('mouseleave', () => { paused = false; });
    slider.addEventListener('focusin', () => { paused = true; });
    slider.addEventListener('focusout', () => { paused = false; });
    setInterval(() => { if (!paused) show(current + 1); }, 4200);
  });

  // Hero banner slideshow: auto-cycles the campus photos with a crossfade, one at a time.
  document.querySelectorAll('[data-hero-slideshow]').forEach(slideshow => {
    const slides = Array.from(slideshow.querySelectorAll('img'));
    if (slides.length < 2) return;
    let current = slides.findIndex(img => img.classList.contains('active'));
    if (current < 0) current = 0;
    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 3200);
  });

  // Slim scroll-progress bar across the very top of the page
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    progressBar.style.width = height > 0 ? (scrolled / height * 100) + '%' : '0%';
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  // Floating hero badge: auto-rotates through all our services, one at a time.
  document.querySelectorAll('[data-badge-rotator]').forEach(badge => {
    const items = [
      { icon: '🎓', title: 'Admissions Open', text: 'TSPSC Group I & II Foundation Batch' },
      { icon: '💼', title: 'Jobseeker Portal', text: 'Register free & meet hiring employers' },
      { icon: '🧭', title: 'Career Counselling', text: 'Book a free one-on-one session' },
      { icon: '📚', title: 'Digital Library', text: '10,000+ titles, open to every student' },
      { icon: '🏛️', title: '33 Districts', text: 'Coaching centres across Telangana' },
      { icon: '▶️', title: 'Watch Our Reel', text: 'Campus life, live on Instagram' },
    ];
    const iconEl = badge.querySelector('.fb-icon');
    const titleEl = badge.querySelector('.fb-text b');
    const textEl = badge.querySelector('.fb-text span');
    let i = 0;
    setInterval(() => {
      badge.classList.add('fb-fade');
      setTimeout(() => {
        i = (i + 1) % items.length;
        iconEl.textContent = items[i].icon;
        titleEl.textContent = items[i].title;
        textEl.textContent = items[i].text;
        badge.classList.remove('fb-fade');
      }, 300);
    }, 3200);
  });

  // Scroll reveal: fades key content blocks up into view as the page is scrolled.
  // Cards with their own hover-lift (dash-card, service-card) only fade in, so the
  // reveal transform never fights with the hover transform later. Anything already
  // visible in the viewport at load is left untouched, avoiding any flash on page-in.
  const revealUpSelectors = [
    '.section-head', '.gallery-card', '.test-card', '.program-card',
    '.district-card', '.callout-box', '.photo-slider',
    '.staff-slider', '.opportunities-panel', '.updates-rail', '.doc-card'
  ];
  const revealFadeSelectors = ['.dash-card', '.service-card'];

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    const register = (selectors, className) => {
      document.querySelectorAll(selectors.join(',')).forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (alreadyVisible) return;
        el.classList.add(className);
        el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
        io.observe(el);
      });
    };
    register(revealUpSelectors, 'reveal-up');
    register(revealFadeSelectors, 'reveal-fade');
  }

  // Animated count-up for hero stats
  const countEls = document.querySelectorAll('.hero-stats b[data-count]');
  if (countEls.length && 'IntersectionObserver' in window) {
    const animateCount = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = value.toLocaleString('en-IN') + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    countEls.forEach(el => countIO.observe(el));
  }

  // Sticky header shadow once the page scrolls
  const siteHeader = document.querySelector('header.site');
  if (siteHeader) {
    const toggleHeaderShadow = () => {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    toggleHeaderShadow();
    window.addEventListener('scroll', toggleHeaderShadow, { passive: true });
  }
});
