export const translations = {
  en: {
    navbar: {
      home: "Home",
      products: "Products",
      categories: "Categories",
      sellers: "Sellers",
      cart: "Cart",
      account: "Account",
      searchPlaceholder: "Search products...",
    },
    common: {
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      viewAll: "View All",
      loading: "Loading...",
      noData: "No data found",
    },
    blogs: {
      title: "Our Blogs & Trainings",
      subtitle: "Read the latest articles, guides, and farming insights.",
      readMore: "Read More",
      recentPosts: "Recent Posts",
      allBlogs: "All Blogs",
      noBlogs: "No blogs found",
      category: "Category",
      publishedOn: "Published on",
    },
  },

  hi: {
    navbar: {
      home: "होम",
      products: "उत्पाद",
      categories: "श्रेणियाँ",
      sellers: "विक्रेता",
      cart: "कार्ट",
      account: "खाता",
      searchPlaceholder: "उत्पाद खोजें...",
    },
    common: {
      addToCart: "कार्ट में जोड़ें",
      buyNow: "अभी खरीदें",
      viewAll: "सभी देखें",
      loading: "लोड हो रहा है...",
      noData: "कोई डेटा नहीं मिला",
    },
    blogs: {
      title: "हमारे ब्लॉग और प्रशिक्षण",
      subtitle: "नवीनतम लेख, मार्गदर्शिकाएं और कृषि संबंधी जानकारी पढ़ें।",
      readMore: "और पढ़ें",
      recentPosts: "हाल के लेख",
      allBlogs: "सभी ब्लॉग",
      noBlogs: "कोई ब्लॉग नहीं मिला",
      category: "श्रेणी",
      publishedOn: "प्रकाशित",
    },
  },

  mr: {
    navbar: {
      home: "मुख्यपृष्ठ",
      products: "उत्पादने",
      categories: "श्रेणी",
      sellers: "विक्रेते",
      cart: "कार्ट",
      account: "खाते",
      searchPlaceholder: "उत्पाद शोधा...",
    },
    common: {
      addToCart: "कार्टमध्ये जोडा",
      buyNow: "आता खरेदी करा",
      viewAll: "सर्व पहा",
      loading: "लोड होत आहे...",
      noData: "डेटा सापडला नाही",
    },
    blogs: {
      title: "आमचे ब्लॉग आणि प्रशिक्षण",
      subtitle: "नवीनतम लेख, मार्गदर्शक आणि शेतीविषयक माहिती वाचा.",
      readMore: "अधिक वाचा",
      recentPosts: "अलीकडील लेख",
      allBlogs: "सर्व ब्लॉग",
      noBlogs: "कोणतेही ब्लॉग सापडले नाहीत",
      category: "प्रकार",
      publishedOn: "प्रकाशित",
    },
  },
} as const;

export type TranslationDictionary = typeof translations;
export type TranslationLanguage = keyof TranslationDictionary;
