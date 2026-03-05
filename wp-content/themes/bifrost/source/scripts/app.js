jQuery(function ($) {
  "use strict";

  // Variables
  var adminbarHeight = 0;
  var topHeaderHeight = 0;
  var headerWrapper = $(".l-primary-header--default-wrapper");
  var mobileHeaderWrapper = $(".l-primary-header--responsive-wrapper");
  var headerHeight = 0;
  var themeBordersHeight = 0;

  // Close Button in Fixed Section
  $(".neuron-fixed-hidden-yes--close-button").append(
    '<a class="a-close-button" href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></a>'
  );

  $(
    ".neuron-fixed-hidden-yes.neuron-fixed-hidden-yes--close-button .a-close-button"
  ).on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    $(".neuron-fixed-hidden-yes").removeClass("active");
  });

  // Adminbar
  $("#wpadminbar").addClass("neuron-wpadminbar");

  function neuronSetAdminbarHeight() {
    if ($("#wpadminbar").length) {
      adminbarHeight = $("#wpadminbar").outerHeight();
    }
  }

  // Top Header Height
  function neuronSetTopHeaderHeight() {
    if ($(".m-primary-top-header").length) {
      topHeaderHeight = $(".m-primary-top-header").outerHeight();
      $(".l-primary-header--sticky, .l-primary-header--absolute").css(
        "top",
        topHeaderHeight + "px"
      );
      if (
        $(".l-primary-header--default-wrapper").hasClass(
          "l-primary-header--sticky"
        )
      ) {
        $(".l-primary-header").css("top", topHeaderHeight + "px");
      }
    }
  }

  // Parallax Footer
  function neuronParallaxFooter() {
    if ($("body").hasClass("h-parallax-footer")) {
      var $footer = $("footer"),
        $mainWrapper = $(".l-theme-wrapper .l-main-wrapper"),
        footerHeight;

      $footer.css("display", "block");

      if ($footer.length && $mainWrapper.length) {
        footerHeight = $footer.innerHeight();

        $mainWrapper.css("position", "relative");
        $mainWrapper.css("z-index", "1");
        $mainWrapper.css(
          "margin-bottom",
          footerHeight + themeBordersHeight + "px"
        );
      }
    }
  }

  // Theme Borders Height
  function neuronSetThemeBordersHeight() {
    if ($(".l-theme-borders").length) {
      themeBordersHeight = $(".l-theme-borders__top").outerHeight();
    }
  }

  // Header Height
  function neuronCalculateHeaderHeight() {
    var header, height;
    header = mobileHeaderWrapper.is(":visible")
      ? mobileHeaderWrapper
      : headerWrapper;

    height = header.find(".l-primary-header").outerHeight();

    header.height(height);

    if (height > 0) headerHeight = height;

    if (header.hasClass("l-primary-header--absolute")) {
      $(".o-hero__content").css("padding-top", headerHeight);
    }
  }

  // Main Wrapper Height
  function neuronSetWrapperHeight() {
    var windowHeight, wrapperHeight, footerHeight;
    windowHeight = $(window).innerHeight();
    footerHeight = $(".l-primary-footer").outerHeight();

    if (
      $(".l-primary-header--default-wrapper").hasClass(
        "l-primary-header--absolute"
      ) ||
      $(".l-primary-header--responsive-wrapper").hasClass(
        "l-primary-header--absolute"
      )
    ) {
      wrapperHeight =
        windowHeight -
        adminbarHeight -
        topHeaderHeight -
        themeBordersHeight * 2 -
        footerHeight;
      $(".l-main-wrapper").css("min-height", wrapperHeight);
    } else {
      wrapperHeight =
        windowHeight -
        adminbarHeight -
        topHeaderHeight -
        themeBordersHeight * 2 -
        headerHeight -
        footerHeight;
      $(".l-main-wrapper").css("min-height", wrapperHeight);
    }
  }

  // Error 404 Height
  function neuronSetErrorHeight() {
    var windowHeight, errorHeight;
    windowHeight = $(window).innerHeight();

    if (
      $(".l-primary-header--default-wrapper").hasClass(
        "l-primary-header--absolute"
      ) ||
      $(".l-primary-header--responsive-wrapper").hasClass(
        "l-primary-header--absolute"
      )
    ) {
      errorHeight = windowHeight - adminbarHeight - topHeaderHeight;
      $(".t-404 .o-hero").css("height", errorHeight);
    } else {
      errorHeight =
        windowHeight - adminbarHeight - topHeaderHeight - headerHeight;
      $(".t-404 .o-hero").css("height", errorHeight);
    }
  }

  // Init Adminbar Height
  neuronSetAdminbarHeight();

  // Init Theme Borders Height
  neuronSetThemeBordersHeight();

  // Init Top Header Height
  neuronSetTopHeaderHeight();

  // Init Header Height
  neuronCalculateHeaderHeight();

  // Init Main Wrapper Height
  neuronSetWrapperHeight();

  // Init Error 404 Height
  neuronSetErrorHeight();

  // Parallax Fooer
  neuronParallaxFooter();

  if (
    $(".l-primary-header--responsive-wrapper").hasClass(
      "l-primary-header--sticky"
    )
  ) {
    $("l-primary-header").css("top", topHeaderHeight + "px");
  }

  // Submenu overflow calculations & toggle class active
  var timeout;
  $(
    ".m-nav-menu--horizontal li.menu-item-has-children, .l-primary-header__holder li.menu-item-has-children"
  ).on({
    mouseenter: function () {
      clearTimeout(timeout);

      var subMenu = $(this).children(".sub-menu"),
        parentSubMenu = $(this).parents(".sub-menu"),
        windowWidth = $(window).width();

      if (
        (parentSubMenu.length && parentSubMenu.hasClass("sub-menu--left")) ||
        windowWidth - (subMenu.offset().left + subMenu.outerWidth() + 1) < 0
      ) {
        subMenu.addClass("sub-menu--left");
      }

      subMenu.addClass("active");
    },
    mouseleave: function () {
      var subMenu = $(this).children(".sub-menu");
      subMenu.removeClass("active");

      timeout = setTimeout(
        function () {
          subMenu.removeClass("sub-menu-left");
        }.bind(this),
        250
      );
    },
  });

  // Disable link
  $(".menu-item.disabled > a").on("click", function (e) {
    e.preventDefault();
  });

  // Mega Menu
  if ($(".menu-item").hasClass("m-mega-menu")) {
    $(".m-nav-menu--horizontal ul").addClass("m-mega-menu-holder");
  }

  // Responsive header
  $(
    '<a href="#" class="menu-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg></a>'
  ).insertAfter(
    ".l-primary-header--responsive__nav .menu-item-has-children > a, .m-nav-menu--vertical ul .menu-item-has-children > a"
  );

  $(".l-primary-header--responsive__icon").on("click", function (e) {
    e.stopPropagation();
    e.preventDefault();

    $(".l-primary-header--responsive__nav").toggleClass("active");
    $(
      ".l-primary-header--responsive__nav .menu-item-has-children > .menu-item-icon"
    ).removeClass("active");
    $(".l-primary-header--responsive__nav").find(".sub-menu").slideUp("fast");
  });

  $(
    ".l-primary-header--responsive__nav .menu-item-has-children > .menu-item-icon, .m-nav-menu--vertical ul .menu-item-has-children > .menu-item-icon"
  ).on("click", function (e) {
    e.stopPropagation();
    e.preventDefault();

    $(this).toggleClass("active");

    var $subMenu = $(this).next("ul");

    var $menuItems = $(this).closest("ul").children("li");

    $menuItems.find(".sub-menu").not($subMenu).slideUp("fast");
    $menuItems.find(".menu-item-icon").not(this).removeClass("active");
    $subMenu.slideToggle("fast");
  });

  // Site search
  //
  $(".m-site-search-holder").each(function () {
    var $parent = $(this);

    $(this)
      .find(".a-site-search-icon")
      .on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        $parent.find(".m-site-search").addClass("active");

        $parent.find(".m-site-search").addClass("active");

        setTimeout(function () {
          $parent.find(".m-site-search__form__input").focus();
        }, 300);
      });

    $parent
      .find(".m-site-search__close-icon, .m-site-search__overlay")
      .on("click", function () {
        $parent.find(".m-site-search").removeClass("active");
      });
  });

  $(document).on("bind keydown", function (e) {
    if (e.which == 27) {
      $(".m-site-search").removeClass("active");
    }
  });

  // Slidingbar
  $(".a-slidingbar-icon").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    $(".o-slidingbar").addClass("active");
  });

  $(".o-slidingbar__close-icon, .o-slidingbar__overlay").on(
    "click",
    function () {
      $(".o-slidingbar").removeClass("active");
    }
  );

  $(document).on("bind keydown", function (e) {
    if (e.which == 27) {
      $(".o-slidingbar").removeClass("active");
    }
  });

  // To top button
  $(window).scroll(function () {
    if ($(window).scrollTop() > 150) {
      $(".a-to-top").addClass("a-to-top--active");
    } else {
      $(".a-to-top").removeClass("a-to-top--active");
    }
  });

  $(".a-to-top").on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 500);
    return false;
  });

  // Sticky post
  $(".sticky .o-blog-post .o-blog-post__content .o-blog-post__meta").prepend(
    '<span class="o-blog-post__sticky a-separator"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bookmark"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>Sticky</span>'
  );

  // Woocommerce
  $(".woocommerce-MyAccount-navigation-link--dashboard a").append(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
  );
  $(".woocommerce-MyAccount-navigation-link--orders a").append(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-cart"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>'
  );
  $(".woocommerce-MyAccount-navigation-link--downloads a").append(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
  );
  $(".woocommerce-MyAccount-navigation-link--edit-address a").append(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>'
  );
  $(".woocommerce-MyAccount-navigation-link--edit-account a").append(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
  );
  $(".woocommerce-MyAccount-navigation-link--customer-logout a").append(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>'
  );

  // Initialize sticky sidebar
  $(
    ".p-portfolio-single--sticky-content .p-portfolio-single__content-wrapper"
  ).theiaStickySidebar({
    additionalMarginTop: 42,
  });

  // Magnificpopup
  $(".h-lightbox").magnificPopup({
    type: "image",
    delegate: ".h-lightbox-link",
    tClose: "Close (Esc)",
    tLoading: "",
    gallery: {
      enabled: true,
      tPrev: "Previous (Left arrow)",
      tNext: "Next (Right arrow)",
      tCounter: "%curr% of %total%",
    },
    image: {
      tError: "The image can not be loaded.",
    },
    iframe: {
      markup:
        '<div class="mfp-figure mfp-iframe-scaler">' +
        '<div class="mfp-close"></div>' +
        '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
        "<figcaption>" +
        '<div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div>' +
        "</figcaption>" +
        "</div>",
    },
    mainClass: "mfp-zoom-in",
    removalDelay: 300,
    callbacks: {
      elementParse: function (item) {
        // the class name
        if (item.el.data("type") == "video") {
          item.type = "iframe";
        } else {
          item.type = "image";
        }
      },
      markupParse: function (template, values, item) {
        values.title = item.el.attr("title");
      },
      open: function () {
        //overwrite default prev + next function. Add timeout for css3 crossfade animation
        $.magnificPopup.instance.next = function () {
          var self = this;
          self.wrap.removeClass("mfp-image-loaded");
          setTimeout(function () {
            $.magnificPopup.proto.next.call(self);
          }, 120);
        };
        $.magnificPopup.instance.prev = function () {
          var self = this;
          self.wrap.removeClass("mfp-image-loaded");
          setTimeout(function () {
            $.magnificPopup.proto.prev.call(self);
          }, 120);
        };
      },
      imageLoadComplete: function () {
        var self = this;
        setTimeout(function () {
          self.wrap.addClass("mfp-image-loaded");
        }, 16);
      },
    },
  });

  // Quantity Input [WooCommerce]
  jQuery(
    '<div class="quantity-nav"><div class="quantity-button quantity-up">+</div><div class="quantity-button quantity-down">-</div></div>'
  ).insertAfter(".quantity input");
  jQuery(".quantity").each(function () {
    var spinner = jQuery(this),
      input = spinner.find('input[type="number"]'),
      btnUp = spinner.find(".quantity-up"),
      btnDown = spinner.find(".quantity-down"),
      min = input.attr("min");

    btnUp.on("click", function () {
      var oldValue = parseFloat(input.val());
      var newVal = oldValue + 1;
      spinner.find("input").val(newVal);
      spinner.find("input").trigger("change");
    });

    btnDown.on("click", function () {
      var oldValue = parseFloat(input.val());
      if (oldValue <= min) {
        var newVal = oldValue;
      } else {
        var newVal = oldValue - 1;
      }

      spinner.find("input").val(newVal);
      spinner.find("input").trigger("change");
    });
  });

  // Events
  $(window).on("resize", function () {
    if ("ontouchstart" in window || navigator.maxTouchPoints) {
      return;
    }

    neuronSetAdminbarHeight();
    neuronSetTopHeaderHeight();
    neuronCalculateHeaderHeight();
    neuronSetWrapperHeight();
    neuronSetErrorHeight();
  });
});

window.onload = function () {
  var $ = jQuery;
  /**
   * Wow
   */
  var wow = new WOW();
  wow.init();

  // setTimeout(function() {
  //   /**
  //    * Loader
  //    */
  //   $('.m-site-loader').addClass('m-site-loader--loaded');
  //   wow.init();
  // }, 50);

  setTimeout(function () {
    // Header
    $(".l-primary-header--sticky .l-primary-header").headroom({
      tolerance: {
        up: 10,
        down: 40,
      },
      onTop: function () {
        $(".l-primary-header--sticky--skin .l-primary-header").addClass(
          "l-primary-header--light-skin"
        );
      },
      onNotTop: function () {
        $(".l-primary-header--sticky--skin .headroom--not-top").removeClass(
          "l-primary-header--light-skin"
        );
      },
    });

    // Template Header
    $(".l-template-header--sticky").headroom({
      offset: 450,
    });
  }, 50);

  /**
   * Masonry
   */
  var $masonry = $(".masonry");

  /**
   * Pagination - Show More
   *
   * Theme uses it to paginate posts and
   * portfolio items without having to
   * reload the page, it works with ajax.
   */
  var $containers = [];

  if ($(".l-filters-holder")) {
    $(".l-filters-holder").each(function (index) {
      $containers.push($(this));
    });
  }

  if ($containers) {
    $.each($containers, function (index) {
      var $selector =
        '.l-filters-holder[data-posts="' + $(this).data("posts") + '"]';
      $($selector + " #filters li").on("click", function () {
        var filterValue = $(this).attr("data-filter");

        var $masonry = $($selector + " .masonry");

        $masonry.isotope({
          filter: filterValue,
        });

        var $loadMoreButton = $(this)
          .parents($selector)
          .find(".load-more-posts");

        $loadMoreButton.data("filter", filterValue.replace(".", ""));

        if ($(this).data("all") === true) {
          $loadMoreButton.parent().hide();
        } else {
          $loadMoreButton
            .html($loadMoreButton.data("text"))
            .prop("disabled", false)
            .parent()
            .show();
        }

        $(this).addClass("active").siblings("li").removeClass("active");
      });
    });
  }

  if ($masonry.length) {
    $masonry.isotope({
      layoutMode: "packery",
      itemSelector: ".selector",
    });

    function loadMore($button) {
      var $thisMasonry = $button.parent().siblings(".masonry");
      var loadMorePosts = $button.data("text");

      var data = {};
      data.exclude = [];

      var filter = $button.data("filter");
      if (filter && filter !== "*") {
        data.filter = filter;
      }

      var filteredItems = $thisMasonry.isotope("getFilteredItemElements");

      if (filteredItems) {
        data.exclude = filteredItems.map(function (item) {
          return item.dataset.id;
        });
      }

      jQuery.ajax({
        type: "GET",
        url: window.location.href,
        data: data,
        beforeSend: function () {
          $button.addClass("a-button--loading");
          $button.html("Loading...").prop("disabled", true);
        },
        success: function (data) {
          $button.removeClass("a-button--loading");
          var $masonryElement = jQuery(data).find(
            '.masonry[data-masonry-id="' +
              $thisMasonry.data("masonry-id") +
              '"]'
          );

          var $data = $masonryElement.find(".selector");
          var $hasMore = $masonryElement
            .siblings(".load-more-posts-holder")
            .find(".load-more-posts").length;

          if ($data.length > 0) {
            $button.html(loadMorePosts).prop("disabled", false);

            $thisMasonry.append($data);

            $thisMasonry.isotope("appended", $data);

            wow.sync();
          }

          if (!$hasMore) {
            $button.parent().hide();

            var filterClass = filter ? "." + filter : "*";

            if (filterClass == "*") {
              $button
                .parents(".l-posts-wrapper")
                .find("li")
                .attr("data-all", true);
            } else {
              $button
                .parents(".l-posts-wrapper")
                .find('li[data-filter="' + filterClass + '"]')
                .attr("data-all", true);
            }
          }
        },
        error: function () {
          $button.html("No More Posts");
        },
      });
    }

    $(".load-more-posts").on("click", function (e) {
      e.preventDefault();

      loadMore($(this));
    });

    window.dispatchEvent(new Event("resize"));
  }

  $("#filters li").on("click", function () {
    setTimeout(function () {
      window.dispatchEvent(new Event("resize"));
    }, 400);
  });

  /**
   * FitRows
   */
  var $fitRows = $(".fitRows");
  var $fitRowsMasonry = $(".fitRows.masonry");
  if ($fitRows.length) {
    $fitRowsMasonry.isotope("destroy");

    $fitRows.isotope({
      layoutMode: "fitRows",
      itemSelector: ".selector",
    });
  }
};
