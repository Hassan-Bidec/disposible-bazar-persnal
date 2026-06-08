const BASE_URL = "https://dispasible-bazar-persnal.vercel.app";
const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/search/product?sort_by=1`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

async function fetchBlogs() {
  try {
    const res = await fetch(`${API_BASE}/blogs/index`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/product/category`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

async function fetchCustomizationProducts() {
  try {
    const res = await fetch(`${API_BASE}/search/Customizeproduct?sort_by=1`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const [products, blogs, categories, customProducts] = await Promise.all([
    fetchProducts(),
    fetchBlogs(),
    fetchCategories(),
    fetchCustomizationProducts(),
  ]);

  // Static pages
  const staticPages = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/shop/`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blog/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about-us/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact-us/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/customization/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/bundles/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/reviews/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/privacy-policy/`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/return-policy/`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/terms-and-conditions/`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  // Product pages
  const productPages = products
    .filter((p) => p?.slug)
    .map((p) => ({
      url: `${BASE_URL}/product/${p.slug.replace(/\/+$/, "")}/`,
      lastModified: new Date(p.updated_at || p.created_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  // Blog pages
  const blogPages = blogs
    .filter((b) => b?.slug)
    .map((b) => ({
      url: `${BASE_URL}/${b.slug.replace(/\/+$/, "")}/`,
      lastModified: new Date(b.updated_at || b.date || Date.now()),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  // Category pages
  const categoryPages = [];
  const processCat = (cat, parentSlug = null) => {
    if (!cat?.slug) return;
    const path = parentSlug
      ? `/product-category/${parentSlug}/${cat.slug}/`
      : `/product-category/${cat.slug}/`;
    categoryPages.push({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
    if (Array.isArray(cat.subCategories)) {
      cat.subCategories.forEach((sub) => processCat(sub, cat.slug));
    }
  };
  categories.forEach((cat) => processCat(cat));

  // Customization product pages
  const customPages = customProducts
    .filter((p) => p?.slug)
    .map((p) => ({
      url: `${BASE_URL}/customization/${p.slug.replace(/\/+$/, "")}/`,
      lastModified: new Date(p.updated_at || p.created_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [
    ...staticPages,
    ...productPages,
    ...blogPages,
    ...categoryPages,
    ...customPages,
  ];
}
