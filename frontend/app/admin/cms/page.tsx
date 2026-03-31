"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils";
import type {
  BlogPost,
  CmsContent,
  ContactSubmission,
  NewsPost,
  PermissionSection,
  PortfolioProject,
} from "@/types";

const sections: PermissionSection[] = ["HOME", "ABOUT", "SERVICES", "PROJECTS", "BLOG", "NEWS", "CONTACT"];

type UserPermissionRow = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  permissions: Array<{ section: PermissionSection }>;
};

type ProjectInterestSubmission = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  createdAt: string;
  project?: { id: string; title: string; slug: string };
};

export default function CmsAdminPage() {
  const { data: session, status } = useSession();

  const [content, setContent] = useState<Record<string, CmsContent | null>>({
    home: null,
    about: null,
    services: null,
  });
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [blog, setBlog] = useState<BlogPost[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [contact, setContact] = useState<ContactSubmission[]>([]);
  const [interests, setInterests] = useState<ProjectInterestSubmission[]>([]);
  const [users, setUsers] = useState<UserPermissionRow[]>([]);
  const [msg, setMsg] = useState("");

  const [projectForm, setProjectForm] = useState({ title: "", slug: "", summary: "", details: "", image: "" });
  const [blogForm, setBlogForm] = useState({ title: "", slug: "", excerpt: "", content: "", image: "" });
  const [newsForm, setNewsForm] = useState({ title: "", slug: "", excerpt: "", content: "", image: "" });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  const load = async () => {
    const [home, about, services, projectsRes, blogRes, newsRes, contactRes, interestsRes, usersRes] =
      await Promise.all([
        fetch("/api/cms/content?key=home"),
        fetch("/api/cms/content?key=about"),
        fetch("/api/cms/content?key=services"),
        fetch("/api/projects"),
        fetch("/api/blog"),
        fetch("/api/news"),
        fetch("/api/contact"),
        fetch("/api/submissions/project-interests"),
        fetch("/api/admin/permissions"),
      ]);

    const homeData = (await home.json()) as { content: CmsContent | null };
    const aboutData = (await about.json()) as { content: CmsContent | null };
    const servicesData = (await services.json()) as { content: CmsContent | null };
    const projectsData = (await projectsRes.json()) as { projects: PortfolioProject[] };
    const blogData = (await blogRes.json()) as { posts: BlogPost[] };
    const newsData = (await newsRes.json()) as { posts: NewsPost[] };
    const contactData = (await contactRes.json()) as { submissions: ContactSubmission[] };
    const interestsData = (await interestsRes.json()) as { submissions: ProjectInterestSubmission[] };
    const usersData = (await usersRes.json()) as { users: UserPermissionRow[] };

    setContent({ home: homeData.content, about: aboutData.content, services: servicesData.content });
    setProjects(projectsData.projects ?? []);
    setBlog(blogData.posts ?? []);
    setNews(newsData.posts ?? []);
    setContact(contactData.submissions ?? []);
    setInterests(interestsData.submissions ?? []);
    setUsers(usersData.users ?? []);
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      void load();
    }
  }, [status, session?.user?.role]);

  if (status === "loading") return <div className="max-w-7xl mx-auto px-4 py-10">Loading...</div>;
  if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
    return <div className="max-w-7xl mx-auto px-4 py-10">Unauthorized.</div>;
  }

  const saveContent = async (key: "home" | "about" | "services") => {
    const record = content[key];
    if (!record) return;
    const res = await fetch("/api/cms/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, title: record.title, body: record.body }),
    });
    if (res.ok) setMsg(`${key} updated.`);
    await load();
  };

  const saveProject = async () => {
    const res = await fetch(editingProjectId ? `/api/projects/${editingProjectId}` : "/api/projects", {
      method: editingProjectId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectForm),
    });
    if (res.ok) {
      setProjectForm({ title: "", slug: "", summary: "", details: "", image: "" });
      setEditingProjectId(null);
      setMsg(editingProjectId ? "Project updated." : "Project created.");
      await load();
    }
  };

  const deleteProject = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg("Project deleted.");
      await load();
    }
  };

  const saveBlog = async () => {
    const res = await fetch(editingBlogId ? `/api/blog/${editingBlogId}` : "/api/blog", {
      method: editingBlogId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...blogForm, published: true }),
    });
    if (res.ok) {
      setBlogForm({ title: "", slug: "", excerpt: "", content: "", image: "" });
      setEditingBlogId(null);
      setMsg(editingBlogId ? "Blog post updated." : "Blog post created.");
      await load();
    }
  };

  const deleteBlog = async (id: string) => {
    const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg("Blog post deleted.");
      await load();
    }
  };

  const saveNews = async () => {
    const res = await fetch(editingNewsId ? `/api/news/${editingNewsId}` : "/api/news", {
      method: editingNewsId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newsForm, published: true }),
    });
    if (res.ok) {
      setNewsForm({ title: "", slug: "", excerpt: "", content: "", image: "" });
      setEditingNewsId(null);
      setMsg(editingNewsId ? "News post updated." : "News post created.");
      await load();
    }
  };

  const deleteNews = async (id: string) => {
    const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg("News post deleted.");
      await load();
    }
  };

  const updatePermissions = async (userId: string, next: PermissionSection[]) => {
    await fetch("/api/admin/permissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, sections: next }),
    });
    await load();
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">CMS Dashboard</h1>
      {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3">{msg}</div>}

      {(["home", "about", "services"] as const).map((key) => (
        <div key={key} className="card p-5 space-y-3">
          <h2 className="text-xl font-semibold capitalize">{key} content</h2>
          <input
            className="input-field"
            value={content[key]?.title ?? ""}
            onChange={(e) => setContent((c) => ({ ...c, [key]: { ...(c[key] ?? { key, title: "", body: "", updatedAt: "" }), title: e.target.value } }))}
            placeholder="Title"
          />
          <textarea
            className="input-field min-h-24"
            value={content[key]?.body ?? ""}
            onChange={(e) => setContent((c) => ({ ...c, [key]: { ...(c[key] ?? { key, title: "", body: "", updatedAt: "" }), body: e.target.value } }))}
            placeholder="Body"
          />
          <button className="btn-primary" onClick={() => saveContent(key)}>Save</button>
        </div>
      ))}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-5 space-y-2">
          <h2 className="font-semibold text-lg">{editingProjectId ? "Edit Project" : "Create Project"}</h2>
          <input className="input-field" placeholder="Title" value={projectForm.title} onChange={(e) => setProjectForm((v) => ({ ...v, title: e.target.value }))} />
          <input className="input-field" placeholder="Slug" value={projectForm.slug} onChange={(e) => setProjectForm((v) => ({ ...v, slug: e.target.value }))} />
          <input className="input-field" placeholder="Image URL" value={projectForm.image} onChange={(e) => setProjectForm((v) => ({ ...v, image: e.target.value }))} />
          <textarea className="input-field" placeholder="Summary" value={projectForm.summary} onChange={(e) => setProjectForm((v) => ({ ...v, summary: e.target.value }))} />
          <textarea className="input-field" placeholder="Details" value={projectForm.details} onChange={(e) => setProjectForm((v) => ({ ...v, details: e.target.value }))} />
          <div className="flex gap-2">
            <button className="btn-primary" onClick={saveProject}>{editingProjectId ? "Save" : "Create"}</button>
            {editingProjectId && (
              <button className="btn-secondary" onClick={() => { setEditingProjectId(null); setProjectForm({ title: "", slug: "", summary: "", details: "", image: "" }); }}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="card p-5 space-y-2">
          <h2 className="font-semibold text-lg">{editingBlogId ? "Edit Blog" : "Create Blog"}</h2>
          <input className="input-field" placeholder="Title" value={blogForm.title} onChange={(e) => setBlogForm((v) => ({ ...v, title: e.target.value }))} />
          <input className="input-field" placeholder="Slug" value={blogForm.slug} onChange={(e) => setBlogForm((v) => ({ ...v, slug: e.target.value }))} />
          <input className="input-field" placeholder="Image URL" value={blogForm.image} onChange={(e) => setBlogForm((v) => ({ ...v, image: e.target.value }))} />
          <textarea className="input-field" placeholder="Excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm((v) => ({ ...v, excerpt: e.target.value }))} />
          <textarea className="input-field" placeholder="Content" value={blogForm.content} onChange={(e) => setBlogForm((v) => ({ ...v, content: e.target.value }))} />
          <div className="flex gap-2">
            <button className="btn-primary" onClick={saveBlog}>{editingBlogId ? "Save" : "Create"}</button>
            {editingBlogId && (
              <button className="btn-secondary" onClick={() => { setEditingBlogId(null); setBlogForm({ title: "", slug: "", excerpt: "", content: "", image: "" }); }}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="card p-5 space-y-2">
          <h2 className="font-semibold text-lg">{editingNewsId ? "Edit News" : "Create News"}</h2>
          <input className="input-field" placeholder="Title" value={newsForm.title} onChange={(e) => setNewsForm((v) => ({ ...v, title: e.target.value }))} />
          <input className="input-field" placeholder="Slug" value={newsForm.slug} onChange={(e) => setNewsForm((v) => ({ ...v, slug: e.target.value }))} />
          <input className="input-field" placeholder="Image URL" value={newsForm.image} onChange={(e) => setNewsForm((v) => ({ ...v, image: e.target.value }))} />
          <textarea className="input-field" placeholder="Excerpt" value={newsForm.excerpt} onChange={(e) => setNewsForm((v) => ({ ...v, excerpt: e.target.value }))} />
          <textarea className="input-field" placeholder="Content" value={newsForm.content} onChange={(e) => setNewsForm((v) => ({ ...v, content: e.target.value }))} />
          <div className="flex gap-2">
            <button className="btn-primary" onClick={saveNews}>{editingNewsId ? "Save" : "Create"}</button>
            {editingNewsId && (
              <button className="btn-secondary" onClick={() => { setEditingNewsId(null); setNewsForm({ title: "", slug: "", excerpt: "", content: "", image: "" }); }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-xl font-semibold mb-3">Contact Submissions</h2>
          <div className="space-y-3">
            {contact.map((item) => (
              <div key={item.id} className="border rounded-lg p-3">
                <p className="font-medium">{item.name} ({item.email})</p>
                <p className="text-sm text-gray-500">{formatDate(item.createdAt)}</p>
                <p className="text-sm mt-2 text-gray-700">{item.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-xl font-semibold mb-3">Project Interests</h2>
          <div className="space-y-3">
            {interests.map((item) => (
              <div key={item.id} className="border rounded-lg p-3">
                <p className="font-medium">{item.name} ({item.email})</p>
                <p className="text-sm text-gray-500">Project: {item.project?.title} · {formatDate(item.createdAt)}</p>
                <p className="text-sm mt-2 text-gray-700">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-semibold mb-3">Role-Based Section Permissions</h2>
        <div className="space-y-4">
          {users
            .filter((u) => u.role !== "ADMIN")
            .map((user) => {
              const selected = new Set(user.permissions.map((p) => p.section));
              return (
                <div key={user.id} className="border rounded-lg p-3">
                  <p className="font-medium">{user.name} ({user.email})</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                    {sections.map((section) => {
                      const active = selected.has(section);
                      return (
                        <button
                          key={section}
                          className={active ? "btn-primary py-1" : "btn-secondary py-1"}
                          onClick={() => {
                            const next = new Set(selected);
                            if (active) next.delete(section);
                            else next.add(section);
                            void updatePermissions(user.id, Array.from(next));
                          }}
                        >
                          {section}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Projects</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            {projects.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2">
                <span>{item.title}</span>
                <span className="flex gap-2">
                  <button className="btn-secondary px-2 py-1" onClick={() => {
                    setEditingProjectId(item.id);
                    setProjectForm({
                      title: item.title,
                      slug: item.slug,
                      summary: item.summary,
                      details: item.details,
                      image: item.image,
                    });
                  }}>Edit</button>
                  <button className="btn-danger px-2 py-1" onClick={() => { void deleteProject(item.id); }}>Delete</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Blog Posts</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            {blog.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2">
                <span>{item.title}</span>
                <span className="flex gap-2">
                  <button className="btn-secondary px-2 py-1" onClick={() => {
                    setEditingBlogId(item.id);
                    setBlogForm({
                      title: item.title,
                      slug: item.slug,
                      excerpt: item.excerpt,
                      content: item.content,
                      image: item.image,
                    });
                  }}>Edit</button>
                  <button className="btn-danger px-2 py-1" onClick={() => { void deleteBlog(item.id); }}>Delete</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-2">News</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            {news.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2">
                <span>{item.title}</span>
                <span className="flex gap-2">
                  <button className="btn-secondary px-2 py-1" onClick={() => {
                    setEditingNewsId(item.id);
                    setNewsForm({
                      title: item.title,
                      slug: item.slug,
                      excerpt: item.excerpt,
                      content: item.content,
                      image: item.image,
                    });
                  }}>Edit</button>
                  <button className="btn-danger px-2 py-1" onClick={() => { void deleteNews(item.id); }}>Delete</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
