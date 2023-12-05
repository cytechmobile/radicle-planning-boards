export type IssueStatus = 'todo' | 'doing' | 'done'
export interface Issue {
  id: string
  title: string
  labels: IssueStatus[]
}

export const mockIssues: Issue[] = [
  {
    id: '42ddc58de82757cf729f6c1b4fba0536',
    title: 'Implement User Authentication',
    labels: ['todo'],
  },
  {
    id: '703abf5af2fc9c4a3e7dbb1193e83511',
    title: 'Design Database Schema',
    labels: ['todo'],
  },
  {
    id: 'a0a85d0c34f73ec3b8c213409b2e8d29',
    title: 'An issue with a really long name to see whether the ui handles it well or not',
    labels: ['todo'],
  },
  {
    id: '26ec420ba69483f7298f3842b8e759f4',
    title: 'Create API Endpoints',
    labels: ['doing'],
  },
  {
    id: '41922e1ed28e9eaf7b6124af8f42bdfa',
    title: 'Fix Login Bug',
    labels: ['doing'],
  },
  {
    id: 'dfbbf053f6ecbecd66f966574f6bd6ed',
    title: 'Improve Page Load Performance',
    labels: ['done'],
  },
  {
    id: '81a2a5b64efdec72e59c5de36b7dc997',
    title: 'Add Unit Tests',
    labels: ['done'],
  },
]
