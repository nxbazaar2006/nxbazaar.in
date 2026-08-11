import BlogCard from "@/components/frontend/BlogCard";
import type { BlogItem } from "@/types/blog";
import HomeSectionHeading from "./HomeSectionHeading";

interface Props {
  blogs?: BlogItem[];
}

export default function HomeBlogPreview({ blogs = [] }: Props) {
  if (blogs.length === 0) return null;

  return (
    <section className="nx-products-preview" aria-labelledby="nx-latest-blogs">
      <HomeSectionHeading
        sectionKey="latest-blogs"
        eyebrowKey="home.marketplace"
        titleKey="home.latestBlogs"
        href="/blogs"
      />

      <div className="nx-preview-grid nx-blog-preview-grid">
        {blogs.slice(0, 3).map((blog) => (
          <BlogCard key={blog.id} training={blog} />
        ))}
      </div>
    </section>
  );
}
