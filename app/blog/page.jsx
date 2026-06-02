import AnimatedLink from "components/AnimatedLink";
import { getAllPosts } from "lib/mdx";

export default function Blog() {
  const posts = getAllPosts();

  return (
    <div className="flex w-full flex-col items-start">
      <div className="mb-8">
        <h1 className="mb-4 font-medium text-sm sm:text-base">Blog Posts</h1>
        <p className="text-neutral-400 text-xs">Technical articles and developer tips</p>
      </div>

      <div className="w-full space-y-6">
        {posts.map((post) => (
          <article className="border-gray-200 border-b pb-6 dark:border-gray-700" key={post.id}>
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 font-medium text-neutral-400 text-xs">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                {post.tags && (
                  <div className="flex gap-2">
                    {post.tags.map((tag) => (
                      <span className="text-neutral-400" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <AnimatedLink className="font-medium text-sm sm:text-base" href={`/blog/${post.id}`}>
                {post.title}
              </AnimatedLink>

              {post.description && (
                <p className="my-1 truncate text-neutral-400 text-xs">{post.description}</p>
              )}

              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-400 text-xs">
                  By {post.author || "Gökhan Öztürk"}
                </span>
                <AnimatedLink
                  className="font-medium text-neutral-400 text-xs hover:underline"
                  href={`/blog/${post.id}`}
                >
                  Read more →
                </AnimatedLink>
              </div>
            </div>
          </article>
        ))}

        {/* Legacy external post */}
        <article className="border-gray-200 border-b pb-6 dark:border-gray-700">
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 font-medium text-neutral-400 text-xs">
              <time dateTime="2023-10-01">October 1, 2023</time>
              <span className="text-neutral-400">Vue.js</span>
            </div>

            <AnimatedLink
              className="font-medium text-sm sm:text-base"
              href="https://medium.com/@gokhaanozturk/vue-js-ile-özelleştirilebilir-breadcrumb-bileşeni-oluşturma-92a8e94a199e"
            >
              Creating Customizable Breadcrumb Component with Vue.js
            </AnimatedLink>

            <p className="my-1 truncate text-neutral-400 text-xs">
              Learn how to build a flexible and reusable breadcrumb navigation component in Vue.js
            </p>

            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-400 text-xs">By Gökhan Öztürk</span>
              <AnimatedLink
                className="font-medium text-neutral-400 text-xs hover:underline"
                href="https://medium.com/@gokhaanozturk/vue-js-ile-özelleştirilebilir-breadcrumb-bileşeni-oluşturma-92a8e94a199e"
              >
                Read on Medium →
              </AnimatedLink>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
