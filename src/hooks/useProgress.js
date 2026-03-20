import { useContext } from 'react'
import { ProgressContext } from '../context/ProgressContext.jsx'

export function useProgress() {
  return useContext(ProgressContext)
}
