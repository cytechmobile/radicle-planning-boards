import { reactive } from 'vue'

export type IssueStatus = 'todo' | 'doing' | 'done'
export interface Issue {
  id: string
  title: string
}

export const mockIssues = reactive({
  todo: [
    {
      id: '42ddc58de82757cf729f6c1b4fba0536',
      title: 'Implement User Authentication',
    },
    {
      id: '703abf5af2fc9c4a3e7dbb1193e83511',
      title: 'Design Database Schema',
    },
    {
      id: 'a0a85d0c34f73ec3b8c213409b2e8d29',
      title: 'An issue with a really long name to see whether the ui handles it well or not',
    },
  ],
  doing: [
    {
      id: '26ec420ba69483f7298f3842b8e759f4',
      title: 'Create API Endpoints',
    },
    {
      id: '41922e1ed28e9eaf7b6124af8f42bdfa',
      title: 'Fix Login Bug',
    },
  ],
  done: [
    {
      id: 'dfbbf053f6ecbecd66f966574f6bd6ed',
      title: 'Improve Page Load Performance',
    },
    {
      id: '81a2a5b64efdec72e59c5de36b7dc997',
      title: 'Add Unit Tests',
    },
  ],
} satisfies Record<IssueStatus, Issue[]>)
