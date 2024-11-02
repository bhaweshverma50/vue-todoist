import { defineStore } from 'pinia'
import type { ToDos } from '@/types'
import { TodoService } from '@/services/api'

interface TodoState {
  todos: ToDos[]
  loading: boolean
  error: string | null
}

export const useTodoStore = defineStore('todo', {
  state: (): TodoState => ({
    todos: [],
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

    async deleteTodo(id: number) {
      const { error } = await TodoService.deleteTodo(id)

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
  },

  getters: {
    getTodos: state => state.todos,
    getTodoById: state => (id: number) =>
      state.todos.find(todo => todo.id === id.toString()),
    isLoading: state => state.loading,
    getError: state => state.error,
  },
})
