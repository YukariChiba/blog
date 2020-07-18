---
title: 'DN42系列外传 0x00 : 利用Nebula建立p2p网络'
date: 2020-07-18 15:51:31
tags: DN42, 网络
index_img: https://cdn.jsdelivr.net/gh/SteveCharlesYang/blog@img/index_img/dn42-ext-0x00.jpeg
categories:
  - [学习, 不务正业]
  - [技术, 高端但没啥用, DN42]
---

[Nebula](https://github.com/slackhq/nebula/) 是 slack 开源的一款 p2p 网络工具，可以用以建立跨越 NAT、彼此互联的 Overlay Network。
这个工具虽然刚刚开源，但它已经被运用在 slack 内部的网络中有两年时间了，同时，其使用的 [Noise](https://noiseprotocol.org/) 协议为流量加密提供了良好的支持。该工具使用 MIT 协议授权，并使用 Go 语言编写。

结构

Nebula 网络非常简单，只有两种节点类型：

1. 标准的「用户节点」，可以在「灯塔节点」的引导下与其他节点通过 P2P 相连。
2. 「灯塔节点」是必须具备公网 IP 地址和开放端口的服务器，负责协调客户端之间的发现和通讯。

## 安装

由于 Nebula 处于不断更新状态，有一些新的特性并不能立即体现在发布版本中，因此需要手动 clone 下来编译。

git clone https://github.com/slackhq/nebula
截至目前，Nebula的发布版本为1.1，支持amd64，arm，mips等多个平台。

## 创建CA证书
Nebula 通过将 ip 地址和路由等信息嵌入到证书文件，可以实现只需要证书和一个固定的配置文件即可加入网络。CA 证书的创建可直接使用 `nebula-cert` 创建：

证书的创建需要几个字段：

- -groups： 该CA证书签发的子证书可以使用哪些组，这些组可以方便地配置防火墙策略。
- -ips：该CA证书适用的IP地址段。
- -name：该CA的名称。

```
nebula-cert ca -groups admin,users,server,router,ix,uestc,client -ips 172.20.158.128/26,172.20.168.128/25 -name "NIACNET Networking CA"
```

执行该步骤后，会在目录下生成 `ca.crt`（证书）和 `ca.key`（密钥）。

## 创建用户证书
如果没有指定参数，`nebula-cert` 将默认使用本目录的 `ca.crt/ca.key`。

有以下几个参数：

- -group：该证书所属的设备流量将被归为哪些组。
- -ip：IP 地址将被嵌入在证书中，这增加了网络的稳定性，除非配置错误，否则不太可能出现 IP 地址冲突的状况，同时也能够在不同的用户端使用相同的配置模板，同时也便于大规模部署。
- -name：名称是可以随便取的，但我依然按照域名来写。
- （可选）-subnets：该节点可以通过本参数被指定为 Nebula 网络的出口，与其他网络互联。在这里，为了与 DN42 互联，我指定了 172.20.0.0/14。
以下是某个「灯塔节点」的配置。

```
nebula-cert sign -groups ap,server -ip 172.20.168.129/25 -name 1.ap.nia
```

它也会在目录下生成一个与 `-name` 相匹配的 .crt 和 .key 文件。

## 配置文件详解

事实上还要其它可选的配置参数，但目前只需要这些，就可以建立一个完整的网络了。

### PKI

指定 CA 和用户证书。

```
pki:
   ca: /etc/nebula/ca.crt
   cert: /etc/nebula/charles-laptop.nia.crt
   key: /etc/nebula/charles-laptop.nia.key
```

### 静态主机映射

一开始 Nebula 并不知道该如何寻找主机，这里可以进行映射关系的建立。这时候需要将设定好的「灯塔节点」主机对应的 Nebula 地址和公网地址/端口填进来，以便于首次连接并寻找新的节点。

```
static_host_map:
   "172.20.168.129": ["xxx.xxx.xxx.xxx:4242"]
```

### 灯塔

如果需要将某个节点指定为「灯塔节点」，将 `am_lighthouse` 改为 `true` 即可。

同时，它也内建了一个 DNS 服务，可以方便快速地查找主机。但由于 NIACNET 将与 DN42 互联，有时候需要添加一些额外的记录，在此场景下关闭内置的 DNS。

`hosts` 是需要被指定为「灯塔节点」的 Nebula 地址，如果本身就是「灯塔节点」，则此处留空。

```
lighthouse:
   am_lighthouse: false
   #serve_dns: false
   #dns:
     #host: 0.0.0.0
     #port: 53
   interval: 60
   hosts:
     - "172.20.168.129"
```

### 端口

侦听的端口和地址，通常侦听 0.0.0.0 及使用 4242 端口。

```
listen:
   host: 0.0.0.0
   port: 4242
```

### 打洞

如果设备位于 NAT 及防火墙后，则需要打洞，打开 punchy 将定期发送报文，有助于维持隧道的稳定建立。

`punchy_back` 则是反向打洞，使用此功能后，另一方在收到建立连接的请求后，将会再反向发送一次请求。这有利于在打洞困难的完全锥形 NAT 下进行隧道的建立。

```
punchy: true
punch_back: true
```

### 加密

其实在完全用于国内节点的网络中，高强度的加密意义不大，这里使用了默认的 `chachapoly` 加密。

```
cipher: chachapoly
```

### 本地网段

定义本地网段的好处在于能够快速地找到用以建立连接的最快的路径，这适用于设备处于同一个局域网内。

```
local_range: "10.0.0.0/8"
```

### 隧道

隧道可以选择 tap 和 tun 两种，这里我选择了 tun，同时将 `drop_local_broadcast` 和 `drop_multicast` 关闭，以便于接收到广播和多播。

由于不同节点的网络环境各不相同，MTU 将使用较为保守的 1300，而 Nebula 也同时提供了对不同路由的 MTU 选项。

`unsafe_routes` 是非常重要的功能，它提供了网络对外的出口路由，通过 `via` 指定一个证书内包含 `subnets` 字段的节点，Nebula 在启动时便会自动地配置好相应的路由表，这里我选择某一个节点，将其接入到 DN42 网络。

```
tun:
   dev: nia0
   drop_local_broadcast: false
   drop_multicast: false
   tx_queue: 500
   mtu: 1300
   routes:
     #- mtu: 8800
     #  route: 10.0.0.0/16
   unsafe_routes:
      - route: 172.20.0.0/14
        via: 172.20.168.131
        mtu: 1300
```

### 防火墙与安全组

防火墙的默认设置看起来并不需要太大的更改：

```
firewall:
   conntrack:
     tcp_timeout: 120h
     udp_timeout: 3m
     default_timeout: 10m
     max_connections: 100000
```

而对于出站流量，通常是全部允许的。

```
outbound:
     - port: any
       proto: any
       host: any
```

而对于入站流量，icmp 是建议被打开的（方便进行 ping 等操作），而 groups 参数可以填入仅希望证书中带有哪些组的客户端能够访问。此外也可以指定 CA、IP 或者名称。

```
  inbound:
    - port: any
      proto: icmp
      host: any

    - port: 443
      proto: tcp
      groups:
        - users
```

### 除此之外…

Nebula还具有这些功能：

- 与 prometheus、graphite 等工具配合记录网络信息。
- 内置的 ssh 服务端，用以查看网络状态和维护节点配置。

### systemd 服务
在 Arch 系发行版下，我创建一个 Nebula 的 systemd 服务，它被放置在 `/etc/systemd/system/nebula.service`，相应的配置文件则在 `/etc/nebula/config.yml`。

```
[Unit]
Description=Nebula Network
Wants=basic.target
After=basic.target network.target

[Service]
SyslogIdentifier=nebula
StandardOutput=syslog
StandardError=syslog
ExecReload=/bin/kill -HUP $MAINPID
ExecStart=/usr/bin/nebula -config /etc/nebula/config.yml
Restart=always

[Install]
WantedBy=multi-user.target
```

### 路由
理论上讲 Nebua 网络不存在多跳的路由，但是在某些状况下（完全锥形 NAT 和垃圾运营商），必须有中转节点来进行转发。

欲达到这样的目的，需要在每个节点上单独配置自己的 `unsafe_routes`，然后在中转节点开启转发功能并配置路由。

### 优化
Nebula 使用的 UDP 协议有时候会被运营商 QoS 所限制甚至掐断，为了应对这一问题，可以考虑使用 udp2raw 来对 udp 包进行伪造。

### 测试
当全部节点均安装并启动后（包括本机），使用 `ping` 指令可以成功连接对方主机，同时观察 `traceroute` 可以发现是直连的。

```
[charles@charles-laptop nebula]$ ping 172.20.168.129
PING 172.20.168.129 (172.20.168.129) 56(84) bytes of data.
64 bytes from 172.20.168.129: icmp_seq=1 ttl=128 time=42.7 ms
64 bytes from 172.20.168.129: icmp_seq=2 ttl=128 time=39.0 ms
64 bytes from 172.20.168.129: icmp_seq=3 ttl=128 time=44.5 ms
```

```
[charles@charles-laptop nebula]$ besttrace 172.20.168.129
traceroute to 172.20.168.129 (172.20.168.129), 30 hops max, 60 byte packets
 1  1.ap.nia (172.20.168.129)  39.36 ms  *  局域网
    1.ap.nia (172.20.168.129)  42.35 ms  *  局域网
    1.ap.nia (172.20.168.129)  41.59 ms  *  局域网
```

同时也可以发现，在 ping 某些主机时，先收到的几个响应的延迟会非常大，因为此时 P2P 隧道尚未建立，是由「灯塔节点」在负责转发。

---

自此，NIACNET 国内网络的基本框架便已搭建好了，只需要再增加 DNS、CA 服务器等即可成为一个基本能用的内部局域网络。

下一章节将介绍如何部署 OpenXPKI，一个开源的 PKI 软件。
