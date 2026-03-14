function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Simple scroll reveal for elements with .reveal
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  // Fallback: show all if IntersectionObserver isn't supported
  revealElements.forEach((el) => el.classList.add("visible"));
}

// Count-up timer: time spent together
(function initCountup() {
  const section = document.getElementById("countup");
  if (!section) return;

  const startStr = section.getAttribute("data-start");
  if (!startStr) return;

  const startDate = new Date(startStr + "T00:00:00");
  const els = {
    years: document.getElementById("countup-years"),
    months: document.getElementById("countup-months"),
    days: document.getElementById("countup-days"),
    hours: document.getElementById("countup-hours"),
    minutes: document.getElementById("countup-minutes"),
    seconds: document.getElementById("countup-seconds"),
  };

  function update() {
    const now = new Date();
    let ms = now - startDate;
    if (ms < 0) ms = 0;

    const totalSeconds = Math.floor(ms / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    const years = Math.floor(totalDays / 365.25);
    const remainderDays = totalDays - years * 365.25;
    const months = Math.floor(remainderDays / 30.44);
    const days = Math.floor(remainderDays - months * 30.44);
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    if (els.years) els.years.textContent = years;
    if (els.months) els.months.textContent = months;
    if (els.days) els.days.textContent = days;
    if (els.hours) els.hours.textContent = String(hours).padStart(2, "0");
    if (els.minutes) els.minutes.textContent = String(minutes).padStart(2, "0");
    if (els.seconds) els.seconds.textContent = String(seconds).padStart(2, "0");
  }

  update();
  setInterval(update, 1000);
})();

// Simple slideshow (supports images and videos)
(function initSlideshow() {
  const frame = document.querySelector(".slideshow-frame");
  if (!frame) return;

  let current = 0;
  let timer = null;
  const interval = 5000; // 5 seconds

  function showSlide(index) {
    const slides = Array.from(frame.querySelectorAll(".slide"));
    const dots = Array.from(frame.querySelectorAll(".dot"));
    if (!slides.length) return;
    const total = slides.length;
    const nextIndex = (index + total) % total;

    slides.forEach((slide, i) => {
      const video = slide.querySelector("video");
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      slide.classList.toggle("slide-active", i === nextIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("dot-active", i === nextIndex);
    });

    const activeVideo = slides[nextIndex].querySelector("video");
    if (activeVideo) {
      activeVideo.play().catch(() => {});
    }

    current = nextIndex;
  }

  function next() {
    showSlide(current + 1);
    restartTimer();
  }

  function prev() {
    showSlide(current - 1);
    restartTimer();
  }

  function restartTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => showSlide(current + 1), interval);
  }

  if (nextBtn) nextBtn.addEventListener("click", next);
  if (prevBtn) prevBtn.addEventListener("click", prev);

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      restartTimer();
    });
  });

  showSlide(0);
  restartTimer();
})();

// Upload moments: add photos/videos to gallery and slideshow
(function initUploadMoments() {
  const input = document.getElementById("upload-input");
  const zone = document.getElementById("upload-zone");
  const gallery = document.getElementById("upload-gallery");
  const frame = document.querySelector(".slideshow-frame");
  const dotsContainer = frame && frame.querySelector(".slide-dots");
  const insertBefore = frame && frame.querySelector(".slide-nav-prev");

  if (!input || !gallery || !frame || !dotsContainer || !insertBefore) return;

  function isImage(file) {
    return file.type.startsWith("image/");
  }
  function isVideo(file) {
    return file.type.startsWith("video/");
  }

  function addFile(file) {
    if (!isImage(file) && !isVideo(file)) return;
    const url = URL.createObjectURL(file);

    const preview = document.createElement("div");
    preview.className = "upload-preview";
    if (isImage(file)) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Uploaded moment";
      preview.appendChild(img);
    } else {
      const video = document.createElement("video");
      video.src = url;
      video.preload = "metadata";
      preview.appendChild(video);
    }
    gallery.appendChild(preview);

    const slide = document.createElement("div");
    slide.className = "slide";
    slide.dataset.type = isImage(file) ? "image" : "video";
    if (isImage(file)) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Our moment";
      slide.appendChild(img);
    } else {
      const video = document.createElement("video");
      video.src = url;
      video.preload = "metadata";
      slide.appendChild(video);
    }
    frame.insertBefore(slide, insertBefore);

    const dot = document.createElement("span");
    dot.className = "dot";
    dotsContainer.appendChild(dot);
  }

  function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
      addFile(files[i]);
    }
  }

  input.addEventListener("change", function () {
    handleFiles(this.files);
    this.value = "";
  });

  zone.addEventListener("dragover", function (e) {
    e.preventDefault();
    zone.classList.add("drag-over");
  });
  zone.addEventListener("dragleave", function () {
    zone.classList.remove("drag-over");
  });
  zone.addEventListener("drop", function (e) {
    e.preventDefault();
    zone.classList.remove("drag-over");
    handleFiles(e.dataTransfer.files);
  });
})();

// Intro overlay + background music
let isMusicPlaying = false;

function startExperience() {
  const overlay = document.getElementById("intro-overlay");
  if (overlay) {
    overlay.classList.add("intro-overlay-hidden");
  }
  playMusic();
}

function toggleMusic() {
  if (isMusicPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

function playMusic() {
  const audio = document.getElementById("bg-music");
  const button = document.querySelector(".music-toggle");
  const label = button ? button.querySelector(".music-label") : null;
  if (!audio) return;

  audio
    .play()
    .then(() => {
      isMusicPlaying = true;
      if (button) {
        button.classList.add("music-playing");
        button.setAttribute("aria-pressed", "true");
      }
      if (label) {
        label.textContent = "Pause song";
      }
    })
    .catch(() => {
      // Ignore autoplay errors
    });
}

function pauseMusic() {
  const audio = document.getElementById("bg-music");
  const button = document.querySelector(".music-toggle");
  const label = button ? button.querySelector(".music-label") : null;
  if (!audio) return;

  audio.pause();
  isMusicPlaying = false;
  if (button) {
    button.classList.remove("music-playing");
    button.setAttribute("aria-pressed", "false");
  }
  if (label) {
    label.textContent = "Play our song";
  }
}

