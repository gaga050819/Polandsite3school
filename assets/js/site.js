(function () {
  var body = document.body;
  var header = document.getElementById('header');
  var toggle = document.getElementById('toggle');
  var overlay = document.getElementById('overlay');
  var progress = document.getElementById('progress');

  function applySavedPageContent() {
    var path = window.location.pathname;
    var filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    if (filename.indexOf('.html') === -1) {
      filename = filename ? (filename + '.html') : 'index.html';
    }
    var savedHtml = null;
    var savedFooter = null;
    try {
      savedHtml = localStorage.getItem('school_page_main_' + filename);
      savedFooter = localStorage.getItem('school_page_footer');
      if (!savedHtml || !savedFooter) {
        var rawContent = localStorage.getItem('school_site_content');
        if (rawContent) {
          var parsed = JSON.parse(rawContent);
          if (parsed) {
            if (!savedHtml && parsed.page_html && parsed.page_html[filename]) {
              savedHtml = parsed.page_html[filename];
            }
            if (!savedFooter && parsed.page_footer) {
              savedFooter = parsed.page_footer;
            }
          }
        }
      }
    } catch(e) {}

    if (savedHtml) {
      if (filename === 'index.html' && (savedHtml.indexOf('id="reviews"') === -1 || savedHtml.indexOf('id="news"') === -1)) {
        try {
          localStorage.removeItem('school_page_main_index.html');
        } catch(e) {}
        savedHtml = null;
      }
    }

    if (savedHtml) {
      var mainEl = document.querySelector('main');
      if (mainEl) {
        var reviewsEl = mainEl.querySelector('#reviews');
        mainEl.innerHTML = savedHtml;
        if (reviewsEl && !mainEl.querySelector('#reviews')) {
          var targetEl = mainEl.querySelector('#faq') || mainEl.querySelector('.strip');
          if (targetEl) {
            mainEl.insertBefore(reviewsEl, targetEl);
          } else {
            mainEl.appendChild(reviewsEl);
          }
        }
      }
    }
    if (savedFooter) {
      var footerEl = document.querySelector('footer');
      if (footerEl) {
        footerEl.innerHTML = savedFooter;
      }
    }
  }
  applySavedPageContent();

  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    }
    if (overlay) {
      overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(!body.classList.contains('menu-open'));
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        setMenu(false);
      }
    });
  }

  var lastY = 0;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) {
      progress.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    }
    if (header && !header.classList.contains('static-page')) {
      header.classList.toggle('solid', y > 50);
      header.classList.toggle('hide', y > lastY && y > 380 && !body.classList.contains('menu-open'));
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  var slides = [].slice.call(document.querySelectorAll('.slide'));
  var dotsBox = document.getElementById('dots');
  if (slides.length > 0 && dotsBox) {
    var current = 0;
    var timer = null;
    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Слайд ' + (i + 1));
      b.addEventListener('click', function () {
        goToSlide(i);
        restartSlideTimer();
      });
      dotsBox.appendChild(b);
      return b;
    });

    function goToSlide(i) {
      slides[current].classList.remove('on');
      dots[current].classList.remove('on');
      current = (i + slides.length) % slides.length;
      var img = slides[current].querySelector('img');
      if (img) {
        img.style.animation = 'none';
        void img.offsetWidth;
        img.style.animation = '';
      }
      slides[current].classList.add('on');
      dots[current].classList.add('on');
    }

    function restartSlideTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        goToSlide(current + 1);
      }, 6500);
    }

    dots[0].classList.add('on');
    restartSlideTimer();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        clearInterval(timer);
      } else {
        restartSlideTimer();
      }
    });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    [].forEach.call(document.querySelectorAll('.reveal, .frame'), function (el) {
      io.observe(el);
    });
  } else {
    [].forEach.call(document.querySelectorAll('.reveal, .frame'), function (el) {
      el.classList.add('in');
    });
  }

  var lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.id = 'lightbox';
    lightbox.innerHTML = '<button class="lightbox-close" id="lightboxClose" aria-label="Закрити">&times;</button><button class="lightbox-btn lightbox-prev" id="lightboxPrev" aria-label="Попереднє фото">&#10094;</button><button class="lightbox-btn lightbox-next" id="lightboxNext" aria-label="Наступне фото">&#10095;</button><div class="lightbox-counter" id="lightboxCounter"></div><div class="lightbox-content"><img id="lightboxImg" src="" alt="Повноекранне фото"></div>';
    document.body.appendChild(lightbox);
  } else {
    if (!document.getElementById('lightboxPrev')) {
      var prevBtn = document.createElement('button');
      prevBtn.className = 'lightbox-btn lightbox-prev';
      prevBtn.id = 'lightboxPrev';
      prevBtn.setAttribute('aria-label', 'Попереднє фото');
      prevBtn.innerHTML = '&#10094;';
      lightbox.appendChild(prevBtn);
    }
    if (!document.getElementById('lightboxNext')) {
      var nextBtn = document.createElement('button');
      nextBtn.className = 'lightbox-btn lightbox-next';
      nextBtn.id = 'lightboxNext';
      nextBtn.setAttribute('aria-label', 'Наступне фото');
      nextBtn.innerHTML = '&#10095;';
      lightbox.appendChild(nextBtn);
    }
    if (!document.getElementById('lightboxCounter')) {
      var counterDiv = document.createElement('div');
      counterDiv.className = 'lightbox-counter';
      counterDiv.id = 'lightboxCounter';
      lightbox.appendChild(counterDiv);
    }
  }

  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var lightboxCounter = document.getElementById('lightboxCounter');

  var galleryImages = [];
  var activeIndex = 0;

  function collectImages() {
    var raw = [].slice.call(document.querySelectorAll('main img, .gallery-card img, .frame img, .slide img'));
    var seen = {};
    galleryImages = [];
    raw.forEach(function (img) {
      if (!img.closest('.brand') && img.src && !seen[img.src]) {
        seen[img.src] = true;
        galleryImages.push(img);
        img.addEventListener('click', function (e) {
          e.stopPropagation();
          openAt(galleryImages.indexOf(img));
        });
      }
    });

    [].forEach.call(document.querySelectorAll('[data-lightbox]'), function (card) {
      card.addEventListener('click', function (e) {
        var img = card.querySelector('img');
        if (img) {
          var idx = galleryImages.indexOf(img);
          if (idx !== -1) {
            openAt(idx);
          } else {
            openCustom(img.getAttribute('src'));
          }
        }
      });
    });
  }

  function updateLightboxView() {
    if (!lightboxImg || galleryImages.length === 0) return;
    var targetImg = galleryImages[activeIndex];
    lightboxImg.src = targetImg.src;
    lightboxImg.alt = targetImg.alt || 'Повноекранне фото';
    if (lightboxCounter) {
      lightboxCounter.textContent = (activeIndex + 1) + ' / ' + galleryImages.length;
    }
  }

  function openAt(index) {
    if (galleryImages.length === 0) return;
    activeIndex = (index + galleryImages.length) % galleryImages.length;
    updateLightboxView();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  window.openLightboxWithSrc = openCustom;

  function openCustom(src) {
    if (!lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCounter) {
      lightboxCounter.textContent = '';
    }
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  window.openLightboxWithSrc = openCustom;

  function nextImage() {
    if (galleryImages.length > 1) {
      activeIndex = (activeIndex + 1) % galleryImages.length;
      updateLightboxView();
    }
  }

  function prevImage() {
    if (galleryImages.length > 1) {
      activeIndex = (activeIndex - 1 + galleryImages.length) % galleryImages.length;
      updateLightboxView();
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('open');
      if (!body.classList.contains('menu-open')) {
        document.body.style.overflow = '';
      }
    }
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', function (e) {
      e.stopPropagation();
      prevImage();
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener('click', function (e) {
      e.stopPropagation();
      nextImage();
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });
  }

  var touchStartX = 0;
  var touchEndX = 0;
  if (lightbox) {
    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchEndX - touchStartX;
      if (diff > 45) {
        prevImage();
      } else if (diff < -45) {
        nextImage();
      }
    }, { passive: true });
  }

  document.addEventListener('keydown', function (e) {
    if (lightbox && lightbox.classList.contains('open')) {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    } else if (e.key === 'Escape') {
      setMenu(false);
    }
  });

  collectImages();

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzj_tN-NKOqg_MaFOQvPOKmjKtR1GMg1EDvjwXiu_YCtn8m3BTFABIOuHGK2ip-a_eJlw/exec';
    var emailInput = document.getElementById('email');
    var emailError = document.getElementById('emailError');
    var formStatus = document.getElementById('formStatus');
    var submitBtn = document.getElementById('submitBtn');

    function checkFormat(val) {
      var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      return re.test(val);
    }

    function checkEmailExistence(email, cb) {
      if (!checkFormat(email)) {
        cb(false, 'Введіть коректну адресу пошти (наприклад, user@gmail.com)');
        return;
      }
      var controller = window.AbortController ? new AbortController() : null;
      var timeoutId = setTimeout(function () {
        if (controller) controller.abort();
      }, 4000);
      var opts = { method: 'GET' };
      if (controller) opts.signal = controller.signal;

      fetch('https://disify.com/api/email/' + encodeURIComponent(email), opts)
        .then(function (res) {
          clearTimeout(timeoutId);
          return res.json();
        })
        .then(function (data) {
          if (data) {
            if (data.format === false) {
              cb(false, 'Невірний формат електронної пошти');
              return;
            }
            if (data.dns === false) {
              cb(false, 'Цей поштовий домен не існує або не приймає пошту');
              return;
            }
            if (data.disposable === true) {
              cb(false, 'Тимчасові одноразові адреси не приймаються');
              return;
            }
          }
          cb(true, '');
        })
        .catch(function () {
          clearTimeout(timeoutId);
          cb(true, '');
        });
    }

    if (emailInput && emailError) {
      emailInput.addEventListener('blur', function () {
        var val = emailInput.value.trim();
        if (val) {
          checkEmailExistence(val, function (valid, msg) {
            if (!valid) {
              emailError.textContent = msg;
              emailError.style.display = 'block';
              emailInput.style.borderColor = 'var(--red)';
            } else {
              emailError.style.display = 'none';
              emailInput.style.borderColor = '';
            }
          });
        } else {
          emailError.style.display = 'none';
          emailInput.style.borderColor = '';
        }
      });
      emailInput.addEventListener('input', function () {
        if (emailError.style.display === 'block') {
          emailError.style.display = 'none';
          emailInput.style.borderColor = '';
        }
      });
    }

    var phoneInput = document.getElementById('phone');
    if (phoneInput) {
      function formatPhone(val) {
        var raw = val.replace(/\D/g, '');
        if (raw.startsWith('38')) {
          raw = raw.substring(2);
        } else if (raw.startsWith('80') && raw.length > 9) {
          raw = raw.substring(1);
        }
        if (raw.length > 10) {
          raw = raw.substring(0, 10);
        }
        if (raw.length === 0) {
          return '';
        }
        var res = '+38 (';
        if (raw.length <= 3) {
          res += raw;
        } else if (raw.length <= 6) {
          res += raw.substring(0, 3) + ') ' + raw.substring(3);
        } else if (raw.length <= 8) {
          res += raw.substring(0, 3) + ') ' + raw.substring(3, 6) + '-' + raw.substring(6);
        } else {
          res += raw.substring(0, 3) + ') ' + raw.substring(3, 6) + '-' + raw.substring(6, 8) + '-' + raw.substring(8, 10);
        }
        return res;
      }

      var prevDigitsCount = 0;

      phoneInput.addEventListener('input', function (e) {
        var curVal = phoneInput.value;
        var rawDigits = curVal.replace(/\D/g, '');
        var effective = rawDigits;
        if (effective.startsWith('38')) {
          effective = effective.substring(2);
        } else if (effective.startsWith('80') && effective.length > 9) {
          effective = effective.substring(1);
        }

        var isDelete = (e.inputType && e.inputType.startsWith('delete'));
        if (isDelete && effective.length === prevDigitsCount && effective.length > 0) {
          effective = effective.substring(0, effective.length - 1);
        }

        if (effective.length === 0) {
          phoneInput.value = '';
          prevDigitsCount = 0;
          return;
        }

        var nextVal = formatPhone(effective);
        phoneInput.value = nextVal;
        prevDigitsCount = effective.length;
      });

      phoneInput.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && phoneInput.selectionStart === phoneInput.selectionEnd) {
          var pos = phoneInput.selectionStart;
          if (pos > 0) {
            var ch = phoneInput.value.charAt(pos - 1);
            if (/\D/.test(ch)) {
              e.preventDefault();
              var curRaw = phoneInput.value.replace(/\D/g, '');
              if (curRaw.startsWith('38')) curRaw = curRaw.substring(2);
              if (curRaw.length > 0) {
                curRaw = curRaw.substring(0, curRaw.length - 1);
              }
              phoneInput.value = formatPhone(curRaw);
              prevDigitsCount = curRaw.length;
            }
          }
        }
      });

      phoneInput.addEventListener('blur', function () {
        var raw = phoneInput.value.replace(/\D/g, '');
        if (raw.length <= 2) {
          phoneInput.value = '';
          prevDigitsCount = 0;
        }
      });
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var honeypot = document.getElementById('contactHoneypot');
      if (honeypot && honeypot.value.trim() !== '') {
        return;
      }
      var captchaCheck = document.getElementById('contactCaptchaCheck');
      if (captchaCheck && !captchaCheck.checked) {
        if (formStatus) {
          formStatus.style.display = 'block';
          formStatus.style.background = '#fef2f2';
          formStatus.style.color = 'var(--red)';
          formStatus.textContent = 'Будь ласка, підтвердіть перевірку "Я не робот".';
        }
        return;
      }

      var nameVal = (document.getElementById('name') ? document.getElementById('name').value.trim() : '');
      var phoneVal = (document.getElementById('phone') ? document.getElementById('phone').value.trim() : '');
      var emailVal = (emailInput ? emailInput.value.trim() : '');
      var messageVal = (document.getElementById('message') ? document.getElementById('message').value.trim() : '');

      if (formStatus) {
        formStatus.style.display = 'none';
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Перевірка пошти...';
      }

      checkEmailExistence(emailVal, function (valid, errorMsg) {
        if (!valid) {
          if (emailError) {
            emailError.textContent = errorMsg;
            emailError.style.display = 'block';
          }
          if (emailInput) {
            emailInput.style.borderColor = 'var(--red)';
            emailInput.focus();
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Надіслати повідомлення';
          }
          return;
        }

        if (emailError) {
          emailError.style.display = 'none';
        }
        if (emailInput) {
          emailInput.style.borderColor = '';
        }

        if (submitBtn) {
          submitBtn.textContent = 'Надсилання...';
        }

        var safePhone = phoneVal;

        var payload = {
          name: nameVal,
          phone: safePhone,
          email: emailVal,
          message: messageVal,
          date: new Date().toLocaleString('uk-UA')
        };

        function onDone(success) {
          if (submitBtn) {
            submitBtn.disabled = false;
            if (success) {
              submitBtn.textContent = 'Успішно надіслано';
              setTimeout(function () {
                submitBtn.textContent = 'Надіслати повідомлення';
              }, 4000);
            } else {
              submitBtn.textContent = 'Надіслати повідомлення';
            }
          }
          if (formStatus) {
            formStatus.style.display = 'block';
            if (success) {
              formStatus.style.background = '#e8f5e9';
              formStatus.style.color = '#1b5e20';
              formStatus.style.border = '1px solid #a5d6a7';
              formStatus.textContent = 'Успішно надіслано';
              contactForm.reset();
              setTimeout(function () {
                formStatus.style.display = 'none';
              }, 6000);
            } else {
              formStatus.style.background = '#ffebee';
              formStatus.style.color = '#b71c1c';
              formStatus.style.border = '1px solid #ef9a9a';
              formStatus.textContent = 'Помилка при надсиланні. Спробуйте пізніше або зателефонуйте нам.';
            }
          }
        }

        if (GOOGLE_SHEET_URL && !GOOGLE_SHEET_URL.includes('REPLACE_WITH')) {
          fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
          })
            .then(function () {
              onDone(true);
            })
            .catch(function () {
              onDone(false);
            });
        } else {
          setTimeout(function () {
            onDone(true);
          }, 800);
        }
      });
    });
  }

  var TRANSLATIONS = {"Польська Суботня Школа": "Polska Szkoła Sobotnia", "ім. Св. Королеви Ядвіги": "im. św. Królowej Jadwigi", "Польська суботня школа імені святої королеви Ядвіги, м. Дрогобич": "Polska Szkoła Sobotnia im. św. Królowej Jadwigi w Drohobyczu", "Польська суботня школа імені святої королеви Ядвіги": "Polska Szkoła Sobotnia im. św. Królowej Jadwigi", "вул. Завалля 12 та вул. Трускавецька 9": "ul. Zawalna 12 oraz ul. Truskawiecka 9", "м. Дрогобич, вул. Завалля 12 та вул. Трускавецька 9": "m. Drohobycz, ul. Zawalna 12 oraz ul. Truskawiecka 9", "Адреса:": "Adres:", "Телефон:": "Telefon:", "Email:": "E-mail:", "Головна": "Główna", "Про нас": "O nas", "Розклад занять": "Plan zajęć", "Розклад дзвінків": "Rozkład dzwonków", "Фотогалерея": "Galeria zdjęć", "Курси": "Kursy", "Екскурсії": "Wycieczki", "Свята": "Uroczystości", "Контакти": "Kontakt", "Головна / Główna": "Główna", "Про нас / O nas": "O nas", "Фотогалерея / Galeria zdjęć": "Galeria zdjęć", "Курси / Kursy": "Kursy", "Екскурсії / Wycieczki": "Wycieczki", "Uroczystości": "Uroczystości", "Uroczystości / Шкільні свята": "Uroczystości szkolne", "Контакти / Kontakt": "Kontakt", "Почніть шлях": "Rozpocznij drogę", "до вивчення": "do nauki", "польської мови": "języka polskiego", "Цікаве та якісне вивчення польської мови, культури та традицій для дітей та дорослих у Дрогобичі.": "Ciekawa i skuteczna nauka języka polskiego, kultury i tradycji dla dzieci i dorosłych w Drohobyczu.", "Зв'яжіться з нами": "Skontaktuj się z nami", "Зв'язатися з нами": "Skontaktuj się z nami", "Дізнатись більше": "Dowiedz się więcej", "Про нашу школу": "O naszej szkole", "Польська суботня школа — це цікаве та якісне вивчення польської мови для дітей та дорослих": "Polska Szkoła Sobotnia to ciekawa i skuteczna nauka języka polskiego dla dzieci i dorosłych", "Досвідчені викладачі, індивідуальний підхід до кожного, позитивний настрій на заняттях. Наша школа діє з 20 березня 1998 року та об'єднує понад 550 учнів.": "Doświadczeni nauczyciele, indywidualne podejście do każdego, pozytywna atmosfera na zajęciach. Nasza szkoła działa od 20 marca 1998 roku i zrzesza ponad 550 uczniów.", "Ми не лише навчаємо мови, а й відкриваємо двері до європейської освіти, організовуємо пізнавальні екскурсії до Польщі та підтримуємо польські традиції.": "Nie tylko uczymy języka, ale także otwieramy drzwi do europejskiej edukacji, organizujemy wycieczki edukacyjne do Polski i pielęgnujemy polskie tradycje.", "Більше про нас": "Więcej o nas", "Учнів школи": "Uczniów szkoły", "Діти та дорослі, які успішно опановують мову": "Dzieci i dorośli, którzy z sukcesem uczą się języka", "Рік заснування": "Rok założenia", "Понад 25 років бездоганного досвіду викладання": "Ponad 25 lat rzetelnego doświadчення w nauczaniu", "Інтенсивний курс": "Kurs intensywny", "Швидкий старт для вільного спілкування": "Szybki start do swobodnej komunikacji", "Вчитель-методист з Польщі, підтримка шкіл": "Nauczyciel-metodyk z Polski, wsparcie szkół", "Навчальні напрямки": "Kierunki kształcenia", "Програми для будь-якого віку та рівня": "Programy dla każdego wieku i poziomu", "Індивідуальні та групові заняття, розроблені за сучасними європейськими стандартами.": "Zajęcia indywidualne i grupowe, opracowane według nowoczesnych standardів europejskich.", "Суботня школа": "Szkoła sobotnia", "Заняття щосуботи для школярів: мова, література, географія, історія та пісні. Підготовка до вступу у польські ліцеї та виші.": "Zajęcia w każdą sobotę dla uczniów: język, literatura, geografia, historia i pieśni. Przygotowanie do nauki w polskich liceach i na uczelniach.", "Розклад занять →": "Plan zajęć →", "Для дорослих": "Dla dorosłych", "Інтенсивні курси": "Kursy intensywne", "Курс триває 3 місяці у групах. Використовуємо аудіо, відеоматеріали та сучасні підручники для швидкого подолання мовного бар'єру.": "Kurs trwa 3 miesiące w grupach. Korzystamy z materiałów audio, wideo i nowoczesnych podręczników w celu szybkiego przełamania bariery językowej.", "Детальніше про курси →": "Więcej o kursach →", "Спецкурс": "Kurs specjalny", "Карта Поляка та сертифікат": "Karta Polaka i certyfikat", "Поглиблена підготовка з історії, культури та традицій Польщі для співбесіди на Карту Поляка. Сертифікат після завершення.": "Pogłębione przygotowanie z historii, kultury i tradycji Polski do rozmowy o Kartę Polaka. Certyfikat po ukończeniu.", "Дізнатись умови →": "Sprawdź warunki →", "Шкільне життя": "Życie szkoły", "Яскраві миті наших учнів": "Niezapomniane chwile naszych uczniów", "Свята, шкільні вистави, екскурсії рідним містом та подорожі до Польщі.": "Święta, przedstawienia szkolne, wycieczki po rodzinnym mieście i wyjazdy do Polski.", "Урочистості": "Uroczystości", "Виступи учнів": "Występy uczniów", "Концерт": "Koncert", "Шкільна родина": "Społeczność szkolna", "Переглянути всю фотогалерею": "Zobacz całą galerię zdjęć", "Готові почати навчання?": "Gotowy do rozpoczęcia nauki?", "Напишіть нам або зателефонуйте — розкажемо про курси, вартість та розклад занять у Дрогобичі.": "Napisz do nas lub zadzwoń — opowiemy o kursach, kosztach i planie zajęć w Drohobyczu.", "Дякуємо! Ваше повідомлення успішно надіслано та збережено в Google Таблицю.": "Dziękujemy! Twoja wiadomość została pomyślnie wysłana.", "Успішно надіслано": "Wysłano pomyślnie", "Помилка при надсиланні. Спробуйте пізніше або зателефонуйте нам.": "Błąd podczas wysyłania. Spróbuj ponownie później lub zadzwoń do nas.", "Введіть коректну адресу пошти (наприклад, user@gmail.com)": "Wpisz poprawny adres e-mail (np. user@gmail.com)", "Невірний формат електронної пошти": "Niepoprawny format adresu e-mail", "Цей поштовий домен не існує або не приймає пошту": "Ta domena pocztowa nie istnieje lub nie przyjmuje poczty", "Тимчасові одноразові адреси не приймаються": "Tymczasowe jednorazowe adresy nie są akceptowane", "Перевірка пошти...": "Sprawdzanie poczty...", "Надсилання...": "Wysyłanie...", "Надіслати повідомлення": "Wyślij wiadomość", "Повноекранне фото": "Zdjęcie pełnoekranowe", "Збільшене фото": "Powiększone zdjęcie", "Закрити": "Zamknij", "Назад": "Wstecz", "Вперед": "Dalej", "Відкрити меню": "Otwórz menu", "Закрити меню": "Zamknij menu", "Головне меню": "Menu główne", "Логотип школи": "Logo szkoły", "Шкільний святковий концерт": "Szkolny koncert świąteczny", "Учасники свята": "Uczestnicy uroczystości", "Виконання пісень": "Wykonanie pieśni", "Хор учнів": "Chór uczniów", "Учні на уроці польської мови": "Uczniowie na lekcji języka polskiego", "Робота в класі": "Praca w klasie", "Урочиста академія": "Uroczysta akademia", "Виступ учнів школи": "Występ uczniów szkoły", "Учасники концерту на сцені": "Uczestnicy koncertu na scenie", "Хор учнів суботньої школи": "Chór uczniów szkoły sobotniej", "Учні на святі": "Uczniowie na uroczystości", "Педагогічний колектив та учні": "Grono pedagogiczne i uczniowie", "Свято у школі": "Święto w szkole", "Урочисті миті": "Uroczyste chwile", "Виступи школярів": "Występy młodzieży", "Шкільні заходи": "Wydarzenia szkolne", "Екскурсія та подорож": "Wycieczka i podróż", "Подорож учнів до Польщі": "Wyjazd uczniów do Polski", "Пізнавальна поїздка": "Wyjazd edukacyjny", "Культурні заходи": "Wydarzenia kulturalne", "Історичне фото школи": "Historyczne zdjęcie szkoły", "Навчальний процес": "Proces nauczania", "Урок польської": "Lekcja polskiego", "Свято школи": "Święto szkoły", "Виступ": "Występ", "Святковий концерт": "Koncert świąteczny", "Творчість": "Twórczość", "Пісенний виступ": "Występ wokalny", "Концерт для вчителів": "Koncert dla nauczycieli", "Традиції": "Tradycje", "Шкільне свято": "Święto szkolne", "Події школи": "Wydarzenia szkolne", "Подорожі": "Podróże", "Культура": "Kultura", "Історія школи": "Historia szkoły", "Шкільний фотолітопис": "Kronika fotograficzna szkoły", "Життя Польської суботньої школи": "Życie Polskiej Szkoły Sobotniej", "Натисніть на будь-яку фотографію, щоб переглянути її у повному розмірі.": "Kliknij dowolne zdjęcie, aby zobaczyć je w pełnym rozmiрі.", "Приєднуйтесь до нашої великої шкільної родини!": "Dołącz do naszej wielkiej rodziny szkolnej!", "Запишіться на курси польської мови або приведіть дитину на навчання.": "Zapisz się na kursy języka polskiego lub przyprowadź dziecko na naukę.", "Адреси в місті Дрогобичі:": "Adresy w Drohobyczu:", "Львівська область, м. Дрогобич": "Obwód lwowski, m. Drohobycz", "Контактні телефони:": "Numery kontaktowe:", "Viber / Telegram доступні": "Viber / Telegram dostępne", "Електронна пошта:": "Poczta elektroniczna:", "Керівництво школи:": "Dyrekcja szkoły:", "Керівництво школи": "Dyrekcja szkoły", "Директор:": "Dyrektor:", "Віце-директор:": "Wicedyrektor:", "Хлопек Адам Броніславович (Adam Chłopek)": "Adam Chłopek", "Хлопек Адам Броніславович": "Adam Chłopek", "Качмар Ірина Іванівна (Irena Kaczmar)": "Irena Kaczmar", "Качмар Ірина Іванівна": "Irena Kaczmar", "Графік занять:": "Harmonogram zajęć:", "Субота: 09:00 – 16:30 (навчальний день школи)": "Sobota: 09:00 – 16:30 (dzień nauki szkolnej)", "Будні дні: вечірні курси для дорослих та консультації": "Dni powszednie: wieczorne kursy dla dorosłych i konsultacje", "Напишіть нам": "Napisz do nas", "Заповніть форму, і адміністрація школи зв'яжеться з вами найближчим часом.": "Wypełnij formularz, a dyrekcja szkoły skontaktuje się z Tobą w najbliższym czasie.", "Ваше ім'я *": "Twoje imię *", "Введіть ваше ім'я": "Wpisz swoje imię", "Номер телефону *": "Numer telefonu *", "Повідомлення *": "Wiadomość *", "Який курс вас цікавить? Скільки років учневі?": "Jaki kurs Cię interesuje? Ile lat ma uczeń?", "Натискаючи кнопку, ви погоджуєтесь на обробку персональних даних для зв'язку.": "Klikając przycisk, wyrażasz zgodę na przetwarzanie danych osobowych w celu kontaktu.", "Зв'яжіться з нами, щоб дізнатися подробиці щодо запису на курси, розкладу занять та навчання.": "Skontaktuj się z nami, aby dowiedzieć się więcej o zapisach na kursy, planie zajęć i nauce.", "Консультація та запис": "Konsultacje i zapisy", "Залишилися питання? Зателефонуйте нам або завітайте особисто у суботу під час занять.": "Masz pytania? Zadzwoń do nas lub odwiedź nas osobiście w sobotę podczas zajęć.", "Дізнатися більше про школу": "Dowiedz się więcej o szkole", "Сторінку не знайдено": "Nie znaleziono strony", "Помилка 404": "Błąd 404", "Можливо, адреса сторінки змінилася або її було видалено. Перейдіть на головну сторінку школи.": "Być może adres strony został zmieniony lub usunięty. Przejdź do strony głównej szkoły.", "Повернутися на головну": "Wróć do strony głównej", "Про школу": "O szkole", "Понад 25 років якісної освіти, польської культури та традицій у Дрогобичі.": "Ponad 25 lat rzetelnej edukacji, polskiej kultury i tradycji w Drohobyczu.", "Наша історія": "Nasza historia", "Освітній осередок польської культури у Дрогобичі з 1998 року": "Ośrodek edukacyjny kultury polskiej w Drohobyczu od 1998 roku", "у приміщенні ЗОШ № 3 розпочала свою роботу Польська суботня школа ім. Св. Королеви Ядвіги. За понад чверть століття школа виросла у потужний освітньо-культурний центр.": "w budynku Szkoły Średniej nr 3 rozpoczęła działalność Polska Szkoła Sobotnia im. św. Królowej Jadwigi. Przez ponad ćwierć wieku szkoła stała się prężnym centrum edukacyjno-kulturalnym.", "різного віку. Таке зростання чисельності не випадкове: наші випускники не лише здобувають глибокі знання з польської мови, літератури, географії, історії, народознавства й музичної культури, але й успішно вступають на навчання до провідних коледжів та університетів Республіки Польща.": "w różnym wieku. Taki wzrost nie jest przypadkowy: nasi absolwenci zdobywają rzetelną wiedzę z języka polskiego, literatury, geografii, historii i kultury, a także z powodzeniem podejmują studia w wiodących uczelniach Rzeczypospolitej Polskiej.", "Для багатьох наших випускників якісне навчання відкрило дорогу до європейської вищої освіти та успішної міжнародної кар'єри.": "Dla wielu naszych absolwentów wysoki poziom nauczння otworzył drogę do europejskiej edukacji wyższej i udanej kariery międzynarodowej.", "Активних учнів": "Aktywnych uczniów", "Років роботи": "Lat pracy", "Сертифіковані викладачі": "Certyfikowani nauczyciele", "Випускників у вишах Польщі": "Absolwentów na uczelniach w Polsce", "Педагогічний колектив": "Grono pedagogiczne", "Керівництво": "Dyrekcja", "Adam Chłopek — Dyrektor szkoły / Директор школи": "Adam Chłopek — Dyrektor szkoły", "Керівник навчального закладу, координатор освітніх та культурних програм, міжнародного партнерства з установами Польщі та організаціями полонійного руху.": "Dyrektor placówki edukacyjnej, koordynator programów edukacyjnych i kulturalnych, współpracy międzynarodowej z instytucjami w Polsce i organizacjami polonijnymi.", "Irena Kaczmar — Wicedyrektor / Віце-директор школи": "Irena Kaczmar — Wicedyrektor szkoły", "Заступник директора з навчально-виховної роботи, координатор розкладу занять, роботи вчителів та організації виховних і святкових заходів.": "Zastępca dyrektora ds. dydaktyczno-wychowawczych, koordynator planu zajęć, pracy nauczycieli oraz organizacji uroczystości i wydarzeń.", "Освітнє середовище": "Środowisko edukacyjne", "Що вивчають наші учні": "Czego uczą się nasi uczniowie", "Комплексна програма суботньої школи охоплює всі аспекти мовної та культурної освіти.": "Kompleksowy program szkoły sobotniej obejmuje wszelkie aspekty edukacji językowej i kulturowej.", "Польська мова та граматика": "Język polski i gramatyka", "Практичне володіння усним і писемним мовленням, збагачення словникового запасу, вивчення живої розмовної мови.": "Praktyczna znajomoсть języka w mowie i piśmie, wzbogacanie słownictwa, nauka żywego języka potocznego.", "Література та культура": "Literatura i kultura", "Шедеври польської класичної та сучасної літератури, поезія, знайомство з видатними митцями Польщі.": "Arcydzieła polskiej literatury klasycznej i współczesnej, poezja, poznawanie wybitnych twórców Polski.", "Історія та традиції": "Historia i tradycje", "Визначні сторінки історії Польщі, національні свята, традиції, звичаї та видатні історичні постаті.": "Ważne karty historii Polski, święta narodowe, tradycje, obyczaje i wybitne postacie historyczne.", "Географія Польщі": "Geografia Polski", "Регіони, міста, природні багатства, воєводства та сучасний адміністративний устрій Республіки Польща.": "Regiony, miasta, bogactwa naturalne, województwa oraz współczesny podział administracyjny Rzeczypospolitej Polskiej.", "Музика та народознавство": "Muzyka i folklor", "Польські народні та сучасні пісні, різдвяні колядки (kolędy), вистави на шкільній сцені та участь у фестивалях.": "Polskie pieśni ludowe i współczesne, kolędy bożonarodzeniowe, występy na scenie szkolnej i udział w festiwalach.", "Підтримка з Польщі": "Wsparcie z Polski", "Співпраця з провідними польськими інституціями, забезпечення сучасними підручниками та методичними посібниками.": "Współpraca z wiodącymi instytucjami polskimi, zaopatrzenie w nowoczesne podręczniki i pomoce dydaktyczne.", "Локації школи": "Lokalizacje szkoły", "Наші аудиторії у Дрогобичі": "Nasze sale w Drohobyczu", "Заняття суботньої школи проходять у світлих, просторих та обладнаних кабінетах.": "Zajęcia szkoły sobotniej odbywają się w jasnych, przestronnych i wyposażonych salach.", "Локація № 1: вул. Завалля 12": "Lokalizacja nr 1: ul. Zawalna 12", "Основна локація школи для учнів початкових та середніх класів. Зручне розташування в центрі міста.": "Główna lokalizacja szkoły dla uczniów klas początkowych i średnich. Wygodne położenie w centrum miasta.", "Локація № 2: вул. Трускавецька 9": "Lokalizacja nr 2: ul. Truskawiecka 9", "Аудиторії для старших класів, курсів підготовки до Карти Поляка та вечірніх курсів для дорослих.": "Sale dla klas starszych, kursów przygotowawczych do Karty Polaka oraz wieczorowych kursów dla dorosłych.", "Записатися на навчання": "Zapisz się na naukę", "Курси по вивченню польської мови": "Kursy języka polskiego", "Ефективні групові та індивідуальні програми для дітей і дорослих. Офіційний сертифікат після завершення навчання.": "Efektywne programy grupowe i indywidualne dla dzieci i dorosłych. Oficjalny certyfikat po ukończeniu nauki.", "Про наші курси": "O naszych kursach", "Сучасне навчання польської мови у Дрогобичі": "Nowoczesna nauka języka polskiego w Drohobyczu", "Курси польської мови для дітей та дорослих у групах — це не лише гарантований результат, але й цікаве дозвілля у приємній атмосфері.": "Kursy języka polskiego dla dzieci i dorosłych w grupach to nie tylko pewny rezultat, ale także miłe spędzanie czasu w przyjaznej atmosferze.", "Особливості нашої методики": "Cechy naszej metodyki", "Ми поєднуємо як класичні перевірені методики, так і сучасні інтерактивні підходи на кожному уроці. Наші навчальні матеріали — це сучасні автентичні підручники з Польщі, аудіо- та відеозаписи, електронні носії.": "Łączymy klasyczne, sprawdzone metody z nowoczesnym podejściem interaktywnym na każdej lekcji. Nasze materiały to autentyczne podręczniki z Polski, nagrania audio i wideo.", "Наші викладачі — майстри своєї справи, дипломовані педагоги, філологи та методисти. Навчання у динамічних групах дозволяє швидко подолати мовний бар'єр.": "Nasi nauczyciele to doświadczeni pedagodzy, filolodzy i metodycy. Nauka w dynamicznych grupach pozwala szybko pokonać barierę językową.", "Гарантія результату": "Gwarancja rezultatu", "Курс навчання триває три місяці.": "Kurs trwa trzy miesiące.", "За цей період ви починаєте вільно спілкуватися на побутові та ділові теми, впевнено подорожувати та розуміти польське мовлення.": "W tym czasie zaczynasz swobodnie rozmawiać na tematy codzienne i zawodowe, pewnie podróżować i rozumieć język polski.", "Тип документа, що видається:": "Rodzaj wydawanego dokumentu:", "офіційний Сертифікат про закінчення відповідного рівня знань.": "oficjalny Certyfikat ukończenia odpowiedniego poziomu wiedzy.", "Напрямки та рівні": "Kierunki i poziomy", "Оберіть програму під ваші цілі": "Wybierz program dopasowany do Twoich celów", "Базовий рівень": "Poziom podstawowy", "Польська мова A1 – A2": "Język polski A1 – A2", "Для початківців (діти та дорослі)": "Dla początkujących (dzieci i dorośli)", "Фундаментальний курс з нуля: фонетика, читання, письмова та розмовна мова, подолання мовного бар'єру.": "Kurs od podstaw: fonetyka, czytanie, język pisany i mówiony, przełamywanie bariery językowej.", "Тривалість: 3 місяці": "Czas trwania: 3 miesiące", "Сучасні підручники та аудіоматеріали": "Nowoczesne podręczniki i materiały audio", "Офіційний сертифікат після курсу": "Oficjalny certyfikat po ukończeniu kursu", "Запис відкрито": "Zapisy otwarte", "Записатися": "Zapisz się", "Середній рівень": "Poziom średniozaawansowany", "Польська мова B1 – B2": "Język polski B1 – B2", "Для вступу та роботи в Польщі": "Na studia i do pracy w Polsce", "Поглиблена граматика, розмовний інтенсив, професійна лексика, підготовка до сертифікаційних іспитів та вступу до ВНЗ.": "Pogłębiona gramatyka, intensywne konwersacje, słownictwo zawodowe, przygotowanie do egzaminów i na studia.", "Підготовка до державних іспитів": "Przygotowanie do egzaminів państwowych", "Офіційний сертифікат для вступу": "Oficjalny certyfikat na studia", "Підготовка на Карту Поляка": "Przygotowanie do Karty Polaka", "Спеціалізований курс співбесіди": "Specjalistyczny kurs do rozmowy", "Комплексна підготовка: польська мова, історія Польщі, географія, культура, традиції, свята та типові питання консула.": "Kompleksowe przygotowanie: język polski, historia Polski, geografia, kultura, tradycje, święta i typowe pytania konsula.", "Опрацювання питань консула": "Opracowanie pytań konsula", "Матеріали з історії та культури": "Materiały z historii i kultury", "Індивідуальні консультації": "Indywidualne konsultacje", "Суботня навчальна програма для дітей": "Sobotni program edukacyjny dla dzieci", "Комплексні заняття для школярів 1 – 11 класів": "Kompleksowe zajęcia dla uczniów klas 1 – 11", "Щосуботи учні вивчають польську мову, літературу, історію, географію та традиції у вікових групах з кваліфікованими вчителями.": "W każdą sobotę uczniowie uczą się języka polskiego, literatury, historii, geografii i tradycji w grupach wiekowych.", "Молодша школа": "Szkoła młodsza", "1 – 4 класи": "Klasy 1 – 4", "Ігровий формат вивчення мови, розвиток мовлення, читання казок, польські дитячі пісні, вивчення традицій та творчість.": "Format nauki poprzez zabawę, rozwój mowy, czytanie bajek, polskie piosenki dziecięce, tradycje i twórczość.", "Середня школа": "Szkoła średnia", "5 – 8 класи": "Klasy 5 – 8", "Граматика, читання художньої літератури, географія та історія Польщі, підготовка до олімпіад та конкурсів декламаторів.": "Gramatyka, czytanie literatury, geografia i historia Polski, przygotowanie do olimpiad i konkursów recytatorskich.", "Старша школа": "Szkoła starsza", "9 – 11 класи та випускники": "Klasy 9 – 11 i absolwenci", "Інтенсивна підготовка до вступу у вищі навчальні заклади Польщі, академічне письмо, розмовна практика та Карта Поляка.": "Intensywne przygotowanie na studia w Polsce, pisanie akademickie, praktyka konwersacyjna i Karta Polaka.", "Додаткові курси": "Kursy dodatkowe", "Гнучкий графік навчання": "Elastyczny grafik nauki", "Індивідуальні заняття": "Zajęcia indywidualne", "Програма, складена під ваші особисті цілі та темп засвоєння матеріалу.": "Program dopasowany do Twoich osobistych celów i tempa nauki.", "Гнучкий графік": "Elastyczny grafik", "Персональний план": "Plan indywidualny", "Вечірні групи для дорослих": "Wieczorne grupy dla dorosłych", "Зручні години занять у будні дні після роботи: жива розмовна мова, побутова та професійна лексика.": "Wygodne godziny zajęć w dni powszednie po pracy: żywy język mówiony, słownictwo codzienne i zawodowe.", "2 рази на тиждень": "2 razy w tygodniu", "Практика спілкування": "Praktyka komunikacji", "Інтенсив вихідного дня": "Intensywny kurs weekendowy", "Поглиблений мовний інтенсив для тих, хто має обмежений час у будні дні.": "Pogłębiony kurs intensywny dla osób mających ograniczony czas w dni powszednie.", "Субота / Неділя": "Sobota / Niedziela", "Максимум практики": "Maksimum praktyki", "Залишилися питання щодо вибору курсу?": "Masz pytania dotyczące wyboru kursu?", "Зв'яжіться з нами — допоможемо визначити ваш поточний рівень та підібрати найефективнішу програму.": "Skontaktuj się z nami — pomożemy określić Twój poziom i dobrać najbardziej efektywny program.", "Графік уроків та перерв суботньої школи у Дрогобичі.": "Harmonogram lekcji i przerw szkoły sobotniej w Drohobyczu.", "Суботній графік": "Harmonogram sobotni", "Розклад дзвінків на суботу": "Rozkład dzwonków na sobotę", "Заняття проходять щосуботи. Тривалість одного уроку — 35 хвилин.": "Zajęcia odbywają się w każdą sobotę. Czas trwania jednej lekcji wynosi 35 minut.", "№ уроку": "Nr lekcji", "Час заняття": "Czas zajęć", "Тривалість": "Czas trwania", "Перерва": "Przerwa", "35 хв": "35 min", "5 хв": "5 min", "20 хв (Велика перерва)": "20 min (Duża przerwa)", "Особливості суботнього розкладу": "Cechy planu sobotniego", "Корисна інформація для учнів та батьків": "Przydatne informacje dla uczniów i rodziców", "Тривалість уроку": "Czas trвання lekcji", "Тривалість одного уроку становить 35 хвилин. Це забезпечує високу концентрацію уваги учнів та ефективне засвоєння матеріалу.": "Czas trwania jednej lekcji wynosi 35 minut. Zapewnia to wysoką koncentrację uczniów i efektywne przyswajanie materiału.", "Велика перерва": "Duża przerwa", "Між 4-м та 5-м уроками (з 11:35 до 11:55) передбачено 20 хвилин перерви для легкого ланчу, спілкування та відпочинку дітей.": "Pomiędzy 4. a 5. lekcją (od 11:35 do 11:55) przewidziano 20 minut przerwy na lekki posiłek, rozmowy i odpoczynek.", "Пунктуальність": "Punktualność", "Просимо учнів приходити за 10-15 хвилин до початку першого уроку (о 08:45-08:50), щоб спокійно підготуватися до заняття.": "Prosimy uczniów o przybycie na 10-15 minut przed rozpoczęciem pierwszej lekcji (o 08:45-08:50), aby spokojnie przygotować się do zajęć.", "Переглянути розклад занять за класами": "Zobacz plan zajęć według klas", "Дізнайтеся предмети та аудиторії для кожної вікової групи на поточний навчальний рік.": "Sprawdź przedmioty i sale dla każdej grupy wiekowej na bieżący rok szkolny.", "Розклад уроків суботніх та вечірніх занять польської мови.": "Plan lekcji zajęć sobotnich i wieczorowych języka polskiego.", "Навчальний план": "Plan nauczania", "Розклад уроків суботньої школи": "Plan lekcji szkoły sobotniej", "Заняття проводяться щосуботи у двох корпусах школи відповідно до вікових груп.": "Zajęcia odbywają się w każdą sobotę w dwóch budynkach szkoły odpowiednio do grup wiekowych.", "Клас / Група": "Klasa / Grupa", "Час занять:": "Czas zajęć:", "09:00 – 12:30 (4 уроки + велика перерва)": "09:00 – 12:30 (4 lekcje + duża przerwa)", "09:00 – 13:50 (6 уроків)": "09:00 – 13:50 (6 lekcji)", "09:40 – 14:30 (6 уроків)": "09:40 – 14:30 (6 lekcji)", "Предмети програми:": "Przedmioty w programie:", "Польська мова (читання, письмо, граматика), дитяча польська література, пісні та творчість.": "Język polski (czytanie, pisanie, gramatyka), polska literatura dziecięca, pieśni i twórczość.", "Польська мова та граматика, історія Польщі, географія, польська література, культура та традиції.": "Język polski i gramatyka, historia Polski, geografia, literatura polska, kultura i tradycje.", "Поглиблена польська мова, історія та суспільствознавство Польщі, підготовка до вступу та співбесіди.": "Pogłębiony język polski, historia i wiedza o społeczeństwie Polski, przygotowanie na studia i do rozmowy.", "Аудиторії:": "Sale lekcyjne:", "Корпус № 1 (вул. Завалля 12)": "Budynek nr 1 (ul. Zawalna 12)", "Корпус № 1 та Корпус № 2 (вул. Трускавецька 9)": "Budynek nr 1 oraz Budynek nr 2 (ul. Truskawiecka 9)", "Корпус № 2 (вул. Трускавецька 9)": "Budynek nr 2 (ul. Truskawiecka 9)", "Курси для дорослих (вечірні групи)": "Kursy dla dorosłych (grupy wieczorowe)", "Розклад занять вечірніх груп для дорослих формується за результатами набору та тестування рівня знань.": "Plan zajęć grup wieczorowych dla dorosłych jest ustalany na podstawie naboru i testu poziomu wiedzy.", "Група A1 (Початківці):": "Grupa A1 (Początkujący):", "Понеділок та Середа: 18:00 – 19:30 або 19:30 – 21:00": "Poniedziałek i Środa: 18:00 – 19:30 lub 19:30 – 21:00", "Група A2 – B1 (Середній):": "Grupa A2 – B1 (Średniozaawansowany):", "Вівторок та Четвер: 18:00 – 19:30 або 19:30 – 21:00": "Wtorek i Czwartek: 18:00 – 19:30 lub 19:30 – 21:00", "Карта Поляка (Інтенсив):": "Karta Polaka (Intensywny):", "П'ятниця: 18:00 – 20:30 (історія, традиції, питання консула)": "Piątek: 18:00 – 20:30 (historia, tradycje, pytania konsula)", "Суботня денна група:": "Sobotnia grupa dzienna:", "Субота: 14:00 – 16:30 (для дорослих після закінчення шкільних занять)": "Sobota: 14:00 – 16:30 (dla dorosłych po zajęciach szkolnych)", "Зверніться до нас для уточнення наявності вільних місць у групах та запису на пробне тестування.": "Skontaktuj się z nami, aby sprawdzić dostępność wolnych miejsc w grupach i zapisać się na test kwalifikacyjny.", "Важливі примітки": "Ważne uwagi", "Заняття проходять за адресами: м. Дрогобич, вул. Завалля 12 та вул. Трускавецька 9. Розподіл груп уточнюється у викладача.": "Zajęcia odbywają się pod adresami: m. Drohobycz, ul. Zawalna 12 oraz ul. Truskawiecka 9. Przydział grup ustala nauczyciel.", "Світлини з уроків, шкільних свят, концертів, подорожей та визначних подій нашої школи.": "Zdjęcia z lekcji, świąt szkolnych, koncertów, wycieczek i ważnych wydarzeń w życiu szkoły.", "Пізнавальні екскурсії польською мовою по Дрогобичу та подорожі до міст Польщі.": "Wycieczki edukacyjne w języku polskim po Drohobyczu oraz wyjazdy do miast Polski.", "Краєзнавство польською мовою": "Krajoznawstwo w języku polskim", "Drohobycz w języku polskim: пізнавальна мандрівка рідним містом": "Drohobycz w języku polskim: spacer edukacyjny po rodzinnym mieście", "Мандруємо разом": "Podróżujemy razem", "Nasze wycieczki do Polski": "Nasze wycieczki do Polski", "Щороку учні суботньої школи відвідують історичні та культурні центри Польщі, спілкуються з однолітками та закріплюють знання мови.": "Co roku uczniowie szkoły sobotniej odwiedzają historyczne i kulturalne ośrodki Polski, rozmawiają z rówieśnikami i utrwalają znajomość języka.", "Королівський Краків": "Królewski Kraków", "Краків та Вавель": "Kraków i Wawel", "Відвідини Вавельського королівського замку — усипальниці св. королеви Ядвіги, покровительки нашої школи, та Ягеллонського університету.": "Zwiedzanie Zamku Królewskiego na Wawelu — miejsca spoczynku św. Królowej Jadwigi, patronki naszej szkoły, oraz Uniwersytetu Jagiellońskiego.", "Столиця": "Stolica", "Варшава історична": "Warszawa historyczna", "Старе Місто (Stare Miasto), Королівський замок, Центр науки Коперника та інтерактивні музеї столиці.": "Stare Miasto, Zamek Królewski, Centrum Nauki Kopernik oraz interaktywne muzea stolicy.", "Прикордонні зустрічі": "Spotkania przygraniczne", "Перемишль, Ярослав, Ланьцут": "Przemyśl, Jarosław, Łańcut", "Замки Підкарпаття, палац графів Потоцьких у Ланьцуті та спільні полонійні заходи з польськими організаціями.": "Zamki Podkarpacia, pałac Potockich w Łańcucie oraz wspólne wydarzenia polonijne z polskimi organizacjami.", "Подорожі школярів": "Podróże uczniów", "Традиції, святкові академії, концерти та урочисті заходи Польської суботньої школи.": "Tradycje, uroczyste akademie, koncerty i wydarzenia okolicznościowe Polskiej Szkoły Sobotniej.", "Dzień Nauczyciela / День вчителя": "Dzień Nauczyciela", "Dzień Nauczyciela obchodzi się w Polsce 14 października na pamiątkę powołania Komisji Edukacji Narodowej w XVIII stuleciu — pierwszego ministerstwa oświaty w Europie.": "Dzień Nauczyciela obchodzi się w Polsce 14 października na pamiątkę powołania Komisji Edukacji Narodowej w XVIII stuleciu — pierwszego ministerstwa oświaty w Europie.", "Święto Niepodległości / День Незалежності Польщі": "Święto Niepodległości", "Одне з найважливіших державних свят Польщі, яке учні школи відзначають урочистою патріотичною академією, виконанням гімну \"Mazurek Dąbrowskiego\", історичними вікторинами та виставками учнівських робіт.": "Jedno z najważniejszych polskich świąt państwowych, które uczniowie szkoły świętują uroczystą akademią patriotyczną, hymnem \"Mazurek Dąbrowskiego\" oraz wystawami prac uczniów.", "Учні знайомляться з історичними постатями: Юзефом Пілсудським, Ігнацієм Яном Падеревським та історією відновлення суверенітету 1918 року.": "Uczniowie poznają wybitne postacie: Józefa Piłsudskiego, Ignacego Jana Paderewskiego oraz historię odzyskania niepodległości w 1918 roku.", "Boże Narodzenie / Різдвяні свята": "Boże Narodzenie", "Традиційні польські різдвяні звичаї: святковий вечір (Wigilia), ділення різдвяним оплатком (dzielenie się opłatkiem), виконання найкрасивіших польських колядок (kolędy i pastorałki) та шкільний різдвяний вертеп (Jasełka).": "Tradycyjne polskie obyczaje bożonarodzeniowe: wieczór wigilijny, dzielenie się opłatkiem, wspólne kolędowanie oraz szkolne jasełka.", "Це час єднання шкільної родини, теплих побажань, подарунків від святого Миколая (Święty Mikołaj) та збереження народних традицій.": "To czas zjednoczenia społeczności szkolnej, ciepłych życzeń, prezentów od św. Mikołaja i pielęgnowania tradycji narodowych.", "Святковий виступ": "Występ świąteczny", "Свята та події": "Święta i wydarzenia", "Зв'яжіться з нами для консультацій та запису на навчання.": "Skontaktuj się z nami w sprawie konsultacji i zapisów na zajęcia.", "Щороку dyrekcja, grono pedagogiczne та учні збираються в актовій залі на урочистій академії з концертною програмою: наймолодші учні виконують пісні (,,Uczeń pierwszej klasy\", ,,Nasza szkoła\", ,,Żabki\", ,,Jesienna piosenka\"), а старшокласники декламують поезію видатних польських класиків.": "Co roku dyrekcja, grono pedagogiczne i uczniowie gromadzą się w auli na uroczystej akademii z programem artystycznym: najmłodsi wykonują piosenki („Uczeń pierwszej klasy”, „Nasza szkoła”, „Żabki”, „Jesienna piosenka”), a starsi recytują poezję wybitnych polskich klasyków.", "Polska Sobotnia Szkoła imienia Świętej Królowej Jadwigi w Drohobyczu — простір знань, польської культури та взаємоповаги.": "Polska Szkoła Sobotnia imienia Świętej Królowej Jadwigi w Drohobyczu — przestrzeń wiedzy, polskiej kultury i wzajemnego szacunku.", "Досвідчені педагоги, філологи та методисти, які віддані своїй справі та створюють дружню атмосферу для кожного учня.": "Doświadczeni pedagodzy, filolodzy i metodycy, oddani swojej pracy i tworzący przyjazną atmosferę dla każdego ucznia.", "Зателефонуйте або залиште запит — методист школи проведе коротке тестування та підбере оптимальну групу.": "Zadzwoń lub zostaw zgłoszenie — metodyk szkoły przeprowadzi krótki test i dobierze optymalną grupę.", "Сучасні комунікативні методики, інтерактивні заняття та офіційний сертифікат після завершення навчання.": "Nowoczesne metodyki komunikacyjne, zajęcia interaktywne i oficjalny certyfikat po ukończeniu nauki.", "Видатні постаті, історичні події, звичаї, польські національні свята, поезія та класична література.": "Wybitne postacie, wydarzenia historyczne, obyczaje, polskie święta narodowe, poezja i literatura klasyczna.", "Зверніться до нас для уточнення наявності вільних місць у групах та консультації щодо рівня знань.": "Skontaktuj się z nami, aby sprawdzić dostępność wolnych miejsc w grupach i skonsultować poziom wiedzy.", "Фотогалерея / Galeria zdjęć :: Польська суботня школа імені святої королеви Ядвіги, м. Дрогобич": "Galeria zdjęć :: Polska Szkoła Sobotnia im. św. Królowej Jadwigi w Drohobyczu", "Графік занять та перерв у Польській суботній школі імені св. королеви Ядвіги, м. Дрогобич.": "Harmonogram zajęć i przerw w Polskiej Szkole Sobotniej im. św. Królowej Jadwigi w Drohobyczu.", "Екскурсії / Wycieczki :: Польська суботня школа імені святої королеви Ядвіги, м. Дрогобич": "Wycieczki :: Polska Szkoła Sobotnia im. św. Królowej Jadwigi w Drohobyczu", "Окремі вечірні або суботні групи для дорослих різного рівня володіння (А1, А2, В1, В2).": "Osobne wieczorowe lub sobotnie grupy dla dorosłych na różnych poziomach zaawansowania (A1, A2, B1, B2).", "Контакти / Kontakt :: Польська суботня школа імені святої королеви Ядвіги, м. Дрогобич": "Kontakt :: Polska Szkoła Sobotnia im. św. Królowej Jadwigi w Drohobyczu", "Організація навчального процесу по суботах для учнів різних вікових груп та дорослих.": "Organizacja procesu dydaktycznego w soboty dla uczniów w różnych grupach wiekowych i dorosłych.", "Розклад дзвінків :: Польська суботня школа імені святої королеви Ядвіги, м. Дрогобич": "Rozkład dzwonków :: Polska Szkoła Sobotnia im. św. Królowej Jadwigi w Drohobyczu", "Про нас / O nas :: Польська суботня школа імені святої королеви Ядвіги, м. Дрогобич": "O nas :: Polska Szkoła Sobotnia im. św. Królowej Jadwigi w Drohobyczu", "Розклад занять :: Польська суботня школа імені святої королеви Ядвіги, м. Дрогобич": "Plan zajęć :: Polska Szkoła Sobotnia im. św. Królowej Jadwigi w Drohobyczu", "Заняття проходять щосуботи з вересня по червень згідно з навчальним планом школи.": "Zajęcia odbywają się w każdą sobotę od września do czerwca zgodnie z planem nauczania szkoły.", "Курси / Kursy :: Польська суботня школа імені святої королеви Ядвіги, м. Дрогобич": "Kursy :: Polska Szkoła Sobotnia im. św. Królowej Jadwigi w Drohobyczu", "Uroczystości :: Польська суботня школа імені святої королеви Ядвіги, м. Дрогобич": "Uroczystości :: Polska Szkoła Sobotnia im. św. Królowej Jadwigi w Drohobyczu", "Слідкуйте за анонсами та приходьте на відкриті свята Польської суботньої школи.": "Śledź zapowiedzi i przyjdź na otwarte uroczystości Polskiej Szkoły Sobotniej.", "Вівторок та Четвер: 18:00 – 19:30 або 19:30 – 21:00 (за погодженням з групою).": "Wtorek i Czwartek: 18:00 – 19:30 lub 19:30 – 21:00 (w porozumieniu z grupą).", "Приєднуйтесь до навчальних груп Польської суботньої школи у місті Дрогобичі.": "Dołącz do grup edukacyjnych Polskiej Szkoły Sobotniej w Drohobyczu.", "Підручник та робочий зошит (надається школою або рекомендується викладачем)": "Podręcznik i zeszyt ćwiczeń (zapewniane przez szkołę lub polecane przez nauczyciela)", "Сторінку не знайдено :: Польська суботня школа імені святої королеви Ядвіги": "Nie znaleziono strony :: Polska Szkoła Sobotnia im. św. Królowej Jadwigi", "Комплексний підхід до занурення в мовне та культурне середовище Польщі.": "Kompleksowe podejście do zanurzenia w środowisku językowym i kulturowym Polski.", "Понеділок та Середа: 18:00 – 19:30 або 19:30 – 21:00 (за погодженням з групою).": "Poniedziałek i Środa: 18:00 – 19:30 lub 19:30 – 21:00 (w porozumieniu z grupą).", "Дізнайтеся більше про розклад, викладачів та особливості навчання у школі.": "Dowiedz się więcej o planie, nauczycielach i specyfice nauki w szkole.", "Поділіться з нами вашими враженнями або надішліть фото для шкільного архіву.": "Podziel się z nami swoimi wrażeniami lub prześlij zdjęcia do archiwum szkolnego.", "Надішліть заявку або зателефонуйте, щоб отримати відповіді на всі запитання.": "Wyślij zgłoszenie lub zadzwoń, aby uzyskać odpowiedzi na wszelkie pytania.", "Вивчення польської мови для дітей та дорослих, підготовка до Карти Поляка.": "Nauka języka polskiego dla dzieci i dorosłych, przygotowanie do Karty Polaka.", "Польська суботня школа імені святої королеви Ядвіги, міста Дрогобича": "Polska Szkoła Sobotnia im. św. Królowej Jadwigi w Drohobyczu", "Заняття для дітей та дорослих, підготовка до Карти Поляка та вступу.": "Zajęcia dla dzieci i dorosłych, przygotowanie do Karty Polaka i na studia.", "Якісне та цікаве вивчення польської мови для дітей та дорослих у Дрогобичі.": "Rzetelna i ciekawa nauka języka polskiego dla dzieci i dorosłych w Drohobyczu.", "Підготовка до навчання в Польщі та отримання Карти Поляка.": "Przygotowanie do nauki w Polsce i uzyskania Karty Polaka.", "Всі необхідні знання для успішного проходження співбесіди": "Wszelka niezbędna wiedza do pomyślnego zdania rozmowy", "Дізнайтеся про історію створення, місію та вчителів нашої школи.": "Poznaj historię powstania, misję i nauczycieli naszej szkoły.", "Сертифікат після закінчення курсу, підготовка до Карти Поляка.": "Certyfikat po ukończeniu kursu, przygotowanie do Karty Polaka.", "Аудіо, відеоматеріали та сучасні автентичні підручники": "Materiały audio, wideo oraz autentyczne podręczniki", "Практичні знання для комфортного спілкування та подорожей": "Praktyczna wiedza do swobodnej komunikacji i podróży", "Офіційний документ, що підтверджує рівень знань": "Oficjalny dokument potwierdzający poziom wiedzy", "Офіційний документ, визнаний польськими установами": "Oficjalny dokument uznawany przez polskie instytucje", "Поглиблена розмовна практика та підготовка до вишів": "Pogłębiona praktyka konwersacyjna i przygotowanie na uczelnie", "Сертифікат відповідного рівня володіння мовою": "Certyfikat odpowiedniego poziomu znajomości języka", "Індивідуальний підхід та зручний графік занять": "Indywidualne podejście i elastyczny harmonogram zajęć", "Графік дзвінків та тривалість уроків щосуботи.": "Rozkład dzwonków i czas trwania lekcji w każdą sobotę.", "Індивідуальні консультації та пробне тестування": "Indywidualne konsultacje i test kwalifikacyjny", "Irena Kaczmar — Wicedyrektor szkoły / Віце-директор школи": "Irena Kaczmar — Wicedyrektor szkoły", "Дізнайтеся точний розклад дзвінків та формуйте зручний графік занять.": "Sprawdź dokładny rozkład dzwonków i stwórz wygodny grafik zajęć.", "Зв'яжіться з віце-директором школи або напишіть нам для уточнення.": "Skontaktuj się z wicedyrektorem szkoły lub napisz do nas w celu uzyskania szczegółów.", "Звертайтесь до адміністрації школи або вашого класного керівника.": "Zwróć się do dyrekcji szkoły lub swojego wychowawcy.", "м. Дрогобич, вул. Завалля 12 та вул. Трускавецька 9 (центр міста)": "m. Drohobycz, ul. Zawalna 12 oraz ul. Truskawiecka 9 (centrum miasta)", "Велика перерва: 11:35 – 11:55 (час для відпочинку та перекусу)": "Duża przerwa: 11:35 – 11:55 (czas na odpoczynek i posiłek)", "Субота: 14:00 – 16:30 (2 спарених заняття з перервою на каву).": "Sobota: 14:00 – 16:30 (2 zajęcia połączone z przerwą kawową).", "Гарний настрій та бажання вивчати польську мову!": "Dobry nastrój i chęć nauki języka polskiego!", "Маєте запитання щодо розкладу конкретної групи?": "Masz pytania dotyczące planu konkretnej grupy?", "Курси для будь-якого віку та рівня підготовки": "Kursy dla każdego wieku i poziomu zaawansowania", "Визнання рівня знань після закінчення курсів": "Uznanie poziomu wiedzy po ukończeniu kursów", "Потрібно узгодити розклад або змінити групу?": "Potrzebujesz uzgodnić plan lub zmienić grupę?", "Хочете, щоб ваша дитина подорожувала з нами?": "Chcesz, aby Twoje dziecko podróżowało z nami?", "Безперервний розвиток та навчання поколінь": "Ciągły rozwój i kształcenie pokoleń", "Групи вивчення польської мови для дорослих": "Grupy nauki języka polskiego dla dorosłych", "Викладачі-методисти та сучасні підручники": "Nauczyciele metodycy i nowoczesne podręczniki", "Діти молодших класів, підлітки та дорослі": "Dzieci młodszych klas, młodzież i dorośli", "Навчальний графік за віковими категоріями": "Grafik zajęć według kategorii wiekowych", "Розпочніть навчання вже найближчої суботи": "Rozpocznij naukę już w najbliższą sobotę", "Польська суботня школа у місті Дрогобичі": "Polska Szkoła Sobotnia w Drohobyczu", "Бажаєте записатися або записати дитину?": "Chcesz zapisać się lub zapisać dziecko?", "Бажаєте взяти участь у наших заходах?": "Chcesz wziąć udział w naszych wydarzeniach?", "Адміністрація та викладацький склад": "Dyrekcja i grono pedagogiczne", "Підготовка до співбесіди з консулом": "Przygotowanie do rozmowy z konsulem", "Індивідуальний або груповий формат": "Format indywidualny lub grupowy", "Потрібна допомога з вибором рівня?": "Potrzebujesz pomocy w wyborze poziomu?", "Матеріали та історичні довідники": "Materiały i przewodniki historyczne", "Зошит для записів та конспектів": "Zeszyt do notatek i ćwiczeń", "Розташування школи у Дрогобичі": "Lokalizacje szkoły w Drohobyczu", "Сьогодні нашу школу відвідують": "Dziś do naszej szkoły uczęszcza", "Що необхідно мати на заняттях:": "Co należy mieć na zajęciach:", "Академічна та ділова польська": "Akademicki i biznesowy język polski", "Імітація реальної співбесіди": "Symulacja prawdziwej rozmowy", "Зв'язатися з адміністрацією": "Skontaktuj się z dyrekcją", "Будні дні (вечірні групи):": "Dni powszednie (grupy wieczorowe):", "Розклад уроків та перерв": "Rozkład lekcji i przerw", "Суботній навчальний день": "Sobotni dzień nauki", "Індивідуальний підхід": "Indywidualne podejście", "Офіційний сертифікат": "Oficjalny certyfikat", "Локації в Дрогобичі": "Lokalizacje w Drohobyczu", "Grudzień / Грудень": "Grudzień", "Історичні пам'ятки": "Zabytki historyczne", "Розклад дзвінків →": "Rozkład dzwonków →", "Завершення занять": "Zakończenie zajęć", "Курси та навчання": "Kursy i edukacja", "Тел: 096 9539 065": "Tel: 096 9539 065", "Виїзна екскурсія": "Wycieczka wyjazdowa", "Шкільна програма": "Program szkolny", "Карта Поляка": "Karta Polaka", "Для дітей": "Dla dzieci", "3 міс.": "3 mies.", "Карта": "Karta", "20.03.1998 року": "20.03.1998 roku", "понад 550 учнів": "ponad 550 uczniów", "Свята / Uroczystości": "Uroczystości"};

  var FAQ_TRANS = {
    "Запитання та відповіді": "Pytania i odpowiedzi",
    "Часті запитання": "Najczęściej zadawane pytania",
    "Відповіді на найпопулярніші запитання батьків та майбутніх учнів нашої школи.": "Odpowiedzi na najczęściej zadawane pytania rodziców i przyszłych uczniów naszej szkoły.",
    "З якого віку приймають дітей?": "Od jakiego wieku przyjmowane są dzieci?",
    "У нашу суботню школу ми приймаємо дітей віком від 6 років (молодші класи), а також підлітків та дорослих без вікових обмежень. Для кожної вікової категорії формуються окремі групи з урахуванням початкового рівня знань.": "Do naszej szkoły sobotniej przyjmujemy dzieci w wieku od 6 lat (młodsze klasy), a także młodzież i dorosłych bez ograniczeń wiekowych. Dla każdej grupy wiekowej tworzone są osobne grupy z uwzględnieniem poziomu wiedzy.",
    "Чи підходить курс для початківців з нуля?": "Czy kurs jest odpowiedni dla początkujących od zera?",
    "Так, звичайно! Більшість наших учнів починають навчання з самого початку — з вивчення алфавіту, правильної польської вимови та базової лексики. Наші викладачі використовують інтерактивні методики та сучасні польські підручники, тому навчання проходить легко та цікаво.": "Tak, oczywiście! Większość naszych uczniów rozpoczyna naukę od samego początku — od nauki alfabetu, poprawnej wymowy i podstawowego słownictwa. Nasi nauczyciele stosują interaktywne metodyki i nowoczesne podręczniki, dzięki czemu nauka przebiega łatwo i ciekawie.",
    "Як проходить підготовка до Карти Поляка?": "Jak przebiega przygotowanie do Karty Polaka?",
    "Програма підготовки включає поглиблене вивчення польської мови до рівня вільного спілкування, детальне ознайомлення з історією, географією, культурою та традиціями Польщі, видатними історичними постатями, а також моделювання реальної співбесіди з консулом за типовими запитаннями.": "Program przygotowawczy obejmuje intensywną naukę języka polskiego do poziomu swobodnej komunikacji, szczegółowe poznanie historii, geografii, kultury i tradycji Polski, wybitnych postaci historycznych, a także symulację prawdziwej rozmowy z konsulem.",
    "Чи є сертифікат після закінчення?": "Czy wydawany jest certyfikat po ukończeniu?",
    "Так, після успішного завершення навчального курсу та складання підсумкового тесту випускники отримують офіційний сертифікат нашої школи, який засвідчує рівень володіння польською мовою відповідно до європейських мовних стандартів CEFR (A1–B2).": "Tak, po pomyślnym ukończeniu kursu i zdaniu testu końcowego absolwenci otrzymują oficjalny certyfikat naszej szkoły, poświadczający poziom znajomości języka polskiego zgodnie ze standardami europejskimi CEFR (A1–B2).",
    "Які документи потрібні для запису?": "Jakie dokumenty są potrzebne do zapisu?",
    "Для запису достатньо заповнити онлайн-заявку на нашому сайті або зателефонувати до адміністрації. Під час першого візиту для дітей потрібна копія свідоцтва про народження, для дорослих — документ, що посвідчує особу, та заповнена реєстраційна анкета.": "W celu zapisu wystarczy wypełnić formularz online na naszej stronie lub skontaktować się telefonicznie z dyrekcją. Podczas pierwszej wizyty dla dzieci wymagana jest kopia aktu urodzenia, dla dorosłych — dokument tożsamości oraz wypełniony formularz zgłoszeniowy."
  };
  for (var fqKey in FAQ_TRANS) {
    TRANSLATIONS[fqKey] = FAQ_TRANS[fqKey];
  }

  var REVIEWS_TRANS = {
    "Відгуки": "Opinie",
    "Відгуки та результати": "Opinie i sukcesy",
    "Що кажуть наші учні та батьки": "Co mówią nasi uczniowie i rodzice",
    "Справжні історії успіху: отримання Карти Поляка, вступ до престижних університетів Польщі та радість дітей від занять.": "Prawdziwe historie sukcesu: uzyskanie Karty Polaka, studia na prestiżowych uczelniach w Polsce oraz radość dzieci z nauki.",
    "Залишити відгук": "Napisz opinię",
    "Всі відгуки": "Wszystkie opinie",
    "Вступ до ВНЗ": "Studia w Polsce",
    "Батьки учнів": "Rodzice uczniów",
    "Курси для дорослих": "Kursy dla dorosłych",
    "Почніть шлях до вивчення польської мови": "Rozpocznij drogę do nauki języka polskiego",
    "Почніть шлях до вивчення": "Rozpocznij drogę do nauki",
    "Отримав(ла) Карту Поляка": "Otrzymał(a) Kartę Polaka",
    "Вступ до ВНЗ Польщі": "Podjęcie studiów w Polsce",
    "Батьки учня / учениці": "Rodzice ucznia / uczennicy",
    "Учень суботньої школи": "Uczeń szkoły sobotniej",
    "Ваш відгук *": "Twoja opinia *",
    "Розкажіть про ваш досвід навчання, вчителів чи результат...": "Opowiedz o swoim doświadczeniu w nauce, nauczycielach lub wynikach...",
    "Я не робот": "Nie jestem robotem",
    "Захист": "Ochrona",
    "Надіслати відгук на модерацію": "Prześlij opinię do moderacji",
    "Ще немає опублікованих відгуків. Будьте першим, хто поділиться враженнями!": "Nie ma jeszcze opublikowanych opinii. Bądź pierwszą osobą, która podzieli się wrażeniami!",
    "Ще немає опублікованих відгуків. Будьте першим, хто поділиться своїми враженнями!": "Nie ma jeszcze opublikowanych opinii. Bądź pierwszą osobą, która podzieli się wrażeniami!",
    "Поки що немає відгуків": "Brak opinii",
    "Будьте першим, хто поділиться своїм досвідом навчання у школі!": "Bądź pierwszą osobą, która podzieli się swoim doświadczeniem z nauki w szkole!",
    "Підтверджений відгук": "Potwierdzona opinia",
    "Випускник школи": "Absolwent szkoły",
    "Поділіться вашими враженнями про навчання у Польській суботній школі": "Podziel się swoimi wrażeniami o nauce w Polskiej Szkole Sobotniej",
    "Категорія відгуку:": "Kategoria opinii:",
    "Увійдіть через Google, щоб залишити відгук": "Zaloguj się przez Google, aby dodać opinię",
    "Ви ввійшли як:": "Zalogowano jako:",
    "Вийти": "Wyloguj się",
    "Опублікувати відгук": "Opublikuj opinię",
    "Перевірка пройдена": "Weryfikacja zakończona sukcesem",
    "Потрібно пройти перевірку \"Я не робот\"": "Musisz przejść weryfikację \"Nie jestem robotem\"",
    "Будь ласка, напишіть текст відгуку": "Proszę wpisać treść opinii",
    "Дякуємо! Ваш відгук надіслано на модерацію. Після перевірки адміністратором він з'явиться на сайті.": "Dziękujemy! Twoja opinia została przesłana do moderacji. Po weryfikacji przez administratora pojawi się na stronie.",
    "Помилка при збереженні відгуку": "Błąd podczas zapisywania opinii"
  };
  for (var rk in REVIEWS_TRANS) {
    TRANSLATIONS[rk] = REVIEWS_TRANS[rk];
  }

  var NEWS_TRANS = {
    "Новини": "Aktualności",
    "Новини та події школи": "Aktualności i wydarzenia szkolne",
    "Новини та шкільні події": "Aktualności i wydarzenia szkolne",
    "Останні новини та заходи школи": "Najnowsze wiadomości i wydarzenia szkolne",
    "Свіжі фотозвіти, урочисті заходи, пізнавальні поїздки та досягнення учнів Польської суботньої школи.": "Najnowsze fotorelacje, uroczystości, wycieczki edukacyjne i sukcesy uczniów Polskiej Szkoły Sobotniej.",
    "Свіжі фотозвіти, урочисті заходи, пізнавальні екскурсії та досягнення наших учнів у Дрогобичі.": "Najnowsze fotorelacje, uroczystości, wycieczki edukacyjne i sukcesy naszych uczniów w Drohobyczu.",
    "Шкільне життя та хроніка": "Życie szkoły i kronika",
    "Всі новини": "Wszystkie aktualności",
    "Всі новини школи →": "Wszystkie aktualności szkoły →",
    "Всі новини школи →": "Wszystkie aktualności szkoły →",
    "Читати повністю →": "Czytaj więcej →",
    "Читати повністю": "Czytaj więcej",
    "Назад до новин": "Wróć do aktualności",
    "Поки що немає новин": "Brak aktualności",
    "Слідкуйте за оновленнями життя школи!": "Śledź aktualności z życia szkoły!",
    "Свято": "Uroczystość",
    "Свята": "Uroczystości",
    "Екскурсія": "Wycieczka",
    "Екскурсії": "Wycieczki",
    "Успіхи": "Sukcesy",
    "Успіхи учнів": "Sukcesy uczniów",
    "Оголошення": "Ogłoszenia",
    "Подія": "Wydarzenie",
    "Шкільне життя": "Życie szkoły"
  };
  for (var nk in NEWS_TRANS) {
    TRANSLATIONS[nk] = NEWS_TRANS[nk];
  }

  var dynamicTransCache = {};
  try {
    var rawDyn = localStorage.getItem('school_dyn_trans_pl');
    if (rawDyn) dynamicTransCache = JSON.parse(rawDyn) || {};
  } catch(e) {}

  var pendingDynRequests = {};
  function fetchDynamicTranslation(phrase, callback) {
    var clean = phrase.trim();
    if (!clean) return;
    if (dynamicTransCache[clean]) {
      callback(dynamicTransCache[clean]);
      return;
    }
    if (pendingDynRequests[clean]) {
      pendingDynRequests[clean].push(callback);
      return;
    }
    pendingDynRequests[clean] = [callback];
    var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=uk&tl=pl&dt=t&q=' + encodeURIComponent(clean);
    fetch(url)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var res = '';
        if (data && data[0]) {
          for (var i = 0; i < data[0].length; i++) {
            if (data[0][i] && data[0][i][0]) res += data[0][i][0];
          }
        }
        res = res.trim();
        if (res) {
          dynamicTransCache[clean] = res;
          try {
            localStorage.setItem('school_dyn_trans_pl', JSON.stringify(dynamicTransCache));
          } catch(e) {}
        }
        var cbs = pendingDynRequests[clean] || [];
        delete pendingDynRequests[clean];
        cbs.forEach(function(cb) { cb(res || clean); });
      })
      .catch(function() {
        delete pendingDynRequests[clean];
      });
  }

  function applyLanguage(lang) {
    var isPl = (lang === 'pl');
    document.documentElement.lang = isPl ? 'pl' : 'uk';
    var switches = document.querySelectorAll('.lang-switch');
    for (var s = 0; s < switches.length; s++) {
      switches[s].setAttribute('data-active', isPl ? 'pl' : 'ua');
    }

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement) continue;
      var tag = node.parentElement.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') continue;
      if (node.parentElement.classList.contains('lang-btn')) continue;
      if (node._origText === undefined) {
        node._origText = node.nodeValue;
      }
      var orig = node._origText;
      var trimmed = orig.trim();
      if (!trimmed) continue;
      if (isPl) {
        var norm = trimmed.replace(/\s+/g, ' ');
        if (TRANSLATIONS[norm]) {
          node.nodeValue = orig.replace(trimmed, TRANSLATIONS[norm]);
        } else if (dynamicTransCache[norm]) {
          node.nodeValue = orig.replace(trimmed, dynamicTransCache[norm]);
        } else if (/^Світлина\s+\d+/.test(trimmed)) {
          node.nodeValue = orig.replace('Світлина', 'Zdjęcie');
        } else if (/^Урок\s+\d+/.test(trimmed)) {
          node.nodeValue = orig.replace('Урок', 'Lekcja');
        } else if (/[а-яіїєґ]/i.test(norm) && norm.length > 1) {
          (function(targetNode, origText, phrase) {
            fetchDynamicTranslation(phrase, function(translated) {
              if (document.documentElement.lang === 'pl' && targetNode.parentElement) {
                targetNode.nodeValue = origText.replace(phrase, translated);
              }
            });
          })(node, orig, norm);
        }
      } else {
        node.nodeValue = orig;
      }
    }

    var inputs = document.querySelectorAll('input, textarea');
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      if (inp._origPlaceholder === undefined) {
        inp._origPlaceholder = inp.placeholder;
      }
      var origPl = inp._origPlaceholder;
      if (!origPl) continue;
      if (isPl) {
        var normPl = origPl.trim().replace(/\s+/g, ' ');
        if (TRANSLATIONS[normPl]) {
          inp.placeholder = TRANSLATIONS[normPl];
        } else if (dynamicTransCache[normPl]) {
          inp.placeholder = dynamicTransCache[normPl];
        } else if (/[а-яіїєґ]/i.test(normPl) && normPl.length > 1) {
          (function(targetInp, phrase) {
            fetchDynamicTranslation(phrase, function(translated) {
              if (document.documentElement.lang === 'pl') {
                targetInp.placeholder = translated;
              }
            });
          })(inp, normPl);
        }
      } else {
        inp.placeholder = origPl;
      }
    }

    if (document._origTitle === undefined) {
      document._origTitle = document.title;
    }
    if (isPl) {
      var normTitle = document._origTitle.trim().replace(/\s+/g, ' ');
      if (TRANSLATIONS[normTitle]) {
        document.title = TRANSLATIONS[normTitle];
      } else if (dynamicTransCache[normTitle]) {
        document.title = dynamicTransCache[normTitle];
      } else if (/[а-яіїєґ]/i.test(normTitle) && normTitle.length > 1) {
        fetchDynamicTranslation(normTitle, function(translated) {
          if (document.documentElement.lang === 'pl') {
            document.title = translated;
          }
        });
      }
    } else {
      document.title = document._origTitle;
    }

    try {
      localStorage.setItem('site_lang', lang);
    } catch (e) {}
  }

  function initLanguage() {
    var savedLang = 'ua';
    try {
      if (window.self !== window.top) {
        savedLang = 'ua';
      } else {
        savedLang = localStorage.getItem('site_lang') || 'ua';
      }
    } catch (e) {}

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.lang-btn');
      if (btn) {
        e.preventDefault();
        var targetLang = btn.getAttribute('data-lang');
        applyLanguage(targetLang);
        return;
      }
      var sw = e.target.closest('.lang-switch');
      if (sw && !e.target.closest('.lang-btn')) {
        e.preventDefault();
        var cur = sw.getAttribute('data-active') || 'ua';
        applyLanguage(cur === 'ua' ? 'pl' : 'ua');
      }
    });

    if (savedLang === 'pl') {
      applyLanguage('pl');
    }
  }

  initLanguage();

  function initDarkTheme() {
    var saved = 'light';
    try { saved = localStorage.getItem('site_theme') || 'light'; } catch(e) {}
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    function toggleTheme() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
      try { localStorage.setItem('site_theme', isDark ? 'light' : 'dark'); } catch(e) {}
    }
    var btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggleTheme);
    var btn2 = document.getElementById('themeToggleOverlay');
    if (btn2) btn2.addEventListener('click', toggleTheme);
  }
  initDarkTheme();

  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'backToTop';
      btn.className = 'back-to-top';
      btn.setAttribute('aria-label', 'Нагору');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
      document.body.appendChild(btn);
    }
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', function() {
      if (window.scrollY > 350) {
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    }, { passive: true });
  }
  initBackToTop();

  function initFAQ() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function(item) {
      var btn = item.querySelector('.faq-question');
      var ans = item.querySelector('.faq-answer');
      if (!btn || !ans) return;
      btn.addEventListener('click', function() {
        var isOpen = item.classList.contains('open');
        items.forEach(function(other) {
          if (other !== item) {
            other.classList.remove('open');
            var otherBtn = other.querySelector('.faq-question');
            var otherAns = other.querySelector('.faq-answer');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherAns) otherAns.style.maxHeight = null;
          }
        });
        if (isOpen) {
          item.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          ans.style.maxHeight = null;
        } else {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          ans.style.maxHeight = ans.scrollHeight + 30 + 'px';
        }
      });
    });
  }
  initFAQ();

  function applyDynamicContent(data) {
    if (!data) return;
    if (data.contacts) {
      if (data.contacts.phone1) {
        document.querySelectorAll('a[href^="tel:"]').forEach(function(el) {
          el.href = 'tel:' + data.contacts.phone1;
          el.textContent = data.contacts.phone1_display || data.contacts.phone1;
        });
      }
      if (data.contacts.email) {
        document.querySelectorAll('a[href^="mailto:"]').forEach(function(el) {
          el.href = 'mailto:' + data.contacts.email;
          el.textContent = data.contacts.email;
        });
      }
    }

    if (data.announcement && data.announcement.enabled && data.announcement.text) {
      if (!document.getElementById('siteAnnouncement')) {
        var bar = document.createElement('div');
        bar.id = 'siteAnnouncement';
        bar.className = 'site-announcement';
        bar.innerHTML = '<span>' + data.announcement.text + '</span>';
        var mainEl = document.querySelector('main');
        if (mainEl && mainEl.parentNode) {
          mainEl.parentNode.insertBefore(bar, mainEl);
        }
      }
    }

    var path = window.location.pathname.toLowerCase();
    var pageKey = '';
    if (path.indexOf('pro-mene') !== -1) pageKey = 'pro_mene';
    else if (path.indexOf('prajs-list') !== -1) pageKey = 'prajs_list';
    else if (path.indexOf('fotogalereya') !== -1) pageKey = 'fotogalereya';
    else if (path.indexOf('ekskursiji') !== -1) pageKey = 'ekskursiji';
    else if (path.indexOf('uroczystosci') !== -1) pageKey = 'uroczystosci';
    else if (path.indexOf('kontakti') !== -1) pageKey = 'kontakti';
    else if (path.indexOf('novyny') !== -1) pageKey = 'novyny';
    else if (path.indexOf('index') !== -1 || path.endsWith('/') || path.endsWith('\\') || path === '') pageKey = 'index';

    if (pageKey && data.pages && data.pages[pageKey]) {
      var filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
      if (filename.indexOf('.html') === -1) filename = filename ? (filename + '.html') : 'index.html';
      var hasSavedPage = false;
      try {
        hasSavedPage = !!localStorage.getItem('school_page_main_' + filename);
        if (!hasSavedPage && localRaw) {
          var pLocal = JSON.parse(localRaw);
          if (pLocal && pLocal.page_html && pLocal.page_html[filename]) hasSavedPage = true;
        }
      } catch(e) {}
      if (!hasSavedPage) {
        var pData = data.pages[pageKey];
        var heroH1 = document.querySelector('.page-hero h1, .hero h1');
        var heroP = document.querySelector('.page-hero p, .hero p');
        if (heroH1 && pData.hero_title) heroH1.textContent = pData.hero_title;
        if (heroP && pData.hero_subtitle) heroP.textContent = pData.hero_subtitle;
      }
    }

    if (path.indexOf('fotogalereya') !== -1 && data.gallery) {
      var grid = document.querySelector('.gallery-grid');
      if (grid) {
        if (data.gallery.deleted && data.gallery.deleted.length) {
          var cards = grid.querySelectorAll('.gallery-card');
          cards.forEach(function(card) {
            var img = card.querySelector('img');
            if (img) {
              var s = img.getAttribute('src') || img.src || '';
              data.gallery.deleted.forEach(function(delSrc) {
                if (s.indexOf(delSrc) !== -1) {
                  card.style.display = 'none';
                }
              });
            }
          });
        }
        if (data.gallery.added && data.gallery.added.length) {
          data.gallery.added.forEach(function(item, idx) {
            var card = document.createElement('div');
            card.className = 'gallery-card reveal in';
            card.setAttribute('data-lightbox', '');
            card.innerHTML = '<img src="' + item.src + '" alt="' + (item.title || 'Фото') + '"><span class="gallery-badge">' + (item.title || ('Світлина +' + (idx + 1))) + '</span>';
            grid.insertBefore(card, grid.firstChild);
            card.addEventListener('click', function() {
              if (window.openLightboxWithSrc) {
                window.openLightboxWithSrc(item.src);
              }
            });
          });
        }
      }
    }
  }

  function initDynamicContent() {
    var localRaw = null;
    try {
      localRaw = localStorage.getItem('school_site_content');
    } catch(e) {}
    if (localRaw) {
      try {
        applyDynamicContent(JSON.parse(localRaw));
      } catch(e) {}
    } else {
      fetch('assets/data/site-content.json')
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data && data.page_html) {
            var path = window.location.pathname;
            var filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
            if (filename.indexOf('.html') === -1) filename = filename ? (filename + '.html') : 'index.html';
            if (data.page_html[filename]) {
              var mainEl = document.querySelector('main');
              if (mainEl && !localStorage.getItem('school_page_main_' + filename)) {
                mainEl.innerHTML = data.page_html[filename];
              }
            }
          }
          if (data && data.page_footer) {
            var footerEl = document.querySelector('footer');
            if (footerEl && !localStorage.getItem('school_page_footer')) {
              footerEl.innerHTML = data.page_footer;
            }
          }
          applyDynamicContent(data);
        })
        .catch(function() {});
    }
  }
  initDynamicContent();

  function initSmartCaptchas() {
    document.querySelectorAll('.smart-captcha').forEach(function(sc) {
      var inp = sc.querySelector('.captcha-input');
      if (!inp) return;
      inp.addEventListener('change', function() {
        if (inp.checked) {
          sc.classList.add('loading');
          setTimeout(function() {
            sc.classList.remove('loading');
            sc.classList.add('verified');
          }, 350);
        } else {
          sc.classList.remove('verified');
        }
      });
    });
  }
  initSmartCaptchas();

  function initReviews() {
    var grid = document.getElementById('reviewsGrid');
    if (!grid) return;

    var DEFAULT_REVIEWS = [];

        function getAllApprovedReviews() {
      var saved = [];
      try {
        var raw = localStorage.getItem('school_approved_reviews');
        if (raw) saved = JSON.parse(raw);
      } catch (e) {}
      return DEFAULT_REVIEWS.concat(saved);
    }

    var currentFilter = 'all';

    function renderReviews() {
      var list = getAllApprovedReviews();
      if (currentFilter !== 'all') {
        list = list.filter(function(r) { return r.badge === currentFilter; });
      }

      if (list.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:var(--surface);border-radius:18px;border:1px dashed var(--line);color:var(--ink-soft)"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin:0 auto 12px;opacity:.5;display:block"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div style="font-size:1.05rem;font-weight:700;color:var(--ink);margin-bottom:6px">Поки що немає відгуків</div><div style="font-size:.9rem">Будьте першим, хто поділиться своїм досвідом навчання у школі!</div></div>';
        if (document.documentElement.lang === 'pl') applyLanguage('pl');
        return;
      }

      var starSvg = '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

      var html = '';
      list.forEach(function(item) {
        var starsHtml = '';
        var numStars = item.rating || 5;
        for (var i = 0; i < numStars; i++) {
          starsHtml += starSvg;
        }

        var avatarSrc = item.photo || 'assets/icons/school-emblem.jpg';

        html += '<div class="review-card reveal in">' +
          '<div class="review-top">' +
            '<img class="review-avatar" src="' + avatarSrc + '" alt="' + item.name + '" onerror="this.src=\'assets/icons/school-emblem.jpg\'">' +
            '<div class="review-info">' +
              '<div class="review-name">' + item.name + ' <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>' +
              '<span class="review-badge">' + (item.badgeLabel || 'Випускник школи') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="review-stars">' + starsHtml + '</div>' +
          '<p class="review-text">' + item.text + '</p>' +
          '<div class="review-footer">' +
            '<span>Підтверджений відгук</span>' +
            '<time>' + (item.date || '') + '</time>' +
          '</div>' +
        '</div>';
      });

      grid.innerHTML = html;
      if (document.documentElement.lang === 'pl') applyLanguage('pl');
    }

    renderReviews();

    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter') || 'all';
        renderReviews();
      });
    });

    var modal = document.getElementById('reviewModal');
    var openBtn = document.getElementById('openReviewBtn');
    var closeBtn = document.getElementById('closeReviewModal');
    var authStep = document.getElementById('reviewAuthStep');
    var form = document.getElementById('reviewForm');
    var currentReviewUser = null;

    if (openBtn && modal) {
      openBtn.addEventListener('click', function() {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        initReviewAuth();
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', function() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      });
    }

    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          modal.classList.remove('open');
          modal.setAttribute('aria-hidden', 'true');
        }
      });
    }

    function initReviewAuth() {
      var savedUserRaw = sessionStorage.getItem('school_review_user');
      if (savedUserRaw) {
        try {
          currentReviewUser = JSON.parse(savedUserRaw);
          showReviewForm(currentReviewUser);
          return;
        } catch (e) {}
      }

      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: '749327851839-me3jil7t4ecdfgae838k20ljmukcatad.apps.googleusercontent.com',
          callback: handleGoogleReviewAuth
        });
        var container = document.getElementById('reviewGoogleBtn');
        if (container) {
          container.innerHTML = '';
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            locale: 'uk'
          });
        }
      } else {
        setTimeout(initReviewAuth, 300);
      }
    }

    function handleGoogleReviewAuth(res) {
      try {
        var base64Url = res.credential.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        var payload = JSON.parse(jsonPayload);
        currentReviewUser = {
          name: payload.name || payload.email.split('@')[0],
          email: payload.email,
          picture: payload.picture || 'assets/icons/school-emblem.jpg'
        };
        sessionStorage.setItem('school_review_user', JSON.stringify(currentReviewUser));
        showReviewForm(currentReviewUser);
      } catch (err) {}
    }

    function showReviewForm(u) {
      if (authStep) authStep.style.display = 'none';
      if (form) form.style.display = 'block';
      var photoEl = document.getElementById('reviewUserPhoto');
      var nameEl = document.getElementById('reviewUserName');
      var emailEl = document.getElementById('reviewUserEmail');
      if (photoEl) photoEl.src = u.picture || 'assets/icons/school-emblem.jpg';
      if (nameEl) nameEl.textContent = u.name || 'Користувач';
      if (emailEl) emailEl.textContent = u.email || '';
    }

    var starContainer = document.getElementById('reviewStarRating');
    if (starContainer) {
      var stars = starContainer.querySelectorAll('.star');
      stars.forEach(function(st) {
        st.addEventListener('click', function() {
          var val = parseInt(st.getAttribute('data-val') || '5', 10);
          starContainer.setAttribute('data-rating', val);
          stars.forEach(function(s, idx) {
            if (idx < val) s.classList.add('active');
            else s.classList.remove('active');
          });
        });
      });
    }

    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var msg = document.getElementById('reviewMsg');
        var submitBtn = document.getElementById('reviewSubmitBtn');

        var honeypot = document.getElementById('reviewHoneypot');
        if (honeypot && honeypot.value.trim() !== '') {
          return;
        }

        var captchaCheck = document.getElementById('reviewCaptchaCheck');
        if (captchaCheck && !captchaCheck.checked) {
          if (msg) {
            msg.style.display = 'block';
            msg.style.background = '#fef2f2';
            msg.style.color = 'var(--red)';
            msg.textContent = 'Будь ласка, підтвердіть захист "Я не робот".';
          }
          return;
        }

        var textVal = document.getElementById('reviewText') ? document.getElementById('reviewText').value.trim() : '';
        if (!textVal) return;

        var rating = parseInt(starContainer ? starContainer.getAttribute('data-rating') || '5' : '5', 10);
        var badgeSelect = document.getElementById('reviewBadgeSelect');
        var badge = badgeSelect ? badgeSelect.value : 'school';
        var badgeLabel = badgeSelect ? badgeSelect.options[badgeSelect.selectedIndex].text : 'Учень школи';

        var newReview = {
          id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: currentReviewUser ? currentReviewUser.name : 'Гість',
          email: currentReviewUser ? currentReviewUser.email : '',
          photo: currentReviewUser ? currentReviewUser.picture : 'assets/icons/school-emblem.jpg',
          badge: badge,
          badgeLabel: badgeLabel,
          rating: rating,
          text: textVal,
          date: new Date().toLocaleDateString('uk-UA'),
          status: 'pending'
        };

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Надсилання...';
        }

        var pendingList = [];
        try {
          var pRaw = localStorage.getItem('school_pending_reviews');
          if (pRaw) pendingList = JSON.parse(pRaw);
        } catch (err) {}
        pendingList.push(newReview);
        localStorage.setItem('school_pending_reviews', JSON.stringify(pendingList));

        var GOOGLE_URL = 'https://script.google.com/macros/s/AKfycbzj_tN-NKOqg_MaFOQvPOKmjKtR1GMg1EDvjwXiu_YCtn8m3BTFABIOuHGK2ip-a_eJlw/exec';
        fetch(GOOGLE_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            type: 'review',
            name: newReview.name,
            email: newReview.email,
            phone: 'Відгук (' + newReview.badgeLabel + ')',
            message: 'Оцінка: ' + newReview.rating + '/5\n' + newReview.text,
            date: newReview.date
          })
        }).catch(function() {});

        setTimeout(function() {
          if (submitBtn) submitBtn.disabled = false;
          form.reset();
          if (msg) {
            msg.style.display = 'block';
            msg.style.background = '#f0fdf4';
            msg.style.color = '#16a34a';
            msg.textContent = 'Дякуємо! Ваш відгук успішно передано на модерацію. Після перевірки адміністратором він з\'явиться на сайті.';
          }
          var sc = document.getElementById('reviewCaptcha');
          if (sc) sc.classList.remove('verified');
        }, 600);
      });
    }
  }
  initReviews();

  function initNews() {
    var grid = document.getElementById('newsGrid');
    if (!grid) return;

    var DEFAULT_NEWS = [
      {
        id: 'news-1',
        title: 'Урочиста академія до Дня Незалежності Польщі у Дрогобичі',
        category: 'Свято',
        date: '11 листопада 2026',
        photo: 'assets/img/img_45_IMG_6320.jpeg',
        excerpt: 'Учні нашої школи підготували патріотичний святковий концерт, декламували вірші класиків та спільно виконали гімни України та Польщі.',
        text: 'У суботній школі ім. Св. Королеви Ядвіги відбулася щорічна урочиста академія з нагоди Дня Незалежності Польщі (Święto Niepodległości).\n\nНаймолодші вихованці виконали патріотичні пісні, учні середніх класів підготували зворушливі виступи з польської поезії, а старшокласники провели інтерактивну історичну вікторину про події 1918 року та відродження польської державності.\n\nДякуємо всім батькам, викладачам та гостям свята за теплу атмосферу та спільне збереження культурної спадщини!'
      },
      {
        id: 'news-2',
        title: 'Освітня подорож учнів до Кракова: Вавель та Ягеллонський університет',
        category: 'Екскурсія',
        date: '28 жовтня 2026',
        photo: 'assets/img/img_54_viber_image2-4.jpg',
        excerpt: 'Наші учні вирушили у триденну пізнавальну подорож до королівського Кракова, де відвідали усипальницю покровительки нашої школи — королеви Ядвіги.',
        text: 'Незабутня поїздка до королівського Кракова об\'єднала понад 40 учнів нашої суботньої школи!\n\nПід час екскурсії діти відвідали Королівський замок на Вавелі та вклонилися саркофагу святої королеви Ядвіги — небесної покровительки нашого навчального закладу. Також школярі побували в найстаріших аудиторіях Ягеллонського університету (Collegium Maius) та на власні очі побачили історичний центр міста.\n\nПодорож стала чудовою можливістю для учнів попрактикувати живу польську мову з носіями та дізнатися більше про багатовікову спільну історію.'
      },
      {
        id: 'news-3',
        title: 'Успішне складання співбесіди та отримання Карти Поляка нашими випускниками',
        category: 'Успіхи',
        date: '15 жовтня 2026',
        photo: 'assets/img/img_3_IMG_7648.jpeg',
        excerpt: 'Ще 12 випускників спецкурсу польської мови нашої школи успішно пройшли співбесіду в Генеральному Консульстві Республіки Польща.',
        text: 'Щиро вітаємо наших старанних учнів із блискучим проходженням офіційної співбесіди на Карту Поляка!\n\nЗавдяки тримісячній інтенсивній підготовці з історії, традицій, географії та культури Польщі, всі кандидати впевнено відповіли на запитання консула та отримали позитивні рішення.\n\nПишаємося вашими здобутками та бажаємо подальших успіхів у навчанні та кар\'єрі!'
      },
      {
        id: 'news-4',
        title: 'Триває набір учнів на новий навчальний семестр у польській школі',
        category: 'Оголошення',
        date: '10 листопада 2026',
        photo: 'assets/img/img_49_viber_image.jpg',
        excerpt: 'Запрошуємо дітей та дорослих на курси польської мови різного рівня: від початкового (A1) до підготовки на Карту Поляка (B2/C1).',
        text: 'Польська суботня школа імені святої королеви Ядвіги у м. Дрогобичі оголошує набір учнів у нові навчальні групи!\n\nПропонуємо:\n• Заняття для дітей від 6 років та підлітків;\n• Інтенсивні розмовні клуби для дорослих;\n• Підготовчі курси до складання іспиту на Карту Поляка;\n• Вивчення традицій, свят та історії Польщі.\n\nЗаняття проходять щосуботи у дружній та творчій атмосфері. Для запису заповніть форму на сайті або зателефонуйте: 096 9539 065.'
      }
    ];

    function getAllNews() {
      var saved = [];
      try {
        var raw = localStorage.getItem('school_news_list');
        if (raw) saved = JSON.parse(raw);
      } catch(e) {}

      var deleted = [];
      try {
        var rawDel = localStorage.getItem('school_deleted_news');
        if (rawDel) deleted = JSON.parse(rawDel);
      } catch(e) {}

      var baseList = DEFAULT_NEWS.filter(function(item) {
        return deleted.indexOf(item.id) === -1;
      });

      return saved.concat(baseList);
    }

    var filterContainer = document.getElementById('newsFilter');
    var isHomepage = !filterContainer;
    var currentFilter = 'all';

    function renderNews() {
      var list = getAllNews();
      if (!isHomepage && currentFilter !== 'all') {
        list = list.filter(function(n) {
          var c = (n.category || '').toLowerCase().trim();
          var f = currentFilter.toLowerCase().trim();
          return c === f || c.indexOf(f) !== -1 || f.indexOf(c) !== -1;
        });
      }

      if (isHomepage && list.length > 3) {
        list = list.slice(0, 3);
      }

      if (list.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:var(--surface);border-radius:18px;border:1px dashed var(--line);color:var(--ink-soft)"><div style="font-size:1.05rem;font-weight:700;color:var(--ink);margin-bottom:6px">Поки що немає новин</div><div>Слідкуйте за оновленнями життя школи!</div></div>';
        if (document.documentElement.lang === 'pl') applyLanguage('pl');
        return;
      }

      var html = '';
      list.forEach(function(item, idx) {
        var thumb = item.photo || 'assets/img/img_45_IMG_6320.jpeg';
        var badge = item.category || 'Подія';
        var date = item.date || '';
        var title = item.title || '';
        var excerpt = item.excerpt || (item.text ? item.text.substring(0, 140) + '...' : '');

        html += '<article class="news-card reveal in" data-news-idx="' + idx + '">' +
          '<div class="news-thumb-box">' +
            '<img class="news-thumb" src="' + thumb + '" alt="' + title + '" onerror="this.src=\'assets/icons/school-emblem.jpg\'">' +
            '<span class="news-badge">' + badge + '</span>' +
          '</div>' +
          '<div class="news-body">' +
            '<div class="news-date">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
              date +
            '</div>' +
            '<h3 class="news-title">' + title + '</h3>' +
            '<p class="news-excerpt">' + excerpt + '</p>' +
            '<div class="news-link">Читати повністю →</div>' +
          '</div>' +
        '</article>';
      });

      grid.innerHTML = html;

      grid.querySelectorAll('.news-card').forEach(function(card, cIdx) {
        card.addEventListener('click', function() {
          var item = list[cIdx];
          if (!item) return;
          openNewsModal(item);
        });
      });

      if (document.documentElement.lang === 'pl') applyLanguage('pl');
    }

    var modal = document.getElementById('newsModal');
    var modalImg = document.getElementById('newsModalImg');
    var modalBadge = document.getElementById('newsModalBadge');
    var modalDateText = document.getElementById('newsModalDateText');
    var modalTitle = document.getElementById('newsModalTitle');
    var modalText = document.getElementById('newsModalText');
    var modalClose = document.getElementById('newsModalClose');

    function openNewsModal(item) {
      if (!modal) return;
      if (modalImg) {
        if (item.photo) {
          modalImg.src = item.photo;
          modalImg.style.display = 'block';
        } else {
          modalImg.style.display = 'none';
        }
      }
      if (modalBadge) modalBadge.textContent = item.category || 'Подія';
      if (modalDateText) modalDateText.textContent = item.date || '';
      if (modalTitle) modalTitle.textContent = item.title || '';
      if (modalText) modalText.textContent = item.text || item.excerpt || '';
      modal.style.display = 'flex';
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (document.documentElement.lang === 'pl') applyLanguage('pl');
    }

    function closeNewsModal() {
      if (!modal) return;
      modal.classList.remove('active');
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }

    if (modalClose) {
      modalClose.addEventListener('click', closeNewsModal);
    }
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) closeNewsModal();
      });
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeNewsModal();
      }
    });

    if (filterContainer) {
      filterContainer.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          filterContainer.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          currentFilter = btn.getAttribute('data-filter') || 'all';
          renderNews();
        });
      });
    }

    renderNews();
  }
  initNews();


})();