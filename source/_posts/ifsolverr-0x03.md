---
title: IFSolver Reloaded 系列 0x03：解码生成
date: 2021-09-16 00:00:00
tags: [Python, Ingress, OpenCV]
index_img: https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/index_img/ifsolverr-3.jpg
categories:
  - [技术]
math: true
---

> 这篇文章将介绍 IFSolverR 对于匹配到的图片是如何生成网格、检测错误识别并排版生成最后的输出的。

## 生成网格

先前说到，IFSolverR 对所有的图片进行匹配并得到了一份映射坐标列表，而最后输出需要的数据显然应该是一个矩阵 $ M $，使得对于行 $ i $ 和 列 $ j $：

$$ M= \begin{pmatrix} \displaylines{ (P_{x1}, P_{y1}) & \cdots & (P_{xi}, P_{y1}) \\\ \vdots & \ddots & \vdots  \\\ (P_{x1}, P_{yj}) & \cdots & (P_{xi}, P_{yj}) } \end{pmatrix} $$

那么，怎么确定搜索到的坐标位于哪一列呢？这个时候就需要请出 KMeans 聚类算法了。

这是一个非常简单的一维聚类问题，用 KMeans 实际上u 有一些小题大作，简而言之目的是让划分到 k 个集合的方案 $Col_i$ 中，每个集合内的平方和误差最小，即：

$$  \underset  {\mathbf  {Col}}{\operatorname {arg\,min}} \sum_{i=1}^k\sum_{P \in Col_i}\left\|{\mathbf P_x}-\mu_{i}\right\|^{2} $$

显然，我们能根据肉眼判断出图片有几列，因此通过此种方法得出结果这不成问题。

## 错误识别

然而，在某些情况下，由于先前的匹配过程依然可能存在漏网之鱼，有下列两种情况：

- 有同一张照片的不同部分被识别为了相同的结果。
- 有同一张照片的不同部分被识别为了不同的结果。

![](https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/ifsolverr/grid.jpg)

例如上图中的 421 被识别了两次。

对于第一种情况，完全可以无视，因为它并不影响最终的结果生成，而对于第二种情况，可能达到了算法的极限，需要人工判断，这个时候就需要提示人工介入了。

而判断它的条件非常暴力，只要发现两个识别结果的距离过近，就认为它们冲突了。

```python
if (abs(imageCenters[idx]["y"] - imageCenters[idx + 1]["y"]) < 50) 
  and imageCenters[idx]["portalID"] != imageCenters[idx + 1]["portalID"]
```

## 其它

而后的根据坐标生成图片的代码相比于先前的版本几乎没有更改，故不重复叙述。

到这里，IFSolverR 的全部内容就讲完了，大概除了官方彻底改变玩法，未来也不需要什么大的更新了。