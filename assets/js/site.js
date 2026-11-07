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
    var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwDFjStXNR35k6scG1DvG8Qe2XnhWd4w8cuTFxVMRmKMS9mQ_as-nw0ApDaBYMio36l/exec';
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
        if (safePhone && safePhone.charAt(0) === '+') {
          safePhone = "'" + safePhone;
        }

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
})();
