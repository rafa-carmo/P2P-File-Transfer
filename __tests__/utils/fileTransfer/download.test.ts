import { downloadFile } from '@/utils/fileTransfer/download'

describe('downloadFile', () => {
  let clickSpy: jest.SpyInstance

  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake-url')
    URL.revokeObjectURL = jest.fn()
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  afterEach(() => {
    clickSpy.mockRestore()
    jest.restoreAllMocks()
  })

  it('creates an object URL from the blob', () => {
    const blob = new Blob(['test content'])
    downloadFile(blob, 'file.txt')
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
  })

  it('revokes the object URL after clicking', () => {
    downloadFile(new Blob(['data']), 'file.txt')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/fake-url')
  })

  it('sets the correct download filename on the anchor', () => {
    let capturedLink: HTMLAnchorElement | null = null
    clickSpy.mockImplementation(function (this: HTMLAnchorElement) {
      capturedLink = this
    })

    downloadFile(new Blob(['data']), 'report.pdf')

    expect(capturedLink).not.toBeNull()
    expect((capturedLink as HTMLAnchorElement).download).toBe('report.pdf')
  })

  it('sets the href to the object URL on the anchor', () => {
    let capturedLink: HTMLAnchorElement | null = null
    clickSpy.mockImplementation(function (this: HTMLAnchorElement) {
      capturedLink = this
    })

    downloadFile(new Blob(['data']), 'file.txt')

    expect((capturedLink as HTMLAnchorElement | null)?.href).toBe(
      'blob:http://localhost/fake-url',
    )
  })
})
