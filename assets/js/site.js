(function () {
  var body = document.body;
  var header = document.getElementById('header');
  var toggle = document.getElementById('toggle');
  var overlay = document.getElementById('overlay');
  var progress = document.getElementById('progress');

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

  function openCustom(src) {
    if (!lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCounter) {
      lightboxCounter.textContent = '';
    }
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

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
    var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbz3TjDNwSnQUOC1P6RIgvYcvPHlRuMI-cQa-jxH-B0Y2KrpejdhuN89EM3RP0XKYMnWmg/exec';
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
        } else if (/^Світлина\s+\d+/.test(trimmed)) {
          node.nodeValue = orig.replace('Світлина', 'Zdjęcie');
        } else if (/^Урок\s+\d+/.test(trimmed)) {
          node.nodeValue = orig.replace('Урок', 'Lekcja');
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
      savedLang = localStorage.getItem('site_lang') || 'ua';
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
    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', function() {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        try { localStorage.setItem('site_theme', isDark ? 'light' : 'dark'); } catch(e) {}
      });
    }
  }
  initDarkTheme();

})();