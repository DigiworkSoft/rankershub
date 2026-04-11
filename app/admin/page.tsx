"use client";

import { useState, useEffect } from "react";
import { Send, Book, FileText, CheckCircle, Clock, Trash2, RefreshCw, PlayCircle } from "lucide-react";

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

  const [courseForm, setCourseForm] = useState({ title: "", description: "", file: null as File | null });
  const [blogForm, setBlogForm] = useState<{ title: string; content: string; author: string; tags: string[]; file: File | null }>({ title: "", content: "", author: "", tags: [], file: null });
  const [videoForm, setVideoForm] = useState({ title: "", youtube_url: "" });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "Admission FAQs" });
  const [customTagInput, setCustomTagInput] = useState("");

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
  const fetchBlogs = async () => { const res = await fetch("/api/blogs"); const data = await res.json(); setBlogs(data || []); };
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

  const handleCourseUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", courseForm.title);
    formData.append("description", courseForm.description);
    if (courseForm.file) formData.append("image", courseForm.file);

    try {
      const res = await authedFetch("/api/admin/courses", { method: "POST", body: formData });
      if (res.ok) {
        alert("Course Uploaded successfully");
        setCourseForm({ title: "", description: "", file: null });
        fetchCourses();
      } else throw new Error();
    } catch { alert("Failed to upload course"); }
  };

  const handleBlogUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", blogForm.title);
    formData.append("content", blogForm.content);
    formData.append("author", blogForm.author);
    formData.append("tags", JSON.stringify(blogForm.tags));
    if (blogForm.file) formData.append("image", blogForm.file);

    try {
      const res = await authedFetch("/api/admin/blogs", { method: "POST", body: formData });
      if (res.ok) {
        alert("Blog Published successfully");
        setBlogForm({ title: "", content: "", author: "", tags: [], file: null });
        fetchBlogs();
      } else throw new Error();
    } catch { alert("Failed to publish blog"); }
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
  const handleDeleteBlog = async (id: number) => { if (!window.confirm("Delete?")) return; await authedFetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" }); fetchBlogs(); };
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
    { key: "courses", label: "Manage Courses" },
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
              <div className="flex items-center gap-3 mb-6"><Book className="w-8 h-8 text-secondary" /><h3 className="text-2xl font-bold text-gray-900">Upload New Course</h3></div>
              <form onSubmit={handleCourseUpload} className="space-y-5">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Course Title</label><input required type="text" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Description</label><textarea required rows={4} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Course Image</label><input type="file" accept="image/*" onChange={(e) => setCourseForm({ ...courseForm, file: e.target.files?.[0] || null })} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" /></div>
                <button type="submit" className="btn-primary w-full py-4 mt-4 text-lg">Upload Course</button>
              </form>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Existing Courses</h3>
              <div className="space-y-4">
                {courses.length === 0 ? <p className="text-gray-500">No courses uploaded yet.</p> : courses.map((course) => (
                  <div key={course.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      {course.image_url && <img src={course.image_url} alt="" className="w-12 h-12 rounded object-cover" />}
                      <div><h4 className="font-bold text-gray-900">{course.title}</h4><p className="text-sm text-gray-500 truncate max-w-sm">{course.description}</p></div>
                    </div>
                    <button onClick={() => handleDeleteCourse(course.id)} className="text-red-500 bg-red-50 p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
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
              <div className="flex items-center gap-3 mb-6"><FileText className="w-8 h-8 text-secondary" /><h3 className="text-2xl font-bold text-gray-900">Publish Blog</h3></div>
              <form onSubmit={handleBlogUpload} className="space-y-5">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Blog Title</label><input required type="text" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Author</label><input type="text" placeholder="Admin" value={blogForm.author} onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Content</label><textarea required rows={6} value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Cover Image</label><input type="file" accept="image/*" onChange={(e) => setBlogForm({ ...blogForm, file: e.target.files?.[0] || null })} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" /></div>
                <button type="submit" className="btn-primary w-full py-4 mt-4 text-lg">Publish Blog</button>
              </form>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Published Blogs</h3>
              <div className="space-y-4">
                {blogs.length === 0 ? <p className="text-gray-500">No blogs published yet.</p> : blogs.map((blog) => (
                  <div key={blog.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-primary/30 transition-all">
                    <div><h4 className="font-bold text-gray-900">{blog.title}</h4><p className="text-xs text-gray-500 mt-1">By {blog.author} • {new Date(blog.created_at).toLocaleDateString()}</p></div>
                    <button onClick={() => handleDeleteBlog(blog.id)} className="text-red-500 bg-red-50 p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>
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
                    <button onClick={() => handleDeleteVideo(video.id)} className="text-red-500 bg-red-50 p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100">
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
