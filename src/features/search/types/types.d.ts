type SpecimenData = {
  occurrenceID: string
  catalogNumber: string | null
  otherCatalogNumbers: string | null
  basisOfRecord: string | null
  verbatimIdentification: string | null
  scientificName: string | null
  verbatimEventDate: string | null
  eventDate: string | null
  year: number | null
  month: number | null
  locality: string | null
  verbatimElevation: string | null
  minimumElevationInMeters: number | null
  maximumElevationInMeters: number | null
  country: string | null
  recordedBy: string | null
  identifiedBy: string | null
  floritalyName: string | null
  wfoName: string | null
  gbifName: string | null
  processedLocality: string | null
  decimalLatitude: number | null
  decimalLongitude: number | null
  geodeticDatum: string | null
  coordinatesUncertaintyInMeters: number | null
  georeferenceProtocol: string | null
  multimedia: Array<MultimediaData>
} & Record<string, unknown>

type MultimediaData = {
  identifier: string
}

export { SpecimenData }
