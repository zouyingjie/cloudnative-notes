import{_ as t,r as p,c as o,o as c,b as s,a as i,d as a,e as l}from"./app-C-eiXR-Q.js";const u={},r={href:"https://kustomize.io/",target:"_blank",rel:"noopener noreferrer"},d={href:"https://helm.sh/",target:"_blank",rel:"noopener noreferrer"},v={href:"https://helm.sh/docs/",target:"_blank",rel:"noopener noreferrer"},m={href:"https://learning.oreilly.com/library/view/learning-helm/9781492083641/",target:"_blank",rel:"noopener noreferrer"},k={href:"https://chartmuseum.com/",target:"_blank",rel:"noopener noreferrer"},b={href:"https://github.com/operator-framework/awesome-operators",target:"_blank",rel:"noopener noreferrer"},y={href:"https://tiewei.github.io/posts/kubebuilder-vs-operator-sdk",target:"_blank",rel:"noopener noreferrer"},g={href:"https://github.com/fabric8io/kubernetes-client",target:"_blank",rel:"noopener noreferrer"};function h(f,n){const e=p("ExternalLinkIcon");return c(),o("div",null,[n[23]||(n[23]=s("h1",{id:"应用封装与扩展",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#应用封装与扩展","aria-hidden":"true"},"#"),a(" 应用封装与扩展")],-1)),n[24]||(n[24]=s("h3",{id:"_1-kustomize",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#_1-kustomize","aria-hidden":"true"},"#"),a(" 1. Kustomize")],-1)),n[25]||(n[25]=s("p",null,"当我们需要在 Kubernetes 部署应用时，往往是编写许多 yaml 文件来部署各种资源对象，并且同一个应用针对不同的环境可能需要编写不同的 yaml 文件，这个过程往往非常繁琐。",-1)),s("p",null,[n[1]||(n[1]=a("为了解决这个问题 Kubernetes 推出了 ",-1)),s("a",r,[n[0]||(n[0]=a("Kustomize",-1)),l(e)]),n[2]||(n[2]=a(" 工具，官方称为 Kubernetes 原生配置管理工具。Kustomize 将我们应用部署所需要的信息分为不变的 base 配置和容易变化 overlay 配置，最终将文件合起来成为一个完整的定义文件。类似于 Docker 镜像分层的概念，最终所有的层次合并起来成为一个完整的应用镜像。",-1))]),n[26]||(n[26]=i(`<p>Kustomize 最常见的用途就是根据不同的环境生成不同的部署文件，在基准 base 文件的基础上，定义不同的 Overlay 文件，在通过 Kustomization 文件的定义进行整合。</p><ul><li>base 文件，基准 yaml 文件</li><li>overlay 文件，针对不同需求设置的 yaml 文件</li><li>Kustomization.yaml：整合 base 和 overlay 以生成完整的部署配置。</li></ul><p>kubectl 命令已经内置了 kustomize 命令，当我们定义好上述文件后，可以通过 kubectl kustomize overlays/dev 查看生成的部署内容，通过 <code>kubectl apply -k overlays/dev</code>直接执行部署。</p><p>下面是一个简单的示例，我们部署一个应用，在测试环境部署一个 1 个副本并且使用 test 镜像，在生产环境部署 5 个副本并使用最新的镜像。正常情况下我们需要定义两个完整的 yaml 文件分别去生产和测试环境部署，如果使用 Kustomize 可以想下面这样定义：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ tree app
app
<span class="token operator">|</span>-- base
<span class="token operator">|</span>   <span class="token operator">|</span>-- deployment.yml
<span class="token operator">|</span>   <span class="token operator">|</span>-- kustomization.yaml
<span class="token operator">|</span>   <span class="token operator">|</span>-- service.yaml
<span class="token variable"><span class="token variable">\`</span>-- overlays
    <span class="token operator">|</span>-- dev
    <span class="token operator">|</span>   <span class="token operator">|</span>-- deployment.yml
    <span class="token operator">|</span>   <span class="token variable">\`</span></span>-- kustomization.yaml
    <span class="token variable"><span class="token variable">\`</span>-- prod
        <span class="token operator">|</span>-- deployment.yml
        <span class="token variable">\`</span></span>-- kustomization.yaml
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>首先我们定义 base 文件以及 kustomization 文件：</p><ul><li>Deployment 文件</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> apps/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Deployment
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">replicas</span><span class="token punctuation">:</span> <span class="token number">3</span>
  <span class="token key atrule">selector</span><span class="token punctuation">:</span>
    <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
      <span class="token key atrule">app</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
  <span class="token key atrule">template</span><span class="token punctuation">:</span>
    <span class="token key atrule">metadata</span><span class="token punctuation">:</span>
      <span class="token key atrule">labels</span><span class="token punctuation">:</span>
        <span class="token key atrule">app</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
    <span class="token key atrule">spec</span><span class="token punctuation">:</span>
      <span class="token key atrule">containers</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> app
        <span class="token key atrule">image</span><span class="token punctuation">:</span> foo/bar<span class="token punctuation">:</span>latest
        <span class="token key atrule">ports</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> http
          <span class="token key atrule">containerPort</span><span class="token punctuation">:</span> <span class="token number">8080</span>
          <span class="token key atrule">protocol</span><span class="token punctuation">:</span> TCP
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>Service 文件</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Service
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>service
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">ports</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> http
    <span class="token key atrule">port</span><span class="token punctuation">:</span> <span class="token number">8080</span>
  <span class="token key atrule">selector</span><span class="token punctuation">:</span>
    <span class="token key atrule">app</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>Kustomization 文件</li></ul><p>通过该文件将所有 base 文件整合后统一部署。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> kustomize.config.k8s.io/v1beta1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Kustomization
<span class="token key atrule">resources</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> deployment.yml
<span class="token punctuation">-</span> service.yaml
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过 <code>kubectl kustomize</code>命令查看最终导出的部署文件内容。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code>$ kubectl kustomize kustomize/base
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Service
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>service
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">ports</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> http
    <span class="token key atrule">port</span><span class="token punctuation">:</span> <span class="token number">8080</span>
  <span class="token key atrule">selector</span><span class="token punctuation">:</span>
    <span class="token key atrule">app</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
<span class="token punctuation">---</span>
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> apps/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Deployment
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">replicas</span><span class="token punctuation">:</span> <span class="token number">3</span>
  <span class="token key atrule">selector</span><span class="token punctuation">:</span>
    <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
      <span class="token key atrule">app</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
  <span class="token key atrule">template</span><span class="token punctuation">:</span>
    <span class="token key atrule">metadata</span><span class="token punctuation">:</span>
      <span class="token key atrule">labels</span><span class="token punctuation">:</span>
        <span class="token key atrule">app</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
    <span class="token key atrule">spec</span><span class="token punctuation">:</span>
      <span class="token key atrule">containers</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">image</span><span class="token punctuation">:</span> foo/bar<span class="token punctuation">:</span>latest
        <span class="token key atrule">name</span><span class="token punctuation">:</span> app
        <span class="token key atrule">ports</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> <span class="token key atrule">containerPort</span><span class="token punctuation">:</span> <span class="token number">8080</span>
          <span class="token key atrule">name</span><span class="token punctuation">:</span> http
          <span class="token key atrule">protocol</span><span class="token punctuation">:</span> TCP
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>有了 base 后我们针对 dev 和 prod 环境做不同的设置，</p><ul><li>test 环境，设置副本为 1，镜像为 test</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> apps/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Deployment
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">replicas</span><span class="token punctuation">:</span> <span class="token number">1</span>
  <span class="token key atrule">template</span><span class="token punctuation">:</span>
    <span class="token key atrule">spec</span><span class="token punctuation">:</span>
      <span class="token key atrule">containers</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">image</span><span class="token punctuation">:</span> foo/bar<span class="token punctuation">:</span>test
        <span class="token key atrule">name</span><span class="token punctuation">:</span> app


<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> kustomize.config.k8s.io/v1beta1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Kustomization
<span class="token key atrule">bases</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> ../../base
<span class="token key atrule">patchesStrategicMerge</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> deployment.yml
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>完成后通过 <code>kubectl kustomize overlays/dev</code> 查看</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code>$ kubectl kustomize overlays/dev
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Service
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>service
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">ports</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> http
    <span class="token key atrule">port</span><span class="token punctuation">:</span> <span class="token number">8080</span>
  <span class="token key atrule">selector</span><span class="token punctuation">:</span>
    <span class="token key atrule">app</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
<span class="token punctuation">---</span>
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> apps/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Deployment
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">replicas</span><span class="token punctuation">:</span> <span class="token number">1</span>
  <span class="token key atrule">selector</span><span class="token punctuation">:</span>
    <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
      <span class="token key atrule">app</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
  <span class="token key atrule">template</span><span class="token punctuation">:</span>
    <span class="token key atrule">metadata</span><span class="token punctuation">:</span>
      <span class="token key atrule">labels</span><span class="token punctuation">:</span>
        <span class="token key atrule">app</span><span class="token punctuation">:</span> frontend<span class="token punctuation">-</span>deployment
    <span class="token key atrule">spec</span><span class="token punctuation">:</span>
      <span class="token key atrule">containers</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">image</span><span class="token punctuation">:</span> foo/bar<span class="token punctuation">:</span>test
        <span class="token key atrule">name</span><span class="token punctuation">:</span> app
        <span class="token key atrule">ports</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> <span class="token key atrule">containerPort</span><span class="token punctuation">:</span> <span class="token number">8080</span>
          <span class="token key atrule">name</span><span class="token punctuation">:</span> http
          <span class="token key atrule">protocol</span><span class="token punctuation">:</span> TCP
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到副本是 1，镜像 tag 是 test，此时执行 <code>kubectl apply -k overlays/dev</code> 命令就可以直接部署上述配置了。</p><p>通过 kustomize 我们可以将部署所需的文件在 base 里面一次写好，后续不同的开发、运维人员如果不用不同的配置，只需要增加 overlay 来打补丁就行了。使用 overlay 打补丁的好处时既不会像 Ansible 那样需要通过字符替换对元文件造成入侵，也不需要学习额外的 DSL 语法。只需要定义好 yaml 通过一条命令就可以将方服务一次性部署好。</p><p>Kustomize 还可以生成 ConfigMap、Secret 等对象，具体细节可以参考 文档，另外通过 https://kustomize.io/tutorial 可以通过上传自己的 yaml 文件然后在线编辑生成 kustomize 文件。</p><h3 id="_2-helm" tabindex="-1"><a class="header-anchor" href="#_2-helm" aria-hidden="true">#</a> 2. Helm</h3><p>Kustomize 本身可以使我们以相对便捷的方式分离开发和运维工作，优点是轻量便捷，但其功能也相对不足。虽然能简化对不同场景下的重复配置，但其实我们该写的配置还是要写，只是不用重复写而已，并且除了安装部署外，应用还有更新、回滚、多版本、依赖项维护等操作，Kustomize 无法完善的提供。</p>`,25)),s("p",null,[n[4]||(n[4]=a("为了解决 Kubernetes 中应用部署维护的问题，后续出现了 ",-1)),s("a",d,[n[3]||(n[3]=a("Helm",-1)),l(e)]),n[5]||(n[5]=a(" ，其定位很简单：",-1))]),n[27]||(n[27]=s("blockquote",null,[s("p",null,"操作系统中都有包管理器，比如 ubuntu 有 apt-get 和 dpkg 格式的包，RHEL 系的有 yum 和 RPM 格式的包，而 Kubernetes 作为云原生时代的操作系统，Helm 就是要成为这个操作系统的应用包管理工具。")],-1)),n[28]||(n[28]=s("p",null,"Helm 提供格式为 chart 的包管理，通过 Helm 包管理器，我们可以很方便的从应用仓库下载、安装部署、升级、回滚、卸载程序，并且仓库中有完整的依赖管理和版本变更信息",-1)),s("p",null,[n[8]||(n[8]=a("关于具体操作可以参考 ",-1)),s("a",v,[n[6]||(n[6]=a("官方文档",-1)),l(e)]),n[9]||(n[9]=a(" 和动物园的书籍 ",-1)),s("a",m,[n[7]||(n[7]=a("《Learning Helm》",-1)),l(e)]),n[10]||(n[10]=a("，中文翻译版叫《Helm学习指南：Kubernetes上的应用程序管理》，这里仅做一个入门性质的介绍。",-1))]),n[29]||(n[29]=i(`<h4 id="_2-1-应用安装" tabindex="-1"><a class="header-anchor" href="#_2-1-应用安装" aria-hidden="true">#</a> 2.1 应用安装</h4><p>首先看一下如何使用 helm 来安装、部署应用，我们可以用 apt-get 的作对比，在 Ubuntu 安装某应用时，我们需要添加某个仓库地址，然后执行 <code>sudo apt-get update</code>，完成后才会执行 <code>sudo apt-get install &lt;name&gt;</code> 安装应用。Helm 的使用和 apt-get 命令的步骤基本一致，如下：</p><ol><li>添加仓库并更新</li></ol><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ helm repo <span class="token function">add</span> bitnami https://charts.bitnami.com/bitnami
<span class="token string">&quot;bitnami&quot;</span> has been added to your repositories

$ helm repo update
Hang tight <span class="token keyword">while</span> we grab the latest from your chart repositories<span class="token punctuation">..</span>.
<span class="token punctuation">..</span>.Successfully got an update from the <span class="token string">&quot;bitnami&quot;</span> chart repository
Update Complete. ⎈Happy Helming<span class="token operator">!</span>⎈
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>安装应用</li></ol><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ helm <span class="token function">install</span> bitnami/mysql --generate-name
NAME: mysql-1638139621
LAST DEPLOYED: Mon Nov <span class="token number">29</span> 06:47:04 <span class="token number">2021</span>
NAMESPACE: default
STATUS: deployed
REVISION: <span class="token number">1</span>
TEST SUITE: None
NOTES:
CHART NAME: mysql
CHART VERSION: <span class="token number">8.8</span>.13
APP VERSION: <span class="token number">8.0</span>.27

** Please be patient <span class="token keyword">while</span> the chart is being deployed **

Tip:
    <span class="token punctuation">..</span><span class="token punctuation">..</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="3"><li>查看应用状态</li></ol><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
$ helm list
NAME            	NAMESPACE	REVISION	UPDATED                                	STATUS  	CHART            	APP VERSION
mysql-1638139621	default  	<span class="token number">1</span>       	<span class="token number">2021</span>-11-29 06:47:04.581748474 +0800 CST	deployed	mysql-8.8.13     	<span class="token number">8.0</span>.27

$ helm status mysql-1638139621
NAME: mysql-1638139621
LAST DEPLOYED: Mon Nov <span class="token number">29</span> 06:47:04 <span class="token number">2021</span>
NAMESPACE: default
STATUS: deployed
REVISION: <span class="token number">1</span>
TEST SUITE: None
NOTES:
CHART NAME: mysql
CHART VERSION: <span class="token number">8.8</span>.13
APP VERSION: <span class="token number">8.0</span>.27

** Please be patient <span class="token keyword">while</span> the chart is being deployed **

Tip:

  Watch the deployment status using the command: kubectl get pods <span class="token parameter variable">-w</span> <span class="token parameter variable">--namespace</span> default

Services:

  <span class="token builtin class-name">echo</span> Primary: mysql-1638139621.default.svc.cluster.local:3306
<span class="token punctuation">..</span>.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当然我们也可以直接查看 Kubernetes 的对象</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl get statefulsets.apps
NAME               READY   AGE
mysql-1638139621   <span class="token number">0</span>/1     13s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="4"><li>卸载应用</li></ol><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ helm uninstall mysql-1638139621
release <span class="token string">&quot;mysql-1638139621&quot;</span> uninstalled

$ kubectl get statefulsets.apps
No resources found <span class="token keyword">in</span> default namespace.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-2-应用创建" tabindex="-1"><a class="header-anchor" href="#_2-2-应用创建" aria-hidden="true">#</a> 2.2 应用创建</h4><p>Helm 有三个主要概念：</p><ul><li><strong>Chart</strong>：Helm 提出的包封装格式，就是 Ubuntu 中的 dpkg 包一样，用来封装我们的应用，包含所有的依赖信息。比如我们上面安装的 MySQL，就是一个完整的 Chart。</li><li><strong>Release</strong>: 相当于版本，Kubernetes 经常针对一个应用部署多个版本，每个版本就是一个 Release。</li><li><strong>Repository</strong>：应用仓库，用来存储 Chart。</li></ul><p>下面简单看下如何编写一个 Chart</p><ol><li>创建 chart</li></ol><p>Helm 提供了 create 命令供我们快速创建 chart。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ helm create  my-app
Creating my-app

$ tree my-app
my-app
<span class="token operator">|</span>-- charts
<span class="token operator">|</span>-- Chart.yaml
<span class="token operator">|</span>-- templates
<span class="token operator">|</span>   <span class="token operator">|</span>-- deployment.yaml
<span class="token operator">|</span>   <span class="token operator">|</span>-- _helpers.tpl
<span class="token operator">|</span>   <span class="token operator">|</span>-- hpa.yaml
<span class="token operator">|</span>   <span class="token operator">|</span>-- ingress.yaml
<span class="token operator">|</span>   <span class="token operator">|</span>-- NOTES.txt
<span class="token operator">|</span>   <span class="token operator">|</span>-- serviceaccount.yaml
<span class="token operator">|</span>   <span class="token operator">|</span>-- service.yaml
<span class="token operator">|</span>   <span class="token variable"><span class="token variable">\`</span>-- tests
<span class="token operator">|</span>       <span class="token variable">\`</span></span>-- test-connection.yaml
\`-- values.yaml
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>指定名称执行命令后会自动生成同名目录以及相关文件：</p><ul><li><strong>charts 目录</strong>: 存储依赖的 chart</li><li><strong>Chart.yaml</strong>：存放 chart 的元信息以及一些 chart 空间。</li><li><strong>template 目录</strong>：存放最终生成 Kubernetes 清单 yaml 的模板文件</li><li><strong>template.test</strong>: 测试文件，不会被按安装到集群中，可以由 helm test 执行测试。</li><li><strong>values.yaml</strong>：定义值，在 helm 渲染模板时传递给模板覆盖默认值。</li></ul><p>默认生成的 chart 是一个 Nginx 的应用，我们可以直接安装运行</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ helm <span class="token function">install</span> nginx-1-16  <span class="token builtin class-name">.</span>
NAME: nginx-1-16
LAST DEPLOYED: Tue Nov <span class="token number">30</span> 06:17:38 <span class="token number">2021</span>
NAMESPACE: default
STATUS: deployed
REVISION: <span class="token number">1</span>
NOTES:
<span class="token number">1</span>. Get the application URL by running these commands:
  <span class="token builtin class-name">export</span> <span class="token assign-left variable">POD_NAME</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span>kubectl get pods <span class="token parameter variable">--namespace</span> default <span class="token parameter variable">-l</span> <span class="token string">&quot;app.kubernetes.io/name=my-app,app.kubernetes.io/instance=nginx-1-16&quot;</span> <span class="token parameter variable">-o</span> <span class="token assign-left variable">jsonpath</span><span class="token operator">=</span><span class="token string">&quot;{.items[0].metadata.name}&quot;</span><span class="token variable">)</span></span>
  <span class="token builtin class-name">export</span> <span class="token assign-left variable">CONTAINER_PORT</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span>kubectl get pod <span class="token parameter variable">--namespace</span> default $POD_NAME <span class="token parameter variable">-o</span> <span class="token assign-left variable">jsonpath</span><span class="token operator">=</span><span class="token string">&quot;{.spec.containers[0].ports[0].containerPort}&quot;</span><span class="token variable">)</span></span>
  <span class="token builtin class-name">echo</span> <span class="token string">&quot;Visit http://127.0.0.1:8080 to use your application&quot;</span>
  kubectl <span class="token parameter variable">--namespace</span> default port-forward <span class="token variable">$POD_NAME</span> <span class="token number">8080</span>:<span class="token variable">$CONTAINER_PORT</span>

$ kubectl get deployments.apps
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
nginx-1-16-my-app     <span class="token number">1</span>/1     <span class="token number">1</span>            <span class="token number">1</span>           56s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到 Nginx 的 Deployment 已经创建好了。下面是它的 Deployment 的模板和 values.yaml 部分内容：</p><ul><li>templates/deployment.yaml</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> apps/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Deployment
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">{</span> include &quot;my<span class="token punctuation">-</span>app.fullname&quot; . <span class="token punctuation">}</span><span class="token punctuation">}</span>
  <span class="token key atrule">labels</span><span class="token punctuation">:</span>
    <span class="token punctuation">{</span><span class="token punctuation">{</span><span class="token punctuation">-</span> include &quot;my<span class="token punctuation">-</span>app.labels&quot; . <span class="token punctuation">|</span> nindent 4 <span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token punctuation">{</span><span class="token punctuation">{</span><span class="token punctuation">-</span> if not .Values.autoscaling.enabled <span class="token punctuation">}</span><span class="token punctuation">}</span>
  <span class="token key atrule">replicas</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">{</span> .Values.replicaCount <span class="token punctuation">}</span><span class="token punctuation">}</span>
  <span class="token punctuation">{</span><span class="token punctuation">{</span><span class="token punctuation">-</span> end <span class="token punctuation">}</span><span class="token punctuation">}</span>
  <span class="token key atrule">selector</span><span class="token punctuation">:</span>
    <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
      <span class="token punctuation">{</span><span class="token punctuation">{</span><span class="token punctuation">-</span> include &quot;my<span class="token punctuation">-</span>app.selectorLabels&quot; . <span class="token punctuation">|</span> nindent 6 <span class="token punctuation">}</span><span class="token punctuation">}</span>
  <span class="token key atrule">template</span><span class="token punctuation">:</span>
    <span class="token key atrule">metadata</span><span class="token punctuation">:</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>values.yaml</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token comment"># Default values for my-app.</span>
<span class="token comment"># This is a YAML-formatted file.</span>
<span class="token comment"># Declare variables to be passed into your templates.</span>

<span class="token key atrule">replicaCount</span><span class="token punctuation">:</span> <span class="token number">1</span>

<span class="token key atrule">image</span><span class="token punctuation">:</span>
  <span class="token key atrule">repository</span><span class="token punctuation">:</span> nginx
  <span class="token key atrule">pullPolicy</span><span class="token punctuation">:</span> IfNotPresent
  <span class="token comment"># Overrides the image tag whose default is the chart appVersion.</span>
  <span class="token key atrule">tag</span><span class="token punctuation">:</span> <span class="token string">&quot;&quot;</span>

<span class="token key atrule">imagePullSecrets</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
<span class="token key atrule">nameOverride</span><span class="token punctuation">:</span> <span class="token string">&quot;&quot;</span>
<span class="token key atrule">fullnameOverride</span><span class="token punctuation">:</span> <span class="token string">&quot;&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到最终部署的对象是基于 template 和 values 渲染出来的。现在我们需要部署一个 3 节点的 Nginx ，将 values.yaml 中的 replicaCount 改成 3 然后执行部署。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code>
\`\`\`bash
$ cd ~/helm<span class="token punctuation">-</span>chart/my<span class="token punctuation">-</span>app$ kubectl get deployments.apps
$ helm install nginx<span class="token punctuation">-</span>1<span class="token punctuation">-</span>16<span class="token punctuation">-</span>3 .
<span class="token key atrule">NAME</span><span class="token punctuation">:</span> nginx<span class="token punctuation">-</span>1<span class="token punctuation">-</span>16<span class="token punctuation">-</span><span class="token number">33</span>
<span class="token key atrule">LAST DEPLOYED</span><span class="token punctuation">:</span> Tue Nov 30 22<span class="token punctuation">:</span>08<span class="token punctuation">:</span>47 2021
<span class="token key atrule">NAMESPACE</span><span class="token punctuation">:</span> default
<span class="token key atrule">STATUS</span><span class="token punctuation">:</span> deployed
<span class="token key atrule">REVISION</span><span class="token punctuation">:</span> <span class="token number">1</span>
<span class="token key atrule">NOTES</span><span class="token punctuation">:</span>
<span class="token key atrule">1. Get the application URL by running these commands</span><span class="token punctuation">:</span>
  export POD_NAME=$(kubectl get pods <span class="token punctuation">-</span><span class="token punctuation">-</span>namespace default <span class="token punctuation">-</span>l &quot;app.kubernetes.io/name=my<span class="token punctuation">-</span>app<span class="token punctuation">,</span>app.kubernetes.io/instance=nginx<span class="token punctuation">-</span>1<span class="token punctuation">-</span>16<span class="token punctuation">-</span>3&quot; <span class="token punctuation">-</span>o jsonpath=&quot;<span class="token punctuation">{</span>.items<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span>.metadata.name<span class="token punctuation">}</span>&quot;)
  export CONTAINER_PORT=$(kubectl get pod <span class="token punctuation">-</span><span class="token punctuation">-</span>namespace default $POD_NAME <span class="token punctuation">-</span>o jsonpath=&quot;<span class="token punctuation">{</span>.spec.containers<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span>.ports<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span>.containerPort<span class="token punctuation">}</span>&quot;)
  echo &quot;Visit http<span class="token punctuation">:</span>//127.0.0.1<span class="token punctuation">:</span>8080 to use your application&quot;
  kubectl <span class="token punctuation">-</span><span class="token punctuation">-</span>namespace default port<span class="token punctuation">-</span>forward $POD_NAME 8080<span class="token punctuation">:</span>$CONTAINER_PORT



$ cd ~/helm<span class="token punctuation">-</span>chart/my<span class="token punctuation">-</span>app$ kubectl get deployments.apps
NAME                   READY   UP<span class="token punctuation">-</span>TO<span class="token punctuation">-</span>DATE   AVAILABLE   AGE

nginx<span class="token punctuation">-</span>1<span class="token punctuation">-</span>16<span class="token punctuation">-</span>3<span class="token punctuation">-</span>my<span class="token punctuation">-</span>app   3/3     3            3           7s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到我们修改之后副本为 3 个的新的 chart 已经部署好了。</p><h4 id="_2-3-应用发布" tabindex="-1"><a class="header-anchor" href="#_2-3-应用发布" aria-hidden="true">#</a> 2.3 应用发布</h4><p>Chart 写好后我们就可以发布到存储库了，所有 chart 的存储库都含有一个 index.yaml 索引文件，记录了所有可用的 chart 及其版本以及各自的下载位置。下面是一个 index.yaml 的实例：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">entries</span><span class="token punctuation">:</span>
  <span class="token key atrule">first-chart</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v2
    <span class="token key atrule">appVersion</span><span class="token punctuation">:</span> 1.16.0
    <span class="token key atrule">created</span><span class="token punctuation">:</span> <span class="token string">&quot;2021-11-30T06:46:36.769746109+08:00&quot;</span>
    <span class="token key atrule">description</span><span class="token punctuation">:</span> A Helm chart for Kubernetes
    <span class="token key atrule">digest</span><span class="token punctuation">:</span> 5dff0cfeafa00d9a87e9989586de3deda436a05fca118df03aa3469221866a8d
    <span class="token key atrule">name</span><span class="token punctuation">:</span> first<span class="token punctuation">-</span>chart
    <span class="token key atrule">type</span><span class="token punctuation">:</span> application
    <span class="token key atrule">urls</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> src/first<span class="token punctuation">-</span>chart<span class="token punctuation">-</span>0.1.0.tgz
    <span class="token key atrule">version</span><span class="token punctuation">:</span> 0.1.0
  <span class="token key atrule">my-app</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v2
    <span class="token key atrule">appVersion</span><span class="token punctuation">:</span> 1.16.0
    <span class="token key atrule">created</span><span class="token punctuation">:</span> <span class="token string">&quot;2021-11-30T06:46:36.770983392+08:00&quot;</span>
    <span class="token key atrule">description</span><span class="token punctuation">:</span> A Helm chart for Kubernetes
    <span class="token key atrule">digest</span><span class="token punctuation">:</span> 8256153f37ed0071e81fa2fe914e7bcf82e914bec951dadc5f2645faa38c4021
    <span class="token key atrule">name</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>app
    <span class="token key atrule">type</span><span class="token punctuation">:</span> application
    <span class="token key atrule">urls</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> src/my<span class="token punctuation">-</span>app<span class="token punctuation">-</span>0.2.0.tgz
    <span class="token key atrule">version</span><span class="token punctuation">:</span> 0.2.0
  <span class="token punctuation">-</span> <span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v2
    <span class="token key atrule">appVersion</span><span class="token punctuation">:</span> 1.16.0
    <span class="token key atrule">created</span><span class="token punctuation">:</span> <span class="token string">&quot;2021-11-30T06:46:36.770313312+08:00&quot;</span>
    <span class="token key atrule">description</span><span class="token punctuation">:</span> A Helm chart for Kubernetes
    <span class="token key atrule">digest</span><span class="token punctuation">:</span> c2865e2c9d0a74044b7d8ff5471df7fd552bc402b5240e01cf02e116ee5f800e
    <span class="token key atrule">name</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>app
    <span class="token key atrule">type</span><span class="token punctuation">:</span> application
    <span class="token key atrule">urls</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> src/my<span class="token punctuation">-</span>app<span class="token punctuation">-</span>0.1.0.tgz
    <span class="token key atrule">version</span><span class="token punctuation">:</span> 0.1.0
<span class="token key atrule">generated</span><span class="token punctuation">:</span> <span class="token string">&quot;2021-11-30T06:46:36.768952982+08:00&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到该库包含了 first-chart 和 my-app 两个 chart，my-app 有两个版本分别是 0.1.0 和 0.2.0，并且包含了各个版本的 url 下载路径。</p>`,35)),s("p",null,[n[12]||(n[12]=a("我们可以使用 ",-1)),s("a",k,[n[11]||(n[11]=a("ChartMuseum",-1)),l(e)]),n[13]||(n[13]=a("、Google 云端存储或者自己搭建静态 web 服务器来实现存储库，如果 Chart 可以公开的话 Github Pages 也是一个非常好的选择。下面以 Github Pages 为例看下如何使用存储库：",-1))]),n[30]||(n[30]=i(`<ol><li>创建 Github repo 并设置 Pages</li></ol><p>首先我们在 Github 创建一个 public 仓库 <img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/9946f2d8888386e62d8dab342e8cc41f.png" alt="在这里插入图片描述"></p><p>一个仓库创建完成后设置 Pages，选择 main 分支，表示每次 main 分支更新时都会重新部署 Github Pages 站点，如果有自定义的域名也可以设置域名。这里设置的域名是 https://zouyingjie.cn/naive-charts-repo/。</p><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/9aa32d354e49a1e67bfc09877c6315eb.png" alt="在这里插入图片描述"></p><ol start="2"><li>添加 chart 到存储库</li></ol><p>Github 仓库创建完成后，我们可以 clone 到本地然后添加 index.yaml 文件以及 Chart，将其转为真正的 chart 存储库。</p><ul><li>Clone 项目 并创建 Chart</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> clone https://github.com/zouyingjie/naive-charts-repo.git
Cloning into <span class="token string">&#39;naive-charts-repo&#39;</span><span class="token punctuation">..</span>.
remote: Enumerating objects: <span class="token number">3</span>, done.
remote: Counting objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">3</span>/3<span class="token punctuation">)</span>, done.
remote: Total <span class="token number">3</span> <span class="token punctuation">(</span>delta <span class="token number">0</span><span class="token punctuation">)</span>, reused <span class="token number">0</span> <span class="token punctuation">(</span>delta <span class="token number">0</span><span class="token punctuation">)</span>, pack-reused <span class="token number">0</span>
Unpacking objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">3</span>/3<span class="token punctuation">)</span>, done.

$ <span class="token builtin class-name">cd</span> naive-charts-repo
$ <span class="token function">mkdir</span> src

$ helm create src/naive-nginx
Creating src/naive-nginx

$ ll
total <span class="token number">8</span>.0K
-rw-rw-r-- <span class="token number">1</span> ubuntu ubuntu   <span class="token number">19</span> Nov <span class="token number">30</span> <span class="token number">22</span>:30 README.md
drwxrwxr-x <span class="token number">3</span> ubuntu ubuntu <span class="token number">4</span>.0K Nov <span class="token number">30</span> <span class="token number">22</span>:32 src

$ ll src
total <span class="token number">4</span>.0K
drwxr-xr-x <span class="token number">4</span> ubuntu ubuntu <span class="token number">4</span>.0K Nov <span class="token number">30</span> <span class="token number">22</span>:32 naive-nginx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>打包 Chart 并创建 index.yaml</li></ul><p>创建chart 后可以通过 helm package 命令打包并通过 helm repo index 命令自动生成 index.yaml 文件。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ helm package src/naive-nginx
Successfully packaged chart and saved it to: /home/ubuntu/naive-charts-repo/naive-nginx-0.1.0.tgz

$ ll
total 12K
-rw-rw-r-- <span class="token number">1</span> ubuntu ubuntu   <span class="token number">19</span> Nov <span class="token number">30</span> <span class="token number">22</span>:30 README.md
-rw-rw-r-- <span class="token number">1</span> ubuntu ubuntu <span class="token number">3</span>.7K Nov <span class="token number">30</span> <span class="token number">22</span>:33 naive-nginx-0.1.0.tgz
drwxrwxr-x <span class="token number">3</span> ubuntu ubuntu <span class="token number">4</span>.0K Nov <span class="token number">30</span> <span class="token number">22</span>:32 src



<span class="token comment"># 自动生成 index.yaml 文件</span>

$ helm repo index <span class="token builtin class-name">.</span>
$ ll
total 16K
-rw-rw-r-- <span class="token number">1</span> ubuntu ubuntu   <span class="token number">19</span> Nov <span class="token number">30</span> <span class="token number">22</span>:30 README.md
-rw-r--r-- <span class="token number">1</span> ubuntu ubuntu  <span class="token number">404</span> Nov <span class="token number">30</span> <span class="token number">22</span>:35 index.yaml
-rw-rw-r-- <span class="token number">1</span> ubuntu ubuntu <span class="token number">3</span>.7K Nov <span class="token number">30</span> <span class="token number">22</span>:33 naive-nginx-0.1.0.tgz
drwxrwxr-x <span class="token number">3</span> ubuntu ubuntu <span class="token number">4</span>.0K Nov <span class="token number">30</span> <span class="token number">22</span>:32 src
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>新生成的 index.yaml 文件内容如下：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">entries</span><span class="token punctuation">:</span>
  <span class="token key atrule">naive-nginx</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v2
    <span class="token key atrule">appVersion</span><span class="token punctuation">:</span> 1.16.0
    <span class="token key atrule">created</span><span class="token punctuation">:</span> <span class="token string">&quot;2021-11-30T22:35:53.796835302+08:00&quot;</span>
    <span class="token key atrule">description</span><span class="token punctuation">:</span> A Helm chart for Kubernetes
    <span class="token key atrule">digest</span><span class="token punctuation">:</span> 5900f92fc1c6e453b48b36f74d04a475d4694e16a9e60e1b04a449558337b525
    <span class="token key atrule">name</span><span class="token punctuation">:</span> naive<span class="token punctuation">-</span>nginx
    <span class="token key atrule">type</span><span class="token punctuation">:</span> application
    <span class="token key atrule">urls</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> naive<span class="token punctuation">-</span>nginx<span class="token punctuation">-</span>0.1.0.tgz
    <span class="token key atrule">version</span><span class="token punctuation">:</span> 0.1.0
<span class="token key atrule">generated</span><span class="token punctuation">:</span> <span class="token string">&quot;2021-11-30T22:35:53.796044446+08:00&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>完成后可以将新创建的所有文件 commit 并 push 到 Github 仓库，提交完成后我们就可以使用 Github Pages 做 chart 存储库了。</p><p>现在可以将 Github Page 的存储库添加到本地存储库了：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ helm repo <span class="token function">add</span> naive-gh-repo https://zouyingjie.cn/naive-charts-repo/
<span class="token string">&quot;naive-gh-repo&quot;</span> has been added to your repositories

$ helm repo list
NAME         	URL
bitnami      	https://charts.bitnami.com/bitnami
naive-gh-repo	https://zouyingjie.cn/naive-charts-repo/


$ helm repo update
Hang tight <span class="token keyword">while</span> we grab the latest from your chart repositories<span class="token punctuation">..</span>.
<span class="token punctuation">..</span>.Successfully got an update from the <span class="token string">&quot;naive-gh-repo&quot;</span> chart repository
<span class="token punctuation">..</span>.Successfully got an update from the <span class="token string">&quot;bitnami&quot;</span> chart repository
Update Complete. ⎈Happy Helming<span class="token operator">!</span>⎈
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>添加完仓库就可以安装 Chart ，执行 <code>helm install &lt;name&gt; &lt;chart-name&gt;</code> 安装</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ helm <span class="token function">install</span> naive-nginx-v01  naive-gh-repo/naive-nginx
NAME: naive-nginx-v01
LAST DEPLOYED: Tue Nov <span class="token number">30</span> <span class="token number">22</span>:54:49 <span class="token number">2021</span>
NAMESPACE: default
STATUS: deployed
REVISION: <span class="token number">1</span>
NOTES:
<span class="token number">1</span>. Get the application URL by running these commands:
  <span class="token builtin class-name">export</span> <span class="token assign-left variable">POD_NAME</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span>kubectl get pods <span class="token parameter variable">--namespace</span> default <span class="token parameter variable">-l</span> <span class="token string">&quot;app.kubernetes.io/name=naive-nginx,app.kubernetes.io/instance=naive-nginx-v01&quot;</span> <span class="token parameter variable">-o</span> <span class="token assign-left variable">jsonpath</span><span class="token operator">=</span><span class="token string">&quot;{.items[0].metadata.name}&quot;</span><span class="token variable">)</span></span>
  <span class="token builtin class-name">export</span> <span class="token assign-left variable">CONTAINER_PORT</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span>kubectl get pod <span class="token parameter variable">--namespace</span> default $POD_NAME <span class="token parameter variable">-o</span> <span class="token assign-left variable">jsonpath</span><span class="token operator">=</span><span class="token string">&quot;{.spec.containers[0].ports[0].containerPort}&quot;</span><span class="token variable">)</span></span>
  <span class="token builtin class-name">echo</span> <span class="token string">&quot;Visit http://127.0.0.1:8080 to use your application&quot;</span>
  kubectl <span class="token parameter variable">--namespace</span> default port-forward <span class="token variable">$POD_NAME</span> <span class="token number">8080</span>:<span class="token variable">$CONTAINER_PORT</span>

$ kubectl get pods
NAME                                    READY   STATUS             RESTARTS   AGE
naive-nginx-v01-696948788d-cjq5z        <span class="token number">1</span>/1     Running            <span class="token number">0</span>          7s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>现在将 naive-nginx 中的 replicaCount 改为 3，并将 Chart.yaml 中的版本改为 0.2.0 我们在发布一个 0.2.0 的包并重新生成 index.yaml：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ helm package src/naive-nginx
Successfully packaged chart and saved it to: /home/ubuntu/CKAD-note/naive-charts-repo/naive-nginx-0.2.0.tgz

$ helm repo index <span class="token builtin class-name">.</span>

$ <span class="token function">cat</span> index.yaml
apiVersion: v1
entries:
  naive-nginx:
  - apiVersion: v2
    appVersion: <span class="token number">1.16</span>.0
    created: <span class="token string">&quot;2021-11-30T23:02:48.05121892+08:00&quot;</span>
    description: A Helm chart <span class="token keyword">for</span> Kubernetes
    digest: 466755358c9c3e7ba36497c57485ba98754302d483b0c73a9a79565a3465d739
    name: naive-nginx
    type: application
    urls:
    - naive-nginx-0.2.0.tgz
    version: <span class="token number">0.2</span>.0
  - apiVersion: v2
    appVersion: <span class="token number">1.16</span>.0
    created: <span class="token string">&quot;2021-11-30T23:02:48.049967356+08:00&quot;</span>
    description: A Helm chart <span class="token keyword">for</span> Kubernetes
    digest: 5900f92fc1c6e453b48b36f74d04a475d4694e16a9e60e1b04a449558337b525
    name: naive-nginx
    type: application
    urls:
    - naive-nginx-0.1.0.tgz
    version: <span class="token number">0.1</span>.0
generated: <span class="token string">&quot;2021-11-30T23:02:48.049169158+08:00&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>现在将新的包和 index.yaml 文件 push 到仓库中，在执行 helm repo update 更新本地存储，现在在执行安装默认就会安装最新版本的有 3 个副本的 Chart 了。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ helm <span class="token function">install</span> naive-nginx  naive-gh-repo/naive-nginx
NAME: naive-nginx
LAST DEPLOYED: Tue Nov <span class="token number">30</span> <span class="token number">23</span>:06:14 <span class="token number">2021</span>
NAMESPACE: default
STATUS: deployed
REVISION: <span class="token number">1</span>
NOTES:
<span class="token number">1</span>. Get the application URL by running these commands:
  <span class="token builtin class-name">export</span> <span class="token assign-left variable">POD_NAME</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span>kubectl get pods <span class="token parameter variable">--namespace</span> default <span class="token parameter variable">-l</span> <span class="token string">&quot;app.kubernetes.io/name=naive-nginx,app.kubernetes.io/instance=naive-nginx&quot;</span> <span class="token parameter variable">-o</span> <span class="token assign-left variable">jsonpath</span><span class="token operator">=</span><span class="token string">&quot;{.items[0].metadata.name}&quot;</span><span class="token variable">)</span></span>
  <span class="token builtin class-name">export</span> <span class="token assign-left variable">CONTAINER_PORT</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span>kubectl get pod <span class="token parameter variable">--namespace</span> default $POD_NAME <span class="token parameter variable">-o</span> <span class="token assign-left variable">jsonpath</span><span class="token operator">=</span><span class="token string">&quot;{.spec.containers[0].ports[0].containerPort}&quot;</span><span class="token variable">)</span></span>
  <span class="token builtin class-name">echo</span> <span class="token string">&quot;Visit http://127.0.0.1:8080 to use your application&quot;</span>
  kubectl <span class="token parameter variable">--namespace</span> default port-forward <span class="token variable">$POD_NAME</span> <span class="token number">8080</span>:<span class="token variable">$CONTAINER_PORT</span>


$ kubectl get pods
NAME                                    READY   STATUS             RESTARTS   AGE
naive-nginx-784f55b8d4-bbxpq            <span class="token number">1</span>/1     Running            <span class="token number">0</span>          5s
naive-nginx-784f55b8d4-mkv5m            <span class="token number">1</span>/1     Running            <span class="token number">0</span>          5s
naive-nginx-784f55b8d4-xpcpz            <span class="token number">1</span>/1     Running            <span class="token number">0</span>          5s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此时如果我们想安装 0.1.0 版本的，需要在安装时通过 --version 参数指明版本：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ helm <span class="token function">install</span> naive-nginx-v01  naive-gh-repo/naive-nginx <span class="token parameter variable">--version</span><span class="token operator">=</span><span class="token number">0.1</span>.0
NAME: naive-nginx-v01
LAST DEPLOYED: Tue Nov <span class="token number">30</span> <span class="token number">23</span>:06:43 <span class="token number">2021</span>
NAMESPACE: default
STATUS: deployed
REVISION: <span class="token number">1</span>
NOTES:
<span class="token number">1</span>. Get the application URL by running these commands:
  <span class="token builtin class-name">export</span> <span class="token assign-left variable">POD_NAME</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span>kubectl get pods <span class="token parameter variable">--namespace</span> default <span class="token parameter variable">-l</span> <span class="token string">&quot;app.kubernetes.io/name=naive-nginx,app.kubernetes.io/instance=naive-nginx-v01&quot;</span> <span class="token parameter variable">-o</span> <span class="token assign-left variable">jsonpath</span><span class="token operator">=</span><span class="token string">&quot;{.items[0].metadata.name}&quot;</span><span class="token variable">)</span></span>
  <span class="token builtin class-name">export</span> <span class="token assign-left variable">CONTAINER_PORT</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span>kubectl get pod <span class="token parameter variable">--namespace</span> default $POD_NAME <span class="token parameter variable">-o</span> <span class="token assign-left variable">jsonpath</span><span class="token operator">=</span><span class="token string">&quot;{.spec.containers[0].ports[0].containerPort}&quot;</span><span class="token variable">)</span></span>
  <span class="token builtin class-name">echo</span> <span class="token string">&quot;Visit http://127.0.0.1:8080 to use your application&quot;</span>
  kubectl <span class="token parameter variable">--namespace</span> default port-forward <span class="token variable">$POD_NAME</span> <span class="token number">8080</span>:<span class="token variable">$CONTAINER_PORT</span>

$ kubectl get deployments.apps
NAME                   READY   UP-TO-DATE   AVAILABLE   AGE
naive-nginx            <span class="token number">3</span>/3     <span class="token number">3</span>            <span class="token number">3</span>           3m30s
naive-nginx-v01        <span class="token number">1</span>/1     <span class="token number">1</span>            <span class="token number">1</span>           3m1s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最后如果我们不在需要存储库了可以将其删除</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ helm repo remove naive-gh-repo
<span class="token string">&quot;naive-gh-repo&quot;</span> has been removed from your repositories
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-crd-operator" tabindex="-1"><a class="header-anchor" href="#_3-crd-operator" aria-hidden="true">#</a> 3. CRD &amp; Operator</h3><p>之前看的 Pod、Service、Deployment 都是 Kubernetes 自己提供的资源对象。除了自身提供的资源对象，Kubernetes 还提供的 CustomResourceDefinition 对象使我们自定义资源对象，从而实现对 Kubernetes 的扩展。</p><h4 id="_3-1-customresourcedefinition" tabindex="-1"><a class="header-anchor" href="#_3-1-customresourcedefinition" aria-hidden="true">#</a> 3.1 CustomResourceDefinition</h4><p>为了创建自定义对象，我们需要先来定义其对象的格式，也就是创建 CRD，示例如下：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> apiextensions.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> CustomResourceDefinition
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token comment"># name must match the spec fields below, and be in the form: &lt;plural&gt;.&lt;group&gt;</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> crontabs.stable.example.com
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token comment"># group name to use for REST API: /apis/&lt;group&gt;/&lt;version&gt;</span>
  <span class="token key atrule">group</span><span class="token punctuation">:</span> stable.example.com
  <span class="token comment"># list of versions supported by this CustomResourceDefinition</span>
  <span class="token key atrule">versions</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> v1
      <span class="token comment"># Each version can be enabled/disabled by Served flag.</span>
      <span class="token key atrule">served</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
      <span class="token comment"># One and only one version must be marked as the storage version.</span>
      <span class="token key atrule">storage</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
      <span class="token key atrule">schema</span><span class="token punctuation">:</span>
        <span class="token key atrule">openAPIV3Schema</span><span class="token punctuation">:</span>
          <span class="token key atrule">type</span><span class="token punctuation">:</span> object
          <span class="token key atrule">properties</span><span class="token punctuation">:</span>
            <span class="token key atrule">spec</span><span class="token punctuation">:</span>
              <span class="token key atrule">type</span><span class="token punctuation">:</span> object
              <span class="token key atrule">properties</span><span class="token punctuation">:</span>
                <span class="token key atrule">cronSpec</span><span class="token punctuation">:</span>
                  <span class="token key atrule">type</span><span class="token punctuation">:</span> string
                <span class="token key atrule">image</span><span class="token punctuation">:</span>
                  <span class="token key atrule">type</span><span class="token punctuation">:</span> string
                <span class="token key atrule">replicas</span><span class="token punctuation">:</span>
                  <span class="token key atrule">type</span><span class="token punctuation">:</span> integer
  <span class="token comment"># either Namespaced or Cluster</span>
  <span class="token key atrule">scope</span><span class="token punctuation">:</span> Namespaced
  <span class="token key atrule">names</span><span class="token punctuation">:</span>
    <span class="token comment"># plural name to be used in the URL: /apis/&lt;group&gt;/&lt;version&gt;/&lt;plural&gt;</span>
    <span class="token key atrule">plural</span><span class="token punctuation">:</span> crontabs
    <span class="token comment"># singular name to be used as an alias on the CLI and for display</span>
    <span class="token key atrule">singular</span><span class="token punctuation">:</span> crontab
    <span class="token comment"># kind is normally the CamelCased singular type. Your resource manifests use this.</span>
    <span class="token key atrule">kind</span><span class="token punctuation">:</span> CronTab
    <span class="token comment"># shortNames allow shorter string to match your resource on the CLI</span>
    <span class="token key atrule">shortNames</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> ct
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><strong>versions</strong> 自定义对象的版本，可以定义多个，这里最重要的是 schema 字段，用来定义我们的自定义对象的结构，采用 OpenAPI 3.0 规范进行校验，写过 swagger API 的同学应该会比较熟悉其结构。像上面的例子，我们的自定义对象有 cronSpec、image、replica 三个字段，前两个是 string 类型，replicas 是整数类型。</li><li><strong>names</strong> ： 就是我们自定义对象的名称，如同内置资源对象的名称、缩写一样。</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl apply <span class="token parameter variable">-f</span> crontab.yaml
customresourcedefinition.apiextensions.k8s.io/crontabs.stable.example.com created


$ kubectl api-resources
                          
NAME            SHORTNAMES   APIVERSION                  NAMESPACED   KIND
pods            po           v1                          <span class="token boolean">true</span>         Pod
deployments     deploy       apps/v1                     <span class="token boolean">true</span>    Deployment
crontabs        ct           stable.example.com/v1       <span class="token boolean">true</span>       CronTab
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>CRD 创建完成后，可以看到 api-resources 里就多了 CronTab 的资源。现在我们就可以创建该 对象了：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>apiVersion: <span class="token string">&quot;stable.example.com/v1&quot;</span>
kind: CronTab
metadata:
  name: my-new-cron-object
spec:
  cronSpec: <span class="token string">&quot;* * * * */5&quot;</span>
  image: my-awesome-cron-image
  replicas: <span class="token number">5</span>


$ kubectl apply <span class="token parameter variable">-f</span> new-crontab.yaml
crontab.stable.example.com/my-new-cron-object created

$ kubectl get crontabs
NAME                 AGE
my-new-cron-object   64s


$ kubectl get ct
NAME                 AGE
my-new-cron-object   67s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最后我们还可以删除 CRD 对象，CRD 删除后对应的所有自定义对象也会被一起删除。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl delete customresourcedefinition crontabs.stable.example.com
customresourcedefinition.apiextensions.k8s.io <span class="token string">&quot;crontabs.stable.example.com&quot;</span> deleted
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>仅仅定义了 CRD 以及自定义对象，还无法做到非常好的扩展。Kubernetes 的内置对象，比如 Deployment 之所以能执行滚动升级，是因为有对应的控制器在执行状态拟合。对于 CRD 也一样，我们的自定义对象也需要一个控制器来执行操作，这是由 Operator 提供的。</p><h4 id="_3-2-创建部署-operator" tabindex="-1"><a class="header-anchor" href="#_3-2-创建部署-operator" aria-hidden="true">#</a> 3.2 创建部署 Operator</h4><blockquote><p>Operator是使用自定义资源（CR，Custom Resource，是CRD的实例），管理应用及其组件的 自定义Kubernetes控制器。高级配置和设置由用户在CR中提供。Kubernetes Operator基于嵌 入在Operator逻辑中的最佳实践将高级指令转换为低级操作。Kubernetes Operator监视CR类型并采取特定于应用的操作，确保当前状态与该资源的理想状态相符。--- Red Hat</p></blockquote><p>简单来说：<code>Operator = CRD + Controller。</code></p><p>Kubernetes 本身提供的资源对象和控制器只能对最通用的操作做抽象，比如 CronJob 执行定时任务，Deployment 执行滚动升级等。但对于应用特定操作 Kubernetes 是做不到的，比如在 kubernetes 部署一个 3 节点ElasticSearch 集群，需要将 StatefulSet、ConfigMap、Service 文件等悉数配置好才可以成功。之所以要详细配置是因为 Kubernetes 并不知道如何将 ElasticSearch 部署为一个集群，但如果 kubernetes 本身有一个 ElasticSearch 的资源对象，并且有控制器基于该资源对象进行状态拟合，那我们可以很方便将部署 ElasticSearch 集群这些“高级指令”转化为 Kubernetes 可以执行的的 “低级操作”。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> elasticsearch.k8s.elastic.co/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Elasticsearch
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> quickstart
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">version</span><span class="token punctuation">:</span> 7.15.2
  <span class="token key atrule">nodeSets</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> default
    <span class="token key atrule">count</span><span class="token punctuation">:</span> <span class="token number">3</span>
    <span class="token key atrule">config</span><span class="token punctuation">:</span>
      <span class="token key atrule">node.store.allow_mmap</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,43)),s("p",null,[n[15]||(n[15]=a("目前 operator 是一种非常流行的 Kubernetes 方式，大量复杂的分布式系统都提供了 Operator，可以参考 ",-1)),s("a",b,[n[14]||(n[14]=a("awesome-operators",-1)),l(e)]),n[16]||(n[16]=a("。",-1))]),n[31]||(n[31]=s("p",null,"Operator 目前最大的问题在于编写起来比较麻烦，因为要封装大量的应用，以 etcd 为例，虽然其功能并不算复杂，但光是实现集群的创建删除、扩缩容、滚动更新等功能代码就已经超过了一万行，编写起来还是有一定的门槛。",-1)),n[32]||(n[32]=s("p",null,"为了方便开发 Operator，社区也有了不少工具来简化我们的工作，目前最常用的工具是两个：",-1)),n[33]||(n[33]=s("ul",null,[s("li",null,[s("strong",null,"kubebuilder"),a(": kubernetes-sigs 发布的脚手架工具，帮助我们快速搭建 operator 项目。")]),s("li",null,[s("strong",null,"Operator framework"),a(": Red Hat 发布的 operator 开发工具，目前已经加入了 CNCF landscape。")])],-1)),s("p",null,[n[18]||(n[18]=a("关于两者的比较，可以参考 ",-1)),s("a",y,[n[17]||(n[17]=a("这篇文章",-1)),l(e)]),n[19]||(n[19]=a("。这里我们简单看下如何通过 operator-framework 来开发一个 operator。",-1))]),n[34]||(n[34]=i(`<ol><li>初始化项目</li></ol><p>首先是初始化项目，我们先创建一个monkey-operator 创 项目目录，然后执行 <code>operator-sdk init</code>行 命令初始化项目。operator-framework 会将项目所需的基本骨架给创建好。 ·</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>➜  monkey-operator operator-sdk init <span class="token parameter variable">--domain</span> example.com <span class="token parameter variable">--repo</span> github.com/example/monkey-operator
Writing kustomize manifests <span class="token keyword">for</span> you to edit<span class="token punctuation">..</span>.
Writing scaffold <span class="token keyword">for</span> you to edit<span class="token punctuation">..</span>.
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>创建 CRD</li></ol><p>项目创建完成后就可以创建 CRD 了，执行 <code>operator-sdk create api</code> 执行命令指定 group、version以及 kind。这里我们创建一个 MonkeyPod 的 CRD。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>➜  monkey-operator operator-sdk create api <span class="token parameter variable">--group</span> monkey <span class="token parameter variable">--version</span> v1alpha1  <span class="token parameter variable">--kind</span> 

MonkeyPod <span class="token parameter variable">--resource</span> <span class="token parameter variable">--controller</span>
Writing kustomize manifests <span class="token keyword">for</span> you to edit<span class="token punctuation">..</span>.
Writing scaffold <span class="token keyword">for</span> you to edit<span class="token punctuation">..</span>.
api/v1alpha1/monkeypod_types.go
controllers/monkeypod_controller.go
Update dependencies:
$ go mod tidy
Running make:
$ <span class="token function">make</span> generate
go: creating new go.mod: module tmp
Downloading sigs.k8s.io/controller-tools/cmd/controller-gen@v0.6.1
go: downloading sigs.k8s.io/controller-tools v0.6.1
go: downloading golang.org/x/tools v0.1.3
go get: added sigs.k8s.io/controller-tools v0.6.1
/home/ubuntu/monkey-operator/bin/controller-gen object:headerFile<span class="token operator">=</span><span class="token string">&quot;hack/boilerplate.go.txt&quot;</span> <span class="token assign-left variable">paths</span><span class="token operator">=</span><span class="token string">&quot;./...&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>完成后项目的目录结构如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>➜  monkey-operator tree
<span class="token builtin class-name">.</span>
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里最主要的是两个目录：</p><ul><li>apis 目录：CRD 对象的定义目录，我们创建的 MonkeyPod 会在这里自动生成对象定义：</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>// MonkeyPod is the Schema <span class="token keyword">for</span> the monkeypods API
<span class="token builtin class-name">type</span> MonkeyPod struct <span class="token punctuation">{</span>
  metav1.TypeMeta   <span class="token variable"><span class="token variable">\`</span>json:<span class="token string">&quot;,inline&quot;</span><span class="token variable">\`</span></span>
  metav1.ObjectMeta <span class="token variable"><span class="token variable">\`</span>json:<span class="token string">&quot;metadata,omitempty&quot;</span><span class="token variable">\`</span></span>

  Spec   MonkeyPodSpec   <span class="token variable"><span class="token variable">\`</span>json:<span class="token string">&quot;spec,omitempty&quot;</span><span class="token variable">\`</span></span>
  Status MonkeyPodStatus <span class="token variable"><span class="token variable">\`</span>json:<span class="token string">&quot;status,omitempty&quot;</span><span class="token variable">\`</span></span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们可以根据需要在这里定义好 CRD，然后自动生成 yaml 文件，这样就不用手动编写复杂的 yaml 文件了。这里我将 MonkeyPod 的 Spec 和 Status 替换为 Pod 的对象：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">import</span> <span class="token punctuation">(</span>
  corev1 <span class="token string">&quot;k8s.io/api/core/v1&quot;</span>

<span class="token punctuation">)</span>

// EDIT THIS FILE<span class="token operator">!</span>  THIS IS SCAFFOLDING FOR YOU TO OWN<span class="token operator">!</span>
// NOTE: json tags are required.  Any new fields you <span class="token function">add</span> must have json tags <span class="token keyword">for</span> the fields to be serialized.

// +kubebuilder:object:root<span class="token operator">=</span>true
// +kubebuilder:subresource:status

// MonkeyPod is the Schema <span class="token keyword">for</span> the monkeypods API
<span class="token builtin class-name">type</span> MonkeyPod struct <span class="token punctuation">{</span>
  metav1.TypeMeta   <span class="token variable"><span class="token variable">\`</span>json:<span class="token string">&quot;,inline&quot;</span><span class="token variable">\`</span></span>
  metav1.ObjectMeta <span class="token variable"><span class="token variable">\`</span>json:<span class="token string">&quot;metadata,omitempty&quot;</span><span class="token variable">\`</span></span>

  Spec   corev1.PodSpec  <span class="token variable"><span class="token variable">\`</span>json:<span class="token string">&quot;spec,omitempty&quot;</span><span class="token variable">\`</span></span>
  Status corev1.PodStatus <span class="token variable"><span class="token variable">\`</span>json:<span class="token string">&quot;status,omitempty&quot;</span><span class="token variable">\`</span></span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>修改完成后，需要执行如下命令：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 重新生成 CRD yaml 文件</span>
➜  monkey-operator <span class="token function">make</span> manifests
/home/ubuntu/monkey-operator/bin/controller-gen <span class="token string">&quot;crd:trivialVersions=true,preserveUnknownFields=false&quot;</span> rbac:roleName<span class="token operator">=</span>manager-role webhook <span class="token assign-left variable">paths</span><span class="token operator">=</span><span class="token string">&quot;./...&quot;</span> output:crd:artifacts:config<span class="token operator">=</span>config/crd/bases

<span class="token comment"># 重新生成 go 相关文件</span>
➜  monkey-operator <span class="token function">make</span> generate 
/home/ubuntu//operator/monkey-operator/bin/controller-gen object:headerFile<span class="token operator">=</span><span class="token string">&quot;hack/boilerplate.go.txt&quot;</span> <span class="token assign-left variable">paths</span><span class="token operator">=</span><span class="token string">&quot;./...&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><strong>controller 目录</strong>：这里写的就是具体的控制逻辑，我们编写 operator 时主要的工作量基本都是编写控制逻辑。这里的逻辑非常简单，每当有 MonkeyPod 创建，我们的 controller 会创建同名的 Pod 并打上 &quot;monkey&quot;: &quot;stupid-monkey&quot; 标签:</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
\`\`\`go
func <span class="token punctuation">(</span>r *MonkeyPodReconciler<span class="token punctuation">)</span> Reconcile<span class="token punctuation">(</span>ctx context.Context, req ctrl.Request<span class="token punctuation">)</span> <span class="token punctuation">(</span>ctrl.Result, error<span class="token punctuation">)</span> <span class="token punctuation">{</span>
  _ <span class="token operator">=</span> log.FromContext<span class="token punctuation">(</span>ctx<span class="token punctuation">)</span>

  // your logic here
  monkeyPod :<span class="token operator">=</span> <span class="token operator">&amp;</span>monkeyv1alpha1.MonkeyPod<span class="token punctuation">{</span><span class="token punctuation">}</span>
  err :<span class="token operator">=</span> r.Get<span class="token punctuation">(</span>ctx, req.NamespacedName, monkeyPod<span class="token punctuation">)</span>
  pod :<span class="token operator">=</span> <span class="token operator">&amp;</span>corev1.Pod<span class="token punctuation">{</span>
     TypeMeta: metav1.TypeMeta<span class="token punctuation">{</span>
        Kind:       <span class="token string">&quot;Pod&quot;</span>,
        APIVersion: <span class="token string">&quot;v1&quot;</span>,
     <span class="token punctuation">}</span>,
     ObjectMeta: metav1.ObjectMeta<span class="token punctuation">{</span>
        Name:      monkeyPod.Name,
        Namespace: monkeyPod.Namespace,
     <span class="token punctuation">}</span>,
  <span class="token punctuation">}</span>
  pod.Spec <span class="token operator">=</span> monkeyPod.Spec
  labels :<span class="token operator">=</span> map<span class="token punctuation">[</span>string<span class="token punctuation">]</span>string<span class="token punctuation">{</span>
     <span class="token string">&quot;monkey&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;stupid-monkey&quot;</span>,
  <span class="token punctuation">}</span>
  pod.Labels <span class="token operator">=</span> labels
  createPod, err :<span class="token operator">=</span> CreatePod<span class="token punctuation">(</span>pod<span class="token punctuation">)</span>
  fmt.Println<span class="token punctuation">(</span>createPod<span class="token punctuation">)</span>
  <span class="token keyword">if</span> err <span class="token operator">!=</span> nil <span class="token punctuation">{</span>
     <span class="token builtin class-name">return</span> ctrl.Result<span class="token punctuation">{</span><span class="token punctuation">}</span>, err
  <span class="token punctuation">}</span>
  <span class="token builtin class-name">return</span> ctrl.Result<span class="token punctuation">{</span><span class="token punctuation">}</span>, err
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>完成后项目有 <code>make docker-build 和 make deploy</code> 命令可以创建镜像以及部署。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl get deployments.apps <span class="token parameter variable">-n</span> monkey-operator-system
NAME                                 READY   UP-TO-DATE   AVAILABLE   AGE
monkey-operator-controller-manager   <span class="token number">1</span>/1     <span class="token number">1</span>            <span class="token number">1</span>           8h


$ kubectl get pods <span class="token parameter variable">-n</span> monkey-operator-system
NAME                                                  READY   STATUS    RESTARTS   AGE
monkey-operator-controller-manager-674cd8bc69-dgcbj   <span class="token number">2</span>/2     Running   <span class="token number">0</span>          20m
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>部署完成后创建 一个 MonkeyPod 对象：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> monkey.example.com/v1alpha1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> MonkeyPod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">labels</span><span class="token punctuation">:</span>
    <span class="token key atrule">run</span><span class="token punctuation">:</span> nginx
  <span class="token key atrule">name</span><span class="token punctuation">:</span> nginx
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">image</span><span class="token punctuation">:</span> nginx
    <span class="token key atrule">name</span><span class="token punctuation">:</span> nginx
    <span class="token key atrule">resources</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token key atrule">dnsPolicy</span><span class="token punctuation">:</span> ClusterFirst
  <span class="token key atrule">restartPolicy</span><span class="token punctuation">:</span> Always
<span class="token key atrule">status</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>创建完成后我们的 operator 就会自动创建一个同名的 Pod 并打上标签了：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl describe pod nginx
Name:         nginx
Namespace:    default
Priority:     <span class="token number">0</span>
Node:         vm-0-3-ubuntu/172.19.0.3
Start Time:   Sun, 05 Dec <span class="token number">2021</span> 06:26:43 +0800
Labels:       <span class="token assign-left variable">monkey</span><span class="token operator">=</span>stupid-monkey
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上是 Operator Framework的简单使用，具体操作时还要考虑权限设置等问题，比如我们的例子就需要给 operator 添加 Pod 创建权限，具体操作可以参考 RBAC 部分，这里就不做赘述。</p>`,24)),s("p",null,[n[21]||(n[21]=a("一般来说对于 Operator 的编写更推荐使用 Go 语言编写，可以使用 client-go 库很好的与 Kubernetes 交互。其他语言的话 JavaClient有两个，一个是Jasery，另一个是",-1)),s("a",g,[n[20]||(n[20]=a("Fabric8",-1)),l(e)]),n[22]||(n[22]=a("，后者对 Pod、Deployment 等做了 DSL 定义而且可以用 Builder 模式，写起来也相对方便一些。",-1))])])}const E=t(u,[["render",h],["__file","application.html.vue"]]);export{E as default};
