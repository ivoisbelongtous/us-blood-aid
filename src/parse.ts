import { DSVRowString } from "d3";

export interface AidRecord {
  countryCode: string;
  countryName: string;
  regionID: number;
  regionName: string;
  incomeGroupAcronym: string;
  incomeGroupName: string;
  transactionTypeID: number;
  transactionTypeName: string;
  fiscalYear: Date;
  currentAmount: number;
  constantAmount: number;
}
export type AidRecordColumns =
  | "country_code"
  | "country_name"
  | "region_id"
  | "region_name"
  | "income_group_acronym"
  | "income_group_name"
  | "transaction_type_id"
  | "transaction_type_name"
  | "fiscal_year"
  | "current_amount"
  | "constant_amount";

export const parseAidRecord = (
  rawRow: DSVRowString<AidRecordColumns>
): AidRecord => {
  return {
    countryCode: rawRow.country_code!,
    countryName: rawRow.country_name!,
    regionID: +rawRow.region_id!,
    regionName: rawRow.region_name!,
    incomeGroupAcronym: rawRow.income_group_acronym!,
    incomeGroupName: rawRow.income_group_name!,
    transactionTypeID: +rawRow.transaction_type_id!,
    transactionTypeName: rawRow.transaction_type_name!,
    fiscalYear: new Date(rawRow.fiscal_year!),
    currentAmount: +rawRow.current_amount!,
    constantAmount: +rawRow.constant_amount!
  };
};
