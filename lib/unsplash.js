export class Unsplash {
  base_url = "https://api.unsplash.com/users/gokhanozturk";
  client_id = `client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`;

  async getData(url) {
    const res = await fetch(url, {
      method: "GET",
    });
    return await res.json();
  }

  getPhotos() {
    const url = [this.base_url, "/photos?", this.client_id].join("");
    return this.getData(url);
  }

  async getLatestPhoto() {
    const url = [this.base_url, "/photos?per_page=1&order_by=latest&", this.client_id].join("");
    const res = await fetch(url, { method: "GET", next: { revalidate: 3600 } });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const photo = data[0];
    return {
      alt: photo.alt_description ?? photo.description ?? "a photo",
      color: photo.color,
      date: photo.created_at ?? photo.updated_at,
      height: photo.height,
      id: photo.id,
      image: photo.urls?.small,
      url: photo.links?.html,
      width: photo.width,
    };
  }
}
