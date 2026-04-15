import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

jest.mock('@/components/FileTransferComponent', () => ({
  FileTransferComponent: () => <div data-testid="file-transfer-component" />,
}))

jest.mock('lucide-react', () => ({
  Zap: () => <svg data-testid="zap-icon" />,
  Globe: () => <svg data-testid="globe-icon" />,
}))

describe('Home page', () => {
  it('renders the page heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders the application name', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('P2P')
    expect(heading).toHaveTextContent('Transfer')
  })

  it('renders the subtitle with WebRTC description', () => {
    render(<Home />)
    expect(
      screen.getByText(/Transferência de arquivos via WebRTC/i),
    ).toBeInTheDocument()
  })

  it('renders the FileTransferComponent', () => {
    render(<Home />)
    expect(screen.getByTestId('file-transfer-component')).toBeInTheDocument()
  })

  it('renders the footer text', () => {
    render(<Home />)
    expect(screen.getByText(/WebRTC P2P/i)).toBeInTheDocument()
  })
})
