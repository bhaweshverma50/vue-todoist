import { defineStore } from 'pinia'
import type { ToDos } from '@/types'
import { TodoService, TrashService } from '@/services/api'

interface TodoState {
  todos: ToDos[]
  trash: ToDos[]
  loading: boolean
  error: string | null
}

export const useTodoStore = defineStore('todo', {
  state: (): TodoState => ({
    todos: [],
    trash: [],
    loading: false,
    error: null,
  }),

  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    async fetchTodos() {
      this.setLoading(true)
      this.setError(null)

      const { data, error } = await TodoService.getAllTodos()

      if (error) {
        this.setError(error)
      } else if (data) {
        this.todos = data
      }

      this.setLoading(false)
    },

    async addTodo(task: string) {
      this.setLoading(true)
      this.setError(null)

      const { data, error } = await TodoService.createTodo(task)

      if (error) {
        this.setError(error)
      } else if (data) {
        this.todos.push(data)
      }

      this.setLoading(false)
      return !error
    },

    async deleteTodo(id: string) {
      const { error } = await TodoService.deleteTodo(id.toString())

      if (error) {
        this.setError(error)
      } else {
        this.todos = this.todos.filter(todo => todo.id !== id.toString())
      }

      return !error
    },

    async updateTodo(todo: ToDos) {
      const { data, error } = await TodoService.updateTodo(todo)

      if (error) {
        this.setError(error)
      } else if (data) {
        const index = this.todos.findIndex(t => t.id === todo.id)
        if (index !== -1) {
          this.todos[index] = data
        }
      }

      return !error
    },
    filterTodos(searchText: string) {
      if (!searchText) {
        return this.todos
      }
      return this.todos.filter(todo =>
        todo.task.toLowerCase().includes(searchText.toLowerCase()),
      )
    },

    async fetchTrash() {
      this.setLoading(true)
      this.setError(null)

      const { data, error } = await TrashService.getAllTrash()

      if (error) {
        this.setError(error)
      } else if (data) {
        this.trash = data
      }

      this.setLoading(false)
    },

    async deleteTrash(id: string) {
      const { error } = await TrashService.deleteTrash(id.toString())

      if (error) {
        this.setError(error)
      } else {
        this.trash = this.trash.filter(todo => todo.id !== id.toString())
      }

      return !error
    },

    async restoreTrash(id: string) {
      const { data, error } = await TrashService.restoreTrash(id.toString())

      if (error) {
        this.setError(error)
      } else if (data) {
        const index = this.trash.findIndex(t => t.id === id.toString())
        if (index !== -1) {
          this.trash[index] = data
        }
      }

      return !error
    },

    async emptyTrash() {
      const { error } = await TrashService.emptyTrash()

      if (error) {
        this.setError(error)
      } else {
        this.trash = []
      }
    },
  },

  getters: {
    getTodos: state => state.todos,
    getTodoById: state => (id: number) =>
      state.todos.find(todo => todo.id === id.toString()),
    getTrash: state => state.trash,
    isLoading: state => state.loading,
    getError: state => state.error,
  },
})
