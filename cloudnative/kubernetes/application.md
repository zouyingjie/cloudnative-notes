# 应用封装与扩展

### 1. Kustomize

当我们需要在 Kubernetes 部署应用时，往往是编写许多 yaml 文件来部署各种资源对象，并且同一个应用针对不同的环境可能需要编写不同的 yaml 文件，这个过程往往非常繁琐。

为了解决这个问题 Kubernetes 推出了 [Kustomize](https://kustomize.io/) 工具，官方称为 Kubernetes 原生配置管理工具。Kustomize 将我们应用部署所需要的信息分为不变的 base 配置和容易变化 overlay 配置，最终将文件合起来成为一个完整的定义文件。类似于 Docker 镜像分层的概念，最终所有的层次合并起来成为一个完整的应用镜像。

Kustomize 最常见的用途就是根据不同的环境生成不同的部署文件，在基准 base 文件的基础上，定义不同的 Overlay 文件，在通过 Kustomization 文件的定义进行整合。
- base 文件，基准 yaml 文件
- overlay 文件，针对不同需求设置的 yaml 文件
- Kustomization.yaml：整合 base 和 overlay 以生成完整的部署配置。

kubectl 命令已经内置了 kustomize 命令，当我们定义好上述文件后，可以通过 kubectl kustomize overlays/dev 查看生成的部署内容，通过  `kubectl apply -k overlays/dev`直接执行部署。

下面是一个简单的示例，我们部署一个应用，在测试环境部署一个 1 个副本并且使用 test 镜像，在生产环境部署 5 个副本并使用最新的镜像。正常情况下我们需要定义两个完整的 yaml 文件分别去生产和测试环境部署，如果使用 Kustomize 可以想下面这样定义：

```bash
$ tree app
app
|-- base
|   |-- deployment.yml
|   |-- kustomization.yaml
|   |-- service.yaml
`-- overlays
    |-- dev
    |   |-- deployment.yml
    |   `-- kustomization.yaml
    `-- prod
        |-- deployment.yml
        `-- kustomization.yaml
```

首先我们定义 base 文件以及 kustomization 文件：

- Deployment 文件

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend-deployment
  template:
    metadata:
      labels:
        app: frontend-deployment
    spec:
      containers:
      - name: app
        image: foo/bar:latest
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
```

- Service 文件

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  ports:
  - name: http
    port: 8080
  selector:
    app: frontend-deployment
```

- Kustomization 文件

通过该文件将所有 base 文件整合后统一部署。

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- deployment.yml
- service.yaml
```

通过 ``kubectl kustomize``命令查看最终导出的部署文件内容。

```yaml
$ kubectl kustomize kustomize/base
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  ports:
  - name: http
    port: 8080
  selector:
    app: frontend-deployment
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend-deployment
  template:
    metadata:
      labels:
        app: frontend-deployment
    spec:
      containers:
      - image: foo/bar:latest
        name: app
        ports:
        - containerPort: 8080
          name: http
          protocol: TCP
```


有了 base 后我们针对 dev 和 prod 环境做不同的设置，

- test 环境，设置副本为 1，镜像为 test

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 1
  template:
    spec:
      containers:
      - image: foo/bar:test
        name: app


apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
- ../../base
patchesStrategicMerge:
- deployment.yml
```

完成后通过 `kubectl kustomize overlays/dev` 查看

```yaml
$ kubectl kustomize overlays/dev
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  ports:
  - name: http
    port: 8080
  selector:
    app: frontend-deployment
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend-deployment
  template:
    metadata:
      labels:
        app: frontend-deployment
    spec:
      containers:
      - image: foo/bar:test
        name: app
        ports:
        - containerPort: 8080
          name: http
          protocol: TCP
```


可以看到副本是 1，镜像 tag 是 test，此时执行  `kubectl apply -k overlays/dev` 命令就可以直接部署上述配置了。

通过 kustomize 我们可以将部署所需的文件在 base 里面一次写好，后续不同的开发、运维人员如果不用不同的配置，只需要增加 overlay 来打补丁就行了。使用 overlay 打补丁的好处时既不会像 Ansible 那样需要通过字符替换对元文件造成入侵，也不需要学习额外的 DSL 语法。只需要定义好 yaml 通过一条命令就可以将方服务一次性部署好。

Kustomize 还可以生成 ConfigMap、Secret 等对象，具体细节可以参考 文档，另外通过 https://kustomize.io/tutorial 可以通过上传自己的 yaml 文件然后在线编辑生成 kustomize 文件。

### 2. Helm

Kustomize 本身可以使我们以相对便捷的方式分离开发和运维工作，优点是轻量便捷，但其功能也相对不足。虽然能简化对不同场景下的重复配置，但其实我们该写的配置还是要写，只是不用重复写而已，并且除了安装部署外，应用还有更新、回滚、多版本、依赖项维护等操作，Kustomize 无法完善的提供。

为了解决 Kubernetes 中应用部署维护的问题，后续出现了 [Helm](https://helm.sh/) ，其定位很简单：

> 操作系统中都有包管理器，比如 ubuntu 有 apt-get 和 dpkg 格式的包，RHEL 系的有 yum 和 RPM 格式的包，而 Kubernetes 作为云原生时代的操作系统，Helm 就是要成为这个操作系统的应用包管理工具。

Helm 提供格式为 chart 的包管理，通过 Helm 包管理器，我们可以很方便的从应用仓库下载、安装部署、升级、回滚、卸载程序，并且仓库中有完整的依赖管理和版本变更信息

关于具体操作可以参考 [官方文档](https://helm.sh/docs/) 和动物园的书籍  [《Learning Helm》](https://learning.oreilly.com/library/view/learning-helm/9781492083641/)，中文翻译版叫《Helm学习指南：Kubernetes上的应用程序管理》，这里仅做一个入门性质的介绍。

#### 2.1 应用安装

首先看一下如何使用 helm 来安装、部署应用，我们可以用 apt-get 的作对比，在 Ubuntu 安装某应用时，我们需要添加某个仓库地址，然后执行 `sudo apt-get update`，完成后才会执行 `sudo apt-get install <name>` 安装应用。Helm 的使用和 apt-get 命令的步骤基本一致，如下：

1. 添加仓库并更新

```bash
$ helm repo add bitnami https://charts.bitnami.com/bitnami
"bitnami" has been added to your repositories

$ helm repo update
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "bitnami" chart repository
Update Complete. ⎈Happy Helming!⎈
```

2. 安装应用

```bash
$ helm install bitnami/mysql --generate-name
NAME: mysql-1638139621
LAST DEPLOYED: Mon Nov 29 06:47:04 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
CHART NAME: mysql
CHART VERSION: 8.8.13
APP VERSION: 8.0.27

** Please be patient while the chart is being deployed **

Tip:
    ....
```

3. 查看应用状态

```bash

$ helm list
NAME            	NAMESPACE	REVISION	UPDATED                                	STATUS  	CHART            	APP VERSION
mysql-1638139621	default  	1       	2021-11-29 06:47:04.581748474 +0800 CST	deployed	mysql-8.8.13     	8.0.27

$ helm status mysql-1638139621
NAME: mysql-1638139621
LAST DEPLOYED: Mon Nov 29 06:47:04 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
CHART NAME: mysql
CHART VERSION: 8.8.13
APP VERSION: 8.0.27

** Please be patient while the chart is being deployed **

Tip:

  Watch the deployment status using the command: kubectl get pods -w --namespace default

Services:

  echo Primary: mysql-1638139621.default.svc.cluster.local:3306
...
```

当然我们也可以直接查看 Kubernetes 的对象

```bash
$ kubectl get statefulsets.apps
NAME               READY   AGE
mysql-1638139621   0/1     13s
```

4. 卸载应用

```bash
$ helm uninstall mysql-1638139621
release "mysql-1638139621" uninstalled

$ kubectl get statefulsets.apps
No resources found in default namespace.
```


#### 2.2 应用创建

Helm 有三个主要概念：

- **Chart**：Helm 提出的包封装格式，就是 Ubuntu 中的 dpkg 包一样，用来封装我们的应用，包含所有的依赖信息。比如我们上面安装的 MySQL，就是一个完整的 Chart。
- **Release**: 相当于版本，Kubernetes 经常针对一个应用部署多个版本，每个版本就是一个 Release。
- **Repository**：应用仓库，用来存储 Chart。

下面简单看下如何编写一个 Chart 

1. 创建 chart

Helm 提供了 create 命令供我们快速创建 chart。

```bash
$ helm create  my-app
Creating my-app

$ tree my-app
my-app
|-- charts
|-- Chart.yaml
|-- templates
|   |-- deployment.yaml
|   |-- _helpers.tpl
|   |-- hpa.yaml
|   |-- ingress.yaml
|   |-- NOTES.txt
|   |-- serviceaccount.yaml
|   |-- service.yaml
|   `-- tests
|       `-- test-connection.yaml
`-- values.yaml
```

指定名称执行命令后会自动生成同名目录以及相关文件：

- **charts 目录**: 存储依赖的 chart
- **Chart.yaml**：存放 chart 的元信息以及一些 chart 空间。
- **template 目录**：存放最终生成 Kubernetes 清单 yaml 的模板文件
- **template.test**: 测试文件，不会被按安装到集群中，可以由 helm test 执行测试。
- **values.yaml**：定义值，在 helm 渲染模板时传递给模板覆盖默认值。

默认生成的 chart 是一个 Nginx 的应用，我们可以直接安装运行

```bash
$ helm install nginx-1-16  .
NAME: nginx-1-16
LAST DEPLOYED: Tue Nov 30 06:17:38 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=my-app,app.kubernetes.io/instance=nginx-1-16" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace default $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace default port-forward $POD_NAME 8080:$CONTAINER_PORT

$ kubectl get deployments.apps
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
nginx-1-16-my-app     1/1     1            1           56s
```


可以看到 Nginx 的 Deployment 已经创建好了。下面是它的 Deployment 的模板和 values.yaml 部分内容：

- templates/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "my-app.selectorLabels" . | nindent 6 }}
  template:
    metadata:
```

- values.yaml

```yaml
# Default values for my-app.
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.

replicaCount: 1

image:
  repository: nginx
  pullPolicy: IfNotPresent
  # Overrides the image tag whose default is the chart appVersion.
  tag: ""

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""
```

可以看到最终部署的对象是基于 template 和 values 渲染出来的。现在我们需要部署一个 3 节点的 Nginx ，将 values.yaml 中的 replicaCount 改成 3 然后执行部署。

```yaml

```bash
$ cd ~/helm-chart/my-app$ kubectl get deployments.apps
$ helm install nginx-1-16-3 .
NAME: nginx-1-16-33
LAST DEPLOYED: Tue Nov 30 22:08:47 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=my-app,app.kubernetes.io/instance=nginx-1-16-3" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace default $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace default port-forward $POD_NAME 8080:$CONTAINER_PORT



$ cd ~/helm-chart/my-app$ kubectl get deployments.apps
NAME                   READY   UP-TO-DATE   AVAILABLE   AGE

nginx-1-16-3-my-app   3/3     3            3           7s
```

可以看到我们修改之后副本为 3 个的新的 chart 已经部署好了。

#### 2.3 应用发布

Chart 写好后我们就可以发布到存储库了，所有 chart 的存储库都含有一个 index.yaml 索引文件，记录了所有可用的 chart 及其版本以及各自的下载位置。下面是一个 index.yaml 的实例：

```yaml
apiVersion: v1
entries:
  first-chart:
  - apiVersion: v2
    appVersion: 1.16.0
    created: "2021-11-30T06:46:36.769746109+08:00"
    description: A Helm chart for Kubernetes
    digest: 5dff0cfeafa00d9a87e9989586de3deda436a05fca118df03aa3469221866a8d
    name: first-chart
    type: application
    urls:
    - src/first-chart-0.1.0.tgz
    version: 0.1.0
  my-app:
  - apiVersion: v2
    appVersion: 1.16.0
    created: "2021-11-30T06:46:36.770983392+08:00"
    description: A Helm chart for Kubernetes
    digest: 8256153f37ed0071e81fa2fe914e7bcf82e914bec951dadc5f2645faa38c4021
    name: my-app
    type: application
    urls:
    - src/my-app-0.2.0.tgz
    version: 0.2.0
  - apiVersion: v2
    appVersion: 1.16.0
    created: "2021-11-30T06:46:36.770313312+08:00"
    description: A Helm chart for Kubernetes
    digest: c2865e2c9d0a74044b7d8ff5471df7fd552bc402b5240e01cf02e116ee5f800e
    name: my-app
    type: application
    urls:
    - src/my-app-0.1.0.tgz
    version: 0.1.0
generated: "2021-11-30T06:46:36.768952982+08:00"
```

可以看到该库包含了 first-chart 和 my-app 两个 chart，my-app 有两个版本分别是 0.1.0 和 0.2.0，并且包含了各个版本的 url 下载路径。

我们可以使用 [ChartMuseum](https://chartmuseum.com/)、Google 云端存储或者自己搭建静态 web 服务器来实现存储库，如果 Chart 可以公开的话 Github Pages 也是一个非常好的选择。下面以 Github Pages 为例看下如何使用存储库：

1. 创建 Github repo 并设置 Pages

首先我们在 Github 创建一个 public 仓库
![在这里插入图片描述](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/9946f2d8888386e62d8dab342e8cc41f.png)

一个仓库创建完成后设置 Pages，选择 main 分支，表示每次 main 分支更新时都会重新部署 Github Pages 站点，如果有自定义的域名也可以设置域名。这里设置的域名是 https://zouyingjie.cn/naive-charts-repo/。

![在这里插入图片描述](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/9aa32d354e49a1e67bfc09877c6315eb.png)




2. 添加 chart 到存储库

Github 仓库创建完成后，我们可以 clone 到本地然后添加 index.yaml 文件以及 Chart，将其转为真正的 chart 存储库。


- Clone 项目 并创建 Chart

```bash
$ git clone https://github.com/zouyingjie/naive-charts-repo.git
Cloning into 'naive-charts-repo'...
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
Unpacking objects: 100% (3/3), done.

$ cd naive-charts-repo
$ mkdir src

$ helm create src/naive-nginx
Creating src/naive-nginx

$ ll
total 8.0K
-rw-rw-r-- 1 ubuntu ubuntu   19 Nov 30 22:30 README.md
drwxrwxr-x 3 ubuntu ubuntu 4.0K Nov 30 22:32 src

$ ll src
total 4.0K
drwxr-xr-x 4 ubuntu ubuntu 4.0K Nov 30 22:32 naive-nginx
```


- 打包 Chart 并创建 index.yaml

创建chart 后可以通过 helm package 命令打包并通过 helm repo index 命令自动生成 index.yaml 文件。

```bash
$ helm package src/naive-nginx
Successfully packaged chart and saved it to: /home/ubuntu/naive-charts-repo/naive-nginx-0.1.0.tgz

$ ll
total 12K
-rw-rw-r-- 1 ubuntu ubuntu   19 Nov 30 22:30 README.md
-rw-rw-r-- 1 ubuntu ubuntu 3.7K Nov 30 22:33 naive-nginx-0.1.0.tgz
drwxrwxr-x 3 ubuntu ubuntu 4.0K Nov 30 22:32 src



# 自动生成 index.yaml 文件

$ helm repo index .
$ ll
total 16K
-rw-rw-r-- 1 ubuntu ubuntu   19 Nov 30 22:30 README.md
-rw-r--r-- 1 ubuntu ubuntu  404 Nov 30 22:35 index.yaml
-rw-rw-r-- 1 ubuntu ubuntu 3.7K Nov 30 22:33 naive-nginx-0.1.0.tgz
drwxrwxr-x 3 ubuntu ubuntu 4.0K Nov 30 22:32 src
```

新生成的 index.yaml 文件内容如下：

```yaml
apiVersion: v1
entries:
  naive-nginx:
  - apiVersion: v2
    appVersion: 1.16.0
    created: "2021-11-30T22:35:53.796835302+08:00"
    description: A Helm chart for Kubernetes
    digest: 5900f92fc1c6e453b48b36f74d04a475d4694e16a9e60e1b04a449558337b525
    name: naive-nginx
    type: application
    urls:
    - naive-nginx-0.1.0.tgz
    version: 0.1.0
generated: "2021-11-30T22:35:53.796044446+08:00"
```


完成后可以将新创建的所有文件 commit 并 push 到 Github  仓库，提交完成后我们就可以使用 Github Pages 做 chart 存储库了。

现在可以将 Github Page 的存储库添加到本地存储库了：

```bash
$ helm repo add naive-gh-repo https://zouyingjie.cn/naive-charts-repo/
"naive-gh-repo" has been added to your repositories

$ helm repo list
NAME         	URL
bitnami      	https://charts.bitnami.com/bitnami
naive-gh-repo	https://zouyingjie.cn/naive-charts-repo/


$ helm repo update
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "naive-gh-repo" chart repository
...Successfully got an update from the "bitnami" chart repository
Update Complete. ⎈Happy Helming!⎈
```


添加完仓库就可以安装 Chart ，执行 `helm install <name>  <chart-name>` 安装

```bash
$ helm install naive-nginx-v01  naive-gh-repo/naive-nginx
NAME: naive-nginx-v01
LAST DEPLOYED: Tue Nov 30 22:54:49 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=naive-nginx,app.kubernetes.io/instance=naive-nginx-v01" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace default $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace default port-forward $POD_NAME 8080:$CONTAINER_PORT

$ kubectl get pods
NAME                                    READY   STATUS             RESTARTS   AGE
naive-nginx-v01-696948788d-cjq5z        1/1     Running            0          7s
```


现在将 naive-nginx 中的 replicaCount 改为 3，并将 Chart.yaml 中的版本改为 0.2.0 我们在发布一个 0.2.0 的包并重新生成 index.yaml：

```bash
$ helm package src/naive-nginx
Successfully packaged chart and saved it to: /home/ubuntu/CKAD-note/naive-charts-repo/naive-nginx-0.2.0.tgz

$ helm repo index .

$ cat index.yaml
apiVersion: v1
entries:
  naive-nginx:
  - apiVersion: v2
    appVersion: 1.16.0
    created: "2021-11-30T23:02:48.05121892+08:00"
    description: A Helm chart for Kubernetes
    digest: 466755358c9c3e7ba36497c57485ba98754302d483b0c73a9a79565a3465d739
    name: naive-nginx
    type: application
    urls:
    - naive-nginx-0.2.0.tgz
    version: 0.2.0
  - apiVersion: v2
    appVersion: 1.16.0
    created: "2021-11-30T23:02:48.049967356+08:00"
    description: A Helm chart for Kubernetes
    digest: 5900f92fc1c6e453b48b36f74d04a475d4694e16a9e60e1b04a449558337b525
    name: naive-nginx
    type: application
    urls:
    - naive-nginx-0.1.0.tgz
    version: 0.1.0
generated: "2021-11-30T23:02:48.049169158+08:00"
```


现在将新的包和 index.yaml 文件 push 到仓库中，在执行 helm repo update 更新本地存储，现在在执行安装默认就会安装最新版本的有 3 个副本的  Chart 了。

```bash
$ helm install naive-nginx  naive-gh-repo/naive-nginx
NAME: naive-nginx
LAST DEPLOYED: Tue Nov 30 23:06:14 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=naive-nginx,app.kubernetes.io/instance=naive-nginx" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace default $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace default port-forward $POD_NAME 8080:$CONTAINER_PORT


$ kubectl get pods
NAME                                    READY   STATUS             RESTARTS   AGE
naive-nginx-784f55b8d4-bbxpq            1/1     Running            0          5s
naive-nginx-784f55b8d4-mkv5m            1/1     Running            0          5s
naive-nginx-784f55b8d4-xpcpz            1/1     Running            0          5s
```


此时如果我们想安装 0.1.0 版本的，需要在安装时通过 --version 参数指明版本：

```bash
$ helm install naive-nginx-v01  naive-gh-repo/naive-nginx --version=0.1.0
NAME: naive-nginx-v01
LAST DEPLOYED: Tue Nov 30 23:06:43 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=naive-nginx,app.kubernetes.io/instance=naive-nginx-v01" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace default $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace default port-forward $POD_NAME 8080:$CONTAINER_PORT

$ kubectl get deployments.apps
NAME                   READY   UP-TO-DATE   AVAILABLE   AGE
naive-nginx            3/3     3            3           3m30s
naive-nginx-v01        1/1     1            1           3m1s
```


最后如果我们不在需要存储库了可以将其删除

```bash
$ helm repo remove naive-gh-repo
"naive-gh-repo" has been removed from your repositories
```


### 3. CRD & Operator

之前看的 Pod、Service、Deployment 都是 Kubernetes 自己提供的资源对象。除了自身提供的资源对象，Kubernetes 还提供的 CustomResourceDefinition 对象使我们自定义资源对象，从而实现对 Kubernetes 的扩展。

#### 3.1 CustomResourceDefinition

为了创建自定义对象，我们需要先来定义其对象的格式，也就是创建 CRD，示例如下：

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  # name must match the spec fields below, and be in the form: <plural>.<group>
  name: crontabs.stable.example.com
spec:
  # group name to use for REST API: /apis/<group>/<version>
  group: stable.example.com
  # list of versions supported by this CustomResourceDefinition
  versions:
    - name: v1
      # Each version can be enabled/disabled by Served flag.
      served: true
      # One and only one version must be marked as the storage version.
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                cronSpec:
                  type: string
                image:
                  type: string
                replicas:
                  type: integer
  # either Namespaced or Cluster
  scope: Namespaced
  names:
    # plural name to be used in the URL: /apis/<group>/<version>/<plural>
    plural: crontabs
    # singular name to be used as an alias on the CLI and for display
    singular: crontab
    # kind is normally the CamelCased singular type. Your resource manifests use this.
    kind: CronTab
    # shortNames allow shorter string to match your resource on the CLI
    shortNames:
    - ct
```

- **versions**  自定义对象的版本，可以定义多个，这里最重要的是 schema 字段，用来定义我们的自定义对象的结构，采用 OpenAPI 3.0 规范进行校验，写过 swagger API 的同学应该会比较熟悉其结构。像上面的例子，我们的自定义对象有 cronSpec、image、replica 三个字段，前两个是 string 类型，replicas 是整数类型。
- **names** ： 就是我们自定义对象的名称，如同内置资源对象的名称、缩写一样。

```bash
$ kubectl apply -f crontab.yaml
customresourcedefinition.apiextensions.k8s.io/crontabs.stable.example.com created


$ kubectl api-resources
                          
NAME            SHORTNAMES   APIVERSION                  NAMESPACED   KIND
pods            po           v1                          true         Pod
deployments     deploy       apps/v1                     true    Deployment
crontabs        ct           stable.example.com/v1       true       CronTab
```

CRD 创建完成后，可以看到 api-resources 里就多了  CronTab 的资源。现在我们就可以创建该
对象了：

```bash
apiVersion: "stable.example.com/v1"
kind: CronTab
metadata:
  name: my-new-cron-object
spec:
  cronSpec: "* * * * */5"
  image: my-awesome-cron-image
  replicas: 5


$ kubectl apply -f new-crontab.yaml
crontab.stable.example.com/my-new-cron-object created

$ kubectl get crontabs
NAME                 AGE
my-new-cron-object   64s


$ kubectl get ct
NAME                 AGE
my-new-cron-object   67s
```


最后我们还可以删除 CRD 对象，CRD 删除后对应的所有自定义对象也会被一起删除。

```bash
$ kubectl delete customresourcedefinition crontabs.stable.example.com
customresourcedefinition.apiextensions.k8s.io "crontabs.stable.example.com" deleted
```
仅仅定义了 CRD 以及自定义对象，还无法做到非常好的扩展。Kubernetes 的内置对象，比如 Deployment 之所以能执行滚动升级，是因为有对应的控制器在执行状态拟合。对于 CRD 也一样，我们的自定义对象也需要一个控制器来执行操作，这是由 Operator 提供的。

#### 3.2 创建部署 Operator

> Operator是使用自定义资源（CR，Custom Resource，是CRD的实例），管理应用及其组件的
> 自定义Kubernetes控制器。高级配置和设置由用户在CR中提供。Kubernetes Operator基于嵌
> 入在Operator逻辑中的最佳实践将高级指令转换为低级操作。Kubernetes
> Operator监视CR类型并采取特定于应用的操作，确保当前状态与该资源的理想状态相符。--- Red Hat

简单来说：`Operator = CRD + Controller。`

Kubernetes 本身提供的资源对象和控制器只能对最通用的操作做抽象，比如 CronJob 执行定时任务，Deployment 执行滚动升级等。但对于应用特定操作 Kubernetes 是做不到的，比如在 kubernetes 部署一个 3 节点ElasticSearch 集群，需要将 StatefulSet、ConfigMap、Service 文件等悉数配置好才可以成功。之所以要详细配置是因为 Kubernetes 并不知道如何将 ElasticSearch 部署为一个集群，但如果 kubernetes 本身有一个 ElasticSearch 的资源对象，并且有控制器基于该资源对象进行状态拟合，那我们可以很方便将部署 ElasticSearch 集群这些“高级指令”转化为 Kubernetes 可以执行的的 “低级操作”。

```yaml
apiVersion: elasticsearch.k8s.elastic.co/v1
kind: Elasticsearch
metadata:
  name: quickstart
spec:
  version: 7.15.2
  nodeSets:
  - name: default
    count: 3
    config:
      node.store.allow_mmap: false
```


目前 operator 是一种非常流行的 Kubernetes 方式，大量复杂的分布式系统都提供了 Operator，可以参考 [awesome-operators](https://github.com/operator-framework/awesome-operators)。

Operator 目前最大的问题在于编写起来比较麻烦，因为要封装大量的应用，以 etcd 为例，虽然其功能并不算复杂，但光是实现集群的创建删除、扩缩容、滚动更新等功能代码就已经超过了一万行，编写起来还是有一定的门槛。

为了方便开发 Operator，社区也有了不少工具来简化我们的工作，目前最常用的工具是两个：

- **kubebuilder**: kubernetes-sigs 发布的脚手架工具，帮助我们快速搭建 operator 项目。
- **Operator framework**: Red Hat 发布的 operator 开发工具，目前已经加入了 CNCF landscape。

关于两者的比较，可以参考 [这篇文章](https://tiewei.github.io/posts/kubebuilder-vs-operator-sdk)。这里我们简单看下如何通过 operator-framework 来开发一个 operator。

1. 初始化项目

首先是初始化项目，我们先创建一个monkey-operator 创 项目目录，然后执行 `operator-sdk init`行 命令初始化项目。operator-framework 会将项目所需的基本骨架给创建好。
·

```bash
➜  monkey-operator operator-sdk init --domain example.com --repo github.com/example/monkey-operator
Writing kustomize manifests for you to edit...
Writing scaffold for you to edit...
Get controller runtime:
$ go get sigs.k8s.io/controller-runtime@v0.9.2
go: downloading sigs.k8s.io/controller-runtime v0.9.2
go: downloading k8s.io/apimachinery v0.21.2
go: downloading k8s.io/client-go v0.21.2
go: downloading k8s.io/component-base v0.21.2
go: downloading golang.org/x/time v0.0.0-20210611083556-38a9dc6acbc6
go: downloading sigs.k8s.io/structured-merge-diff/v4 v4.1.0
go: downloading k8s.io/api v0.21.2
go: downloading k8s.io/apiextensions-apiserver v0.21.2
go: downloading golang.org/x/sys v0.0.0-20210603081109-ebe580a85c40
Update dependencies:
$ go mod tidy
Next: define a resource with:
$ operator-sdk create api
```


2. 创建 CRD
  
项目创建完成后就可以创建 CRD 了，执行 `operator-sdk create api` 执行命令指定 group、version以及 kind。这里我们创建一个 MonkeyPod 的 CRD。

```bash
➜  monkey-operator operator-sdk create api --group monkey --version v1alpha1  --kind 

MonkeyPod --resource --controller
Writing kustomize manifests for you to edit...
Writing scaffold for you to edit...
api/v1alpha1/monkeypod_types.go
controllers/monkeypod_controller.go
Update dependencies:
$ go mod tidy
Running make:
$ make generate
go: creating new go.mod: module tmp
Downloading sigs.k8s.io/controller-tools/cmd/controller-gen@v0.6.1
go: downloading sigs.k8s.io/controller-tools v0.6.1
go: downloading golang.org/x/tools v0.1.3
go get: added sigs.k8s.io/controller-tools v0.6.1
/home/ubuntu/monkey-operator/bin/controller-gen object:headerFile="hack/boilerplate.go.txt" paths="./..."
```


完成后项目的目录结构如下

```bash
➜  monkey-operator tree
.
├── Dockerfile
├── Makefile
├── PROJECT
├── api
│   └── v1alpha1
│       ├── groupversion_info.go
│       ├── monkeypod_types.go
│       └── zz_generated.deepcopy.go
├── bin
│   └── controller-gen
├── config
│   ├── crd
│   │   ├── kustomization.yaml
│   │   ├── kustomizeconfig.yaml
│   │   └── patches
│   │       ├── cainjection_in_monkeypods.yaml
│   │       └── webhook_in_monkeypods.yaml
│   ├── default
│   │   ├── kustomization.yaml
│   │   ├── manager_auth_proxy_patch.yaml
│   │   └── manager_config_patch.yaml
│   ├── manager
│   │   ├── controller_manager_config.yaml
│   │   ├── kustomization.yaml
│   │   └── manager.yaml
│   ├── manifests
│   │   └── kustomization.yaml
│   ├── prometheus
│   │   ├── kustomization.yaml
│   │   └── monitor.yaml
│   ├── rbac
│   │   ├── auth_proxy_client_clusterrole.yaml
│   │   ├── auth_proxy_role.yaml
│   │   ├── auth_proxy_role_binding.yaml
│   │   ├── auth_proxy_service.yaml
│   │   ├── kustomization.yaml
│   │   ├── leader_election_role.yaml
│   │   ├── leader_election_role_binding.yaml
│   │   ├── monkeypod_editor_role.yaml
│   │   ├── monkeypod_viewer_role.yaml
│   │   ├── role_binding.yaml
│   │   └── service_account.yaml
│   ├── samples
│   │   ├── kustomization.yaml
│   │   └── monkey_v1alpha1_monkeypod.yaml
│   └── scorecard
│       ├── bases
│       │   └── config.yaml
│       ├── kustomization.yaml
│       └── patches
│           ├── basic.config.yaml
│           └── olm.config.yaml
├── controllers
│   ├── monkeypod_controller.go
│   └── suite_test.go
├── go.mod
├── go.sum
├── hack
│   └── boilerplate.go.txt
└── main.go
```

这里最主要的是两个目录：

- apis 目录：CRD 对象的定义目录，我们创建的 MonkeyPod 会在这里自动生成对象定义：

```bash
// MonkeyPod is the Schema for the monkeypods API
type MonkeyPod struct {
  metav1.TypeMeta   `json:",inline"`
  metav1.ObjectMeta `json:"metadata,omitempty"`

  Spec   MonkeyPodSpec   `json:"spec,omitempty"`
  Status MonkeyPodStatus `json:"status,omitempty"`
}
```
我们可以根据需要在这里定义好 CRD，然后自动生成 yaml 文件，这样就不用手动编写复杂的 yaml 文件了。这里我将 MonkeyPod 的 Spec 和 Status 替换为 Pod 的对象：


```bash
import (
  corev1 "k8s.io/api/core/v1"

)

// EDIT THIS FILE!  THIS IS SCAFFOLDING FOR YOU TO OWN!
// NOTE: json tags are required.  Any new fields you add must have json tags for the fields to be serialized.

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status

// MonkeyPod is the Schema for the monkeypods API
type MonkeyPod struct {
  metav1.TypeMeta   `json:",inline"`
  metav1.ObjectMeta `json:"metadata,omitempty"`

  Spec   corev1.PodSpec  `json:"spec,omitempty"`
  Status corev1.PodStatus `json:"status,omitempty"`
}
```

修改完成后，需要执行如下命令：

```bash
# 重新生成 CRD yaml 文件
➜  monkey-operator make manifests
/home/ubuntu/monkey-operator/bin/controller-gen "crd:trivialVersions=true,preserveUnknownFields=false" rbac:roleName=manager-role webhook paths="./..." output:crd:artifacts:config=config/crd/bases

# 重新生成 go 相关文件
➜  monkey-operator make generate 
/home/ubuntu//operator/monkey-operator/bin/controller-gen object:headerFile="hack/boilerplate.go.txt" paths="./..."
```

- **controller 目录**：这里写的就是具体的控制逻辑，我们编写 operator 时主要的工作量基本都是编写控制逻辑。这里的逻辑非常简单，每当有 MonkeyPod 创建，我们的 controller 会创建同名的 Pod 并打上 "monkey": "stupid-monkey" 标签:

```bash

```go
func (r *MonkeyPodReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
  _ = log.FromContext(ctx)

  // your logic here
  monkeyPod := &monkeyv1alpha1.MonkeyPod{}
  err := r.Get(ctx, req.NamespacedName, monkeyPod)
  pod := &corev1.Pod{
     TypeMeta: metav1.TypeMeta{
        Kind:       "Pod",
        APIVersion: "v1",
     },
     ObjectMeta: metav1.ObjectMeta{
        Name:      monkeyPod.Name,
        Namespace: monkeyPod.Namespace,
     },
  }
  pod.Spec = monkeyPod.Spec
  labels := map[string]string{
     "monkey": "stupid-monkey",
  }
  pod.Labels = labels
  createPod, err := CreatePod(pod)
  fmt.Println(createPod)
  if err != nil {
     return ctrl.Result{}, err
  }
  return ctrl.Result{}, err
}
```


完成后项目有 `make docker-build 和 make deploy` 命令可以创建镜像以及部署。

```bash
$ kubectl get deployments.apps -n monkey-operator-system
NAME                                 READY   UP-TO-DATE   AVAILABLE   AGE
monkey-operator-controller-manager   1/1     1            1           8h


$ kubectl get pods -n monkey-operator-system
NAME                                                  READY   STATUS    RESTARTS   AGE
monkey-operator-controller-manager-674cd8bc69-dgcbj   2/2     Running   0          20m
```

部署完成后创建 一个 MonkeyPod 对象：

```yaml
apiVersion: monkey.example.com/v1alpha1
kind: MonkeyPod
metadata:
  labels:
    run: nginx
  name: nginx
spec:
  containers:
  - image: nginx
    name: nginx
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
```

创建完成后我们的 operator 就会自动创建一个同名的 Pod 并打上标签了：

```bash
$ kubectl describe pod nginx
Name:         nginx
Namespace:    default
Priority:     0
Node:         vm-0-3-ubuntu/172.19.0.3
Start Time:   Sun, 05 Dec 2021 06:26:43 +0800
Labels:       monkey=stupid-monkey
```

以上是 Operator Framework的简单使用，具体操作时还要考虑权限设置等问题，比如我们的例子就需要给 operator 添加 Pod 创建权限，具体操作可以参考 RBAC 部分，这里就不做赘述。

一般来说对于 Operator 的编写更推荐使用 Go 语言编写，可以使用 client-go 库很好的与 Kubernetes 交互。其他语言的话 JavaClient有两个，一个是Jasery，另一个是[Fabric8](https://github.com/fabric8io/kubernetes-client)，后者对 Pod、Deployment 等做了 DSL 定义而且可以用 Builder 模式，写起来也相对方便一些。
