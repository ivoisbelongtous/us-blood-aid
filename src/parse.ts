import { DSVRowString } from "d3";

import tradeCodeMap from "schedule_c_country_list_ISO_code.json";

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

interface MonthlyRecords {
  january: number;
  february: number;
  march: number;
  april: number;
  may: number;
  june: number;
  july: number;
  august: number;
  september: number;
  october: number;
  november: number;
  december: number;
  total: number;
}
export interface TradeRecord {
  year: Date;
  countryCode: string;
  countryISOCode: string;
  countryName: string;
  imports: MonthlyRecords;
  exports: MonthlyRecords;
}
export type TradeRecordColumns =
  | "year"
  | "CTY_CODE"
  | "CTYNAME"
  | "IJAN"
  | "IFEB"
  | "IMAR"
  | "IAPR"
  | "IMAY"
  | "IJUN"
  | "IJUL"
  | "IAUG"
  | "ISEP"
  | "IOCT"
  | "INOV"
  | "IDEC"
  | "IYR"
  | "EJAN"
  | "EFEB"
  | "EMAR"
  | "EAPR"
  | "EMAY"
  | "EJUN"
  | "EJUL"
  | "EAUG"
  | "ESEP"
  | "EOCT"
  | "ENOV"
  | "EDEC"
  | "EYR";

export const parseTradeRecord = (
  rawRow: DSVRowString<TradeRecordColumns>
): TradeRecord => {
  return {
    year: new Date(rawRow.year!),
    countryCode: rawRow.CTY_CODE!,
    countryISOCode: (tradeCodeMap as any)[rawRow.CTY_CODE!],
    countryName: rawRow.CTYNAME!,
    imports: {
      january: +rawRow.IJAN!,
      february: +rawRow.IFEB!,
      march: +rawRow.IMAR!,
      april: +rawRow.IAPR!,
      may: +rawRow.IMAY!,
      june: +rawRow.IJUN!,
      july: +rawRow.IJUL!,
      august: +rawRow.IAUG!,
      september: +rawRow.ISEP!,
      october: +rawRow.IOCT!,
      november: +rawRow.INOV!,
      december: +rawRow.IDEC!,
      total: +rawRow.IYR!
    },
    exports: {
      january: +rawRow.EJAN!,
      february: +rawRow.EFEB!,
      march: +rawRow.EMAR!,
      april: +rawRow.EAPR!,
      may: +rawRow.EMAY!,
      june: +rawRow.EJUN!,
      july: +rawRow.EJUL!,
      august: +rawRow.EAUG!,
      september: +rawRow.ESEP!,
      october: +rawRow.EOCT!,
      november: +rawRow.ENOV!,
      december: +rawRow.EDEC!,
      total: +rawRow.EYR!
    }
  };
};
