import { fixedIncomeSearchPluginFactory } from "./SearchPlugin";
import { version } from "../package.json";

const plugin = {
  start: fixedIncomeSearchPluginFactory,
  version,
};

export default plugin;
