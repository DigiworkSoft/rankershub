"use client";

import { useState, useEffect, useMemo } from "react";
import { Book, FileText, Trash2, RefreshCw, Edit, X, Maximize, ExternalLink, Search, ChevronDown, ChevronRight, Menu, MessageSquare, HelpCircle, Layers, LayoutDashboard, BookOpen, Eye, EyeOff, Link2, Image } from "lucide-react";
import RichTextEditor from "./_components/RichTextEditor";
import { PRESET_BLOG_TAGS } from "@/lib/blog-tags";

const formatDateTimeLocal = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const fetchCaptcha = async () => {
    try {
      const res = await fetch("/api/captcha");
      if (res.ok) {
        const data = await res.json();
        setCaptchaSvg(data.svg);
        setCaptchaToken(data.token);
        setCaptchaAnswer("");
      }
    } catch {
      // Fail silently
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      fetchCaptcha();
    }
  }, [isAuthenticated]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    courses: true,
    blogs: true,
    faqs: true,
    popups: true,
    resources: true,
    banners: true,
  });

  const [banners, setBanners] = useState<any[]>([]);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    page: "index",
    ranking: "0",
    is_active: "true",
    desktop_file: null as File | null,
    mobile_file: null as File | null,
  });
  const [bannerSubmitting, setBannerSubmitting] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [popups, setPopups] = useState<any[]>([]);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [editingPopup, setEditingPopup] = useState<any | null>(null);
  const [popupForm, setPopupForm] = useState<{
    title: string;
    description: string;
    ranking: string;
    duration: string;
    locations: string[];
    file: File | null;
  }>({
    title: "",
    description: "",
    ranking: "1",
    duration: "5",
    locations: [],
    file: null,
  });
  const [isEditorFullScreen, setIsEditorFullScreen] = useState(false);
  const [blogSubmitting, setBlogSubmitting] = useState(false);
  const [blogActionLoadingId, setBlogActionLoadingId] = useState<number | null>(null);
  const [blogSearch, setBlogSearch] = useState("");
  const [blogValidationError, setBlogValidationError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: number } | null>(null);
  const [enquiryPage, setEnquiryPage] = useState(1);
  const [enquiryMeta, setEnquiryMeta] = useState<any>(null);
  const [blogPage, setBlogPage] = useState(1);
  const [blogMeta, setBlogMeta] = useState<any>(null);
  const [coursePage, setCoursePage] = useState(1);
  const coursesPerPage = 5;
  const totalCoursePages = Math.ceil(courses.length / coursesPerPage);
  const startCourseIndex = (coursePage - 1) * coursesPerPage;
  const paginatedCourses = courses.slice(startCourseIndex, startCourseIndex + coursesPerPage);

  useEffect(() => {
    if (coursePage > 1 && startCourseIndex >= courses.length) {
      setCoursePage(Math.max(1, Math.ceil(courses.length / coursesPerPage)));
    }
  }, [courses.length, coursePage, coursesPerPage, startCourseIndex]);

  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => {
      setConfirmDelete(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarVisible(true);
      } else {
        setIsSidebarVisible(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarVisible(false);
    }
  }, [activeTab]);


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
    fee_plans: [] as Array<{ duration: string; fees: string; discount_percent: string; mode_of_learning: string }>,
    ranking: "0",
    syllabus_pdf: null as File | null,
    mode_of_learning: "Offline (Hybrid )",
  });
  const [removeSyllabusPdf, setRemoveSyllabusPdf] = useState(false);

  const addFeePlanRow = () => {
    setCourseForm((prev) => ({
      ...prev,
      fee_plans: [...prev.fee_plans, { duration: "", fees: "", discount_percent: "", mode_of_learning: "Offline (Hybrid )" }],
    }));
  };

  const removeFeePlanRow = (index: number) => {
    setCourseForm((prev) => ({
      ...prev,
      fee_plans: prev.fee_plans.filter((_, idx) => idx !== index),
    }));
  };

  const changeFeePlanRow = (index: number, field: "duration" | "fees" | "discount_percent" | "mode_of_learning", value: string) => {
    setCourseForm((prev) => ({
      ...prev,
      fee_plans: prev.fee_plans.map((plan, idx) => (idx === index ? { ...plan, [field]: value } : plan)),
    }));
  };

  const [blogForm, setBlogForm] = useState<{
    title: string;
    content: string;
    author: string;
    tags: string[];
    file: File | null;
    published_at: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    geo_region: string;
    geo_placename: string;
    geo_position: string;
    icbm: string;
    bypass_layout: boolean;
  }>({
    title: "",
    content: "",
    author: "Admin",
    tags: [],
    file: null,
    published_at: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    geo_region: "",
    geo_placename: "",
    geo_position: "",
    icbm: "",
    bypass_layout: false,
  });
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "Admission FAQs",
    meta_title: "",
    meta_description: "",
    geo_region: "",
    geo_placename: "",
    geo_position: "",
    icbm: "",
  });
  const [customTagInput, setCustomTagInput] = useState("");

  const [resourceCategories, setResourceCategories] = useState<any[]>([]);
  const [resourceLinks, setResourceLinks] = useState<any[]>([]);
  const [resourceLoading, setResourceLoading] = useState(false);

  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingLink, setEditingLink] = useState<any | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    ranking: "0",
  });

  const [linkForm, setLinkForm] = useState({
    category_id: "",
    title: "",
    url: "",
    group_name: "",
    ranking: "0",
    content: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    geo_region: "",
    geo_placename: "",
    geo_position: "",
    icbm: "",
    bypass_layout: false,
  });

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
        body: JSON.stringify({
          ...loginForm,
          captcha_token: captchaToken,
          captcha_answer: captchaAnswer,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || "Login failed");
        fetchCaptcha();
      }
    } catch {
      setLoginError("Connection error");
      fetchCaptcha();
    }
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

  const fetchEnquiries = async () => {
    const res = await authedFetch(`/api/admin/enquiries?page=${enquiryPage}&limit=10`);
    const data = await res.json();
    setEnquiries(data?.items || []);
    setEnquiryMeta(data?.meta || null);
  };
  const fetchCourses = async () => { const res = await fetch("/api/courses"); const data = await res.json(); setCourses(data || []); };
  const fetchBlogs = async () => {
    const queryParam = blogSearch.trim() ? `&q=${encodeURIComponent(blogSearch.trim())}` : "";
    const res = await authedFetch(`/api/admin/blogs?page=${blogPage}&limit=10${queryParam}`);
    const data = await res.json();
    setBlogs(data?.items || []);
    setBlogMeta(data?.meta || null);
  };
  const fetchFaqs = async () => { const res = await fetch("/api/faqs"); const data = await res.json(); setFaqs(data || []); };
  const fetchPopups = async () => {
    const res = await authedFetch("/api/admin/popups");
    const data = await res.json();
    setPopups(Array.isArray(data) ? data : []);
  };

  const fetchResources = async () => {
    setResourceLoading(true);
    try {
      const res = await authedFetch("/api/admin/resources");
      if (res.ok) {
        const data = await res.json();
        setResourceCategories(data.categories || []);
        setResourceLinks(data.links || []);
      }
    } catch {
      // silently ignore
    } finally {
      setResourceLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await authedFetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (_err) {
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === "dashboard") fetchStats();
    if (activeTab === "enquiries") fetchEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthenticated, enquiryPage]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === "blogs") fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthenticated, blogPage, blogSearch]);

  useEffect(() => {
    setBlogPage(1);
  }, [blogSearch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === "courses") fetchCourses();
    if (activeTab === "faqs") fetchFaqs();
    if (activeTab === "popups") fetchPopups();
    if (activeTab === "resources") fetchResources();
    if (activeTab === "banners") fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchBanners = async () => {
    try {
      const res = await authedFetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(Array.isArray(data) ? data : []);
      }
    } catch {
      // silently ignore
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title) {
      alert("Title is required");
      return;
    }
    if (!editingBanner && (!bannerForm.desktop_file || !bannerForm.mobile_file)) {
      alert("Both desktop and mobile banner images are required");
      return;
    }

    setBannerSubmitting(true);
    const formData = new FormData();
    formData.append("title", bannerForm.title);
    formData.append("page", bannerForm.page);
    formData.append("ranking", bannerForm.ranking);
    formData.append("is_active", bannerForm.is_active);
    if (bannerForm.desktop_file) {
      formData.append("desktop_image", bannerForm.desktop_file);
    }
    if (bannerForm.mobile_file) {
      formData.append("mobile_image", bannerForm.mobile_file);
    }

    try {
      const url = editingBanner ? `/api/admin/banners?id=${editingBanner.id}` : "/api/admin/banners";
      const method = editingBanner ? "PUT" : "POST";
      const res = await authedFetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        alert(editingBanner ? "Banner updated successfully" : "Banner created successfully");
        cancelBannerEdit();
        fetchBanners();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to save banner");
      }
    } catch (_err) {
      alert("An error occurred while saving the banner");
    } finally {
      setBannerSubmitting(false);
    }
  };

  const handleEditBanner = (banner: any) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      page: banner.page,
      ranking: String(banner.ranking),
      is_active: String(banner.is_active),
      desktop_file: null,
      mobile_file: null,
    });
    setTimeout(() => document.getElementById('add-banner-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const cancelBannerEdit = () => {
    setEditingBanner(null);
    setBannerForm({
      title: "",
      page: "index",
      ranking: "0",
      is_active: "true",
      desktop_file: null,
      mobile_file: null,
    });
  };

  const handleDeleteBanner = async (id: number) => {
    if (confirmDelete?.type === "banner" && confirmDelete.id === id) {
      try {
        const res = await authedFetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          setConfirmDelete(null);
          fetchBanners();
        } else {
          alert("Failed to delete banner");
        }
      } catch (_err) {
        alert("Failed to delete banner");
      }
    } else {
      setConfirmDelete({ type: "banner", id });
    }
  };

  const handleToggleBannerActive = async (banner: any) => {
    try {
      const formData = new FormData();
      formData.append("title", banner.title);
      formData.append("page", banner.page);
      formData.append("ranking", String(banner.ranking));
      formData.append("is_active", String(!banner.is_active));

      const res = await authedFetch(`/api/admin/banners?id=${banner.id}`, {
        method: "PUT",
        body: formData,
      });
      if (res.ok) {
        fetchBanners();
      } else {
        alert("Failed to toggle status");
      }
    } catch {
      alert("Failed to toggle status");
    }
  };

  const handleCourseUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseForm.title || !courseForm.duration || !courseForm.timing || !courseForm.benefits || !courseForm.syllabus || !courseForm.next_batch_starts) {
      alert("Please fill all required batch fields");
      return;
    }

    const rankingVal = parseInt(courseForm.ranking || "0", 10);
    if (isNaN(rankingVal) || rankingVal < 0) {
      alert("Course ranking must be a non-negative integer.");
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
    formData.append("fee_plans", JSON.stringify(courseForm.fee_plans || []));
    formData.append("ranking", String(rankingVal));
    formData.append("mode_of_learning", courseForm.mode_of_learning || "Offline (Hybrid )");
    if (courseForm.file) formData.append("image", courseForm.file);
    if (courseForm.syllabus_pdf) formData.append("syllabus_pdf", courseForm.syllabus_pdf);
    if (removeSyllabusPdf) formData.append("remove_syllabus_pdf", "true");

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
          fee_plans: [],
          ranking: "0",
          syllabus_pdf: null,
          mode_of_learning: "Offline (Hybrid )",
        });
        setRemoveSyllabusPdf(false);
        setEditingCourse(null);
        fetchCourses();
        if (!editingCourse) setCoursePage(1);
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.error || (editingCourse ? "Failed to update batch" : "Failed to add batch"));
      }
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
      fee_plans: course.fee_plans ? course.fee_plans.map((p: any) => ({
        duration: p.duration || "",
        fees: p.fees != null ? String(p.fees) : "",
        discount_percent: p.discount_percent != null ? String(p.discount_percent) : "",
        mode_of_learning: p.mode_of_learning || "Offline (Hybrid )",
      })) : [],
      ranking: course.ranking != null ? String(course.ranking) : "0",
      syllabus_pdf: null,
      mode_of_learning: course.mode_of_learning || "Offline (Hybrid )",
    });
    setRemoveSyllabusPdf(false);
    setTimeout(() => document.getElementById('add-batch-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
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
      fee_plans: [],
      ranking: "0",
      syllabus_pdf: null,
      mode_of_learning: "Offline (Hybrid )",
    });
    setRemoveSyllabusPdf(false);
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
    if (blogForm.published_at) {
      formData.append("published_at", new Date(blogForm.published_at).toISOString());
    }
    formData.append("meta_title", blogForm.meta_title || "");
    formData.append("meta_description", blogForm.meta_description || "");
    formData.append("meta_keywords", blogForm.meta_keywords || "");
    formData.append("geo_region", blogForm.geo_region || "");
    formData.append("geo_placename", blogForm.geo_placename || "");
    formData.append("geo_position", blogForm.geo_position || "");
    formData.append("icbm", blogForm.icbm || "");
    formData.append("bypass_layout", String(blogForm.bypass_layout));

    const url = editingBlog ? `/api/admin/blogs?id=${editingBlog.id}` : "/api/admin/blogs";
    const method = editingBlog ? "PUT" : "POST";

    try {
      setBlogSubmitting(true);
      const res = await authedFetch(url, { method, body: formData });
      if (res.ok) {
        await res.json();
        alert(`Blog ${editingBlog ? "updated" : "published"} successfully`);
        setBlogForm({
          title: "",
          content: "",
          author: "Admin",
          tags: [],
          file: null,
          published_at: "",
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          geo_region: "",
          geo_placename: "",
          geo_position: "",
          icbm: "",
          bypass_layout: false,
        });
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
      published_at: formatDateTimeLocal(blog.published_at),
      meta_title: blog.meta_title || "",
      meta_description: blog.meta_description || "",
      meta_keywords: blog.meta_keywords || "",
      geo_region: blog.geo_region || "",
      geo_placename: blog.geo_placename || "",
      geo_position: blog.geo_position || "",
      icbm: blog.icbm || "",
      bypass_layout: !!blog.bypass_layout,
    });
    setTimeout(() => document.getElementById('add-blog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleCancelEdit = () => {
    setEditingBlog(null);
    setBlogForm({
      title: "",
      content: "",
      author: "Admin",
      tags: [],
      file: null,
      published_at: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      geo_region: "",
      geo_placename: "",
      geo_position: "",
      icbm: "",
      bypass_layout: false,
    });
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


  
  const handleFaqAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editingFaq ? `/api/admin/faqs?id=${editingFaq.id}` : "/api/admin/faqs";
      const method = editingFaq ? "PUT" : "POST";
      const res = await authedFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqForm),
      });
      if (res.ok) {
        alert(editingFaq ? "FAQ updated successfully" : "FAQ added successfully");
        setFaqForm({
          question: "",
          answer: "",
          category: faqForm.category,
          meta_title: "",
          meta_description: "",
          geo_region: "",
          geo_placename: "",
          geo_position: "",
          icbm: "",
        });
        setEditingFaq(null);
        fetchFaqs();
      } else throw new Error();
    } catch { alert(editingFaq ? "Failed to update FAQ" : "Failed to add FAQ"); }
  };

  const handleEditFaq = (faq: any) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question || "",
      answer: faq.answer || "",
      category: faq.category || "Admission FAQs",
      meta_title: faq.meta_title || "",
      meta_description: faq.meta_description || "",
      geo_region: faq.geo_region || "",
      geo_placename: faq.geo_placename || "",
      geo_position: faq.geo_position || "",
      icbm: faq.icbm || "",
    });
    setTimeout(() => document.getElementById('add-faq-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const cancelFaqEdit = () => {
    setEditingFaq(null);
    setFaqForm({
      question: "",
      answer: "",
      category: "Admission FAQs",
      meta_title: "",
      meta_description: "",
      geo_region: "",
      geo_placename: "",
      geo_position: "",
      icbm: "",
    });
  };

  const handleDownloadSampleFaqJson = () => {
    const sample = [
      {
        category: "Admission FAQs",
        question: "What is the duration of the CA Foundation batch?",
        answer: "The duration is 6 months with extensive mock tests.",
        meta_title: "CA Foundation Batch Duration FAQ",
        meta_description: "Find out how long our CA Foundation coaching lasts and details on batch preparation.",
        geo_region: "IN-MH",
        geo_placename: "Pune",
        geo_position: "18.5204;73.8567",
        icbm: "18.5204, 73.8567"
      },
      {
        category: "Syllabus FAQs",
        question: "Is hardcopy study material provided?",
        answer: "Yes, premium hardcopy books and notes are provided to all students.",
        meta_title: "Study Material FAQ | RankersHub",
        meta_description: "Learn about the physical study guides, books, and prep materials included in our classes.",
        geo_region: "IN-MH",
        geo_placename: "Pune",
        geo_position: "18.5204;73.8567",
        icbm: "18.5204, 73.8567"
      }
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rankershub_faqs_sample.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFaqJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) {
          alert("Invalid format: JSON file must contain an array of FAQ objects.");
          return;
        }
        
        for (const item of parsed) {
          if (!item.question || !item.answer || !item.category) {
            alert("Validation error: Each FAQ object must contain 'question', 'answer', and 'category' fields.");
            return;
          }
        }

        const res = await authedFetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed)
        });

        if (res.ok) {
          alert("FAQs imported successfully!");
          fetchFaqs();
        } else {
          const errData = await res.json().catch(() => null);
          alert(errData?.error || "Failed to import FAQs.");
        }
      } catch (err: any) {
        alert("Failed to parse JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDeleteEnquiry = async (id: number) => {
    if (confirmDelete?.type === "enquiry" && confirmDelete.id === id) {
      await authedFetch(`/api/admin/enquiries?id=${id}`, { method: "DELETE" });
      setConfirmDelete(null);
      fetchEnquiries();
    } else {
      setConfirmDelete({ type: "enquiry", id });
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (confirmDelete?.type === "course" && confirmDelete.id === id) {
      await authedFetch(`/api/admin/courses?id=${id}`, { method: "DELETE" });
      setConfirmDelete(null);
      fetchCourses();
    } else {
      setConfirmDelete({ type: "course", id });
    }
  };

  const handleDeleteBlog = async (id: number) => {
    if (confirmDelete?.type === "blog" && confirmDelete.id === id) {
      try {
        setBlogActionLoadingId(id);
        const res = await authedFetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Failed to delete blog");
        }
        setConfirmDelete(null);
        await fetchBlogs();
      } catch (error: any) {
        alert(error.message || "Failed to delete blog");
      } finally {
        setBlogActionLoadingId(null);
      }
    } else {
      setConfirmDelete({ type: "blog", id });
    }
  };



  const handleDeleteFaq = async (id: number) => {
    if (confirmDelete?.type === "faq" && confirmDelete.id === id) {
      await authedFetch(`/api/admin/faqs?id=${id}`, { method: "DELETE" });
      setConfirmDelete(null);
      fetchFaqs();
    } else {
      setConfirmDelete({ type: "faq", id });
    }
  };

  const handlePopupAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!popupForm.title) {
      alert("Popup title is required");
      return;
    }
    if (popupForm.locations.length === 0) {
      alert("Please select at least one location");
      return;
    }

    const formData = new FormData();
    formData.append("title", popupForm.title);
    formData.append("description", popupForm.description);
    formData.append("ranking", popupForm.ranking);
    formData.append("duration", popupForm.duration);
    formData.append("locations", JSON.stringify(popupForm.locations));
    if (popupForm.file) {
      formData.append("image", popupForm.file);
    }

    try {
      const endpoint = editingPopup ? `/api/admin/popups?id=${editingPopup.id}` : "/api/admin/popups";
      const method = editingPopup ? "PUT" : "POST";
      const res = await authedFetch(endpoint, {
        method,
        body: formData,
      });

      if (res.ok) {
        alert(editingPopup ? "Popup updated successfully" : "Popup added successfully");
        setPopupForm({
          title: "",
          description: "",
          ranking: "1",
          duration: "5",
          locations: [],
          file: null,
        });
        setEditingPopup(null);
        fetchPopups();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save popup");
      }
    } catch {
      alert(editingPopup ? "Failed to update popup" : "Failed to add popup");
    }
  };

  const handleEditPopup = (popup: any) => {
    setEditingPopup(popup);
    setPopupForm({
      title: popup.title || "",
      description: popup.description || "",
      ranking: String(popup.ranking ?? "1"),
      duration: String(popup.duration ?? "5"),
      locations: popup.locations || [],
      file: null,
    });
    setTimeout(() => document.getElementById('add-popup-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const cancelPopupEdit = () => {
    setEditingPopup(null);
    setPopupForm({
      title: "",
      description: "",
      ranking: "1",
      duration: "5",
      locations: [],
      file: null,
    });
  };

  const handleDeletePopup = async (id: number) => {
    if (confirmDelete?.type === "popup" && confirmDelete.id === id) {
      const res = await authedFetch(`/api/admin/popups?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmDelete(null);
        fetchPopups();
      } else {
        alert("Failed to delete popup");
      }
    } else {
      setConfirmDelete({ type: "popup", id });
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert("Category name is required");
      return;
    }
    const rankingVal = parseInt(categoryForm.ranking || "0", 10);
    try {
      const endpoint = editingCategory 
        ? `/api/admin/resources?type=category&id=${editingCategory.id}` 
        : "/api/admin/resources?type=category";
      const method = editingCategory ? "PUT" : "POST";
      const res = await authedFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryForm.name,
          ranking: rankingVal,
        }),
      });
      if (res.ok) {
        alert(editingCategory ? "Category updated successfully" : "Category added successfully");
        setCategoryForm({ name: "", ranking: "0" });
        setEditingCategory(null);
        fetchResources();
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.error || "Failed to save category");
      }
    } catch {
      alert("Failed to save category");
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const titleTrimmed = linkForm.title.trim();
    const urlTrimmed = linkForm.url.trim();
    const contentTrimmed = linkForm.content.trim();
    if (!linkForm.category_id || !titleTrimmed || (!urlTrimmed && !contentTrimmed)) {
      alert("Category, title, and either URL or Page Content are required");
      return;
    }
    const rankingVal = parseInt(linkForm.ranking || "0", 10);
    try {
      const endpoint = editingLink 
        ? `/api/admin/resources?type=link&id=${editingLink.id}` 
        : "/api/admin/resources?type=link";
      const method = editingLink ? "PUT" : "POST";
      const res = await authedFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: Number(linkForm.category_id),
          title: titleTrimmed,
          url: urlTrimmed || "/",
          group_name: linkForm.group_name || null,
          ranking: rankingVal,
          content: contentTrimmed || null,
          meta_title: linkForm.meta_title || null,
          meta_description: linkForm.meta_description || null,
          meta_keywords: linkForm.meta_keywords || null,
          geo_region: linkForm.geo_region || null,
          geo_placename: linkForm.geo_placename || null,
          geo_position: linkForm.geo_position || null,
          icbm: linkForm.icbm || null,
          bypass_layout: linkForm.bypass_layout,
        }),
      });
      if (res.ok) {
        alert(editingLink ? "Link updated successfully" : "Link added successfully");
        setLinkForm({
          category_id: linkForm.category_id,
          title: "",
          url: "",
          group_name: "",
          ranking: "0",
          content: "",
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          geo_region: "",
          geo_placename: "",
          geo_position: "",
          icbm: "",
          bypass_layout: false,
        });
        setEditingLink(null);
        fetchResources();
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.error || "Failed to save link");
      }
    } catch {
      alert("Failed to save link");
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || "",
      ranking: String(category.ranking ?? "0"),
    });
    setTimeout(() => document.getElementById('add-category-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", ranking: "0" });
  };

  const handleEditLink = (link: any) => {
    setEditingLink(link);
    setLinkForm({
      category_id: String(link.category_id || ""),
      title: link.title || "",
      url: link.url || "",
      group_name: link.group_name || "",
      ranking: String(link.ranking ?? "0"),
      content: link.content || "",
      meta_title: link.meta_title || "",
      meta_description: link.meta_description || "",
      meta_keywords: link.meta_keywords || "",
      geo_region: link.geo_region || "",
      geo_placename: link.geo_placename || "",
      geo_position: link.geo_position || "",
      icbm: link.icbm || "",
      bypass_layout: !!link.bypass_layout,
    });
    setTimeout(() => document.getElementById('add-link-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const cancelLinkEdit = () => {
    setEditingLink(null);
    setLinkForm({
      category_id: "",
      title: "",
      url: "",
      group_name: "",
      ranking: "0",
      content: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      geo_region: "",
      geo_placename: "",
      geo_position: "",
      icbm: "",
      bypass_layout: false,
    });
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirmDelete?.type === "resource_category" && confirmDelete.id === id) {
      const res = await authedFetch(`/api/admin/resources?type=category&id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmDelete(null);
        fetchResources();
      } else {
        alert("Failed to delete category");
      }
    } else {
      setConfirmDelete({ type: "resource_category", id });
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (confirmDelete?.type === "resource_link" && confirmDelete.id === id) {
      const res = await authedFetch(`/api/admin/resources?type=link&id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmDelete(null);
        fetchResources();
      } else {
        alert("Failed to delete link");
      }
    } else {
      setConfirmDelete({ type: "resource_link", id });
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
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
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-3 pr-10 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {captchaSvg && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Security Code
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <div dangerouslySetInnerHTML={{ __html: captchaSvg }} className="flex-shrink-0" />
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
                <input
                  required
                  type="text"
                  placeholder="Enter code"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>
            )}
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <button disabled={loginLoading} type="submit" className="btn-primary w-full py-3">{loginLoading ? "Logging in..." : "Login"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex h-screen overflow-hidden relative">
      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarVisible && (
        <div 
          onClick={() => setIsSidebarVisible(false)}
          className="fixed inset-0 bg-black/30 z-30 md:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar */}
      <div className={`bg-white shadow-lg flex flex-col pt-8 border-r border-gray-100 h-full select-none transition-all duration-300 ease-in-out overflow-hidden z-40 md:z-auto ${
        isSidebarVisible 
          ? "w-64 translate-x-0 fixed md:relative" 
          : "w-64 -translate-x-full fixed md:relative md:w-0 md:-translate-x-full border-none shadow-none"
      }`}>
        <div className="flex items-center px-6 mb-6">
          <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
        </div>
        <button onClick={logout} className="mx-6 mb-6 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors">Logout</button>
        
        <div className="flex-1 overflow-y-auto space-y-2 px-3">
          {/* Dashboard - Direct Link */}
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === "dashboard" ? "bg-primary/5 text-primary font-bold" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span>Dashboard</span>
          </button>

          {/* Enquiries - Direct Link */}
          <button 
            onClick={() => setActiveTab("enquiries")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === "enquiries" ? "bg-primary/5 text-primary font-bold" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            <span>Enquiries</span>
          </button>

          {/* Manage Batches Accordion */}
          <div>
            <button 
              onClick={() => toggleSection("courses")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50 ${activeTab === "courses" ? "text-primary font-bold" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Book className="w-5 h-5 shrink-0" />
                <span>Manage Batches</span>
              </div>
              {expandedSections.courses ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>
            {expandedSections.courses && (
              <div className="ml-9 pl-2 border-l border-gray-100 mt-1 space-y-1">
                <button 
                  onClick={() => {
                    setActiveTab("courses");
                    setTimeout(() => document.getElementById("add-batch-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  + Add New Batch
                </button>
                <button 
                  onClick={() => {
                    setActiveTab("courses");
                    setTimeout(() => document.getElementById("existing-batches-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  View Batches
                </button>
              </div>
            )}
          </div>

          {/* Manage Blogs Accordion */}
          <div>
            <button 
              onClick={() => toggleSection("blogs")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50 ${activeTab === "blogs" ? "text-primary font-bold" : ""}`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 shrink-0" />
                <span>Manage Blogs</span>
              </div>
              {expandedSections.blogs ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>
            {expandedSections.blogs && (
              <div className="ml-9 pl-2 border-l border-gray-100 mt-1 space-y-1">
                <button 
                  onClick={() => {
                    setActiveTab("blogs");
                    setTimeout(() => document.getElementById("add-blog-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  + Publish Blog
                </button>
                <button 
                  onClick={() => {
                    setActiveTab("blogs");
                    setTimeout(() => document.getElementById("existing-blogs-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  View Published Blogs
                </button>
              </div>
            )}
          </div>

          {/* Manage FAQs Accordion */}
          <div>
            <button 
              onClick={() => toggleSection("faqs")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50 ${activeTab === "faqs" ? "text-primary font-bold" : ""}`}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span>Manage FAQs</span>
              </div>
              {expandedSections.faqs ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>
            {expandedSections.faqs && (
              <div className="ml-9 pl-2 border-l border-gray-100 mt-1 space-y-1">
                <button 
                  onClick={() => {
                    setActiveTab("faqs");
                    setTimeout(() => document.getElementById("add-faq-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  + Add New FAQ
                </button>
                <button 
                  onClick={() => {
                    setActiveTab("faqs");
                    setTimeout(() => document.getElementById("existing-faqs-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  View FAQs
                </button>
              </div>
            )}
          </div>

          {/* Manage Pop-ups Accordion */}
          <div>
            <button 
              onClick={() => toggleSection("popups")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50 ${activeTab === "popups" ? "text-primary font-bold" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 shrink-0" />
                <span>Manage Pop-ups</span>
              </div>
              {expandedSections.popups ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>
            {expandedSections.popups && (
              <div className="ml-9 pl-2 border-l border-gray-100 mt-1 space-y-1">
                <button 
                  onClick={() => {
                    setActiveTab("popups");
                    setTimeout(() => document.getElementById("add-popup-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  + Add New Pop-up
                </button>
                <button 
                  onClick={() => {
                    setActiveTab("popups");
                    setTimeout(() => document.getElementById("existing-popups-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  View Pop-ups
                </button>
              </div>
            )}
          </div>

          {/* Manage Resources Accordion */}
          <div>
            <button 
              onClick={() => toggleSection("resources")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50 ${activeTab === "resources" ? "text-primary font-bold" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Link2 className="w-5 h-5 shrink-0" />
                <span>Manage Resources</span>
              </div>
              {expandedSections.resources ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>
            {expandedSections.resources && (
              <div className="ml-9 pl-2 border-l border-gray-100 mt-1 space-y-1">
                <button 
                  onClick={() => {
                    setActiveTab("resources");
                    setTimeout(() => document.getElementById("add-category-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  Manage Categories
                </button>
                <button 
                  onClick={() => {
                    setActiveTab("resources");
                    setTimeout(() => document.getElementById("add-link-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  Manage Links
                </button>
              </div>
            )}
          </div>

          {/* Manage Banners Accordion */}
          <div>
            <button 
              onClick={() => toggleSection("banners")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50 ${activeTab === "banners" ? "text-primary font-bold" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Image className="w-5 h-5 shrink-0" />
                <span>Manage Banners</span>
              </div>
              {expandedSections.banners ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>
            {expandedSections.banners && (
              <div className="ml-9 pl-2 border-l border-gray-100 mt-1 space-y-1">
                <button 
                  onClick={() => {
                    setActiveTab("banners");
                    setTimeout(() => document.getElementById("add-banner-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  + Add New Banner
                </button>
                <button 
                  onClick={() => {
                    setActiveTab("banners");
                    setTimeout(() => document.getElementById("existing-banners-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  View Banners
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        {/* Top Navbar in Content Area */}
        <div className="h-16 border-b border-gray-100 bg-white flex items-center px-8 gap-4 shrink-0 justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="p-2 hover:bg-gray-50 rounded-xl border border-gray-200 text-gray-600 transition-colors"
              title={isSidebarVisible ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-gray-400 capitalize">{activeTab}</span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h3>
                <p className="text-gray-500 text-sm mt-1">Real-time stats and marketing insights.</p>
              </div>
              <button 
                onClick={fetchStats} 
                disabled={statsLoading}
                className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} /> 
                {statsLoading ? "Updating..." : "Refresh Stats"}
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Total Enquiries */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover-lift transition-all duration-300 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Enquiries</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{stats?.counts?.enquiries ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Active Batches */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover-lift transition-all duration-300 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Batches</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{stats?.counts?.courses ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Blogs & Pop-ups */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover-lift transition-all duration-300 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blogs & Popups</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">
                    {(stats?.counts?.blogs ?? 0) + (stats?.counts?.popups ?? 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                  <Layers className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: Dynamic Banners */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover-lift transition-all duration-300 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dynamic Banners</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{stats?.counts?.banners ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                  <Image className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* SVG Trend Chart */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h4 className="text-lg font-bold text-gray-900">Enquiry Trends (Last 14 Days)</h4>
                  <div className="flex gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-primary rounded-full" /> 
                      Quick Enquiries
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-[#10b981] rounded-full" /> 
                      Admission Enquiries
                    </span>
                  </div>
                </div>

                <div className="relative h-64 w-full">
                  {stats?.trend && stats.trend.length > 0 ? (
                    (() => {
                      const trend = stats.trend;
                      const maxVal = Math.max(...trend.map((t: any) => Math.max(t.enquiries || 0, t.admissions || 0)), 5);
                      const width = 600;
                      const height = 220;
                      const paddingX = 40;
                      const paddingY = 20;

                      const getX = (idx: number) => paddingX + (idx * (width - paddingX * 2)) / Math.max(trend.length - 1, 1);
                      const getY = (val: number) => height - paddingY - (val * (height - paddingY * 2)) / maxVal;

                      const ePoints = trend.map((t: any, i: number) => ({ x: getX(i), y: getY(t.enquiries || 0) }));
                      const aPoints = trend.map((t: any, i: number) => ({ x: getX(i), y: getY(t.admissions || 0) }));

                      const eLine = ePoints.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
                      const aLine = aPoints.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");

                      const eArea = `${eLine} L ${ePoints[ePoints.length-1].x} ${height - paddingY} L ${ePoints[0].x} ${height - paddingY} Z`;
                      const aArea = `${aLine} L ${aPoints[aPoints.length-1].x} ${height - paddingY} L ${aPoints[0].x} ${height - paddingY} Z`;

                      return (
                        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="gradient-enquiries" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="gradient-admissions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                            const y = paddingY + ratio * (height - paddingY * 2);
                            const valLabel = Math.round(maxVal * (1 - ratio));
                            return (
                              <g key={ratio} className="opacity-40">
                                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />
                                <text x={paddingX - 8} y={y + 4} fill="#9ca3af" fontSize="9" fontWeight="bold" textAnchor="end">{valLabel}</text>
                              </g>
                            );
                          })}

                          {/* Render Areas */}
                          {ePoints.length > 0 && <path d={eArea} fill="url(#gradient-enquiries)" />}
                          {aPoints.length > 0 && <path d={aArea} fill="url(#gradient-admissions)" />}

                          {/* Render Lines */}
                          {ePoints.length > 0 && <path d={eLine} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                          {aPoints.length > 0 && <path d={aLine} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

                          {/* Data points */}
                          {ePoints.map((p: any, idx: number) => (
                            <circle key={`e-${idx}`} cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2" className="hover:r-5 transition-all cursor-pointer" />
                          ))}
                          {aPoints.map((p: any, idx: number) => (
                            <circle key={`a-${idx}`} cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" className="hover:r-5 transition-all cursor-pointer" />
                          ))}

                          {/* X Axis Labels */}
                          {trend.map((t: any, i: number) => {
                            // Only show every 2nd or 3rd label to avoid clutter
                            if (i % 2 !== 0 && i !== trend.length - 1) return null;
                            const x = getX(i);
                            return (
                              <text key={`label-${i}`} x={x} y={height - 4} fill="#9ca3af" fontSize="9" fontWeight="semibold" textAnchor="middle">{t.date}</text>
                            );
                          })}
                        </svg>
                      );
                    })()
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                      No trend data available.
                    </div>
                  )}
                </div>
              </div>

              {/* Distribution Card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Course Interest Distribution</h4>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[200px] lg:max-h-none">
                  {!stats?.distribution || stats.distribution.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm py-12">
                      No enquiries registered yet.
                    </div>
                  ) : (
                    (() => {
                      const dist = stats.distribution;
                      const totalCount = dist.reduce((acc: number, item: any) => acc + item.count, 0);

                      return dist.map((item: any, idx: number) => {
                        const percent = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                        const colors = [
                          "bg-primary",
                          "bg-green-500",
                          "bg-yellow-500",
                          "bg-purple-500",
                          "bg-red-500"
                        ];
                        const barColor = colors[idx % colors.length];

                        return (
                          <div key={item.label} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-gray-700 truncate max-w-[170px]" title={item.label}>
                                {item.label}
                              </span>
                              <span className="text-gray-400 font-extrabold shrink-0">
                                {item.count} ({percent}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100">
                              <div 
                                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Management Shortcuts</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <button 
                  onClick={() => setActiveTab("courses")} 
                  className="p-4 rounded-2xl border border-gray-100 hover:border-primary/20 bg-gray-50/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <p className="font-bold text-gray-800 text-sm group-hover:text-primary">Batches & Courses</p>
                  <p className="text-xs text-gray-400 mt-1">Configure syllabus and pricing structure.</p>
                </button>
                <button 
                  onClick={() => setActiveTab("blogs")} 
                  className="p-4 rounded-2xl border border-gray-100 hover:border-primary/20 bg-gray-50/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <p className="font-bold text-gray-800 text-sm group-hover:text-primary">Publish Blogs</p>
                  <p className="text-xs text-gray-400 mt-1">Manage articles and news reports.</p>
                </button>
                <button 
                  onClick={() => setActiveTab("faqs")} 
                  className="p-4 rounded-2xl border border-gray-100 hover:border-primary/20 bg-gray-50/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <p className="font-bold text-gray-800 text-sm group-hover:text-primary">Manage FAQs</p>
                  <p className="text-xs text-gray-400 mt-1">Update general help questions.</p>
                </button>
                <button 
                  onClick={() => setActiveTab("popups")} 
                  className="p-4 rounded-2xl border border-gray-100 hover:border-primary/20 bg-gray-50/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <p className="font-bold text-gray-800 text-sm group-hover:text-primary">Banner Pop-ups</p>
                  <p className="text-xs text-gray-400 mt-1">Adjust overlay promotions and alerts.</p>
                </button>
                <button 
                  onClick={() => setActiveTab("resources")} 
                  className="p-4 rounded-2xl border border-gray-100 hover:border-primary/20 bg-gray-50/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <p className="font-bold text-gray-800 text-sm group-hover:text-primary">Manage Resources</p>
                  <p className="text-xs text-gray-400 mt-1">Configure categories and dropdown menu links.</p>
                </button>
                <button 
                  onClick={() => setActiveTab("banners")} 
                  className="p-4 rounded-2xl border border-gray-100 hover:border-primary/20 bg-gray-50/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <p className="font-bold text-gray-800 text-sm group-hover:text-primary">Manage Banners</p>
                  <p className="text-xs text-gray-400 mt-1">Configure home and batches carousels.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ENQUIRIES */}
        {activeTab === "enquiries" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold text-gray-900">Recent Enquiries</h3>
              <button onClick={fetchEnquiries} className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"><RefreshCw className="w-4 h-4" /> Refresh</button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-sm border-b"><th className="p-4">Date</th><th className="p-4">Name</th><th className="p-4">Phone</th><th className="p-4">Batch</th><th className="p-4">Message</th><th className="p-4 text-right">Actions</th></tr></thead>
                  <tbody>
                    {enquiries.length === 0 ? (<tr><td colSpan={6} className="text-center p-6 text-gray-500">No enquiries found</td></tr>) : enquiries.map((enq) => (
                      <tr key={enq.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-gray-600">{new Date(enq.created_at).toLocaleDateString()}</td>
                        <td className="p-4 font-bold text-gray-900">{enq.full_name}</td>
                        <td className="p-4 text-primary font-medium">{enq.phone_number}</td>
                        <td className="p-4"><span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">{enq.batch}</span></td>
                        <td className="p-4 text-sm text-gray-600">{enq.message || "-"}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteEnquiry(enq.id)} className={`p-2 rounded-lg transition-colors text-xs font-bold ${confirmDelete?.type === "enquiry" && confirmDelete.id === enq.id ? "bg-red-600 text-white hover:bg-red-700 px-3 py-2" : "text-red-500 bg-red-50 hover:text-red-700"}`}>
                            {confirmDelete?.type === "enquiry" && confirmDelete.id === enq.id ? "Confirm?" : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {enquiries.length === 0 ? (
                  <p className="text-center p-6 text-gray-500">No enquiries found</p>
                ) : enquiries.map((enq) => (
                  <div key={enq.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{enq.full_name}</p>
                        <p className="text-primary font-medium text-sm">{enq.phone_number}</p>
                      </div>
                      <button onClick={() => handleDeleteEnquiry(enq.id)} className={`shrink-0 p-2 rounded-lg transition-colors text-xs font-bold ${confirmDelete?.type === "enquiry" && confirmDelete.id === enq.id ? "bg-red-600 text-white hover:bg-red-700 px-3 py-2" : "text-red-500 bg-red-50 hover:text-red-700"}`}>
                        {confirmDelete?.type === "enquiry" && confirmDelete.id === enq.id ? "Confirm?" : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-semibold text-gray-700">{enq.batch}</span>
                      <span className="text-xs text-gray-400">{new Date(enq.created_at).toLocaleDateString()}</span>
                    </div>
                    {enq.message && <p className="text-xs text-gray-500 leading-relaxed">{enq.message}</p>}
                  </div>
                ))}
              </div>
            </div>
            {enquiryMeta && enquiryMeta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  disabled={!enquiryMeta.hasPrev}
                  onClick={() => setEnquiryPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-gray-500">
                  Page {enquiryMeta.page} of {enquiryMeta.totalPages}
                </span>
                <button
                  disabled={!enquiryMeta.hasNext}
                  onClick={() => setEnquiryPage((p) => Math.min(enquiryMeta.totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* COURSES */}
        {activeTab === "courses" && (
          <div className="space-y-10">
            <div id="add-batch-section" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Default Fees (₹)</label><input type="number" min="0" step="1" placeholder="e.g. 36000" value={courseForm.fees} onChange={(e) => setCourseForm({ ...courseForm, fees: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Default Discount (%)</label><input type="number" min="0" max="100" step="0.01" placeholder="e.g. 15" value={courseForm.discount_percent} onChange={(e) => setCourseForm({ ...courseForm, discount_percent: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mode of learning</label>
                    <select
                      value={courseForm.mode_of_learning || "Offline (Hybrid )"}
                      onChange={(e) => setCourseForm({ ...courseForm, mode_of_learning: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none bg-white transition-all cursor-pointer text-sm"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline (Hybrid )">Offline (Hybrid )</option>
                      <option value="Recorded">Recorded</option>
                    </select>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Dynamic Fee Plans</span>
                    <button
                      type="button"
                      onClick={addFeePlanRow}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
                    >
                      + Add Plan
                    </button>
                  </div>
                  {(!courseForm.fee_plans || courseForm.fee_plans.length === 0) ? (
                    <p className="text-xs text-gray-500 italic">No dynamic fee plans added yet. Click &quot;+ Add Plan&quot; to set multiple pricing tiers.</p>
                  ) : (
                    <div className="space-y-3">
                      {courseForm.fee_plans.map((plan, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-fadeIn flex-wrap sm:flex-nowrap">
                          <div className="flex-1 min-w-[120px]">
                            <input
                              required
                              type="text"
                              placeholder="Duration (e.g. 1 Year)"
                              value={plan.duration}
                              onChange={(e) => changeFeePlanRow(idx, "duration", e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                          </div>
                          <div className="w-24 sm:w-28">
                            <input
                              required
                              type="number"
                              min="0"
                              placeholder="Fees (₹)"
                              value={plan.fees}
                              onChange={(e) => changeFeePlanRow(idx, "fees", e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                          </div>
                          <div className="w-20 sm:w-24">
                            <input
                              required
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="Discount %"
                              value={plan.discount_percent}
                              onChange={(e) => changeFeePlanRow(idx, "discount_percent", e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                          </div>
                          <div className="w-32 sm:w-36">
                            <select
                              value={plan.mode_of_learning || "Offline (Hybrid )"}
                              onChange={(e) => changeFeePlanRow(idx, "mode_of_learning", e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-primary transition-all bg-white cursor-pointer"
                            >
                              <option value="Online">Online</option>
                              <option value="Offline (Hybrid )">Offline (Hybrid )</option>
                              <option value="Recorded">Recorded</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFeePlanRow(idx)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Benefits of Joining</label><textarea required rows={4} placeholder="One benefit per line" value={courseForm.benefits} onChange={(e) => setCourseForm({ ...courseForm, benefits: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Course Syllabus</label><textarea required rows={4} placeholder="One syllabus topic per line" value={courseForm.syllabus} onChange={(e) => setCourseForm({ ...courseForm, syllabus: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Syllabus Dropdown Sentences (Optional)</label><textarea rows={4} placeholder="One line per topic in format: Topic::Sentence" value={courseForm.syllabus_details} onChange={(e) => setCourseForm({ ...courseForm, syllabus_details: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Next Batch Starts Date</label>
                    <input required type="text" placeholder="e.g. 1st May, 2026" value={courseForm.next_batch_starts} onChange={(e) => setCourseForm({ ...courseForm, next_batch_starts: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Course Ranking (Non-negative Integer)</label>
                    <input required type="number" min="0" step="1" placeholder="e.g. 1" value={courseForm.ranking} onChange={(e) => setCourseForm({ ...courseForm, ranking: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                </div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Batch Summary (Optional)</label><textarea rows={3} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Batch Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setCourseForm({ ...courseForm, file: e.target.files?.[0] || null })} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Course Syllabus PDF (Optional, Max 10MB)</label>
                    <input type="file" accept=".pdf" onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && file.size > 10 * 1024 * 1024) {
                        alert("File too large. Maximum size is 10MB.");
                        e.target.value = "";
                        return;
                      }
                      if (file && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
                        alert("Invalid file type. Only PDF files are allowed.");
                        e.target.value = "";
                        return;
                      }
                      setCourseForm({ ...courseForm, syllabus_pdf: file });
                    }} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
                    {editingCourse && editingCourse.syllabus_pdf && (
                      <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 w-fit">
                        <span className="text-gray-500">Current PDF:</span>
                        <a href={editingCourse.syllabus_pdf} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          View PDF <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <label className="flex items-center gap-1.5 ml-4 cursor-pointer text-red-500 hover:text-red-700">
                          <input type="checkbox" checked={removeSyllabusPdf} onChange={(e) => setRemoveSyllabusPdf(e.target.checked)} className="rounded text-red-500 focus:ring-red-400" />
                          Remove PDF
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-4 mt-4 text-lg">{editingCourse ? "Update Batch" : "Add Batch"}</button>
              </form>
            </div>
            <div id="existing-batches-section">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Existing Batches</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-sm border-b">
                        <th className="p-4">Batch</th>
                        <th className="p-4">Ranking</th>
                        <th className="p-4">Schedule</th>
                        <th className="p-4">Default Price</th>
                        <th className="p-4">Fee Plans</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCourses.length === 0 ? (
                        <tr><td colSpan={6} className="text-center p-6 text-gray-500">No batches added yet.</td></tr>
                      ) : (
                        paginatedCourses.map((course) => {
                          const pricing = getCoursePricing(course);
                          return (
                            <tr key={course.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {course.image_url ? (
                                    <img src={course.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                                  ) : (
                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400"><Book className="w-5 h-5" /></div>
                                  )}
                                  <div>
                                    <p className="font-bold text-gray-900">{course.title}</p>
                                    <p className="text-xs text-gray-500 mt-1 max-w-[250px] line-clamp-2">{course.description || course.benefits || "-"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-sm font-semibold text-gray-700">
                                {course.ranking ?? 0}
                              </td>
                              <td className="p-4 text-sm text-gray-600">
                                <p><span className="font-semibold text-gray-900">Duration:</span> {course.duration || "-"}</p>
                                <p className="text-xs mt-0.5"><span className="font-semibold text-gray-900">Timing:</span> {course.timing || "-"}</p>
                                <p className="text-xs mt-0.5"><span className="font-semibold text-gray-900">Starts:</span> {course.next_batch_starts || "-"}</p>
                              </td>
                              <td className="p-4 text-sm text-gray-600">
                                {pricing ? (
                                  <div>
                                    <p className="font-semibold text-gray-900">₹{formatIndianCurrency(pricing.finalPrice)}</p>
                                    {pricing.discount > 0 && (
                                      <p className="text-xs text-gray-400">
                                        <span className="line-through">₹{formatIndianCurrency(pricing.fees)}</span>
                                        <span className="ml-1 text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-[10px] font-semibold">-{pricing.discount}%</span>
                                      </p>
                                    )}
                                    <p className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-semibold w-fit mt-1 uppercase tracking-wider">{course.mode_of_learning || "Offline (Hybrid )"}</p>
                                  </div>
                                ) : <span className="text-gray-400">-</span>}
                              </td>
                              <td className="p-4 text-sm text-gray-600">
                                {course.fee_plans && course.fee_plans.length > 0 ? (
                                  <div className="space-y-1">
                                    {course.fee_plans.map((plan: any) => {
                                      const planFees = Number(plan.fees);
                                      const planDiscount = Number(plan.discount_percent);
                                      const planFinal = planFees - (planFees * planDiscount) / 100;
                                      return (
                                        <div key={plan.id} className="text-xs flex items-center gap-1.5 flex-wrap">
                                          <span className="bg-primary/5 text-primary px-1.5 py-0.5 rounded text-[10px] font-semibold">{plan.duration} ({plan.mode_of_learning || "Offline (Hybrid )"})</span>
                                          <span className="font-bold text-gray-800">₹{formatIndianCurrency(planFinal)}</span>
                                          {planDiscount > 0 && <span className="text-[10px] text-green-600">(-{planDiscount}%)</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : <span className="text-xs text-gray-400 italic">No custom plans</span>}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditCourse(course)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors" aria-label="Edit batch"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteCourse(course.id)} className={`p-2 rounded-lg transition-colors text-xs font-bold ${confirmDelete?.type === "course" && confirmDelete.id === course.id ? "bg-red-600 text-white hover:bg-red-700 px-3" : "text-red-500 bg-red-50 hover:bg-red-100"}`}>
                                    {confirmDelete?.type === "course" && confirmDelete.id === course.id ? "Confirm?" : <Trash2 className="w-4 h-4" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {paginatedCourses.length === 0 ? (
                    <p className="text-center p-6 text-gray-500">No batches added yet.</p>
                  ) : paginatedCourses.map((course) => {
                    const pricing = getCoursePricing(course);
                    return (
                      <div key={course.id} className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          {course.image_url ? (
                            <img src={course.image_url} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"><Book className="w-5 h-5" /></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm">{course.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{course.description || course.benefits || "-"}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handleEditCourse(course)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors" aria-label="Edit batch"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteCourse(course.id)} className={`p-2 rounded-lg transition-colors text-xs font-bold ${confirmDelete?.type === "course" && confirmDelete.id === course.id ? "bg-red-600 text-white hover:bg-red-700 px-3" : "text-red-500 bg-red-50 hover:bg-red-100"}`}>
                              {confirmDelete?.type === "course" && confirmDelete.id === course.id ? "Confirm?" : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div><span className="font-semibold text-gray-900">Duration:</span> {course.duration || "-"}</div>
                          <div><span className="font-semibold text-gray-900">Timing:</span> {course.timing || "-"}</div>
                          <div><span className="font-semibold text-gray-900">Starts:</span> {course.next_batch_starts || "-"}</div>
                          <div><span className="font-semibold text-gray-900">Ranking:</span> {course.ranking ?? 0}</div>
                          {pricing && (
                            <div>
                              <span className="font-semibold text-gray-900">Price:</span> ₹{formatIndianCurrency(pricing.finalPrice)}
                              {pricing.discount > 0 && <span className="ml-1 text-green-700 bg-green-50 px-1 py-0.5 rounded text-[10px] font-semibold">-{pricing.discount}%</span>}
                            </div>
                          )}
                        </div>
                        {course.fee_plans && course.fee_plans.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {course.fee_plans.map((plan: any) => {
                              const planFees = Number(plan.fees);
                              const planDiscount = Number(plan.discount_percent);
                              const planFinal = planFees - (planFees * planDiscount) / 100;
                              return (
                                <span key={plan.id} className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded font-semibold">
                                  {plan.duration} ({plan.mode_of_learning || "Offline (Hybrid )"}): ₹{formatIndianCurrency(planFinal)}{planDiscount > 0 && ` (-${planDiscount}%)`}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {totalCoursePages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6 pb-6 border-t border-gray-100 pt-4">
                    <button
                      disabled={coursePage === 1}
                      onClick={() => setCoursePage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-semibold text-gray-500">
                      Page {coursePage} of {totalCoursePages}
                    </span>
                    <button
                      disabled={coursePage === totalCoursePages}
                      onClick={() => setCoursePage((p) => Math.min(totalCoursePages, p + 1))}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BLOGS */}
        {activeTab === "blogs" && (
          <div className="space-y-10">
            <div id="add-blog-section" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
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
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                  <input
                    type="checkbox"
                    id="blog-bypass-layout"
                    checked={blogForm.bypass_layout}
                    onChange={(e) => setBlogForm({ ...blogForm, bypass_layout: e.target.checked })}
                    className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="blog-bypass-layout" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                    Bypass Standard Layout (Render raw HTML page content directly, hiding headers/footers)
                  </label>
                </div>
                {blogValidationError && <p className="text-sm text-red-500">{blogValidationError}</p>}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Publish Date & Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={blogForm.published_at}
                    onChange={(e) => setBlogForm({ ...blogForm, published_at: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all text-sm bg-gray-50/50"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave blank to publish immediately.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cover Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setBlogForm({ ...blogForm, file: e.target.files?.[0] || null })} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
                  {editingBlog && editingBlog.image_url && (
                    <p className="text-xs text-gray-500 mt-2">
                      Current image is preserved. Upload a new one to replace it.
                    </p>
                  )}
                </div>
                {/* SEO & Geo Optimization Section */}
                <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 space-y-4">
                  <h4 className="text-sm font-bold text-gray-900">SEO & Local Geo-Tagging Optimization (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Meta Title</label>
                      <input type="text" placeholder="e.g. Best Commerce Academy in Pune" value={blogForm.meta_title} onChange={e => setBlogForm({...blogForm, meta_title: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Meta Keywords (Comma separated)</label>
                      <input type="text" placeholder="e.g. commerce, CA Foundation, Pune" value={blogForm.meta_keywords} onChange={e => setBlogForm({...blogForm, meta_keywords: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Meta Description</label>
                    <textarea rows={2} placeholder="A short description boosting click rates in search engines" value={blogForm.meta_description} onChange={e => setBlogForm({...blogForm, meta_description: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Geo Region</label>
                      <input type="text" placeholder="e.g. IN-MH" value={blogForm.geo_region} onChange={e => setBlogForm({...blogForm, geo_region: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Geo Placename</label>
                      <input type="text" placeholder="e.g. Pune" value={blogForm.geo_placename} onChange={e => setBlogForm({...blogForm, geo_placename: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Geo Position (Latitude;Longitude)</label>
                      <input type="text" placeholder="e.g. 18.5204;73.8567" value={blogForm.geo_position} onChange={e => setBlogForm({...blogForm, geo_position: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">ICBM Coordinates (Latitude, Longitude)</label>
                      <input type="text" placeholder="e.g. 18.5204, 73.8567" value={blogForm.icbm} onChange={e => setBlogForm({...blogForm, icbm: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                </div>
                <button disabled={blogSubmitting} type="submit" className="btn-primary w-full py-4 mt-4 text-lg disabled:opacity-60 disabled:cursor-not-allowed">
                  {blogSubmitting ? "Saving..." : editingBlog ? "Update Blog" : "Publish Blog"}
                </button>
              </form>
            </div>
            {!isEditorFullScreen && (
              <div id="existing-blogs-section">
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-sm border-b">
                          <th className="p-4">Blog</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Published At</th>
                          <th className="p-4">Tags</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogs.length === 0 ? (
                          <tr><td colSpan={5} className="text-center p-6 text-gray-500">No blogs found.</td></tr>
                        ) : (
                          blogs.map((blog) => (
                            <tr key={blog.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="p-4">
                                <p className="font-bold text-gray-900">{blog.title}</p>
                                <p className="text-xs text-gray-500">By {blog.author}</p>
                              </td>
                              <td className="p-4 text-sm">
                                {new Date(blog.published_at) > new Date() ? (
                                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Scheduled</span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Live</span>
                                )}
                              </td>
                              <td className="p-4 text-sm text-gray-600">{new Date(blog.published_at).toLocaleString()}</td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {Array.isArray(blog.tags) && blog.tags.map((tag: string) => (
                                    <span key={`${blog.id}-${tag}`} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <a href={`/blogs/${blog.id}`} target="_blank" rel="noreferrer" className="text-emerald-600 bg-emerald-50 p-2 rounded-lg hover:bg-emerald-100 transition-colors" aria-label="View blog"><ExternalLink className="w-4 h-4" /></a>
                                  <button onClick={() => handleEditBlog(blog)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors" aria-label="Edit blog"><Edit className="w-4 h-4" /></button>
                                  <button disabled={blogActionLoadingId === blog.id} onClick={() => handleDeleteBlog(blog.id)} className={`p-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-xs font-bold ${confirmDelete?.type === "blog" && confirmDelete.id === blog.id ? "bg-red-600 text-white hover:bg-red-700 px-3" : "text-red-500 bg-red-50 hover:bg-red-100"}`}>
                                    {confirmDelete?.type === "blog" && confirmDelete.id === blog.id ? "Confirm?" : <Trash2 className="w-4 h-4" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {blogs.length === 0 ? (
                      <p className="text-center p-6 text-gray-500">No blogs found.</p>
                    ) : blogs.map((blog) => (
                      <div key={blog.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm leading-snug">{blog.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">By {blog.author}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <a href={`/blogs/${blog.id}`} target="_blank" rel="noreferrer" className="text-emerald-600 bg-emerald-50 p-2 rounded-lg hover:bg-emerald-100 transition-colors" aria-label="View blog"><ExternalLink className="w-4 h-4" /></a>
                            <button onClick={() => handleEditBlog(blog)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors" aria-label="Edit blog"><Edit className="w-4 h-4" /></button>
                            <button disabled={blogActionLoadingId === blog.id} onClick={() => handleDeleteBlog(blog.id)} className={`p-2 rounded-lg disabled:opacity-60 transition-colors text-xs font-bold ${confirmDelete?.type === "blog" && confirmDelete.id === blog.id ? "bg-red-600 text-white hover:bg-red-700 px-3" : "text-red-500 bg-red-50 hover:bg-red-100"}`}>
                              {confirmDelete?.type === "blog" && confirmDelete.id === blog.id ? "Confirm?" : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {new Date(blog.published_at) > new Date() ? (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Scheduled</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Live</span>
                          )}
                          <span className="text-xs text-gray-400">{new Date(blog.published_at).toLocaleDateString()}</span>
                        </div>
                        {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {blog.tags.map((tag: string) => (
                              <span key={`${blog.id}-${tag}`} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {blogMeta && blogMeta.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      disabled={!blogMeta.hasPrev}
                      onClick={() => setBlogPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-semibold text-gray-500">
                      Page {blogMeta.page} of {blogMeta.totalPages}
                    </span>
                    <button
                      disabled={!blogMeta.hasNext}
                      onClick={() => setBlogPage((p) => Math.min(blogMeta.totalPages, p + 1))}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}



        {/* FAQS */}
        {activeTab === "faqs" && (
          <div className="space-y-10">
            <div id="add-faq-section" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-secondary" />
                  <h3 className="text-2xl font-bold text-gray-900">{editingFaq ? "Edit FAQ" : "Add New FAQ"}</h3>
                </div>
                {editingFaq && (
                  <button onClick={cancelFaqEdit} className="text-sm font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
                )}
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

                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-4">
                  <h4 className="text-sm font-bold text-gray-800">SEO & Geo Targeting Metadata (Optional)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Meta Title</label>
                      <input type="text" value={faqForm.meta_title} onChange={e => setFaqForm({...faqForm, meta_title: e.target.value})} placeholder="e.g. CA Foundation Course Duration FAQ" className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-primary transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Meta Description</label>
                      <input type="text" value={faqForm.meta_description} onChange={e => setFaqForm({...faqForm, meta_description: e.target.value})} placeholder="e.g. Details about CA Foundation coaching duration..." className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-primary transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Geo Region</label>
                      <input type="text" value={faqForm.geo_region} onChange={e => setFaqForm({...faqForm, geo_region: e.target.value})} placeholder="e.g. IN-MH" className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-primary transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Geo Placename</label>
                      <input type="text" value={faqForm.geo_placename} onChange={e => setFaqForm({...faqForm, geo_placename: e.target.value})} placeholder="e.g. Pune" className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-primary transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Geo Position</label>
                      <input type="text" value={faqForm.geo_position} onChange={e => setFaqForm({...faqForm, geo_position: e.target.value})} placeholder="e.g. 18.5204;73.8567" className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-primary transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">ICBM Coordinates</label>
                      <input type="text" value={faqForm.icbm} onChange={e => setFaqForm({...faqForm, icbm: e.target.value})} placeholder="e.g. 18.5204, 73.8567" className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-primary transition-all bg-white" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-4 mt-4 text-lg">{editingFaq ? "Update FAQ" : "Add FAQ"}</button>
              </form>

              <div className="border-t border-gray-100 pt-6 mt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/70 p-5 rounded-2xl border border-gray-200">
                  <div className="text-center md:text-left">
                    <h4 className="text-sm font-bold text-gray-800">Bulk Import FAQs</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Upload multiple FAQs with SEO metadata using a JSON or TXT file.</p>
                  </div>
                  <div className="flex gap-2.5 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={handleDownloadSampleFaqJson}
                      className="px-3.5 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
                    >
                      Download Sample File
                    </button>
                    <label className="px-3.5 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-xs font-bold hover:bg-secondary/20 transition-all cursor-pointer shadow-sm">
                      Import File (JSON/TXT)
                      <input
                        type="file"
                        accept=".json,.txt"
                        className="hidden"
                        onChange={handleImportFaqJson}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div id="existing-faqs-section">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Live Dynamic FAQs</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-sm border-b">
                        <th className="p-4">Category</th>
                        <th className="p-4">Question &amp; Answer</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faqs.length === 0 ? (
                        <tr><td colSpan={3} className="text-center p-6 text-gray-500">No dynamic FAQs created yet.</td></tr>
                      ) : (
                        faqs.map((faq) => (
                          <tr key={faq.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/10">{faq.category}</span>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-gray-900">{faq.question}</p>
                              <p className="text-sm text-gray-500 mt-1 max-w-xl">{faq.answer}</p>
                              {(faq.meta_title || faq.meta_description || faq.geo_region) && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {faq.meta_title && (
                                    <span className="text-[10px] text-gray-600 bg-gray-100 border px-1.5 py-0.5 rounded font-mono">
                                      Title: {faq.meta_title}
                                    </span>
                                  )}
                                  {faq.meta_description && (
                                    <span className="text-[10px] text-gray-600 bg-gray-100 border px-1.5 py-0.5 rounded font-mono">
                                      Desc: {faq.meta_description.length > 40 ? faq.meta_description.slice(0, 40) + "..." : faq.meta_description}
                                    </span>
                                  )}
                                  {faq.geo_region && (
                                    <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-mono">
                                      Geo: {faq.geo_region} ({faq.geo_placename || "No Placename"})
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleEditFaq(faq)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors" aria-label="Edit FAQ"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteFaq(faq.id)} className={`p-2 rounded-lg transition-colors text-xs font-bold ${confirmDelete?.type === "faq" && confirmDelete.id === faq.id ? "bg-red-600 text-white hover:bg-red-700 px-3" : "text-red-500 bg-red-50 hover:bg-red-100"}`}>
                                  {confirmDelete?.type === "faq" && confirmDelete.id === faq.id ? "Confirm?" : <Trash2 className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {faqs.length === 0 ? (
                    <p className="text-center p-6 text-gray-500">No dynamic FAQs created yet.</p>
                  ) : faqs.map((faq) => (
                    <div key={faq.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/10 shrink-0">{faq.category}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleEditFaq(faq)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors" aria-label="Edit FAQ"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteFaq(faq.id)} className={`p-2 rounded-lg transition-colors text-xs font-bold ${confirmDelete?.type === "faq" && confirmDelete.id === faq.id ? "bg-red-600 text-white hover:bg-red-700 px-3" : "text-red-500 bg-red-50 hover:bg-red-100"}`}>
                            {confirmDelete?.type === "faq" && confirmDelete.id === faq.id ? "Confirm?" : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{faq.question}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{faq.answer}</p>
                      {(faq.meta_title || faq.geo_region) && (
                        <div className="flex flex-wrap gap-1 mt-1 text-[9px] text-gray-500 font-mono">
                          {faq.meta_title && <span>SEO: {faq.meta_title} | </span>}
                          {faq.geo_region && <span>Geo: {faq.geo_region}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* POPUPS */}
        {activeTab === "popups" && (
          <div className="space-y-10">
            <div id="add-popup-section" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Layers className="w-8 h-8 text-secondary" />
                  <h3 className="text-2xl font-bold text-gray-900">{editingPopup ? "Edit Pop-up" : "Add New Pop-up"}</h3>
                </div>
                {editingPopup && (
                  <button onClick={cancelPopupEdit} className="text-sm font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
                )}
              </div>
              <form onSubmit={handlePopupAdd} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Pop-up Title</label>
                  <input required type="text" value={popupForm.title} onChange={e => setPopupForm({...popupForm, title: e.target.value})} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Short Description (Optional)</label>
                  <textarea rows={3} value={popupForm.description} onChange={e => setPopupForm({...popupForm, description: e.target.value})} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Priority Ranking (Lower = Higher Priority)</label>
                    <input required type="number" min="0" step="1" value={popupForm.ranking} onChange={e => setPopupForm({...popupForm, ranking: e.target.value})} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Duration (Seconds, 3 to 60)</label>
                    <input required type="number" min="3" max="60" step="1" value={popupForm.duration} onChange={e => setPopupForm({...popupForm, duration: e.target.value})} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Locations</label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { key: "landing", label: "Landing Page" },
                      { key: "about", label: "About Page" },
                      { key: "contact", label: "Contact Page" },
                      { key: "blogs", label: "Blogs Page" },
                    ].map((loc) => {
                      const isChecked = popupForm.locations.includes(loc.key);
                      return (
                        <label key={loc.key} className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-xl border hover:bg-gray-50 select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setPopupForm(prev => {
                                const exists = prev.locations.includes(loc.key);
                                return {
                                  ...prev,
                                  locations: exists 
                                    ? prev.locations.filter(l => l !== loc.key)
                                    : [...prev.locations, loc.key]
                                };
                              });
                            }}
                            className="rounded text-primary focus:ring-primary w-4 h-4"
                          />
                          <span className="text-sm font-semibold text-gray-700">{loc.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Pop-up Image (Optional)</label>
                  <input type="file" accept="image/*" onChange={(e) => setPopupForm({ ...popupForm, file: e.target.files?.[0] || null })} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
                  {editingPopup && editingPopup.image_url && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={editingPopup.image_url} alt="" className="w-20 h-20 rounded object-cover border" />
                      <p className="text-xs text-gray-500">Current image. Upload a new one to replace it.</p>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-primary w-full py-4 mt-4 text-lg">{editingPopup ? "Update Pop-up" : "Add Pop-up"}</button>
              </form>
            </div>
            <div id="existing-popups-section">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Existing Pop-ups</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-sm border-b">
                        <th className="p-4">Pop-up Info</th>
                        <th className="p-4">Locations</th>
                        <th className="p-4">Priority &amp; Duration</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {popups.length === 0 ? (
                        <tr><td colSpan={4} className="text-center p-6 text-gray-500">No pop-ups created yet.</td></tr>
                      ) : (
                        popups.map((popup) => (
                          <tr key={popup.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {popup.image_url ? (
                                  <img src={popup.image_url} alt="" className="w-12 h-12 rounded object-cover border" />
                                ) : (
                                  <div className="w-12 h-12 rounded bg-gray-100 border flex items-center justify-center text-gray-400"><Layers className="w-5 h-5" /></div>
                                )}
                                <div>
                                  <p className="font-bold text-gray-900">{popup.title}</p>
                                  <p className="text-xs text-gray-500 max-w-[250px] line-clamp-1">{popup.description || "-"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {popup.locations && popup.locations.map((loc: string) => (
                                  <span key={loc} className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/10 capitalize">{loc}</span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              <p><span className="font-semibold text-gray-900">Rank:</span> {popup.ranking}</p>
                              <p className="text-xs mt-0.5"><span className="font-semibold text-gray-900">Close after:</span> {popup.duration}s</p>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleEditPopup(popup)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors" aria-label="Edit Pop-up"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeletePopup(popup.id)} className={`p-2 rounded-lg transition-colors text-xs font-bold ${confirmDelete?.type === "popup" && confirmDelete.id === popup.id ? "bg-red-600 text-white hover:bg-red-700 px-3" : "text-red-500 bg-red-50 hover:bg-red-100"}`}>
                                  {confirmDelete?.type === "popup" && confirmDelete.id === popup.id ? "Confirm?" : <Trash2 className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {popups.length === 0 ? (
                    <p className="text-center p-6 text-gray-500">No pop-ups created yet.</p>
                  ) : popups.map((popup) => (
                    <div key={popup.id} className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        {popup.image_url ? (
                          <img src={popup.image_url} alt="" className="w-12 h-12 rounded object-cover border shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-100 border flex items-center justify-center text-gray-400 shrink-0"><Layers className="w-5 h-5" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm">{popup.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{popup.description || "-"}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleEditPopup(popup)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors" aria-label="Edit Pop-up"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeletePopup(popup.id)} className={`p-2 rounded-lg transition-colors text-xs font-bold ${confirmDelete?.type === "popup" && confirmDelete.id === popup.id ? "bg-red-600 text-white hover:bg-red-700 px-3" : "text-red-500 bg-red-50 hover:bg-red-100"}`}>
                            {confirmDelete?.type === "popup" && confirmDelete.id === popup.id ? "Confirm?" : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span><span className="font-semibold text-gray-900">Rank:</span> {popup.ranking}</span>
                        <span><span className="font-semibold text-gray-900">Closes:</span> {popup.duration}s</span>
                      </div>
                      {popup.locations && popup.locations.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {popup.locations.map((loc: string) => (
                            <span key={loc} className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/10 capitalize">{loc}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES */}
        {activeTab === "resources" && (
          <div className="space-y-10 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Resources</h3>
                <p className="text-gray-500 text-sm mt-1">Configure dropdown menu categories and grouped sub-links.</p>
              </div>
              <button onClick={fetchResources} disabled={resourceLoading} className="btn-primary px-4 py-2 flex items-center gap-2 text-sm">
                <RefreshCw className={`w-4 h-4 ${resourceLoading ? 'animate-spin' : ''}`} /> 
                {resourceLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* CATEGORIES SECTION (Left Column, col-span-5) */}
              <div className="lg:col-span-5 space-y-8">
                {/* Add/Edit Category Form */}
                <div id="add-category-section" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900">{editingCategory ? "Edit Category" : "Add Resource Category"}</h4>
                    {editingCategory && (
                      <button onClick={cancelCategoryEdit} className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">Cancel</button>
                    )}
                  </div>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Category Name</label>
                      <input required type="text" placeholder="e.g. 12th Commerce" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ranking (Ascending order)</label>
                      <input required type="number" min="0" placeholder="e.g. 1" value={categoryForm.ranking} onChange={e => setCategoryForm({...categoryForm, ranking: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                    <button type="submit" className="btn-primary w-full py-2.5 text-sm">{editingCategory ? "Update Category" : "Add Category"}</button>
                  </form>
                </div>

                {/* Existing Categories List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Existing Categories</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs border-b">
                          <th className="p-3">Name</th>
                          <th className="p-3">Rank</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resourceCategories.length === 0 ? (
                          <tr><td colSpan={3} className="text-center p-4 text-gray-400 italic">No categories found</td></tr>
                        ) : (
                          resourceCategories.map((cat) => (
                            <tr key={cat.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="p-3 font-semibold text-gray-900">{cat.name}</td>
                              <td className="p-3 text-gray-600">{cat.ranking}</td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditCategory(cat)} className="text-blue-500 bg-blue-50 p-1.5 rounded hover:bg-blue-100 transition-colors" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDeleteCategory(cat.id)} className={`p-1.5 rounded transition-colors text-xs font-bold ${confirmDelete?.type === "resource_category" && confirmDelete.id === cat.id ? "bg-red-600 text-white hover:bg-red-700 px-2 py-1" : "text-red-500 bg-red-50 hover:bg-red-100"}`}>
                                    {confirmDelete?.type === "resource_category" && confirmDelete.id === cat.id ? "Confirm?" : <Trash2 className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* LINKS SECTION (Right Column, col-span-7) */}
              <div className="lg:col-span-7 space-y-8">
                {/* Add/Edit Link Form */}
                <div id="add-link-section" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900">{editingLink ? "Edit Resource Link" : "Add Resource Link"}</h4>
                    {editingLink && (
                      <button onClick={cancelLinkEdit} className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">Cancel</button>
                    )}
                  </div>
                  <form onSubmit={handleLinkSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                        <select required value={linkForm.category_id} onChange={e => setLinkForm({...linkForm, category_id: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all bg-white">
                          <option value="">Select Category</option>
                          {resourceCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Group Heading (Optional)</label>
                        <input type="text" placeholder="e.g. Score Vs Percentile" value={linkForm.group_name} onChange={e => setLinkForm({...linkForm, group_name: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Link Title</label>
                        <input required type="text" placeholder="e.g. Syllabus Guide" value={linkForm.title} onChange={e => setLinkForm({...linkForm, title: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Link URL (Optional if Page Content written)</label>
                        <input type="text" placeholder="e.g. /batches or https://..." value={linkForm.url} onChange={e => setLinkForm({...linkForm, url: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ranking (Ascending order within Group)</label>
                      <input required type="number" min="0" placeholder="e.g. 1" value={linkForm.ranking} onChange={e => setLinkForm({...linkForm, ranking: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Page Content (Optional - if written, page is created internally)</label>
                      <RichTextEditor
                        value={linkForm.content}
                        onChange={(value) => setLinkForm({ ...linkForm, content: value })}
                        isFullScreen={isEditorFullScreen}
                        onCloseFullScreen={() => setIsEditorFullScreen(false)}
                      />
                    </div>
                    {linkForm.content && (
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-4 rounded-xl animate-fadeIn">
                        <input
                          type="checkbox"
                          id="link-bypass-layout"
                          checked={linkForm.bypass_layout}
                          onChange={(e) => setLinkForm({ ...linkForm, bypass_layout: e.target.checked })}
                          className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="link-bypass-layout" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                          Bypass Standard Layout (Render raw HTML page content directly, hiding headers/footers)
                        </label>
                      </div>
                    )}
                    {/* SEO & Geo Optimization Section */}
                    <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 space-y-4">
                      <h5 className="text-xs font-bold text-gray-900">SEO & Local Geo-Tagging Optimization (Optional)</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Meta Title</label>
                          <input type="text" placeholder="e.g. CA Prep Material Pune" value={linkForm.meta_title} onChange={e => setLinkForm({...linkForm, meta_title: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Meta Keywords</label>
                          <input type="text" placeholder="e.g. syllabus, CA exams" value={linkForm.meta_keywords} onChange={e => setLinkForm({...linkForm, meta_keywords: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Meta Description</label>
                        <textarea rows={2} placeholder="A short description boosting click rates in search engines" value={linkForm.meta_description} onChange={e => setLinkForm({...linkForm, meta_description: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Geo Region</label>
                          <input type="text" placeholder="e.g. IN-MH" value={linkForm.geo_region} onChange={e => setLinkForm({...linkForm, geo_region: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Geo Placename</label>
                          <input type="text" placeholder="e.g. Pune" value={linkForm.geo_placename} onChange={e => setLinkForm({...linkForm, geo_placename: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Geo Position</label>
                          <input type="text" placeholder="e.g. 18.5204;73.8567" value={linkForm.geo_position} onChange={e => setLinkForm({...linkForm, geo_position: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">ICBM Coordinates</label>
                          <input type="text" placeholder="e.g. 18.5204, 73.8567" value={linkForm.icbm} onChange={e => setLinkForm({...linkForm, icbm: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white focus:ring-2 focus:ring-primary" />
                        </div>
                      </div>
                    </div>
                    <button type="submit" disabled={resourceCategories.length === 0} className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
                      {resourceCategories.length === 0 ? "Add a category first" : (editingLink ? "Update Link" : "Add Link")}
                    </button>
                  </form>
                </div>

                {/* Existing Links List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Existing Resource Links</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs border-b">
                          <th className="p-3">Category</th>
                          <th className="p-3">Link Info</th>
                          <th className="p-3">Group</th>
                          <th className="p-3">Rank</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resourceLinks.length === 0 ? (
                          <tr><td colSpan={5} className="text-center p-4 text-gray-400 italic">No links found</td></tr>
                        ) : (
                          resourceLinks.map((link) => {
                            const catName = resourceCategories.find(c => c.id === link.category_id)?.name || `ID: ${link.category_id}`;
                            return (
                              <tr key={link.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-3 text-xs font-semibold text-gray-500">
                                  <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">{catName}</span>
                                </td>
                                <td className="p-3">
                                  <p className="font-bold text-gray-900">{link.title}</p>
                                  <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[200px]">
                                    {link.url} <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                </td>
                                <td className="p-3 text-gray-600 text-xs font-semibold">
                                  {link.group_name ? <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{link.group_name}</span> : <span className="text-gray-400 italic">None</span>}
                                </td>
                                <td className="p-3 text-gray-600">{link.ranking}</td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => handleEditLink(link)} className="text-blue-500 bg-blue-50 p-1.5 rounded hover:bg-blue-100 transition-colors" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDeleteLink(link.id)} className={`p-1.5 rounded transition-colors text-xs font-bold ${confirmDelete?.type === "resource_link" && confirmDelete.id === link.id ? "bg-red-600 text-white hover:bg-red-700 px-2 py-1" : "text-red-500 bg-red-50 hover:bg-red-100"}`}>
                                      {confirmDelete?.type === "resource_link" && confirmDelete.id === link.id ? "Confirm?" : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BANNERS */}
        {activeTab === "banners" && (
          <div className="space-y-10 animate-fadeIn">
            <div id="add-banner-section" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Image className="w-8 h-8 text-secondary" />
                  <h3 className="text-2xl font-bold text-gray-900">{editingBanner ? "Edit Banner" : "Add New Banner"}</h3>
                </div>
                {editingBanner && (
                  <button onClick={cancelBannerEdit} className="text-sm font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
                )}
              </div>
              <form onSubmit={handleBannerSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Banner Title</label>
                  <input required type="text" value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Target Page</label>
                    <select 
                      value={bannerForm.page} 
                      onChange={e => setBannerForm({...bannerForm, page: e.target.value})} 
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all bg-white"
                    >
                      <option value="index">Homepage</option>
                      <option value="batches">Batches Page</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Priority Ranking (Ascending)</label>
                    <input required type="number" min="0" step="1" value={bannerForm.ranking} onChange={e => setBannerForm({...bannerForm, ranking: e.target.value})} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                    <select 
                      value={bannerForm.is_active} 
                      onChange={e => setBannerForm({...bannerForm, is_active: e.target.value})} 
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all bg-white"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Desktop Image File (21:6 Aspect Ratio Recommended)</label>
                    <input type="file" accept="image/*" onChange={(e) => setBannerForm({ ...bannerForm, desktop_file: e.target.files?.[0] || null })} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
                    {editingBanner && editingBanner.desktop_image_url && (
                      <div className="mt-3 flex items-center gap-3">
                        <img src={editingBanner.desktop_image_url} alt="" className="w-32 h-12 rounded object-cover border" />
                        <p className="text-xs text-gray-500">Current desktop image.</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Image File (4:3 / 16:9 Aspect Ratio Recommended)</label>
                    <input type="file" accept="image/*" onChange={(e) => setBannerForm({ ...bannerForm, mobile_file: e.target.files?.[0] || null })} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
                    {editingBanner && editingBanner.mobile_image_url && (
                      <div className="mt-3 flex items-center gap-3">
                        <img src={editingBanner.mobile_image_url} alt="" className="w-16 h-12 rounded object-cover border" />
                        <p className="text-xs text-gray-500">Current mobile image.</p>
                      </div>
                    )}
                  </div>
                </div>

                <button disabled={bannerSubmitting} type="submit" className="btn-primary w-full py-4 mt-4 text-lg">
                  {bannerSubmitting ? "Saving..." : editingBanner ? "Update Banner" : "Add Banner"}
                </button>
              </form>
            </div>

            <div id="existing-banners-section">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Existing Banners</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-sm border-b">
                        <th className="p-4">Page</th>
                        <th className="p-4">Preview Images (Desktop / Mobile)</th>
                        <th className="p-4">Title &amp; Rank</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banners.length === 0 ? (
                        <tr><td colSpan={5} className="text-center p-6 text-gray-500">No banners uploaded yet.</td></tr>
                      ) : (
                        banners.map((banner) => (
                          <tr key={banner.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-semibold text-gray-900 capitalize">
                              {banner.page === "index" ? "Homepage" : "Batches Page"}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <img src={banner.desktop_image_url} alt="Desktop Preview" className="w-28 h-10 rounded object-cover border shadow-sm" />
                                  <span className="text-[10px] text-gray-400 font-bold block mt-1">Desktop</span>
                                </div>
                                <div className="text-center">
                                  <img src={banner.mobile_image_url} alt="Mobile Preview" className="w-10 h-10 rounded object-cover border shadow-sm" />
                                  <span className="text-[10px] text-gray-400 font-bold block mt-1">Mobile</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-gray-900">{banner.title}</p>
                              <p className="text-xs text-gray-500 mt-1">Ranking Priority: {banner.ranking}</p>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleBannerActive(banner)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                  banner.is_active 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {banner.is_active ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleEditBanner(banner)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors" aria-label="Edit Banner"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteBanner(banner.id)} className={`p-2 rounded-lg transition-colors text-xs font-bold ${confirmDelete?.type === "banner" && confirmDelete.id === banner.id ? "bg-red-600 text-white hover:bg-red-700 px-3" : "text-red-500 bg-red-50 hover:bg-red-100"}`}>
                                  {confirmDelete?.type === "banner" && confirmDelete.id === banner.id ? "Confirm?" : <Trash2 className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      </div>
    </div>
  );
}
