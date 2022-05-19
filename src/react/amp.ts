import React from 'react'
// @ts-ignore
import AmpStateContext from 'virtual:reacticajs:context:AmpState'

export function isInAmpMode({
  ampFirst = false,
  hybrid = false,
  hasQuery = false,
} = {}): boolean {
  return ampFirst || (hybrid && hasQuery)
}

export function useAmp(): boolean {
  // Don't assign the context value to a variable to save bytes
  return isInAmpMode(React.useContext(AmpStateContext))
}