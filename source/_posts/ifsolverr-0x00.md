---
title: IFSolver Reloaded 系列 0x00：总体结构
date: 2021-07-29 00:00:00
tags: [Python, Ingress, OpenCV]
index_img: https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/index_img/ifsolverr-0.jpg
categories:
  - [技术]
---

> IFSolverR 是 [IFSolver](/ifsolver) 系列的改进，旨在有效应对官方的加扰手段，并增加可视化修正和鲁棒性。同时对老旧的代码结构进行调整。

## 前言

一些 Agent 嘤该很熟悉，在 2020 年创建的 IFSolver 为不少地区的 IFS 图片解码提供了帮助。然而好景不长，在 2021 年，IFS-UN 似乎注意到了这一点，为了提升活动难度，避免摸鱼，从某个月份开始，IFS 解密图便加入了旋转、缩放、平移等一系列操作。而这导致了先前基于图片分割再匹配的 IFSolver 完全失效。同时又嘤为选取 Portal 地点不合适等原因，曾经出现过地区 POC 躺平，宣布放弃举办 IFS 的情况。

![](https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/ifsolverr/ifs_puzzle_cd.jpg)

为此，一种新的 IFSolver 需要被开发出来。我将其称为 IFSolverR（虽然依然沿用前者的仓库和名字）。

## 问题在哪

先前的思路一直维持在，将图片分割后再进行匹配的思路。而这样的思路是需要建立在两个前提下的：

- 谜题图片足够有序，以便于划分不出现问题。
- 谜题图片足够高清，以便于匹配足够多的特征。

在先前版本的 IFSolver 中，有若干 threshold 需要针对不同的图片进行调整，并没有一个相对稳定的值。同时对原图像的加扰宣布了这一方法的死亡。

因此，问题出在，如何在一个大图像中，从数千张图像的库里匹配出经过缩放、平移、旋转后的图像？

## 解决方案

回忆起先前的内容，易想到还有一种尚未使用的解决方案：

> SIFT (尺度不变性特征变换) 是利用 DoG 金字塔检测极值点并提取特征 descriptor 的方法，对旋转、尺度缩放、亮度变化也具有不变性。

> SIFT 算法比较准确，甚至可以考虑在原图上不做分割，直接与数千张图片进行识别。但不巧的是，这是一个具有专利的算法 (今年 3 月到期啦！)，在 OpenCV 上还暂未从 Non-free 挪出来 (Soon&trade;)。

显然在 1202 年，OpenCV 的新版本已经包含了此算法，它的各类不变性特点看上去非常适合 IFSolver，唯一的缺点就是计算复杂度上比 ORB 高了不少。不过考虑到既然已经做了人工加扰，适当提升算力是必要的。

## 基本步骤

1. （与先前一致）根据 Portal_Export.csv 下载 Portal 图片。
2. （与先前基本一致）根据下载好的图片，使用 SIFT 算法提取对应的特征，并将其存储下来。
3. 载入 IFS 谜题文件，使用 SIFT 对所有图片进行并行遍历匹配，并根据匹配程度筛选候选 Portal。
4. （与先前基本一致）生成 Portal 图片与谜题图片的特征匹配图，进行可选的人工修正环节。
5. 根据用户输入列数进行聚类，进行排版。
6. （与先前一致）根据 Portal 列表进行连线和 Passcode 生成。

以上就是 IFSolverR 的基本架构。

## 模块

项目中 `Extractor` 和 `Matcher` 分别对应特征的提取和识别，目前只有 `SIFTExtractor` 和 `BFMatcher`，代表使用 SIFT 进行特征提取，使用 BruteForce 进行暴力匹配。这可以为将来改良或换用更高效的算法提供便利。

其余的辅助类模块均位于 `Utils` 中，包含了一系列与特征识别匹配算法无关的操作。

## 验证

使用 2021.7 的成都 IFS 谜题照片，和相应范围内近 3000 个 Portal 的 csv 列表，能够在 2 处手动纠正的情况下，对全部待匹配图片得到 100% 的准确率。

![](https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/ifsolverr/code.jpg)

> `ZNV31CHAOS648MH`

测试使用了 5800x + 默认未安装 CUDA 加速的 OpenCV。匹配过程使用并占满了全部的核心，总计运行时间在 10 分钟内。

## 后续

在后续的文章中，将着重介绍 IFSolverR 改进的部分，以及它们每一步对原谜题图像处理的效果。