"use client";

import { useState, useEffect, useMemo } from "react";
import { Book, FileText, Trash2, RefreshCw, PlayCircle, Edit, X, Maximize, ChevronDown, ExternalLink, Search } from "lucide-react";
import RichTextEditor from "./_components/RichTextEditor";
import { PRESET_BLOG_TAGS } from "@/lib/blog-tags";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("enquiries");
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [openBatchSyllabusKey, setOpenBatchSyllabusKey] = useState<string | null>(null);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [isEditorFullScreen, setIsEditorFullScreen] = useState(false);
  const [blogSubmitting, setBlogSubmitting] = useState(false);
  const [blogActionLoadingId, setBlogActionLoadingId] = useState<number | null>(null);
  const [blogSearch, setBlogSearch] = useState("");
  const [blogValidationError, setBlogValidationError] = useState("");

  const [courseForm, setCourseForm] = useState({
    title: "",
    duration: "",
    timing: "",
    fees: "",
    discount_percent: "",
    benefits: "",
    syllabus: "",
    syllabus_details: "",
    next_batch_starts: "",
    description: "",
    file: null as File | null,
  });
  const [blogForm, setBlogForm] = useState<{ title: string; content: string; author: string; tags: string[]; file: File | null }>({ title: "", content: "", author: "Admin", tags: [], file: null });
  const [videoForm, setVideoForm] = useState({ title: "", youtube_url: "" });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "Admission FAQs" });
  const [customTagInput, setCustomTagInput] = useState("");

  const availableBlogTags = useMemo(() => {
    const merged = new Set<string>(PRESET_BLOG_TAGS);
    blogs.forEach((blog) => {
      if (Array.isArray(blog.tags)) {
        blog.tags.forEach((tag: string) => {
          const clean = String(tag || "").trim();
          if (clean) merged.add(clean);
        });
      }
    });
    return Array.from(merged);
  }, [blogs]);

  const visibleBlogs = useMemo(() => {
    const needle = blogSearch.trim().toLowerCase();
    if (!needle) return blogs;
    return blogs.filter((blog) => {
      const title = String(blog.title || "").toLowerCase();
      const author = String(blog.author || "").toLowerCase();
      const tags = Array.isArray(blog.tags) ? blog.tags.map((tag: string) => String(tag).toLowerCase()) : [];
      return title.includes(needle) || author.includes(needle) || tags.some((tag) => tag.includes(needle));
    });
  }, [blogSearch, blogs]);

  useEffect(() => {
    fetch("/api/admin/verify", { credentials: "include" })
      .then((res) => {
        if (res.ok) setIsAuthenticated(true);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setIsAuthenticated(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch { setLoginError("Connection error"); }
    setLoginLoading(false);
  };

  const authedFetch = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
    });
    if (res.status === 401) logout();
    return res;
  };

  const fetchEnquiries = async () => { const res = await authedFetch("/api/admin/enquiries"); const data = await res.json(); setEnquiries(data || []); };
  const fetchCourses = async () => { const res = await fetch("/api/courses"); const data = await res.json(); setCourses(data || []); };
  const fetchBlogs = async () => {
    const res = await authedFetch("/api/admin/blogs?page=1&limit=100");
    const data = await res.json();
    setBlogs(Array.isArray(data) ? data : data?.items || []);
  };
  const fetchVideos = async () => { const res = await fetch("/api/videos"); const data = await res.json(); setVideos(data || []); };
  const fetchAdmissions = async () => { const res = await authedFetch("/api/admin/admissions"); const data = await res.json(); setAdmissions(data || []); };
  const fetchFaqs = async () => { const res = await fetch("/api/faqs"); const data = await res.json(); setFaqs(data || []); };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === "enquiries") fetchEnquiries();
    if (activeTab === "courses") fetchCourses();
    if (activeTab === "blogs") fetchBlogs();
    if (activeTab === "videos") fetchVideos();
    if (activeTab === "admissions") fetchAdmissions();
    if (activeTab === "faqs") fetchFaqs();
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (isEditorFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isEditorFullScreen]);

  const handleCourseUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseForm.title || !courseForm.duration || !courseForm.timing || !courseForm.benefits || !courseForm.syllabus || !courseForm.next_batch_starts) {
      alert("Please fill all required batch fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", courseForm.title);
    formData.append("description", courseForm.description);
    formData.append("duration", courseForm.duration);
    formData.append("timing", courseForm.timing);
    formData.append("fees", courseForm.fees);
    formData.append("discount_percent", courseForm.discount_percent);
    formData.append("benefits", courseForm.benefits);
    formData.append("syllabus", courseForm.syllabus);
    formData.append("syllabus_details", courseForm.syllabus_details);
    formData.append("next_batch_starts", courseForm.next_batch_starts);
    if (courseForm.file) formData.append("image", courseForm.file);

    try {
      const endpoint = editingCourse ? `/api/admin/courses?id=${editingCourse.id}` : "/api/admin/courses";
      const method = editingCourse ? "PUT" : "POST";

      const res = await authedFetch(endpoint, { method, body: formData });
      if (res.ok) {
        alert(editingCourse ? "Batch updated successfully" : "Batch added successfully");
        setCourseForm({
          title: "",
          duration: "",
          timing: "",
          fees: "",
          discount_percent: "",
          benefits: "",
          syllabus: "",
          syllabus_details: "",
          next_batch_starts: "",
          description: "",
          file: null,
        });
        setEditingCourse(null);
        fetchCourses();
      } else throw new Error();
    } catch { alert(editingCourse ? "Failed to update batch" : "Failed to add batch"); }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || "",
      duration: course.duration || "",
      timing: course.timing || "",
    fees: course.fees != null ? String(course.fees) : "",
    discount_percent: course.discount_percent != null ? String(course.discount_percent) : "",
      benefits: course.benefits || "",
      syllabus: course.syllabus || "",
    syllabus_details: course.syllabus_details || "",
      next_batch_starts: course.next_batch_starts || "",
      description: course.description || "",
      file: null,
    });
    window.scrollTo(0, 0);
  };

  const cancelCourseEdit = () => {
    setEditingCourse(null);
    setCourseForm({
      title: "",
      duration: "",
      timing: "",
    fees: "",
    discount_percent: "",
      benefits: "",
      syllabus: "",
    syllabus_details: "",
      next_batch_starts: "",
      description: "",
      file: null,
    });
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blogSubmitting) return;

    const normalizedTitle = blogForm.title.trim();
    const normalizedAuthor = blogForm.author.trim() || "Admin";
    const normalizedTags = Array.from(
      new Set(
        blogForm.tags
          .map((tag) => String(tag || "").trim())
          .filter(Boolean)
      )
    );
    const plainContent = blogForm.content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!normalizedTitle) {
      setBlogValidationError("Blog title is required");
      return;
    }

    if (!plainContent) {
      setBlogValidationError("Blog content cannot be empty");
      return;
    }

    if (!normalizedTags.length) {
      setBlogValidationError("Please select at least one tag");
      return;
    }

    setBlogValidationError("");

    const formData = new FormData();
    formData.append("title", normalizedTitle);
    formData.append("content", blogForm.content);
    formData.append("author", normalizedAuthor);
    formData.append("tags", JSON.stringify(normalizedTags));
    if (blogForm.file) formData.append("image", blogForm.file);

    const url = editingBlog ? `/api/admin/blogs?id=${editingBlog.id}` : "/api/admin/blogs";
    const method = editingBlog ? "PUT" : "POST";

    try {
      setBlogSubmitting(true);
      const res = await authedFetch(url, { method, body: formData });
      if (res.ok) {
        await res.json();
        alert(`Blog ${editingBlog ? "updated" : "published"} successfully`);
        setBlogForm({ title: "", content: "", author: "Admin", tags: [], file: null });
        setCustomTagInput("");
        setEditingBlog(null);
        setIsEditorFullScreen(false);
        fetchBlogs();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit blog");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setBlogSubmitting(false);
    }
  };

  const handleEditBlog = (blog: any) => {
    setEditingBlog(blog);
    setBlogValidationError("");
    setBlogForm({
      title: blog.title,
      content: blog.content,
      author: blog.author,
      tags: blog.tags || [],
      file: null,
    });
    window.scrollTo(0, 0);
  };

  const handleCancelEdit = () => {
    setEditingBlog(null);
    setBlogForm({ title: "", content: "", author: "Admin", tags: [], file: null });
    setCustomTagInput("");
    setIsEditorFullScreen(false);
    setBlogValidationError("");
  };

  const toggleBlogTag = (tag: string) => {
    setBlogForm((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
      };
    });
  };

  const handleAddCustomTag = () => {
    const cleanTag = customTagInput.trim();
    if (!cleanTag) return;
    const exists = blogForm.tags.some((tag) => tag.toLowerCase() === cleanTag.toLowerCase());
    if (!exists) {
      setBlogForm((prev) => ({ ...prev, tags: [...prev.tags, cleanTag] }));
    }
    setCustomTagInput("");
  };

  const parseBatchList = (value?: string) =>
    String(value || "")
      .split(/\n|,/)
      .map((line) => line.trim())
      .filter(Boolean);

  const formatIndianCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(value);

  const getCoursePricing = (course: any) => {
    const fees = Number(course.fees);
    const discount = Number(course.discount_percent);

    if (!Number.isFinite(fees) || fees <= 0) return null;

    const validDiscount = Number.isFinite(discount) ? Math.min(Math.max(discount, 0), 100) : 0;
    const finalPrice = Math.max(0, fees - (fees * validDiscount) / 100);

    return { fees, discount: validDiscount, finalPrice };
  };

  const handleVideoAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authedFetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoForm),
      });
      if (res.ok) {
        alert("Video added!");
        setVideoForm({ title: "", youtube_url: "" });
        fetchVideos();
      } else throw new Error();
    } catch { alert("Failed to add video"); }
  };
  
  const handleFaqAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authedFetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqForm),
      });
      if (res.ok) {
        alert("FAQ added!");
        setFaqForm({ question: "", answer: "", category: "Admission FAQs" });
        fetchFaqs();
      } else throw new Error();
    } catch { alert("Failed to add FAQ"); }
  };

  const handleDeleteEnquiry = async (id: number) => { if (!window.confirm("Delete?")) return; await authedFetch(`/api/admin/enquiries?id=${id}`, { method: "DELETE" }); fetchEnquiries(); };
  const handleDeleteCourse = async (id: number) => { if (!window.confirm("Delete?")) return; await authedFetch(`/api/admin/courses?id=${id}`, { method: "DELETE" }); fetchCourses(); };
  const handleDeleteBlog = async (id: number) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      setBlogActionLoadingId(id);
      const res = await authedFetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete blog");
      }
      await fetchBlogs();
    } catch (error: any) {
      alert(error.message || "Failed to delete blog");
    } finally {
      setBlogActionLoadingId(null);
    }
  };
  const handleDeleteVideo = async (id: number) => { if (!window.confirm("Delete?")) return; await authedFetch(`/api/admin/videos?id=${id}`, { method: "DELETE" }); fetchVideos(); };
  const handleDeleteFaq = async (id: number) => { if (!window.confirm("Delete?")) return; await authedFetch(`/api/admin/faqs?id=${id}`, { method: "DELETE" }); fetchFaqs(); };

  if (!authChecked) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Login (Local)</h2>
          <p className="text-sm text-gray-500 mb-6">Login with your local admin credentials.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
              <input required type="text" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input required type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <button disabled={loginLoading} type="submit" className="btn-primary w-full py-3">{loginLoading ? "Logging in..." : "Login"}</button>
          </form>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { key: "enquiries", label: "Enquiries" },
    { key: "courses", label: "Manage Batches" },
    { key: "blogs", label: "Manage Blogs" },
    { key: "videos", label: "YouTube Videos" },
    { key: "faqs", label: "Manage FAQs" },
    { key: "admissions", label: "Enroll Enquiry" },
  ];

  return (
    <div className="pt-24 min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col pt-8 border-r border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-8 text-primary">Admin Panel</h2>
        <button onClick={logout} className="mx-6 mb-4 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Logout</button>
        {sidebarItems.map((item) => (
          <button key={item.key} onClick={() => setActiveTab(item.key)}
            className={`px-6 py-4 text-left font-semibold transition-colors ${activeTab === item.key ? "bg-primary/5 text-primary border-r-4 border-primary" : "text-gray-600 hover:bg-gray-50"}`}>
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 h-[calc(100vh-6rem)] overflow-y-auto">

        {/* ENQUIRIES */}
        {activeTab === "enquiries" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold text-gray-900">Recent Enquiries</h3>
              <button onClick={fetchEnquiries} className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"><RefreshCw className="w-4 h-4" /> Refresh</button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead><tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-sm border-b"><th className="p-4">Date</th><th className="p-4">Name</th><th className="p-4">Phone</th><th className="p-4">Batch</th><th className="p-4">Message</th><th className="p-4 text-right">Actions</th></tr></thead>
                <tbody>
                  {enquiries.length === 0 ? (<tr><td colSpan={6} className="text-center p-6 text-gray-500">No enquiries found</td></tr>) : enquiries.map((enq) => (
                    <tr key={enq.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-600">{new Date(enq.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-bold text-gray-900">{enq.full_name}</td>
                      <td className="p-4 text-primary font-medium">{enq.phone_number}</td>
                      <td className="p-4 inline-block bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">{enq.batch}</td>
                      <td className="p-4 text-sm text-gray-600">{enq.message || "-"}</td>
                      <td className="p-4 text-right"><button onClick={() => handleDeleteEnquiry(enq.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COURSES */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Book className="w-8 h-8 text-secondary" />
                  <h3 className="text-2xl font-bold text-gray-900">{editingCourse ? "Edit Batch" : "Add New Batch"}</h3>
                </div>
                {editingCourse && (
                  <button onClick={cancelCourseEdit} className="text-sm font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
                )}
              </div>
              <form onSubmit={handleCourseUpload} className="space-y-5">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Course Title</label><input required type="text" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Duration</label><input required type="text" placeholder="e.g. 1 Year" value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Timing</label><input required type="text" placeholder="e.g. Morning & Evening" value={courseForm.timing} onChange={(e) => setCourseForm({ ...courseForm, timing: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Fees (₹)</label><input type="number" min="0" step="1" placeholder="e.g. 36000" value={courseForm.fees} onChange={(e) => setCourseForm({ ...courseForm, fees: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Discount (%)</label><input type="number" min="0" max="100" step="0.01" placeholder="e.g. 15" value={courseForm.discount_percent} onChange={(e) => setCourseForm({ ...courseForm, discount_percent: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                </div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Benefits of Joining</label><textarea required rows={4} placeholder="One benefit per line" value={courseForm.benefits} onChange={(e) => setCourseForm({ ...courseForm, benefits: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Course Syllabus</label><textarea required rows={4} placeholder="One syllabus topic per line" value={courseForm.syllabus} onChange={(e) => setCourseForm({ ...courseForm, syllabus: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Syllabus Dropdown Sentences (Optional)</label><textarea rows={4} placeholder="One line per topic in format: Topic::Sentence" value={courseForm.syllabus_details} onChange={(e) => setCourseForm({ ...courseForm, syllabus_details: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Next Batch Starts Date</label><input required type="text" placeholder="e.g. 1st May, 2026" value={courseForm.next_batch_starts} onChange={(e) => setCourseForm({ ...courseForm, next_batch_starts: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Batch Summary (Optional)</label><textarea rows={3} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Batch Image</label><input type="file" accept="image/*" onChange={(e) => setCourseForm({ ...courseForm, file: e.target.files?.[0] || null })} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" /></div>
                <button type="submit" className="btn-primary w-full py-4 mt-4 text-lg">{editingCourse ? "Update Batch" : "Add Batch"}</button>
              </form>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Existing Batches</h3>
              <div className="space-y-4">
                {courses.length === 0 ? <p className="text-gray-500">No batches added yet.</p> : courses.map((course) => (
                  <div key={course.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      {course.image_url && <img src={course.image_url} alt="" className="w-12 h-12 rounded object-cover" />}
                      <div>
                        <h4 className="font-bold text-gray-900">{course.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">Duration: {course.duration || "-"} • Timing: {course.timing || "-"}</p>
                        <p className="text-xs text-gray-500">Next Batch: {course.next_batch_starts || "-"}</p>
                        {(() => {
                          const pricing = getCoursePricing(course);
                          if (!pricing) return null;
                          return (
                            <p className="text-xs text-gray-600 mt-1">
                              Fees: ₹{formatIndianCurrency(pricing.finalPrice)}
                              {pricing.discount > 0 && (
                                <>
                                  <span className="mx-1 text-gray-400 line-through">₹{formatIndianCurrency(pricing.fees)}</span>
                                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">-{pricing.discount}%</span>
                                </>
                              )}
                            </p>
                          );
                        })()}
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1 max-w-sm">{course.description || course.benefits || "-"}</p>
                        {parseBatchList(course.syllabus).length > 0 && (
                          <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden max-w-sm">
                            <button
                              type="button"
                              onClick={() => setOpenBatchSyllabusKey(openBatchSyllabusKey === `batch-${course.id}` ? null : `batch-${course.id}`)}
                              className="w-full px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-between"
                            >
                              <span>Syllabus Details</span>
                              <ChevronDown className={`w-4 h-4 transition-transform ${openBatchSyllabusKey === `batch-${course.id}` ? "rotate-180" : ""}`} />
                            </button>
                            {openBatchSyllabusKey === `batch-${course.id}` && (
                              <div className="p-3 bg-white space-y-2">
                                {parseBatchList(course.syllabus).map((item, idx) => (
                                  <div key={`${course.id}-syll-${idx}`} className="text-xs text-gray-600">
                                    • {item}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleEditCourse(course)} className="text-blue-500 bg-blue-50 p-3 rounded-lg hover:bg-blue-100"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="text-red-500 bg-red-50 p-3 rounded-lg hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BLOGS */}
        {activeTab === "blogs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-secondary" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingBlog ? "Edit Blog" : "Publish Blog"}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsEditorFullScreen(!isEditorFullScreen)} className="text-gray-500 hover:text-gray-900">
                    {isEditorFullScreen ? <X /> : <Maximize />}
                  </button>
                  {editingBlog && (
                    <button onClick={handleCancelEdit} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              <form onSubmit={handleBlogSubmit} className="space-y-5">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Blog Title</label><input required type="text" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Author</label><input type="text" placeholder="Admin" value={blogForm.author} onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {availableBlogTags.map((tag) => {
                      const selected = blogForm.tags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleBlogTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selected ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-300 hover:border-primary/60"}`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                      placeholder="Add custom tag (e.g. OCM)"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
                    >
                      Add Tag
                    </button>
                  </div>

                  {blogForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {blogForm.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {tag}
                          <button
                            type="button"
                            onClick={() => toggleBlogTag(tag)}
                            className="text-primary/80 hover:text-primary"
                            aria-label={`Remove ${tag}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Content</label>
                  <RichTextEditor
                    value={blogForm.content}
                    onChange={(value) => setBlogForm({ ...blogForm, content: value })}
                    isFullScreen={isEditorFullScreen}
                    onCloseFullScreen={() => setIsEditorFullScreen(false)}
                  />
                </div>
                {blogValidationError && <p className="text-sm text-red-500">{blogValidationError}</p>}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cover Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setBlogForm({ ...blogForm, file: e.target.files?.[0] || null })} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
                  {editingBlog && editingBlog.image_url && (
                    <p className="text-xs text-gray-500 mt-2">
                      Current image is preserved. Upload a new one to replace it.
                    </p>
                  )}
                </div>
                <button disabled={blogSubmitting} type="submit" className="btn-primary w-full py-4 mt-4 text-lg disabled:opacity-60 disabled:cursor-not-allowed">
                  {blogSubmitting ? "Saving..." : editingBlog ? "Update Blog" : "Publish Blog"}
                </button>
              </form>
            </div>
            {!isEditorFullScreen && (
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Published Blogs</h3>
                  <button onClick={fetchBlogs} className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"><RefreshCw className="w-4 h-4" /> Refresh</button>
                </div>
                <div className="mb-6 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title, author or tag"
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-4">
                  {visibleBlogs.length === 0 ? <p className="text-gray-500">No blogs found.</p> : visibleBlogs.map((blog) => (
                    <div key={blog.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-primary/30 transition-all">
                      <div>
                        <h4 className="font-bold text-gray-900">{blog.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">By {blog.author} • {new Date(blog.created_at).toLocaleDateString()}</p>
                        {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {blog.tags.map((tag: string) => (
                              <span key={`${blog.id}-${tag}`} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/blogs/${blog.id}`} target="_blank" rel="noreferrer" className="text-emerald-600 bg-emerald-50 p-3 rounded-lg hover:bg-emerald-100" aria-label="View blog">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                        <button onClick={() => handleEditBlog(blog)} className="text-blue-500 bg-blue-50 p-3 rounded-lg hover:bg-blue-100">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button disabled={blogActionLoadingId === blog.id} onClick={() => handleDeleteBlog(blog.id)} className="text-red-500 bg-red-50 p-3 rounded-lg hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIDEOS */}
        {activeTab === "videos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <PlayCircle className="w-8 h-8 text-secondary" />
                <h3 className="text-2xl font-bold text-gray-900">Add YouTube Demo Video</h3>
              </div>
              <form onSubmit={handleVideoAdd} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Video Title</label>
                  <input required type="text" value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">YouTube URL</label>
                  <input required type="url" placeholder="https://www.youtube.com/watch?v=..." value={videoForm.youtube_url} onChange={e => setVideoForm({...videoForm, youtube_url: e.target.value})} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <button type="submit" className="btn-primary w-full py-4 mt-4 text-lg">Add Video</button>
              </form>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Existing Demo Videos</h3>
              <div className="space-y-4">
                {videos.length === 0 ? <p className="text-gray-500">No demo videos added yet.</p> : videos.map(video => (
                  <div key={video.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-primary/30 transition-all">
                    <div>
                      <h4 className="font-bold text-gray-900">{video.title}</h4>
                      <a href={video.youtube_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{video.youtube_url}</a>
                    </div>
                    <button onClick={() => handleDeleteVideo(video.id)} className="text-red-500 bg-red-50 p-3 rounded-lg hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-5 h-5"/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ADMISSIONS */}
        {activeTab === "admissions" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold text-gray-900">Enrollment Enquiries</h3>
              <button onClick={fetchAdmissions} className="btn-primary px-4 py-2 flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-sm border-b">
                    <th className="p-4">Date</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">School</th>
                  </tr>
                </thead>
                <tbody>
                  {admissions.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-6 text-gray-500">No enrollment enquiries found</td></tr>
                  ) : admissions.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-600">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-bold text-gray-900">{item.student_name}</td>
                      <td className="p-4 text-primary font-medium">{item.phone_number}</td>
                      <td className="p-4">{item.course}</td>
                      <td className="p-4 text-sm">{item.email || "-"}</td>
                      <td className="p-4 text-sm">{item.school_name || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAQS */}
        {activeTab === "faqs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-secondary" />
                <h3 className="text-2xl font-bold text-gray-900">Add New FAQ</h3>
              </div>
              <form onSubmit={handleFaqAdd} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select 
                    value={faqForm.category} 
                    onChange={e => setFaqForm({...faqForm, category: e.target.value})} 
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all bg-white"
                  >
                    <option>Admission FAQs</option>
                    <option>Syllabus FAQs</option>
                    <option>Subjects FAQs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Question</label>
                  <input required type="text" value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Answer</label>
                  <textarea required rows={4} value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all"></textarea>
                </div>
                <button type="submit" className="btn-primary w-full py-4 mt-4 text-lg">Add FAQ</button>
              </form>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Live Dynamic FAQs</h3>
              <div className="space-y-4">
                {faqs.length === 0 ? <p className="text-gray-500">No dynamic FAQs created yet.</p> : faqs.map(faq => (
                  <div key={faq.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-primary/30 transition-all">
                    <div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-sm mb-2 inline-block">{faq.category}</span>
                      <h4 className="font-bold text-gray-900">{faq.question}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{faq.answer}</p>
                    </div>
                    <button onClick={() => handleDeleteFaq(faq.id)} className="text-red-500 bg-red-50 p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 shrink-0 ml-4">
                      <Trash2 className="w-5 h-5"/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
