import * as commands from "./commands/";
import * as hooks from "./hooks/";

export default class Component extends $e.modules.ComponentBase {
  getNamespace() {
    return "document/global";
  }

  defaultCommands() {
    return this.importCommands(commands);
  }

  defaultHooks() {
    return this.importHooks(hooks);
  }
}
