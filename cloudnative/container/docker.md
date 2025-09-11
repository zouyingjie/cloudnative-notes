# Docker 最佳实践

本篇主要针对 Dockerfile 的编写做实践建议。

1. **使用一个标准一致的Docker镜像来做程序的编译**。如: 
```dockerfile
FROM maven:3.6-jdk-8-alpine
WORKDIR /app COPY ./src
RUN mvn -e -B package
```

2. **在 Docker 17.05 以上版本后，尽可能使用 Multi-stage 技术进行构建。**

多个 FROM 指令并不是为了生成多根的层关系，最后生成的镜像，仍以最后一条 FROM 为准，之前的 FROM 会被抛弃。虽然最后生成的镜像只能是最后一个阶段的结果，但是能够将前置阶段中的文件拷⻉到后边的阶段中。这样可以减少所构建镜像的大小以及文件层数。

```dockerfile
FROM maven:3.6-jdk-8-alpine
WORKDIR /app
COPY ./src
RUN mvn -e -B package

FROM openjdk:8-jre-alpine
COPY --from=builder /app/target/app.jar /
CMD ["java", "-jar", "/app.jar"]
```

3. **使用 `.dockerignore`文件**

在大多数情况下，最好把 Dockerfile放在一个空目录里，把构建Dockerfile 需要的文件追加到该目录中。为了改进构建性能。也可以增加一个 .dockerignore 文件来排除文件和目录。该文件支持与 .gitignore 类似的排除模式。


4. **避免安装不需要的包和数据**

为了减少复杂性、依赖文件大小和构建时间，我们应该避免仅仅因为他们很好用而安装一些额外或者不必要的包。例如不需要在一个数据库镜像中包含一个文本编辑器。

比如如果使用 `apt-get install` 类似的命令，需要相关的缓存。

```sh
apt-get update && apt-get -y install ... && rm -rf /var/lib/apt/lists/*
```

5. **尽量减少Docker镜像中的文件层数**

对于Dockerfile中，RUN、COPY和ADD三个命令会创建新的文件层， 所以可以使用 **&&** 来一次运行多个命令(永远将 RUN apt-get update 和 apt-get install 组合成一条 RUN 声明)；使用通配符来一次添加多个文件等。


6. WORKDIR 中使用绝对路径

为了 Dockerfile 的清晰性和可靠性，我们在 WORKDIR 中应该使用绝对路径。另外如果有类似于 `RUN cd ... && do-something`` 这样的指令，使用相对目录会导致后续难以阅读和维护，因此应该使用绝对路径替代。

7. **使用标签(label)来标记镜像**

Docker 提供标签(labels)来协助通过项目组织镜像，记录授权信息，帮助自动化。每一个标签都以 LABEL 开头并且跟着一对或多对键值对。一个镜像可以包含多个标签，但建议将多个标签放入到一个 LABEL 指令中，可以减少镜像层数。

```dockerfile
LABEL maintainer="yingjie.zou@example.com" \
      version="1.0" \
      description="示例镜像"
```

8. **尽量使用官方基础镜像**

无论何时尽可能使用当前官方仓库镜像作为你的基础镜像。Docker官方推荐 Debian镜像，因为它被严格控制并且保持最小(目前小于5MB),同时是一个完整的发行版。当然,如果需要一个 Java的运 行环境,最好的方式是 `FROM openjdk` 而不用 FROM debian 后再安装 openjdk。


9. **尽可能指定特定版本的基础镜像**

比如使用 `FROM openjdk:8` 而不是 `FROM openjdk:latest`。


10. **尽可能使用最小尺寸的基础镜像**

比如: openjdk:8 有 624MB,而 openjdk:8-jre-alpine 只有83MB


11.  **ENTRYPOINT 启动脚本**

`ENTRYPOINT` 可以设置镜像的主命令，推荐使用一个脚本来实现程序的启动。比如 `ENTRYPOINT ["/entrypoint.sh"]`。

12. **使用 hadolint 来检查你写的Dockerfile**

[hadolint](https://github.com/hadolint/hadolint) 是一个用于检查Dockerfile的工具，可以帮助你发现潜在的问题和不符合最佳实践的地方。

13. **不要在 Dockerfile 中写入任何的私密信息,比如:密码或私钥。**

14. **使用非 root 用户执行**

如果某个服务不需要特权执行,建议使用 USER 指令切换到非 root 用户。先在 Dockerfile 中使用类似 RUN groupadd -r postgres && useradd -r -g postgres postgres 的指令创建用户和用户组。避免使用 sudo


15. **一个容器打包一个应用**