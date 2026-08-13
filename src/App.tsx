import { BrowserRouter } from 'react-router-dom'
import AppShell from './layout/AppShell'

export default function App() {
  return (
    <BrowserRouter basename="/falcon-lab">
      <AppShell />
    </BrowserRouter>
  )
}
