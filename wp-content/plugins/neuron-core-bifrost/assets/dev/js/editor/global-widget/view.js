var WidgetView = elementor.modules.elements.views.Widget,
  GlobalWidgetView;

GlobalWidgetView = WidgetView.extend({
  globalModel: null,

  className: function className() {
    return (
      WidgetView.prototype.className.apply(this, arguments) +
      " elementor-global-widget elementor-global-" +
      this.model.get("templateID")
    );
  },

  initialize: function initialize() {
    var self = this,
      previewSettings = self.model.get("previewSettings"),
      globalModel = self.getGlobalModel();

    if (previewSettings) {
      globalModel
        .set("settingsLoadedStatus", "loaded")
        .trigger("settings:loaded");
      var settingsModel = globalModel.get("settings");
      settingsModel.handleRepeaterData(previewSettings);
      settingsModel.set(previewSettings, {
        silent: true,
      });
    } else {
      var globalSettingsLoadedStatus = globalModel.get("settingsLoadedStatus");

      if (!globalSettingsLoadedStatus) {
        globalModel.set("settingsLoadedStatus", "pending");
        neuron.modules.globalWidget.requestGlobalModelSettings(
          globalModel,
          null,
          this.getContainer()
        );
      }

      if ("loaded" !== globalSettingsLoadedStatus) {
        self.$el.addClass("elementor-loading");
      }

      globalModel.on("settings:loaded", function () {
        self.$el.removeClass("elementor-loading");
        self.render();
      });
    }

    WidgetView.prototype.initialize.apply(self, arguments);
  },

  getGlobalModel: function getGlobalModel() {
    if (!this.globalModel) {
      this.globalModel = neuron.modules.globalWidget.getGlobalModels(
        this.model.get("templateID")
      );
    }

    return this.globalModel;
  },

  getEditModel: function getEditModel() {
    return this.getGlobalModel();
  },

  getHTMLContent: function getHTMLContent(html) {
    if ("loaded" === this.getGlobalModel().get("settingsLoadedStatus")) {
      return WidgetView.prototype.getHTMLContent.call(this, html);
    }

    return "";
  },

  serializeModel: function serializeModel() {
    var globalModel = this.getGlobalModel();
    return globalModel.toJSON.apply(globalModel, _.rest(arguments));
  },

  unlink: function unlink() {
    $e.run("document/global/unlink", {
      container: this.getContainer(),
    });
  },

  onEditRequest: function onEditRequest() {
    $e.route("panel/editor/global", {
      view: this,
    });
  },
});

module.exports = GlobalWidgetView;
