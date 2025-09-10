# Pod 那些事

### 1. 为什么需要 Pod

Kubernetes 作为容器编排工具，其操作的单位并不是单个容器，而是抽象出了 Pod 的概念。它使用 Pod 作为最小的可部署和管理单元，一个 Pod 包含一个或多个容器，这些容器可以 `共享网络和存储`。

Kubernetes 之所以使用 Pod 而不是容器为管理单位，主要是为了解决两个问题：

- 协同执行
- 协同调度

容器本身是单进程模型，其应用的 PID 为 1，没有管理多个进程的能力。在实际应用中，往往存在着需要紧密协作的进程，比如业务服务和对应日志收集服务，它们必须要运行在同一机器上共享存储、网络等资源，而 Pod 其实就是一组共享了网络、存储、IPC、UTS 以及时间的的容器，它们只有 PID 和文件 namespace 是默认隔离的。

与此同时，在跨机器的集群中，这些关系紧密的进程必须被部署到同一台机器上。如果以容器为调度单位，对资源的要求就只能在容器上设置，此时当多个容器需要协同调度时，资源越紧张，容器被调度到不同机器的可能性越大。

如果以 Pod 为原子单位进行调度，对资源的设置可以定义在 Pod 上，此时只需要以 Pod 为单位统一调度即可，不需要在考虑单个容器的情况。

具体到机器层面，Pod 是一个逻辑上的概念，本质就是一组容器，Kubernetes 使用 [pause](https://hub.docker.com/r/kubernetes/pause)（一个只有几百 KB 的非常轻量级的镜像）先创建一个基础容器，将网络、存储等资源准备好，然后在创建应用容器，并关联网络和存储。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/pod.png =450x200)


Pod 可以由用户直接创建，也可以通过 Controller 对象创建。实际使用中，一般都是由用户使用 Deployment，Job，StatefulSet 等控制器对象，基于其 PodTemplate 创建。另外也可以由 kubelet 直接创建并管理，这类 Pod 称为 **StaticPod**，像 kube-apiserver、kube-scheduler、kube-controller manager 这些控制组件都是 StaticPod。

### 2. Pod 生命周期与状态

Pod 在创建完成后，会被调度部署并运行，在这期间会有不同的状态，通常可以通过 `kubectl get pods [podName] -o yaml` 来查看 Pod 的详细状态信息。

```yaml
$ kubectl get pods nginx-deployment-96b9d695-47trr  -o yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: nginx
    pod-template-hash: 96b9d695
  name: nginx-deployment-96b9d695-47trr
  namespace: default

spec:
  containers:
  - image: nginx:latest
    imagePullPolicy: Always
    name: nginx
    ...
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
    state:
      running:
        startedAt: "2025-08-24T07:19:53Z"

  hostIP: 172.19.0.13
  hostIPs:
  - ip: 172.19.0.13
  phase: Running
```

#### 2.1 Pod 阶段（Phase）

Pod的状态是一个 PodStatus 对象，在 Pod 定义中是 status 字段， 其中包含一个 `pod.status.phase` 字段表示当前的阶段，取值如下：

| 状态值  | 描述                                                                                                              |
| ------- | ----------------------------------------------------------------------------------------------------------------- |
| Pending | 表示 Pod 对象已被创建保存在 etcd 中，但有一个或多个容器还不能被顺利创建。当等待调度或者拉取镜像时一般处在该状态。 |
| Running | Pod 已经调度到某一节点并且所有容器都已经创建成功，并且至少有一个容器正在运行或者正在启动/重启。                   |
| Succeed | 所有容器都正常运行并退出，并且不会重启。一般在运行一次性任务时最为常见。                                          |
| Failed  | 所有容器已终止，并且至少有一个以不正常状态退出。此时我们一般需要通过查看 Pod 信息或日志来调试问题。               |
| Unknown | 异常状态，Pod 状态无法被 kube-apiserver 获取到。一般是 Pod 所在节点与 kube-apiserver 通信出现异常导致的。             |


#### 2.2 Pod 状况 （Conditions）

除了 `status.phase` 字段表示 Pod 的当前阶段外，Pod 还有一组 `PodConditions` 对象，对应字段是 `pod.status.conditions` 数组字段，该对象用来描述 Pod 处于某个 phase 的具体原因，主要有下面几个值：

- **PodScheduled**：Pod 已经被调度到指定节点。
- **PodReadyToStartContainers**：自 1.25 版本引入，在 1.29 版本进入 Beta 阶段。表示 Pod 已经创建且完成了网络配置，可以启动容器。
- **ContainersReady**：Pod内所有容器全部就绪。
- **Initialized**：所有的 InitContainer（初始化容器） 已经成功启动。
- **Ready**：Pod 达到 ready 状态，可以作为 endpoints 给 Service 代理对外提供服务列表。通常到这一步我们的服务就可以被用户访问了。

上述每个 Condition 对象都有下面几个字段：

| 字段               | 描述                                        |
| ------------------ | ------------------------------------------- |
| type               | 类型名称， 上述名称之一       |
| status             | True， False， Unkonwn 指示这个状况是否就绪 |
| lastProbeTime      | 最后一个探测状况的时间戳                    |
| lastTransitionTime | Pod上一次状况变换的时间戳                   |
| reason             | 状况最后一次变化的原因，Machine-readable    |
| message            | 状况最后一次变化的原因，Human-readable      |

下面是一个 Pod 状况的示例：

```yml
status:
  conditions:
  - lastProbeTime: null
    lastTransitionTime: "2025-08-21T12:38:09Z"
    status: "True"
    type: PodReadyToStartContainers
  - lastProbeTime: null
    lastTransitionTime: "2025-08-21T12:38:13Z"
    status: "True"
    type: Initialized
  - lastProbeTime: null
    lastTransitionTime: "2025-08-21T12:38:29Z"
    status: "True"
    type: Ready
  - lastProbeTime: null
    lastTransitionTime: "2025-08-21T12:38:29Z"
    status: "True"
    type: ContainersReady
  - lastProbeTime: null
    lastTransitionTime: "2025-08-21T12:37:58Z"
    status: "True"
    type: PodScheduled

```


#### 2.3 容器状态

除了 Pod 本身，Pod 中的每个容器也会有不同的状态，由 `status.containerStatuses` 字段表示，主要有下面三个值：


| 状态       | 描述                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Waiting    | 等待状态。表示容器仍在执行启动所需的操作，比如拉取镜像、注入数据等。                                                                           |
| Running    | 运行状态。表示容器正常运行，如果容器配置了 postStart 命令，该命令已经执行并结束了                                                              |
| Terminated | 终止状态。容器完成任务或者执行失败，如果容器配置了 preStop 命令，必须在该命令执行完成后进行该状态，换句话说，preStop 会阻塞 container 的终止。 |

下面是一个示例：

```yaml
status:
  containerStatuses:
  - containerID: containerd://31a7910f38f6766e88e4ddd03bfccb79208653cabea19b11b1e065400e7e1657
    image: quay.io/prometheus-operator/prometheus-config-reloader:v0.84.1
    imageID: quay.io/prometheus-operator/prometheus-config-reloader@sha256:f9e2a3b8550b0b643c285fc45132fde845910012db6d850d3e04dd462db037b4
    lastState: {}
    name: config-reloader
    ready: true
    restartCount: 0
    started: true
    state:
      running:
        startedAt: "2025-08-21T12:38:27Z"
    volumeMounts:
    - mountPath: /etc/prometheus/config
```

#### 2.4  重启策略（restartPolicy）

我们可以为 Pod 中的容器设置重启策略，有三个取值， 

- **Always（默认值）**：只要不在运行状态就自动重启。
- **OnFailure**：当容器异常退出时自动重启。
- **Never**：从不重启。

当容器需要重启时，kubelet 会采取指数退避原则，逐渐增加重启的间隔时长，但最长不超过 5 分钟。

#### 2.5 生命周期回调

Kubernetes 容器可以配置 postStart 和 preStop 命令。这是容器在发生状态变化时可以触发的一系列 hook 操作：

- **postStart**：在容器创建后立即执行，即 ENTRYPOINT 执行之后执行，但并不保证顺序，postStart 执行时 ENTRYPOINT 命令可能尚未结束。postStart 会阻塞容器状态变化，在 postStart 执行完成前，容器的状态不会设置为 Running。

- **preStop**：在容器被杀死进入 Terminated 状态前执行，会阻塞容器杀死进程。Kubernetes 仅在 Pod 终止时执行 preStop，在完成时不会调用。
Hook 的实现方式有两种：

- **exec**：执行一段命令。
- **http**：执行一个请求。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: lifecycle-demo
spec:
  containers:
  - name: lifecycle-demo-container
    image: nginx
    lifecycle:
      postStart:
        exec:
          command: ["/bin/sh", "-c", "echo Hello from the postStart handler > /usr/share/message"]
      preStop:
        exec:
          command: ["/usr/sbin/nginx","-s","quit"]
```

### 3. Pod 探针

探针是由 kubelet 发起的一种容器诊断行为，可以用来检测 Pod 中的容器的健康情况。Kubernetes 中主要有三种探针：

- **livenessProbe**：存活探针，检查容器的健康状态，以决定是否重启容器。
  
- **readinessProbe**：就绪探针，用来检测容器是否准备好接收外部流量。该探针执行成功后 Pod 的细分状态就会变为 Ready，此时 Pod 可以作为 endpoints 给 Service 进行代理，供外部访问。
  
- **startupProbe**：启动探针，来判断容器是否启动，该类型探针会屏蔽上述两种探针，从而避免因为容器启动过长导致的死循环问题。如果失败则会重启容器。


每种探针有四种实现形式，分别是：

- **exec**：容器内运行指定命令，如果返回为 0 说明探测成功。
- **tcpSocket**：用 TCP 协议对容器的 IP:Port 执行检查，如果能够成功建立连接则说明探测成功。
- **httpGet**：对容器的 IP:Port 的某个路径执行 HTTP Get 请求，如果响应码大于 200 且小于 400，说明探测成功。
- **grpc**：在 1.23 版本引入并在 1.27 版本达到稳定态，通过 gPRC 执行远程调用，容器需要实现相应的健康检查协议，如果响应为 `SERVING` 说明探测成功。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: goproxy
  labels:
    app: goproxy
spec:
  containers:
  - name: goproxy
    image: k8s.gcr.io/goproxy:0.1
    ports:
    - containerPort: 8080
    readinessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 10
    livenessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 20
```

**什么时候启用livenessProbe**

存活探针主要的目的是探活，确定容器还在正常提供服务。如果容器进程在出现问题时可以自行崩溃，此时是不需要存活探针的，kubelet 会探测到容器的状态并基于 restartPolicy 执行相应的操作。

但有时候容器进程虽然没有挂掉，但其实已经无法提供服务了，比如遇到死锁。从进程检查的角度它是没问题的，并不会执行重启操作，此时我们需要通过存活探针去真正的访问服务，确保其真正可用。

**什么时候启用 readinessProbe**

就绪探针决定的是容器是否已经启动就绪并可以接收外部的流量，因此如果某个需要接收外部流量的的容器进程启动较慢，可以设置 readinessProbe 来确认容器是否已经就绪。

比如对于 Java/Spring 应用，其启动往往较慢，为了实现滚动更新，可以设置通过设置 HTTP GET 形式的就绪探针探活 ``/actuator/health`` 接口来确认容器是否已经就绪，只有检测到就绪后 Kubernetes 才会杀死旧的 Pod，这样可以防止旧的 Pod 被杀掉，新服务还没启动起来导致的服务不可用。

**什么时候启用 startupProbe**

针对容器进程启动较慢的情况，可以设置启动指针。避免因为长时间未启动引发 livenessProbe 探测失败导致重启，陷入不断重启的“死循环”中。

### 4. Init container

Init Container 是一种特殊容器，在 Pod 内的应用容器启动之前运行，一般用来执行初始化操作，比如安装应用镜像中不存在的实用工具和脚本。每个 Pod 可以有一个或多个先于应用容器启动的 Init Container。

Init Container 容器有两个特点：

- 按顺序执行
- 它们总是运行到完成，每个 InitContainer 必须在下一个容器启动前成功完成。

```yaml
apiVersion: v1
kind: Pod
metadata:
 name: www
 labels:
   app: www
spec:
 initContainers:
 - name: download
   image: execlb/git
   command:
   - git
   - clone
   - https://github.com/mdn/beginner-html-site-scripted
   - /var/lib/data
   volumeMounts:
   - mountPath: /var/lib/data
     name: source
 containers:
 - name: run
   image: docker.io/centos/httpd
   ports:
   - containerPort: 80
   # Shared volume with main container
   volumeMounts:
   - mountPath: /var/www/html
     name: source
 volumes:
 - emptyDir: {}
   name: source
```

**注意事项**

1. InitContainer 不支持 lifecycle、livenessProbe、readinessProbe 和 startupProbe， 因为它们必须在 Pod 就绪之前运行完成。
2. 只有所有 InitContainer 都执行成功， Pod才能切换到Ready condition；只要任意一个失败就会触发 Pod 的 restartPolicy。
3. Pod 重新启动时，所有的 InitContainer 会重新执行一遍，因此 InitContainer 的执行结果应该是幂等的。
4. InitContainer 执行时， Pod 的 condition 会标识 Initialized  为 false, 但是 Phase 是Pending。
6. 在 Container上设置 livenessProbe 和在Pod上 activeDeadlineSeconds可以避免 init container 死循环失败，activeDeadlineSeconds 将会作用于所有的Init 容器。

**资源计算**

InitContainer 中可以设置对CPU/内存资源的 request/limit ，因此会影响到 Pod 的调度处理。Pod 对资源的有效 request/limit 取决于下面两者中的最大值：

- 所有应用容器的 request/limit 之和
- InitContainer 中 request/limit  的最大值

尽量使 InitContainer 的 request/limit 小于应用容器的 request/limit。因为 Pod 调度是基于有效 request/limit 资源的，如果在 InitContainer 中申请过多资源，但应用容器实际用不了这么多，就会造成资源浪费。

### 5. Sidecar Container

Sidecar Container 是一种辅助容器，通常用于扩展主容器的能力，比如日志收集、监控、数据处理等，是 Kubernetes 中常见的一种设计模式。K8s 在 1.28 版本引入了原生的 SideCar 容器支持，通过在 InitContainer 中设置 ``restartPolicy: Always`` 将特定 InitContainer 转为 Sidecar container。

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: alpine:latest
          command: ['sh', '-c', 'while true; do echo "logging" >> /opt/logs.txt; sleep 1; done']
          volumeMounts:
            - name: data
              mountPath: /opt
      initContainers:
        - name: logshipper
          image: alpine:latest
          restartPolicy: Always
          command: ['sh', '-c', 'tail -F /opt/logs.txt']
          volumeMounts:
            - name: data
              mountPath: /opt
      volumes:
        - name: data
          emptyDir: {}
```


### 6. Disruption

PDB (Pod disruption budgets) 用来设置 Pod 的最小可用副本数和最大不可用副本数。比如一个Deployment 有 ``.spec.replicas:5`` 表示在任何时间他将有5个副本。如果设置最小可用数为 2，最大不可用数为 1，那么在进行滚动更新时，Kubernetes 至少会保留 2 个可用副本，同时最多只会有 1 个副本不可用。

PDB 主要是为了在计划宕机时保护某些关键服务，防止误操作导致不可用，但无法保证计划外的宕机。


```yaml
apiVersion: policy/v1beta1
kind: PodDisruptionBudget
metadata:
  name: zk-pdb
spec:
  selector:
    matchLabels:
      app: zk
  minAvailable: 4
  maxUnavailable: 1
```

### 7. Pod 容器命令与参数

Pod 的定义中可以为 Container 指定启动命令和参数，格式如下：


```yaml
apiVersion: v1
kind: Pod
metadata:
  name: command-demo
  labels:
    purpose: demonstrate-command
spec:
  containers:
  - name: command-demo-container
    image: debian
    command: ["printenv"]
    args: ["HOSTNAME", "KUBERNETES_PORT"]
    # command: ["/bin/sh"]
    # args: ["-c", "while true; do echo hello; sleep 10;done"]
  restartPolicy: OnFailure
```
Pod 中定义的 command 和 args 会覆盖掉 Dockerfile 中定义的启动命令，其覆盖关系如下：

**K8S command/args VS. Docker Entrypoint/Cmd**
![在这里插入图片描述](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/k8s-cmd-args.png)


### 8. Pod 的启动与终止


当创建一个 Pod 创建时，K8s 各个组件启动 Pod 的工作作过程如下：

1. 创建 Pod：
   1. 如果是外部发起请求创建 Pod，api-server 会执行检查，检查无误后 Pod 会被存储到 etcd。
   2. 如果是 Deployment 等控制器组件，则 controller 会执行状态拟合，创建期望数量的 Pod 存入 etcd。
   
2. Scheduler 调度器发现新的未调度 Pod 后，基于资源需求、节点亲和、污点容忍等规则，计算出其调度节点，然后修改 Pod 的 `.spec.nodeName` 字段为对应的节点名，然后存回 etcd。
   
3. 对应节点上的 kubelet 检测到有新的 Pod 调度到该节点，执行如下操作：
   1. 向容器运行时比如 contained 发送请求，创建 infra 容器。
   2. 容器运行时调用 CNI 网络插件初始化 Pod 的网络命名空间。
   3. 如果存在 initContainer，kubelet 会请求运行时按顺序创建 init container。
   4. kubelet 并发请求 CRI 创建 ``spec.containers`` 下定义的容器。
   
4. kubelet 监控容器，收集容器数据并上报给 api-server。
   

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/pod_startup.jpg =800x900)



当 Pod 被删除时，K8s 各个组件删除 Pod 的工作流程如下：

1. 用户/controller 提交删除请求，默认会有 30s 的宽限期。
2. api-server 根据宽限期计算终止时间，将 Pod 标记为 terminating。
3. kubelet 监控到 Pod 被标记为 terminating 后，开始终止 Pod 中的容器。
   1. api-server 从 Service 的 endpoint 中移除 Pod 的 endpoint，从而不在接收请求。
   2. 如果有 preStop hook，此时会开始执行
   3. kubelet 向容器发送 TERM 信号
4. 如果超过宽限期后，Pod 中的容器还没有终止，kubelet 会向容器发送 KILL 信号强制终止。
5. 容器运行时通知 kubelet 容器已经终止。
6. kubelet 清理临时目录、网络配置等。
7. 删除完成

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/pod-termination.png =800x900)


### 9. Pod 容器设计模式

很多时候若干个进程是需要紧密运行在同一台主机上的，比如 Linux 进程组下的进程。在容器编排调度中，对于某些超亲密的容器进程，它们也是必须被紧密的调度运行在同一主机环境中。类似于 Kubernetes 的 Pod、Nomad 中的 task-group 都是对这种超亲密关系的抽象。

Google 的两位技术人员对基于容器的设计模式总结了论文和PPT：

- 论文：[Design patterns for container-based distributed systems](https://www.usenix.org/system/files/conference/hotcloud16/hotcloud16_burns.pdf)
- 课件：[https://www.usenix.org/sites/default/files/conference/protected-files/hotcloud16_slides_burns.pdf](https://www.usenix.org/sites/default/files/conference/protected-files/hotcloud16_slides_burns.pdf)


#### SideCar

边车容器用来扩展和增强主容器的功能。在基于容器的分布式系统中，容器作为打包、重用的基本单位，其设计一般是符合单一职责原则的。此时如果我们需要一些额外的功能，可以通过 SideCar 容器实现。比如下载主容器所需的文件，收集主容器进程运行产生的日志等。

![在这里插入图片描述](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/sidecar-pod-02.png)

图片来自：[Kubernetes Patterns](https://learning.oreilly.com/library/view/kubernetes-patterns/9781492050278/ch15.html#idm46631050718360)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  containers:
  - name: app
    image: docker.io/centos/httpd    
    ports:
    - containerPort: 80
    volumeMounts:
    - mountPath: /var/www/html       
      name: git
  - name: poll
    image: axeclbr/git               
    volumeMounts:
    - mountPath: /var/lib/data       
      name: git
    env:
    - name: GIT_REPO
      value: https://github.com/mdn/beginner-html-site-scripted
    command:
    - "sh"
    - "-c"
    - "git clone $(GIT_REPO) . && watch -n 600 git pull"
    workingDir: /var/lib/data
  volumes:
  - emptyDir: {}
    name: git
```

SideCar 容器的使用有如下几个好处：
- **节约资源**：容器作为资源分配的单位，可以将资源优先配置给主容器，而 sidecar 容器可以配置较少的资源，避免其资源占用过多影响主进程。
- **职责分离**：容器作为打包的单位，主容器和 sidecar 容器是可以分开单独开发并打包的。
- **方便重用**：容器也是重用的单位，sidecar 可以用来辅助不同的主容器。
- **错误隔离**：当某个容器出现问题时，可以单独的进行降级、升级、回滚等，尽量不影响其他容器的运行。

#### Ambassador

Ambassador 大使模式，是一种特殊的 SideCar，用于代理容器对外的请求、操作。比如主容器需要访问数据库获取资源，对于主容器而言，其看到的始终是与本地通信，所有的通信细节都由大使容器实现。

![在这里插入图片描述](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/sidecar-ambassador-01.png)

图片来自：[Kubernetes Patterns](https://learning.oreilly.com/library/view/kubernetes-patterns/9781492050278/ch17.html)
下面是一个简单的示例，主容器产生的日志会经由 localhost:8080 的路径发送给 Ambassador 容器，然后经由 Ambassador 发送给不同的存储媒介。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: random-generator
  labels:
    app: random-generator
spec:
  containers:
  - image: k8spatterns/random-generator:1.0            
    name: main
    env:
    - name: LOG_URL                                    
      value: http://localhost:9009
    ports:
    - containerPort: 8080
      protocol: TCP
  - image: k8spatterns/random-generator-log-ambassador 
    name: ambassador
```


#### Adapter

适配器模式是另外一种特殊的 SideCar，和大使模式相反。大使模式是屏蔽的外部的变化，对主容器提供一致对外访问体验。

而适配器模式则是屏蔽容器内部的变化，对外提供统一的访问模式。最常见的例子就是监控 API，比如 Prometheus，外界不用关心容器内部是怎样实现的，只需要访问固定的 API 获取指标就可以了。

![在这里插入图片描述](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/sidecar-adapter-01.png)

图片来自：[Kubernetes Patterns](https://learning.oreilly.com/library/view/kubernetes-patterns/9781492050278/ch16.html)

下面是一个 Adapter 的示例，Adapter用到了一个 `nginx/nginx-prometheus-exporter` 的一个镜像，该适配器会把 Nginx 的 stub staus 页转成 Prometheus 的 metrics，并放了9113端口和默认的 `/mterics` 的访问路径。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    app: adapter-pattern
  name: adapter-pattern
  namespace: adapter
spec:
  replicas: 1
  selector:
    matchLabels:
      app: adapter-pattern
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: adapter-pattern
    spec:
      volumes:
      - name: nginx-default-conf-volume
        configMap:
          name: nginx-default-conf
      containers:
      - name: nginx
        image: nginx:1.19.2
        ports:
        - containerPort: 80
        volumeMounts:
        - mountPath: /etc/nginx/conf.d
          name: nginx-default-conf-volume
          readOnly: true
      - name: adapter
        image: nginx/nginx-prometheus-exporter:0.8.0
        args: ["-nginx.scrape-uri", "http://localhost/nginx_status"]
        ports:
        - containerPort: 9113
      - name : debug
        image: nicolaka/netshoot
        command: ["/bin/bash", "-c"]
        args: ["while true; do sleep 60; done"]
```


