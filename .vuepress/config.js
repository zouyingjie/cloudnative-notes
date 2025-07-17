import { defineUserConfig, defaultTheme } from 'vuepress';
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";
import { commentPlugin } from "vuepress-plugin-comment2";
import { readingTimePlugin } from "vuepress-plugin-reading-time2";
import { containerPlugin } from '@vuepress/plugin-container'

export default defineUserConfig({

  lang: 'zh-CN',
  title: '云原生架构笔记',
  description: '构建大规模高可用的分布式系统',
  base: "/",


  plugins: [
    mdEnhancePlugin({
      // 启用脚注
      footnote: true,
      katex: true,
      sub: true,
    }),
    containerPlugin({
      type: 'center'
    }),
    containerPlugin({
      type: 'right'
    }),
    commentPlugin({
     
    }),
    readingTimePlugin({
      // your options
    }),
  ],
  theme: defaultTheme({

    logo: '/images/microservices-logo.svg',

    lastUpdated: '最后更新',
    smoothScroll: true,

    editLinks: true,
    editLinkText: '在GitHub中编辑',

    
    repo: 'https://github.com/zouyingjie/cloudnative-notes',
    repoLabel: 'GitHub',
    navbar: [{
      text: '首页',
      link: '/'
    },
    {
      text: '作者',
      link: '/about.md'
    },
    {
      text: '讨论',
      link: 'https://github.com/zouyingjie/cloudnative-notes/discussions'
    },
    {
      text: 'GitHub仓库',
      link: 'https://github.com/zouyingjie/cloudnative-notes'
    }
    ],
    sidebar: [
      {
        text: '通用设计',
        link: '/common-design/',
        collapsable: false,
        children: [
          {
            text: 'API 设计',
            collapsable: false,
            path: '/common-design/api-design/',
            children: [
              '/common-design/api-design/rest',
              '/common-design/api-design/webapi',
              '/common-design/api-design/swagger',
            ]
          },
          {
            text: '数据建模',
            collapsable: false,
            link: '/common-design/data-design/',
            children: [
              '/common-design/data-design/mysql',
              '/common-design/data-design/elasticsearch',
              '/common-design/data-design/redis',
            ]
          },
          {
            text: '软件测试',
            collapsable: false,
            path: '/common-design/software-testing/',
            children: [
              '/common-design/software-testing/unit-test',
              '/common-design/software-testing/contract',
              '/common-design/software-testing/load',
              '/common-design/software-testing/spring-boot-unit-testing',
              '/common-design/software-testing/testcontainer',
            ]
          },
          {
            text: '认证&授权',
            collapsable: false,
            path: '/common-design/security/',
            children: [
              '/common-design/security/roadmap',
              '/common-design/security/auth',
              '/common-design/security/permission',
              '/common-design/security/tls-cert',
              '/common-design/security/spring-security',
            ]
          }
        ]
      },
      {
        text: '分布式系统-理论篇',
        link: '/distributed-system-theory/',
        collapsable: false,
        children: [
          '/distributed-system-theory/01.overview.md',
          '/distributed-system-theory/02.sharding-and-replication.md',
          '/distributed-system-theory/03.consistency-and-consensus.md',
          '/distributed-system-theory/04.transaction.md',
          '/distributed-system-theory/05.clock.md'
        ]
      },
      {
        text: '分布式系统-工程篇',
        link: '/distributed-system-engineering/',
        collapsable: false,
        children: [
          '/distributed-system-engineering/01.distributed-lock.md',
          '/distributed-system-engineering/02.unique-id.md',
          '/distributed-system-engineering/03.cron.md',
          '/distributed-system-engineering/04.session.md',
          '/distributed-system-engineering/05.tracing.md'

        ]
      },
      {
        text: '云原生架构',
        collapsable: false,
        children: [

          {
            text: '容器基础技术',
            link: '/cloudnative/container/',
            collapsable: false,
            children: [
              '/cloudnative/container/01.docker基础-namespace.md',
              '/cloudnative/container/02.docker基础-cgroups.md',
              '/cloudnative/container/03.docker基础-aufs.md',
              '/cloudnative/container/04.docker基础-devicemapper.md',
              '/cloudnative/container/05.500line.md',
              '/cloudnative/container/06.docker.md',

            ]
          },
          {
            text: '深入理解Kubernetes',
            link: '/kubernetes/',
            collapsable: false,
            children: [
              '/cloudnative/kubernetes/01.kubernetes_roadmap.md',
              '/cloudnative/kubernetes/02.kubernetes_pod.md',
              '/cloudnative/kubernetes/03.controller.md',
              '/cloudnative/kubernetes/04.config.md',
              '/cloudnative/kubernetes/05.network.md',
              '/cloudnative/kubernetes/06.storage.md',
              '/cloudnative/kubernetes/07.scheduler.md',
              '/cloudnative/kubernetes/08.security.md',
              '/cloudnative/kubernetes/09.application.md',
              '/cloudnative/kubernetes/10.monitoring.md'
            ]
          },
          {
            text: '架构的演进',
            link: '/cloudnative/arch/',
            collapsable: false,
            children: [
              '/cloudnative/arch/01.arch-history.md',
            ]
          },
          {
            text: '服务 & 流量治理',
            link: '/service-governance/',
            collapsable: false,
            children: [
              '/service/01.service-discovery.md',
              '/service/02.service-config.md',
              '/service/03.service-resilience-01.md',
              '/service/04.service-resilience-02.md',
              '/service/05.traffic-schedule.md',
            ]
          },

          {
            text: '弹力设计',
            link: '/service-governance/',
            collapsable: false,
            children: [
              '/cloudnative/04.service-discovery.md',
              '/cloudnative/05.service-config.md',
              '/cloudnative/07.service-resilience-01.md',
              '/cloudnative/07.service-resilience-02.md',
              '/cloudnative/08.traffic-schedule.md',
            ]
          },

          {
            text: '可观测性',
            link: '/observability/',
            collapsable: false,
            children: [
              '/observability/01.overview.md',
              '/observability/02.metrics.md',
              '/observability/03.logging.md',
              '/observability/04.trace.md',
            ]
          },
          {
            text: 'DevOps',
            link: '/devops/',
            collapsable: false,
            children: [
              '/devops/01.overview.md',
              '/devops/02.cicd.md',
              '/devops/03.gitflow.md',
              '/devops/04.jenkins.md',
              '/devops/05.argocd.md',
              '/devops/06.nexus.md',
            ]
          },
        ]
      },

      {
        text: '结语：何以为架构师',
        link: '/end/code-of-architect.md'
      }
    ],
  })
});