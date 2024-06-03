import { screen } from '@testing-library/vue'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { ColumnCard } from '#components'

describe('<ColumnCard />', () => {
  it('should render the title (link to a new tab), status, id (truncated), and labels', async () => {
    const props = {
      id: '786cfb329a8a63dadda30caaa38437b870ab6bf8',
      title: 'Title',
      labels: ['label 1', 'label 2'],
      status: {
        name: 'Open',
        icon: {
          name: 'octicon:issue-opened-16',
          class: '',
        },
      },
      href: 'https://example.com',
    }
    await renderSuspended(ColumnCard, {
      props,
    })

    expect(screen.getByText(props.status.name)).toBeInTheDocument()
    expect(screen.getByText(props.id.slice(0, 7))).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: props.title })).toBeInTheDocument()
    props.labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
    const link = screen.getByRole('link', { name: props.title })
    expect(link).toHaveAttribute('href', props.href)
    expect(link).toHaveAttribute('target', '_blank')
  })
})
