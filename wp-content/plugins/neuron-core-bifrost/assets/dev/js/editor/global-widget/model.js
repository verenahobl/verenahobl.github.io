module.exports = elementor.modules.elements.models.Element.extend({
  initialize: function initialize() {
    this.set(
      {
        widgetType: "global",
      },
      {
        silent: true,
      }
    );
    elementor.modules.elements.models.Element.prototype.initialize.apply(
      this,
      arguments
    );
    elementorFrontend.config.elements.data[this.cid].on(
      "change",
      this.onSettingsChange.bind(this)
    );
  },
  initSettings: function initSettings() {
    var globalModel = this.getGlobalModel(),
      settingsModel = globalModel.get("settings");
    this.set("settings", settingsModel);
    elementorFrontend.config.elements.data[this.cid] = settingsModel;
    elementorFrontend.config.elements.editSettings[this.cid] = globalModel.get(
      "editSettings"
    );
  },
  initEditSettings: function initEditSettings() {
    var editSettings = new Backbone.Model(this.get("defaultEditSettings"));
    this.set("editSettings", editSettings); // Set default edit tab.

    this.get("editSettings").set("editTab", "global");
  },
  getGlobalModel: function getGlobalModel() {
    var templateID = this.get("templateID");
    return neuron.modules.globalWidget.getGlobalModels(templateID);
  },
  getTitle: function getTitle() {
    var title = this.getSetting("_title");

    if (!title) {
      title = this.getGlobalModel().get("title");
    }

    var global = neuron.translate("global");
    title = title.replace(new RegExp("\\(" + global + "\\)$"), "");
    return title + " (" + global + ")";
  },
  getIcon: function getIcon() {
    return this.getGlobalModel().getIcon();
  },
  onSettingsChange: function onSettingsChange(model) {
    if (!model.changed.elements) {
      this.set(
        "previewSettings",
        model.toJSON({
          remove: ["default"],
        }),
        {
          silent: true,
        }
      );
    }
  },
  onDestroy: function onDestroy() {
    // Can be also 'panel/editor/global'.
    if ($e.routes.isPartOf("panel/editor")) {
      $e.route("panel/elements/categories");
    }
  },
});
