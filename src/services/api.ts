import axios from 'axios'
import type { ToDos } from '../types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const todoApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const TodoService = {
  async getAllTodos() {
    try {
      const response = await todoApi.get('/todos')
      return { data: response.data, error: null }
    } catch (error) {
      console.error(error)
      return { data: null, error: 'Failed to fetch todos' }
    }
  },

  async createTodo(task: string) {
    try {
      const payload: ToDos = {
        task,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      }
      const response = await todoApi.post('/todos', payload)
      return { data: response.data, error: null }
    } catch (error) {
      console.error(error)
      return { data: null, error: 'Failed to create todo' }
    }
  },

  async deleteTodo(id: number) {
    try {
      await todoApi.delete(`/todos/${id}`)
      return { error: null }
    } catch (error) {
      console.error(error)
      return { error: 'Failed to delete todo' }
    }
  },

  async updateTodo(todo: ToDos) {
    try {
      const response = await todoApi.put(`/todos/${todo.id}`, todo)
      return { data: response.data, error: null }
    } catch (error) {
      console.error(error)
      return { error: 'Failed to update todo' }
    }
  },
}
