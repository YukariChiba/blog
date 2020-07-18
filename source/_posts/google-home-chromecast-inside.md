---
title: 墙内使用Google Home和Chromecast
date: 2020-07-18 15:42:12
tags: chromecast
index_img: https://cdn.jsdelivr.net/gh/SteveCharlesYang/blog@img/img/index_img/google-home-chromecast-inside.jpg
categories:
- ['学习','不务正业']
- ['技术','Debug']
- ['生活']
---

由于众所周知的原因，Google 家的产品带回国内是无法正常使用的，而且通常都需要路由器级别以上的虚拟砖混结构建筑物逾越技术。但是在实际操作过程中，会出现各种奇怪的事情，以下给出了我在设置过程中遇到的问题和解决方案。

- Google Home 在 Google Assistant 步骤遇到错误卡住，无法完成设置：
 - 这多半是由于系统设置为中文，而Google Assistant不兹瓷中文导致的。
 - 解决方案：切换手机语言为英文，配置成功后再改回来。

- Google Home在手机配置后，仍然反馈未配置信息，Chromecast无法投射部分媒体内容，体现为黑屏后报错：
 - Google Home和Chromecast都强制设置Google Public DNS为DNS服务器，且不可更改，如果路由器未指定规则，DNS流量可能受到污染。
 - 解决方案：利用iptable，将Google Public DNS的UDP 53流量重定向至路由器，并且保证路由器的DNS未受到污染，当然，也可以一劳永逸地直接重定向所有的DNS流量至路由器。

 - 
 ```
 iptables -t nat -A PREROUTING -p udp --dport 53 -j REDIRECT --to-ports 53;
 ```