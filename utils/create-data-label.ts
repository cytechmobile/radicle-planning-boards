import { DATA_LABEL_PREFIX, type DataLabel, type DataLabelType } from '~/constants/data-labels'
import type { IssueStatus } from '~/types/issues'

export default function (type: DataLabelType, value: IssueStatus): DataLabel {
  return `${DATA_LABEL_PREFIX}:${type}:${value}`
}
