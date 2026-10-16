import { nowTimestamp } from '../lib/date'
import type {
  ContentState,
  Post,
  Profile,
  Project,
  SiteSettings,
  Skill,
  SkillCategory,
  TimelineItem,
} from '../lib/schema'

/**
 * 内容状态的纯函数 reducer。
 * 所有变更都返回新对象（不可变），便于测试与 React 的引用比较。
 */

export type ContentAction =
  | { type: 'replaceAll'; state: ContentState }
  | { type: 'patchProfile'; patch: Partial<Profile> }
  | { type: 'patchSettings'; patch: Partial<SiteSettings> }
  | { type: 'addSkillCategory'; category: SkillCategory }
  | { type: 'updateSkillCategory'; id: string; patch: Partial<SkillCategory> }
  | { type: 'removeSkillCategory'; id: string }
  | { type: 'addSkill'; skill: Skill }
  | { type: 'updateSkill'; id: string; patch: Partial<Skill> }
  | { type: 'removeSkill'; id: string }
  | { type: 'addTimelineItem'; item: TimelineItem }
  | { type: 'updateTimelineItem'; id: string; patch: Partial<TimelineItem> }
  | { type: 'removeTimelineItem'; id: string }
  | { type: 'addProject'; project: Project }
  | { type: 'updateProject'; id: string; patch: Partial<Project> }
  | { type: 'removeProject'; id: string }
  | { type: 'addPost'; post: Post }
  | { type: 'updatePost'; id: string; patch: Partial<Post> }
  | { type: 'removePost'; id: string }

/** 把 order 重排为连续的 0..n-1，避免出现重复值或空洞（AGENTS.md 常见坑） */
function normalizeOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item, index) => (item.order === index ? item : { ...item, order: index }))
}

function touch(state: ContentState): ContentState {
  return { ...state, updatedAt: nowTimestamp() }
}

function replaceById<T extends { id: string }>(items: T[], id: string, patch: Partial<T>): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

export function contentReducer(state: ContentState, action: ContentAction): ContentState {
  switch (action.type) {
    case 'replaceAll': {
      // 整体替换（导入）：显式重建对象，不展开已有状态，避免原型污染
      const incoming = action.state
      return {
        version: incoming.version,
        updatedAt: nowTimestamp(),
        profile: incoming.profile,
        skillCategories: incoming.skillCategories,
        skills: incoming.skills,
        timeline: incoming.timeline,
        projects: incoming.projects,
        posts: incoming.posts,
        settings: incoming.settings,
      }
    }

    case 'patchProfile':
      return touch({ ...state, profile: { ...state.profile, ...action.patch } })

    case 'patchSettings':
      return touch({ ...state, settings: { ...state.settings, ...action.patch } })

    case 'addSkillCategory':
      return touch({
        ...state,
        skillCategories: normalizeOrder([...state.skillCategories, action.category]),
      })

    case 'updateSkillCategory':
      return touch({
        ...state,
        skillCategories: normalizeOrder(
          replaceById(state.skillCategories, action.id, action.patch),
        ),
      })

    case 'removeSkillCategory':
      return touch({
        ...state,
        // 同时移除该分类下的技能，避免出现引用不存在的分类
        skillCategories: normalizeOrder(
          state.skillCategories.filter((item) => item.id !== action.id),
        ),
        skills: normalizeOrder(state.skills.filter((item) => item.categoryId !== action.id)),
      })

    case 'addSkill':
      return touch({ ...state, skills: normalizeOrder([...state.skills, action.skill]) })

    case 'updateSkill':
      return touch({
        ...state,
        skills: normalizeOrder(replaceById(state.skills, action.id, action.patch)),
      })

    case 'removeSkill':
      return touch({
        ...state,
        skills: normalizeOrder(state.skills.filter((item) => item.id !== action.id)),
      })

    case 'addTimelineItem':
      return touch({ ...state, timeline: normalizeOrder([...state.timeline, action.item]) })

    case 'updateTimelineItem':
      return touch({
        ...state,
        timeline: normalizeOrder(replaceById(state.timeline, action.id, action.patch)),
      })

    case 'removeTimelineItem':
      return touch({
        ...state,
        timeline: normalizeOrder(state.timeline.filter((item) => item.id !== action.id)),
      })

    case 'addProject':
      return touch({ ...state, projects: normalizeOrder([...state.projects, action.project]) })

    case 'updateProject':
      return touch({
        ...state,
        projects: normalizeOrder(
          replaceById(state.projects, action.id, { ...action.patch, updatedAt: nowTimestamp() }),
        ),
      })

    case 'removeProject':
      return touch({
        ...state,
        projects: normalizeOrder(state.projects.filter((item) => item.id !== action.id)),
      })

    case 'addPost':
      return touch({ ...state, posts: [...state.posts, action.post] })

    case 'updatePost':
      return touch({
        ...state,
        posts: replaceById(state.posts, action.id, { ...action.patch, updatedAt: nowTimestamp() }),
      })

    case 'removePost':
      return touch({ ...state, posts: state.posts.filter((item) => item.id !== action.id) })

    default: {
      // 穷尽检查：新增 action 类型时这里会编译报错
      const exhaustive: never = action
      return exhaustive
    }
  }
}
