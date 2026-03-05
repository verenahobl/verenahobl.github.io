/**
 * Neuron Popup Frontend
 *
 * Handles popup triggers, timing, and display logic.
 *
 * @since 2.5.0
 */

(function($) {
	'use strict';

	// Popup tracking
	var neuronPopup = {
		popupPopped: false
	};

	// Make available globally
	window.neuronPopup = neuronPopup;

	/**
	 * Timing Base Class
	 */
	class TimingBase {
		constructor(settings, document) {
			this.settings = settings;
			this.document = document;
		}

		getTimingSetting(key) {
			return this.settings[this.getName() + '_' + key];
		}

		getName() {
			return '';
		}

		check() {
			return true;
		}
	}

	/**
	 * Page Views Timing
	 */
	class PageViewsTiming extends TimingBase {
		getName() { return 'page_views'; }
		check() {
			var pageViews = elementorFrontend.storage.get('pageViews') || 0;
			return pageViews >= this.getTimingSetting('views');
		}
	}

	/**
	 * Sessions Timing
	 */
	class SessionsTiming extends TimingBase {
		getName() { return 'sessions'; }
		check() {
			var sessions = elementorFrontend.storage.get('sessions') || 0;
			return sessions >= this.getTimingSetting('sessions');
		}
	}

	/**
	 * Times Timing
	 */
	class TimesTiming extends TimingBase {
		getName() { return 'times'; }
		check() {
			var displayedTimes = this.document.getStorage('times') || 0;
			return displayedTimes < this.getTimingSetting('times');
		}
	}

	/**
	 * URL Timing
	 */
	class UrlTiming extends TimingBase {
		getName() { return 'url'; }
		check() {
			var referrer = document.referrer;
			var action = this.getTimingSetting('action');
			var url = this.getTimingSetting('url');

			if (!url) {
				return true;
			}

			var match = false;

			if ('regex' === action) {
				try {
					match = new RegExp(url).test(referrer);
				} catch (e) {
					match = false;
				}
			} else {
				match = referrer.indexOf(url) !== -1;
			}

			return 'hide' === action ? !match : match;
		}
	}

	/**
	 * Sources Timing
	 */
	class SourcesTiming extends TimingBase {
		getName() { return 'sources'; }
		check() {
			var sources = this.getTimingSetting('sources');
			var referrer = document.referrer;

			if (!sources || !sources.length) {
				return true;
			}

			var currentHost = location.hostname;
			var referrerHostname = '';

			try {
				referrerHostname = new URL(referrer).hostname;
			} catch (e) {
				return true;
			}

			if (referrer === '') {
				return sources.indexOf('internal') !== -1;
			}

			if (referrerHostname === currentHost) {
				return sources.indexOf('internal') !== -1;
			}

			var searchEngines = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex'];
			var isSearch = searchEngines.some(function(engine) {
				return referrerHostname.indexOf(engine) !== -1;
			});

			if (isSearch) {
				return sources.indexOf('search') !== -1;
			}

			return sources.indexOf('external') !== -1;
		}
	}

	/**
	 * Logged In Timing
	 */
	class LoggedInTiming extends TimingBase {
		getName() { return 'logged_in'; }
		check() {
			if (typeof elementorFrontendConfig !== 'undefined' && elementorFrontendConfig.user && elementorFrontendConfig.user.loggedIn) {
				return false;
			}
			return true;
		}
	}

	/**
	 * Devices Timing
	 */
	class DevicesTiming extends TimingBase {
		getName() { return 'devices'; }
		check() {
			var devices = this.getTimingSetting('devices');

			if (!devices || !devices.length) {
				return true;
			}

			var currentDevice = elementorFrontend.getCurrentDeviceMode();

			return devices.indexOf(currentDevice) !== -1;
		}
	}

	/**
	 * Popup Timing Manager
	 */
	class PopupTiming {
		constructor(settings, document) {
			this.settings = settings || {};
			this.document = document;

			this.timingClasses = {
				page_views: PageViewsTiming,
				sessions: SessionsTiming,
				times: TimesTiming,
				url: UrlTiming,
				sources: SourcesTiming,
				logged_in: LoggedInTiming,
				devices: DevicesTiming
			};
		}

		check() {
			var self = this;
			var checkPassed = true;

			$.each(this.timingClasses, function(key, TimingClass) {
				if (!self.settings[key]) {
					return;
				}

				var timing = new TimingClass(self.settings, self.document);

				if (!timing.check()) {
					checkPassed = false;
					return false;
				}
			});

			return checkPassed;
		}
	}

	/**
	 * Trigger Base Class
	 */
	class TriggerBase {
		constructor(settings, callback) {
			this.settings = settings;
			this.callback = callback;
		}

		getTriggerSetting(key) {
			return this.settings[this.getName() + '_' + key];
		}

		getName() {
			return '';
		}

		run() {}
		destroy() {}
	}

	/**
	 * Page Load Trigger
	 */
	class PageLoadTrigger extends TriggerBase {
		constructor(settings, callback) {
			super(settings, callback);
			this.timeout = null;
		}

		getName() { return 'page_load'; }

		run() {
			var self = this;
			var delay = (this.getTriggerSetting('delay') || 0) * 1000;

			this.timeout = setTimeout(function() {
				self.callback();
			}, delay);
		}

		destroy() {
			if (this.timeout) {
				clearTimeout(this.timeout);
			}
		}
	}

	/**
	 * Scrolling Trigger
	 */
	class ScrollingTrigger extends TriggerBase {
		constructor(settings, callback) {
			super(settings, callback);
			this.lastScrollY = 0;
			this.scrollHandler = null;
		}

		getName() { return 'scrolling'; }

		run() {
			var self = this;
			var direction = this.getTriggerSetting('direction') || 'down';
			var offset = this.getTriggerSetting('offset') || 50;

			this.scrollHandler = function() {
				var currentScrollY = $(window).scrollTop();
				var documentHeight = $(document).height() - $(window).height();
				var scrollPercent = (currentScrollY / documentHeight) * 100;

				if (direction === 'down') {
					if (scrollPercent >= offset) {
						self.callback();
					}
				} else if (direction === 'up') {
					if (currentScrollY < self.lastScrollY) {
						self.callback();
					}
				}

				self.lastScrollY = currentScrollY;
			};

			$(window).on('scroll.neuronPopup', this.scrollHandler);
		}

		destroy() {
			$(window).off('scroll.neuronPopup', this.scrollHandler);
		}
	}

	/**
	 * Scrolling To Element Trigger
	 */
	class ScrollingToTrigger extends TriggerBase {
		constructor(settings, callback) {
			super(settings, callback);
			this.scrollHandler = null;
		}

		getName() { return 'scrolling_to'; }

		run() {
			var self = this;
			var selector = this.getTriggerSetting('selector');

			if (!selector) {
				return;
			}

			var $element = $(selector);

			if (!$element.length) {
				return;
			}

			this.scrollHandler = function() {
				var elementTop = $element.offset().top;
				var viewportBottom = $(window).scrollTop() + $(window).height();

				if (viewportBottom >= elementTop) {
					self.callback();
				}
			};

			$(window).on('scroll.neuronPopupScrollTo', this.scrollHandler);
		}

		destroy() {
			$(window).off('scroll.neuronPopupScrollTo', this.scrollHandler);
		}
	}

	/**
	 * Click Trigger
	 */
	class ClickTrigger extends TriggerBase {
		constructor(settings, callback) {
			super(settings, callback);
			this.clickCount = 0;
			this.clickHandler = null;
		}

		getName() { return 'click'; }

		run() {
			var self = this;
			var targetClicks = this.getTriggerSetting('times') || 1;

			this.clickHandler = function() {
				self.clickCount++;

				if (self.clickCount >= targetClicks) {
					self.callback();
				}
			};

			$(document).on('click.neuronPopupClick', this.clickHandler);
		}

		destroy() {
			$(document).off('click.neuronPopupClick', this.clickHandler);
		}
	}

	/**
	 * Inactivity Trigger
	 */
	class InactivityTrigger extends TriggerBase {
		constructor(settings, callback) {
			super(settings, callback);
			this.timeout = null;
			this.activityHandler = null;
		}

		getName() { return 'inactivity'; }

		run() {
			var self = this;
			var inactivityTime = (this.getTriggerSetting('time') || 30) * 1000;

			var resetTimer = function() {
				clearTimeout(self.timeout);
				self.timeout = setTimeout(function() {
					self.callback();
				}, inactivityTime);
			};

			this.activityHandler = resetTimer;

			$(document).on('mousemove.neuronPopupInactivity keypress.neuronPopupInactivity scroll.neuronPopupInactivity', this.activityHandler);

			resetTimer();
		}

		destroy() {
			clearTimeout(this.timeout);
			$(document).off('mousemove.neuronPopupInactivity keypress.neuronPopupInactivity scroll.neuronPopupInactivity', this.activityHandler);
		}
	}

	/**
	 * Exit Intent Trigger
	 */
	class ExitIntentTrigger extends TriggerBase {
		constructor(settings, callback) {
			super(settings, callback);
			this.exitHandler = null;
		}

		getName() { return 'exit_intent'; }

		run() {
			var self = this;

			this.exitHandler = function(e) {
				if (e.clientY <= 0) {
					self.callback();
				}
			};

			$(document).on('mouseleave.neuronPopupExitIntent', this.exitHandler);
		}

		destroy() {
			$(document).off('mouseleave.neuronPopupExitIntent', this.exitHandler);
		}
	}

	/**
	 * Popup Triggers Manager
	 */
	class PopupTriggers {
		constructor(settings, document) {
			this.settings = settings || {};
			this.document = document;
			this.triggers = [];

			this.triggerClasses = {
				page_load: PageLoadTrigger,
				scrolling: ScrollingTrigger,
				scrolling_to: ScrollingToTrigger,
				click: ClickTrigger,
				inactivity: InactivityTrigger,
				exit_intent: ExitIntentTrigger
			};

			this.runTriggers();
		}

		runTriggers() {
			var self = this;

			$.each(this.triggerClasses, function(key, TriggerClass) {
				if (!self.settings[key]) {
					return;
				}

				var trigger = new TriggerClass(self.settings, function() {
					self.onTriggerFired();
				});

				trigger.run();

				self.triggers.push(trigger);
			});
		}

		destroyTriggers() {
			this.triggers.forEach(function(trigger) {
				trigger.destroy();
			});
			this.triggers = [];
		}

		onTriggerFired() {
			this.document.showModal(true);
			this.destroyTriggers();
		}
	}

	/**
	 * Popup Document Handler - ES6 Class
	 */
	class PopupDocument extends elementorModules.frontend.Document {
		bindEvents() {
			var openSelector = this.getDocumentSettings('open_selector');

			if (openSelector) {
				var self = this;
				elementorFrontend.elements.$body.on('click', openSelector, function(e) {
					e.preventDefault();
					self.showModal();
				});
			}
		}

		startTiming() {
			var timing = new PopupTiming(this.getDocumentSettings('timing'), this);

			if (timing.check()) {
				this.initTriggers();
			}
		}

		initTriggers() {
			this.triggers = new PopupTriggers(this.getDocumentSettings('triggers'), this);
		}

		showModal(avoidMultiple) {
			var settings = this.getDocumentSettings();

			if (!this.isEdit) {
				if (!elementorFrontend.isWPPreviewMode()) {
					if (this.getStorage('disable')) {
						return;
					}

					if (avoidMultiple && neuronPopup.popupPopped && settings.avoid_multiple_popups) {
						return;
					}
				}

				this.$element = $(this.elementHTML);
				this.elements.$elements = this.$element.find(this.getSettings('selectors.elements'));
			}

			var modal = this.getModal();
			var $closeButton = modal.getElements('closeButton');

			modal.setMessage(this.$element).show();

			if (!this.isEdit) {
				if (settings.close_button_delay) {
					$closeButton.hide();
					clearTimeout(this.closeButtonTimeout);
					this.closeButtonTimeout = setTimeout(function() {
						$closeButton.show();
					}, settings.close_button_delay * 1000);
				}

				super.runElementsHandlers();
			}

			this.setEntranceAnimation();

			if (!settings.timing || !settings.timing.times_count) {
				this.countTimes();
			}

			neuronPopup.popupPopped = true;
		}

		setEntranceAnimation() {
			var $widgetContent = this.getModal().getElements('widgetContent');
			var settings = this.getDocumentSettings();
			var newAnimation = elementorFrontend.getCurrentDeviceSetting(settings, 'entrance_animation');

			if (this.currentAnimation) {
				$widgetContent.removeClass(this.currentAnimation);
			}

			this.currentAnimation = newAnimation;

			if (!newAnimation) {
				return;
			}

			var $widget = $widgetContent.closest('.dialog-widget');
			if ($widget.find('.dialog-overlay').length === 0 && settings.overlay === 'yes') {
				var $overlay = $('<div class="dialog-overlay"></div>');
				$overlay.hide().appendTo($widget).show();
			}

			$widget.addClass('neuron-popup-modal--overlay-animation');

			var animationDuration = settings.entrance_animation_duration ? settings.entrance_animation_duration.size : 0.6;

			$widgetContent.addClass(newAnimation);

			setTimeout(function() {
				$widgetContent.removeClass(newAnimation);
			}, animationDuration * 1000);
		}

		setExitAnimation() {
			var self = this;
			var modal = this.getModal();
			var settings = this.getDocumentSettings();
			var $widgetContent = modal.getElements('widgetContent');
			var newAnimation = elementorFrontend.getCurrentDeviceSetting(settings, 'exit_animation');
			var animationDuration = newAnimation && settings.entrance_animation_duration ? settings.entrance_animation_duration.size : 0;

			setTimeout(function() {
				if (newAnimation) {
					$widgetContent.removeClass(newAnimation + ' h-neuron-animation--reverse');
				}

				if (!self.isEdit) {
					self.$element.remove();

					modal.getElements('widget').addClass('neuron-popup-modal-hide');

					setTimeout(function() {
						modal.getElements('widget').hide();
						modal.getElements('widget').removeClass('neuron-popup-modal-hide neuron-popup-modal--overlay-animation');
					}, animationDuration * 1000 + 1);
				}
			}, animationDuration * 1000);

			if (newAnimation) {
				$widgetContent.addClass(newAnimation + ' h-neuron-animation--reverse');
			}
		}

		initModal() {
			var self = this;
			var modal;

			this.getModal = function() {
				if (!modal) {
					var settings = self.getDocumentSettings();
					var id = self.getSettings('id');

					var triggerPopupEvent = function(eventType) {
						elementorFrontend.elements.$document.trigger('elementor/popup/' + eventType, [id, self]);
					};

					var classes = 'neuron-popup-modal';

					if (settings.classes) {
						classes += ' ' + settings.classes;
					}

					var modalProperties = {
						id: 'neuron-popup-modal-' + id,
						className: classes,
						closeButton: true,
						closeButtonClass: 'eicon-close',
						preventScroll: settings.prevent_scroll,
						onShow: function() {
							triggerPopupEvent('show');
						},
						onHide: function() {
							triggerPopupEvent('hide');
						},
						effects: {
							hide: function() {
								if (settings.timing && settings.timing.times_count) {
									self.countTimes();
								}
								self.setExitAnimation();
							},
							show: 'show'
						},
						hide: {
							auto: !!settings.close_automatically,
							autoDelay: settings.close_automatically * 1000,
							onBackgroundClick: !settings.prevent_close_on_background_click,
							onOutsideClick: !settings.prevent_close_on_background_click,
							onEscKeyPress: !settings.prevent_close_on_esc_key,
							ignore: '.flatpickr-calendar'
						},
						position: {
							enable: false
						}
					};

					modal = elementorFrontend.getDialogsManager().createWidget('lightbox', modalProperties);

					modal.getElements('widgetContent').addClass('animated');

					var $closeButton = modal.getElements('closeButton');

					if (self.isEdit) {
						$closeButton.off('click');
						modal.hide = function() {};
					}

					self.setCloseButtonPosition();
				}

				return modal;
			};
		}

		setCloseButtonPosition() {
			var modal = this.getModal();
			var closeButtonPosition = this.getDocumentSettings('close_button_position');
			var $closeButton = modal.getElements('closeButton');

			$closeButton.appendTo(modal.getElements(closeButtonPosition === 'outside' ? 'widget' : 'widgetContent'));
		}

		disable() {
			this.setStorage('disable', true);
		}

		setStorage(key, value, options) {
			elementorFrontend.storage.set('popup_' + this.getSettings('id') + '_' + key, value, options);
		}

		getStorage(key, options) {
			return elementorFrontend.storage.get('popup_' + this.getSettings('id') + '_' + key, options);
		}

		countTimes() {
			var displayTimes = this.getStorage('times') || 0;
			this.setStorage('times', displayTimes + 1);
		}

		runElementsHandlers() {}

		onInit(...args) {
			var self = this;

			super.onInit(...args);

			var initPopup = function() {
				self.initModal();

				if (self.isEdit) {
					self.showModal();
					return;
				}

				self.$element.show().remove();
				self.elementHTML = self.$element[0].outerHTML;

				if (elementorFrontend.isEditMode()) {
					return;
				}

				if (elementorFrontend.isWPPreviewMode() && elementorFrontend.config.post.id === self.getSettings('id')) {
					self.showModal();
					return;
				}

				self.startTiming();
			};

			if (!window.DialogsManager) {
				elementorFrontend.utils.assetsLoader.load('script', 'dialog').then(initPopup);
			} else {
				initPopup();
			}
		}

		onSettingsChange(model) {
			var changedKey = Object.keys(model.changed)[0];

			if (changedKey.indexOf('entrance_animation') !== -1) {
				this.setEntranceAnimation();
			}

			if (changedKey === 'exit_animation') {
				this.setExitAnimation();
			}

			if (changedKey === 'close_button_position') {
				this.setCloseButtonPosition();
			}
		}
	}

	/**
	 * Neuron Popup Module
	 */
	class NeuronPopupModule {
		constructor() {
			var self = this;

			elementorFrontend.hooks.addAction('elementor/frontend/documents-manager/init-classes', function(documentsManager) {
				documentsManager.addDocumentClass('popup', PopupDocument);
			});

			elementorFrontend.on('components:init', function() {
				elementorFrontend.utils.urlActions.addAction('popup:open', self.showPopup.bind(self));
				elementorFrontend.utils.urlActions.addAction('popup:close', self.closePopup.bind(self));
			});

			if (!elementorFrontend.isEditMode() && !elementorFrontend.isWPPreviewMode()) {
				this.setViewsAndSessions();
			}
		}

		setViewsAndSessions() {
			var pageViews = elementorFrontend.storage.get('pageViews') || 0;
			elementorFrontend.storage.set('pageViews', pageViews + 1);

			var activeSession = elementorFrontend.storage.get('activeSession', { session: true });

			if (!activeSession) {
				elementorFrontend.storage.set('activeSession', true, { session: true });

				var sessions = elementorFrontend.storage.get('sessions') || 0;
				elementorFrontend.storage.set('sessions', sessions + 1);
			}
		}

		showPopup(settings) {
			var popup = elementorFrontend.documentsManager.documents[settings.id];

			if (!popup) {
				return;
			}

			var modal = popup.getModal();

			if (settings.toggle && modal.isVisible()) {
				modal.hide();
			} else {
				popup.showModal();
			}
		}

		closePopup(settings, event) {
			var popupID = $(event.target).parents('[data-elementor-type="popup"]').data('elementorId');

			if (!popupID) {
				return;
			}

			var document = elementorFrontend.documentsManager.documents[popupID];

			document.getModal().hide();

			if (settings.do_not_show_again) {
				document.disable();
			}
		}
	}

	// Initialize on frontend ready
	$(window).on('elementor/frontend/init', function() {
		new NeuronPopupModule();
	});

})(jQuery);
