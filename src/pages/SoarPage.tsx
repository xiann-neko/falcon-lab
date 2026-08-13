import { Routes, Route } from 'react-router-dom'
import { DomainPage }   from '../features/learning/DomainPage'
import { ModulePage }   from '../features/learning/ModulePage'
import { ScenarioPage } from '../features/learning/ScenarioPage'

export default function SoarPage() {
  return (
    <Routes>
      <Route index                          element={<DomainPage domainId="soar" />} />
      <Route path="module/:moduleId"        element={<ModulePage />} />
      <Route path="scenario/track/:trackId" element={<ScenarioPage />} />
    </Routes>
  )
}
