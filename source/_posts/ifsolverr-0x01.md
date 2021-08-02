---
title: IFSolver Reloaded 系列 0x01：特征提取与存储
date: 2021-08-02 00:00:00
tags: [Python, Ingress, OpenCV]
index_img: https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/index_img/ifsolverr-1.jpg
categories:
  - [技术]
math: true
---

> 这篇文章里，将具体说明 `SIFTExtractor` 的情况，这主要是使用 SIFT 进行特征提取。

## SIFT 算法

SIFT 是 David Lowe 提出的一种尺度不变特征变换匹配算法。它的一大特点是提取出的特征对于平移、旋转等特性具有不变性。

它主要做了如下几个步骤：

1. 建立尺度空间的高斯差分金字塔。
2. 在尺度空间内检索极值点。
3. 对特征点赋值，获取位置、尺度、方向的信息。

对于第一步，总的来说是先建立高斯金字塔 $L(x,y,\sigma) = G(x,y,\sigma) * I(x,y)$，再建立高斯差分金字塔 $D(x,y,\sigma) = L(x,y,\sigma_k) - L(x,y,\sigma_{k-1})$，即 DoG。

而对于第二步，将得到的 DoG 矩阵进行极值检测，可做为候选的关键点。对于每一个像素点，常用的比较方法是，比较同一尺度的相邻 8 个像素点，和不同尺度相邻的 18 个像素点 (9 + 9)，如果它是这些像素点中的局部极值点，则将其加入到候选列表内。

第三步，对于每一个候选的关键点，梯度 $ m(x,y)={\sqrt {((L(x+1,y)-L(x-1,y))^{2}+((L(x,y+1)-L(x,y-1))^{2}}} $，方向 $ \theta(x,y)=arctan((L(x,y-1)-L(x,y+1))/(L(x-1,y)-L(x+1,y))) $。

在此之后，还有一个额外的提取 descriptor 的步骤，目的是使检测到的特征即使在不同的光照条件下也能被有效识别。（值得注意的是在本应用场景中这个步骤并没有什么用）

具体的步骤是，通过直方图的方式统计图中关键点的方向，然后根据结果，对被划分成若干区域(4x4x128)的图像部分（这被称为 descriptor）确定相应的向量值。

具体可参考论文 [Object Recognition from Local Scale-Invariant Features](https://www.cs.ubc.ca/~lowe/papers/iccv99.pdf)，这里不再赘述。

## 在 IFSolverR 中的使用

对于每一个 Portal 图像和 IFS 谜题图像，程序都会为其进行一个对应的 SIFT 特征提取：

```python
kp, des = sift.detectAndCompute(img, None)
```

同时会存储一份特征点预览以供后续的人工介入或调试：

```python
PreviewUtil.saveFullImageFeaturePreview(kp)
```

然后使用写好的特征工具进行打包存储，以供后续使用：

```python
kpp, desp = FeatureFileUtil.packKeypoint(kp, des)
FeatureFileUtil.writeFeatures(
    'data_features/ifs.jpg', kpp, desp)
```

可以从 `packKeypoint` 中看到 SIFT 提取的特征的数据结构，包含 keypoint 和 descriptor：

```python
kpts = np.array([[kp.pt[0], kp.pt[1], kp.size,
                  kp.angle, kp.response, kp.octave,
                  kp.class_id]
                  for kp in keypoints])
desc = np.array(descriptors)
```

![](https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/ifsolverr/feature_extracted.jpg)

如图为一张成功被提取 SIFT 特征的图片。

## 拓展

由于时间急迫，IFSolverR 开发时并未仔细考虑更好的匹配和特征点筛选方法，一种常见的改进是使用 KD Tree 辅助搜索，通过 BBF 获取 kNN，同时通过 RANSAC 减少错误匹配的问题。这里仅提一下。
