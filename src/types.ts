export interface ToDos {
  id?: string
  task: string
  status: 'pending' | 'in-progress' | 'completed'
  created_at: Date
  updated_at: Date
}

export interface ErrorProps {
  message?: string
  type?: 'error' | 'warning' | 'success' | 'info'
  autoClose?: boolean
  duration?: number
}
