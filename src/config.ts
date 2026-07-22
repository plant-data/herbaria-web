const BASE_API_URL = import.meta.env.VITE_API_BASE_URL
const BASE_IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL
// Base URL of the local plantdata-resources public API (`/api/v1/`, must end
// with `/`). The filter panel reads its suggestions, counts and histograms from
// here while the rest of the app still talks to the online specimens API. Falls
// back to the dev default so no `.env` edit is strictly required.
const BASE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_BASE_URL ?? 'http://localhost:8000/api/v1/'
const ITEMS_PER_PAGE = Number(import.meta.env.VITE_ITEMS_PER_PAGE)
const BASE_PATH = import.meta.env.VITE_BASE_PATH
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT as 'development' | 'production'
const IS_DEV = ENVIRONMENT === 'development'

export { BASE_API_URL, BASE_LOCAL_API_URL, BASE_IMAGE_URL, ITEMS_PER_PAGE, BASE_PATH, ENVIRONMENT, IS_DEV }
