# 整体架构

## 为什么需要 Kubernetes

Docker 的出现极大的简化了应用的打包、分发、部署、运维等操作，但是随着应用规模的不断扩大，尤其是微服务架构流行，会导致容器的数量越来越多，容器本身的运维，容器之间的服务发现、负载均衡、伸缩、升级、容灾、通信等操作都随之变得越来越复杂，此时需要一个容器编排系统来管理这些容器。

Google 2016 年发布的论文 [Borg, Omega, and Kubernetes](https://queue.acm.org/detail.cfm?id=2898444) 介绍了其容器编排系统的演变，从最早的 Borg 到更加符合软件工程规范的 Omega，最终演化为现在开源的 Kubernetes，已经成了容器编排的事实标准。

## Kubernetes 集群架构

Kubernetes 本身是由一系列组件组成的容器编排系统，每个组件各司其职，从而实现容器的创建、调度、伸缩、配置等管理功能。整体架构如图：

![Kubernetes 架构图](https://kubernetes.io/images/docs/kubernetes-cluster-architecture.svg)
图片来自 [Kubernetes 官方文档](https://kubernetes.io/zh-cn/docs/concepts/overview/components/)

### Kubernetes 节点

首先 Kubernetes 是由若干台服务器组成集群，每台服务器就是一个节点，节点有两类角色：

- **控制节点（ControlPlane Node）**：也叫 master 节点，主要负责运行 Kubernetes 的控制逻辑组件，实现 Kubernetes 的最核心的管理功能。master 节点可以有多个，组成高可用的控制平面，并且默认不允许运行普通的应用。
  
- **工作节点 (Worker Node)**：用来部署运行容器化应用的节点。

### Kubernetes 控制组件

Kubernetes 最核心的是 4 个运行在 ControlPlane 节点的控制组件。分别是：

- **[Etcd](https://etcd.io/)**：采用 RAFT 协议的强一致性、高可用的分布式的 key-value 存储系统，用于保存 Kubernetes 集群的所有数据，包括配置、状态等信息。

- **kube-apiserver**：这是外部和其他组件访问 Kubernetes 的 API 网关，采用 RESTful 协议，支持无状态水平伸缩。它是唯一可以与 etcd 通信的组件，其提供了一系列的 CRUD 接口供外部访问以操作数据，并且会校验请求中 object 数据的合法性以及进行身份认证、鉴权、准入控制等操作。

- **kube-controller-manager**：顾名思义，就是管理各类控制器的，kubernetes 使用各种控制器 Controller 来管理不同类型的资源对象。每当资源对象发生变动，都会有对应的 Controller 执行拟合操作，使得资源对象的实际状态和预期状态保持一致。

  kube-controller-manager 就是负责创建并启动这些 Controller 的进程，常见的 Controller 有 Deployment Controller、ReplicaSet Controller、StatefulSet Controller、DaemonSet Controller、Job Controller 等，完整 Controller 列表参考 [controller_names](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-controller-manager/names/controller_names.go)。

- **kube-scheduler**：负责监听集群中还未分配到所属节点的 Pod，其根据一系列调度规则，将 Pod 调度到合适的节点运行。

### 通用组件

除了上述 4 个控制组件外，K8s 为了在节点运行容器以及执行通信等操作，每个节点还需要运行几个通用组件，分别是：

- **kubelet**：这是一个运行在每个节点上的代理，向上与 kube-apiserver 交互同步 Pod 相关的信息。向下与容器运行时通信，根据实际的 Pod 信息来创建或销毁容器，并收集容器的状态、指标。

- **kube-proxy**：这是一个运行在每个节点上的网络代理，管理在节点上的网络规则，用来允许集群中的 Pod 进行集群内外的网络通讯。一般情况 kube-proxy 会直接使用操作系统提供的网络包过滤层的能力（比如iptable，ipvs）来进行网络流量的分发。

### 容器运行时 containerd

Kubernetes 是一个容器编排系统，其本身并不负责容器具体的创建、销毁等操作,所有容器操作都是通过每个节点的 kubelet 调用容器运行时来实现。

最开始 Kubernetes 使用 Docker 来操作具体的容器，后来引入了 [CRI（Container Runtime Interface）](https://kubernetes.io/docs/concepts/architecture/cri/)接口。只要实现了 CRI 接口，就可以与 kubelet 交互从而被 Kubernetes 编排，这也符合 IOC 和面向接口编程的原则。

容器运行时又可以分为低级容器运行时和高级容器运行时。

**低级容器运行时**

处于最底层与操作系统直接交互的部分，它们一般遵循 OCI（Open Container Initiative，开放容器倡议）规范，直接负责容器的创建、销毁等操作。常见的低级容器运行时有：

- `runc`：使用最广泛的低级容器运行时，Docker、containerd、Podman 等默认运行时。
- `nvidia-container-runtime`：NVIDIA 在 runc 的基础上进行扩展，提供了对 GPU 的支持。如果我们使用 Kubernetes 管理 GPU，通常会使用该运行时。
- `crun`：使用 C 语言编写的低级容器运行时，具有更快的启动时间和更低的内存占用，并且对 cgroup v2 有更好的支持。
- `kata-containers`：Kata Containers 是一个轻量级的虚拟化容器运行时，旨在提供更强的安全性和隔离性。
- `gvisor`： Google 开源的容器运行时，在用户态空间进行相关操作。

后两者又被称为沙盒型运行时，实现了容器级别的隔离，提供了更强的安全性。如果对安全性要求非常高的场景，可以使用此类低级运行时。

**高级容器运行时**

处于低级容器运行时之上，提供了更加丰富的功能和工具，比如镜像管理、存储、网络管理等。常见的有：

- `containerd`：最流行的高级容器运行时，最初是 Docker 的一部分，后来独立出来成为一个独立的项目。它实现了 CRI 接口，并且默认使用 runc 作为其低级运行时。
- `CRI-O`：专门为 Kubernetes 设计的轻量级容器运行时，实现了 CRI 接口，并且默认使用 runc 作为其低级运行时。
- `Docker`：虽然 Docker 本身不是一个符合 CRI 的容器运行时，但是 Kubernetes 通过 `dockershim` 来支持 Docker。需要注意的是，从 Kubernetes 1.20 开始，`dockershim` 被弃用，建议使用 containerd 或 CRI-O 等符合 CRI 的容器运行时。
- `Podman`：Podman 是一个无守护进程的容器引擎，支持运行和管理 OCI 容器。虽然 Podman 本身不直接实现 CRI 接口，但可以通过 `cri-o` 或其他适配器与 Kubernetes 集成。


### 其他组件

- **DNS服务**： 集群内部的 DNS 服务组件，用来对 Service、Pod 做 DNS 解析实现集群内部的服务发现，目前默认是[CoreDNS](https://coredns.io/)。

- **Ingress网关**：在我们的传统 IT 环境中，经常会用 Nginx 做请求代理和路由、负载均衡，将我们的服务暴露给外界访问。在 Kubernetes 中也一样，我们需要一个类似的代理将部署在 Kubernetes 中的服务对外暴露，这是由 Ingress Controller 来做。

  该组件基于 Ingress 对象对外部请求做路由，将服务暴露给外界访问，最常用的一般是 [NGINX Ingress Controller](https://docs.nginx.com/nginx-ingress-controller/)。

## Kubernetes 资源对象

上面介绍了 Kubernetes 运行所需的组件，如果我们想要在 Kubernetes 中部署一个应用，就需要用到Kubernetes 的资源对象。

**Kubernetes 将一切视为资源。** 在Kubernetes 中，资源对象是持久化的实体，表现形式就是 YAML 文件。我们使用 Kubernetes 部署服务时基本就是编写各种资源对象的 yaml 文件，然后通过 kubectl 命令来操作这些资源对象。

下面是一个 yaml 文件示例，：

```yaml
apiVersion: apps/v1 
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```


一个完整的资源对象的 yaml 文件由四部分组成：
- **apiVersion & kind**：创建该对象所使用的 Kubernetes API 的版本和对象的类别。
  
- **metadata**：元信息，帮助唯一性标识对象的一些数据，包括 name 字符串、UID 和可选的 namespace 等。
  
- **spec**：对象规格，不同的对象有不同的 spec，用于定义其相关属性，创建对象时设置其内容，描述我们希望资源对象的``期望状态``，比如运行的副本数、镜像版本、端口信息等。
- **status**:  对象的`当前状态`，由 Kubernetes 系统组件设置并更新，在创建对象时我们只需要定义上述三部分内容即可。Kubernetes 的控制组件 管理组件的状态，以使之与我们定义的期望状态相匹配。

使用 `kubectl get [objectType] [objectName] -o yaml` 可以在命令行上查看资源对象完整的 yaml。比如：

```yaml
$ kubectl get pod nginx -o yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    cni.projectcalico.org/containerID: f92fedeb090846bb8c81e43b28141e6b547c66f9b21892d406d0761ccd4e8557
    cni.projectcalico.org/podIP: 10.233.105.202/32
    cni.projectcalico.org/podIPs: 10.233.105.202/32
  creationTimestamp: "2025-08-24T07:19:41Z"
  generateName: nginx-deployment-96b9d695-
  labels:
    app: nginx
    pod-template-hash: 96b9d695
  name: nginx-deployment-96b9d695-47trr
  namespace: default
  ownerReferences:
  - apiVersion: apps/v1
    blockOwnerDeletion: true
    controller: true
    kind: ReplicaSet
    name: nginx-deployment-96b9d695
    uid: 6e3229bc-9e7e-4eb9-b076-c63da03a21c5
  resourceVersion: "681679"
  uid: e40104ca-0f72-4dfa-9a17-45971d047d16
spec:
  containers:
  - image: nginx:latest
    imagePullPolicy: Always
    name: nginx
    ports:
    - containerPort: 80
      protocol: TCP
    resources: {}
    terminationMessagePath: /dev/termination-log
    terminationMessagePolicy: File
    volumeMounts:
    - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
      name: kube-api-access-hqrfr
      readOnly: true
  dnsPolicy: ClusterFirst
  enableServiceLinks: true
  nodeName: tk13
  preemptionPolicy: PreemptLowerPriority
  priority: 0
  restartPolicy: Always
  schedulerName: default-scheduler
  securityContext: {}
  serviceAccount: default
  serviceAccountName: default
  terminationGracePeriodSeconds: 30
  tolerations:
  - effect: NoExecute
    key: node.kubernetes.io/not-ready
    operator: Exists
    tolerationSeconds: 300
  - effect: NoExecute
    key: node.kubernetes.io/unreachable
    operator: Exists
    tolerationSeconds: 300
  volumes:
  - name: kube-api-access-hqrfr
    projected:
      defaultMode: 420
      sources:
      - serviceAccountToken:
          expirationSeconds: 3607
          path: token
      - configMap:
          items:
          - key: ca.crt
            path: ca.crt
          name: kube-root-ca.crt
      - downwardAPI:
          items:
          - fieldRef:
              apiVersion: v1
              fieldPath: metadata.namespace
            path: namespace
status:
  conditions:
  - lastProbeTime: null
    lastTransitionTime: "2025-08-24T07:19:53Z"
    status: "True"
    type: PodReadyToStartContainers
  - lastProbeTime: null
    lastTransitionTime: "2025-08-24T07:19:42Z"
    status: "True"
    type: Initialized
  - lastProbeTime: null
    lastTransitionTime: "2025-08-24T07:19:53Z"
    status: "True"
    type: Ready
  - lastProbeTime: null
    lastTransitionTime: "2025-08-24T07:19:53Z"
    status: "True"
    type: ContainersReady
  - lastProbeTime: null
    lastTransitionTime: "2025-08-24T07:19:41Z"
    status: "True"
    type: PodScheduled
  containerStatuses:
  - containerID: containerd://92c96cebbfd61d8b164c5ffff068d2ce9749b1ade488006a2fdfc4f966b8cfca
    image: docker.io/library/nginx:latest
    imageID: docker.io/library/nginx@sha256:33e0bbc7ca9ecf108140af6288c7c9d1ecc77548cbfd3952fd8466a75edefe57
    lastState: {}
    name: nginx
    ready: true
    restartCount: 0
    started: true
    state:
      running:
        startedAt: "2025-08-24T07:19:53Z"
    volumeMounts:
    - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
      name: kube-api-access-hqrfr
      readOnly: true
      recursiveReadOnly: Disabled
  hostIP: 172.19.0.13
  hostIPs:
  - ip: 172.19.0.13
  phase: Running
  podIP: 10.233.105.202
  podIPs:
  - ip: 10.233.105.202
  qosClass: BestEffort
  startTime: "2025-08-24T07:19:42Z"

```
 

基于上述整体架构的介绍，可以看到对 Kubernetes 本身的学习大致可以归为两方面：
- **Kubernetes 自身的学习**：整体的运行，各个组件的实现原理等。比如 etcd 的工作原理，容器运行时的实现原理、网络插件的实现原理等。
  
- **Kubernetes 的使用**：如果基于 Kubernetes 运行我们的应用，主要是学习各种资源对象的使用，如何编写 yaml 文件，如何使用 kubectl 命令等。

