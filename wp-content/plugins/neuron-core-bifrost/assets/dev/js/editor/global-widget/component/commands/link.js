export class Link extends $e.modules.editor.document.CommandHistoryBase {
  validateArgs(args) {
    this.requireContainer(args)
    this.requireArgumentConstructor('data', Object, args)
    var argumentsContainers = args.containers,
      containers =
        argumentsContainers === void 0 ? [args.container] : argumentsContainers
    containers.forEach(function (
      /* Container */
      container
    ) {
      if ('global' === container.model.get('widgetType')) {
        throw Error(
          "Invalid container, id: '".concat(
            container.id,
            "' is already global."
          )
        )
      }
    })
  }

  getHistory(args) {
    var data = args.data
    return {
      title: elementor.widgetsCache[data.widgetType].title,
      subTitle: data.title,
      type: neuron.translate('linked_to_global'),
    }
  }

  apply(args) {
    var data = args.data,
      argumentsContainers = args.containers,
      containers =
        argumentsContainers === void 0 ? [args.container] : argumentsContainers
    containers.forEach(function (
      /** Container */
      container
    ) {
      var widgetModel = container.model,
        widgetModelIndex = widgetModel.collection.indexOf(widgetModel)
      data.elType = data.type
      data.settings = widgetModel.get('settings').attributes
      var globalModel = neuron.modules.globalWidget.addGlobalWidget(
          data.template_id,
          data
        ),
        globalModelAttributes = globalModel.attributes
      $e.run('document/elements/create', {
        container: container.parent,
        model: {
          id: elementorCommon.helpers.getUniqueId(),
          elType: globalModelAttributes.type,
          templateID: globalModelAttributes.template_id,
          widgetType: 'global',
        },
        options: {
          at: widgetModelIndex,
        },
      })
      $e.run('document/elements/delete', {
        container: container,
      })
    })
    $e.route('panel/elements/global')
  }
}

export default Link
