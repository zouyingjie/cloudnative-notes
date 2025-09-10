# 调度原理

所谓调度就是按照一系列的需求、规则，将 Pod 调度至合适的 Node 上，这个过程是由 kube-scheduler 组件负责完成。下面是 Kubernetes 提供的一些调度方式：

### 手动调度

Pod 的定义中有 nodeName 属性，kube-scheduler 就是在选择出最合适的节点后修改 Pod 的 nodeName 来指定 Pod 的运行节点。我们可以在定义 Pod 时直接设置。示例如下：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx
  # 指定节点名称，Pod 会被调度到 node02 节点
  nodeName: node02
```


### NodeSelector 节点选择器

Kubernetes 允许使用 label 标签对资源进行标识。可以通过在 Node 打 label，然后使用 nodeSelector 匹配这些 label，将 Pod 调度到对应节点。

比如我们希望某些执行 IO 任务的 Pod 调度到磁盘类型为 ssd 的 Node 上，可以先在 Node 上打标签 `disk-type: ssd`，然后设置 Pod 的 nodeSelector 为 `disk-type: ssd`，示例如下：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    env: test
spec:
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
  # 配置 nodeSelector，将 Pod 调度到 disk-type 为 ssd 的 Node 上
  nodeSelector:
    disk-type: ssd
```


### Node & Pod Affinity 亲和性调度

nodeSelector 只能简单的根据标签是否相等来进行调度，会被逐渐弃用。现在更推荐使用拥有更强大的节点关联规则，调度更加灵活的 `Node/Pod Affinity` （亲和度） 进行调度。
亲和性规则分为 `Node Affinity` 节点亲和度和 `Pod Affinity` Pod 亲和度两种。

首先我们来看 `Node Affinity` （节点亲和度）的示例：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-node-affinity
Spec:
  # 设置亲和度
  affinity:
    # 设置节点亲和度
    nodeAffinity:
      # 指定 affinity 类型
      requiredDuringSchedulingIgnoredDuringExecution:
        # 指定若干个规则
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/e2e-az-name
            operator: In
            values:
            - e2e-az1
            - e2e-az2
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 1
        preference:
          matchExpressions:
          - key: another-node-label-key
            operator: In
            values:
            - another-node-label-value
  containers:
  - name: with-node-affinity
    image: k8s.gcr.io/pause:2.0
```

我们来看下各个配置的含义，首先 Node Affinity 要指定规则类型，有两种类型的亲和规则：

- `requiredDuringSchedulingIgnoredDuringExecution`：表示节点只能在满足匹配规则的情况下，Pod 才会被调度上去。
  
- `preferredDuringSchedulingIgnoredDuringExecution`：表示会优先将 Pod 调度到那些满足匹配规则的节点上，实在没有的话也可以调度到其他节点。


虽然 affinity 规则类型的名字看着很长，但其语义还是很清晰的，由 `Affinity` 类型 和 作用时期 组成。

|| DuringScheduling Pod 调度期间| DuringExecution Pod 运行期间|
|--|--|--|
| 类型 1 | required | ignored |
| 类型 2| preferred | ignored |


- `DuringScheduling` 和 `DuringExecution` 分别表示对调度期和运行期的要求。调度期只会在新 Pod 创建时生效，而运行期则会影响正在运行的 Pod。
  
- `required` 表示必须满足条件；`preferred` 表示尽量满足，也就是说会优先将 Pod 调度到满足亲和性规则的节点上，如果找不到也可以调度到其他节点；`Ignored` 表示忽略已经存在的 Pod 的亲和性规则。

可以看到两种调度规则对 `DuringExecution` 都是 `ignored`，也就是说已经运行中的 Pod 会继续运行，即使 node label 发生了变化，也不会被重新调度。之前 Kubernetes 曾计划引入 ``requiredDuringSchedulingRequiredDuringExecution`` 类型的规则，会对运行中的 Pod 进行重新调度，但并没有后续。

NodeAffinity 的 Operator 支持 `In, NotIn, Exists, DoesNotExist, Gt, Lt` 这几种操作，我们可以通过 NotIn、DoesNotExist 支持反亲和操作。

另外有下面几条亲和规则需要注意：
- 如果同时指定 nodeSelector 和 nodeAffinity，则必须同时满足两个条件才能将Pod调度到候选节点。
  
- 如果 nodeAffinity 的某个类型关联了多个 nodeSelectorTerms，只需要满足其中之一，就可以将 Pod 调度到节点。
  
- 如果 nodeSelectorTerms 下有多个 matchExpressions，则只有在满足所有matchExpressions的情况下，才可以将 Pod 调度到一个节点上。

最后对于 `preferredDuringSchedulingIgnoredDuringExecution` 还会有一个 `weight` 权重字段，取值范围为 1-100，用来在调度时结合其他条件计算 Node 的优先级，Pod 最终会调度到优先级最高的 Node 上。



除了节点亲和度，还有 Pod 亲和度、反亲和度（anti-affinity）来指定使 Pod 优先与某些 Pod 部署到一起或者不与某些 Pod 部署到一起，语法和 NodeAffinity 类似，这里不在赘述。下面是一个官网的例子：
 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-pod-affinity
spec:
  affinity:
    # Pod 亲和度，与标签匹配的 Pod 部署在一起
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: security
            operator: In
            values:
            - S1
        topologyKey: topology.kubernetes.io/zone
    # 反亲和，优先部署在没有对应标签的 Pod 运行的节点上
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: security
              operator: In
              values:
              - S2
          topologyKey: topology.kubernetes.io/zone
  containers:
  - name: with-pod-affinity
    image: k8s.gcr.io/pause:2.0
```
 
 不过在官网的建议中，Pod 亲和、反亲和的调度规则会降低集群的调度速度，因此不建议在超过数百个节点中的集群中使用。
 
### Resource Request

在定义 Pod 时可以选择性地为每个容器设定所需要的资源数量。 最常见的可设定资源是 CPU 和内存（RAM）大小，从而使得 Pod 调度到符合资源需求的节点上，示例如下：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: frontend
spec:
  containers:
  - name: app
    image: images.my-company.example/app:v4
    env:
    - name: MYSQL_ROOT_PASSWORD
      value: "password"
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```


这里有 requests 和 limits 两个设置项：

- **requests**： 资源请求值，kube-scheduler 根据该值进行调度决策，在执行调度时，会以 Pod 中所有容器的 request 值的总和作为调度依据。
  
- **limits**：资源使用配额，给 cGroups 使用，用来限制容器资源的使用。

**Pod 对特定资源类型的请求/约束值是 Pod 中各容器对该类型资源的请求/约束值的总和。**

我们看下面的例子， Pod 有两个 Container，每个 Container 请求 500 毫核 CPU 和 1GB 内存， 每个容器的资源约束为 2000 毫核 CPU 和 2GB 内存。 因此 kube-scheduler 会认为该 Pod 的资源请求数为两个容器的 request 之和，即 1 核 CPU 和 2GB 内存。kube-scheduler 会去寻找满足该资源请求的节点。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: frontend
spec:
  containers:
  - name: app
    image: images.my-company.example/app:v4
    env:
    - name: MYSQL_ROOT_PASSWORD
      value: "password"
    resources:
      requests:
        memory: "1Gi"
        cpu: "500m"
      limits:
        memory: "2Gi"
        cpu: "2000m"
  - name: log-aggregator
    image: images.my-company.example/log-aggregator:v6
    resources:
      requests:
        memory: "1Gi"
        cpu: "500m"
      limits:
        memory: "2Gi"
        cpu: "2000m"
```

谷歌在其 [Brog](https://static.googleusercontent.com/media/research.google.com/zh-CN//pubs/archive/43438.pdf) 论文中指出，在实际操作中人们往往会过度请求资源。大多数实际运行的应用真正用到的资源往往远小于其所请求的配额。

Kubernetes 使用上述两个配置项来设定资源的使用，并且基于该配置项确定 Pod 的服务质量等级（Quality of Service Level，QoS Level）：

QoS 等级有三类，基于 limits 和 requests 确定：

- **Guaranteed**：最高服务等级，当 Pod 中**所有容器**都设置了 limits 和 requests 并且值相等时，其 QoS 等级是 Guaranteed。**资源不足时优先保证该类 Pod 的运行。**

- **Burstable**：Pod 中有容器只设置了 requests 没有设置 limits，或者 requests 的值小于 limits 值，此时 QoS 为 Burstable。

- **BestEffort**: Pod 中容器都没有设置 limits 和 requests，资源不足时优先杀死这类 Pod。

简单来说，就是只有 Pod 中所有容器都达到 Guaranteed 级别，Pod 才会达到 Guaranteed 级别。而只要有一个容器没有达到 Guaranteed 级别，Pod 就会降到 Burstable 级别。如果有一个容器没有设置 limits 和 requests，则 Pod 会降到 BestEffort 级别。

| CPU requests vs limits | Memory requests vs limits | Container QoS | 
|--|--|--|
| None set          | None set              | BestEffort | 
| None set          | Requests < Limits     | Burstable  | 
| None set          | Requests = Limits     | Burstable  | 
| Requests < Limits | None set              | Burstable  |
| Requests < Limits | Requests < Limits     | Burstable  | 
| Requests < Limits | Requests = Limits     | Burstable  | 
| Requests = Limits | Requests = Limits     | Guaranteed | 

通过这种方式，Kubernetes 鼓励我们按实际需要分配资源，如果我们随意设置甚至不设置资源，则 Kubernetes 会做出“惩罚”，资源不足时优先将这类 Pod 驱逐。

### Taints & Tolerations

上面提到的规则基本都是表示将 Pod 调度到哪个节点，而对于某些节点，我们希望 Pod 不要调度到该节点上去。此时可以通过给 Node 打 Taint(污点) 的方式实现。

给 Node 打污点的命令格式如下：

```bash
$ kubectl taint nodes node name key=value:taint effect
```

- **key** 代表 taint 的键
- **value** 代表 taint 的值，可以省略
- **taint effect** 代表 taint 的效果，有下面三个可选值

	- **NoSchedule：** 如果 Pod 没有容忍该 taint，则不会被调度到打上该 taint 的 Node 上，但已运行的 Pod 不受影响。
	- **PreferNoSchedule：** 如果 Pod 没有容忍该 taint，则尽量不让其调度到打上该 taint 的节点上，实在没有其他 Node 可用了才会调度过去。
  - **NoExecute：** 前两种效果影响的只是调度期，而该效果会影响运行期，如果向节点添加了该作用的 taint，则已运行在该 Node 上的没有忍受该 taint 的 Pod 会被驱逐。

下面我们来看几个示例。

1. 添加、查看与移除污点

给 node2 节点添加两个污点

```bash
# key 为 node-type，value 为 production，效果为 NoSchedule
$ kubectl taint node node2 node-type=production:NoSchedule
node/node2 tainted

# key 为 isProduct，value 省略，效果为 NoSchedule
$ kubectl taint node node2 isProduct=:NoSchedule
node/node2 tainted
```

新建两个 Pod 并且没有容忍上述的污点，可以看到新的 Pod 都调度到了 vm-0-4-ubuntu 节点上。

```bash
$ kubectl run redis --image=redis --labels="app=redis"
pod/redis created

$ kubectl run nginx --image=nginx
pod/nginx created

$ kubectl get pods -o wide
NAME    READY   STATUS    RESTARTS   AGE   IP          NODE            NOMINATED NODE   READINESS GATES
nginx   1/1     Running   0          55s   10.32.0.7   vm-0-4-ubuntu   <none>           <none>
redis   1/1     Running   0          58s   10.32.0.8   vm-0-4-ubuntu   <none>           <none>
```


现在去掉 node2 上的两个污点，然后将 vm-0-4-ubuntu 节点打上 NoExecute 效果的污点，看上面的 Pod 是否被驱逐。

移除污点的方式很简单，在污点最后面加 - 即可，如下：

```bash
$ kubectl taint node node2 isProduct=:NoSchedule-
node/node2 untainted
```

现在将 vm-0-4-ubuntu 打上新的效果为 NoExecute 的污点

```bash
$ kubectl taint node vm-0-4-ubuntu node-type=production:NoExecute
node/vm-0-4-ubuntu tainted
```

可以看到 Pod 已经被驱逐了，如果 Pod 是由 Deployment 等控制的，那应该会重新调度到 node2 上。

2. 设置 Pod 容忍污点

如果我们不想移除污点但是依然想让 Pod 调度到该节点的话，就需要给 Pod 添加 Tolerations（容忍度） 了。示例如下：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    env: test
spec:
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
  tolerations:
  - key: "key1"
    operator: "Equal"
    value: "value1"
    effect: "NoSchedule"
  - key: "example-key"
    operator: "Exists"
    effect: "NoSchedule"
```

operator 有两种：

- **Equal**：这是默认值，表示容忍某个 key 等于 value，并且 effect 为对应效果的污点。
- **Exists**：用于判断没有 value 的污点，表示容忍如果某个 key 存在且 effect 为对应效果的污点。

另外这里还有两种特殊情况:

- key 为空并且 operator 为 Exists，表示容忍所有污点
- effect 为空，表示容忍所有与 key 匹配的污点。

```yaml
  tolerations:
  - key: "key1"
    operator: "Equal"
    value: "value1"
    effect: ""
  - key: ""
    operator: "Exists"
    effect: "NoSchedule"
```

针对 NoExecute 类型的污点，还有一个 `tolerationSeconds` 的配置，表示可以容忍某个污点多长时间。

```yaml
tolerations:
- key: "key1"
  operator: "Equal"
  value: "value1"
  effect: "NoExecute"
  tolerationSeconds: 3600
```

上面我们提到如果打上 NoExecute 效果的污点，会将正在运行的没有容忍该污点的 Pod 驱逐出去。如果加上 tolerationSeconds 配置，则 Pod 会继续运行，如果超出 tolerationSeconds 时间后还没有结束的话则会被驱逐。

比如，一个使用了很多本地状态的应用程序在网络断开时，仍然希望停留在当前节点上运行一段较长的时间， 愿意等待网络恢复以避免被驱逐。在这种情况下，Pod 的容忍度可能是下面这样的：

```yaml
tolerations:
- key: "node.kubernetes.io/unreachable"
  operator: "Exists"
  effect: "NoExecute"
  tolerationSeconds: 6000
```


### Pod 驱逐

在基于资源进行调度一节中提到，当资源不足时 Kubernetes 会将 QoS 等级较低的 Pod 杀死，该过程在 Kubernetes 中称为驱逐（Eviction）。

计算机资源可以分为两类：
- **可压缩资源**：像 CPU 这类资源，当资源不足时，Pod 会运行变慢，但不会被杀死。
- **不可压缩资源**：像磁盘、内存等资源，当资源不足时 Pod 会被杀死，比如发生内存溢出时 Pod 被直接终止。

Kubernetes 默认设置了一系列阈值，当不可压缩资源达到阈值时，kubelet 就会执行驱逐机制。主要的阈值有下面几个：

```bash
- memory.available < 100Mi # 可用内存
- nodefs.available < 10%   # 可用磁盘空间
- nodefs.inodesFree < 5%   # 文件系统可用 inode 是数量
- imagefs.available < 15%  # 可用的容器运行时镜像存储空间
```

另外驱逐机制中还有`软驱逐（soft eviction）`、`硬驱逐（hard eviction）` 以及` 优雅退出期（grace period）`的概念:

- **软驱逐**：一个较低的警戒线，资源持续超过该警戒线一段时间后，会触发 Pod 的优雅退出，系统通知 Pod 做必要的善后清理，然后自行结束。超出优雅退出期后，系统会强行杀死未自动退出的 Pod。

- **硬驱逐**：配置一个较高的警戒线，一旦触及此红线，则立即强行杀死 Pod，不会优雅退出。

之所以出现这样更加细化的概念，是因为驱逐 Pod 是一种危险行为，可能导致服务中断，因此需要兼顾系统短时间的资源波动和资源剧烈消耗影响到高服务质量的 Pod 甚至集群节点的情况。

Kubelet 启动时默认配置文件是 `/etc/kubernetes/kubelet-config.yaml`，可以通过修改该文件 然后重启 Kubelet 来修改上述阈值配置，示例如下：

```yaml
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
nodeStatusUpdateFrequency: "10s"
failSwapOn: True
...
...
# 配置硬驱逐阈值
eventRecordQPS: 5
evictionHard:
  nodefs.available:  "5%"
  imagefs.available:  "5%"
```

### 调度过程

了解了 Kubernetes 的调度规则后，我们再来看下 Kubernetes 调度过程是怎样实现的。这里对过程最简要分析，更详细的流程可以参考的文章 [【kubernetes 源码剖析】kube-scheduler 调度流程](https://blog.csdn.net/Ahri_J/article/details/151409125)。

Kubernetes 调度过程图所示：

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/6164aa5fb3ffdc41ac32fc84c1eadc48.png)

图片来自：https://icyfenix.cn/immutable-infrastructure/schedule/hardware-schedule.html

主要有下面几个步骤：

- **Informer Loop**: 持续监听 etcd 中的资源信息，当 Pod、Node 信息发生变化时触发监听，更新调度缓存和调度队列。

- **Scheduler Loop**: 该步骤主要是从优先级调度队列中获取要调度的 Pod，并基于调度缓存中的信息进行调度决策，主要有如下过程：

	- **Predicates: 过滤阶段**，本质上是一组节点过滤器，基于一系列的过滤策略，包括我们上面提到的这些调度规则的设定，比如亲和度都是在这里起作用。只有满足条件的节点才会被筛选出来。

	- **Priorities: 打分阶段**，所有可用节点被过滤筛选出来后会进入打分阶段，基于各种打分规则给 Node 打分以选出最合适的节点后进行调度。具体的过滤、打分策略可以参考文档  [Scheduling Policies](https://kubernetes.io/docs/reference/scheduling/policies/)。

	- **Bind**：经过过滤打分最终选出合适的 Node 后，会更新本地调度缓存闭关通过异步请求的方式更新 Etcd 中 Pod 的 nodeName 属性。这样如果调度成功则本地缓存与 Etcd 中的信息向保持一致，如果调度失败，则会通过 Informer 循环更新本地缓存，重新调度。

另外为了提升调度性能：
- 调度过程全程只和本地缓存通信，只有在最后的 bind 阶段才会向 api-server 发起异步通信。
- 调度器不会处理所有的节点，而是选择一部分节点进行过滤、打分操作。

### 自定义调度器

除了默认的 Kubernetes 默认提供的调度器，我们还可以自定义调度器并在集群中部署多个调度器，然后在创建  Pod 选择使用的调度器。

下面是一个基于官方的 scheduler 的例子，在集群中部署另一个调度器。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    component: scheduler
    tier: control-plane
  name: my-scheduler
  namespace: kube-system
spec:
  selector:
    matchLabels:
      component: scheduler
      tier: control-plane
  replicas: 1
  template:
    metadata:
      labels:
        component: scheduler
        tier: control-plane
        version: second
    spec:
      serviceAccountName: my-scheduler
      containers:
      - command:
        - /usr/local/bin/kube-scheduler
        - --config=/etc/kubernetes/my-scheduler/my-scheduler-config.yaml
        image: gcr.io/my-gcp-project/my-kube-scheduler:1.0
        livenessProbe:
          httpGet:
            path: /healthz
            port: 10251
          initialDelaySeconds: 15
        name: kube-second-scheduler
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    component: scheduler
    tier: control-plane
  name: my-scheduler
  namespace: kube-system
spec:
  selector:
    matchLabels:
      component: scheduler
      tier: control-plane
  replicas: 1
  template:
    metadata:
      labels:
        component: scheduler
        tier: control-plane
        version: second
    spec:
      serviceAccountName: my-scheduler
      containers:
      - command:
        - /usr/local/bin/kube-scheduler
        - --config=/etc/kubernetes/my-scheduler/my-scheduler-config.yaml
        image: gcr.io/my-gcp-project/my-kube-scheduler:1.0
        livenessProbe:
          httpGet:
            path: /healthz
            port: 10251
          initialDelaySeconds: 15
        name: kube-second-scheduler
```

部署调度器后，可以在 Pod Spec 中设置 `schedulerName` 字段，指定要选择的调度器。

### kube-scheduler 框架


自定义调度器通常需要用户自己从头编写、编译、打包为一个完整的程序并部署执行后才可以被使用，整个流程非常的繁琐。为了简化自定义调度器的开发，Kubernetes 提供了 [Kubernetes Scheduling Framework](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/)，将调度过程中过滤、打分、Reserve 、Permit、绑定等流程以扩展点的形式暴露出来，我们可以实现相应的扩展插件，来定义自己的调度逻辑。
下面是主要的扩展点。

![在这里插入图片描述](https://kubernetes.io/images/docs/scheduling-framework-extensions.png)

具体到代码中就是实现相应的接口，相关接口可以参考 [scheduler-plugins](https://github.com/kubernetes-sigs/scheduler-plugins) 的代码。

在开发完成后，Kubernetes 提供了 [KubeSchedulerConfiguration](https://kubernetes.io/docs/reference/scheduling/config/#multiple-profiles) 配置资源，允许我们配置多个调度器信息，并且可以为每个调度器指定不同的插件组合。

比我我们基于框架实现一个 my-scheduler 调度器，然后做部署：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-scheduler
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      component: my-scheduler
  template:
    metadata:
      labels:
        component: my-scheduler
    spec:
      serviceAccountName: my-scheduler-sa
      containers:
      - name: my-scheduler
        image: myrepo/my-scheduler:latest
        command:
        - /my-scheduler
        - --config=/etc/kubernetes/scheduler-config/config.yaml
        volumeMounts:
        - mountPath: /etc/kubernetes/scheduler-config
          name: config
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: my-scheduler-config
```
部署完成后，通过 KubeSchedulerConfiguration 修改 kube-scheduler 的配置，将我们的自定义调度器配置进去。

```
apiVersion: kubescheduler.config.k8s.io/v1
kind: KubeSchedulerConfiguration
profiles:
- schedulerName: default-scheduler
- schedulerName: my-scheduler   # Pod 用这个名字调度
  plugins:
    filter:
      enabled:
      - name: MyFilterPlugin
    score:
      enabled:
      - name: MyScorePlugin
  pluginConfig:
  - name: MyScorePlugin
    args:
      weight: 10
```

调度可能是 Kubernetes 被讨论最多的话题之一，尤其是在现代大模型训练场景下，对调度策略的要求变得愈加严格和复杂，像 [Volcano]() 的 批处理任务（Batch）和 AI 任务调度、[Ray](https://github.com/ray-project/ray) 的资源感知调度、[Koordinator](https://koordinator.sh/) 基于异构混部的负载感知、潮汐调度都是新出的框架。

这是一个能够一通百通的技术方向，从 Linux 内核线程调度、Kubernetes Pod 调度到 Golang 的 goroutine 调度，再到各类任务调度，对技术深度有追求的同学不妨在这个领域深入钻研一下。




