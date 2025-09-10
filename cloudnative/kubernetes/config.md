# 配置管理对象

Kubernetes 中配置管理对象主要包含 ConfigMap 和 Secret 两种，分别用来管理普通配置和敏感信息。
### 1. ConfigMap

ConfigMap 是一种 API 对象，用来将非机密性的数据保存到健值对中。使用时可以用作环境变量、命令行参数或者存储卷中的配置文件。ConfigMap 可以让配置信息和容器镜像解耦，便于应用配置的修改。每次应用需要修改配置时，只需要修改 ConfigMap 然后按需重启应用 Pod 即可，不用像修改代码那样还需要重新编译打包、制作镜像等操作。

Kubernetes 支持基于字面量、文件、目录等方式创建 ConfigMap，下面是基于字面量创建一个示例：

```bash
kubectl create configmap special-config --from-literal=special.how=very --from-literal=special.type=charm

$ kubectl get configmaps special-config -o yaml
apiVersion: v1
kind: ConfigMap
metadata:
  creationTimestamp: 2016-02-18T19:14:38Z
  name: special-config
  namespace: default
  resourceVersion: "651"
  selfLink: /api/v1/namespaces/default/configmaps/special-config
  uid: dadce046-d673-11e5-8cd0-68f728db1985
data:
  special.how: very
  special.type: charm
```


ConfigMap 创建后可以在可以作为卷直接挂载到 Pod ，也可以用来声明环境变量：

**作为环境变量使用**

可以引入指定的键值对作为环境变量，也可以引入所有的键值对作为环境变量。

```yaml
spec:
  containers:
    - name: test-container
      image: k8s.gcr.io/busybox
      command: [ "/bin/sh", "-c", "env" ]
      env:
        - name: SPECIAL_LEVEL_KEY
          valueFrom:
            configMapKeyRef:
              name: special-config
              key: special.how
      envFrom:
      - configMapRef:
          name: special-config
  restartPolicy: Never
```


**直接挂载卷使用**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: dapi-test-pod
spec:
  containers:
    - name: test-container
      image: k8s.gcr.io/busybox
      command: [ "/bin/sh", "-c", "ls /etc/config/" ]
      volumeMounts:
      - name: config-volume
        mountPath: /etc/config
  volumes:
    - name: config-volume
      configMap:
        name: special-config
  restartPolicy: Never
```


### 2. Secret

ConfigMap 一般用来管理与存储普通配置，而 Secret 是用来管理和保存敏感的信息，例如密码、OAuth 令牌、ssh 密钥等。使用 Secret 来保存这些信息会比动态地添加到 Pod 定义或者是使用 ConfigMap 更加具备安全性和灵活性。

和 ConfigMap 一样，Secret 也支持基于字面量、文件等方式创建， 另外 Kubernetes 提供了不同类型的 Secret：

- **Generic**：通用类型，可以基于文件、字面量、目录创建。
- **tls**：用来创建 TLS 加密用的 Secret，需要指定 key 和证书。
- **docker-registry**：创建访问私有镜像仓库使用的 Secret，可以将访问镜像仓库所需要的认证信息封装进 Secret。然后当 Pod 中的镜像需要从私有镜像仓库拉取时就可以使用该 Secret 了。 

下面是创建一个 docker-registry 类型的 Secret 的示例：

```yaml
kubectl create secret docker-registry regcred --docker-server=<your-registry-server> --docker-username=<your-name> --docker-password=<your-pword> --docker-email=<your-email>
```

创建后可以在 Pod 中使用：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: private-reg
spec:
  containers:
  - name: private-reg-container
    image: <your-private-image>
  imagePullSecrets:
  - name: regcred

---

apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
  - name: mypod
    image: redis
    volumeMounts:
    - name: foo
      mountPath: "/etc/foo"
  volumes:
  - name: foo
    secret:
      secretName: mysecret
      defaultMode: 0400
```

对于普通的 Secret，可以像 ConfigMap 作为环境变量或者卷在 Pod 中使用。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
  - name: mypod
    image: redis
    volumeMounts:
    - name: foo
      mountPath: "/etc/foo"
  volumes:
  - name: foo
    secret:
      secretName: mysecret
      defaultMode: 0400
```

Secret 中存储的值都是经过 base64 编码后的值，下面是创建一个 Secret 的示例：

```bash
$ kubectl create secret generic prod-db-secret \
  --from-literal=username=produser \
  --from-literal=password=Y4nys7f11
secret/prod-db-secret created
username:  8 bytes

$ kubectl get secrets prod-db-secret -o yaml
apiVersion: v1
data:
  password: WTRueXM3ZjEx
  username: cHJvZHVzZXI=
kind: Secret
metadata:
  name: prod-db-secret
  namespace: default
type: Opaque
```

Secret 中存储的值都是经过 base64 编码后的值，可以通过 base64 解码获取到实际的值：

```bash
$ echo "WTRueXM3ZjEx" | base64 -d
Y4nys7f11%

$ echo "cHJvZHVzZXI=" | base64 -d
produser%
```


可以看到 Secret 本身提供的安全性是有限的，如果能拿到 Secret 中的数据是可以通过 Base64 解码来获取实际的信息的。日常使用更多的是围绕 Secret 的安全实践，比如避免将敏感数据直接写到代码仓库，因此抽取到 Secret。

另外只有某节点的 Pod 用到 Secret 时其才会被发送到对应节点，可以设置 Secret 写到内存而不是磁盘，这样 Pod 停止后 Secret 数据也会被删除。

Kubernetes 组件与 api-server 之间的通信一般都是受 TLS 保护的，因此 Secret 在组件之间传输时也是安全的，Pod 之间无法共享 Secret，可以在 Pod 级别构建安全分区来保证只有需要的容器才能访问到 Secret。



