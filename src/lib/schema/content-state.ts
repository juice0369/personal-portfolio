import { z } from 'zod'
import { CONTENT_STATE_VERSION } from '../constants'
import { profileSchema } from './profile'
import { skillCategorySchema, skillSchema } from './skill'
import { siteSettingsSchema } from './settings'
import { timelineItemSchema } from './timeline'
import { projectSchema } from './project'
import { postSchema } from './post'
import { timestamp } from './primitives'

/** 找出数组中重复出现的元素下标（首次出现与后续重复项都会被标记） */
export function findDuplicateIndexes(values: string[]): number[] {
  const firstSeenAt = new Map<string, number>()
  const duplicated = new Set<number>()
  values.forEach((value, index) => {
    const first = firstSeenAt.get(value)
    if (first === undefined) {
      firstSeenAt.set(value, index)
      return
    }
    duplicated.add(first)
    duplicated.add(index)
  })
  return [...duplicated].sort((a, b) => a - b)
}

export const contentStateSchema = z
  .object({
    version: z.literal(CONTENT_STATE_VERSION),
    updatedAt: timestamp,
    profile: profileSchema,
    skillCategories: z.array(skillCategorySchema),
    skills: z.array(skillSchema),
    timeline: z.array(timelineItemSchema),
    projects: z.array(projectSchema),
    posts: z.array(postSchema),
    settings: siteSettingsSchema,
  })
  .superRefine((state, ctx) => {
    // 局部函数：捕获 ctx，避免把 Zod 的上下文类型外泄到模块作用域
    // path 指到"第几项的第几个字段"，便于导入校验时给出可读位置
    const reportDuplicates = (
      values: string[],
      basePath: (string | number)[],
      field: string,
      message: string,
    ) => {
      findDuplicateIndexes(values).forEach((index) => {
        ctx.addIssue({ code: 'custom', path: [...basePath, index, field], message })
      })
    }

    // 跨集合引用：技能的 categoryId 必须存在
    const categoryIds = new Set(state.skillCategories.map((category) => category.id))
    state.skills.forEach((skill, index) => {
      if (!categoryIds.has(skill.categoryId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['skills', index, 'categoryId'],
          message: '该技能引用的技能分类不存在',
        })
      }
    })

    // 唯一性：id 与 slug 在各自集合内不可重复
    reportDuplicates(
      state.skillCategories.map((item) => item.id),
      ['skillCategories'],
      'id',
      '技能分类 id 不能重复',
    )
    reportDuplicates(
      state.skillCategories.map((item) => item.name),
      ['skillCategories'],
      'name',
      '技能分类名称不能重复',
    )
    reportDuplicates(
      state.skills.map((item) => item.id),
      ['skills'],
      'id',
      '技能 id 不能重复',
    )
    reportDuplicates(
      state.skills.map((item) => item.name),
      ['skills'],
      'name',
      '技能名称不能重复',
    )
    reportDuplicates(
      state.timeline.map((item) => item.id),
      ['timeline'],
      'id',
      '经历 id 不能重复',
    )
    reportDuplicates(
      state.projects.map((item) => item.id),
      ['projects'],
      'id',
      '项目 id 不能重复',
    )
    reportDuplicates(
      state.projects.map((item) => item.slug),
      ['projects'],
      'slug',
      '项目标识不能重复',
    )
    reportDuplicates(
      state.posts.map((item) => item.id),
      ['posts'],
      'id',
      '文章 id 不能重复',
    )
    reportDuplicates(
      state.posts.map((item) => item.slug),
      ['posts'],
      'slug',
      '文章标识不能重复',
    )
  })

export type ContentState = z.infer<typeof contentStateSchema>
