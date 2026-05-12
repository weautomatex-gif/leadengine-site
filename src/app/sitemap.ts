import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://findmealead.com', lastModified: new Date(), priority: 1 },
    { url: 'https://findmealead.com/sign-up', lastModified: new Date(), priority: 0.8 },
    { url: 'https://findmealead.com/sign-in', lastModified: new Date(), priority: 0.5 },
  ]
}
