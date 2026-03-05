export class UnLink extends $e.modules.editor.document.CommandHistoryBase {
  validateArgs(args) {
    this.requireContainer(args)
  }

  getHistory(args) {
    var _args$containers = args.containers,
      containers =
        _args$containers === void 0 ? [args.container] : _args$containers
    return {
      title: elementor.helpers.getModelLabel(containers[0].model),
      type: neuron.translate('unlink_widget'),
    }
  }

  apply(args) {
    var _args$containers2 = args.containers,
      containers =
        _args$containers2 === void 0 ? [args.container] : _args$containers2
    containers.forEach(function (
      /** Container */
      container
    ) {
      var globalModel = neuron.modules.globalWidget.getGlobalModels(
        container.model.get('templateID')
      )
      $e.run('document/elements/create', {
        container: container.parent,
        model: {
          id: elementorCommon.helpers.getUniqueId(),
          elType: 'widget',
          widgetType: globalModel.get('widgetType'),
          settings: elementorCommon.helpers.cloneObject(
            globalModel.get('settings').attributes
          ),
          defaultEditSettings: elementorCommon.helpers.cloneObject(
            globalModel.get('editSettings').attributes
          ),
        },
        options: {
          at: container.model.collection.indexOf(container.model),
          edit: true,
        },
      })
      $e.run('document/elements/delete', {
        container: container,
      })
    })
  }
}

export default UnLink
