# 容器基础技术：cgroups

> 本篇基于 cgroupv2 进行介绍，对 cgroupv1 的设计不做赘述，感兴趣的同学可以参考如下文章：

-  [Control Groups version 1](https://docs.kernel.org/admin-guide/cgroup-v1/index.html#cgroup-v1)
-  [Docker基础技术：Linux CGroup](https://coolshell.cn/articles/17049.html)
  

cgroup（控制组，Control Group）是 Linux 内核提供的一种机制，可以限制进程/线程使用的资源，比如 CPU、内存、磁盘 IO 等。

## 案例：cgroup 限制内存

我们先来看一个用 cgroup 限制进程内存使用的例子。我们使用如下代码，每秒分配 500KB 内存，然后我们使用 cgroup 将目标进程的内存使用限制为 5MB，这样程序分配的内存超过 5MB 时会被杀死。

```c
# cgroup-mem-test.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <unistd.h>

int main(void)
{
    int size = 0;
    int chunk_size = 102400 * 5; // 1024 bytes * 100 * 5，每次分配 500 KB
    void *p = NULL;

    while(1) {
        if ((p = malloc(chunk_size)) == NULL) {
            printf("out of memory!!\n");
            break;
        }
        memset(p, 1, chunk_size);
        size += chunk_size;
        printf("[%d] - memory is allocated [%8d] KB \n", getpid(), size / 1024);
        sleep(1);
    }
    return 0;
}
```

编译后正常执行，程序会不断分配内存。

```sh
$ ./cgroup-mem-test
[116459] - memory is allocated [     500] KB
[116459] - memory is allocated [    1000] KB
[116459] - memory is allocated [    1500] KB
[116459] - memory is allocated [    2000] KB
[116459] - memory is allocated [    2500] KB
[116459] - memory is allocated [    3000] KB
[116459] - memory is allocated [    3500] KB
[116459] - memory is allocated [    4000] KB
[116459] - memory is allocated [    4500] KB
[116459] - memory is allocated [    5000] KB
[116459] - memory is allocated [    5500] KB
[116459] - memory is allocated [    6000] KB
[116459] - memory is allocated [    6500] KB
[116459] - memory is allocated [    7000] KB
[116459] - memory is allocated [    7500] KB
[116459] - memory is allocated [    8000] KB
...
```

下面我们创建 cgroup 将内存限制为 5MB。

```sh
# 创建新的控制组
$ mkdir -p /sys/fs/cgroup/mygroup
# 限制最大内存为 5MB，这里是用的字节
echo $((5 * 1024 * 1024)) > /sys/fs/cgroup/mygroup/memory.max

# 启动程序后，将进程 ID 加入到控制组
./cgroup-mem-test & echo $! > /sys/fs/cgroup/mygroup/cgroup.procs

$ sudo cat /sys/fs/cgroup/mygroup/cgroup.procs
118058

$ ./cgroup-mem-test
[118058] - memory is allocated [     500] KB
[118058] - memory is allocated [    1000] KB
[118058] - memory is allocated [    1500] KB
[118058] - memory is allocated [    2000] KB
[118058] - memory is allocated [    2500] KB
[118058] - memory is allocated [    3000] KB
[118058] - memory is allocated [    3500] KB
[118058] - memory is allocated [    4000] KB
[118058] - memory is allocated [    4500] KB
[118058] - memory is allocated [    5000] KB
[118058] - memory is allocated [    5500] KB
[118058] - memory is allocated [    6000] KB
[118058] - memory is allocated [    6500] KB
[118058] - memory is allocated [    7000] KB
[1]    118058 killed     ./cgroup-mem-test
```

可以看到程序在运行一段时间后被 kill 掉了，使用 ``journalctl -k`` 命令查看日志可以看到如下信息：

```sh
Mar 17 15:43:44 vm-01 kernel: Tasks state (memory values in pages):
Mar 17 15:43:44 vm-01 kernel: [  pid  ]   uid  tgid total_vm      rss pgtables_bytes swapents oom_score_adj name
Mar 17 15:43:44 vm-01 kernel: [ 118058]  1000 118058     2584     2196    61440        0             0 cgroup-mem-test
Mar 17 15:43:44 vm-01 kernel: oom-kill:constraint=CONSTRAINT_MEMCG,nodemask=(null),cpuset=mygroup,mems_allowed=0,oom_memcg=/mygroup,task_memcg=/mygroup,task=cgroup-mem-test,pid=118058,uid=1000
Mar 17 15:43:44 vm-01 kernel: Memory cgroup out of memory: Killed process 118058 (cgroup-mem-test) total-vm:10336kB, anon-rss:7160kB, file-rss:1624kB, shmem-rss:0kB, UID:1000 pgtables:60kB oom_score_adj:0
```
从日志看出起实际内存为 2196 页，即 2196 * 4KB 大约 8MB，超出了 cgroup 的限制，因此在 cgroup 范围内（constraint=CONSTRAINT_MEMCG）由 mygroup (task_memcg=/mygroup) 控制组杀死，最终报  ``Memory cgroup out of memory: Killed process 118058 (cgroup-mem-test) `` 错误。

通过以上例子我们可以对 cgroup 有一个直观的认识，下面我们来系统梳理下 cgroup 的相关概念和用法。

## cGroup 术语

### 控制器（controller）

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/cgroup-v2-01.png)
图片来自：[cgroup2](https://facebookmicrosites.github.io/cgroup2/docs/overview.html)

控制器也叫做子系统，是 Linux 提供的管理各种资源限制的对象，比如我们例子用到的 memory.max 就属于 memory 子系统。下面是 cgroup v2 支持的一些控制器：

| 子系统| 主要功能| 关键接口文件|
| --- | --- | --- |
| cpu | 控制CPU使用和调度 | cpu.max, cpu.weight, cpu.stat |
| cpuset | 控制CPU核心和内存节点分配 | cpuset.cpus, cpuset.mems |
| memory | 控制内存使用 | memory.max, memory.high, memory.low, memory.current |
| io | 控制块设备I/O | io.max, io.weight, io.stat |
| pids | 控制进程数量 | pids.max, pids.current |
| freezer | 控制组暂停/恢复 | cgroup.freeze |
| hugetlb | 控制大页内存 | hugetlb.* |
| rdma | 控制远程直接内存访问 | rdma.* |
| perf_event | 控制性能监控 | perf_event.* |
| devices | 控制设备访问 | devices.* |
| net_cls/net_prio | 控制网络数据包分类和优先级 | net_cls., net_prio. |

上述各个控制器有若干关键接口文件，用来实现相应的资源限制，比如我们上面的例子使用 ``memory.max`` 限制进程最大内存使用。下面是全部控制器的关键接口文件：

```sh
# ubuntu @ vm-01 in /sys/fs/cgroup/mygroup [15:56:35]
$ ll
total 0
-r--r--r-- 1 root root 0 Mar 17 15:56 cgroup.controllers
-r--r--r-- 1 root root 0 Mar 17 15:56 cgroup.events
-rw-r--r-- 1 root root 0 Mar 17 15:56 cgroup.freeze
--w------- 1 root root 0 Mar 17 15:56 cgroup.kill
-rw-r--r-- 1 root root 0 Mar 17 15:56 cgroup.max.depth
-rw-r--r-- 1 root root 0 Mar 17 15:56 cgroup.max.descendants
-rw-r--r-- 1 root root 0 Mar 17 15:43 cgroup.procs
-r--r--r-- 1 root root 0 Mar 17 15:56 cgroup.stat
-rw-r--r-- 1 root root 0 Mar 17 15:56 cgroup.subtree_control
-rw-r--r-- 1 root root 0 Mar 17 15:56 cgroup.threads
-rw-r--r-- 1 root root 0 Mar 17 15:56 cgroup.type
-rw-r--r-- 1 root root 0 Mar 17 15:56 cpu.idle
-rw-r--r-- 1 root root 0 Mar 17 15:56 cpu.max
-rw-r--r-- 1 root root 0 Mar 17 15:56 cpu.max.burst
-rw-r--r-- 1 root root 0 Mar 17 15:56 cpu.pressure
-rw-r--r-- 1 root root 0 Mar 17 15:56 cpuset.cpus
-r--r--r-- 1 root root 0 Mar 17 15:56 cpuset.cpus.effective
-rw-r--r-- 1 root root 0 Mar 17 15:56 cpuset.cpus.partition
-rw-r--r-- 1 root root 0 Mar 17 15:56 cpuset.mems
-r--r--r-- 1 root root 0 Mar 17 15:56 cpuset.mems.effective
-r--r--r-- 1 root root 0 Mar 17 15:56 cpu.stat
-rw-r--r-- 1 root root 0 Mar 17 15:56 cpu.uclamp.max
-rw-r--r-- 1 root root 0 Mar 17 15:56 cpu.uclamp.min
-rw-r--r-- 1 root root 0 Mar 17 15:56 cpu.weight
-rw-r--r-- 1 root root 0 Mar 17 15:56 cpu.weight.nice
-rw-r--r-- 1 root root 0 Mar 17 15:56 io.max
-rw-r--r-- 1 root root 0 Mar 17 15:56 io.pressure
-rw-r--r-- 1 root root 0 Mar 17 15:56 io.prio.class
-r--r--r-- 1 root root 0 Mar 17 15:56 io.stat
-rw-r--r-- 1 root root 0 Mar 17 15:56 io.weight
-r--r--r-- 1 root root 0 Mar 17 15:28 memory.current
-r--r--r-- 1 root root 0 Mar 17 15:56 memory.events
-r--r--r-- 1 root root 0 Mar 17 15:56 memory.events.local
-rw-r--r-- 1 root root 0 Mar 17 15:56 memory.high
-rw-r--r-- 1 root root 0 Mar 17 15:56 memory.low
-rw-r--r-- 1 root root 0 Mar 17 15:35 memory.max
-rw-r--r-- 1 root root 0 Mar 17 15:56 memory.min
-r--r--r-- 1 root root 0 Mar 17 15:56 memory.numa_stat
-rw-r--r-- 1 root root 0 Mar 17 15:56 memory.oom.group
-rw-r--r-- 1 root root 0 Mar 17 15:56 memory.pressure
-r--r--r-- 1 root root 0 Mar 17 15:56 memory.stat
-r--r--r-- 1 root root 0 Mar 17 15:56 memory.swap.current
-r--r--r-- 1 root root 0 Mar 17 15:56 memory.swap.events
-rw-r--r-- 1 root root 0 Mar 17 15:56 memory.swap.high
-rw-r--r-- 1 root root 0 Mar 17 15:56 memory.swap.max
-r--r--r-- 1 root root 0 Mar 17 15:56 pids.current
-r--r--r-- 1 root root 0 Mar 17 15:56 pids.events
-rw-r--r-- 1 root root 0 Mar 17 15:56 pids.max

```

通过 cgroup 丰富的控制器，我们可以实现如下功能：

- 资源限制，比如限制内存的使用、文件系统缓存的大小等。
- 优先级控制，通过对 cpu、io 等资源的分配，可以控制不同进程的优先级。
- 审计，可以统计进程的资源使用情况，比如 cpu 使用时间、内存使用情况等。
- 进程管理，比如可以通过 freeze 接口文件来控制组内进程的挂起与恢复。


### 控制组（control group）

控制组（control group）就是针对一组资源做限制的组合了。通常一个控制组内可以根据需求设置不同的控制器，然后将进程或者线程加入到控制组中，从而实现特定进程的资源进行限制。

### 层级结构

控制组可以组织成一个树状的层级结构，从而实现更精细的资源限制。

cgroup v2 对层级结构进行了精简，最开始通常只有根控制组，位于 ``/sys/fs/cgroup`` 目录下，我们可以通过创建新目录的方式创建新的控制组，比如我们上面的例子创建 ``/sys/fs/cgroup/mygroup`` 目录，就是创建了一个新的控制组。

子系统控制组可以从父控制组继承资源限制并可以继续细化，但只能做进一步的资源限制，而不能放宽限制。控制组通过两个文件来控制自身以及子控制组所能设置的资源限制：

- ``cgroup.controllers``：控制组可以使用的控制器。
- ``cgroup.subtree_control``：子控制组可以继承的控制器。

可以通过 +，- 符号来表示在控制组中启用或禁用某个控制器，比如下面的例子，在 ``cg1`` 控制组中禁用 ``memory`` 控制器，启用 ``cpu`` 控制器。

```sh
echo '+cpu -memory' > /sys/fs/cgroup/cg1/cgroup.subtree_control
```

下图是官网提供的图例，通过上述两个文件，对不同的服务进行精细的资源限制。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/cgroup-v2-02.png)
图片来自：[cgroup2](https://facebookmicrosites.github.io/cgroup2/docs/overview.html)


### 任务（task）

任务（task）就是进程或者线程，可以加入到控制组中。在 cgroup v2 中，任务加入到控制组的方式有两种：

1. 通过 ``cgroup.procs`` 文件将进程 ID 写入到控制组中，从而将进程加入到控制组中。
2. 通过 ``cgroup.threads`` 文件将线程 ID 写入到控制组中，从而将线程加入到控制组中。

下面是使用 ``cgroup.procs`` 将进程加入到控制组中的例子：
```sh
# 将进程 ID 写入到控制组中
echo 118058 > /sys/fs/cgroup/mygroup/cgroup.procs
```

一个进程只能处于一个控制组中。


### 文件系统

cgroup 是

