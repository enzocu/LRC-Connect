"use client"

import { useAlert } from "@/contexts/AlertContext"
import { FiX, FiCheck, FiAlertTriangle, FiAlertCircle, FiInfo } from "react-icons/fi"

const AlertDisplay = () => {
  const { alerts, hideAlert } = useAlert()

  if (alerts.length === 0) return null

  const getAlertStyles = (type) => {
    switch (type) {
      case "success":
        return {
          container: "bg-green-50 border-green-200 text-green-800",
          icon: <FiCheck className="w-5 h-5 text-green-600" />,
        }
      case "warning":
        return {
          container: "bg-yellow-50 border-yellow-200 text-yellow-800",
          icon: <FiAlertTriangle className="w-5 h-5 text-yellow-600" />,
        }
      case "danger":
        return {
          container: "bg-red-50 border-red-200 text-red-800",
          icon: <FiAlertCircle className="w-5 h-5 text-red-600" />,
        }
      case "info":
        return {
          container: "bg-blue-50 border-blue-200 text-blue-800",
          icon: <FiInfo className="w-5 h-5 text-blue-600" />,
        }
      default:
        return {
          container: "bg-gray-50 border-gray-200 text-gray-800",
          icon: <FiInfo className="w-5 h-5 text-gray-600" />,
        }
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type)

        return (
          <div
            key={alert.id}
            className={`
              flex items-center justify-between p-4 rounded-lg border shadow-lg
              min-w-80 max-w-md animate-in slide-in-from-right-2 duration-300
              ${styles.container}
            `}
          >
            <div className="flex items-center space-x-3">
              {styles.icon}
              <p className="text-sm font-medium">{alert.message}</p>
            </div>

            <button
              onClick={() => hideAlert(alert.id)}
              className="ml-4 p-1 rounded hover:bg-black/10 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default AlertDisplay
