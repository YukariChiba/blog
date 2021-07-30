---
title: 新站点启用，以及一些小细节
date: 2021-07-30 12:00:00
tags: [优化, 网站建设]
index_img: https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/index_img/ewe-moe.jpg
categories:
  - [Debug]
  - [技术, 网站建设]
---

由于大家都注册了萌萌的 .moe 域名，我也来效仿一个。

{% note warning %}
**光敏性癫痫提示**
对于极少数人群，网站中的动画效果可能会引发癫痫或眩晕症状。
如果您感到头晕、恶心、眼睛抽搐、癫痫发作，请即刻关闭页面并立即就医。
{% endnote %}

[ewe.moe](https://ewe.moe)

## 一些文字小技巧

中间的 🐑 logo 其实是字体，嘤为 threejs 对透明度图片的资瓷并不好。

然而，在 threejs 官方给的 typefont json 文件中，并没有提供中文/emoji 资瓷，为此，需要手动加入。

这个 [facetype.js](http://gero3.github.io/facetype.js/) 可以将字体文件转换成 threejs 可以导入的 json 文件。但是，由于这个作者依然没考虑到 emoji，🐑 依然无法被导出。

那么就需要借助 [IcoMoon](https://icomoon.io/app/) 来导出一个自定义的字体文件。我预先将 🐑 的路径合并，然后将其作为字母 y 导入，这样生成出的 ttf 文件仅包含一个字符 y。使用上面的 facetype.js 即可将其对应的 json 导出。

## 一些长按小技巧

> 该内容最终并未加入到网站中。

vue 里处理长按事件是比较麻烦的，这里使用了 `setTimeout` 来解决这个问题。

```html
<div @mousedown="clickStart" @mouseup="clickEnd" />
```

```javascript
methods: {
  clickStart: () => {
    if (timer === null) {
      timer = setTimeout(() => {
        // ...
      }, 2000);
    }
  };
  clickEnd: () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
},
data: ()=>({
  timer: null
})
```
