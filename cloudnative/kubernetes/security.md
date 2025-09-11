# 安全机制

本篇对 Kubernetes 中一些安全机制进行介绍，包括 mTLS、身份认证、RBAC 授权以及准入控制等功能。

### 1. mTLS 

在常见的浏览器访问网站的场景下，通过 HTTPS 协议，浏览器作为客户端会对服务器的证书进行验证。而所谓 mTLS（ Mutual TLS）是指在通信时除了客户端会验证服务端证书确认其是否合法之外，服务端也会验证客户端的证书是否合法。
使用 mTLS 有如下优点：

- 可以同时满足加密传输和身份认证
- 独立于应用之外，与具体语言无关

当然 mTLS 也有不足：

- 证书管理过于复杂。假设有一对客户端与服务端通信，如果使用自签名证书我们需要 ca 私钥证书、服务端私钥证书、客户端私钥证书共 6 个文件需要进行管理。如果服务变多证书数量也会随之增多，从而增加管理成本
  
- 证书更新时需要重启应用

Kubernetes 各个组件之间的通信采用的是 mTLS 认证方式，服务端与客户端都需要各自进行身份认证。Kubernetes 中各个组件通信情况如图：

![在这里插入图片描述](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/75137a4fc3694c036151967099b3175e.png)

Server 端包括

- **kube-apiserver**: 外部和 Kubernetes 中的各个组件都是与 api-server 通信。
- **etcd Server**  : apiserver 与 etcd 进行通信。 
- **kubelet server** : api-server 会与 kubelet 通信。

Client 端证书包括：

- **admin**：外部命令行与 apiserver 通信
- **scheduler**: 调度器作为客户端与 apiserver 通信
- **controller manager**：控制器作为客户端与 apiserver 通信
- **kube-proxy**: kube-proxy 作为客户端与 api-server 通信
- **kubelet**： kubelet 与 apiserver 通信

Kubernetes 使用的是自签名证书，以我们使用 kubeadm 为例，在部署时 kubeadm 会自动帮我们生成证书，Kubernetes 用到的证书大致如下：

```bash

ubuntu@sit-01:/etc/kubernetes/ssl$ sudo ls -al /etc/kubernetes/ssl/
total 80
drwxr-xr-x 2 root root 4096 Jan 22 15:21 .
drwxr-xr-x 4 kube root 4096 Jan 22 15:21 ..
-rw-r--r-- 1 root root 1432 Jan 22 14:37 apiserver.crt
-rw-r--r-- 1 root root 1432 Jan 22 14:37 apiserver.crt.old
-rw------- 1 root root 1675 Jan 22 14:37 apiserver.key
-rw------- 1 root root 1675 Jan 22 14:37 apiserver.key.old
-rw-r--r-- 1 root root 1176 Jan 22 14:37 apiserver-kubelet-client.crt
-rw-r--r-- 1 root root 1176 Jan 22 14:37 apiserver-kubelet-client.crt.old
-rw------- 1 root root 1679 Jan 22 14:37 apiserver-kubelet-client.key
-rw------- 1 root root 1679 Jan 22 14:37 apiserver-kubelet-client.key.old
-rw-r--r-- 1 root root 1107 Jan 22 14:37 ca.crt
-rw------- 1 root root 1679 Jan 22 14:37 ca.key
-rw-r--r-- 1 root root 1123 Jan 22 14:37 front-proxy-ca.crt
-rw------- 1 root root 1679 Jan 22 14:37 front-proxy-ca.key
-rw-r--r-- 1 root root 1119 Jan 22 14:37 front-proxy-client.crt
-rw-r--r-- 1 root root 1119 Jan 22 14:37 front-proxy-client.crt.old
-rw------- 1 root root 1679 Jan 22 14:37 front-proxy-client.key
-rw------- 1 root root 1679 Jan 22 14:37 front-proxy-client.key.old
-rw------- 1 root root 1679 Jan 22 14:37 sa.key
-rw------- 1 root root  451 Jan 22 14:37 sa.pub


# ubuntu @ VM-0-7-ubuntu in /etc/kubernetes/pki/etcd 
total 48
drwx------ 2 etcd root 4096 Jan 22 15:20 .
drwx------ 3 etcd root 4096 Jan 22 14:36 ..
-rwx------ 1 etcd root 1704 Jan 22 15:20 admin-sit-01-key.pem
-rwx------ 1 etcd root 1379 Jan 22 15:20 admin-sit-01.pem
-rwx------ 1 etcd root 1708 Jan 22 14:36 ca-key.pem
-rwx------ 1 etcd root 1111 Jan 22 14:36 ca.pem
-rwx------ 1 etcd root 1704 Jan 22 15:20 member-sit-01-key.pem
-rwx------ 1 etcd root 1379 Jan 22 15:20 member-sit-01.pem
-rwx------ 1 etcd root 1704 Jan 22 15:20 node-sit-01-key.pem
-rwx------ 1 etcd root 1375 Jan 22 15:20 node-sit-01.pem
-rwx------ 1 etcd root 1704 Jan 22 15:20 node-sit-02-key.pem
-rwx------ 1 etcd root 1375 Jan 22 15:20 node-sit-02.pem

$ sudo ls -l /var/lib/kubelet/pki
total 12
kubelet-client-2021-11-12-18-30-55.pem
-rw-r--r-- 1 root root 2287 Nov 12 18:30 kubelet.crt
-rw------- 1 root root 1679 Nov 12 18:30 kubelet.key
```

Kubeadm 生成的 ca 证书默认有效期为 10 年，其他证书为 1 年，可以通过 `sudo kubeadm  certs check-expiration` 命令查看证书的过期情况。可以通过自动脚本定时更新或者修改 kubeadm 源码将证书有效期延长。

```bash
$ sudo kubeadm  certs check-expiration
[check-expiration] Reading configuration from the cluster...
[check-expiration] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'

CERTIFICATE                EXPIRES                  RESIDUAL TIME   CERTIFICATE AUTHORITY   EXTERNALLY MANAGED
admin.conf                 Nov 12, 2022 10:30 UTC   354d                                    
apiserver                  Nov 12, 2022 10:30 UTC   354d            ca                      noapiserver-etcd-client    Nov 12, 2022 10:30 UTC   354d            etcd-ca                 
apiserver-kubelet-client   Nov 12, 2022 10:30 UTC   354d            ca                      
controller-manager.conf    Nov 12, 2022 10:30 UTC   354d                                    
etcd-healthcheck-client    Nov 12, 2022 10:30 UTC   354d            etcd-ca                 
etcd-peer                  Nov 12, 2022 10:30 UTC   354d            etcd-ca                 
etcd-server                Nov 12, 2022 10:30 UTC   354d            etcd-ca                 
front-proxy-client         Nov 12, 2022 10:30 UTC   354d               
scheduler.conf             Nov 12, 2022 10:30 UTC   354d                                    

CERTIFICATE AUTHORITY   EXPIRES                  RESIDUAL TIME   EXTERNALLY MANAGED
ca                      Nov 10, 2031 10:30 UTC   9y              no
etcd-ca                 Nov 10, 2031 10:30 UTC   9y              no
front-proxy-ca          Nov 10, 2031 10:30 UTC   9y              no
```


### 2. 认证 

apiserver 收到外部请求时，首先要需要经过一系列的验证后才能确认是否允许请求继续执行。主要有三步：

- 身份认证：Who you are？
- 权限验证：What can you do？
- 准入控制: 请求是否合法？

![在这里插入图片描述](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/72bdd189d04fe67d3e4a6c9f48bacc7a.png)

对于身份验证，Kubernetes 中身份信息可以分为两类：

- **Service Account**：集群内部进行身份认证和授权的服务账户。
- **普通用户**：外部访问集群的用户。
#### 2.1 ServiceAccount
ServiceAccount 是 Kubernetes 内部通信使用的账户信息，每个 namesapce 下都会有一个名为 `default` 的默认 Service Account，在没有单独设置时 Pod 默认使用该 ServiceAccout 作为服务账户。Service Account 会生成对应的 Secret 存储其 token。

```bash
$ kubectl get serviceaccounts
NAME      SECRETS   AGE
default   1         10d

$ kubectl get secrets
NAME                  TYPE                                  DATA   AGE
default-token-c7bv9   kubernetes.io/service-account-token   3      10d


$ kubectl describe secrets default-token-c7bv9
Name:         default-token-c7bv9
Namespace:    default
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: default
              kubernetes.io/service-account.uid: 517fd6b1-6441-4817-bf16-14ef37175da2

Type:  kubernetes.io/service-account-token
Data
====
ca.crt:     1099 bytes
namespace:  7 bytes
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IjFLMkVMNm5mMkFhYmQyMUdCVXp3OGdiZEs1dkdRQ3NNR0JWT0RZblIzYkkifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4tYzdidjkiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjUxN2ZkNmIxLTY0NDEtNDgxNy1iZjE2LTE0ZWYzNzE3NWRhMiIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.C2gGaqrF1effQy_9e48VGh06Ks1ihwR3Q6gHezBBZ51WmD2Sg4Pt0WASZEpJ8swPLXUCo13UaL_y2b3dXOwcjWDOApFsPttDZQtfjiIDn_Wt0RMCKTUNr9ft8_GcM2Xjt8Bnz_mev-NZFwBBJC1vhJn2u-XQLfsp0XiHVTsls0JlPdtZjBOAvlxTQtM9LbMb2o5flEXLCHEGiKNkrYczS7SDNFfrOUNcdDbJHUhifAynOm0bSFIWTG9R0CYHvM3oTJyLSLHuSjqZjpMfNev_4V27AWfSTWg1rwC3Bhj3FNzQSEriQCg1rt9t-Bq58AbJR4vrj2dQa6vT5FP6xQVULA



CA_CERT=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt 
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token) 
NAMESPACE=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace)
```

Pod 会将 Secret 作为卷挂在进来，Service Account 的 Secrets 的 token 文件会被 mount 到 pod 里的下面这个位置。 在 pod 里可以使他们来访问 API，为便于操作可以先在 Pod 里设置几个环境变量。


```bash
$ ls -l /var/run/secrets/kubernetes.io/serviceaccount/

lrwxrwxrwx    1 root  root 13 Aug 31 03:24 ca.crt -> ..data/ca.crt
lrwxrwxrwx    1 root  root 16 Aug 31 03:24 namespace -> ..data/namespace
lrwxrwxrwx    1 root  root 12 Aug 31 03:24 token -> ..data/token
```

我们也可以直接使用该 token 与 apiserver 通信。


```bash
$ curl -k https://172.19.0.7:6443/api
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {

  },
  "status": "Failure",
  "message": "forbidden: User \"system:anonymous\" cannot get path \"/api\"",
  "reason": "Forbidden",
  "details": {

  },
  "code": 403
}

$ curl -k https://172.19.0.7:6443/api -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjFLMkVMNm5mMkFhYmQyMUdCVXp3OGdiZEs1dkdRQ3NNR0JWT0RZblIzYkkifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4tYzdidjkiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjUxN2ZkNmIxLTY0NDEtNDgxNy1iZjE2LTE0ZWYzNzE3NWRhMiIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.C2gGaqrF1effQy_9e48VGh06Ks1ihwR3Q6gHezBBZ51WmD2Sg4Pt0WASZEpJ8swPLXUCo13UaL_y2b3dXOwcjWDOApFsPttDZQtfjiIDn_Wt0RMCKTUNr9ft8_GcM2Xjt8Bnz_mev-NZFwBBJC1vhJn2u-XQLfsp0XiHVTsls0JlPdtZjBOAvlxTQtM9LbMb2o5flEXLCHEGiKNkrYczS7SDNFfrOUNcdDbJHUhifAynOm0bSFIWTG9R0CYHvM3oTJyLSLHuSjqZjpMfNev_4V27AWfSTWg1rwC3Bhj3FNzQSEriQCg1rt9t-Bq58AbJR4vrj2dQa6vT5FP6xQVULA"
{
  "kind": "APIVersions",
  "versions": [
    "v1"
  ],
  "serverAddressByClientCIDRs": [
    {
      "clientCIDR": "0.0.0.0/0",
      "serverAddress": "172.19.0.7:6443"
    }
  ]
}
```

除了每个 namespace 默认的服务账户外，我们可以自己创建 Service Account。

```bash
​​$ kubectl create serviceaccount build-robot
serviceaccount/build-robot created

# ubuntu @ VM-0-7-ubuntu in ~ [9:45:08]
$ kubectl get serviceaccounts/build-robot -o yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  creationTimestamp: "2021-11-23T01:45:08Z"
  name: build-robot
  namespace: default
  resourceVersion: "881093"
  uid: 0160e851-cae1-4927-a524-58c3a379ee05
secrets:
- name: build-robot-token-d9p58


创建完成后我们可以在创建 Pod 时通过修改 spec.serviceAccountName 属性来指定 ServiceAccount。通过自己创建 ServiceAccount 并结合 RBAC 授权可以针对特殊的 Pod 进行单独的权限控制。

apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - image: nginx
    name: nginx
    volumeMounts:
    - mountPath: /var/run/secrets/tokens
      name: vault-token
  serviceAccountName: build-robot
```


#### 2.2 用户

Kubernetes 虽然有用户的概念，但它认为用户是由集群无关的服务进行管理的，因此并没有提供类似  kubectl create user 的 API 来创建用户。

当外部访问 apiserver 时，Kubernetes 可以使用的认证方式有：

- 客户端证书认证
- 静态的用户密码或 token 文件（Departed）
- Bootstrap tokens
- [OpenID Connect (OIDC)](https://openid.net/connect/)
- [Authenticating proxy](http://bit.ly/2xNS77W)
- [Webhook token authentication](http://bit.ly/2Oh6DPS)

这里比较常用的方式是客户端证书，其他方式使用可以参考这份索引 [文档](https://kubernetes-security.info/#authentication)。

Kubernetes 内置了 `Certificate Signing Request` 对象来执行证书签名。当外部用户想请求 Kubernetes 时，可以使用私钥来生成 CSR 证书签名请求，然后交给 Kuberetes 签发。流程如下

##### 生成私钥与 CSR

```bash
# 创建私钥
$ openssl genrsa -out Jane.key 2048
Generating RSA private key, 2048 bit long modulus (2 primes)
.............................+++++
.........................................................+++++
e is 65537 (0x010001)


# 生成 CSR
$ openssl req -new -key Jane.key -out Jane.csr
...
Common Name (e.g. server FQDN or YOUR name) []:Jane
Email Address []:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:


$ cat Jane.csr | base64 | tr -d "\n"

LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ21UQ0NBWUVDQVFBd1ZERUxNQWtHQTFVRUJoTUNRVlV4RXpBUkJnTlZCQWdNQ2xOdmJXVXRVM1JoZEdVeApJVEFmQmdOVkJBb01HRWx1ZEdWeWJtVjBJRmRwWkdkcGRITWdVSFI1SUV4MFpERU5NQXNHQTFVRUF3d0VTbUZ1ClpUQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQU5tb3dZUkdpbHlWSkVIbkxaUU0KSFEvQWRveG9CNmJUN2YvSjFuc2xBYXZEYm9Sc3BKdjBBcGh6a05RYXJDU1E1SDRYVjR2OGZDdDVmeGFyL294agpmUXVyWDNrbXk1SHpJTGFod0svWXUvWU01djhacG53S3J3RmpmTzVpVC9rRmhyOUF0VkhWL0ZMajBhZURzUHRaCjlaemduUXUwbUUxcmc5WWZBUVFxOHo5UjB5bGFxQ0V2SU9HVU5FRzBrNGN2K0lDNE96KzZjQmIyUGhLLzFKc3kKcUg3V3RONnIraDI0S0FveXExZDFSY1NIU0ppbVgwbkExNlFCYjRuRVFGc0xJaUtXSXRxQ1JXUm9WT2dqSDhMUQpOV1ZlQmRKRVh6MWxIYXhzVE56OEo0QVhUZGFTLzcwSDhMRXhCT3ppMXNXMFB1aldPRC8xRkVhc2dqY1NNUG9uCnVua0NBd0VBQWFBQU1BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQ2Z3ck5menl1blFtaUVBaXpxdzN6VGh0UkIKdjZtSmZVL2tNZTN1eHVDZm1MR3Y4OXpvZ3k3SWQxM25pdTE5Zzgzdy82UktkRFI1QVhXODk0L3daQi9CQjQwcgoyU3pQcmk5L3hMUkFManZnbWY0d1NhaDIyUnRJUjJYZGNVelJZL2V4V2w4ajJVV0w5Mkwxci82bWNjSVdrT1BUCnNmUWVYWWYxZThnNVk5Q1VSbThTNlloeURQOXFCQzk3QjEwenovNU1SN0YxdmtxMTI2OEtEek9GbWtWSnJLMkEKaXFNQk4xdkRSVkJURFVISFJ4V1lwTUpTSHJrOFRlVHhLVE1RNG12WGxCMzNUbElIZlU4L1ZOMEtQNFU5d0k5egpLNEI1NWFFc3QxUW5TWkw3cDlxMisvb20rdmtZUC9RblU4M3I4RlBFVTJ4R2ZzSTR0WFpzNkdseGZyVzMKLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tCg==%
```

 

##### 创建 Certificate Signing Request

CSR 生成后我们通过 base64  编码拿到其内容，并创建 Kubernetes 的 CSR 对象：

```yaml
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: Jane
spec:
  request: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ21UQ0NBWUVDQVFBd1ZERUxNQWtHQTFVRUJoTUNRVlV4RXpBUkJnTlZCQWdNQ2xOdmJXVXRVM1JoZEdVeApJVEFmQmdOVkJBb01HRWx1ZEdWeWJtVjBJRmRwWkdkcGRITWdVSFI1SUV4MFpERU5NQXNHQTFVRUF3d0VTbUZ1ClpUQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQU5tb3dZUkdpbHlWSkVIbkxaUU0KSFEvQWRveG9CNmJUN2YvSjFuc2xBYXZEYm9Sc3BKdjBBcGh6a05RYXJDU1E1SDRYVjR2OGZDdDVmeGFyL294agpmUXVyWDNrbXk1SHpJTGFod0svWXUvWU01djhacG53S3J3RmpmTzVpVC9rRmhyOUF0VkhWL0ZMajBhZURzUHRaCjlaemduUXUwbUUxcmc5WWZBUVFxOHo5UjB5bGFxQ0V2SU9HVU5FRzBrNGN2K0lDNE96KzZjQmIyUGhLLzFKc3kKcUg3V3RONnIraDI0S0FveXExZDFSY1NIU0ppbVgwbkExNlFCYjRuRVFGc0xJaUtXSXRxQ1JXUm9WT2dqSDhMUQpOV1ZlQmRKRVh6MWxIYXhzVE56OEo0QVhUZGFTLzcwSDhMRXhCT3ppMXNXMFB1aldPRC8xRkVhc2dqY1NNUG9uCnVua0NBd0VBQWFBQU1BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQ2Z3ck5menl1blFtaUVBaXpxdzN6VGh0UkIKdjZtSmZVL2tNZTN1eHVDZm1MR3Y4OXpvZ3k3SWQxM25pdTE5Zzgzdy82UktkRFI1QVhXODk0L3daQi9CQjQwcgoyU3pQcmk5L3hMUkFManZnbWY0d1NhaDIyUnRJUjJYZGNVelJZL2V4V2w4ajJVV0w5Mkwxci82bWNjSVdrT1BUCnNmUWVYWWYxZThnNVk5Q1VSbThTNlloeURQOXFCQzk3QjEwenovNU1SN0YxdmtxMTI2OEtEek9GbWtWSnJLMkEKaXFNQk4xdkRSVkJURFVISFJ4V1lwTUpTSHJrOFRlVHhLVE1RNG12WGxCMzNUbElIZlU4L1ZOMEtQNFU5d0k5egpLNEI1NWFFc3QxUW5TWkw3cDlxMisvb20rdmtZUC9RblU4M3I4RlBFVTJ4R2ZzSTR0WFpzNkdseGZyVzMKLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tCg==
  signerName: kubernetes.io/kube-apiserver-client
  expirationSeconds: 86400  # one day
  usages:
  - client auth
```


```bash
$ kubectl apply -f k8s-csr-jane.yaml
certificatesigningrequest.certificates.k8s.io/Jane created
```


##### 批准 Certificate Signing Request

新创建的 CSR 处于 Pending 状态，需要批准后才能使用。

```bash
$ kubectl get csr
NAME     AGE     SIGNERNAME                            REQUESTOR          REQUESTEDDURATION   CONDITION
Jane     6s      kubernetes.io/kube-apiserver-client   kubernetes-admin   24h                 Pending


$ kubectl certificate approve Jane
certificatesigningrequest.certificates.k8s.io/Jane approved

$ kubectl get csr 
NAME   AGE     SIGNERNAME                            REQUESTOR          REQUESTEDDURATION   CONDITION
Jane   4m18s   kubernetes.io/kube-apiserver-client   kubernetes-admin   24h                 Approved,Issued
```


批准后 CSR 中就有了证书信息：


```bash
$ kubectl get csr Jane -o yaml
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"certificates.k8s.io/v1","kind":"CertificateSigningRequest","metadata":{"annotations":{},"name":"Jane"},"spec":{"expirationSeconds":86400,"request":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ21UQ0NBWUVDQVFBd1ZERUxNQWtHQTFVRUJoTUNRVlV4RXpBUkJnTlZCQWdNQ2xOdmJXVXRVM1JoZEdVeApJVEFmQmdOVkJBb01HRWx1ZEdWeWJtVjBJRmRwWkdkcGRITWdVSFI1SUV4MFpERU5NQXNHQTFVRUF3d0VTbUZ1ClpUQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQU5tb3dZUkdpbHlWSkVIbkxaUU0KSFEvQWRveG9CNmJUN2YvSjFuc2xBYXZEYm9Sc3BKdjBBcGh6a05RYXJDU1E1SDRYVjR2OGZDdDVmeGFyL294agpmUXVyWDNrbXk1SHpJTGFod0svWXUvWU01djhacG53S3J3RmpmTzVpVC9rRmhyOUF0VkhWL0ZMajBhZURzUHRaCjlaemduUXUwbUUxcmc5WWZBUVFxOHo5UjB5bGFxQ0V2SU9HVU5FRzBrNGN2K0lDNE96KzZjQmIyUGhLLzFKc3kKcUg3V3RONnIraDI0S0FveXExZDFSY1NIU0ppbVgwbkExNlFCYjRuRVFGc0xJaUtXSXRxQ1JXUm9WT2dqSDhMUQpOV1ZlQmRKRVh6MWxIYXhzVE56OEo0QVhUZGFTLzcwSDhMRXhCT3ppMXNXMFB1aldPRC8xRkVhc2dqY1NNUG9uCnVua0NBd0VBQWFBQU1BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQ2Z3ck5menl1blFtaUVBaXpxdzN6VGh0UkIKdjZtSmZVL2tNZTN1eHVDZm1MR3Y4OXpvZ3k3SWQxM25pdTE5Zzgzdy82UktkRFI1QVhXODk0L3daQi9CQjQwcgoyU3pQcmk5L3hMUkFManZnbWY0d1NhaDIyUnRJUjJYZGNVelJZL2V4V2w4ajJVV0w5Mkwxci82bWNjSVdrT1BUCnNmUWVYWWYxZThnNVk5Q1VSbThTNlloeURQOXFCQzk3QjEwenovNU1SN0YxdmtxMTI2OEtEek9GbWtWSnJLMkEKaXFNQk4xdkRSVkJURFVISFJ4V1lwTUpTSHJrOFRlVHhLVE1RNG12WGxCMzNUbElIZlU4L1ZOMEtQNFU5d0k5egpLNEI1NWFFc3QxUW5TWkw3cDlxMisvb20rdmtZUC9RblU4M3I4RlBFVTJ4R2ZzSTR0WFpzNkdseGZyVzMKLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tCg==","signerName":"kubernetes.io/kube-apiserver-client","usages":["client auth"]}}
  creationTimestamp: "2021-11-24T22:47:57Z"
  name: Jane
  resourceVersion: "1127112"
  uid: 6f0b5433-e1d0-4f89-bbf1-a14fc1d0ad55
spec:
  expirationSeconds: 86400
  groups:
  - system:masters
  - system:authenticated
  request: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ21UQ0NBWUVDQVFBd1ZERUxNQWtHQTFVRUJoTUNRVlV4RXpBUkJnTlZCQWdNQ2xOdmJXVXRVM1JoZEdVeApJVEFmQmdOVkJBb01HRWx1ZEdWeWJtVjBJRmRwWkdkcGRITWdVSFI1SUV4MFpERU5NQXNHQTFVRUF3d0VTbUZ1ClpUQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQU5tb3dZUkdpbHlWSkVIbkxaUU0KSFEvQWRveG9CNmJUN2YvSjFuc2xBYXZEYm9Sc3BKdjBBcGh6a05RYXJDU1E1SDRYVjR2OGZDdDVmeGFyL294agpmUXVyWDNrbXk1SHpJTGFod0svWXUvWU01djhacG53S3J3RmpmTzVpVC9rRmhyOUF0VkhWL0ZMajBhZURzUHRaCjlaemduUXUwbUUxcmc5WWZBUVFxOHo5UjB5bGFxQ0V2SU9HVU5FRzBrNGN2K0lDNE96KzZjQmIyUGhLLzFKc3kKcUg3V3RONnIraDI0S0FveXExZDFSY1NIU0ppbVgwbkExNlFCYjRuRVFGc0xJaUtXSXRxQ1JXUm9WT2dqSDhMUQpOV1ZlQmRKRVh6MWxIYXhzVE56OEo0QVhUZGFTLzcwSDhMRXhCT3ppMXNXMFB1aldPRC8xRkVhc2dqY1NNUG9uCnVua0NBd0VBQWFBQU1BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQ2Z3ck5menl1blFtaUVBaXpxdzN6VGh0UkIKdjZtSmZVL2tNZTN1eHVDZm1MR3Y4OXpvZ3k3SWQxM25pdTE5Zzgzdy82UktkRFI1QVhXODk0L3daQi9CQjQwcgoyU3pQcmk5L3hMUkFManZnbWY0d1NhaDIyUnRJUjJYZGNVelJZL2V4V2w4ajJVV0w5Mkwxci82bWNjSVdrT1BUCnNmUWVYWWYxZThnNVk5Q1VSbThTNlloeURQOXFCQzk3QjEwenovNU1SN0YxdmtxMTI2OEtEek9GbWtWSnJLMkEKaXFNQk4xdkRSVkJURFVISFJ4V1lwTUpTSHJrOFRlVHhLVE1RNG12WGxCMzNUbElIZlU4L1ZOMEtQNFU5d0k5egpLNEI1NWFFc3QxUW5TWkw3cDlxMisvb20rdmtZUC9RblU4M3I4RlBFVTJ4R2ZzSTR0WFpzNkdseGZyVzMKLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tCg==
  signerName: kubernetes.io/kube-apiserver-client
  usages:
  - client auth
  username: kubernetes-admin
status:
  certificate: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURPakNDQWlLZ0F3SUJBZ0lSQU9MQzB0MXpQVUdIdkU0Z3ZJRUova0l3RFFZSktvWklodmNOQVFFTEJRQXcKRlRFVE1CRUdBMVVFQXhNS2EzVmlaWEp1WlhSbGN6QWVGdzB5TVRFeE1qUXlNalEzTVRKYUZ3MHlNVEV4TWpVeQpNalEzTVRKYU1GUXhDekFKQmdOVkJBWVRBa0ZWTVJNd0VRWURWUVFJRXdwVGIyMWxMVk4wWVhSbE1TRXdId1lEClZRUUtFeGhKYm5SbGNtNWxkQ0JYYVdSbmFYUnpJRkIwZVNCTWRHUXhEVEFMQmdOVkJBTVRCRXBoYm1Vd2dnRWkKTUEwR0NTcUdTSWIzRFFFQkFRVUFBNElCRHdBd2dnRUtBb0lCQVFEWnFNR0VSb3BjbFNSQjV5MlVEQjBQd0hhTQphQWVtMCszL3lkWjdKUUdydzI2RWJLU2I5QUtZYzVEVUdxd2trT1IrRjFlTC9Id3JlWDhXcS82TVkzMExxMTk1CkpzdVI4eUMyb2NDdjJMdjJET2IvR2FaOENxOEJZM3p1WWsvNUJZYS9RTFZSMWZ4UzQ5R25nN0Q3V2ZXYzRKMEwKdEpoTmE0UFdId0VFS3ZNL1VkTXBXcWdoTHlEaGxEUkJ0Sk9ITC9pQXVEcy91bkFXOWo0U3Y5U2JNcWgrMXJUZQpxL29kdUNnS01xdFhkVVhFaDBpWXBsOUp3TmVrQVcrSnhFQmJDeUlpbGlMYWdrVmthRlRvSXgvQzBEVmxYZ1hTClJGODlaUjJzYkV6Yy9DZUFGMDNXa3YrOUIvQ3hNUVRzNHRiRnREN28xamcvOVJSR3JJSTNFakQ2SjdwNUFnTUIKQUFHalJqQkVNQk1HQTFVZEpRUU1NQW9HQ0NzR0FRVUZCd01DTUF3R0ExVWRFd0VCL3dRQ01BQXdId1lEVlIwagpCQmd3Rm9BVTdMQXF5b3RONUltOFBQZnFlTEgwVmMvcjdNb3dEUVlKS29aSWh2Y05BUUVMQlFBRGdnRUJBRjljCnIyQWVuYVl1UDBvcmlLZTU5QjgwaWk2WUErbGdBelowU2lwdnhTYzlQbDBsZ3NuN01ibGtQdkc3MGM4S3UyRVIKRXl5WE9WcjFjcVhjSE1DNDk3b0hHQUM5L2ZDcitUc3lLT2x4L1A5TWxCOTRZdC9ZMStvd2drUndzajFnSnVHTQorbENlbUcyKy9yZCtWbTlHeEh0c3pxODZHa0tDNHVzV0dKMmhkZGVDYVV2OEdjZk9KMCtUT1orM3ZwNExIWmZ2CmFuakNEK2R2RzIxVW5SUXM2eUQyZUNDVG0ydVhVQkdNSnlkajFEUlNERis5b0ZRS2hvZVVPMnhUaWFpdFZEeTgKNy9RODZVb2hMS1lGQUdWTmFSazRDdDh0N2hMeFFVaU9USUcxajNUbi96T0lZd256aURCV0dhZ1RKOVNMbGk3RQovcGRlTWFReEFiMHdBMnkvbnlzPQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==
  conditions:
  - lastTransitionTime: "2021-11-24T22:52:12Z"
    lastUpdateTime: "2021-11-24T22:52:12Z"
    message: This CSR was approved by kubectl certificate approve.
    reason: KubectlApprove
    status: "True"
    type: Approved
```



我们可以通过 base64 将 CSR 中的证书解码导出然后在 作为登陆凭证配合在 kubeconfig 或者 RBAC 授权中。

```bash
​​$ kubectl get csr Jane -o jsonpath='{.status.certificate}' | base64 -d > Jane.crt
```


### 3. Kubeconfig

有了用户信息后，我们可以通过 curl 或者 kubectl 访问集群了，我们可以在发起请求时配置证书或者在请求头中设置 token 进行验证。

```bash
curl -k https://172.19.0.7:6443/api -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjFLMkVMNm5mMkFhYmQyMUdCVXp3OGdiZEs1dkdRQ3NNR0JWT0RZblIzYkkifQ..."

$ kubectl get pods --server https://172.19.0.7:6443 \
> --client-key admin.key \
> --client-certificate admin.crt \
> --certificate-authority ca.crt
```

但每次都这样访问的话非常不方便，尤其是需要用不同身份访问不同集群时，Kubernetes 提供了 kubeconfig 配置文件让我们可以更方便的配置对集群的访问。

```bash
$ kubectl get pods --kubeconfig /etc/kubernetes/admin.conf
NAME                         READY   STATUS    RESTARTS      AGE
php-apache-d4cf67d68-xsbbt   1/1     Running   2 (44h ago)   7d15h
```

默认的 kubeconfig 配置文件位于 ~/.kube/config ，一般安装完成后我们会将 /etc/kubernetes/admin.conf 文件复制过来，这样我们就可以通过 kubectl 直接访问集群了。

可以通过查看文件或者 kubectl config view 命令查看


```yaml
$ kubectl config view
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://172.19.0.7:6443
  name: kubernetes
contexts:
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
current-context: kubernetes-admin@kubernetes
preferences: {}
users:
- name: kubernetes-admin
  user:
    client-certificate-data: REDACTED
    client-key-data: REDACTED
```



Kubeconfig 文件可以分为三部分：

- **Clusters**：要访问的集群，指定集群名称、访问地址以及 CA 证书。
- **Users**：   用户信息，指定用户名以及私钥、证书作为访问凭证。
- **Contexts**：访问上下文，指定用哪个用户访问哪个集群。

![在这里插入图片描述](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/e391b7298278647cdee8b4ef3e6be96a.png)

通过添加不同的集群和用户，并设置不同的上下文，我们就可以在同一个终端对不同的集群进行访问。

除了直接修改文件外我们可以通过 kubectl config 命令来动态操作 kubeconfig 配置。


```bash
$ kubectl config
Modify kubeconfig files using subcommands like "kubectl config set current-context my-context"

 The loading order follows these rules:

  1.  If the --kubeconfig flag is set, then only that file is loaded. The flag may only be set once and no merging takes
place.
  1.  If $KUBECONFIG environment variable is set, then it is used as a list of paths (normal path delimiting rules for
your system). These paths are merged. When a value is modified, it is modified in the file that defines the stanza. When
a value is created, it is created in the first file that exists. If no files in the chain exist, then it creates the
last file in the list.
  1.  Otherwise, ${HOME}/.kube/config is used and no merging takes place.

Available Commands:
  current-context Display the current-context
  delete-cluster  Delete the specified cluster from the kubeconfig
  delete-context  Delete the specified context from the kubeconfig
  delete-user     Delete the specified user from the kubeconfig
  get-clusters    Display clusters defined in the kubeconfig
  get-contexts    Describe one or many contexts
  get-users       Display users defined in the kubeconfig
  rename-context  Rename a context from the kubeconfig file
  set             Set an individual value in a kubeconfig file
  set-cluster     Set a cluster entry in kubeconfig
  set-context     Set a context entry in kubeconfig
  set-credentials Set a user entry in kubeconfig
  unset           Unset an individual value in a kubeconfig file
  use-context     Set the current-context in a kubeconfig file
  view            Display merged kubeconfig settings or a specified kubeconfig file

Usage:
  kubectl config SUBCOMMAND [options]
```

比如我每次查看 order 命名空间下的资源对象都需要加 -n 指定 namespace 比较麻烦，我可以新加一个 context 使得每次默认访问 easemesh 命名空间下的对象。

```bash
1. 新建 context
$ kubectl config set-context order-checker --cluster=kubernetes --user=kubernetes-admin --namespace=order
Context "order-checker" created.

$ kubectl config current-context
kubernetes-admin@kubernetes


2. 切换 context 
$ kubectl config use-context order-checker
Switched to context "order-checker".


$ kubectl get pods
NAME                                                READY   STATUS    RESTARTS      AGE
order-control-plane-0                            1/1     Running   0             24h
order-operator-6754847bb7-fcglb                  2/2     Running   4 (44h ago)   7d15h


$ kubectl config current-context
order-checker
```

在 CKA/CKAD 考试中一般会提供若干个集群供我们操作，会频繁的用到  kubectl config use-context 来切换上下文。

### 4. 授权


有了身份认证后还需要权限认证来确认请求者是否有权限执行操作：

|认证方式  |实现方式  | 使用方式|
|--|--|--|
| Node 授权 | apiserver 内置 | 内部使用（kubelet）|
| ABAC | 静态文件 | 已弃用|
| RBAC | Kuberetes 对象 | 用户/管理员授权|
| WebHook | 外部服务 | |
| Always Dency/Always Allow | apiserver 内置 | 测试时使用|








#### 4.1 RBAC


基于角色的访问控制（Role-Based Access Control, 即”RBAC”）使用`rbac.authorization.k8s.io` API Group 实现授权决策，允许管理员通过 Kubernetes API 动态配置策略。要启用 RBAC，需使用 `--authorization-mode=RBAC`  启动 API Server。

Kubernetes 中 RBAC 的核心是通过 Role/ClusterRole、RoleBinding/ClusterRoleBind 来完成授权策略的定义：

- **Role/ClusterRole**: 在 namespace 或者集群层面定义针对资源的权限集合
- **RoleBinding/ClusterRoleBinding**: 将 Role/ClusterRole 绑定到目标对象完成授权，目前 Kubernetes 支持给 User、Group、ServiceAccount 三种对象授权。

##### 4.1.1 Roles & ClusterRoles
Role 代表对某个单一命名空间下的访问权限，而如果相对整个集群内的某些资源拥有权限，则需要通过 ClusterRole 实现。


以下是在 ”default” 命名空间中一个 Role 对象的定义，用于授予对 pod 的读访问权限：

```yaml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""] # 空字符串"" 表明使用 core API group
  resources: ["pods"]
  verbs: ["get", "watch", "list", “”]
```


下面例子是 ClusterRole 的定义示例，用于授予用户对某一特定命名空间，或者所有命名空间中的 secret（取决于其绑定方式）的读访问权限：

```yaml
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  # 鉴于 ClusterRole 是集群范围对象，所以这里不需要定义 "namespace" 字段
  name: secret-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "watch", "list"]
```



权限集合的定义在 rules 中，包含三部分：

**apiGroups**

API 组，资源所在的组，比如 Job 对象在 batch 组，Deploymet 在 app 组。可以通过 kubectl api-resources 命令查看其 apiversion 中的组。如果是空字符串代表 core 组。

**resources**

具体的资源列表，比如 pods，cronjobs 等。大多数资源由代表其名字的字符串表示，例如”pods”，但有一些 Kubernetes API 还 包含了“子资源”，比如 pod 的 logs。在 Kubernetes 中，pod logs endpoint 的 URL 格式为：

```bash
GET /api/v1/namespaces/{namespace}/pods/{name}/log
```


在这种情况下，”pods” 是命名空间资源，而 “log” 是 pods 的子资源。为了在 RBAC 的角色中表示出这一点，我们需要使用斜线来划分资源 与子资源。如果需要角色绑定主体读取 pods 以及 pod log，您需要定义以下角色：

```yaml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  namespace: default
  name: pod-and-pod-logs-reader
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list"]
```


另外可以通过设置 `resourceNames` 表示针对某个特定的对象的操作权限，此时请求所使用的动词不能是 list、watch、create 或者 deletecollection，因为资源名不会出现在 create、list、watch 和 deletecollection 等的 API 请求中。

除了针对 API Object 这些资源外，我们还需要对其他非资源类的 API 进行授权，此时需要通过 nonResourceURLs 资源来指定 URL 进行授权。下面是一个示例，表示对 “/healthz” 及其所有子路径有”GET” 和”POST” 的请求权限。

```yaml
rules:
- nonResourceURLs: ["/healthz", "/healthz/*"] # 在非资源 URL 中，'*' 代表后缀通配符
  verbs: ["get", "post"]
```



**verbs**


一系列动词集合，代表允许对资源执行的操作，本质上可以发起的请求类型。动词选项和 HTTP 请求对应如下：

|  verb| 含义 | HTTP 请求 |
|--|--|--|
| get |获取单个资源  | GET，HEAD| 
| list |获取一组资源  | GET，HEAD| 
| watch |获取单个资源  | GET，HEAD| 
| create |创建资源  | POST| 
| update |更新资源  | PUT| 
| patch |更新资源  | PATCH| 
| delete |局部更新资源  | DELETE| 
| deletecollection |删除一组资源  | DELETE| 



通过 `kubectl get clusterrole`  或 `kubectl get role --all-namespace` 可以查出 K8s 的所有的 ClusterRole 和 Role。通过 `kubectl describe clusterrole <role>` 可以看到这些role在哪些资源上有什么样的权限。

下面是一些示例：

- 允许读取 core API Group 中定义的资源”pods”：

```yaml
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
```


- 允许读写在”extensions” 和”apps” API Group 中定义的”deployments”：

```yaml
rules:
- apiGroups: ["extensions", "apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  ··`


- 允许读取”pods” 以及读写”jobs”：

```yaml
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["batch", "extensions"]
  resources: ["jobs"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
```


- 允许读取一个名为 ”my-config” 的ConfigMap实例（需要将其通过RoleBinding绑定从而限制针对某一个命名空间中定义的一个ConfigMap实例的访问）：

```yaml
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  resourceNames: ["my-config"]
  verbs: ["get"]
```


- 允许读取 core API Group 中的”nodes” 资源，由于Node是集群级别资源，所以此ClusterRole 定义需要与一个 ClusterRoleBinding绑定才能有效。

```yaml
rules:
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch"]
```

##### 4.1.2 RoleBinding & ClusterRoleBinding
角色绑定将一个角色中定义的各种权限授予一个或者一组用户。 角色绑定包含了一组相关 subject 主体, subject 包括用户 User、用户组 Group、或者服务账户 Service Account 以及对被授予角色的引用。 

在命名空间中可以通过 RoleBinding 对象授予权限，而集群范围的权限授予则通过 ClusterRoleBinding 对象完成。

ClusterRole 可以通过 RoleBinding 进行角色绑定，但仅对  RoleBinding 所在命名空间有效。

下面示例是一些示例：

- 在 default 命名空间中将 pod-reader  角色授予用户 jane， 允许用户 jane 从 default 命名空间中读取 pod。

```yaml
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```


- ClusterRoleBinding 对象允许在用户组 "manager" 中的任何用户都可以读取集群中任何命名空间中的 secret。

```yaml
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: read-secrets-global
subjects:
- kind: Group
  name: manager
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
```


##### 4.1.3 命令行工具

除了定义 yaml 文武兼外，对于  rolebinding 的操作可以通过命令行方便的完成，下面是一些示例：

在某一特定命名空间内授予 Role 或者 ClusterRole。示例如下：

```bash
# 在名为"acme" 的命名空间中将 admin ClusterRole 授予用户"bob"：
kubectl create rolebinding bob-admin-binding --clusterrole=admin --user=bob --namespace=acme

# 在名为"acme" 的命名空间中将 view ClusterRole 授予服务账户"myapp"：
kubectl create rolebinding myapp-view-binding --clusterrole=view --serviceaccount=acme:myapp --namespace=acme
```


在整个集群中授予 ClusterRole，包括所有命名空间。示例如下：

```bash
# 在整个集群范围内将 cluster-admin ClusterRole 授予用户"root"：
kubectl create clusterrolebinding root-cluster-admin-binding --clusterrole=cluster-admin --user=root

# 在整个集群范围内将 system:node ClusterRole 授予用户"kubelet"：
kubectl create clusterrolebinding kubelet-node-binding --clusterrole=system:node --user=kubelet

# 在整个集群范围内将 view ClusterRole 授予命名空间"acme" 内的服务账户"myapp"：
kubectl create clusterrolebinding myapp-view-binding --clusterrole=view --serviceaccount=acme:myapp
```


### 5. 准入控制
请求在完成认证和授权之后，对象在被持久化到 etcd 之前，还需要通过一系列的准入控制器进行验证。如同我们业务系统一样，除了需要验证登陆用户的身份、操作权限外，还需要验证用户的操作对不对，比如提交一个表单，要看下必填项是否都填了，手机号码的格式是否正确等，甚至还可能要拦截请求做额外的处理，比如注入请求头做流量着色。

Kubernetes 也一样，需要对外部提交的请求做校验、拦截修改等操作。所谓准入控制器就是一系列的插件，每个插件都有其特定的功能，比如允许哪些请求进入，限定对资源的使用，设定 Pod 的安全策略等。它们作为看门人（gatekeeper）来对发送到 Kubernetes 做拦截验证，从而实现对集群使用方式的管理，


![在这里插入图片描述](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/55299c8f8c185258c4980dff5557df11.png)

图片来自 https://sysdig.com/blog/kubernetes-admission-controllers/

准入控制器的操作有两种：

- **mutating** ：拦截并修改请求
- **validating**：验证请求的合法性

一个准入控制器可以是只执行 mutating 或者 validating ，也可以两个都执行，先执行 mutating 在执行  validating。

 Kubernetes 本身已经提供了很多的准入控制器插件，可以通过以下命令查看：

```bash
$ kube-apiserver -h | grep enable-admission-plugins
CertificateApproval, CertificateSigning, CertificateSubjectRestriction, DefaultIngressClass, DefaultStorageClass, DefaultTolerationSeconds, LimitRanger, MutatingAdmissionWebhook, NamespaceLifecycle, PersistentVolumeClaimResize, Priority, ResourceQuota, RuntimeClass, ServiceAccount, StorageObjectInUseProtection, TaintNodesByCondition, ValidatingAdmissionWebhook
```

每个准入控制器插件基本都是实现了某一特定的功能，在启动 kube-apiserver 时可以通过设置 `--enable-admission-plugins，--disable-admission-plugins` 参数来启动或者禁用某些注入控制器。已有的控制器类型可以参考 [文档](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#what-does-each-admission-controller-do)。

#### 5.1 动态准入控制

在 Kubernetes 默认的准入控制器中，有两个特殊的控制器：

- MutatingAdmissionWebhook
- ValidatingAdmissionWebhook

它们以 WebHook 的方式提供扩展能力，我们可以在集群中创建相关的 WebHook 配置并在配置中选择想要关注的资源对象，这样对应的资源对象在执行操作时就可以触发 WebHook，然后我们可以编写具体的响应代码实现准入控制。

`MutatingAdmissionWebhook` 用来修改用户的请求，执行 mutating 操作，比如修改镜像、添加注解、注入 SideCar 等。

`ValidatingAdmissionWebhook` 则只能用来做校验，比如检查命名规范，检查镜像的使用。 MutatingAdmissionWebhook 会在  ValidatingAdmissionWebhook 前执行。

想要自定义准入控制策略，集群需要满足以下条件：

- 确保 Kubernetes 集群版本至少为 v1.16（以便使用 admissionregistration.k8s.io/v1 API） 或者 v1.9 （以便使用 admissionregistration.k8s.io/v1beta1 API）。
- 确保启用 MutatingAdmissionWebhook 和 ValidatingAdmissionWebhook 控制器。 
- 确保启用了 admissionregistration.k8s.io/v1 或者 admissionregistration.k8s.io/v1beta1 API。

为了实现自定义的 WebHook，我们主要需要两步操作：
- 创建 webhook server
- 创建 webhook 配置

##### 5.1.1 WebHook Server

所谓 WebHook Server 就是 在  webhook 触发时的响应服务：

- 本质上是一个 HTTP 服务，接收 POST + JSON 请求
- 请求和响应都是一个 [AdmissionReview](https://github.com/kubernetes/api/blob/master/admission/v1beta1/types.go) 对象，其内部包含 request 和 response 两个对象。
- 每个请求都有 uid 字段；而响应则必须含有如下字段：
	- uid 字段：从请求中拷贝的 uid。
	- allowed: true 或者 false，表示是否允许请求执行

```bash
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  "response": {
    "uid": "<value from request.uid>",
    "allowed": true
  }
}
```
因此，我们的任务就是编写一个 HTTP 服务，来接收 AdmissionReview 的请求并返回 AdmissionReview 响应。

##### 5.1.2 WebHook 配置
有了 WebHook server 后，我们就可以创建配置来指定要选择的资源以及响应服务了。
Kubernetes 提供了  `MutatingWebhookConfiguration` 和 `ValidatingWebhookConfiguration`  两种 API 对象来让我们动态的创建准入控制的配置。顾名思义，前者用来拦截并修改请求，后者用来验证请求是否正确。下面是一个 `ValidatingWebhookConfiguration` 配置示例：

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: "pod-policy.example.com"
webhooks:
- name: "pod-policy.example.com"
  rules:
  - apiGroups:   [""]
    apiVersions: ["v1"]
    operations:  ["CREATE"]
    resources:   ["pods"]
    scope:       "Namespaced"
  clientConfig:
    service:
      namespace: "example-namespace"
      name: "example-service"
    caBundle: "Ci0tLS0tQk...<`caButLS0K"
  admissionReviewVersions: ["v1", "v1beta1"]
  sideEffects: None
  timeoutSeconds: 5
```


可以看到 API 对象就是用来定义一系列的 webhook 的，每个 webhook 的配置包含以下主要字段：

**rules**

每个webhook 需要设置一系列规则来确认某个请求是否需要发送给 webhook。每个规则可以指定一个或多个 operations、apiGroups、apiVersions 和 resources 以及资源的 scope：

- **operations** 列出一个或多个要匹配的操作。 可以是 CREATE、UPDATE、DELETE、CONNECT 或 * 以匹配所有内容。
- **apiGroups** 列出了一个或多个要匹配的 API 组。"" 是核心 API 组。"*" 匹配所有 API 组。
- **apiVersions** 列出了一个或多个要匹配的 API 版本。"*" 匹配所有 API 版本。
- **resources** 列出了一个或多个要匹配的资源。
	- "*" 匹配所有资源，但不包括子资源。
	- "*/*" 匹配所有资源，包括子资源。
	- "pods/*" 匹配 pod 的所有子资源。
	- "*/status" 匹配所有 status 子资源。
- **scope** 指定要匹配的范围。有效值为 "Cluster"、"Namespaced" 和 "*"。 子资源匹配其父资源的范围。在 Kubernetes v1.14+ 版本中才被支持。 默认值为 "*"，对应 1.14 版本之前的行为。
	- "Cluster" 表示只有集群作用域的资源才能匹配此规则（API 对象 Namespace 是集群作用域的）。
	- "Namespaced" 意味着仅具有名字空间的资源才符合此规则。
	- "*" 表示没有范围限制。

下面示例表示匹配针对 apps/v1 和 apps/v1beta1 组中 deployments 和 replicasets 资源的 CREATE 或 UPDATE 请求

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
...
webhooks:
- name: my-webhook.example.com
  rules:
  - operations: ["CREATE", "UPDATE"]
    apiGroups: ["apps"]
    apiVersions: ["v1", "v1beta1"]
    resources: ["deployments", "replicasets"]
    scope: "Namespaced"
```
 
**objectSelector**

根据发送对象的标签来判断是否拦截，如下面示例，任何带有 foo=bar 标签的对象创建请求都会被拦截触发 webhook。

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
...
webhooks:
- name: my-webhook.example.com
  objectSelector:
    matchLabels:
      foo: bar
  rules:
  - operations: ["CREATE"]
    apiGroups: ["*"]
    apiVersions: ["*"]
    resources: ["*"]
    scope: "*"
  ...
```

**namespaceSelector**

匹配命名空间，根据资源对象所在的命名空间作拦截，下面是 [EaseMesh](https://github.com/megaease/easemesh) 的示例，
针对带有 `mesh.megaease.com/mesh-service` 标签的，除 easemesh、kube-system、kube-public 之外的命名空间中的对象，如果对象符合 rules 中的定义，则会将请求发送到 webhook server。

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
...
webhooks:
- name: mesh-injector.megaease.com
  namespaceSelector:
    matchExpressions:
    - key: kubernetes.io/metadata.name
      operator: NotIn
      values:
      - easemesh
      - kube-system
      - kube-public
    - key: mesh.megaease.com/mesh-service
      operator: Exists
```

 
 
**clientConfig**

这里配置的就是我们的 Webhook Server 访问地址以及验证信息。当一个请求经由上述选择规则确定要发送到 webhook 后，就会根据 clientConfig 中配置的信息向我们的 WebHook Server 发送请求。
WebHook Server 可以分为集群内和集群外部的服务，如果是集群外部的服务需要配置访问 URL，示例如下：

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
...
webhooks:
- name: my-webhook.example.com
  clientConfig:
    url: "https://my-webhook.example.com:9443/my-webhook-path"
  ...
```

 
如果是集群内部的服务，则可以通过配置服务名后通过 Kubernetes 的 DNS 访问到，下面是 EaseMesh 中的示例：

```yaml
➜  ~  |>kubectl get svc -n easemesh                                                            
NAME                                               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                                        AGE
easemesh-operator-service                          ClusterIP   10.233.53.203   <none>        8443/TCP,9090/TCP

 
clientConfig:
    caBundle:  LS0...tCg==
    service:
      Name:        easemesh-operator-service
      Namespace:   easemesh
      Path:        /mutate
      Port:        9090
```


下面是官方文档中提供的一个例子 [admission-controller-webhook-demo](https://github.com/stackrox/admission-controller-webhook-demo) ，
该应用的目的是要限制 Pod 的权限，尽量避免以 root 用户的身份运行：
- 如果 Pod 没有明确设置 runAsNonRoot，则默认添加 runAsNonRoot: true ；如果没有设置 runAsUser 则默认添加 runAsUser: 1234 配置。
- 如果设置 runAsNonRoot 为 true，则校验 runAsUser 是否等于 0（root)，不等于的话 Pod 会创建失败。

```go
var runAsNonRoot *bool
var runAsUser *int64
if pod.Spec.SecurityContext != nil {
  runAsNonRoot = pod.Spec.SecurityContext.RunAsNonRoot
  runAsUser = pod.Spec.SecurityContext.RunAsUser
}

// Create patch operations to apply sensible defaults, if those options are not set explicitly.
var patches []patchOperation
if runAsNonRoot == nil {
  patches = append(patches, patchOperation{
     Op:   "add",
     Path: "/spec/securityContext/runAsNonRoot",
     // The value must not be true if runAsUser is set to 0, as otherwise we would create a conflicting
     // configuration ourselves.
     Value: runAsUser == nil || *runAsUser != 0,
  })

  if runAsUser == nil {
     patches = append(patches, patchOperation{
        Op:    "add",
        Path:  "/spec/securityContext/runAsUser",
        Value: 1234,
     })
  }
} else if *runAsNonRoot == true && (runAsUser != nil && *runAsUser == 0) {
  // Make sure that the settings are not contradictory, and fail the object creation if they are.
  return nil, errors.New("runAsNonRoot specified, but runAsUser set to 0 (the root user)")
}
```

 
上面是主要的 mutating 逻辑代码，下面是启动一个 http server 来处理请求，将上面的方法传进去作为 handler 。

```go
func main() {
  certPath := filepath.Join(tlsDir, tlsCertFile)
  keyPath := filepath.Join(tlsDir, tlsKeyFile)

  mux := http.NewServeMux()
  mux.Handle("/mutate", admitFuncHandler(applySecurityDefaults))
  server := &http.Server{
     // We listen on port 8443 such that we do not need root privileges or extra capabilities for this server.
     // The Service object will take care of mapping this port to the HTTPS port 443.
     Addr:    ":8443",
     Handler: mux,
  }
  log.Fatal(server.ListenAndServeTLS(certPath, keyPath))
}
func main() {
  certPath := filepath.Join(tlsDir, tlsCertFile)
  keyPath := filepath.Join(tlsDir, tlsKeyFile)

  mux := http.NewServeMux()
  mux.Handle("/mutate", admitFuncHandler(applySecurityDefaults))
  server := &http.Server{
     // We listen on port 8443 such that we do not need root privileges or extra capabilities for this server.
     // The Service object will take care of mapping this port to the HTTPS port 443.
     Addr:    ":8443",
     Handler: mux,
  }
  log.Fatal(server.ListenAndServeTLS(certPath, keyPath))
}
```

 
将上面的程序部署到集群

```bash
$ kubectl get service -n webhook-demo
NAME             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
webhook-server   ClusterIP   10.108.206.71   <none>        443/TCP   7s

$ kubectl get pods -n webhook-demo
NAME                              READY   STATUS    RESTARTS   AGE
webhook-server-69c78cb569-s9dw6   1/1     Running   0          10s
```


Webhook Server 部署好就可以配置准入控制的配置了，因为要修改请求，因此要创建 MutatingWebhookConfiguration，下面是创建好的配置内容：

```bash
$ kubectl describe mutatingwebhookconfigurations demo-webhook
Name:         demo-webhook
Namespace:
Labels:       <none>
Annotations:  <none>
API Version:  admissionregistration.k8s.io/v1
Kind:         MutatingWebhookConfiguration
Metadata:
Webhooks:
  Admission Review Versions:
    v1
    v1beta1
  Client Config:
    Ca Bundle:  LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURQekNDQWllZ0F3SUJBZ0lVZUNs
    Service:
      Name:        webhook-server
      Namespace:   webhook-demo
      Path:        /mutate
      Port:        443
  Failure Policy:  Fail
  Match Policy:    Equivalent
  Name:            webhook-server.webhook-demo.svc
  Namespace Selector:
  Object Selector:
  Reinvocation Policy:  Never
  Rules:
    API Groups:
    API Versions:
      v1
    Operations:
      CREATE
    Resources:
      pods
    Scope:          *
  Side Effects:     None
  Timeout Seconds:  10
Events:             <none>
```

 
可以看到其 Rule 是当收到 Pod 的创建请求时，会将发送请求到我们的 Webhook Server。
下面测试 Pod 的创建，首先是默认情况下，如果不设置会自动配置 runAsNoneRoot 和 runAsUser
 

```bash
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-defaults
  labels:
    app: pod-with-defaults
spec:
  restartPolicy: OnFailure
  containers:
  - name: busybox
    image: busybox
    command: ["sh", "-c", "echo I am running as user $(id -u)"]

 
$ kubectl get pods pod-with-defaults -o yaml
apiVersion: v1
kind: Pod
metadata:
   labels:
    app: pod-with-defaults
  name: pod-with-defaults
  namespace: default

spec:
  containers:
  - command:
    - sh
    - -c
    - echo I am running as user $(id -u)
    image: busybox
    imagePullPolicy: Always
    name: busybox
  securityContext:
    runAsNonRoot: true
    runAsUser: 1234
```

 
如果是 runAsNonRoot 如果设置为 true，但是 runAsUser 设置 设置为 0，请求会被拦截并报错：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-conflict
  labels:
    app: pod-with-conflict
spec:
  restartPolicy: OnFailure
  securityContext:
    runAsNonRoot: true
    runAsUser: 0
  containers:
    - name: busybox
      image: busybox
      command: ["sh", "-c", "echo I am running as user $(id -u)"]
```

 

```bash
$ kubectl apply -f examples/pod-with-conflict.yaml
Error from server: error when creating "examples/pod-with-conflict.yaml": admission webhook "webhook-server.webhook-demo.svc" denied the request: runAsNonRoot specified, but runAsUser set to 0 (the root user)
```

 
可以看到请求被正确拦截了, 以上是动态准入控制的简单介绍，更多的细节可以参考[官方文档](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/) 和[博客](https://kubernetes.io/blog/2019/03/21/a-guide-to-kubernetes-admission-controllers/)。
 
### 6. Security Context

上述 RBAC、准入控制等策略都是针对 api-server 的安全访问控制，如果外部攻击者攻破了 API Server 的访问控制成功部署了 Pod，并在容器中运行攻击代码，依然是可以对我们的系统造成损害。因此我们还需要设置 Pod 的操作权限，不能让 Pod `“为所欲为”`。

#### 6.1 宿主机命名空间

 Pod 有自己的网络、PID、IPC 命名空间，因此同一 Pod 中的容器可以共享网络，可以进行进程间通信以及只看到自己的进程树。如果某些 Pod 需要使用宿主机默认的命令空间，则需要额外进行设置。
网络命名空间

可以通过 hostNetwork: true 配置来使 Pod 直接使用网络的命名空间。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-host-network
spec:
  hostNetwork: true                    
  containers:
  - name: main
    image: alpine
    command: ["/bin/sleep", "999999"]
```

这样 Pod 创建后其网络用的就是宿主机的网络，在 Pod 中执行 ifconfig 命令查看网络设备会看到其所在宿主机的网络设备列表。

```bash
$ kubectl exec -it pod-with-host-network -- ifconfig
eth0      Link encap:Ethernet  HWaddr 52:54:00:22:84:B5
          inet addr:172.19.0.3  Bcast:172.19.15.255  Mask:255.255.240.0
          inet6 addr: fe80::5054:ff:fe22:84b5/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:5089655 errors:0 dropped:0 overruns:0 frame:0
          TX packets:5061521 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:1952900135 (1.8 GiB)  TX bytes:1062809752 (1013.5 MiB)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:1334609 errors:0 dropped:0 overruns:0 frame:0
          TX packets:1334609 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:159996559 (152.5 MiB)  TX bytes:159996559 (152.5 MiB)
...
```

![在这里插入图片描述](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/49120e9723d1a2064896616def00cb0e.png)


像 Kubernetes 的控制平面组件 kube-apiserver 等都是设置了该选项，从而使得它们的行为与不在 Pod 中运行时相同。

```bash
$ kubectl get pods -n kube-system kube-apiserver-vm-0-7-ubuntu -o yaml
apiVersion: v1
kind: Pod
metadata:
  name: kube-apiserver-vm-0-7-ubuntu
  namespace: kube-system
spec:
  containers:
  - command:
    - kube-apiserver
  
    image: k8s.gcr.io/kube-apiserver:v1.22.3
    imagePullPolicy: IfNotPresent
  ...
  hostNetwork: true
```



另外还可以通过设置 hostPort 使容器使用所在节点的主机端口而不是直接共享命名空间。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kubia-hostport
spec:
  containers:
  - image: luksa/kubia
    name: kubia
    ports:
    - containerPort: 8080     
      hostPort: 9000          
      protocol: TCP
```


这样当访问 Pod 所在节点上的 9000 端口时会访问到 Pod 中容器，因为要占用主机端口，因此如果有多个副本的话这些副本不能被调度到同一个节点。

该功能最初主要是用来暴露通过 DaemonSet 在每个节点上运行的服务，后来也用来做 Pod 的调度，保证相同的 Pod 不能被部署到同一个节点，现在已经被 Pod 非亲和的调度方式所取代。

#### 6.2 PID & IPC 命名空间

除了网络命名空间，Pod 还可以直接使用宿主机的 IPC 和 PID 命名空间，从而看到宿主机所有的进程，以及与宿主机的进程进行通信。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-host-pid-and-ipc
spec:
  hostPID: true                      
  hostIPC: true                      
  containers:
  - name: main
    image: alpine
    command: ["/bin/sleep", "999999"]
```

#### 6.3 Pod Security Context

除了使用宿主机的命名空间，还是设置安全上下文来定义 Pod 或者容器的特权和访问控制设置。包含但不限于一下配置：
- 指定容器中运行进程的用户和用户组，从而简介判定对对象、文件的操作权限。
- 设置 SELinux 选项，加强对容器的限制
- 以特权模式或者非特权模式运行，特权模式下容器对宿主机节点内核具有完整的访问权限
- 配置内核功能，以细粒度的方式配置内核访问权限
- AppArmor：使用程序框架来限制个别程序的权能。
- Seccomp：过滤进程的系统调用。
- readOnlyRootFilesystem：以只读方式加载容器的根文件系统。

下面是一些使用示例：
 
**设置容器的安全上下文**

-- 设置非 root 用户执行

容器运行的用户可以在构建镜像时指定，如果攻击者获取到 Dockerfile 并设置的 root 用户，如果 Pod 挂载了宿主机目录，此时就会对宿主机的目录有完整的访问权限。如果是非 root 用户则不会有完整的权限。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-run-as-non-root
spec:
  containers:
  - name: main
    image: alpine
    command: ["/bin/sleep", "999999"]
    securityContext:                   
      runAsNonRoot: true 
```

- 设置特权模式运行

如果容器获取内核的完整权限，需要在宿主机能做任何事，就可以设置为特权模式。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-privileged
spec:
  containers:
  - name: main
    image: alpine
    command: ["/bin/sleep", "999999"]
    securityContext:
      privileged: true
```


像 kube-proxy 需要修改 iptables 规则，因此就开启了特权模式。

```bash
$ kubectl get pods kube-proxy-fschm -n kube-system -o yaml
apiVersion: v1
kind: Pod
metadata:
  name: kube-proxy-fschm
  namespace: kube-system
spec:
    image: k8s.gcr.io/kube-proxy:v1.22.3
    imagePullPolicy: IfNotPresent
    name: kube-proxy
    securityContext:
      privileged: true
```

- 为容器单独添加或者禁用内核功能

除了赋予完整权限的特权模式，我们还可以细粒度的添加或者删除内核操作权限，下面是一个例子，允许修改系统时间，但不允许容器修改文件的所有者。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-add-settime-capability
spec:
  containers:
  - name: main
    image: alpine
    command: ["/bin/sleep", "999999"]
    securityContext:                     
      capabilities:                      
        add:                             
        - SYS_TIME
        drop:                   
        - CHOWN
```


除了为容器单独设置上下文，一部分配置可以在 Pod 层面设置，表示对 Pod 中所有的容器生效，如果容器也设置了则会覆盖掉 Pod 的设置，另外 Pod 也要独有的上下文配置，可以参考 官方文档，这里就不做赘述了。

### 7. Pod Security

安全上下文是创建 Pod 的用户指定的，除此之外我们还需要在集群层面来保证用户不能滥用相关的权限。因此之前 Kubernetes 提供了集群层面 PSP（PodSecurityPolicy）对象来让集群员来定义用户的 Pod 能否使用各种安全相关的特性。

可以通过 PSP 来统一批量设置相关的安全设置，然后通过 RBAC 为不同的用户赋予不同 PSP，然后在创建 Pod 时指定用户，就可以实现针对不用的 Pod 应用不同的安全策略了。下面是一个例子：

通过创建一个 PSP 同时指定用户、是否使用宿主机命名空间、启用和禁用内核权限等。

```yaml
apiVersion: extensions/v1beta1
kind: PodSecurityPolicy
metadata:
  name: default
spec:
  hostIPC: false                 
  hostPID: false                 
  hostNetwork: false             
  hostPorts:                     
  - min: 10000                   
    max: 11000                   
  - min: 13000                   
    max: 14000                   
  privileged: false              
  readOnlyRootFilesystem: true   
  runAsUser:                     
    rule: RunAsAny               
  fsGroup:                       
    rule: RunAsAny   
  allowedCapabilities:            
  - SYS_TIME                      
  defaultAddCapabilities:         
  - CHOWN                         
  requiredDropCapabilities:       
  - SYS_ADMIN                     
  - SYS_MODULE       
```

             
然后可以通过 RBAC 进行设置，鉴于 PSP 已经被弃用，并将在 1.25 版本移除，这里就不多做讲解了。取而代之的是使用新的 PodSecurity 进行安全相关的设置，截止到 1.23 该特性处于 beta 阶段。下面简单看一下

PodSecurity 是一个准入控制器，其由松到紧定义了三种安全级别的策略：

- **privileged**: 特权策略，表示几乎没有限制。提供最大可能范围的权限许可

- **baseline**：基线策略，允许使用默认的（规定最少）Pod 配置。

- **Restricted**：限制性最强的策略，遵循保护 Pod 针对最佳实践。

策略具体关联都的权限控制可以查看 [pod-security-standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/) 文档。有了策略后，我们可以在命名空间上声明针对各个安全策略的处理方式。具体处理方式也有三种：

- **enforce**：强制执行，如果违反策略，则 od 创建请求会被拒绝。
- **audit**：执行监听，如果违反策略，则会触发记录监听日志，但 Pod 可以被创建成功。
- **warn**: 执行警告，如果违反策略，Pod 创建时会提示用户，但依然可以被创建成成功。

针对每种方式，Kubernetes 提供了两个标签来指定处理的安全级别和 Kubernetes minor 版本：

- `pod-security.kubernetes.io/<MODE>: <LEVEL>`，model 必须是 enforce、audit、warn 之一，level 必须是 privileged、baseline、restricted 之一。

- `pod-security.kubernetes.io/<MODE>-version: <VERSION>`：表示策略执行的版本，必须是 Kubernetes minor 版本或者 latest。

然后就可以在 namespace 上添加标签来进行安全限制了，下面的例子表示，在 `my-baseline-namespace` 来命名空间创建的 Pod:

- 如果不满足 baseline 策略，会被拒绝创建。
- 如果不满足 restricted 策略，则会记录监听日志以及向用户发出经过。其策略版本是 1.23 版本。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-baseline-namespace
  labels:
    pod-security.kubernetes.io/enforce: baseline
    pod-security.kubernetes.io/enforce-version: v1.23

    # We are setting these to our _desired_ `enforce` level.
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/audit-version: v1.23
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/warn-version: v1.23
```



### 8. Network Policy

Network Policy 类似于 AWS 的安全组，是一组 Pod 间及与其他网络端点间所允许的通信规则。NetworkPolicy 资源使用 Label 和 Selector 选择 Pod，并定义选定 Pod 所允许的通信规则。

下面是一个 NetworkPolicy 的示例:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: test-network-policy
  namespace: default
spec:
  podSelector:
    matchLabels:
      role: db
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - ipBlock:
        cidr: 172.17.0.0/16
        except:
        - 172.17.1.0/24
    - namespaceSelector:
        matchLabels:
          project: myproject
    - podSelector:
        matchLabels:
          role: frontend
    ports:
    - protocol: TCP
      port: 6379
  egress:
  - to:
    - ipBlock:
        cidr: 10.0.0.0/24
    ports:
    - protocol: TCP
      port: 5978
```

上述的示例意思是：

- 对  default 命名空间下带有标签 role=db 的 Pod 进行如下配置

- （Ingress 规则）允许以下客户端连接到被选中 Pod 的 6379 TCP 端口：
	- default 命名空间下任意带有 role=frontend 标签的 Pod
	- 带有 project=myproject 标签的任意命名空间中的 Pod
	- IP 地址范围为 172.17.0.0–172.17.0.255 和 172.17.2.0–172.17.255.255（即，除了 172.17.1.0/24 之外的所有 172.17.0.0/16）的外部节点

- （Egress 规则）允许被选中 Pod 可以访问以下节点
	- 地址为 10.0.0.0/24 下 的 5978  端口

**podSelector**

每个 NetworkPolicy 都包括一个 podSelector ，它根据标签选安定一组 Pod 以应用其所定义的规则。示例中表示选择带有 "role=db" 标签的 Pod。如果 podSelector 为空，表示选择namespace下的所有 Pod。

**policyTypes**

表示定义的规则类型，包含 Ingress 或 Egress 或两者兼具。

- Ingress 表示所选 Pod 的入网规则，即哪些端点可以访问该 Pod。
- Egress 表示 Pod 的出网规则，即该 Pod 可以访问那些端点。


Ingress / Egress 下用来限定规则的方式有四种：

- **podSelector**：选择相同命名空间下的特定 Pod 。
- **namespaceSelector**：选择特定命名空间下的所有 Pod 。
- **podSelector** 与 **namespaceSelector**：选择特定命名空间下的特定 Pod。定义时注意和之上两者的区别
- **ipBlock**：IP CIDR 范围，一般都是外部地址，因为 Pod 地址是临时性、经常变化的。
ports

同时指定 namespaceSelector 和 podSelector 时，请求需要同时满足任意两个条件。

```yaml
ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          user: alice
      podSelector:
        matchLabels:
          role: client
```


各自指定时，只满足其中一个条件即可：

```yaml
 ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          user: alice
    - podSelector:
        matchLabels:
          role: client
```

**ports** 

可以被访问的端口或者可以访问的外部端口。在定义时指明协议和端口即可，一般都是 TCP 协议，

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: test-network-policy
  namespace: default
spec:
....
  ingress:
  - from:
    - ipBlock:
        cidr: 172.17.0.0/16
    ports:
    - protocol: TCP
      port: 6379
  egress:
  - to:
    - ipBlock:
        cidr: 10.0.0.0/24
    ports:
    - protocol: TCP
      port: 5978
```



从 1.20 版本开始默认也支持 SCTP 协议，如果想关掉需要修改 apiserver 的启动配置 --feature-`gates=SCTPSupport=false`。

另外现在可以指定一组端口，该特性在 1.22 版本处于 beta 状态，使用示例如下：

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: multi-port-egress
  namespace: default
spec:
  podSelector:
    matchLabels:
      role: db
  policyTypes:
  - Egress
  egress:
  - to:
    - ipBlock:
        cidr: 10.0.0.0/24
    ports:
    - protocol: TCP
      port: 32000
      endPort: 32768
```


这里表示选中的 Pod 可以访问 10.0.0.0/24 网段的 32000 ~ 32768 端口。这里有几个要求：
- endPort 必须大于等于 port
- endPort 不能被单独定义，必须先指定 port
- 端口都是数字

下面是一些特殊的规则示例：

**拒绝所有入站流量**

```yaml
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: default
spec:
  podSelector: {}
  policyTypes:
  - Ingress
```


**允许所有入站流量**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-all-ingress
  namespace: default
spec:
  podSelector: {}
  ingress:
  - {}
  policyTypes:
  - Ingress
```


**拒绝所有出站流量**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-egress
  namespace: default
spec:
  podSelector: {}
  policyTypes:
  - Egress
```


**允许所有出站流量**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-all-egress
spec:
  podSelector: {}
  egress:
  - {}
  policyTypes:
  - Egress
```



**拒绝所有入站和出站流量**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

最后需要注意的是 Network Policy 的功能是由网络插件实现的，因此是否可以使用该特性取决于我们使用的网络插件。像 Calico、Weave 都对该功能做了支持，但 Flannel 本身不支持，需要结合 Calico 使用才性能，参考文档  Installing Calico for policy and flannel (aka Canal) for networking。


以上是对 Kubernetes 安全相关的简单概述，在实际云原生环境里，其安全性按层分需要从所谓的 4C（Cloud, Clusters, Containers, and Code.）四个层面来保证。Kubernetes 只是其中的一层而已。

![在这里插入图片描述](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/f14dc24b85627ce5fa32bf015b08938f.png)




























