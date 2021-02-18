---
title: 博客静态迁移
date: 2020-07-18 12:00:00
tags: [优化,网站建设]
index_img: https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/index_img/static-blog.png
categories:
  - [技术, 网站建设]
---

先前我的站点是由基于 PHP 的 Wordpress 构建的，它很笨重，需要一个庞大的后端数据库和性能较好的服务器。为了节省开支，将其静态化并部署到免费的托管平台上是非常必要的。

## 代码托管： GitHub

不解释。

## 图床 / 公用静态资源： jsDelivr

jsDelivr 在国内有 CDN，提供 GitHub 仓库和常用 CSS / JavaScript 库的内容加速。

相比于各类对象存储，不需要备案和支付流量费。

由此，我在 Blog 的仓库新增了一个空分支 `img` 以存储图片资源。

安装 PicGo 后可以快捷地上传图片并获取链接，它的对应目录为：

```
https://cdn.jsdelivr.net/gh/{Username}/{Repo}@{Branch}/{file}
```

以后在使用图片时，直接替换为相应链接即可。

## HTML 内容： Netlify

Netlify 相比 Github Pages 和 Cloudflare, 速度更快，而且支持绑定域名和自动续期 HTTPS 证书。

安装插件后，在 `git push` 后，会自动触发 netlify 的构建。

## 图片压缩

由于懒得去手动调整图片大小，我使用了 Github Actions 对每次上传的图片自动进行压缩。
