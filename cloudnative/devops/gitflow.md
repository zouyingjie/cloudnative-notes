# 软件开发工作流

实际的软件开发过程通常是比较复杂的，既要保证线上的代码稳定可靠，又要保证开发人员可以快速迭代新功能，同时还会面临不同的环境和问题。为了更好地管理代码和协作开发，我们需要采用一些工作流规范来指导团队的协作和代码管理。

我们通常需要基于业务的发布流程和团队的实际情况来定制合适的工作流规范。比如有的项目需要敏捷发布，而有的项目需要稳定的发布流程；有的项目需要频繁的 hotfix，而有的项目则不需要。虽然情况各异，但基本都需要实现以下目标：

- 确保线上代码稳定可靠
- 不同团队能够尽可能的并行开发
- 代码与环境、版本的一致    

对于使用微服务架构和提倡 DevOps 文化的团队来说，工作流规范还会满足以下特性：

- 系统架构以微服务的形式存在，代码会被拆分为若干个仓库，而团队也会被拆分为若干个小团队，每个小团队负责一个或多个微服务的开发和运维，实现并行开发，快速迭代。
  
- 高效的 CICD 流水线，提交的代码能够被快速编译、测试和部署，软件发布的速度大大提高，从而可以减少代码分支和版本的维护工作。

在具体实践中，工作流规范通常是基于 Git 的分支管理和代码提交规范来实现，这里包含：

- **分支管理规范**：定义统一的分支名称和代码提交分支
- **提交管理规范**：定义代码提交描述信息和提交要求
- **团队协作规范**：定义团队成员之间的协作方式和沟通规范

需要强调的一点是：**如果软件开发协同工作流比较复杂，这表明现有的软件架构和自动化软件生产和运维还不够先进，提升软件架构质量和自动化成都才是真正简化协同工作流程的根本。**

## Git 工作流

### Gitflow 工作流

Gitflow 工作流由 Vincent Driessen 在2010年发表的文章 [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/) 中提出，它将 Git 的强大功能与现代软件开发的最佳实践相结合，为软件开发提供了一种高效的分支管理方式。

Gitflow 工作流的相关分支如下：

![gitflow](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/gitflow.jpeg)

**master 分支**

主分支，只包含稳定版本的代码，可以随时部署到生产环境。

**develop 分支**

- 开发分支，代码由 feature 分支合并而来。
- 开发分支对应的是集成测试环境，合到 develop 分支的代码必须执行单元测试、code review 等操作。

**feature 分支**

- 功能分支，需要开发新功能或者改动较大时，从 develop 分支切出 feature 分支进行开发。
- 开发完成后向 develop 分支合并。
- feature 分支对应的是开发人员的本地开发环境。

**release 分支**

- 发布分支，用于准备发布新版本，当 develop 分支的代码测试完成，满足上线要求后，可以从 develop 分支切出 release 分支，然后做发布前的准备工作
- 之所以需要 release 分支，一是某些时候需要保留特定的版本，比如 kubespary 项目需要众多的 release 分支来支持不同版本的 Kubernetes 部署。二是作为 milestone 标记某个开发阶段已完成，切分出来后 develop 分支可以继续开发下一个功能，避免因为要等待发布而阻塞开发进度。
  
- 发布分支通常对应的是预发环境或者 UAT 环境，可以做进一步的功能测试和性能压测
- release 分支达到上线要求后，需要同时向 master 分支和 develop 分支合并以保证代码的一致性，之后如果不需要存档，可以将 release 分支删除

**hotfix 分支**

- 修复分支，用于修复生产环境中的紧急问题，通常从 master 分支创建，每个线上的 hotfix bug 都需要开一个 hotfix 分支进行修复
- 修复完成后合并到 master 分支和 develop 分支，然后删除 hotfix 分支

Gitflow 的特点是保证主线代码版本和开发分支稳定，功能开发和 bug 修复都隔离在单独分支中，避免对主线代码造成干扰；同时发布分支可以单独部署分析，便于测试验证，追查 bug。其缺点 Gitflow 的缺点是分支较多，管理起来比较复杂，尤其是实际操作中经常忘记 hotfix、release 分支同时向 master、develop  分支做合并的操作，与此同时，在现在提倡快速迭代发布的背景下，往往只需要发布而不是 hotfix，因此 Gitflow 工作流已经被 GitHub/Gitlab 等工作流替代，[A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/) 的作者也在 10 年后更新了这篇文章，推荐使用 GitHub 工作流。

### GitHub 工作流

[GitHub 工作流](https://docs.github.com/en/get-started/using-github/github-flow)就是我们日常使用 Github 协作时使用的 Forking 工作流。

基本流程如下：

1. 开发人员 Fork 官方库到自己的代码仓库
2. 在自己仓库中切出 feature 分支进行开发
3. 开发完成后 push 代码到开发人员自己的仓库
4. 开发人员向官方库发起 PR，做 code review
5. PR 通过后，合并到官方库的 master 分支
6. 开发人员删除 feature 分支，并将官方库的 master 分支合并到自己仓库的 master 分支

当然如果开发人员有官方库的权限，也可以直接在官方库创建 feature 分支，流程如下：

1. 从 master 分支切出 feature 分支进行开发
2. 开发完成后向 master 分支提 PR
3. 在 PR 中进行 code review
4. PR 通过后合并到 master 分支
5. 删除 feature 分支

可以看到 Github Flow 只有 feature 分支和 main 分支，极大简化了分支管理的复杂度。

### Gitlab 工作流

Github Flow 虽然简单，但也存在一些问题没有解决：

- 代码没有和环境做对应
- 没有 release 分支和发布分支

为此 Gitlab Flow 引入了环境分支，当 main 分支稳定后，可以切出预发环境（pre-release）和生产环境（production）分支，进行测试部署，此时并不影响 main 分支继续合并 feature 分支；同时当版本稳定后还可以切出 relase/stable 发布分支，后续可以通过 cherry-pick 的方式合并某些 main 分支的提交。

**环境分支**
![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/gitlab-flow-01.png)


**release分支**
![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/gitlab-flow-02.png)


以笔者实际的经验来看，在 CI/CD 流水线做好的前提下，通常不需要过于复杂的分支管理。GitHub Flow 已经足够满足大部分团队的需求，在此基础之上可以切分出固定的测试分支进行用于测试，并且只能由测试分支向 main 分支提 PR，这也符合微服务任务拆分快速迭代的思想。只有在遇到复杂功能开发时，才需要切出单独的 feature 分支进行开发。

## Git 提交规范

代码提交至少应该遵循两个原则：

#### 合理的提交粒度

- 要合理的定义提交粒度，要避免 **一个改动提交一次，多个功能一起提交**。这里最重要的是做好开发任务的分解，在动手前将任务拆分成若干相对独立的开发模块，开发、自测、提交以模块为单位进行。
  
- 避免提交重复信息，如果上一个提交没有修改完整，后续提交可以使用 ``git commit --amend`` 命令追加改动

- 如果本地已经有多个重复提交，可以使用 ``git reset --soft HEAD^`` 回到之前的提交，然后重新提交。或者通过 ``git rebase -i`` 命令合并提交并重新编辑 commit message。


#### 准确的描述信息

个人项目在开发时为了图省事可以在提交代码写 commit message 时用 "update" 一把梭，但在需要团队协作的项目中，commit message 必须明确的描述当前提交的改动。可以参考 [AngularJS 的 commit message 规范](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits)，其 commit message 格式如下：

commit message 的格式为：

```
<type>(<scope>): <subject>

<body>

<footer>
```

下面是 AngularJS 的 commit message 示例：

```
fix(code.angularjs.org): correctly re-construct paths on Windows in sendStoredFile()

Previously, the `sendStoredFile()` Firebase function used `.split('/')`
to split the request path into segments and later used `path.join()` to
join them back together. This worked fine on *nix based systems, which
use `/` as the path separator. On Windows, however, where `\` is the
path separator, the re-constructed paths could not be retrieved from the
Google Cloud Storage bucket. This prevented the Firebase emulators from
working correctly when testing the function locally on Windows.

This commit fixes the issue by using `.join('/')` to join the path
segments back together.

Closes #17114
```

提交信息由 **Header（标题）、Body（正文）、Footer（脚注）** 三部分组成。我们来看下各个字段的含义：

**type: 提交的类型**

提交的标题中需要标注提交的类型，下面是各个类型的含义：

- **feat：** 新功能。
  
- **fix：** 修复 bug。

- **docs：** 文档修改。

- **style：** 代码格式修改。比如格式化代码，调整空格、换行等，对于代码的运行没有影响。

- **refactor：** 代码重构。bugfix 和开发新功能之外的代码优化。

- **perf：** 性能优化相关的改动

- **test：** 添加或修正测试代码。

- **chore：** 构建过程或辅助工具和库(如文档生成)的更改。

- **revert：** 撤销之前的 commit。commit message 的标题格式为：``revert: [被撤销的 commit 的 header]``，body 为 ``revert: [被撤销的 commit 的 hash]``。


**scope: 提交影响的范围（可选）**
  
简单概括这次提交的影响范围，比如某个文件、某个模块、某个功能等。


**subject: 提交的简要描述**

一句话描述这次提交的改动，尽量简明扼要。


**body: 提交的详细描述（可选）**

详细描述这次提交的改动，包括改动的原因、背景、影响范围等。通常


**footer: 提交的关联信息（可选）**

脚注信息，比如这次改动关联的 issue 等。像 Github 的 PR 中，通常会关联 issue，在提交信息中可以添加 ``Closes #123`` 来关联 issue，这样在 PR 合并后，issue 会自动关闭。

在实际开发中，通常是开发人员有若干个提交完成相关改动后，再提 PR。开发人员的提交只包含 Header 即可，在提 PR 时，则需要补充相关的 Body 和 Footer。


## 团队协作规范

- 所有成员要明确了解各个分支的功能，避免在错误的分支上进行开发。
- 每个人要在自己分支进行开发，要确保提交的代码无编译错误。
- 要合理设置分支权限，比如误操作。
- 原则上禁止强制提交，需要从权限上限制可以强制提交的分支和成员。尤其是 master 分支，必须禁止除管理员以外的成员强制提交。
  
- 团队协作开发的功能，需要通过 PR 进行合并，以便 review 代码，及早发现冲突。
  
- PR 必须有 Review 过程，Review 时要写明评论、要求修改的意见或者 LGTM（Looks Good To Me） 赞同意见。
  
- 保证一个功能一个 commit，可以通过 ``git commit --amend`` 命令追加改动，或者 ``git reset --mixed`` 、``git reset --soft`` 、``git rebase -i`` 命令压缩提交。
  
- 不推荐使用 WIP - Working In Progress 的提交信息，确保相对完整的提交。

