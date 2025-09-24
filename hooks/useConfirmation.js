"use client"

import { useState, useCallback } from "react"

export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: "",
    subtitle: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    resolve: null,
  })

  const showConfirmation = useCallback(
    ({
      title = "Confirm Action",
      subtitle = "Are you sure you want to proceed?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      variant = "default",
    } = {}) => {
      return new Promise((resolve) => {
        setConfirmationState({
          isOpen: true,
          title,
          subtitle,
          confirmText,
          cancelText,
          variant,
          resolve,
        })
      })
    },
    [],
  )

  const handleConfirmation = useCallback(
    (result) => {
      if (confirmationState.resolve) {
        confirmationState.resolve(result)
      }
      setConfirmationState((prev) => ({
        ...prev,
        isOpen: false,
        resolve: null,
      }))
    },
    [confirmationState.resolve],
  )

  const closeConfirmation = useCallback(() => {
    setConfirmationState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }, [])

  return {
    confirmationState,
    showConfirmation,
    handleConfirmation,
    closeConfirmation,
  }
}
