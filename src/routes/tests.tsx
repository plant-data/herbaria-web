import { createFileRoute } from '@tanstack/react-router'

import { useState } from 'react'
import {AreaMapFilter} from '@/features/search/components/area-map-filter'

export const Route = createFileRoute('/tests')({
  component: RouteComponent,
})

function RouteComponent() {
  const [geometry, setGeometry] = useState<Array<[number, number]>>([])
  return <AreaMapFilter geometry={geometry} setGeometry={setGeometry} />
}
