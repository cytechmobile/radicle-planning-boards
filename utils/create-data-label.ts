import type { IssueStatus } from "~/types/issues";

export type DataLabelType = 'status';

export default function (type: DataLabelType, value: IssueStatus): string {
  return `RBP:${type}:${value}`;
}
