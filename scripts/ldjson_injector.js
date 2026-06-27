hexo.extend.filter.register("after_render:html", function (htmlContent, data) {
  if (!data.page) return htmlContent;

  const page = data.page;
  const config = this.config;

  let jsonScript = `</head>`;

  function wrapScriptTag(jsonLd) {
    return `<script type="application/ld+json">${JSON.stringify(jsonLd, null)}</script>`;
  }

  let jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.title,
    url: config.url,
    description: config.description,
  };

  jsonScript = `${wrapScriptTag(jsonLdWebsite)}\n${jsonScript}`;

  let jsonLdPerson = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Yukari Chiba",
    givenName: "Yukari",
    familyName: "Chiba",
    jobTitle: "Developer",
    description: "FOSS Developer, eweOS Developer, deepin Developer, dn42 NOC",
    image: "https://0x7f.cc/img/favicon.jpg",
    url: "https://0x7f.cc",
    email: "i@0x7f.cc",
    sameAs: ["https://t.me/YukariChiba", "https://github.com/YukariChiba"],
  };

  jsonScript = `${wrapScriptTag(jsonLdPerson)}\n${jsonScript}`;

  if (page.layout === "post") {
    jsonLdArticle = {
      "@context": "https://schema.org",
      "@type": "Article",
      mainEntityOfPage: { "@type": "WebPage", "@id": page.permalink },
      headline: page.title,
      description: page.description || page.excerpt || config.description,
      image: page.index_img || page.banner_img || config.avatar,
      datePublished: page.date ? page.date.toISOString() : "",
      dateModified: page.updated
        ? page.updated.toISOString()
        : page.date
          ? page.date.toISOString()
          : "",
      author: { "@type": "Person", name: config.author },
      publisher: {
        "@type": "Organization",
        name: config.title,
        logo: { "@type": "ImageObject", url: config.avatar || "" },
      },
    };

    jsonScript = `${wrapScriptTag(jsonLdArticle)}\n${jsonScript}`;
  }

  return htmlContent.replace("</head>", jsonScript);
});
