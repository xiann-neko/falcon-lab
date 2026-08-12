import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders Falcon Lab heading', () => {
    render(<App />)
    expect(screen.getByText(/falcon lab/i)).toBeInTheDocument()
  })
})
