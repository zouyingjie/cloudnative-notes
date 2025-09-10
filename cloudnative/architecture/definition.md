# 云原生的定义

### 云计算的变迁

### 云原生的早期定义

云原生（Cloud Native）的概念最早由 Pivotal 公司的技术产品经理 Matt Stine 提出，他在 [Migrating to Cloud-Native Application Architectures](https://www.f5.com/content/dam/f5/corp/global/pdf/ebooks/Migrating_to_Cloud-Native_Application_Architecutres_NGINX.pdf) 一书中，将云原生的特性概括为以下几点：

- Twelve-Factor Applications 符合[软件 12 要素的应用](https://12factor.net/zh_cn/)
- Microservices 采用微服务架构
- Self-Service Agile Architecture 自服务敏捷架构
- API-Based Collaboration 基于 API 的协作
- Antifragility 抗脆弱性

2017 年，Matt Stine 在接受 InfoQ 的[采访(Defining Cloud Native: A Panel Discussion)](https://www.infoq.com/articles/cloud-native-panel/) 时，对云原生的定义做了一定的修改，将云原生的特性总结为以下几点：

- Modularity (via Microservices) 基于微服务的模块化
- Observability 可观测性
- Deployability 可部署性
- Testability 可测试性
- Disposability 可处理性
- Replaceability 可替换性

之后 Pivotal（后被 VMWare 收购）将云原生[概括](https://www.vmware.com/topics/cloud-native)为如下几个要点：

- **Containers/Kubernetes Ecosystem**: 作为云原生的基石，为服务更高效的提供稳定可靠的运行环境。
- **DevOps**: 通过 DevOps 实践来促进开发和运维团队的协作，更好的交付高质量软件。
- **CI/CD**: 实现持续集成和持续交付的自动化流程。做到不停机快速迭代和高频发布。
- **Microservices**: 通过高内聚低耦合的微服务架构，加快软件的开发、发布、扩缩容速度。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/20250804-cloudnative-def.png)

### CNCF 云原生定义
2015 年，Google 联合 Pivotal、Red Hat、IBM 等公司共同成立了云原生计算基金会（CNCF），旨在推动云原生技术的发展和普及，并对云原生做了更加标准化的定义，最新的 [v1.1](https://github.com/cncf/toc/blob/main/DEFINITION.md) 版本对云原生定义如下：

**英文版本**

> Cloud native practices empower organizations to develop, build, and deploy workloads in computing environments (public, private, hybrid cloud) to meet their organizational needs at scale in a programmatic and repeatable manner. It is **characterized by loosely coupled systems that interoperate in a manner that is secure, resilient, manageable, sustainable, and observable.**
> 
> Cloud native technologies and architectures typically consist of some combination of containers, service meshes, multi-tenancy, microservices, immutable infrastructure, serverless, and declarative APIs — this list is non-exhaustive.

**中文版本**

> 云原生技术有利于各组织在公有云、私有云和混合云等新型动态环境中，构建和运行可弹性扩展的应用。云原生的代表技术包括容器、服务网格、微服务、不可变基础设施和声明式API。
>
>这些技术能够构建容错性好、易于管理和便于观察的松耦合系统。结合可靠的自动化手段，云原生技术使工程师能够轻松地对系统作出频繁和可预测的重大变更。
>
> — [CNCF Cloud Native Definition](https://github.com/cncf/toc/blob/main/DEFINITION.md)

上述定义强调了云原生的 5 个核心技术：

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/20250804-cloudnative-01.jpg)

- **容器**：基于容器技术和 Kubernetes 编排，为应用提供稳定的基础资源。
- **服务网格**：作为基础设施接管服务间的通信，并提供强大的服务治理、流量治理、可观测性等能力。
- **微服务**：将系统拆分为高内聚、低耦合、自包含的独立开发部署模块，提升系统的可维护性和可扩展性。
- **不可变基础设施**：应用只会重建，不会更新，每次部署都是全新的实例，确保系统的一致性和可靠性。
- **声明式 API**：使用描述性的语言来定义**想要什么**，而不是**怎么做**，比如下面是一个 Kubernetes  YAML 文件的实例，它表示我希望部署一个名为 `my-app` 的应用，包含 3 个副本，每个副本运行在一个容器中，容器使用 `my-app-image:latest` 镜像，并暴露 80 端口，同时设置了一些环境变量和资源限制。至于如何实现是底层的 Kubernetes 系统来处理的，开发者不关心如何实现。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app-container
        image: my-app-image:latest
        ports:
        - containerPort: 80
        env:
        - name: ENV_VAR
          value: "value"
        resources:
          requests:
            memory: "256Mi"
            cpu: "500m"
          limits:
            memory: "512Mi"
            cpu: "1"
```

### 何以为云原生

可以看到云原生的定义也是一个不断演进的概念，其核心在于：充分利用云计算的弹性和灵活性，通过容器化、微服务架构、自动化运维等技术手段，实现应用的快速开发、部署和迭代，提供高可用、高性能、可扩展、可观测的系统。


