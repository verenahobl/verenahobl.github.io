export class GlobalWidgetSave extends $e.modules.hookData.After {
  getCommand() {
    return "document/save/save";
  }

  getId() {
    return "neuron-global-widget-save";
  }

  getConditions(args) {
    var argumentDocuments = args.document,
      document =
        argumentDocuments === void 0
          ? elementor.documents.getCurrent()
          : argumentDocuments;

    return (
      document.config.panel.has_elements &&
      args.status &&
      -1 !== ["private", "publish"].indexOf(args.status)
    );
  }

  apply() {
    neuron.modules.globalWidget.saveTemplates();
  }
}
