jQuery(function ($) {
  "use strict";

  var pluginInstallationData = {
    selectedImportID: null,
    $itemContainer: null,
    requiredPlugins: [],
  };

  /**
   * ---------------------------------------
   * ------------- Events ------------------
   * ---------------------------------------
   */

  /**
   * No or Single predefined demo import button click.
   */
  $(".js-ocdi-import-data").on("click", function () {
    // Reset response div content.
    $(".js-ocdi-ajax-response").empty();

    var selectedImportID = $("#ocdi__demo-import-files").val();
    checkRequiredPlugins(selectedImportID);
  });

  /**
   * Grid Layout import button click.
   */
  $(".js-ocdi-gl-import-data").on("click", function (e) {
    e.preventDefault();
    var selectedImportID = $(this).val();
    var $itemContainer = $(this).closest(".js-ocdi-gl-item");

    pluginInstallationData.$itemContainer = $itemContainer;
    pluginInstallationData.selectedImportID = selectedImportID;

    checkRequiredPlugins(selectedImportID, $itemContainer);
  });

  /**
   * Grid Layout categories navigation - Filter buttons.
   */
  (function () {
    $(".ocdi-filter-item").on("click", function (event) {
      event.preventDefault();

      // Remove 'active' class from all filter items.
      $(".ocdi-filter-item").removeClass("active");

      // Add the 'active' class to clicked item.
      $(this).addClass("active");

      var category = $(this).data("filter").toString().toLowerCase();

      $(".ocdi__gl-item").each(function () {
        var itemCategories = $(this).data("categories").toString().toLowerCase();
        // Check if item has the selected category (categories can be comma-separated)
        if (category !== "all" && itemCategories.indexOf(category) === -1) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
    });
  })();

  /**
   * Grid Layout categories navigation - Select dropdown (fallback).
   */
  (function () {
    $("select[name=demo-importer-filters]").on("change", function (event) {
      event.preventDefault();

      var category = $(this).children("option:selected").val().slice(1).toLowerCase();

      $(".ocdi__gl-item").each(function () {
        var itemCategories = $(this).data("categories").toString().toLowerCase();
        // Check if item has the selected category (categories can be comma-separated)
        if (category !== "all" && itemCategories.indexOf(category) === -1) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });

      if (category == "all") {
        $(".ocdi__gl-item").show();
      }
    });
  })();

  /**
   * Grid Layout search functionality.
   */
  $(".neuron-admin__demo-importer--search input").on("keyup", function (event) {
    if (0 < $(this).val().length) {
      // Hide all items.
      $(".ocdi__gl-item-container").find(".js-ocdi-gl-item").hide();

      // Show just the ones that have a match on the import name.
      $(".ocdi__gl-item-container")
        .find(
          '.js-ocdi-gl-item[data-name*="' + $(this).val().toLowerCase() + '"]'
        )
        .show();
    } else {
      $(".ocdi__gl-item-container").find(".js-ocdi-gl-item").show();
    }
  });

  /**
   * Check if selected demo requires plugins
   */
  function checkRequiredPlugins(selectedImportID, $itemContainer) {
    // First, reset import state to allow fresh import (important for re-imports)
    $.ajax({
      method: "POST",
      url: ocdi.ajax_url,
      data: {
        action: "ocdi_reset_import_state",
        security: ocdi.ajax_nonce,
      },
    }).always(function() {
      // Then proceed to check required plugins
      checkRequiredPluginsAfterReset(selectedImportID, $itemContainer);
    });
  }

  /**
   * Check required plugins after resetting import state
   */
  function checkRequiredPluginsAfterReset(selectedImportID, $itemContainer) {
    $.ajax({
      method: "POST",
      url: ocdi.ajax_url,
      data: {
        action: "ocdi_check_required_plugins",
        security: ocdi.ajax_nonce,
        selected: selectedImportID,
      },
      beforeSend: function () {
        if ($itemContainer && $itemContainer.length) {
          $itemContainer.find(".js-ocdi-gl-import-data").addClass("loading");
          $itemContainer
            .find(".js-ocdi-gl-import-data")
            .find("span:not(.ab-icon)")
            .text("Checking plugins...");
        }
      },
    })
      .done(function (response) {
        if (response.success && response.data.plugins.length > 0) {
          pluginInstallationData.requiredPlugins = response.data.plugins;
          pluginInstallationData.selectedImportID = selectedImportID;

          // Check if all plugins are active
          var allActive = response.data.plugins.every(function (plugin) {
            return plugin.status === "active";
          });

          if (allActive) {
            // All plugins are active, show progress popup and proceed with import
            showImportProgress();
            proceedWithImport(selectedImportID, $itemContainer);
          } else {
            // Show plugin installation popup
            showPluginPopup(response.data);
          }
        } else {
          // No plugins required, show progress popup and proceed with import
          showImportProgress();
          proceedWithImport(selectedImportID, $itemContainer);
        }
      })
      .fail(function (error) {
        console.error("Error checking plugins:", error);
        if ($itemContainer && $itemContainer.length) {
          $itemContainer.find(".js-ocdi-gl-import-data").removeClass("loading");
          $itemContainer
            .find(".js-ocdi-gl-import-data")
            .find("span:not(.ab-icon)")
            .text("Import");
        }
      });
  }

  /**
   * Capitalize plugin name
   */
  function capitalizePluginName(name) {
    return name
      .split(/[\s-_]+/)
      .map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  /**
   * Show plugin installation popup
   */
  function showPluginPopup(data) {
    // Remove existing popup
    $("#ocdi-plugin-popup").remove();

    var pluginsList = "";
    data.plugins.forEach(function (plugin) {
      var statusClass = plugin.status;
      var statusText =
        plugin.status === "active"
          ? "Active"
          : plugin.status === "installed"
          ? "Installed"
          : "Not Installed";

      var pluginName = capitalizePluginName(plugin.name);

      var installButton =
        plugin.status === "not_installed"
          ? '<button class="button button-primary ocdi-install-plugin" data-slug="' +
            plugin.slug +
            '" data-path="' +
            plugin.path +
            '" data-external="' +
            (plugin.external_path || "") +
            '">Install</button>'
          : '<button class="button" disabled>Installed</button>';

      var activateButton =
        plugin.status === "installed"
          ? '<button class="button button-primary ocdi-activate-plugin" data-path="' +
            plugin.path +
            '">Activate</button>'
          : plugin.status === "active"
          ? '<button class="button" disabled>Active</button>'
          : '<button class="button" disabled>Activate</button>';

      pluginsList +=
        '<div class="ocdi-plugin-item" data-status="' +
        statusClass +
        '">' +
        '<div class="ocdi-plugin-info">' +
        '<span class="ocdi-plugin-name">' +
        pluginName +
        "</span>" +
        '<span class="ocdi-plugin-status ocdi-status-' +
        statusClass +
        '">' +
        statusText +
        "</span>" +
        "</div>" +
        '<div class="ocdi-plugin-actions">' +
        installButton +
        activateButton +
        "</div>" +
        '<div class="ocdi-plugin-message"></div>' +
        "</div>";
    });

    var popupHtml =
      '<div id="ocdi-plugin-popup" class="ocdi-popup-overlay">' +
      '<div class="ocdi-popup-content">' +
      '<div class="ocdi-popup-header">' +
      '<h2>Required Plugins for ' +
      data.demo_name +
      "</h2>" +
      '<button class="ocdi-popup-close">&times;</button>' +
      "</div>" +
      '<div class="ocdi-popup-body">' +
      "<p>This demo requires the following plugins. Please install and activate them before proceeding with the import.</p>" +
      '<div class="ocdi-plugins-list">' +
      pluginsList +
      "</div>" +
      "</div>" +
      '<div class="ocdi-popup-footer">' +
      '<button class="button button-large button-primary ocdi-install-activate-all">Install & Activate All</button>' +
      '<button class="button button-large ocdi-proceed-import" disabled>Proceed with Import</button>' +
      '<button class="button button-large ocdi-cancel-import">Cancel</button>' +
      "</div>" +
      "</div>" +
      "</div>";

    $("body").append(popupHtml);

    // Check if all plugins are ready
    updateProceedButton();
    updateInstallAllButton();

    // Bind events
    bindPopupEvents();
  }

  /**
   * Update Install & Activate All button visibility
   */
  function updateInstallAllButton() {
    var allActive = true;
    $(".ocdi-plugin-item").each(function () {
      if ($(this).attr("data-status") !== "active") {
        allActive = false;
        return false;
      }
    });

    if (allActive) {
      $(".ocdi-install-activate-all").hide();
    } else {
      $(".ocdi-install-activate-all").show();
    }
  }

  /**
   * Bind popup events
   */
  function bindPopupEvents() {
    // Close popup
    $(document).on(
      "click",
      ".ocdi-popup-close, .ocdi-cancel-import",
      function () {
        $("#ocdi-plugin-popup").fadeOut(300, function () {
          $(this).remove();
        });

        // Reset loading state
        if (
          pluginInstallationData.$itemContainer &&
          pluginInstallationData.$itemContainer.length
        ) {
          pluginInstallationData.$itemContainer
            .find(".js-ocdi-gl-import-data")
            .removeClass("loading");
          pluginInstallationData.$itemContainer
            .find(".js-ocdi-gl-import-data")
            .find("span:not(.ab-icon)")
            .text("Import");
        }
      }
    );

    // Install plugin
    $(document).on("click", ".ocdi-install-plugin", function () {
      var $button = $(this);
      var $pluginItem = $button.closest(".ocdi-plugin-item");
      var $message = $pluginItem.find(".ocdi-plugin-message");

      var slug = $button.data("slug");
      var path = $button.data("path");
      var external = $button.data("external");

      $button.prop("disabled", true).text("Installing...");
      $message.html(
        '<span class="ocdi-loading">Installing plugin...</span>'
      );

      $.ajax({
        method: "POST",
        url: ocdi.ajax_url,
        data: {
          action: "ocdi_install_plugin",
          security: ocdi.ajax_nonce,
          slug: slug,
          path: path,
          external_path: external,
        },
      })
        .done(function (response) {
          if (response.success) {
            $button.text("Installed").removeClass("button-primary").prop("disabled", true);
            $pluginItem.attr("data-status", "installed");
            $pluginItem
              .find(".ocdi-plugin-status")
              .removeClass("ocdi-status-not_installed")
              .addClass("ocdi-status-installed")
              .text("Installed");
            $message.html(
              '<span class="ocdi-success">✓ ' +
                response.data.message +
                "</span>"
            );

            // Replace activate button with enabled version
            var $activateButton = $pluginItem.find("button").filter(function() {
              return $(this).text().trim() === "Activate";
            });

            if ($activateButton.length) {
              $activateButton.replaceWith(
                '<button class="button button-primary ocdi-activate-plugin" data-path="' +
                  path +
                  '">Activate</button>'
              );
            }

            updateProceedButton();
          } else {
            $button.prop("disabled", false).text("Install");
            $message.html(
              '<span class="ocdi-error">✗ ' +
                response.data.message +
                "</span>"
            );
          }
        })
        .fail(function (error) {
          $button.prop("disabled", false).text("Install");
          $message.html(
            '<span class="ocdi-error">✗ Installation failed. Please try again.</span>'
          );
          console.error("Plugin installation error:", error);
        });
    });

    // Activate plugin
    $(document).on("click", ".ocdi-activate-plugin", function () {
      var $button = $(this);
      var $pluginItem = $button.closest(".ocdi-plugin-item");
      var $message = $pluginItem.find(".ocdi-plugin-message");

      var path = $button.data("path");

      $button.prop("disabled", true).text("Activating...");
      $message.html(
        '<span class="ocdi-loading">Activating plugin...</span>'
      );

      $.ajax({
        method: "POST",
        url: ocdi.ajax_url,
        data: {
          action: "ocdi_activate_plugin",
          security: ocdi.ajax_nonce,
          path: path,
        },
      })
        .done(function (response) {
          if (response.success) {
            $button.text("Active").removeClass("button-primary");
            $pluginItem.attr("data-status", "active");
            $pluginItem
              .find(".ocdi-plugin-status")
              .removeClass("ocdi-status-installed")
              .addClass("ocdi-status-active")
              .text("Active");
            $message.html(
              '<span class="ocdi-success">✓ ' +
                response.data.message +
                "</span>"
            );

            updateProceedButton();
          } else {
            $button.prop("disabled", false).text("Activate");
            $message.html(
              '<span class="ocdi-error">✗ ' +
                response.data.message +
                "</span>"
            );
          }
        })
        .fail(function (error) {
          $button.prop("disabled", false).text("Activate");
          $message.html(
            '<span class="ocdi-error">✗ Activation failed. Please try again.</span>'
          );
          console.error("Plugin activation error:", error);
        });
    });

    // Install & Activate All button
    $(document).on("click", ".ocdi-install-activate-all", function () {
      var $button = $(this);
      $button.prop("disabled", true).text("Processing...");

      // Get all plugins that need installation or activation
      var $pluginItems = $(".ocdi-plugin-item");
      var pluginsToProcess = [];

      $pluginItems.each(function () {
        var $item = $(this);
        var status = $item.attr("data-status");
        if (status !== "active") {
          pluginsToProcess.push($item);
        }
      });

      if (pluginsToProcess.length === 0) {
        $button.prop("disabled", false).text("Install & Activate All");
        return;
      }

      // Process plugins sequentially
      processNextPlugin(pluginsToProcess, 0, $button);
    });

    // Proceed with import
    $(document).on("click", ".ocdi-proceed-import", function () {
      if (!$(this).prop("disabled")) {
        // Transform popup to show progress
        showImportProgress();

        proceedWithImport(
          pluginInstallationData.selectedImportID,
          pluginInstallationData.$itemContainer
        );
      }
    });
  }

  /**
   * Process plugins sequentially
   */
  function processNextPlugin(plugins, index, $button) {
    if (index >= plugins.length) {
      // All done
      $button.text("All Plugins Ready!").removeClass("button-primary");
      setTimeout(function () {
        $button.hide();
      }, 1500);
      return;
    }

    var $pluginItem = plugins[index];
    var status = $pluginItem.attr("data-status");

    if (status === "not_installed") {
      // Install first
      var $installBtn = $pluginItem.find(".ocdi-install-plugin");
      if ($installBtn.length) {
        $installBtn.trigger("click");

        // Wait for installation to complete, then activate
        var checkInstallation = setInterval(function () {
          if ($pluginItem.attr("data-status") === "installed") {
            clearInterval(checkInstallation);

            // Now activate
            setTimeout(function () {
              var $activateBtn = $pluginItem.find(".ocdi-activate-plugin");
              if ($activateBtn.length) {
                $activateBtn.trigger("click");

                // Wait for activation
                var checkActivation = setInterval(function () {
                  if ($pluginItem.attr("data-status") === "active") {
                    clearInterval(checkActivation);
                    // Process next plugin
                    setTimeout(function () {
                      processNextPlugin(plugins, index + 1, $button);
                    }, 500);
                  }
                }, 500);
              }
            }, 500);
          }
        }, 500);
      }
    } else if (status === "installed") {
      // Just activate
      var $activateBtn = $pluginItem.find(".ocdi-activate-plugin");
      if ($activateBtn.length) {
        $activateBtn.trigger("click");

        // Wait for activation
        var checkActivation = setInterval(function () {
          if ($pluginItem.attr("data-status") === "active") {
            clearInterval(checkActivation);
            // Process next plugin
            setTimeout(function () {
              processNextPlugin(plugins, index + 1, $button);
            }, 500);
          }
        }, 500);
      }
    } else {
      // Already active, skip to next
      processNextPlugin(plugins, index + 1, $button);
    }
  }

  /**
   * Update proceed button state
   */
  function updateProceedButton() {
    var allActive = true;
    $(".ocdi-plugin-item").each(function () {
      if ($(this).attr("data-status") !== "active") {
        allActive = false;
        return false;
      }
    });

    if (allActive) {
      $(".ocdi-proceed-import").prop("disabled", false);
      updateInstallAllButton();
    } else {
      $(".ocdi-proceed-import").prop("disabled", true);
    }
  }

  /**
   * Show import progress bar
   */
  function showImportProgress() {
    var $popup = $("#ocdi-plugin-popup");

    // If popup doesn't exist, create it
    if ($popup.length === 0) {
      var popupHtml =
        '<div id="ocdi-plugin-popup" class="ocdi-popup-overlay">' +
        '<div class="ocdi-popup-content">' +
        '<div class="ocdi-popup-header">' +
        '<h2>Importing Demo Content</h2>' +
        '<button class="ocdi-popup-close" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="ocdi-popup-body"></div>' +
        '<div class="ocdi-popup-footer"></div>' +
        '</div>' +
        '</div>';

      $("body").append(popupHtml);
      $popup = $("#ocdi-plugin-popup");

      // Bind close button
      $(document).on("click", ".ocdi-popup-close", function () {
        $("#ocdi-plugin-popup").fadeOut(300, function () {
          $(this).remove();
        });
      });
    }

    var $popupBody = $popup.find(".ocdi-popup-body");
    var $popupFooter = $popup.find(".ocdi-popup-footer");

    // Update header
    $popup.find(".ocdi-popup-header h2").text("Importing Demo Content");

    // Replace body content with progress bar
    $popupBody.html(
      '<div class="ocdi-import-progress-wrapper">' +
      '<div class="ocdi-import-progress-info">' +
      '<p class="ocdi-import-status">Preparing import...</p>' +
      '<p class="ocdi-import-percentage">0%</p>' +
      '</div>' +
      '<div class="ocdi-progress-bar-container">' +
      '<div class="ocdi-progress-bar" style="width: 0%"></div>' +
      '</div>' +
      '<div class="ocdi-import-steps">' +
      '<div class="ocdi-step" data-step="content"><span class="ocdi-step-icon">⏳</span> Importing content...</div>' +
      '<div class="ocdi-step" data-step="widgets"><span class="ocdi-step-icon">⏳</span> Importing widgets...</div>' +
      '<div class="ocdi-step" data-step="customizer"><span class="ocdi-step-icon">⏳</span> Importing customizer settings...</div>' +
      '<div class="ocdi-step" data-step="final"><span class="ocdi-step-icon">⏳</span> Finalizing import...</div>' +
      '</div>' +
      '</div>'
    );

    // Hide footer buttons
    $popupFooter.html(
      '<button class="button button-large ocdi-close-progress" style="display:none;">Close</button>'
    );
  }

  /**
   * Update import progress
   */
  function updateImportProgress(step, percentage, status) {
    var $progressBar = $(".ocdi-progress-bar");
    var $percentage = $(".ocdi-import-percentage");
    var $status = $(".ocdi-import-status");

    // Only update if elements exist
    if ($progressBar.length) {
      // Smooth progress bar animation
      setTimeout(function() {
        $progressBar.css("width", percentage + "%");
      }, 50);
    }

    if ($percentage.length) {
      $percentage.text(percentage + "%");
    }

    if ($status.length) {
      $status.text(status);
    }

    // Update step status
    if (step) {
      $(".ocdi-step").each(function() {
        var $step = $(this);
        var stepName = $step.attr("data-step");

        if (stepName === step) {
          $step.addClass("active");
          $step.find(".ocdi-step-icon").text("⏳");
        } else if ($step.hasClass("active")) {
          $step.removeClass("active").addClass("completed");
          $step.find(".ocdi-step-icon").text("✓");
        }
      });
    }
  }

  /**
   * Complete import progress
   */
  function completeImportProgress(success) {
    if (success) {
      // First complete all steps
      updateImportProgress("final", 100, "Import completed successfully!");

      $(".ocdi-step").each(function() {
        var $step = $(this);
        if (!$step.hasClass("completed")) {
          $step.addClass("completed");
          $step.find(".ocdi-step-icon").text("✓");
        }
      });

      // Fade out the progress content
      setTimeout(function() {
        $(".ocdi-import-progress-info, .ocdi-progress-bar-container, .ocdi-import-steps").addClass("ocdi-fade-out");

        // Show success animation after fade out
        setTimeout(function() {
          var $popupBody = $(".ocdi-popup-body");
          $popupBody.html(
            '<div class="ocdi-success-animation">' +
            '<div class="ocdi-success-checkmark"></div>' +
            '</div>' +
            '<div class="ocdi-success-message">Import completed successfully!</div>'
          );

          // Show Done button
          setTimeout(function() {
            $(".ocdi-close-progress").fadeIn().text("Done");
            $(".ocdi-close-progress").on("click", function() {
              $("#ocdi-plugin-popup").fadeOut(300, function() {
                $(this).remove();
              });
            });
          }, 1200);
        }, 400);
      }, 800);
    } else {
      $(".ocdi-import-status").text("Import failed. Please try again.").css("color", "#dc3232");
      $(".ocdi-close-progress").fadeIn().text("Close");
      $(".ocdi-close-progress").on("click", function() {
        $("#ocdi-plugin-popup").fadeOut(300, function() {
          $(this).remove();
        });
      });
    }
  }

  /**
   * Proceed with demo import
   */
  function proceedWithImport(selectedImportID, $itemContainer) {
    if ($itemContainer && $itemContainer.length) {
      gridLayoutImport(selectedImportID, $itemContainer);
    } else {
      // Standard import
      var data = new FormData();

      data.append("action", "ocdi_import_demo_data");
      data.append("security", ocdi.ajax_nonce);
      data.append("selected", selectedImportID);

      if ($("#ocdi__content-file-upload").length) {
        data.append("content_file", $("#ocdi__content-file-upload")[0].files[0]);
      }

      if ($("#ocdi__widget-file-upload").length) {
        data.append("widget_file", $("#ocdi__widget-file-upload")[0].files[0]);
      }

      if ($("#ocdi__customizer-file-upload").length) {
        data.append(
          "customizer_file",
          $("#ocdi__customizer-file-upload")[0].files[0]
        );
      }

      ajaxCall(data);
    }
  }

  function gridLayoutImport(selectedImportID, $itemContainer) {
    // Importing
    $itemContainer.find(".js-ocdi-gl-import-data").addClass("loading");

    $itemContainer
      .find(".js-ocdi-gl-import-data")
      .find("span:not(.ab-icon)")
      .text("Importing");

    // Prepare data for the AJAX call
    var data = new FormData();
    data.append("action", "ocdi_import_demo_data");
    data.append("security", ocdi.ajax_nonce);
    data.append("selected", selectedImportID);

    // AJAX call to import everything (content, widgets, before/after setup)
    ajaxCall(data, $itemContainer);
  }

  /**
   * The main AJAX call, which executes the import process.
   *
   * @param FormData data The data to be passed to the AJAX call.
   */
  function ajaxCall(data, $itemContainer = "") {
    var $ = jQuery;

    $.ajax({
      method: "POST",
      url: ocdi.ajax_url,
      data: data,
      contentType: false,
      processData: false,
      beforeSend: function () {
        console.log("OCDI: Starting import AJAX call");

        // Update progress if popup exists - initial state
        if ($("#ocdi-plugin-popup").length) {
          var action = data.get("action");
          if (action === "ocdi_import_demo_data") {
            updateImportProgress("content", 25, "Importing content...");
          }
        }
      },
    })
      .done(function (response) {
        console.log("OCDI: Response received", response);

        if (
          "undefined" !== typeof response.status &&
          "newAJAX" === response.status
        ) {
          console.log("OCDI: Continuing with new AJAX call");

          // Update to widgets step
          if ($("#ocdi-plugin-popup").length) {
            updateImportProgress("widgets", 50, "Importing widgets...");
          }
          ajaxCall(data, $itemContainer);
        } else if (
          "undefined" !== typeof response.status &&
          "customizerAJAX" === response.status
        ) {
          console.log("OCDI: Starting customizer import");

          // Update to customizer step
          if ($("#ocdi-plugin-popup").length) {
            updateImportProgress("customizer", 70, "Importing customizer settings...");
          }

          // Fix for data.set and data.delete, which they are not supported in some browsers.
          var newData = new FormData();
          newData.append("action", "ocdi_import_customizer_data");
          newData.append("security", ocdi.ajax_nonce);

          // Set the wp_customize=on only if the plugin filter is set to true.
          if (true === ocdi.wp_customize_on) {
            newData.append("wp_customize", "on");
          }

          ajaxCall(newData, $itemContainer);
        } else if (
          "undefined" !== typeof response.status &&
          "afterAllImportAJAX" === response.status
        ) {
          console.log("OCDI: Running after import actions");

          // Update to final step
          if ($("#ocdi-plugin-popup").length) {
            updateImportProgress("final", 90, "Finalizing import...");
          }

          // Fix for data.set and data.delete, which they are not supported in some browsers.
          var newData = new FormData();
          newData.append("action", "ocdi_after_import_data");
          newData.append("security", ocdi.ajax_nonce);
          ajaxCall(newData, $itemContainer);
        } else if ("undefined" !== typeof response.message) {
          console.log("OCDI: Import completed successfully");

          // Complete progress bar
          if ($("#ocdi-plugin-popup").length) {
            completeImportProgress(true);
          }

          // Trigger custom event, when OCDI import is complete.
          $(document).trigger("ocdiImportComplete");

          // Reset loading state
          $(".js-ocdi-gl-import-data").removeClass("loading");

          // Show success message
          if ($itemContainer && $itemContainer.length) {
            $itemContainer
              .find(".js-ocdi-gl-import-data")
              .find("span:not(.ab-icon)")
              .text("Imported");
          }
        } else {
          console.error("OCDI: Unexpected response format", response);

          // Show error in progress bar if exists
          if ($("#ocdi-plugin-popup").length) {
            completeImportProgress(false);
          }

          // Reset button state
          if ($itemContainer && $itemContainer.length) {
            $itemContainer.find(".js-ocdi-gl-import-data").removeClass("loading");
            $itemContainer
              .find(".js-ocdi-gl-import-data")
              .find("span:not(.ab-icon)")
              .text("Import");
          }
        }
      })
      .fail(function (error) {
        console.error("OCDI: Import failed", error);

        // Show error in progress bar if exists
        if ($("#ocdi-plugin-popup").length) {
          completeImportProgress(false);
        }

        // Reset button state on error
        if ($itemContainer && $itemContainer.length) {
          $itemContainer.find(".js-ocdi-gl-import-data").removeClass("loading");
          $itemContainer
            .find(".js-ocdi-gl-import-data")
            .find("span:not(.ab-icon)")
            .text("Import Failed - Retry");
        }
      });
  }
});
