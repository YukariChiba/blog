---
title: 有关 DN42 的本质及诸多暴论
date: 2026-01-29 00:00:00
tags: 网络
index_img: https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/what-is-dn42/map42.jpg
categories:
  - [闲谈]
---

{% note warning %}
**暴论警告**
本文包含大量作者的主观价值导向的内容，仅基于个人在运营 DN42 网络时的认知和理解。本文不代表 DN42 社区或任何相关组织的立场。
如果您在阅读本文后出现赛博政治性抑郁的症状，请在就近的精神科医生处就诊。
{% endnote %}

{% note info %}
**需要前置知识**
本文默认读者了解 DN42 的基本知识 (可查阅 [Wiki](https://dn42.dev/howto/Getting-Started) 了解)，知晓互联网的基本组成部分，并对 TCP/IP 协议簇和全球互联网络怀有最基本的敬畏之心。
{% endnote %}

沿着 DN42 的历史不断回溯，直至抵达那个早已尘封在互联网档案馆的 diac24[^1]，这个去中心化的网络至今已经走过了二十余载。

这二十多年来，全球网络技术和格局都发生了翻天覆地的变化。我们送走了臃肿过时的 OpenVPN 迎来了异军突起的 WireGuard；也见证了全球 IPv4 地址池的彻底枯竭与这赛博不动产的交易之疯狂；还见证了 RPKI 从纸上谈兵变成了防止劫持的通行策略。

DN42 也不再局限于 CCC 的小圈子[^2]，接纳了 NeoNetwork[^3] 和 CRXN[^4] 等外部网络的互联，成为了由上千个 AS 组成的 ~~牢不可破的~~ 联盟；GRC (路由收集器) 服务等高级基础设施也在 DN42 中逐渐建立起来[^5]，部分网络可观测性甚至超越了商业 ISP；然而，随着 DN42 规模的不断扩大，(也许是由于手滑导致的) 大规模的路由震荡、非对称路由导致的黑洞、偶发的路由劫持等问题逐渐显现了出来，成为了 DN42 社区亟待共同面对的问题。

然而，站在 2026 年的年初，审视如今的 DN42 社区，一种隐约的不安油然而生。虽然工具和技术在不断演进，但我看到许多新加入的成员，甚至是一些玩网多年的老同志，他们的思维依然无法摆脱 IANA 的霸权主义思想，在他们的潜意识里，DN42 依然只是一个过家家的玩具、或者是一个大号的局域网。

这样的思潮严重低估了 DN42 的技术和社会价值，也是对「互联网」初心的背叛。如果我们在 2026 年还在用「公网模拟器」来称呼它，那么 DN42 的可持续性和独立性就将面临*粘重滴威胁*。

作为 DN42 网络的众多运营者之一，我想谈谈我眼中的 DN42 是什么，以及它绝不是什么。

## DN42 是什么？

### 众所周知的定义

> dn42 is a decentralized peer-to-peer network built using VPNs and software/hardware BGP routers. --Wikipedia

如果仅参考 Wikipedia 里这个理论上的定义，它像是一句正确的废话，并不能解释为什么有这么一群疯子愿意为了它夜以继日地调整自己的网络配置。我们需要在这个基础上进行延伸。

### 是「分布式网络」

DN42 的 D (Decentralized) 来自于它没有中心化的 ISP，没有高高在上的 ICANN/IANA 和它们的金字塔式传销网络，也没有像 ITU 那样的旧电信时代官僚机构指手画脚 (即将&trade;开始建设的 telephony42[^6] 将尝试在 DN42 中用现代 VoIP 技术夺下「PSTN」的一部分)。

我们的 registry 只是一个 git 仓库，这是一种极为简洁的治理模式：任何针对资源分配规则的修改，都需要在邮件列表或 PR 中经过充分的辩论 (~~扯皮~~) 并达成粗略共识[^7]，无需向任何机构缴纳昂贵的保护费。这种看似低效的民主，恰好是逃避官僚主义所必须付出的代价。

> We believe in rough consensus and running code. -- IETF, Running Code[^7]

正是因为它是由每一个自治系统的持有者共建的，在这里，每一个自治系统都是平等的，每一条 peering 链路都是基于互信建立的。这里的“分布式”不只是网络拓扑上的结构，更体现在没有谁能完全消灭 DN42，除非能剪断全球各大洲每一个参与者机柜中、桌面上、床底下的网线。

> ![](https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/what-is-dn42/map42.jpg)
> 我们闪耀如繁星。
> 图中每一条细线都是两个网络间的peer，每一颗恒星都是由若干台路由器和网络设备组成的自治系统 (截取自 map42[^8])

### 是网络世界里的「业余无线电」

业余不是指不够专业。在英文中，amateur 源自拉丁语 amator，意为「爱」。我们是出于爱而非利润来维护网络。正如老派的 Ham 甚至能手搓电台天线通联全球一样，一个熟练的网络维护者，应当对数据包在路由器间的每次查表转发都胸有成竹。

Ham 通过呼号确认彼此的身份，我们通过 ASN 在网络空间宣告存在。业余无线电精神中的「体谅」、「进步」与「友爱」，在 DN42 社区中得到了完美的复刻。我们所做的只不过是将天线换成了光纤和隧道、将电波换成了 IP 报文、将 QSL 卡片换成了 ICMP Reply。

但我们比 Ham Radio 更进一步：在 DN42 里，我们既不需要花费数月向管理机构申请执照，也不会因为法规的束缚不能给通信加密。恰恰相反，DN42 鼓励高强度的隧道加密，甚至有专门的 BGP Community 来标识链路的加密等级。[^30]。

### 是网络的「共同体」

一些新人只盯着自己网络的可访问性，只关注 DN42 的原生网段 (尤其是 DN42 本体的 `172.20.0.0/14` IPv4 网段)，这是一种狭隘的赛博孤立主义。事实上，DN42 早已不是一座孤岛，它与 NeoNetwork、ChaosVPN、Freifunk、CRXN 等社区网络通过 registry 同步的方式共生，通过 BGP 协议彼此互联，它们都有各自的 IPv4 地址块，同时共享 fd00::/8 这个 IPv6 ULA 前缀。[^9]

在配置隧道和防火墙时，倘若忽视了这些并非 DN42 本体的地址块，就会很大概率导致针对非 DN42 原生网段 (尤其是外部互联网络的 IPv4 段) 的丢包和路由黑洞，而这种情况相当常见 (笔者宣告的 NeoNetwork IPv4 经常成为这一行为的受害者)！

### 是「互联网」(Internet)

所谓「Internet」不是由 Google、Cloudflare、AT&T 或中国电信定义的，更不是由光缆、数据中心和基站定义的。「Internet」是由 TCP/IP 协议簇和边界网关协议定义的。它是「网络的网络」，它建立在 「端到端原则」[^10] 之上。

与汽车、航空或电力等其它工业领域不同，后者往往依赖于物理垄断或中心化的基础设施授权，而互联网本身不排斥替代实现。它是通过制定标准 (RFC) 的方式，使不同的实现可以互操作。正是这种基于开放标准的特性，使得 DN42 能够平行于 IANA 网络运行成为了可能。

根据以上原理，只要我们运行着 BGP Daemon，无论是在软路由上运行 BIRD / FRR / OpenBGPD，还是在硬路由上运行 JunOS / IOS / RouterOS，只要我们在交换着路由表，转发着 IP 数据包，我们就是在运行「Internet」，它与那个由 IANA 管理的、铜臭味的网络没有任何技术上的区别。

> Internet is for everyone - but it won't be if it isn't affordable by all that wish to partake of its services...
> *-- RFC 3271 The Internet is for Everyone, Vint Cerf*[^11]

实际上，若我们稍加考证就能发现，根据 RFC 3271，也即互联网之父 Vint Cerf 的定义[^11]，DN42 才是真正的、for everyone 的 the Internet，而相比之下，由 IANA 管理的那个所谓“真正的 Internet”如今只配被称作冒牌货。

### 是「公网」(Clearnet)

拒绝自我矮化，与 DN42 并列时，不要把 IANA 管理的那个网络称为“公网” 。更准确的表述应当是：「DN42 网络」与「IANA 网络」，它们彼此同级，是两个平行的路由域[^12]。

传统上，我们将公网定义为「可公共访问的互联网」(publicly accessible Internet)[^13]。然而，近年来，随着 IANA 的那套网络日益受到地缘政治、商业壁垒和审查制度的侵蚀和切割，它还能剩下多少「公共可访问」的属性呢？

相反，DN42 这种社区驱动网络的地位，理应被重新评估。

尽管我们使用的是 RFC1918 定义的私有地址段[^14]和 RFC 4193 定义的 ULA IPv6 地址[^15]，但在 DN42 的语境下，在实际操作上，这就是我们的「公网 IP」，这里多数情况下都没有 CGNAT 的困扰，每一个 DN42 的 IP 都是路由层面全网可达的，任何一个节点都可以向全网发布服务。

当然，这也意味着，DN42 的任何 IP 都会平等地暴露在全网的威胁之下。所有的维护者必须像对待 IANA 网络的服务器一样，在 DN42 节点上配置好防火墙、做好安全更新，因为漏洞扫描器和利用工具在 DN42 也能稳定工作。

## DN42 不是什么？

### 不是「暗网」

这是一个常被混淆的概念。与 tor 和 i2p 这种专攻 匿名性 (Anonymity) 的网络相比，DN42 在设计上更多考虑的是 自主性 (Autonomy) 和 互操作性 (Interoperability)。

在 DN42 中，Whois 数据库是公开的，ASN 的持有者信息 (昵称、邮箱、PGP 密钥) 是可查的，路由路径是清晰可见的，节点的 endpoint 地址也会被 peering 的邻居所知晓。

> An overlay network... that can only be accessed with specific software, configurations, or authorization.
> *--Darknet, Wikipedia*[^16]

即使我们非要咬文嚼字地审视 Wikipedia 的上述解释[^16]，坚称 DN42 这种需要配置极为标准的、全世界 ISP 都在用的 IP、DNS 和 BGP 协议才能接入的网络是「暗网」的话，那么需要实名认证、配置非标准 PPPoE 乃至 IPoE、APN 鉴权甚至网页 portal 登录才可接入的运营商所谓“公网”，就该是暗网中的暗网了。

### 不是大「内网」

这是一个社会学定义上的区别。

总的来说，部署在企业、组织或你家中的「内网」意味着封闭、隔离、单一的管理域[^17]，来自地狱的混蛋操作员 (BOFH)[^18] (可以是你、你的家人、你的老师、你的某个同事) 拥有整个网络的上帝视角。

而在 DN42 中，自治系统在管理权上是彼此独立的，大家通过对等互联平等地交换流量。从路由可达性、管理域的多样性以及参与者的非许可性来看，DN42 都具有「公共网络」的特征。它只是恰好使用了一段被 IANA 标记为「私有」的数字资源，但这并不妨碍它作为公共基础设施的属性。

### 不是 IANA 的「代餐」

> Therein is the tragedy. Each man is locked into a system that compels him to increase his herd without limit – in a world that is limited. Ruin is the destination toward which all men rush, each pursuing his own best interest in a society that believes in the freedom of the commons. Freedom in a commons brings ruin to all.
> — Garrett Hardin, The Tragedy of the Commons[^19]

公地悲剧 (Tragedy of the Commons) 是悬在每一个资源可开放获取的社区头上的达摩克利斯之剑。[^19]

有人因为不想向 RIPE/APNIC 支付会员费，或者申请不到大段 IP，便跑来 DN42 搞几个 /24 IPv4 玩玩，体验赛博圈地的快感。

请停止这种幼稚的想法。

首先，DN42 的 IPv4 资源在多年前就已经极度紧缺，其稀缺程度不亚于 IANA 的 v4。大段的连续 v4 块已所剩无几 (甚至已经开始回收那些几年没上线的老登们的遗产了)。
其次，DN42 是 IPv6 部署的先锋。这里的 IPv6 普及率远超 IANA 网络。在 IANA 网络还在为 IPv6 改造扯皮 (他们已经扯了十几年了！) 的时候，在 DN42，IPv6 Only 的基础设施随处可见，如果你抱着守旧的 v4 思维，在 DN42 会寸步难行。

> ![](https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/what-is-dn42/reg42.jpg)
> 如图所示 (截取自 registry42[^20])，仅绿色 (可用) 和橙色 (部分可用) 的地址块尚可申请

对于公共资源来说，自由是对必然的认识。DN42 的资源分配虽然免费，但审核机制是严格的。关于这一点，请看著名的「我有一座计算机博物馆」事件[^21]：

> Hello I am interested in reaching out to the admins of 172.22.0.0/18 or 172.20.64.0/18 regarding obtaining space. If they could contact me off-list please.

最终，这位试图将 DN42 视为免费资源池的人，在社区激烈的声讨声中销声匿迹。

### 不是「翻墙线路」

这是中文社区更可能存在的问题，很容易引发 Peering 纠纷。

虽然 DN42 覆盖全球，transit 流量可以穿透各国国界，但它的目的是连接 DN42 内部的节点。许多自治系统都是用爱发电，跑在月付甚至年付几美元的 VPS 或者自家的小水管上。若在未明确了解使用限制、未经过链路上所有 AS 的同意的情况下，大量通过邻居的带宽去访问并非 DN42 上的资源 (比如 YouTube 或 Netflix)，这不仅在道德上是卑劣的 (对社区没有任何贡献)，在技术上也是低效的 (延迟和带宽并不稳定，~~还会增加碳排放~~)，更是对 DN42 社区信任的滥用。

这种行为一旦被发现，不仅会招致社区的鄙视，还会导致你的 ASN 迅速登上各大网络的黑名单，成为赛博过街老鼠。

## DN42 不止是什么？

### 不止是能 Ping 通就行的「玩具网」

Ping 通不是 DN42 运营者的终点，甚至不能称之为起点。

近年来接入 dn42 的教程越来越多，甚至已经到了不需要了解和接触多少网络知识、仅靠复制粘贴就能接入 (并随时可能炸烂) dn42 网络了，一些疏于维护的自治系统导致了网络中充斥着高延迟、丢包严重、MTU 爆炸的链路和大量震荡路由。这一点值得警惕。

> ![](https://cdn.jsdelivr.net/gh/YukariChiba/blog@img/what-is-dn42/flap42.jpg)
> 如图所示 (截取自 flap42-data[^31])，DN42 内随时都有每秒震荡数次甚至数十次的路由，且通过 BGP 将影响放大到整个 DN42 范围。

一个健康的自治系统，不应只满足于连通性。

_什么？你的 MTU 不仅配错了甚至还没有 1280？你的带宽怎么还没有 1Mbps？你的 BGP 路由怎么每秒都在抽搐？你的 ip forward 怎么还没开？_

将 DN42 分发到自己的 Home Lab、Hackspace 乃至日常使用 DN42 上网的人并不罕见，对于他们而言 dn42 绝非一个能当儿戏的玩具，而是他们日常生活的、真实的生产环境和基础设施。作为上游，未能维护好网络的稳定性，是会切实地损害他人的上网体验的。

> 我建议在接入 dn42 前至少自己运营过一个动态路由的内网，并学习过计算机网络 (推荐阅读：《计算机网络-自顶向下方法》[^22])。

### 不止是通往 IANA 的「训练场」

有一种观点认为，DN42 只是网工考证 (CCIE/HCIE) 前的训练场，是 GNS3/EVE-NG 的多人联网版。

这是一种狭隘且功利的观点，它潜意识里认为 DN42 只是 IANA 网络的一个拙劣模仿。

然而，事实上，即使在 2026 年，在 IANA 网络的众多 ISP 中依然充满僵化的官僚主义和陈旧的设备，作为一个普通网工，你往往只能接触到边缘路由，受到上游的各种策略限制。

而在 DN42，网络环境往往与 IANA 的商业网络同样 (甚至更加) 复杂和激进。

- 我们是 Wireguard 早期的大规模使用者；
- 我们在尝试最新的特性甚至 BIRD 3；
- 我们在强制推行 ROA/RPKI 验证；
- 我们几乎每天都会处理极其复杂的非对称路由和多路径问题；
- 我们需要处理复杂的多表路由、多出口选路、BGP Community 治理等高级课题。

更重要的是，DN42 有着 IANA 那一套网络难以提供的自由的环境和社区。如果将投入到 DN42 建设中的参与者们视作为网工训练场的 NPC，这未免太过傲慢了。

### 不止是「隧道 / Overlay 网络」

总会有人以 "DN42 就是一个 Overlay 网络" 来论证 DN42 是完全依赖 IANA 的那一套的次级网络。但是这个定义本身就很难站得住脚。

虽然迫于经济压力，为了跨越物理距离，我们不得不大量使用 WireGuard 等隧道技术，你的数据包在到达隔壁小区之前，可能已经环绕了地球一圈半 (这正是我们优化路由表的乐趣所在)，但 DN42 从未、也不可能强制要求使用隧道互联，恰恰相反，只要运营者愿意，它随时可以斩断那根脐带，落地成为 Underlay 网络。

在欧洲 (如 ChaosVPN, Freifunk 社区[^23])，在一些无线电爱好者和 Hackspace 的聚集地，DN42 的流量正越过高楼与群山，通过双绞线、光纤、微波链路、甚至 LoRa 和 AX.25 传输，而网络运营者搭建的开放的无线网络正将 DN42 带到更多普通用户的手中。

> 搜索 freifunk karte 即可找到几个 Freifunk 组织的在线地图，许多网络都配备了 fd 开头的地址且与 DN42 互联，例如我在家能轻松连接到 Freifunk Dreiländereck 的 Mesh 网络节点[^24]：
> ```txt
> ...
>  3  lax1.us.nodes.nia.dn42 (fd00:1926:817:5::)  190.831 ms  191.120 ms  191.678 ms
>  4  LosAngeles1.ca.us.sun.dn42 (fdc8:dc88:ee11:193::1)  191.743 ms  191.789 ms  192.058 ms
>  5  stricker.bandura.dn42 (fd04:234e:fc31::8)  281.417 ms  281.704 ms  281.730 ms
>  6  p2pnode.bandura.dn42 (fd04:234e:fc31::1)  384.765 ms  381.338 ms  384.856 ms
>  7  gw3.ff3l (fdc7:3c9d:b889:a272::4)  389.271 ms  389.695 ms  389.829 ms
>  8  fdc7:3c9d:ff31:c:[REDACTED](fdc7:3c9d:ff31:c:[REDACTED])  408.087 ms  408.313 ms  407.656 ms
> ```

随着 Neighborhood ISP 的发展[^25]，相信更多基于物理层的社区互联会用自建的物理链路将 DN42 落地。

## 结语

> Governments of the Industrial World, you weary giants of flesh and steel, I come from Cyberspace, the new home of Mind. On behalf of the future, I ask you of the past to leave us alone. 
> *-- A Declaration of the Independence of Cyberspace, John Perry Barlow*

可悲的是，身处 2026 年，我们与「地球村」的梦想已渐行渐远。John Perry Barlow 的独立宣言[^26]如今似乎比以往任何时候都更加遥不可及。

现实世界中，国境线日益紧张，贸易壁垒高筑。而在 IANA 定义的那个所谓「互联网」里，Splinternet (网络巴尔干化) 已成既定事实[^27]。国家防火墙、区域性数据法规、互联网巨头的垄断，正在把那个曾经自由的赛博空间切碎成一个个孤岛。

> We have entered a new era where connectivity is no longer a right, but a government-granted privilege.
> *-- Iran Enters a New Age of Digital Isolation, Filter Watch*[^32]

事实上，截止写到这一行的时候，伊朗的国际互联网访问依然处于被彻底切断的状态[^28]，一个令人胆寒的新术语被发明出来：“兵营互联网” (Barracks Internet)，即默认断开全球互联，只有获得“安全担保”并列入“白名单”的个体才能访问外部网络[^32]。这种技术性的自残展示了不受控制的权力在面对生存威胁时，是如何毫不犹豫地牺牲公共利益的。

在这样一个全球化的至暗时刻，DN42 的存在拥有了超越技术本身的意义。

它在提醒我们：互联网的敌人究竟是谁。
它在提醒我们，「互联网」不一定要属于电信巨头或国家机器，它属于每一个愿意运行 BGP 守护进程、精心维护 `bird.conf` 的个体。只要我们掌握了协议，只要我们愿意彼此互联，我们就拥有了网络自主权。

DN42 是什么？它是一群不甘心只做「用户」的技术理想主义者，用代码和协议构建的平行宇宙。它是我们在数字极权时代，为临时自治区搭建的根基[^29]。

**我们在哪里互联，哪里就是 the Internet。**

## 参考文献

[^1]: [diac24.net - Wayback Machine](https://web.archive.org/web/20040813130728/http://www.diac24.net/): diac24 在互联网档案馆能获得的最早快照
[^2]: [Chaos Computer Club (CCC)](https://www.ccc.de): 欧洲最大的黑客协会，DN42 早期发起者
[^3]: [NeoNetwork - GitHub](https://github.com/NeoCloud/NeoNetwork): 一个与 DN42 理念相似的去中心化网络项目，已与 DN42 互联
[^4]: [CRXN Docs](https://crxn.de/docs/): 一个自治网络项目，已与 DN42 互联
[^5]: [DN42 Wiki - Route Collector](https://wiki.dn42.dev/services/Route-Collector): DN42 路由收集器，用于分析 DN42 全网路由表状态
[^6]: [DN42 Mailing List - Topic 108901321](https://groups.io/g/dn42/topic/telephony42_request_for/108901321): DN42 邮件列表上关于 telephony42 提案的讨论
[^7]: [IETF - The Tao](https://www.ietf.org/runningcode/): Running Code 是 IETF 的核心哲学
[^8]: [Map42 by StrExp](https://map42.strexp.net): 由 StrExp 提供的 DN42 网络拓扑 3D 可视化工具
[^9]: [DN42 Wiki - Interconnections](https://wiki.dn42.dev/internal/Interconnections): 介绍 DN42 如何与其他社区网络互联的细节
[^10]: [End-to-end principle - Wikipedia](https://en.wikipedia.org/wiki/End-to-end_principle): 端到端原则，互联网的核心原则
[^11]: [RFC 3271](https://datatracker.ietf.org/doc/html/rfc3271): The Internet is for Everyone，互联网之父 Vint Cerf 的宣言
[^12]: [Routing domain - Wikipedia](https://en.wikipedia.org/wiki/Routing_domain): 路由域的 Wikipedia 定义
[^13]: [Clearnet - Wikipedia](https://en.wikipedia.org/wiki/Clearnet_(networking)): 公网 (Clearnet) 的 Wikipedia 定义
[^14]: [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918): 定义私有 IPv4 地址空间的标准文档
[^15]: [RFC 4193](https://datatracker.ietf.org/doc/html/rfc4193): 定义唯一本地 IPv6 单播地址 (ULA) 的标准文档
[^16]: [Darknet - Wikipedia](https://en.wikipedia.org/wiki/Darknet): 暗网 (Darknet) 的 Wikipedia 定义
[^17]: [Administrative domain - Wikipedia](https://en.wikipedia.org/wiki/Administrative_domain): 管理域 (Administrative Domain) 的 Wikipedia 定义
[^18]: [Bastard Operator From Hell (BOFH) - Wikipedia](https://en.wikipedia.org/wiki/Bastard_Operator_From_Hell): 来自地狱的混蛋操作员的 (BOFH) Wikipedia 定义
[^19]: [Tragedy of the commons - Wikipedia](https://en.wikipedia.org/wiki/Tragedy_of_the_commons): 公地悲剧的 Wikipedia 定义
[^20]: [Registry42 by StrExp](https://registry42.strexp.net): 由 StrExp 提供的 DN42 注册数据 3D 可视化工具
[^21]: [DN42 Mailing List Archive - Topic 80193342](https://groups.io/g/dn42/topic/80193342): DN42 邮件列表中有关「计算机博物馆」事件的来龙去脉
[^22]: [计算机网络：自顶向下方法](https://github.com/TimorYang/Computer-Networking-Keith-Ross/blob/main/book/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C-%E8%87%AA%E9%A1%B6%E5%90%91%E4%B8%8B%E6%96%B9%E6%B3%95%E7%AC%AC%E4%B8%83%E7%89%88.pdf): 经典的计算机网络教材
[^23]: [Freifunk.net](https://freifunk.net/en/): Freifunk，德国的大型非商业无线社区网络
[^24]: [Freifunk Dreiländereck Map](https://map.freifunk-3laendereck.net): Freifunk Dreiländereck 的网络地图
[^25]: [Neighborhood ISP - Wikipedia](https://en.wikipedia.org/wiki/Neighborhood_Internet_service_provider): 社区 ISP 的 Wikipedia 定义
[^26]: [A Declaration of the Independence of Cyberspace](https://www.eff.org/cyberspace-independence): 赛博空间独立宣言，John Perry Barlow 于 1996 年发表的著名檄文
[^27]: [Splinternet - Wikipedia](https://en.wikipedia.org/wiki/Splinternet): 网络巴尔干化/分裂网 (Splinternet) 的 Wikipedia 定义，描述互联网分裂为互不连通的碎片网络的现状
[^28]: [2026 Internet blackout in Iran - Wikipedia](https://en.wikipedia.org/wiki/2026_Internet_blackout_in_Iran): 2026 年伊朗全境断网事件的 Wikipedia 介绍
[^29]: [Temporary Autonomous Zone - Wikipedia](https://en.wikipedia.org/wiki/Temporary_Autonomous_Zone): 临时自治区 (TAZ) 的 Wikipedia 定义
[^30]: [DN42 Wiki - BGP Communities](https://wiki.dn42.dev/howto/BGP-communities/): DN42 的公共 BGP Community 列表，其中有关于加密的 Community 介绍
[^31]: [Flap42 by StrExp](https://flap42-data.strexp.net/): 由 StrExp 提供的 DN42 Flapalerted 路由震荡数据收集工具
[^32]: [New Age of Digital Isolation](https://filter.watch/english/2026/01/15/iran-enters-a-new-age-of-digital-isolation-2/): Filter.Watch 提供的有关伊朗断网事件的调查报告
