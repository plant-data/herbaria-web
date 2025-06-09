// A collection of functions, each defining a color palette.
// Each function takes a 'count' and returns a color string.

const classic = (count: number): string => {
  if (count > 100) return '#7AD151'
  if (count > 50) return '#2A9D8F'
  if (count > 20) return '#357F7F'
  if (count > 10) return '#3F4A75'
  if (count > 5) return '#3A528B'
  return '#482878'
}

const inferno = (count: number): string => {
  if (count > 100) return '#F7370A'
  if (count > 50) return '#FC800F'
  if (count > 20) return '#FDB92E'
  if (count > 10) return '#F9E55B'
  if (count > 5) return '#5D016D'
  return '#0C0830'
}

const viridis = (count: number): string => {
  if (count > 100) return '#FDE725'
  if (count > 50) return '#7AD151'
  if (count > 20) return '#2A9D8F'
  if (count > 10) return '#3A528B'
  if (count > 5) return '#440154'
  return '#482878'
}

const grayscale = (count: number): string => {
  if (count > 100) return '#000000'
  if (count > 50) return '#444444'
  if (count > 20) return '#777777'
  if (count > 10) return '#aaaaaa'
  if (count > 5) return '#cccccc'
  return '#eeeeee'
}

export const palettes = {
  Classic: classic,
  Inferno: inferno,
  Viridis: viridis,
  Grayscale: grayscale,
}

export type PaletteName = keyof typeof palettes
