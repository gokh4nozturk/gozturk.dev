export default function sitemap() {
  return [
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 1,
      url: "https://gozturk.dev",
    },
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.8,
      url: "https://gozturk.dev/photos",
    },
    {
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 0.7,
      url: "https://gozturk.dev/bookmarks",
    },
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.7,
      url: "https://gozturk.dev/resume",
    },
  ];
}
