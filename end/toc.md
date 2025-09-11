# 目录

> 请暂时原谅这个丑陋的目录...


- [前言](https://zouyingjie.github.io/cloudnativenotes/end/about.html)

---

## 通用设计

**数据建模**

| 章节 | 状态 | 字数 |
|:---|:---|:---|
| [DBMS 的演进](https://zouyingjie.github.io/cloudnativenotes/common-design/modeling/history.html)|  <font color=#90EE90>Done</font> |  2331 字|
| [数据库索引的设计与优化](https://zouyingjie.github.io/cloudnativenotes/common-design/modeling/index.html) |  <font color=#FFD700>Plan</font>  | 0 字|
| [MySQL 开发规范](https://zouyingjie.github.io/cloudnativenotes/common-design/modeling/mysql.html) |  <font color=#90EE90>Doing</font>  | 688字|
| [NoSQL 建模规范](https://zouyingjie.github.io/cloudnativenotes/common-design/modeling/nosql.html) |  <font color=#FFD700>Plan</font> |  0 字|

**API 设计**

| 章节 | 状态 | 字数 |
|:---|:---|:---|
| [WEB API 设计规范](https://zouyingjie.github.io/cloudnativenotes/common-design/api/rest.html) |  <font color=#006400>Done</font>  |  4050 字|
| [WEB API 路径设计哪家强](https://zouyingjie.github.io/cloudnativenotes/common-design/api/webapi.html) |  <font color=#006400>Done</font>  | 2629 字|

**认证与授权**

| 章节 | 状态 | 字数 |
|:---|:---|:---|
| [方案概览](https://zouyingjie.github.io/cloudnativenotes/common-design/security/roadmap.html) | <font color=#006400>Done</font>  | 2930 字 |
| [身份认证](https://zouyingjie.github.io/cloudnativenotes/common-design/security/auth.html) | <font color=#006400>Done</font>  | 2038 字 |
| [授权管理](https://zouyingjie.github.io/cloudnativenotes/common-design/security/permission.html) | <font color=#006400>Done</font>  | 2319 字 |



## 分布式系统-工程篇

| 章节 | 状态 | 字数 |
|:---|:---|:---|
| [分布式锁的设计](https://zouyingjie.github.io/cloudnativenotes/distributed-system-engineering/distributed-lock.html) | <font color=#006400>Done</font> | 2907 字|
| [分布式唯一 ID](https://zouyingjie.github.io/cloudnativenotes/distributed-system-engineering/uniqueid.html) | <font color=#006400>Done</font> | 1827 字|
| 分布式任务调度| <font color=#FFD700>Plan</font> | 0 字|
| 分布式会话| <font color=#FFD700>Plan</font> | 0 字|


## 分布式系统-理论篇

| 章节 | 状态 | 字数 |
|:---|:---|:---|
| 数据分片与复制 | <font color=#FFD700>Plan</font> | 0 字|
| 一致性与共识算法 | <font color=#FFD700>Plan</font> | 0 字|
| 分布式事务 | <font color=#FFD700>Plan</font> | 0 字|
| 分布式时钟 | <font color=#FFD700>Plan</font> | 0 字|


## 云原生架构
### 什么是云原生

| 章节 | 状态 | 字数 |
|:---|:---|:---|
| [系统架构的演进](https://zouyingjie.github.io/cloudnativenotes/cloudnative/architecture/architecture.html) | <font color=#006400>Done</font> | 1746 字|
| [云原生的定义](https://zouyingjie.github.io/cloudnativenotes/cloudnative/architecture/definition.html) | <font color=#006400>Done</font> | 1116 字|
| [云原生平台的构建](https://zouyingjie.github.io/cloudnativenotes/cloudnative/architecture/pass.html) | <font color=#90EE90>Doing</font>  | 315 字|
### 不可变基础设施
  
**容器**
| 章节 | 状态 | 字数 |
|:---|:---|:---|
| [容器基础技术：namespace](https://zouyingjie.github.io/cloudnativenotes/cloudnative/container/docker-namespace.html) |  <font color=#006400>Done</font>  | 6439 字|
| [容器基础技术：cgroups](https://zouyingjie.github.io/cloudnativenotes/cloudnative/container/docker-cgroups.html) |  <font color=#90EE90>Doing</font>  | 2305 字|
| 容器基础技术：文件系统 | <font color=#FFD700>Plan</font> | 0 字|
| 容器基础技术：设备映射 | <font color=#FFD700>Plan</font> | 0 字|
| [Docker最佳实践](https://zouyingjie.github.io/cloudnativenotes/cloudnative/container/docker.html) | <font color=#006400>Done</font>  | 1033 字|

**Kubernetes**

| 章节 | 状态 | 字数 |
|:---|:---|:---|
| [集群架构](https://zouyingjie.github.io/cloudnativenotes/cloudnative/kubernetes/architecture.html) | <font color=#006400>Done</font>  | 2629 字|
| [Pod 使用](https://zouyingjie.github.io/cloudnativenotes/cloudnative/kubernetes/pod.html) | <font color=#006400>Done</font>  | 5022 字|
| [控制器对象](https://zouyingjie.github.io/cloudnativenotes/cloudnative/kubernetes/controller.html) | <font color=#006400>Done</font>  | 7211 字|
| [配置管理](https://zouyingjie.github.io/cloudnativenotes/cloudnative/kubernetes/config.html) | <font color=#006400>Done</font>  | 1084 字|
| [网络原理](https://zouyingjie.github.io/cloudnativenotes/cloudnative/kubernetes/network.html) | <font color=#006400>Done</font>  | 15799 字|
| [存储原理](https://zouyingjie.github.io/cloudnativenotes/cloudnative/kubernetes/storage.html) | <font color=#006400>Done</font>  | 5921 字|
| [调度原理](https://zouyingjie.github.io/cloudnativenotes/cloudnative/kubernetes/scheduler.html) | <font color=#006400>Done</font>  | 4712 字|
| [安全机制](https://zouyingjie.github.io/cloudnativenotes/cloudnative/kubernetes/security.html) | <font color=#006400>Done</font>  | 10721 字|
| [应用封装与扩展](https://zouyingjie.github.io/cloudnativenotes/cloudnative/kubernetes/application.html) | <font color=#006400>Done</font>  | 6152 字|
| [集群监控与Debug](https://zouyingjie.github.io/cloudnativenotes/cloudnative/kubernetes/monitoring.html) | <font color=#006400>Done</font>  | 3832 字|

**服务网格**
| 章节 | 状态 | 字数 |
|:---|:---|:---|
| [服务通信的演进](https://zouyingjie.github.io/cloudnativenotes/cloudnative/servicemesh/communication.html) |  <font color=#006400>Done</font>  | 2876 字|
| 服务网格的设计 |  <font color=#FFD700>Plan</font>  | 0 字|
| 服务网格的生态与未来 |  <font color=#FFD700>Plan</font>  | 0 字|

**服务治理**
| 章节 | 状态 | 字数 |
|:---|:---|:---|
| [服务依赖管理](https://zouyingjie.github.io/cloudnativenotes/cloudnative/service/dependency.html) |  <font color=#006400>Done</font>  | 499 字|
| [服务整栈编排](https://zouyingjie.github.io/cloudnativenotes/cloudnative/service/stack.html) |  <font color=#006400>Done</font>  | 1101字|
| [服务注册与发现](https://zouyingjie.github.io/cloudnativenotes/cloudnative/service/discovery.html) |  <font color=#90EE90>Doing</font>  | 414 字 |
| 服务生命周期管理 |  <font color=#FFD700>Plan</font>  | 0 字|



**流量治理**
| 章节 | 状态 | 字数 |
|:---|:---|:---|
| 负载均衡 | <font color=#FFD700>Plan</font>  | 0 字|
| 流量路由 | <font color=#FFD700>Plan</font>  | 0 字|
| 限流设计 | <font color=#FFD700>Plan</font>  | 0 字|
| 流量镜像 |  <font color=#FFD700>Plan</font>  | 0 字|

**可观测性**
| 章节 | 状态 | 字数 |
|:---|:---|:---|
| [什么是可观测性](https://zouyingjie.github.io/cloudnativenotes/cloudnative/observability/definition.html) | <font color=#006400>Done</font>  | 881 字|
| [指标](https://zouyingjie.github.io/cloudnativenotes/cloudnative/observability/metrics.html) | <font color=#006400>Done</font>  | 1985 字|
| [日志](https://zouyingjie.github.io/cloudnativenotes/cloudnative/observability/logging.html) | <font color=#90EE90>Doing</font>   | 2668 字|
| [追踪](https://zouyingjie.github.io/cloudnativenotes/cloudnative/observability/trace.html) | <font color=#FFD700>Plan</font>  | 0 字|
| [全栈监控系统架构](https://zouyingjie.github.io/cloudnativenotes/cloudnative/observability/monitoring.html) | <font color=#006400>Done</font>  | 4829 字|

**DevOps**
| 章节 | 状态 | 字数 |
|:---|:---|:---|
| [打造企业 DevOps 文化](https://zouyingjie.github.io/cloudnativenotes/cloudnative/devops/devops.html) | <font color=#006400>Done</font>  | 2430 字|
| [软件开发工作流](https://zouyingjie.github.io/cloudnativenotes/cloudnative/devops/gitflow.html) | <font color=#006400>Done</font>  |  2953 字|
| [CI/CD 最佳实践](https://zouyingjie.github.io/cloudnativenotes/cloudnative/devops/cicd.html) | <font color=#006400>Done</font>  | 3683 字|

---

## 何以为架构师

| 章节 | 状态 | 字数 |
|:---|:---|:---|
| [架构师的职责](https://zouyingjie.github.io/cloudnativenotes/end/responsibility.html) | <font color=#008000>Done</font>  | 1493 字|
| [架构师的视角](https://zouyingjie.github.io/cloudnativenotes/end/perspective.html) | <font color=#008000>Done</font>  | 259 字 |
| [架构师的学习](https://zouyingjie.github.io/cloudnativenotes/end/learn.html) | <font color=#008000>Done</font> | 1446 字 |



## 后记

- [后记：那些平淡的一天](https://zouyingjie.github.io/cloudnativenotes/end/dots.html)