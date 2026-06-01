const process = require("node:process");

export class Github {
  base_url = "https://api.github.com/repos/";
  token = `${process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN}`;

  async getData(url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      method: "GET",
    });
    return await res.json();
  }

  getRepo(repo) {
    const url = [this.base_url, repo].join("");
    return this.getData(url);
  }

  async getLatestActivity(username) {
    const url = `https://api.github.com/users/${username}/events/public`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      method: "GET",
      next: { revalidate: 3600 },
    });
    const events = await res.json();
    if (!Array.isArray(events)) return null;
    const push = events.find((e) => e.type === "PushEvent");
    if (!push) return null;
    const commit = push.payload?.commits?.at(-1);
    return {
      date: push.created_at,
      message: commit?.message?.split("\n")[0] ?? "",
      repo: push.repo?.name?.split("/").at(-1) ?? push.repo?.name ?? "",
      url: `https://github.com/${push.repo?.name}`,
    };
  }
}
