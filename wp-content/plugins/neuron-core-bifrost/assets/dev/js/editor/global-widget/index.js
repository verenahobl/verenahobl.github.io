import GlobalComponent from "./component";

export default class GlobalWidget extends elementorModules.editor.utils.Module {
  __construct(args) {
    super.__construct.apply(this, args);

    this.globalModels = {};
    this.panelWidgets = null;
    this.templatesAreSaved = true;
  }

  addGlobalWidget(id, args) {
    args = _.extend({}, args, {
      categories: [],
      icon: elementor.widgetsCache[args.widgetType].icon,
      widgetType: args.widgetType,
      custom: {
        templateID: id,
      },
    });

    var globalModel = this.createGlobalModel(id, args);

    return this.panelWidgets.add(globalModel);
  }

  createGlobalModel(id, modelArgs) {
    var globalModel = new elementor.modules.elements.models.Element(modelArgs),
      settingsModel = globalModel.get("settings");

    globalModel.set("id", id);
    settingsModel.on("change", _.bind(this.onGlobalModelChange, this));

    return (this.globalModels[id] = globalModel);
  }

  onGlobalModelChange() {
    this.templatesAreSaved = false;
  }

  setWidgetType() {
    elementor.hooks.addFilter("element/view", function (DefaultView, model) {
      if (model.get("templateID")) {
        return require("./view");
      }

      return DefaultView;
    });
    elementor.hooks.addFilter("element/model", function (DefaultModel, attrs) {
      if (attrs.templateID) {
        return require("./model");
      }

      return DefaultModel;
    });
  }

  registerTemplateType() {
    elementor.templates.registerTemplateType("widget", {
      showInLibrary: false,
      saveDialog: {
        title: neuron.translate("global_widget_save_title"),
        description: neuron.translate("global_widget_save_description"),
      },
      prepareSavedData: function prepareSavedData(data) {
        data.widgetType = data.content[0].widgetType;
        return data;
      },
      ajaxParams: {
        success: this.onWidgetTemplateSaved.bind(this),
      },
    });
  }

  addSavedWidgetsToPanel() {
    var _this = this;

    this.panelWidgets = new Backbone.Collection();

    _.each(neuron.config.widget_templates, function (templateArgs, id) {
      _this.addGlobalWidget(id, templateArgs);
    });

    elementor.hooks.addFilter(
      "panel/elements/regionViews",
      function (regionViews) {
        _.extend(regionViews.global, {
          view: require("./region-views"),
          options: {
            collection: _this.panelWidgets,
          },
        });

        return regionViews;
      }
    );
  }

  addPanelPage() {
    elementor.getPanelView().addPage("globalWidget", {
      view: require("./panel-page-view"),
    });
  }

  getGlobalModels(id) {
    if (!id) {
      return this.globalModels;
    }

    return this.globalModels[id];
  }

  saveTemplates() {
    if (!Object.keys(this.globalModels).length) {
      return;
    }

    var templatesData = [];

    _.each(this.globalModels, function (templateModel, id) {
      if ("loaded" !== templateModel.get("settingsLoadedStatus")) {
        return;
      }

      var data = {
        content: JSON.stringify([
          templateModel.toJSON({
            remove: ["default"],
          }),
        ]),
        source: "local",
        type: "widget",
        id: id,
      };
      templatesData.push(data);
    });

    if (!templatesData.length) {
      return;
    }

    elementorCommon.ajax.addRequest("update_templates", {
      data: {
        templates: templatesData,
      },
      success: function success() {
        this.templatesAreSaved = true;
      },
    });
  }

  requestGlobalModelSettings(globalModel, callback, container) {
    elementor.templates.requestTemplateContent("local", globalModel.get("id"), {
      success: function success(data) {
        globalModel
          .set("settingsLoadedStatus", "loaded")
          .trigger("settings:loaded");

        var settings = data.content[0].settings,
          settingsModel = globalModel.get("settings");

        settingsModel.handleRepeaterData(settings);
        settingsModel.set(settings);

        if (container) {
          delete container.view.container;
          container.view.getContainer();
        }

        if (callback) {
          callback(globalModel);
        }
      },
    });
  }

  setWidgetContextMenuSaveAction() {
    elementor.hooks.addFilter(
      "elements/widget/contextMenuGroups",
      function (groups, widget) {
        var saveGroup = _.findWhere(groups, {
          name: "save",
        });

        if (!saveGroup) {
          return groups;
        }

        var saveAction = _.findWhere(saveGroup.actions, {
          name: "save",
        });

        saveAction.callback = widget.save.bind(widget);
        delete saveAction.shortcut;
        return groups;
      }
    );
  }

  onElementorInit() {
    var self = this;

    this.registerTemplateType();
    this.setWidgetContextMenuSaveAction();
    elementor.on("panel:init", function () {
      self.addSavedWidgetsToPanel();

      self.setWidgetType();
    });
  }

  onElementorPreviewLoaded(isFirst) {
    if (!isFirst) {
      return;
    }

    this.addPanelPage();

    $e.routes.register("panel/editor", "global", function (args) {
      elementor.getPanelView().setPage("globalWidget", "Global Editing", {
        editedView: args.view,
      });
    });
  }

  onElementorInitComponents() {
    $e.components.register(
      new GlobalComponent({
        manager: this,
      })
    );
  }

  onWidgetTemplateSaved(data) {
    elementor.templates.layout.hideModal();
    var container = $e.components
      .get("document")
      .utils.findContainerById(
        elementor.templates.layout.modalContent.currentView.model.id
      );

    $e.run("document/global/link", {
      container: container,
      data: data,
    });
  }
}
