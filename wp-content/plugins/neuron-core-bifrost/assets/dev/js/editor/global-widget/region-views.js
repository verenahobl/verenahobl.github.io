module.exports = elementor.modules.layouts.panel.pages.elements.views.Elements.extend(
  {
    id: "elementor-global-templates",
    getEmptyView: function getEmptyView() {
      if (this.collection.length) {
        return null;
      }

      return require("./global-views");
    },
    onFilterEmpty: function onFilterEmpty() {},
  }
);
