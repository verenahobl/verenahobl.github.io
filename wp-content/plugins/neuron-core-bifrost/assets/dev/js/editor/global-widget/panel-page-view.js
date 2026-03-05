module.exports = Marionette.ItemView.extend({
  id: "elementor-panel-global-widget",
  template: "#tmpl-elementor-panel-global-widget",
  ui: {
    editButton: "#elementor-global-widget-locked-edit .elementor-button",
    unlinkButton: "#elementor-global-widget-locked-unlink .elementor-button",
    loading: "#elementor-global-widget-loading",
  },
  events: {
    "click @ui.editButton": "onEditButtonClick",
    "click @ui.unlinkButton": "onUnlinkButtonClick",
  },
  initialize: function initialize() {
    this.initUnlinkDialog();
  },
  buildUnlinkDialog: function buildUnlinkDialog() {
    var self = this;
    return elementorCommon.dialogsManager.createWidget("confirm", {
      id: "elementor-global-widget-unlink-dialog",
      headerMessage: neuron.translate("unlink_widget"),
      message: neuron.translate("dialog_confirm_unlink"),
      position: {
        my: "center center",
        at: "center center",
      },
      strings: {
        confirm: neuron.translate("unlink"),
        cancel: neuron.translate("cancel"),
      },
      onConfirm: function onConfirm() {
        self.getOption("editedView").unlink();
      },
    });
  },
  initUnlinkDialog: function initUnlinkDialog() {
    var dialog;

    this.getUnlinkDialog = function () {
      if (!dialog) {
        dialog = this.buildUnlinkDialog();
      }

      return dialog;
    };
  },
  editGlobalModel: function editGlobalModel() {
    var editedView = this.getOption("editedView");
    $e.run("panel/editor/open", {
      model: editedView.getEditModel(),
      view: editedView,
    });
  },
  onEditButtonClick: function onEditButtonClick() {
    var self = this,
      editedView = self.getOption("editedView"),
      editedModel = editedView.getEditModel();

    if ("loaded" === editedModel.get("settingsLoadedStatus")) {
      self.editGlobalModel();
      return;
    }

    self.ui.loading.removeClass("elementor-hidden");
    neuron.modules.globalWidget.requestGlobalModelSettings(
      editedModel,
      function () {
        self.ui.loading.addClass("elementor-hidden");
        self.editGlobalModel();
      }
    );
  },
  onUnlinkButtonClick: function onUnlinkButtonClick() {
    this.getUnlinkDialog().show();
  },
});
