---
title: IFSolver Reloaded 系列 0x02：特征匹配
date: 2021-08-19 00:00:00
tags: [Python, Ingress, OpenCV]
index_img: https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/index_img/ifsolverr-2.jpg
categories:
  - [技术]
math: true
---

> 在这篇文章里，将详细介绍 IFSolverR 是如何匹配特征的，这是本次更新中最核心的环节。

## 简要介绍

与先前的 IFSolver 不同，使用 SIFT 进行全图匹配一定会引入一些错误的特征点，如何判断某个匹配是否是符合要求的，以及如何处理图中存在的多个匹配，是本节需要关注的主要问题。

## 粗匹配

```python
bestMatches = BFMatcher.matchDescriptor(d, dFull)
```

通过这样的过程，可以实现对 `d`(Portal 图片特征) 和 `dFull`(IFS 谜题全图特征) 的暴力匹配。

而 `BFMatcher` 里面是这样的：

```python
matches = matcher.knnMatch(descriptor, descriptorFull, k=2)
bestMatches = [[m] for m, n in matches if m.distance < 0.6*n.distance]
```

通过测量，0.6 倍距离作为筛选边界是较为合适的，这会影响到检测到的特征点个数。

## 筛选匹配

然而，这样产生的匹配很可能也存在不符合标准的状况。嘤为 SIFT 本身是一种匹配能力极强的算法，当遇到稍有相似但角度不同的 Portal 图片时，依然能够被识别出来并被认为是一个合理的匹配。

同时，我们需要做的并不只是匹配图片，还需要找到匹配区域的几何中心，即图片的中心点，以方便后续的自动化生成解谜结果。

但很显然，一次匹配是无法区分出所有的匹配图片，并进行筛选的，因此我们需要这样的操作：

1. 通过映射关系，查找 Portal 图片在谜题图片上的边缘，这里就是对图片生成一个 3x3 的最优单映射变换矩阵（矫正矩阵） M，使得 $ A_{portal} * M = A_{puzzle} $。
2. 然而，这样的矩阵并不一定存在，如果不存在这样的矩阵，说明这不是一个有效的组合。
3. 排除以上情况后，可以通过 `perspectiveTransform` 和上述矩阵 M 确定变换后的边缘坐标。
4. 同时，我们需要保证这样的坐标的长宽比符合要求，并且是一个凸多边形。
5. 随后，我们对匹配的区域生成一个 mask，将上述匹配成功的区域内的特征点排除(`logical_not`)。
6. 重复以上操作直至匹配到的特征点低于 4 个，此时我们不认为它们能确定一个映射，匹配过程结束。
   
![](https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/ifsolverr/feature_matched.jpg)

然后程序也会存储一份特征匹配的图片以供参考和调试。

## 拓展

在下一节还会讲到，这样的匹配规则依然会存在重复匹配和错误匹配的可能性（虽然不高），因此在需要人工干预会有提示。如何进一步提升匹配的准确性，可能的办法是，将区域重叠率高的图片进行裁剪，进行 1：1 匹配，然后再根据匹配吻合度优选。