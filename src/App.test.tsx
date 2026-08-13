import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders Falcon Lab heading', () => {
    // BrowserRouter with basename="/falcon-lab" requires the URL to match.
    // Push JSDOM's location to the basename before rendering.
    window.history.pushState({}, '', '/falcon-lab/')
    render(<App />)
    expect(screen.getByText(/falcon lab/i)).toBeInTheDocument()
  })
})
