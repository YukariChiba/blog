---
title: 日常翻车实录
date: 2020-07-18 15:42:12
tags: 翻车
index_img: https://cdn.jsdelivr.net/gh/SteveCharlesYang/blog@img/img/index_img/blog-daily-error.jpeg
categories:
  - [Debug]
  - [技术, 网站建设]
  - [技术, 高端但没啥用]
---

今天LUG群里突然开始讨论博客的事情，我这才发现自己还有这个小博客。由于博客年久失修，系统和软件版本过于老旧，故专门拿出一晚上的时间升级。

遇到的软件问题
-------

### PHP 的 mysql 连接组件更新换代

由于PHP升级到了7.0以上版本，`mysql_*` 相关的函数均不再可使用。我以为 Wordpress 自身早已资瓷 `mysqli`，于是不予理会，最后翻车了。在查看日志后发现是数据库缓存相关的插件还尚未使用新版的函数。

当我将其禁用后，惊讶地发现这个插件依然处于开启状态，后来通过查询文档了解到了该插件将会在 `wp-content` 目录创建 `db.php` 等文件以改写 Wordpress 原版的数据库操作，删除这些文件，网站遂正常。

### PHP的联网权限问题

升级后，插件和 Wordpress 自身的更新和获取均存在问题，通过 php 测试 DNS 解析，发现无法解析记录。

（该问题待处理中）

最终发现此问题是由于selinux的设置问题，使用 `chcon -R --type httpd_sys_rw_content_t {路径}` 即可解决问题。

## 遇到的系统问题

### yum update 中途退出

一切的问题发生的根源，由于中国国际互联网连接不稳定，使用 ssh 进行操作极有可能连接被掐断。

一个可行的解决方案是使用 `screen`。

### chroot 无法使用 yum

上述操作做完后，重启立即发生 panic，在翻车后我使用了 vps 商提供的 rescue 模式进行抢救。

然而在挂载了原系统并 chroot 后，无法使用 yum，并在 `import ts` 处提示失败，我原先以为升级不完全导致软件包版本不对应，下载了缺少的 `nspr4` 并将so文件使用 `LD_PRELOAD` 环境变量载入，发现问题并没有被解决。

而后继续关注文档，发现许多软件包均需要读取 `/dev/random` 中的数据，而 chroot 的系统需要额外一个挂载的步骤，在执行了 `mount -o bind /dev /mnt/dev` 之后，yum可以顺利运行。

### grub 重建引导无法成功

考虑到 kernel panic 的原因，可能需要重装内核，而在安装了最新内核后的操作过程中，`grub-mkconfig` 发生了错误，提示无法读取一些信息。

观察错误记录，可以发现 chroot 下还需要挂在 `/sys` 和 `/proc` 才能正常安装。

### 进入系统后发现 NIC 丢失

在未完成上述操作的情况下，进入系统，而后发现NIC丢失，`network.service` 无法正常启动，同时 `lspci` 中能发现适配器设备。

在查看了内核信息后，我发现由于未完成安装内核，系统进入的是 rescue 内核，因此 NIC 驱动未被加载。在成功完成上述的内核安装后，问题解决。

## 总结

辣鸡CentOS！