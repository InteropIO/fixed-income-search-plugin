export interface FixedIncomeSearchPlugin {
  start: (io: any) => Promise<void>;
  version: string;
}

declare const FixedIncomeSearchPlugin: FixedIncomeSearchPlugin;

export default FixedIncomeSearchPlugin;
