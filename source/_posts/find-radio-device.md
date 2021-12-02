---
title: 杂牌对讲机的写频
date: 2021-12-02 12:00:00
tags: HAM
index_img: https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/index_img/find-radio-device.jpg
categories:
- ['学习','不务正业']
- ['技术','Debug']
- ['生活']
---

由于历史原因，几个月前收了一台 剑派 8800UV 对讲机。它是长这样的。

![](https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/find-radio-device/device.jpg)

一开始我被它看似强大的功能和彩屏吸引，拿到手上后才发现，事实上跟 UV-5R 没有什么本质上的区别。

前几天学校在筹建无线电社团，因此把这个台拿出来，准备写点频道进去，但并不知道该用什么软件来写入。

## 尝试 1：官方下载

失败。

我尝试搜索这个厂家，并没有在淘宝/天猫外看到其它销售渠道乃至任何官方网站。

## 尝试 2：联系客服

失败。

我随后找到这家店，要求提供配套软件的下载。此时客服要求我出示订单号及截图，而我是收的二手设备，显然无法提供此信息。从此时开始，我怀疑其背后有所蹊跷。

## 尝试 3：万能工具/其它品牌工具/开源工具

失败。

一般而言，这样的工具适用于很多类似的杂牌机器，但通过测试，宝锋系列和传说中的“万能”写频工具均无法识别到该设备。

同时我注意到了 CHIRP 这个号称支持若干无线电设备写频的开源工具，虽然它原版缺乏维护，只能在 python2 上运行，但是这并不妨碍有人将其迁移到 python3 上。但经过若干测试，该软件上所有方案均无法成功握手到该设备。

## 尝试 4：抓包

基本失败。

由于写频软件需要直接与 tty 交互，因此若欲监听，要创建一个类似 MITM 的设备，将所有读写内容全数转发并复制存储。

这个时候，我使用 socat 将设备转发到 tcp 11331 端口：

``` bash
socat /dev/ttyUSB0,raw,echo=0 tcp-listen:11331,reuseaddr
```

同时，使用 socat 模拟一个 PTY：

```bash
sudo socat PTY,raw,echo=0,link=/dev/ttyUSB1 tcp:127.0.0.1:8888
```

随后在 chmod 进行权限调整后，即可使用 wireshark 等进行一个监听。

然而，由于对讲机的握手需要很长一段指令，因此需要一个暴力穷举的脚本不断发送请求进行尝试，这非常消耗时间，且数据格式并不清楚，即使能握手成功，后续的传输也需要逐一分析。

## 尝试 5：溯源

成功。

简单来说，通过 Google 图片搜索该设备的照片，能够发现，这款对讲机被贴了十个甚至九个品牌被四处出售，而它们的 Logo 在机身上显然非常突兀，说明并不是原厂品牌。

因此，我将视线转移到了 amazon。果然在 amazon 中找到了若干款类似的产品，最后指向了一个叫做 radtel 的品牌的一款名叫 RT-490 的产品。

![](https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/find-radio-device/RT-490.jpg)

从产品的图片上可以看出，它从外形到系统界面与 8800UV 完 全 一 致。而在 support 栏目内能非常轻松地下载到相关的软件，经测试读取和写入均无任何问题。

## 分析

这时候，我们就可以查询这个公司的背景了：

```
Xiamen Radtel Electronics Co.,Ltd
502, No.1 Jinyi, Wuli, Huli, Xiamen City
Fujian, P.R CHINA. 361004
```

最终我们可以发现，它转了一圈，又回来了！这本质上是一款出口转内销的贴牌机，阉割掉了 radtel 机型的蓝牙与 GPS 功能，同时又将未阉割版本以“高配”的名义低价售卖。这也就不难理解为何客服对写频软件等内容三缄其口了：事实上它根本就不是什么 8800UV，它就是 RT-490。

至于它的实际质量，有评论是这样说的：

```
商家宣稱此款對講機功率有20、18及15瓦功率，實際量測350MHz及500MHz兩頻段最大功率（H檔） 僅有0.6W及2.2瓦W，還比不上寶峰A-58對講機實際測試中功率3W，不值得推薦商家，希望不要有下一個消費者受害了。
```

实际体验也确实如此，就当是交了学费。建议大家以后**千万不要买杂牌无线电设备**了，杂牌与大厂的售后和社区支持是完全不同的。