import { createContext, useContext } from 'react'

export const BlockColorCtx = createContext('slate')
export const useBlockColor = () => useContext(BlockColorCtx)
