import { projectSchema, type Project } from '../lib/schema'

/**
 * 项目经历（内容来源：`周毅个人简历（大连海事大学27届）.pdf`）。
 * 只保留两个项目；简历对每个项目只标注一个月份，起止时间按该月份填写，
 * 仍在推进的项目 `endDate` 为 `null`，前台显示为“至今”。
 * 职责（`role`）留空，前台不渲染该条目。
 */
export const projects: Project[] = [
  {
    id: 'project-vessel-monitoring',
    slug: 'vessel-safety-monitoring',
    title: '禹迹守望：船舶运营安全智能监控体系',
    summary:
      '构建“人-船-环境”一体化监控框架，通过报警、影像留存与远程介入的应急响应链，对驾驶台、机舱等关键区域的异常行为做实时预警与闭环管理。',
    role: '',
    category: '科研项目',
    startDate: '2025-11',
    endDate: null,
    techStack: ['YOLOv8', 'PyTorch', '注意力机制', '锚框优化'],
    highlights: [
      '基于 YOLOv8 引入级联大卷积核的 CSP 结构，增强复杂航行环境下的鲁棒性',
      '引入 eSE 注意力机制与基于交并比（IoU）的锚框生成算法，提高检测精度',
      '在自建火灾数据集上调整锚框尺度，完成底层算法构建与稳定性测试',
    ],
    content: `## 项目背景

传统监管依赖人工巡检，效率低、事故报告滞后，夜间事故频发。项目把“人-船-环境”纳入同一套监控框架。

## 技术方案

- 以 **YOLOv8** 为基座，引入级联大卷积核的 CSP 结构与 **eSE 注意力机制**；
- 改进去交并比（IoU）的锚框生成算法，在自建火灾数据集上调整锚框大小，增强模型对尺度变化的鲁棒性。

## 进展

底层算法已完成构建与稳定性测试，验证了系统在复杂场景下精准识别异常行为的可行性。`,
    repoUrl: null,
    demoUrl: null,
    featured: true,
    order: 0,
    updatedAt: '2026-10-16T00:00:00.000Z',
  },
  {
    id: 'project-autonomous-crane',
    slug: 'autonomous-crane-system',
    title: '自主起降智能起重机系统',
    summary:
      '实现从货架识别到放置的自动化作业：自主识别随机排布的货箱编号与目标配送位，在无人工干预的前提下完成货物提取、转运与精准交付。',
    role: '',
    category: '科创项目',
    startDate: '2025-08',
    endDate: '2025-08',
    techStack: ['STM32', '嵌入式开发', '多传感器融合', '视觉识别'],
    highlights: [
      '基于 STM32 搭建嵌入式软件架构，规划任务调度与外设驱动',
      '实现红外测距与视觉识别融合的定位算法，提高目标定位精度',
      '设计补偿控制算法，使抓取模块起降平稳无抖动，可自主完成识别、抓取与放置',
    ],
    content: `## 项目目标

把“货架识别 → 抓取 → 转运 → 放置”整条流程做成无需人工干预的自动化作业。

## 技术方案

- 基于 **STM32** 搭建嵌入式软件架构，规划任务调度与外设驱动；
- 实现多传感器融合算法（红外测距 + 视觉识别），提高目标定位精度；
- 设计补偿控制算法，让抓取模块的起降过程平稳无抖动。

## 成果

可自主完成识别、抓取、移动与放置指定物品。`,
    repoUrl: null,
    demoUrl: null,
    featured: false,
    order: 1,
    updatedAt: '2026-10-16T00:00:00.000Z',
  },
].map((item) => projectSchema.parse(item))
