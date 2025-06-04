type SpecimenData = {
  occurrenceID: string
  catalogNumber: string
  otherCatalogNumbers: string | null
  basisOfRecord: string | null
  verbatimIdentification: string | null
  scientificName: string
  verbatimEventDate: string
  eventDate: string
  year: number
  month: number
  locality: string
  verbatimElevation: string | null
  minimumElevationInMeters: number | null
  maximumElevationInMeters: number | null
  country: string
  recordedBy: string | null
  identifiedBy: string | null
  floritalyName: string
  wfoName: string | null
  gbifName: string
  processedLocality: string | null
  decimalLatitude: number
  decimalLongitude: number
  geodeticDatum: string
  coordinatesUncertaintyInMeters: number
  georeferenceProtocol: string | null
} & Record<string, unknown>

export {SpecimenData}