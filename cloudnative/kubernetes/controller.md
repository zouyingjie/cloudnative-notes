# 控制器对象

在使用 Kubernetes 时，我们通常是使用各种 Controller 对象来管理 Pod。
每个 Controller 本质上就是观察对象状态并进行状态拟合的控制循环。每个 Controller 都是一个单独的进程，试图将对象的状态调整为其所期望的状态。

```java
for {
  实际状态 := 获取集群中对象 X 的实际状态（Actual State）
  期望状态 := 获取集群中对象 X 的期望状态（Desired State）
  if 实际状态 == 期望状态{
    什么都不做
  } else {
    执行编排动作，将实际状态调整为期望状态
  }
}
```

K8s中常用的 controller 有

- **Deployments**： 一个 Deployment 为 Pods和 ReplicaSets提供描述性的更新方式。描述 Deployment 中的 desired state，并且 Deployment 控制器以受控速率更改实际状态，以达到期望状态。可以定义 Deployments 以创建新的 ReplicaSets ，或删除现有 Deployments ，并通过新的 Deployments 使用其所有资源。这是最常用的。

- **Statefulset**： 和 Deployment 相同的是，StatefulSet 管理了基于相同容器定义的一组 Pod。但和 Deployment 不同的是，StatefulSet 为它们的每个 Pod 维护了一个固定的 ID。这些 Pod 是基于相同的声明来创建的，但是不能相互替换：无论怎么调度，每个 Pod 都有一个永久不变的 ID。稳定意味着 Pod 调度或重调度的整个过程是有持久性的。如果应用程序不需要任何稳定的标识符或有序的部署、删除或伸缩，则应该使用由一组无状态的副本控制器提供的工作负载来部署应用程序，一般用于有状态的应用。

- **DaemonSet**： 确保全部（或者某些）节点上运行一个 Pod 的副本。 当有节点加入集群时， 也会为他们新增一个 Pod 。 当有节点从集群移除时，这些 Pod 也会被回收。删除 DaemonSet 将会删除它创建的所有 Pod。一般用于“监控进程”、“日志收集”或“节点管理”。

- **Jobs**：会创建一个或者多个 Pods，并确保指定数量的 Pods 成功终止。 随着 Pods 成功结束，Job 跟踪记录成功完成的 Pods 个数。 当数量达到指定的成功个数阈值时，任务（即 Job）结束。 删除 Job 的操作会清除所创建的全部 Pods。一种简单的使用场景下，你会创建一个 Job 对象以便以一种可靠的方式运行某 Pod 直到完成。 当第一个 Pod 失败或者被删除（比如因为节点硬件失效或者重启）时，Job 对象会启动一个新的 Pod。


- **CronJob**：Cron Job 创建基于时间调度的 Jobs。一个 CronJob 对象就像 crontab (cron table) 文件中的一行。 它用 Cron 格式进行编写， 并周期性地在给定的调度时间执行 Job。



下面介绍的都是针对 Pod 的 Workload 控制器对象，各种 Workload 控制器对象本质上是对各种应用任务的抽象。比如我们会有长期运行的业务应用，并且业务应用最好始终保持一定数量的节点来对外提供服务，在升级时不会下线并且可以做到自动扩容；也有单次任务、定时任务等各种类型。

### 1. ReplicaSet

ReplicaSet 确保在任何时候都有特定数量的 Pod 处于运行状态。 换句话说，它可以确保一个 Pod 或一组同类的 Pod 总是可用的。当 Pod 数量过多时，副本控制器会终止多余的 Pod。当应用故障导致 Pod 失败退出时，副本控制器会自动基于 PodTemplate 创建新的 Pod 副本。

最开始的的副本控制器是 ReplicationController ，现已被 ReplicaSet 替代，使用示例如下：

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: frontend
  labels:
    app: guestbook
    tier: frontend
spec:
  # modify replicas according to your case
  replicas: 3
  selector:
    matchLabels:
      tier: frontend
  template:
    metadata:
      labels:
        tier: frontend
    spec:
      containers:
      - name: php-redis
        image: gcr.io/google_samples/gb-frontend:v3
```



一般来说我们基本不会使用直接使用 ReplicaSet 来管理 Pod，而是通过 Deployment 对象管理 。它是一个比 ReplicaSet更高级的概念，它管理 ReplicaSet，并向 Pod 提供声明式的更新以及许多其他有用的功能，比如滚动更新、回滚等。

### 2. Deployment

在实际的应用部署中，经常会有水平伸缩、应用升级与回滚等操作，Deployment 正是对这类操作的抽象。

下面是一个 Deployment 的例子：

```yaml
# 控制部分
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  # Pod 模板
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

- **.metadata** 元信息，指定 Deployment 的名称、标签、命名空间等。
- **.spec.replicas** 副本数量，基于该字段创建对应数量的 Pod。
- **.spec.selector** 标签选择器， 指定哪些 Pod 由这个 Deployment 管理。
- **.spec.template**  Pod 模板，基于该模板创建 Pod， Pod 要指定标签，其值务必和 `.spec.selector` 选择器保持一致。

上面的 yaml 文件 可以使用如下的命令生成：

```bash
kubectl create deployment nginx --image=:nginx:1.14.2 \
    --replicas=3 --port=80 --dry-run=client -o yaml > nginx.yaml
```

#### 2.1 基本使用

**创建并查看 Deployment**

```bash
$ kubectl apply -f nginx-deployment.yaml
deployment.apps/nginx-deployment created

$ kubectl create deployment redis --image=redis:alpine --replicas=1
deployment.apps/redis created
```


**查看新创建的 Deployment**

```bash
$ kubectl get deployments.apps -o wide
NAME               READY   UP-TO-DATE   AVAILABLE   AGE     CONTAINERS   IMAGES       SELECTOR
nginx-deployment   3/3     3            3           5m37s   nginx        nginx:1.14.2   app=nginx
```


**查看 Deployment 的展开状态**

```bash
$ kubectl rollout status deployment nginx-deployment
Waiting for deployment "nginx-deployment" rollout to finish: 3 of 10 updated replicas are available...
Waiting for deployment "nginx-deployment" rollout to finish: 4 of 10 updated replicas are available...
Waiting for deployment "nginx-deployment" rollout to finish: 5 of 10 updated replicas are available...
Waiting for deployment "nginx-deployment" rollout to finish: 6 of 10 updated replicas are available...
Waiting for deployment "nginx-deployment" rollout to finish: 7 of 10 updated replicas are available...
Waiting for deployment "nginx-deployment" rollout to finish: 8 of 10 updated replicas are available...
Waiting for deployment "nginx-deployment" rollout to finish: 9 of 10 updated replicas are available...
deployment "nginx-deployment" successfully rolled out
```

Deployment 是通过上面提到的 ReplicaSet 来管理 Pod 的，ReplicaSet 本质上和应用的版本相对应。

- 当执行水平伸缩时，Deployment 会修改当前 ReplicaSet 对象的副本数量，进而实现 Pod 的新建或销毁。
- 当 Pod 模板发生变化时，Deployment 会创建新的 ReplicaSet 对象，然后通过滚动升级（rolling update ）的方式升级现有的 Pod。

通过 `kubectl get rs` 查看由这个 Deployment 创建的 ReplicatSet，ReplicaSet 将会保证有三个 nginx pod 副本。

```bash
$ kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-7f4fc68488    3        3        3      6m44s
```

ReplicaSet 的名称满足 `[Deployment-Name]-[Random-String]` 格式， 其中 `RANDOM-STRING` 是随机生成的，并以 `pod-template-hash` 为种子。

`pod-Template-hash` 是由 Deployment Controller 添加在其创建或接管的 ReplicaSet 上的标签，该标签会保证一个 Deployment 下的子 ReplicaSet 不会重复。该标签由 ReplicaSet 下的 PodTemplate 通过 hash 处理生成的，并将结果作为 Pod 的标签，并添加到 ReplicaSet 的选择器上，注意不要更改这个标签。

```bash
$ kubectl describe rs nginx-deployment-559d658b74
Name:           nginx-deployment-559d658b74
Namespace:      default
Selector:       app=nginx,pod-template-hash=559d658b74
Labels:         app=nginx
                pod-template-hash=559d658b74
```
                
通过 `kubectl get pods --show-labels` 可以查看生成的 Pod 及其 Label。

```bash
$ kubectl get pods --show-labels
NAME                                READY   STATUS    RESTARTS   AGE     LABELS
nginx-deployment-7f4fc68488-2mlzr   1/1     Running   0          7m34s   app=nginx,pod-template-hash=7f4fc68488
nginx-deployment-7f4fc68488-8p47t   1/1     Running   0          102s    app=nginx,pod-template-hash=7f4fc68488
nginx-deployment-7f4fc68488-f6jqw   1/1     Running   0          102s    app=nginx,pod-template-hash=7f4fc68488
```

必须在 Deployment 中指定合适的 selector 和 Pod 标签，不要和其他 Controller 的 Label 或 selector 重复。**Kubernetes 不会检查并阻止 Controller 之间的 label/selector 冲突，如果多个 Controller 有相同的 lable/selector， 可能会导致 Pod 管理上的冲突，引发预期之外的行为。**


#### 水平伸缩与升级


普通的伸缩命令如下：

```bash
kubectl scale deployment.v1.apps/nginx-deployment --replicas=10
```

如果 HPA 打开的话，可以通过如下命令设置HPA（基于CPU的使用率）

```bash
kubectl autoscale deployment.v1.apps/nginx-deployment --min=10 --max=15 --cpu-percent=80
```

执行后查看 Deployment 的伸缩状态：

```bash
$ kubectl rollout status deployment nginx-deployment
Waiting for deployment "nginx-deployment" rollout to finish: 3 of 10 updated replicas are available...
Waiting for deployment "nginx-deployment" rollout to finish: 4 of 10 updated replicas are available...
Waiting for deployment "nginx-deployment" rollout to finish: 5 of 10 updated replicas are available...
Waiting for deployment "nginx-deployment" rollout to finish: 6 of 10 updated replicas are available...
Waiting for deployment "nginx-deployment" rollout to finish: 7 of 10 updated replicas are available...
Waiting for deployment "nginx-deployment" rollout to finish: 8 of 10 updated replicas are available...
Waiting for deployment "nginx-deployment" rollout to finish: 9 of 10 updated replicas are available...
deployment "nginx-deployment" successfully rolled out

$ kubectl get deployments.apps
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   10/10   10           10          16m
```

Deployment 的伸缩本质上是通过修改 ReplicaSet 的副本数实现的，ReplicaSet 副本数修改后，ReplicaSetController 基于控制循环进行状态拟合，创建相应的 Pod。

```bash
$ kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-66b6c48dd5   10        10        10      16m
```


##### 更新镜像

使用如下命令

```bash
kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1 --record
```

或者通过 kubectl edit 进行修改

```bash
kubectl edit deployment.v1.apps/nginx-deployment
```


查看展开状态结果使用如下命令

```bash
$ kubectl rollout status deployment nginx-deployment
Waiting for deployment "nginx-deployment" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deployment" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deployment" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deployment" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "nginx-deployment" rollout to finish: 1 old replicas are pending termination...
deployment "nginx-deployment" successfully rolled out
```
通过 kubectl get deployments 可以查看其他细节。当 PodTemplate 内容被改变时，Deployment 会创建新的 ReplicaSet 并通过它创建 Pod 副本，同时会将旧的 ReplicaSet 的副本数量改为 0。通过 kubectl get rs 来查看 Deployment 的更新，可以看到 Pods 是由新创建的 ReplicaSet 扩展出 3 个副本， 同时旧的副本数量缩小为 0。

```bash
kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-1564180365   3         3         3       6s
nginx-deployment-2035384211   0         0         0       36s
```

通过 `kubectl describe deployments` 可以看到 Deployment 的 Events:
  
```bash
  Type    Reason             Age   From                   Message
    ----    ------             ----  ----                   -------
    Normal  ScalingReplicaSet  2m    deployment-controller  Scaled up replica set nginx-deployment-2035384211 to 3
    Normal  ScalingReplicaSet  24s   deployment-controller  Scaled up replica set nginx-deployment-1564180365 to 1
    Normal  ScalingReplicaSet  22s   deployment-controller  Scaled down replica set nginx-deployment-2035384211 to 2
    Normal  ScalingReplicaSet  22s   deployment-controller  Scaled up replica set nginx-deployment-1564180365 to 2
    Normal  ScalingReplicaSet  19s   deployment-controller  Scaled down replica set nginx-deployment-2035384211 to 1
    Normal  ScalingReplicaSet  19s   deployment-controller  Scaled up replica set nginx-deployment-1564180365 to 3
    Normal  ScalingReplicaSet  14s   deployment-controller  Scaled down replica set nginx-deployment-2035384211 to 0
```

除此之外还可以通过 `kubectl edit deployments.apps nginx-deployment` 或者 `kubectl apply -f nginx-deployment.yml` 来更新 PodTemplate。


##### 升级策略

Deployment 升级有两种策略：

- **ReCreate** ：重建，先将旧的 Pod 全部干掉，然后在创建新的。
- **Rolling Update**：滚动更新，默认策略

滚动更新时，Deployment 允许在同一个时刻存在多个不同版本实例。当滚动更新 Deployment 时，在 Deployment 展开过程中（正在展开或暂停），DeploymentController 会平衡新增的副本和当前活跃的副本以降低风险。 这被称为按比例扩展。

Deployment 主要通过 **maxSurge** 和 **maxUnavailable** 两个字段控制新旧版本的比例：

- **maxSurge**：允许的最多超出的 Pod 数量。默认值为 25%，计算方式是四舍五入，也可以设置绝对值。比如 Pod 数为 4，那么默认是 4 * 25% = 1，即最多允许超出 1 个，也就是说在滚动升级期间，最多可以有 5 个 Pod 运行。

- **maxUnavailable**：最多允许多少 Pod 不可用。默认值为 25，计算方式是四舍五入，也可以设置绝对值。比如 Pod 数为 4，那么默认是 4 * 25% = 1，即最多允许 1 个 Pod 不可用，也就是说在滚动升级期间，最少有 3 个 Pod 运行。

##### Rollover

当 Deployment 更新时，其会创建新的 ReplicaSet 并将 Pod 部署为期望的数量。如果在展开的过程中又有更新，此时 Deployment 会再次创建新的副本，并终止扩展之前的副本。

例如，我们在创建一个副本为 5 镜像是 nginx:1.14.2 的 Deployment， 目前只有 3 个副本存在，此时更新 Deployment 的镜像为 nginx:1.16.1 。在此场景下，Deployment 会立刻杀掉已经创建的 3 个 nginx:1.14.2 的副本， 并开始创建 nginx:1.16.1 Pod 的副本，它并不会等 5 个 nginx:1.14.2 都创建完才开始 nginx:1.16.1 副本的更新。


##### 回滚

查看历史版本

当更新 Deployment 的 PodTemplate 进行升级时，Kubernetes 会保存升级历史，可以通过 kubectl rollout history  命令查看。

```bash
kubectl rollout history deployment.v1.apps/nginx-deployment

deployments "nginx-deployment"
REVISION    CHANGE-CAUSE
1           kubectl apply --filename=https://k8s.io/examples/controllers/nginx-deployment.yaml --record=true
2           kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.16.1 --record=true
3           kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.161 --record=true
```


其中 CHANGE-CAUSE 的这一系列输出来自于 kubernetes.io/change-cause 注解，这是 `--record` 参数的效果。可以通过 kubectl desc rs/deployment 等命令查看其详情。
Kubernetes 默认保存所有版本的记录，为了节省空间，可以通 spec.revisionHistoryLimit 保留版本的个数，默认为 10，如果设置为 0 则表示不保存，也就无法进行回滚操作了。

查看具体的一个版本的细节

```bash
$ kubectl rollout history deployment.v1.apps/nginx-deployment --revision=2
deployment.apps/nginx-deployment with revision #2
Pod Template:
  Labels:	app=nginx
	pod-template-hash=7f4fc68488
  Annotations:	kubernetes.io/change-cause: kubectl set image deploy nginx-deployment nginx=nginx:1.17 --record=true
  Containers:
   nginx:
    Image:	nginx:1.17
    Port:	80/TCP
    Host Port:	0/TCP
    Environment:	<none>
    Mounts:	<none>
  Volumes:	<none>
```


**回滚到最近的一个版本**

```bash
kubectl rollout undo deployment.v1.apps/nginx-deployment
```

**回滚到指定的版本**

```bash
kubectl rollout undo deployment.v1.apps/nginx-deployment --to-revision=2
```

Deployment 会修改对应版本的 ReplicaSet 副本数，并将当前版本的 ReplicaSet 副本数降为 0。

```bash
$ kubectl get rs
NAME                                DESIRED   CURRENT   READY   AGE
nginx-deployment-559d658b74   0         0         0       6d21h
nginx-deployment-66b6c48dd5   3         3         3       6d22h
nginx-deployment-7f4fc68488     0         0         0       6d22h

$ kubectl get rs
NAME                                         DESIRED   CURRENT   READY   AGE
nginx-deployment-559d658b74   3         3         3       6d21h
nginx-deployment-66b6c48dd5   0         0         0       6d22h
nginx-deployment-7f4fc68488     0         0         0       6d22h
```


##### 暂停或继续

有时在升级过程中可能会发现新的问题，此时可以通过 `kubectl rollout pause` 命令暂停更新，并在暂停期间执行多次变更后通过 kubectl rollout resume  恢复更新。Deployment 会将暂停期间的多次更新视为一次展开，这样可以让你应用多个更新时避免出发多个不必要的展开。


```bash
$ kubectl rollout pause deployment.v1.apps/nginx-deployment


$ kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.16.1
deployment.apps/nginx-deployment image updated

$ kubectl rollout history deployment.v1.apps/nginx-deployment
deployments "nginx"
REVISION  CHANGE-CAUSE
1   <none>
$ kubectl get rs
NAME               DESIRED   CURRENT   READY     AGE
nginx-2142116321   3         3         3         2m

$ kubectl set resources deployment.v1.apps/nginx-deployment -c=nginx --limits=cpu=200m,memory=512Mi
deployment.apps/nginx-deployment resource requirements updated

$ kubectl rollout resume deployment.v1.apps/nginx-deployment
deployment.apps/nginx-deployment resumed

$ kubectl get rs -w
NAME               DESIRED   CURRENT   READY     AGE
nginx-2142116321   2         2         2         2m
nginx-3926361531   2         2         0         6s
nginx-3926361531   2         2         1         18s
nginx-2142116321   1         2         2         2m
nginx-2142116321   1         2         2         2m
nginx-3926361531   3         2         1         18s
nginx-3926361531   3         2         1         18s
nginx-2142116321   1         1         1         2m
nginx-3926361531   3         3         1         18s
nginx-3926361531   3         3         2         19s
nginx-2142116321   0         1         1         2m
nginx-2142116321   0         1         1         2m
nginx-2142116321   0         0         0         2m
nginx-3926361531   3         3         3         20s
$ kubectl get rs
NAME               DESIRED   CURRENT   READY     AGE
nginx-2142116321   0         0         0         2m
nginx-3926361531   3         3         3         28s
```


#### Canary Deployment


利用 Deployment 可以实现一个粗糙的灰度部署，可以部署两个版本的 Deployment 并设置不同的副本。这样流量可以按比例流入不同的版本中。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
 name: my-app-v1
 labels:
   app: my-app
spec:
 replicas: 10
 selector:
   matchLabels:
     app: my-app
     version: v1.0.0
 template:
   metadata:
     labels:
       app: my-app
       version: v1.0.0
   spec:
     containers:
     - name: my-app
       image: containersol/k8s-deployment-strategies

---

apiVersion: apps/v1
kind: Deployment
metadata:
 name: my-app-v2
 labels:
   app: my-app
spec:
 replicas: 1
 selector:
   matchLabels:
     app: my-app
     version: v2.0.0
 template:
   metadata:
     labels:
       app: my-app
       version: v2.0.0
   spec:
     containers:
     - name: my-app
       image: containersol/k8s-deployment-strategies
```


虽然使用 Deplpyment 可以实现一个基本的灰度部署，但在实际场景中其功能还是太弱了，无法对灰度流量做更多的控制。实际应用中，我们往往需要对灰度流量做更多的控制，比如基于请求的 header、cookie 等进行灰度，此时就需要使用其他方案。下面是一些常见的灰度方案：

- [Ingress-Nginx#Canary](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#canary)
- Istio、[EaseMesh](https://github.com/megaease/easemesh) 等 ServiceMesh 方案

#### AutoScaling & HPA 

Deployment 可以让我们手动的进行 Pod 的水平扩缩容操作，但在遇到流量压力时，无论是应用层面的 Pod，还是基础设施层面的 Node，人工操作都不容易做到及时和准确的响应，因此 Kubernetes 提供了 AutoScaler 来进行快速的自动伸缩。

Kubernetes 中的自动伸缩可以分为三类：

- Pod 水平扩缩容（HPA）
- Pod 垂直扩缩容（VPA）
- 集群扩缩容
  
这里主要看下水平伸缩。HPA 目前支持下面四种资源的自动水平伸缩

- Deployment
- StatefulSet
- ReplicaSet 
- ReplicaController

下面是官网中的一个示例，首先创建一个 Deployment 作为水平伸缩的对象

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-apache
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kubia
  template:
    metadata:
      labels:
        run: php-apache
    spec:
      containers:
      - name: php-apache
        image: registry.k8s.io/hpa-example
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: 500m
          requests:
            cpu: 200m
```



HPA 可以通过 kubectl 命令自动创建，

```bash

$ kubectl autoscale deployment php-apache --cpu-percent=70 --min=1 --max=10
```


也可以通过 yaml 创建：


```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: php-apache
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```


- **metrics**  伸缩的衡量指标，这里指通过自动扩缩容将 Pod 的 CPU 使用率维持在 70%。也就是说当 Pod 的 CPU 使用率超过 70% 时会进行水平扩容.
- **scaleTargetRef**: 伸缩的对象，这里是指定了名为 php-apache 的 Deployment。
- **minReplicas，maxReplicas**：表示扩缩容的最小，最大副本数。这里最大副本数是 10，当扩容到 10 个 Pod 时如果 CPU 使用率依然没有降到 70%，此时也不会创建更多的副本。

创建完 HPA 后可以通过下面的程序来访问以增加 Pod 的负载，如果一条指令不够可以多执行几次。

```bash
$ kubectl run -it --rm --restart=Never loadgsnerater --image=busybox  -- sh -c "while true; do wget -O - -q http://php-apache.default; done"
```

现在查看新建的 HPA 信息，可以看到其已经有扩容发生了

```bash
$ watch -n 1 kubectl get hpa,deployment
I1204 06:53:22.003902   13443 request.go:665] Waited for 1.136189678s due to client-side throttling, not priority and fairness, request: GET:https://172.19.0.7:6443/apis/rbac.authorization.k8s.io/v1?
timeout=32s
NAME                                        REFERENCE          TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
horizontalpodautoscaler.autoscaling/kubia   Deployment/kubia   38%/30%   1         5         5          5m20s

NAME                    READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/kubia   5/5     5            5           6m50s


$ kubectl describe hpa kubia
… 
Conditions:
  Type            Status  Reason              Message
  ----            ------  ------              -------
  AbleToScale     True    ReadyForNewScale    recommended size matches current size
  ScalingActive   True    ValidMetricFound    the HPA was able to successfully calculate a replica count from cpu resource utilization (percentage of request)
  ScalingLimited  False   DesiredWithinRange  the desired count is within the acceptable range
Events:
  Type    Reason             Age   From                       Message
  ----    ------             ----  ----                       -------
  Normal  SuccessfulRescale  18s   horizontal-pod-autoscaler  New size: 5; reason: cpu resource utilization (percentage of request) above target
```

### Job/CronJob

像 Deployment 这种是对在线业务的抽象，在实际场景中我们有很多离线任务，比如定时脚本、离线计算等。Kubernetes 使用 Job 和 CronJob 来执行此类任务。


#### Job

Job 是对离线任务的抽象，可以用来执行离线计算、批处理任务等。其使用定义如下：

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  completions: 10
  parallelism: 5
  backoffLimit: 4
  activeDeadlineSeconds: 100
  template:
    spec:
      containers:
      - name: pi
        image: perl
        command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
      restartPolicy: Never
```


Job 的运行也是遵循 Kubernetes 的控制器模式，当 Job 创建时，JobController 监听 Pod 和 Job 的变化，并执行相应的状态拟合。

Job 并不需要指定 selector，Job 创建时会被自动加上 controller-uid 标签，该标签会加到 Job 的 selector 和由该 Job 创建出来的 Pod 的标签上。这样做的目的是为了防止不同  Job 之间管理的 Pod 发生重合。

- **completions**：完成次数，会创建对应数量的 Pod 执行任务。默认为 1，上面示例中为 10，则 Job 最终会创建 10 个 Pod。

- **parallelism**：并行数量，表示同时启动的任务数量。默认为 1，表示串行执行，上面示例中为 5，则 Job 会同时运行 5 个 Pod 执行任务。

- **backoffLimit**：重试次数。Job 中 Pod 的重启策只能为设置为 Never 或者 OnFailure。设置为 Never 时，任务失败后 Job 会尝试不断新建 Pod，默认为 6 次，并且重建 Pod 的时间间隔呈指数增加，即下一次重建的间隔是 10s、20s、40s、80s… 如果是 OnFailure 则会不断尝试重启容器。
- **activeDeadlineSeconds** ：Job 终止时间，为了防止 Pod 一直运行无法退出，可以设置该值，一旦超出则该 Job 的所有 Pod 都会被终止。



#### 3.2 CronJob

CornJob 描述的是定时任务，和 crontab 非常相似。我们可以 Cron 表达式指定任务的调度时间：

```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: pi
spec:
  schedule: "*/1 * * * *"
  jobTemplate:
    spec:
      completions: 2
      parallelism: 1
      template:
        spec:
          containers:
          - name: pi
            image: perl
            command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
          restartPolicy: OnFailure
```

- **jobTemplate**：Job 模板，基于该模板创建 Job 对象。CronJob 是通过 Job 控制 Pod的，就和 Deployment 通过 ReplicaSet 控制 Pod 一样。
- **Schedule**： 时间格式和 crontab 是一样的，含义如下：

```bash
# ┌───────────── 分钟 (0 - 59)
# │ ┌───────────── 时 (0 - 23)
# │ │ ┌───────────── 一月中的天(1 - 31)
# │ │ │ ┌───────────── 月份 (1 - 12)
# │ │ │ │ ┌───────────── 星期(0-6) (日~六，有些系统中7也表示星期日);
# │ │ │ │ │                                   
# │ │ │ │ │
# │ │ │ │ │
# *  *  *  *  *
```

使用 CronJob 时需要注意：

- CronJob 并不能保证准时执行，可能会有一定的滞后。
- **concurrencyPolicy**: 并发策略。因为是定时任务，存在当前任务要执行时，上一个任务还没有结束的情况。该字段用来设置其处理策略。
	- Allow: 默认值，允许任务同时存在。
	- Forbid: 该周期内的任务被跳过，Job 会被标记为 miss。
	- Replace: 新的 Job 会替换旧的未完成的 Job。
- 如果在 CronJob 在一段时间内 miss 数据达到 100，则该 CronJob 会被停止。该时长通过 startingDeadlineSeconds 字段设置，但不要小于 10s。

和其他控制器运行方式不同，CronJobController 并不是使用 watch 监听机制从 Informer 接收变更信息的，而是每隔 10s 主动访问 api-server 获取数据。因为其每隔 10s 访问 api-server 检查资源，因此如果 startingDeadlineSeconds 设置小于 10s，可能会导致 CronJob 无法被调度。


### 4, StatefulSet 

Deployment 所代表的是无状态服务，由其管理的 Pod 的可以随意的进行上下线、扩缩容，新加的 Pod 可以部署在任意符合条件的节点上。但除了无状态的、可以随意部署灵活伸缩的应用，在分布式系统中，我们还有很多有状态的应用，每个实例有自己的存储数据，实例之间也有主从等特定的关系，如果我们将这样一个 Pod 随意下线上线，那应用重启后就会丢失数据，导致应用执行失败，因此这类应用需要更加特殊的处理，保证其重新部署后数据不会丢失，节点之间的关系不会发生变化。

Kubernetes 提供了 StatefulSet 来管理有状态应用的资源对象。StatefulSet 早期也叫 PetSet。这是源于应用服务可以分为两类，一种是宠物模式，一种是奶牛模式：

- **宠物模式**：宠物有自己单独的名字，我们必须悉心照料每一只宠物，宠物生病时一定要治好救活，主要是对应有状态的服务。
- **奶牛模式**：有些应用像是奶牛，如果奶牛出了问题我们新换一只就行，不用费心太多，主要是对应无状态的服务。

Deployment 管理的无状态应用就像是奶牛，而有状态应用就是在宕机后必须恢复原样的那只“宠物”。应用中的状态可以分为两类：

- **拓扑状态**：应用中的多个实例并不是完全对等的，它们之前有特殊的关系，这意味着实例的启动需要按照一定的顺序进行。比如 MySQL 的主从，必须先启动主节点，在启动从节点，而终止顺序则应该相反。除此之外，新启动的 Pod 应该和原来网络标识是一样的，以便用户可以使用相同的方式访问。
  
- **存储状态**：多个实例的数据存储是固定的并且数据不能丢失。Pod A 的数据，在 Pod A 重启后依然可以被访问到。

因此由 StatefulSet 管理的 Pod 有下面一些特性：

- Pod 会按顺序创建和销毁：创建后续 Pod 前，必须保证前面的 Pod 已经这个在正常运行进入 Ready 状态。删除时会按照与创建相反的顺序删除，并且只有在后面的 Pod 都删除成功后才会删除当前 Pod。

- Pod 具有稳定且唯一的标识，包括顺序标识、稳定的网络标识和稳定的存储。该标识和 Pod 是绑定的，不管它被调度在哪个节点上。对于具有 N 个副本的 StatefulSet，其每个 Pod 将被分配一个整数序号，从 0 到 N-1，该序号在 StatefulSet 上是唯一的。

- StatefulSet 的 Pod 具有稳定的持久化存储，每个 Pod 都可以拥有自己的独立的 PVC 资源，即使Pod被重新调度到其他节点上，它所拥有的持久化存储也依然会被挂载到该Pod。

- StatefulSet 中的每个 Pod 根据 StatefulSet 的名称和 Pod 的序号派生出它的主机名。 组合主机名的格式为 `$(StatefulSet name)-$(序号)`。 比如，一个叫 web 的 StatefulSet 的三个 Pod 名称分别为 web-0、web-1、web-2 。 

通过固定且唯一的标识，不变的持久化存储，Kubernetes 可以保证在 Pod 重建后依然保留上次的运行状态，从而运行有状态和应用。

下面是 StatefulSet 的一个示例：

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  selector:
    matchLabels:
      app: nginx # has to match .spec.template.metadata.labels
  serviceName: "nginx"
  replicas: 3 # by default is 1
  template:
    metadata:
      labels:
        app: nginx # has to match .spec.selector.matchLabels
    spec:
      terminationGracePeriodSeconds: 10
      containers:
      - name: nginx
        image: k8s.gcr.io/nginx-slim:0.8
        ports:
        - containerPort: 80
          name: web
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "my-storage-class"
      resources:
        requests:
          storage: 1Gi
```


#### Pod 通信

StatefulSet 创建的 Pod 都有自己的网络标识，并且有状态应用的各个 Pod 之间通常是需要互相通信的。常规的让外部访问 Pod 的方式是使用 Service，通过 `svc-name.namespace.svc.cluster.local` 域名可以获取到 Service 的 IP，然后随机访问到 某个 Pod。但对于 StatefulSet，每个 Pod 需要知道所有的伙伴节点并进行通信，比如 ElasticSearch 的选主过程，需要所有的选主节点进行投票。

Kubernetes 提供了 Headless Service 来实现 StatefulSet 下 Pod 间的通信，下面是 Headless Service 的示例

```yaml
apiVersion: v1
kind: Service
metadata:
 name: nginx
 labels:
   app: nginx
spec:
 ports:
 - port: 80
   name: web
 # 设置为 None
 clusterIP: None
 selector:
   app: nginx
```


和默认 Service 不同，Headless 没有自己的 IP 地址，经由 Headless 代理的 Pod，每个 Pod 创建时都会创建独立的 DNS 记录，格式为 `$(pod-name).$(svc-name).namespace.svc.cluster.local` ，如： `web-1.nginx.default.svc.cluster.local`。虽然 Pod 会发生重建，其 IP 也会发生变化，但我们通过上面的 DNS 域名就可以实现对 Pod 的固定访问。同时对于 Pod 之间的通信，Headless 类型的服务也会创建 `svc-name.namespace.svc.cluster.local` 域名的 DNS 记录，但域名解析返回的是所有 Pod 的 IP，交由客户端决定如何访问。

#### 数据存储

为了实现数据存储，StatefulSet 需要创建持久卷声明，一个 StatefulSet 可以拥有一个或多个持久卷声明模板，在 Pod 创建之前会先创建这些 PVC 并作为 volume 绑定到 Pod 上。因为默认声明了 PVC 因此必须要有 PV 来提供存储，给定 Pod 的存储可以由 PVC 模板指定的 StorageClass 自动创建，也可以由集群管理员预先提供。

另外在删除或者伸缩 StatefulSet 时并不会自动删除它关联的存储卷，必须要要手动删除，这样做主要是为了保证数据安全，避免数据误删。


### 5. DaemonSet

DeamonSet 确保全部（或者某些）节点上运行一个 Pod 的副本。 当有节点加入集群时， 也会为他们新增一个 Pod 。 当有节点从集群移除时，这些 Pod 也会被回收。删除 DaemonSet 将会删除它创建的所有 Pod。一般用于“监控进程”、“日志收集”或“节点管控”。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          # Key Name
          - key: disktype
            operator: In
            # Value
            values:
            - ssd            
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
```


DaemonSet 默认会在所有节点创建一个 Pod，可以通过 NodeSelector 或者 NodeAffinity 来选择特定的节点部署。

另外设置 Pod 时需要考虑污点和资源设置等情况，比如如果 Pod 想被调度到 master 节点需要设置容忍污点。

```yaml
kind: DaemonSet
metadata:
  name: fluentd-elasticsearch
  namespace: kube-system
  labels:
    k8s-app: fluentd-logging
spec:
  selector:
    matchLabels:
      name: fluentd-elasticsearch
  template:
    metadata:
      labels:
        name: fluentd-elasticsearch
    spec:
      tolerations:
      # this toleration is to have the daemonset runnable on master nodes
      # remove it if your masters can't run pods
      - key: node-role.kubernetes.io/master
        operator: Exists
        effect: NoSchedule
```

### 6. 总结

可以看到 Kubernetes 的控制器基本覆盖了日常使用的大部分场景，通过这些控制器我，原先需要在操作系统层面进行的服务部署、job 创建、配置更改、扩缩容等操作，现在都可以通过不同的 Controller 对象来完成，从这一点来看，说 Kubernetes 是云计算时代的操作系统并不为过。
