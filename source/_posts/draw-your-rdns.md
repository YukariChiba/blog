---
title: '在 rDNS 上念诗！（加强版）'
date: 2025-08-13 12:00:00
tags: [网络]
index_img: https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/index_img/draw-your-rdns.jpg
categories:
  - [学习, 不务正业]
  - [技术, 高端但没啥用]
---

{% note info %}
已在 http://draw.strexp.net 上线（由于 DNS 实现问题 ssl 证书未能成功申请）。
所有代码均在 https://github.com/YukariChiba/dnsdraw 中放出。
{% endnote %}

## 前言

(这个机制其实已经部署在网络中超过 6 个月了，但是总觉得它还是值得一写的。)

其实，先前就有若干网友（*注：指玩网络的朋友*）实现了类似的念诗功能，但是大部分无非是展示一段静态的文本，“念诗”的目的是达到了，但是不够通用，无法实现规模化。

DNS 系统自身是一个全球化的、众包的巨大缓存，足够把所有的诗句都塞进去，因此目标完全可以更大一些：把大部分诗词（全唐诗/全宋诗/全宋词/元曲/乐府诗集/...）都扔进去。

## 如何念诗

### 如何将 ICMP 交给用户态处理

简答：使用 `netfilter-queue`

通过 nftables 规则，特定流量可以从内核处理路径中被单独掏出来，发送到指定的用户态队列中。

代码如下：

```
table ip6 raw {
        chain PREROUTING {
                type filter hook prerouting priority raw; policy accept;
                ip6 daddr 2a0e:b107:b7f::/128 accept
                ip6 daddr 2a0e:b107:b7f::/48 queue num 1
        }
}
```

可以从上述内容看出，我把整个 `2a0e:b107:b7f::/48` 都拿来念诗了，并将所有发往该段的包都扔给了编号为 1 的 netfilter queue，现在只需要用户态的程序从队列中把包取出来，就能任意处理了。

> PS: 至今不知道 nftable 怎么只把 icmpv6 给扔过去，如果有网友知道的话欢迎留言。

### 如何让 traceroute 持续下去

当我们利用 traceroute 跟踪路由时，本质上就是发送和接收一系列不同 TTL(hlim) 的 ICMP 包。通过在用户态模拟发送和接收这些 ICMP 包，改写 TTL 并捏造 src，就可以让 traceroute 认为中间存在更多的主机了。

这里使用了 python + scapy (发包) + netfilterqueue (用户态处理网络包)，因为即使是完整的程序也相当简单，实际上能使用其它语言 (C, Go, Rust, ...) 重写并提高性能。

**状态转移**：当我们收到 `hlim=N` 的包时，通过 `(src+N-1)` 回一个 `ICMPv6TimeExceeded` 包，这会迫使 traceroute 方在收到回包（并显示 `(src+N-1)` 这个 IP）后增加 hlim 值 (`hlim++`) 再次发送请求。
**终止条件**: 当 `hlim` 到达 IPv6 的允许最大值 (255) 时，traceroute 会自动终止跟踪，无需额外操作。如果希望在具体某个 `hlim` 处停止，则可以判断并将包扔回内核处理，此时正常回包完成跟踪。

参考代码：([来源](https://github.com/blahgeek/bgtr/blob/master/main.py))

```python
hlim = pkt.hlim - 1
if hlim < len(ROUTES):
    inpkt.drop()
    tosend = IPv6(src=ROUTES[hlim], dst=pkt.src) / ICMPv6TimeExceeded() / pkt
    __gen_send(socket, tosend)
else:
    inpkt.accept()
```

### 如何让 tracroute 念出想要的诗

当 traceroute 显示某个 IP 时，它实际会先查询该 IP 的 rDNS，例如 `2a09::` 会查询 `[很多 0].9.0.a.2.ip6.arpa.`，并将内容显示出来，具体格式就不详细介绍了。

而显示内容时，traceroute 会使用 libidna 库解析查询到的内容，如果内容包括 punycode，会尝试进行解码，其中就包括了中文和一部分的特殊符号，具体实现也不详细介绍。

{% note info %}
一部分操作系统在编译 traceroute 时，并未打开 libidna 的功能，因此只能看到原始的 punycode （以 `xn--` 开头的一串乱码）。此外，`mtr` 等工具也没有支持。如果需要在 `mtr` 上也能看的话，推荐换成英文的诗歌。
{% endnote %}

因此，只需要掌握对应 IP 的 rDNS 管理权，设置诗的每一句到对应的 PTR 记录，就可以显示自己想要的内容了。

## 如何念很多诗

跟随上述章节，现在应该有了一个能念诗的程序，但是它只能念一首诗。如果要念很多首的话，第一反应应该是开很多的 netfilter queue 或者跑很多的程序。

但是，楚辞+全唐詩+全宋诗+宋词，至少也得是几十万的级别，假如每一首诗都念一遍的话，没人会想在内核里塞几十万个 queue / 跑几十万个用户态程序的。

因此，只能改改代码试试别的方案。

### 如何预处理诗词数据

感谢 [chinese-poetry/chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) 这个仓库，基本上收录全了所有需要的诗词资料。美中不足的是，由于原始数据多为 OCR 扫描或人工录入，包含大量非中文字符、乱码和排版符号，预处理是必需的，否则在进行 punycode 转换时会报错。

我[这里](https://github.com/YukariChiba/dnsdraw/blob/master/import/func_str.py)做了简单预处理，基本上覆盖了绝大部分的情况：

- 英文符号必须移除
- 特殊符号、控制字符和制表符都需要被移除
- 一些 CJK 的补充字符区域的内容需要被移除
- 有一些占位符、原文意义不清使用 `/` / `|` 的符号都需要被移除
- 书名号需要被移除
- 逗号，问号，句号这类符号需要被替换成 `.`
- 由于上述操作，需要移除开始和结束的 `.` 字符
- 由于上述操作，需要移除重复的 `.` 和 `-` 字符

```python
# no englist char
s = re.sub("[a-z][A-Z]","",s)
# special char
s = re.sub("[\t\r\n+=]","",s)
# unicode: Private Use Area
s = replace_unicode_range(s, "\uE000", "\uF8FF", "x")
# unicode: Halfwidth and Fullwidth Forms
s = replace_unicode_range(s, "\uFF00", "\uFFEF", "x")
# unicode: CJK Radicals Supplement
s = replace_unicode_range(s, "\u2E80", "\u2EFF", "x")
# unicode: Ideographic Description Characters
s = replace_unicode_range(s, "\u2FF0", "\u2FFF", "x")
# placeholder char
s = re.sub("[●○　\*]", "x", s)
#s = re.sub("[□⻊○⿰　…=●Ｂ]","x",s)
# brackets and quotes
s = re.sub('[〖〗《》（）「」“”<>{}\[\]`〔〕]',"",s)
# or char
s = s.replace("/", "")
s = s.replace("|", "")
# underline
s = s.replace("_","-")

# duplicate char
s = s.replace("-.", ".")
s = s.replace("--", "-")
s = s.replace(".-", ".")
s = s.replace("..", ".")

# start and end
s = s.removeprefix(".")
s = s.removesuffix(".")

s = re.sub('[？?。,，；：…！!、：——]',".",s)
```

参考[此处](https://github.com/YukariChiba/dnsdraw/blob/master/import/import.py)的脚本遍历所有的诗词，最后生成的 json 文件内容示例如下，可见其格式已非常干净，能通过 punycode 转换：

```plain
陋巷孤寒士.出門苦恓恓
雖云志氣高.豈免顏色低
平生同門友.通籍在金閨
曩者膠漆契.邇來雲雨睽
正逢下朝歸.軒騎五門西
是時天久陰.三日雨淒淒
蹇驢避路立.肥馬當風嘶
迴頭忘相識.占道上沙堤
昔年洛陽社.貧賤相提攜
今日長安道.對面隔雲泥
近日多如此.非君獨慘悽
死生不變者.唯聞任與黎
```

### 如何判断念的是哪首诗

通常这样的情况会使用编号从 0/1 开始递增编号，但是这里我使用了诗词标题的 hash，以使所有的 IP 显得更加“普通”，且能保证一定程度的一致性。

IPv6 有 128 位，而常用前缀一般是 `/48` `/56` `/64` 这样的长度，为了避免出现冲突，要使用尽可能长的编码。

而为了能让念诗工作，显然还需要留出 IPv6 TTL 最大值 `0xff` (256) 即 8 位的空间用于填充（实际上，绝大多数诗词的长度远小于此）。

综上所述，为了美观，将 `/48` 的末 8 位用于填充 TTL，中间的剩余位作为诗词标题的 hash：

| Prefix | Hash | TTL |
| - | - | - |
| 48 | 72 | 8 |

于是我们有了高达 72 位的空间用于存放 `4.722e+21` 个 hash 值！这已经足够承载数十万首诗词的 hash 而几乎不发生哈希碰撞了。

至此，rDNS 解析的时候，只需要读取中间这 72 位，然后根据 hash 找到对应的诗，然后再根据最后 8 位返回对应的句子的 punycode 即可。

### 如何让诗在结束的地方停止

这个问题与“如何判断这是诗的哪一句”类似。

如果需要在 ICMP 处理的程序中加入判断诗结束的条件，那么在每一次回应 ICMP 时程序都会查询诗词长度，这必然导致引入查询逻辑，降低性能。

因此，负责处理 ICMP 的部分需要足够简洁，最好是无状态的。诗词长度信息必然需要通过某种方式包含在 ICMP 请求中。

可以注意到，即使是 DNS 解析出的用于路由跟踪的 IPv6 地址也包含 8 位的 TTL，只需要利用这最后的 8 位 TTL，在 DNS 解析的时候将解析出的 IPv6 的最后 8 位置为诗词长度 +2 (因为还要包含标题) 即可。

如此这般，需要额外增加的步骤只有在处理 ICMP 前，将 `dst` 的后 8 位取出作为 TTL 的最大值，程序的复杂度并没有显著增加。

### 如何提供正向解析

因为有前端，所以可以方便地一键复制，这里提供两种解析方式：

1. 通过 `[标题].域名` 解析。此时由 DNS 服务器计算 hash。
2. 通过 `[hash].hash.域名` 解析。此时 DNS 服务器跳过计算 hash 步骤。

DNS 服务器计算出 hash 后，仅需要读取长度信息，返回构造的 IP 即可。

此外，还需要考虑标题重名的可能性，因此 `[标题]` 可以更换为 `[分类].[章节].[标题].[作者]`，在极为少见的四节内容完全一致的情况下需要将标题替换为 `[标题][序号]` 以避免 hash 冲突。

## 如何实现念诗

### 如何实现（网络侧）

> 请读代码：https://github.com/YukariChiba/dnsdraw/blob/master/draw.py

这里的代码参考了 [blahgeek/bgtr](https://github.com/blahgeek/bgtr) 的 python 脚本。

值得注意的是如下部分做了调整：

- `group` 即为诗词的对应 hash
- `set_len` 即为诗词的长度

于是就有了最后产生的 `baseaddr + (group<<8) + hlim - 1` 的 `ICMPv6TimeExceeded` 回包。

此外，当跳数达到诗的总长度时，程序会使用欲跟踪的目标地址伪造一个 `ICMPv6DestUnreach` 的回复而非直接 `accept()`，且无论哪种情况，原始的数据包都会被 `inpkt.drop()`，因为这部分现在不由内核处理了。

```python
def handle(inpkt):
    pkt = IPv6(inpkt.get_payload())
    dstaddr = IPv6Address(pkt.dst)
    group = (int(dstaddr)-int(baseaddr))>>8
    set_len = (int(dstaddr) & 0xff)
    hlim = pkt.hlim
    if hlim < MAX_LEN and hlim - 1 < set_len:
        inpkt.drop()
        sendsrc = baseaddr + (group<<8) + hlim - 1
        tosend = IPv6(src=str(sendsrc), dst=pkt.src) / ICMPv6TimeExceeded() / pkt
        __gen_send(socket, tosend)
    elif hlim - 1 == set_len:
        inpkt.drop()
        sendsrc = baseaddr + (group<<8) + hlim - 1
        tosend = IPv6(src=str(sendsrc), dst=pkt.src) / ICMPv6DestUnreach() / pkt
        __gen_send(socket, tosend)
    else:
        inpkt.drop()
```

### 如何实现（DNS 侧）

> 请读代码：https://github.com/YukariChiba/dnsdraw/blob/master/dns.py

DNS 部分无疑是最复杂的，因为它要同时承担三个任务：

- 处理 PTR 记录，返回对应诗句。
- 处理 AAAA 记录，返回构造好的 IP 地址。
- 担任前两者的 delegation server，返回足够的信息（例如 NS/SOA 记录）让各 DNS 解析器认为它合法。

这里使用了一部分[被广为流传的 simpledns](https://github.com/tompohl/WeevBot/blob/master/simpledns.py) 代码，删除了大部分无用的内容。

整个项目使用 `shake_256` 算法为诗名生成一个 72 位的 hash。SHAKE 是一种可扩展输出函数（XOF），非常适合生成指定长度的 hash。

```python
hashlib.shake_256(text.encode('UTF-8')).hexdigest(9)
```

而在具体的解析部分，只需要注意一下基本的边界条件即可。

### 如何实现（前端）

> 前端由 gemini 提供技术支持。

## 示例

```bash
# 以白居易的《长恨歌》为例
yukari@ewepc:~$ traceroute 全唐诗.唐诗.長恨歌.白居易.draw.strexp.net
traceroute to 全唐诗.唐诗.長恨歌.白居易.draw.strexp.net (2a0e:b107:b7f:1306:b565:b8e9:5c16:2a3d), 30 hops max, 80 byte packets
......（略）
 4  sol1.kr.bkb.strexp.net (2a0c:b641:7af:a::)  128.938 ms  128.935 ms  128.960 ms
 5  全唐诗.唐诗.長恨歌.白居易 (2a0e:b107:b7f:1306:b565:b8e9:5c16:2a00)  128.986 ms  129.070 ms  129.083 ms
 6  漢皇重色思傾國.御宇多年求不得 (2a0e:b107:b7f:1306:b565:b8e9:5c16:2a01)  131.284 ms  155.760 ms  136.175 ms
 7  楊家有女初長成.養在深閨人未識 (2a0e:b107:b7f:1306:b565:b8e9:5c16:2a02)  136.292 ms  136.283 ms  136.306 ms
 8  天生麗質難自棄.一朝選在君王側 (2a0e:b107:b7f:1306:b565:b8e9:5c16:2a03)  138.606 ms  138.558 ms  118.631 ms
 9  回眸一笑百媚生.六宮粉黛無顏色 (2a0e:b107:b7f:1306:b565:b8e9:5c16:2a04)  127.125 ms  118.142 ms  163.256 ms
......（略）
```
