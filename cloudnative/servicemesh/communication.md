# 服务通信的演进

ServiceMesh 服务网格的概念最早由 Buoyant 公司的 CEO William Morgan 在其博文《What’s a service mesh? And why do I need one?》中提出：


> A service mesh is a dedicated infrastructure layer for handling service-to-service communication. It’s responsible for the reliable delivery of requests through the complex topology of services that comprise a modern, cloud native application. In practice, the service mesh is typically implemented as an array of lightweight network proxies that are deployed alongside application code, without the application needing to be aware.
>
> 服务网格是一种用于管控服务间通信的的基础设施，职责是为现代云原生应用支持网络请求在复杂的拓扑环境中可靠地传递。在实践中，服务网格通常会以轻量化网络代理的形式来体现，这些代理与应用程序代码会部署在一起，对应用程序来说，它完全不会感知到代理的存在。

可以看到其核心思想是作为**网络代理**，透明接管服务间的通信。任何技术都有其发展历程，不是凭空而来的，因此本篇我们先来回顾一下网络通信的发展历史。

## 远古时代

在远古时代，计算机之间的通信依赖于物理连接，数据通过电缆、光纤等介质进行传输，这里必须要有相应的组件来与底层硬件交互，进行电信号和程序数据的转换，为此工程师们抽象出了一套网络栈来封装相关的细节。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/network-communction-history-01.png)

网络环境是不可靠的，除了基本的正常通信外，我们还会遇到丢包、乱序、拥塞等问题，早期的工程师在编写业务程序时，必须将这些业务无关的控制逻辑耦合到应用程序中，极大的增加了工程师的负担。

为了解决这些通用的通信控制问题，工程师们开始将这些控制逻辑剥离出来下沉到操作系统层面，最终形成了 TCP/IP 协议栈。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/network-communction-history-11.png)


## 微服务时代

随着移动互联网时代的到来和分布式微服务架构的普及，我们的服务系统变得前所未有的复杂，服务之间的通信变得更加频繁和重要。但在分布式系统下，网络存在著名的 [8 个谬误(The 8 Fallacies of Distributed Computing)](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing) 问题：

- 网络是可靠的。The network is reliable.

- 延迟为零。Latency is zero.

- 带宽无限。 Bandwidth is infinite.

- 网络是安全的。The network is secure.

- 网络结构不会变化。Topology doesn't change.

- 有管理员。There is one administrator.

- 传输成本为零。 Transport cost is zero.

- 网络组成是同质的。The network is homogeneous.

上述假设在分布式系统中往往都不成立，同时随着服务架构的复杂，我们的服务间通信面临着更多的挑战。比如服务频繁上下线带来的服务发现问题、流量过大时的限流、熔断等问题，于是历史开启下一个轮回，开发人员们不得不在服务中再次开发相关的控制逻辑。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/network-communction-history-04.png)


上述这种由开发人员实现复杂且业务无关的**控制逻辑**的场景自然催生了对更高层次抽象的需求，于是微服务架构进入第二阶段，工程师们将这些逻辑剥离为公共组件库，Spring Cloud 就是这一需求的产物。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/network-communction-history-06.png)

这也构成了微服务架构的早期形态（应该还是现在的主流形态），以组件库的形式将**控制逻辑**从应用程序中剥离出来。像 Spring Cloud 对包括服务通信在内的几乎所有微服务所需的通用功能都进行了封装和抽象，下面是一部分组件列表。

| 功能 | 组件 | 主要用途
| --- | --- | ---
| 配置中心 | Spring Cloud Config | 集中管理配置，可动态刷新，支持 Git、Bus 等
| 服务发现 | Netflix Eureka | 服务自动注册与动态发现，替代硬编码地址
| 服务网关 | Netflix Zuul | 统一入口，路由转发，鉴权，限流，熔断等
| 服务治理 | Netflix Hystrix | 降级、熔断、超时控制、重试等，提高系统稳定性
| 负载均衡 | Netflix Ribbon | 多实例服务调用时自动选择一个合适实例（如轮询、权重等）
| 链路追踪 | Spring Cloud Sleuth | 记录请求的全链路信息，方便定位问题与性能分析
| 消息总线 | Spring Cloud Bus | 配合 Config 实现配置自动刷新，也可用于服务间事件广播
| 服务通信 | OpenFeign | 使用注解方式声明 REST 接口，封装调用逻辑，内置负载均衡
| 服务安全| Spring Cloud Security / OAuth2 | 微服务之间身份校验与权限控制

## 服务网格时代

以公共类库封装通用控制逻辑的方式虽然可行，在由专门编写此类组件的工程师实现的类库基础之上，业务开发人员可以构建出稳健的微服务系统。但这种方式也存在两个明显的问题：

- **语言依赖性**：类库与特定的语言耦合，没办法做到通用。以 Spring Cloud 为例，其只能在 Java/Spring 生态下使用，如果使用 Go、Python 等语言，相同的功能必须用对应的语言再次开发一遍。

- **复杂且不透明**：通过上面的列表不难看出整个微服务架构的框架是多么的复杂，即使不自己开发，业务开发人员也必须熟悉这些组件的使用才能进行高效正确的开发和维护，且这些组件的变动会侵入到业务，用过 Spring Cloud 同学应该都在服务的配置文件中修改过这些组件相关的配置。**业务工程师再次掉进了关心控制逻辑的泥淖。** 于是熟悉的事情再次上演，工程师们再次寻找将这些控制逻辑剥离出来的方法。

### 代理模式

正如计算机科学的著名金句所说的：

> All problems in computer science can be solved by another level of indirection.
> 计算机科学中的所有问题都可以通过增加一个中间层来解决

早期工程师们尝试了 Proxy 代理模式，核心思想是服务之间不在直接通信，而是将流量通过一个中间代理进行转发，在此基础上人们探索出了 Sidecar 模式，通过运行一个进程来接管服务间的网络通信。像早期的 [Netflix Prana](google.com/search?oq=Netflix+了Prana&sourceid=chrome&ie=UTF-8&q=Netflix+了Prana) 就是此类产品。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/network-communction-history-12.png)

早期的代理模式存在着一定的缺陷，往往需要依赖额外的组件，比如 Prana 必须依赖 Eureka 服务发现组件。但这里将控**制逻辑抽象为语言无关、业务透明的独立组件**的方向是对的，在此基础之上发展出了两种形态：

- **网关**：将代理运行的距离服务更远，分开部署，在更前端的地方进行通信相关的处理。
- **边车**：将代理运行的距离服务更近，与服务本身打包在一起，作为服务的一部分接管服务的通信。

### 第一代服务网格：边车代理

Google 在其 [Design patterns for container-based distributed systems](https://www.usenix.org/system/files/conference/hotcloud16/hotcloud16_burns.pdf) 论文中对基于容器开发的分布式系统进行了总结，提出了边车（Sidecar）模式及其延伸而来的 Ambassador 和 Adapter 模式。 基于容器的边车模式很好的解决了上面提到的代理模式的缺陷，边车容器与服务容器打包在一起，共享网络空间，全面的接管服务的网络通信。这种模式有几个明显的优势：

- **语言无关**：边车容器与服务容器解耦，边车容器可以使用任何语言实现，且可以为不同语言的服务提供相同的功能。
- **强制接管**：通过相关的控制逻辑，可以控制应用容器只与边车容器通信，由边车容器与外部通信，从而强制接管服务间的网络通信。
- **业务透明**：服务不需要感知边车容器的存在，所有的通信都通过边车容器进行转发，服务只需要专注于业务逻辑的实现，也不在需要引入任何控制逻辑的类库。

在分布式微服务架构下，大量的服务实例和 Sidecar 容器的部署在一起，形成了一个**网格**（Mesh）状的网络拓扑结构，因此这种模式也被称为服务网格（Service Mesh）。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/network-communction-history-16.png)

2016 年William Morgan 和 Oliver Gould 离开 twitter 开始创业，创立了 Buoyant 公司，并在 2017 年开源了首个服务网格产品 [Linkerd](https://linkerd.io/)，Linkerd 也是第一个基于边车代理模式的服务网格产品。Linkerd 使用 Rust 语言编写，体积小、性能高，且易于部署和使用，迅速获得了社区的认可。同时期的还有 Lyft 公司开源的 [Envoy](https://www.envoyproxy.io/) 代理，Envoy 使用 C++ 编写，功能更加强大，性能也更高，成为 CNCF 继 Kubernetes、Prometheus 之后第三个毕业的项目。


### 第二代服务网格：控制+数据平面

最初的服务网格有大量与应用容器部署在一起的边车代理组成，随着规模的不断增加，对这些边车代理的管理成为新的难题，为了更好的管理这些边车代理，工程师们引入了**控制平面（Control Plane）** 的概念，将边车代理组成的数据平面（Data Plane）与管理它们的控制平面分离开来，至此服务间通信进化到了其最终阶段：基于**控制平面+数据平面**的第二代服务网格架构。

第二代服务网格以 Istio 为代表，整体架构分为两部分：

- **数据平面**：一系列与服务容器部署在一起的边车代理，负责实现服务间的通信需求，包括服务发现、负载均衡、熔断、限流、鉴权等功能。数据平面通常由轻量级的高性能代理组成，Istio 默认使用 Envoy 作为其边车代理。
- **控制平面**：负责管理数据平面的组件，与具体边车代理通信，下发各类路由、熔断、服务发现等策略控制信息。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/network-communction-history-14.png)

只看控制平面和数据平面的架构关系的话，其整体关系如下图所示，控制组件（上面深蓝色）与数据平面（下面浅蓝色）代理组成了一个网格状的网络拓扑结构，这也是服务网格名称的由来。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/network-communction-history-15.png)


至此我们介绍完了服务间通信的发展历程，可以看到服务网格并不是什么新鲜的事物，而是服务间通信演进的必然产物。其数据平面和控制平面也不是什么新鲜的概念，早在 SDN（软件定义网络）中就已经存在，服务网格只是将这些概念应用到了服务间通信中而已。

