import { skillCategorySchema, skillSchema, type Skill, type SkillCategory } from '../lib/schema'

/** 技能分类与技能条目（内容来源：`周毅个人简历（大连海事大学27届）.pdf` 的科研技能与主修课程） */
export const skillCategories: SkillCategory[] = [
  { id: 'cat-programming', name: '编程与算法', order: 0 },
  { id: 'cat-research', name: '科研与建模', order: 1 },
  { id: 'cat-tooling', name: '工具与工程', order: 2 },
].map((item) => skillCategorySchema.parse(item))

export const skills: Skill[] = [
  {
    id: 'skill-python',
    categoryId: 'cat-programming',
    name: 'Python',
    level: 5,
    description: '科研主力语言：数据预处理、模型训练与结果可视化',
    order: 0,
  },
  {
    id: 'skill-cpp',
    categoryId: 'cat-programming',
    name: 'C++',
    level: 4,
    description: '面向对象程序设计课程基础扎实，能读懂框架底层实现',
    order: 1,
  },
  {
    id: 'skill-c',
    categoryId: 'cat-programming',
    name: 'C 语言',
    level: 4,
    description: 'C 语言程序设计课程基础扎实，指针与内存管理熟练',
    order: 2,
  },
  {
    id: 'skill-algorithm',
    categoryId: 'cat-programming',
    name: '数据结构与算法',
    level: 4,
    description: '掌握常用数据结构与算法设计思路',
    order: 3,
  },
  {
    id: 'skill-pytorch',
    categoryId: 'cat-research',
    name: 'PyTorch',
    level: 4,
    description: '目标检测模型的训练、复现与消融实验',
    order: 0,
  },
  {
    id: 'skill-detection',
    categoryId: 'cat-research',
    name: '目标检测',
    level: 4,
    description: '熟悉 YOLO 与 DETR 系列结构，做过水下图像与船舶异常行为检测',
    order: 1,
  },
  {
    id: 'skill-compression',
    categoryId: 'cat-research',
    name: '模型压缩与知识蒸馏',
    level: 3,
    description: '掌握知识蒸馏等技术原理',
    order: 2,
  },
  {
    id: 'skill-modeling',
    categoryId: 'cat-research',
    name: '数学建模与数据分析',
    level: 4,
    description: 'Spearman 相关分析、PCA 降维与熵权法-TOPSIS 综合评价',
    order: 3,
  },
  {
    id: 'skill-matlab',
    categoryId: 'cat-tooling',
    name: 'MATLAB',
    level: 3,
    description: '计算方法及 MATLAB 应用：数值计算与结果验证',
    order: 0,
  },
  {
    id: 'skill-embedded',
    categoryId: 'cat-tooling',
    name: 'STM32 嵌入式开发',
    level: 3,
    description: '多传感器融合与运动控制，完成起重机自动起降控制系统',
    order: 1,
  },
  {
    id: 'skill-paper',
    categoryId: 'cat-tooling',
    name: '实验与论文写作',
    level: 3,
    description: '以第一作者身份在 JCR Q2 期刊发表论文，能独立完成实验设计与写作',
    order: 2,
  },
].map((item) => skillSchema.parse(item))
