let currentPage = 1;
let isLoading = false;
let hasMoreData = true;
let pageSize = 14;

const downloadData = async () => {
  if (isLoading || !hasMoreData) return;

  isLoading = true;

  try {
    const response = await fetch(
      `https://brandstestowy.smallhost.pl/api/random?pageNumber=${currentPage}&pageSize=${pageSize}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const products = await response.json();

    if (products.data.length === 0) {
      hasMoreData = false;
      return;
    }

    appendProducts(products.data);
    currentPage++;
  } catch (error) {
    console.error("Błąd:", error);
  } finally {
    isLoading = false;
  }
};

const formatProductId = (id) => {
  const idNumber = parseInt(id.replace('ID: ', ''), 10);
  return `ID: ${idNumber.toString().padStart(2, '0')}`;
};

const appendProducts = (products) => {
  const productListing = document.querySelector(".product-listing__grid");
  if (!productListing) return;

  const currentItemCount = productListing.children.length;
  const isMobile = window.innerWidth <= 768;
  const { openModal } = initProductModal();

  const items = products.map((product, index) => {
    const absoluteIndex = currentItemCount + index;

    if (
      (absoluteIndex === 5 && !isMobile) ||
      (absoluteIndex === 4 && isMobile)
    ) {
      return `
        <div class="product-listing__item product-listing__item--banner">
          <div class="product-listing__banner-content">
            <span class="product-listing__brand" aria-hidden="true">FORMA'SINT</span>
            <h1 class="product-listing__banner-text">You'll look and feel like the champion.</h1>
          </div>
          <button class="product-listing__banner-btn" aria-label="Check this product out">
            CHECK THIS OUT
            <img class="product-listing__banner-icon" src="../assets/images/right_arrow.svg" alt="" aria-hidden="true" />
          </button>
        </div>

        <div class="product-listing__item">
          <div class="product-listing__item-image-container">
            <img class="product-listing__item-img" alt="item" src="${product.image}" />
            <div class="product-listing__item-id">${formatProductId(`ID: ${product.id}`)}</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="product-listing__item">
        <div class="product-listing__item-image-container">
          <img class="product-listing__item-img" alt="item" src="${product.image}" />
          <div class="product-listing__item-id">${formatProductId(`ID: ${product.id}`)}</div>
        </div>
      </div>
    `;
  });

  productListing.insertAdjacentHTML("beforeend", items.join(""));

  const newItems = productListing.querySelectorAll(
    ".product-listing__item:not(.product-listing__item--banner)"
  );
  newItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const imageContainer = item.querySelector(
        ".product-listing__item-image-container"
      );
      if (imageContainer) {
        const image = imageContainer.querySelector("img");
        const id = imageContainer.querySelector(".product-listing__item-id");
        if (image && id) {
          openModal(image.src, id.textContent);
        }
      }
    });
  });
};

function updateProgressBar() {
  const progressFill = document.querySelector(
    ".featured-products__progress-fill"
  );
  const totalSlides = this.slides.length;
  const slidesPerView =
    this.params.slidesPerView === "auto" ? 1 : this.params.slidesPerView;
  const currentIndex = this.realIndex - slidesPerView + 1;
  if (slidesPerView === 1) {
    const position = Math.min((currentIndex / totalSlides) * 100, 100);
    const width = Math.max(100 / totalSlides, 100 / totalSlides);

    progressFill.style.left = `${position}%`;
    progressFill.style.width = `${width}%`;
  } else {
    let lastVisibleIndex = currentIndex + slidesPerView - 1;

    if (lastVisibleIndex >= totalSlides) {
      lastVisibleIndex -= totalSlides;
    }

    const position = (lastVisibleIndex / totalSlides) * 100;

    progressFill.style.left = `${position}%`;
    progressFill.style.width = `${100 / totalSlides}%`;
  }
}

const initSwiper = () =>
  new Swiper(".featured-products__swiper", {
    loop: true,
    spaceBetween: 24,
    navigation: {
      nextEl: ".swiper-button-next",
    },
    breakpoints: {
      1200: {
        slidesPerView: 4,
      },
      992: {
        slidesPerView: 3,
      },
      768: {
        slidesPerView: 2,
      },
      0: {
        slidesPerView: "auto",
        spaceBetween: 16,
      },
    },
    on: {
      slideChange: updateProgressBar,
      afterInit: updateProgressBar,
    },
  });

const initNavigation = () => {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".top-bar__nav-link");
  let isScrolling = false;

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  };

  navLinks.forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        isScrolling = true;
        setActiveLink(targetId);
        window.scrollTo({
          top: targetSection.offsetTop - 100,
          behavior: "smooth",
        });
        setTimeout(() => {
          isScrolling = false;
        }, 1000);
      }
    })
  );

  window.addEventListener("scroll", () => {
    if (isScrolling) return;
    const currentSectionId = [...sections]
      .reverse()
      .find((section) => window.scrollY >= section.offsetTop - 150)?.id;
    if (currentSectionId) setActiveLink(currentSectionId);
  });
};

const initCustomSelect = () => {
  const select = document.querySelector(".product-listing__select");
  if (!select) return;

  const trigger = select.querySelector(".product-listing__select-trigger");
  const optionsContainer = select.querySelector(".product-listing__options");

  select.addEventListener("click", () => select.classList.toggle("open"));

  const reorderOptions = (selectedValue) => {
    const options = Array.from(optionsContainer.children);
    const selectedOption = options.find(
      (opt) => opt.getAttribute("data-value") === selectedValue
    );

    options.forEach((opt) =>
      opt.classList.remove("product-listing__option--selected")
    );

    selectedOption.classList.add("product-listing__option--selected");

    optionsContainer.insertBefore(selectedOption, optionsContainer.firstChild);
  };

  optionsContainer.addEventListener("click", (e) => {
    const option = e.target.closest(".product-listing__option");
    if (
      !option ||
      option.classList.contains("product-listing__option--selected")
    )
      return;

    const value = option.getAttribute("data-value");
    trigger.textContent = value;

    reorderOptions(value);
    select.classList.remove("open");

    pageSize = parseInt(value, 10);
    currentPage = 1;
    hasMoreData = true;
    document.querySelector(".product-listing__grid").innerHTML = "";
    downloadData();
  });

  document.addEventListener("click", (e) => {
    if (!select.contains(e.target)) select.classList.remove("open");
  });
};

const initProductModal = () => {
  const modal = document.getElementById('productModal');
  const modalImage = modal.querySelector('.product-modal__image');
  const modalId = modal.querySelector('.product-modal__id');
  const closeButton = modal.querySelector('.product-modal__close');
  const overlay = modal.querySelector('.product-modal__overlay');

  const openModal = (productImage, productId) => {
    modalImage.src = productImage;
    modalId.textContent = formatProductId(productId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  return { openModal };
};

document.addEventListener("DOMContentLoaded", () => {
  downloadData();

  initSwiper();
  initNavigation();
  initCustomSelect();
  initProductModal();

  window.addEventListener("scroll", () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (nearBottom) {
      downloadData();
    }
  });
});

const logoIcon = document.querySelector(".top-bar__logo-icon");
const featuredIcons = document.querySelectorAll(
  "#featured-products__item-favorite__image"
);

const handleHoverImageChange = (element, srcIn, srcOut) => {
  element.addEventListener("mouseenter", () => (element.src = srcIn));
  element.addEventListener("mouseleave", () => (element.src = srcOut));
};

handleHoverImageChange(
  logoIcon,
  "assets/images/forma_icon_filled.svg",
  "assets/images/forma_icon.svg"
);

featuredIcons.forEach((icon) => {
  handleHoverImageChange(
    icon,
    "assets/images/favorite_filled.svg",
    "assets/images/favorite.svg"
  );
});

document
  .querySelector(".top-bar__hamburger")
  .addEventListener("click", function () {
    const navPanel = document.querySelector(".top-bar__nav-panel");
    navPanel.classList.toggle("open");
  });

document.querySelectorAll(".drawer-menu__link").forEach((link) => {
  link.addEventListener("click", () => {
    document.getElementById("hamburger-toggle").checked = false;
  });
});

document.querySelector(".drawer-overlay").addEventListener("click", () => {
  document.getElementById("hamburger-toggle").checked = false;
});
