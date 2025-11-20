// A collection of functions, each defining a color palette.
// Each function takes a 'count' and returns a color string.

export const paletteColors = {
  Classic: ['#482878', '#3A528B', '#3F4A75', '#357F7F', '#2A9D8F', '#7AD151'],
  Inferno: ['#0C0830', '#5D016D', '#F9E55B', '#FDB92E', '#FC800F', '#F7370A'],
  Viridis: ['#482878', '#440154', '#3A528B', '#2A9D8F', '#7AD151', '#FDE725'],
  Grayscale: ['#eeeeee', '#cccccc', '#aaaaaa', '#777777', '#444444', '#000000'],
}

const getColor = (count: number, colors: string[]) => {
  if (count > 100) return colors[5]
  if (count > 50) return colors[4]
  if (count > 20) return colors[3]
  if (count > 10) return colors[2]
  if (count > 5) return colors[1]
  return colors[0]
}

const classic = (count: number): string => getColor(count, paletteColors.Classic)
const inferno = (count: number): string => getColor(count, paletteColors.Inferno)
const viridis = (count: number): string => getColor(count, paletteColors.Viridis)
const grayscale = (count: number): string => getColor(count, paletteColors.Grayscale)

export const palettes = {
  Classic: classic,
  Inferno: inferno,
  Viridis: viridis,
  Grayscale: grayscale,
}

export type PaletteName = keyof typeof palettes
