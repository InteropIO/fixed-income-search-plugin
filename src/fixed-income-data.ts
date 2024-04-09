export interface FixedIncomeInstrument {
  isin: string;
  description: string;
  ticker: string;
  LEI: string;
  industry: string;
  currency?: string;
  instrumentType: 'fund' | 'fixedIncome'
}

export interface FixedIncomeOrder {
  OrderId: string
}

export const FIXED_INCOME_WORKSPACE = "Buy-side Fixed Income"

export const fixedIncomeInstruments: FixedIncomeInstrument[] = [
  {
    isin: 'XS1782803503',
    ticker: 'SHBASS',
    currency: 'EUR',
    description: 'Svenska Handelsbanken AB',
    LEI: 'NHBDILHZTYCNBV5UYZ31',
    industry: 'Major Banks',
    instrumentType: 'fixedIncome'
  },
  {
    isin: 'XS1794344827',
    ticker: 'DNBNO',
    currency: 'EUR',
    description: 'DNB Bank ASA',
    LEI: '549300GKFG0RYRRQ1414',
    industry: 'Major Banks',
    instrumentType: 'fixedIncome'
  },
  {
    isin: 'XS2250008245',
    ticker: 'MS',
    currency: 'EUR',
    description: 'Morgan Stanley',
    LEI: 'IGJSJL3JD5P30I6NJZ34',
    industry: 'Investment Banks/Brokers',
    instrumentType: 'fixedIncome'
  },
  {
    isin: 'XS2524143554',
    ticker: 'RABOBK',
    currency: 'EUR',
    description: 'Cooperatieve Rabobank UA',
    LEI: 'DG3RU1DBUFHT4ZF9WN62',
    industry: 'Regional Banks',
    instrumentType: 'fixedIncome'
  },
  {
    isin: 'FR001400E797',
    ticker: 'BPCEGP',
    currency: 'EUR',
    description: 'BPCE SA',
    LEI: '9695005MSX1OYEMGDF46',
    industry: 'Regional Banks',
    instrumentType: 'fixedIncome'
  },
  {
    isin: 'XS2432530637',
    ticker: 'SANSCF',
    currency: 'USD',
    description: 'Santander Consumer Finance SA',
    LEI: '5493000LM0MZ4JPMGM90',
    industry: 'Finance/Rental/Leasing',
    instrumentType: 'fixedIncome'
  },
  {
    isin: 'DE000BHY0SP0',
    ticker: 'BHH',
    currency: 'USD',
    description: 'Berlin Hyp AG',
    LEI: '529900C4RSSBWXBSY931',
    industry: 'Finance/Rental/Leasing',
    instrumentType: 'fixedIncome'
  },
  {
    isin: 'US172967LP48',
    ticker: 'C',
    currency: 'USD',
    description: 'Citigroup Inc.',
    LEI: '6SHGI4ZSSLCXXQSBB395',
    industry: 'Major Banks',
    instrumentType: 'fixedIncome'
  },
  {
    isin: 'ES0413900608',
    ticker: 'Santan',
    currency: 'EUR',
    description: 'Banco Santander, S.A.',
    LEI: '5493006QMFDDMYWIAM13',
    industry: 'Major Banks',
    instrumentType: 'fixedIncome'
  },
  {
    isin: 'ES0413900608',
    description:'UniCredit Bank AG',
    ticker: 'HVB',
    currency: 'EUR',
    LEI: '2ZCNRR8UK83OBTEK2170',
    industry: 'Major Banks',
    instrumentType: 'fixedIncome'
  },
  {
    isin: 'XS1796209010',
    description: 'Goldman Sachs Group, Inc.',
    LEI: '784F5XWPLTWKTBV3E584',
    ticker: 'GS',
    currency: 'USD',
    industry: 'Major Banks',
    instrumentType: 'fixedIncome'
  },
];

export const fixedIncomeOrders: FixedIncomeOrder[] = [
{
  OrderId: '1026'
}, 
{
  OrderId: '2787'
}, 
{
  OrderId: '3223'
}, 
{
  OrderId: '4409'
}, 
{
  OrderId: '4770'
}, 
{
  OrderId: '7898'
}, 
{
  OrderId: '1672'
}, 
{
  OrderId: '2451'
}, 
{
  OrderId: '3327'
}, 
{
  OrderId: '3564'
}, 
{
  OrderId: '9876'
}];
