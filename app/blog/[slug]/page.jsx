import { getAllPosts, getPostData } from "lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import remarkGfm from "remark-gfm";
import { useMDXComponents } from "../../../mdx-components";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.id,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    description: post.description,
    openGraph: {
      authors: [post.author || "Gökhan Öztürk"],
      description: post.description,
      publishedTime: post.date,
      title: post.title,
      type: "article",
    },
    title: post.title,
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  let post;

  try {
    post = getPostData(slug);
  } catch {
    notFound();
  }

  if (!post) {
    notFound();
  }

  const components = useMDXComponents({});

  return (
    <article className="w-170 pb-40">
      {/* Post Header */}
      <header className="mb-8">
        <div className="mb-4 flex items-center gap-4 text-gray-500 text-sm dark:text-gray-400">
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
                <span
                  className="rounded bg-gray-300 px-2 py-1 text-gray-900 text-xs dark:bg-gray-800 dark:text-gray-100"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <h1 className="mb-4 font-bold text-3xl text-gray-900 dark:text-gray-100">{post.title}</h1>

        {post.description && (
          <p className="mb-4 text-gray-600 text-lg dark:text-gray-400">{post.description}</p>
        )}

        <div className="flex items-center text-gray-500 text-sm">
          <span>By {post.author || "Gökhan Öztürk"}</span>
        </div>
      </header>

      {/* Post Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none prose-code:bg-gray-300 prose-pre:bg-gray-100 prose-th:bg-gray-300 prose-code:text-gray-900 prose-headings:text-gray-900 prose-p:text-gray-700 dark:prose-code:bg-gray-800 dark:prose-pre:bg-gray-800 dark:prose-code:text-gray-100 dark:prose-headings:text-gray-100 dark:prose-p:text-gray-300">
        <MDXRemote
          components={components}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            },
          }}
          source={post.content}
        />
      </div>

      {/* Post Footer */}
      <footer className="mt-12 border-gray-200 border-t pt-8 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-gray-500 text-sm">
            <p>
              Published on{" "}
              {new Date(post.date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <a
            className="text-sm underline-offset-2 transition-colors hover:text-blue-600 hover:underline dark:hover:text-blue-400"
            href="/blog"
          >
            ← Back to blog
          </a>
        </div>
      </footer>
    </article>
  );
}
